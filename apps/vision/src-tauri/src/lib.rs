mod provider_preflight;

use provider_preflight::build_optional_args;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{env, path::PathBuf, process::Command, time::Duration};

const SECRET_SERVICE: &str = "com.abrxs.vision.providers";

#[derive(Debug, Deserialize, Serialize)]
struct AssistantMessage {
    role: String,
    content: String,
}

fn find_binary(name: &str) -> Option<PathBuf> {
    if let Some(paths) = env::var_os("PATH") {
        for dir in env::split_paths(&paths) {
            let candidate = dir.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
    }
    let mut candidates = vec![
        PathBuf::from(format!("/opt/homebrew/bin/{name}")),
        PathBuf::from(format!("/usr/local/bin/{name}")),
    ];
    if let Some(home) = env::var_os("HOME") {
        let home = PathBuf::from(home);
        candidates.push(home.join(format!(".local/bin/{name}")));
        candidates.push(home.join(format!(".npm-global/bin/{name}")));
        candidates.push(home.join(format!("bin/{name}")));
    }
    candidates.into_iter().find(|path| path.is_file())
}

fn find_higgsfield() -> Option<PathBuf> {
    find_binary("higgsfield")
}

fn allowed_secret_provider(provider: &str) -> bool {
    matches!(provider, "nvidia" | "gemini-api" | "higgsfield")
}

fn secret_get(provider: &str) -> Result<String, String> {
    if !allowed_secret_provider(provider) {
        return Err("Unsupported secret provider.".into());
    }
    let output = Command::new("security")
        .args(["find-generic-password", "-a", provider, "-s", SECRET_SERVICE, "-w"])
        .output()
        .map_err(|error| format!("Could not access macOS Keychain: {error}"))?;
    if !output.status.success() {
        return Err("Credential is not configured in macOS Keychain.".into());
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if value.is_empty() {
        return Err("Stored credential is empty.".into());
    }
    Ok(value)
}

fn secret_set(provider: &str, secret: &str) -> Result<(), String> {
    if !allowed_secret_provider(provider) {
        return Err("Unsupported secret provider.".into());
    }
    if secret.trim().len() < 8 {
        return Err("Credential is unexpectedly short.".into());
    }
    let output = Command::new("security")
        .args(["add-generic-password", "-U", "-a", provider, "-s", SECRET_SERVICE, "-w", secret.trim()])
        .output()
        .map_err(|error| format!("Could not write macOS Keychain: {error}"))?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_string());
    }
    Ok(())
}

