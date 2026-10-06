use serde_json::{json, Value};
use std::{env, path::PathBuf};

fn normalized_token(value: &str) -> String {
    value
        .trim()
        .trim_start_matches('-')
        .replace('-', "_")
        .to_ascii_lowercase()
}

pub fn schema_mentions(value: &Value, parameter: &str) -> bool {
    let target = normalized_token(parameter);
    match value {
        Value::Object(map) => map.iter().any(|(key, child)| {
            normalized_token(key) == target || schema_mentions(child, parameter)
        }),
        Value::Array(items) => items.iter().any(|item| schema_mentions(item, parameter)),
        Value::String(text) => {
            let normalized = normalized_token(text);
            normalized == target
                || normalized.contains(&format!("--{target}"))
                || normalized.split(|character: char| !character.is_ascii_alphanumeric() && character != '_')
                    .any(|token| token == target)
        }
        _ => false,
    }
}

pub fn schema_is_introspectable(schema: &Value) -> bool {
    ["prompt", "duration", "aspect_ratio", "resolution", "image", "start_image"]
        .iter()
        .any(|parameter| schema_mentions(schema, parameter))
}

pub fn resolve_media_input(raw: &str) -> Result<String, String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return Err("Media input is empty.".into());
    }

    let path_like = trimmed.starts_with("~/")
        || trimmed.starts_with("./")
        || trimmed.starts_with("../")
        || trimmed.starts_with('/')
        || trimmed.contains("/Users/");

    if !path_like {
        // The official CLI also accepts upload/job/media ids. Leave opaque ids untouched.
        return Ok(trimmed.to_string());
    }

    let path = if let Some(rest) = trimmed.strip_prefix("~/") {
        let home = env::var_os("HOME").ok_or_else(|| "HOME is not available to expand the media path.".to_string())?;
        PathBuf::from(home).join(rest)
    } else {
        PathBuf::from(trimmed)
    };

    if !path.is_file() {
        return Err(format!("Local media file does not exist: {}", path.display()));
    }

    Ok(path.canonicalize().unwrap_or(path).display().to_string())
}

pub fn build_optional_args(
    schema: &Value,
    aspect_ratio: Option<String>,
    duration: Option<u32>,
    start_image: Option<String>,
    resolution: Option<String>,
) -> Result<(Vec<String>, Value), String> {
    let introspectable = schema_is_introspectable(schema);
    let mut args = Vec::<String>::new();
    let mut applied = Vec::<Value>::new();
    let mut omitted = Vec::<Value>::new();
    let mut warnings = Vec::<String>::new();

    if let Some(value) = aspect_ratio.filter(|value| !value.trim().is_empty()) {
        if !introspectable || schema_mentions(schema, "aspect_ratio") {
            args.push("--aspect_ratio".into());
            args.push(value.clone());
            applied.push(json!({ "parameter": "aspect_ratio", "value": value }));
        } else {
            omitted.push(json!({ "parameter": "aspect_ratio", "value": value, "reason": "not present in live model schema" }));
            warnings.push("The selected model does not advertise aspect_ratio; Vision will let the provider use its model default.".into());
        }
    }

    if let Some(value) = duration.filter(|value| *value >= 1 && *value <= 120) {
        if !introspectable || schema_mentions(schema, "duration") {
            args.push("--duration".into());
            args.push(value.to_string());
            applied.push(json!({ "parameter": "duration", "value": value }));
        } else {
            omitted.push(json!({ "parameter": "duration", "value": value, "reason": "not present in live model schema" }));
            warnings.push("The selected model does not advertise duration; Vision will not send an unsupported duration flag.".into());
        }
    }

    if let Some(value) = resolution.filter(|value| !value.trim().is_empty()) {
        if !introspectable || schema_mentions(schema, "resolution") {
            args.push("--resolution".into());
            args.push(value.clone());
            applied.push(json!({ "parameter": "resolution", "value": value }));
        } else {
            omitted.push(json!({ "parameter": "resolution", "value": value, "reason": "not present in live model schema" }));
            warnings.push("The selected model does not advertise resolution; Vision will not send an unsupported resolution flag.".into());
        }
    }

    if let Some(value) = start_image.filter(|value| !value.trim().is_empty()) {
        let resolved = resolve_media_input(&value)?;
        let flag = if !introspectable || schema_mentions(schema, "start_image") {
            "--start-image"
        } else if schema_mentions(schema, "image") {
            "--image"
        } else {
            return Err("The selected live model schema does not advertise start_image or image input, so Vision will not submit an I2V job blindly.".into());
        };
        args.push(flag.into());
        args.push(resolved.clone());
        applied.push(json!({ "parameter": flag.trim_start_matches('-'), "value": resolved }));
    }

    Ok((
        args,
        json!({
            "schemaIntrospectable": introspectable,
            "applied": applied,
            "omitted": omitted,
            "warnings": warnings,
        }),
    ))
}
