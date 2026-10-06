mod provider_preflight;

use provider_preflight::build_optional_args;
use serde_json::{json, Value};
use std::{env, path::PathBuf, process::Command};

fn find_higgsfield() -> Option<PathBuf> {
    if let Some(paths) = env::var_os("PATH") {
        for dir in env::split_paths(&paths) {
            let candidate = dir.join("higgsfield");
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }

    let mut candidates = vec![
        PathBuf::from("/opt/homebrew/bin/higgsfield"),
        PathBuf::from("/usr/local/bin/higgsfield"),
    ];
    if let Some(home) = env::var_os("HOME") {
        let home = PathBuf::from(home);
        candidates.push(home.join(".local/bin/higgsfield"));
        candidates.push(home.join(".npm-global/bin/higgsfield"));
        candidates.push(home.join("bin/higgsfield"));
    }
    candidates.into_iter().find(|path| path.is_file())
}

fn run_higgsfield(args: &[String]) -> Result<Value, String> {
    let binary = find_higgsfield().ok_or_else(|| {
        "Higgsfield CLI was not found. Install the official CLI with `brew install higgsfield-ai/tap/higgsfield` or the official install script, then authenticate with `higgsfield auth login`.".to_string()
    })?;
    let output = Command::new(&binary)
        .args(args)
        .output()
        .map_err(|error| format!("Could not start {}: {error}", binary.display()))?;
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    if !output.status.success() {
        return Err(if stderr.is_empty() { stdout } else { stderr });
    }
    if stdout.is_empty() {
        return Ok(json!({ "ok": true, "status": output.status.code() }));
    }
    match serde_json::from_str::<Value>(&stdout) {
        Ok(value) => Ok(value),
        Err(_) => Ok(json!({ "ok": true, "raw": stdout, "status": output.status.code() })),
    }
}

fn live_model_schema(model_id: &str) -> Result<Value, String> {
    run_higgsfield(&[
        "model".into(),
        "get".into(),
        model_id.to_string(),
        "--json".into(),
    ])
}

#[tauri::command]
async fn vision_higgsfield_status() -> Value {
    tauri::async_runtime::spawn_blocking(|| {
        let Some(binary) = find_higgsfield() else {
            return json!({ "installed": false, "error": "Official Higgsfield CLI not found in PATH, Homebrew, ~/.local/bin or ~/.npm-global/bin." });
        };
        match Command::new(&binary).arg("version").output() {
            Ok(output) if output.status.success() => json!({
                "installed": true,
                "binary": binary.display().to_string(),
                "version": String::from_utf8_lossy(&output.stdout).trim(),
            }),
            Ok(output) => json!({
                "installed": true,
                "binary": binary.display().to_string(),
                "error": String::from_utf8_lossy(&output.stderr).trim(),
            }),
            Err(error) => json!({ "installed": false, "binary": binary.display().to_string(), "error": error.to_string() }),
        }
    }).await.unwrap_or_else(|error| json!({ "installed": false, "error": error.to_string() }))
}

#[tauri::command]
async fn vision_higgsfield_models() -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(|| run_higgsfield(&["model".into(), "list".into(), "--json".into()]))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn vision_higgsfield_model_get(model_id: String) -> Result<Value, String> {
    tauri::async_runtime::spawn_blocking(move || live_model_schema(&model_id))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn vision_higgsfield_preflight(
    model_id: String,
    aspect_ratio: Option<String>,
    duration: Option<u32>,
    start_image: Option<String>,
    resolution: Option<String>,
) -> Result<Value, String> {
    if model_id.trim().is_empty() {
        return Err("A live model id is required for preflight.".into());
    }

    tauri::async_runtime::spawn_blocking(move || {
        let schema = live_model_schema(&model_id)?;
        let (_, plan) = build_optional_args(&schema, aspect_ratio, duration, start_image, resolution)?;
        Ok(json!({
            "ok": true,
            "modelId": model_id,
            "plan": plan,
            "schema": schema,
        }))
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
async fn vision_higgsfield_generate(
    model_id: String,
    prompt: String,
    aspect_ratio: Option<String>,
    duration: Option<u32>,
    start_image: Option<String>,
    resolution: Option<String>,
    confirm_spend: bool,
) -> Result<Value, String> {
    if !confirm_spend {
        return Err("Provider generation may consume credits. Explicit spend confirmation is required.".into());
    }
    if model_id.trim().is_empty() || prompt.trim().is_empty() {
        return Err("A live model id and non-empty compiled prompt are required.".into());
    }
    if prompt.len() > 20_000 {
        return Err("Compiled prompt is unexpectedly large; review the prompt before provider submission.".into());
    }

    tauri::async_runtime::spawn_blocking(move || {
        let schema = live_model_schema(&model_id)?;
        let (optional_args, preflight) = build_optional_args(&schema, aspect_ratio, duration, start_image, resolution)?;
        let mut args = vec![
            "generate".into(),
            "create".into(),
            model_id.clone(),
            "--prompt".into(),
            prompt,
        ];
        args.extend(optional_args);
        args.push("--wait".into());
        args.push("--json".into());
        let provider_result = run_higgsfield(&args)?;
        Ok(json!({
            "ok": true,
            "provider": "higgsfield",
            "modelId": model_id,
            "preflight": preflight,
            "result": provider_result,
        }))
    })
    .await
    .map_err(|error| error.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            vision_higgsfield_status,
            vision_higgsfield_models,
            vision_higgsfield_model_get,
            vision_higgsfield_preflight,
            vision_higgsfield_generate,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Abrxs Vision Art Creator");
}