fn secret_delete(provider: &str) -> Result<(), String> {
    if !allowed_secret_provider(provider) {
        return Err("Unsupported secret provider.".into());
    }
    let output = Command::new("security")
        .args(["delete-generic-password", "-a", provider, "-s", SECRET_SERVICE])
        .output()
        .map_err(|error| format!("Could not access macOS Keychain: {error}"))?;
    if output.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    if stderr.to_lowercase().contains("could not be found") {
        return Ok(());
    }
    Err(stderr.trim().to_string())
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
async fn vision_secret_status(provider: String) -> Value {
    json!({
        "desktop": true,
        "configured": secret_get(provider.trim()).is_ok(),
        "provider": provider,
    })
}

#[tauri::command]
async fn vision_secret_set(provider: String, secret: String) -> Result<Value, String> {
    secret_set(provider.trim(), &secret)?;
    Ok(json!({ "ok": true, "configured": true, "provider": provider }))
}

#[tauri::command]
async fn vision_secret_delete(provider: String) -> Result<Value, String> {
    secret_delete(provider.trim())?;
    Ok(json!({ "ok": true, "configured": false, "provider": provider }))
}

#[tauri::command]
async fn vision_gemini_status() -> Value {
    tauri::async_runtime::spawn_blocking(|| {
        let Some(binary) = find_binary("gemini") else {
            return json!({ "installed": false, "desktop": true, "error": "Gemini CLI was not found in PATH, Homebrew, ~/.local/bin or ~/.npm-global/bin." });
        };
        match Command::new(&binary).arg("--version").output() {
            Ok(output) if output.status.success() => json!({
                "installed": true,
                "desktop": true,
                "binary": binary.display().to_string(),
                "version": String::from_utf8_lossy(&output.stdout).trim(),
            }),
            Ok(output) => json!({
                "installed": true,
                "desktop": true,
                "binary": binary.display().to_string(),
                "error": String::from_utf8_lossy(&output.stderr).trim(),
            }),
            Err(error) => json!({ "installed": false, "desktop": true, "error": error.to_string() }),
        }
    }).await.unwrap_or_else(|error| json!({ "installed": false, "desktop": true, "error": error.to_string() }))
}

#[tauri::command]
async fn vision_gemini_chat(prompt: String, model: Option<String>) -> Result<Value, String> {
    if prompt.trim().is_empty() {
        return Err("Gemini prompt is empty.".into());
    }
    if prompt.len() > 80_000 {
        return Err("Gemini prompt is unexpectedly large.".into());
    }
    tauri::async_runtime::spawn_blocking(move || {
        let binary = find_binary("gemini").ok_or_else(|| "Gemini CLI was not found. Install/authenticate the official Gemini CLI first.".to_string())?;
        let mut command = Command::new(&binary);
        command.args(["-p", prompt.as_str(), "--output-format", "json", "--approval-mode", "plan"]);
        if let Some(model_id) = model.filter(|value| !value.trim().is_empty()) {
            command.args(["--model", model_id.trim()]);
        }
        let output = command.output().map_err(|error| format!("Could not start {}: {error}", binary.display()))?;
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        if !output.status.success() {
            return Err(if stderr.is_empty() { stdout } else { stderr });
        }
        let raw = serde_json::from_str::<Value>(&stdout).unwrap_or_else(|_| json!({ "response": stdout }));
        let response = raw.get("response").and_then(Value::as_str).unwrap_or("").to_string();
        Ok(json!({ "ok": true, "provider": "gemini-cli", "response": response, "raw": raw }))
    }).await.map_err(|error| error.to_string())?
}

#[tauri::command]
async fn vision_nvidia_chat(
    model: String,
    endpoint: String,
    system_prompt: String,
    messages: Vec<AssistantMessage>,
) -> Result<Value, String> {
    if model.trim().is_empty() {
        return Err("An NVIDIA model id is required.".into());
    }
    if !endpoint.starts_with("https://integrate.api.nvidia.com/") {
        return Err("For safety, the NVIDIA credential can only be sent to https://integrate.api.nvidia.com/.".into());
    }
    if messages.is_empty() {
        return Err("Assistant conversation is empty.".into());
    }
    let key = secret_get("nvidia")?;
    let mut api_messages = vec![json!({ "role": "system", "content": system_prompt })];
    for message in messages.into_iter().take(16) {
        if !matches!(message.role.as_str(), "user" | "assistant") || message.content.trim().is_empty() {
            continue;
        }
        api_messages.push(json!({ "role": message.role, "content": message.content }));
    }
    let payload = json!({
        "model": model,
        "messages": api_messages,
        "temperature": 0.2,
        "max_tokens": 1800,
        "stream": false,
    });
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(90))
        .build()
        .map_err(|error| error.to_string())?;
    let response = client
        .post(endpoint)
        .bearer_auth(key)
        .header("accept", "application/json")
        .json(&payload)
        .send()
        .await
        .map_err(|error| format!("NVIDIA request failed: {error}"))?;
    let status = response.status();
    let body = response.text().await.map_err(|error| error.to_string())?;
    if !status.is_success() {
        return Err(format!("NVIDIA returned HTTP {}: {}", status.as_u16(), body));
    }
    let raw = serde_json::from_str::<Value>(&body).map_err(|error| format!("Invalid NVIDIA JSON response: {error}"))?;
    let content = raw.pointer("/choices/0/message/content").and_then(Value::as_str).unwrap_or("").to_string();
    if content.is_empty() {
        return Err("NVIDIA returned no assistant message content.".into());
    }
    Ok(json!({ "ok": true, "provider": "nvidia", "model": payload["model"], "content": content, "raw": raw }))
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
            vision_secret_status,
            vision_secret_set,
            vision_secret_delete,
            vision_gemini_status,
            vision_gemini_chat,
            vision_nvidia_chat,
            vision_higgsfield_status,
            vision_higgsfield_models,
            vision_higgsfield_model_get,
            vision_higgsfield_preflight,
            vision_higgsfield_generate,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Abrxs Vision Art Creator");
}
