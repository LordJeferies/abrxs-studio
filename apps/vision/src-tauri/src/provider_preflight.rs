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
                || normalized
                    .split(|character: char| !character.is_ascii_alphanumeric() && character != '_')
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
        // Official Higgsfield CLI media inputs may also be upload/job/media IDs.
        return Ok(trimmed.to_string());
    }

    let path = if let Some(rest) = trimmed.strip_prefix("~/") {
        let home = env::var_os("HOME")
            .ok_or_else(|| "HOME is not available to expand the media path.".to_string())?;
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
        if introspectable && schema_mentions(schema, "aspect_ratio") {
            args.push("--aspect_ratio".into());
            args.push(value.clone());
            applied.push(json!({ "parameter": "aspect_ratio", "value": value }));
        } else {
            let reason = if introspectable { "not present in live model schema" } else { "live schema could not be interpreted safely" };
            omitted.push(json!({ "parameter": "aspect_ratio", "value": value, "reason": reason }));
            warnings.push("Vision will not send aspect_ratio because support was not confirmed by the live model schema.".into());
        }
    }

    if let Some(value) = duration.filter(|value| *value >= 1 && *value <= 120) {
        if introspectable && schema_mentions(schema, "duration") {
            args.push("--duration".into());
            args.push(value.to_string());
            applied.push(json!({ "parameter": "duration", "value": value }));
        } else {
            let reason = if introspectable { "not present in live model schema" } else { "live schema could not be interpreted safely" };
            omitted.push(json!({ "parameter": "duration", "value": value, "reason": reason }));
            warnings.push("Vision will not send duration because support was not confirmed by the live model schema.".into());
        }
    }

    if let Some(value) = resolution.filter(|value| !value.trim().is_empty()) {
        if introspectable && schema_mentions(schema, "resolution") {
            args.push("--resolution".into());
            args.push(value.clone());
            applied.push(json!({ "parameter": "resolution", "value": value }));
        } else {
            let reason = if introspectable { "not present in live model schema" } else { "live schema could not be interpreted safely" };
            omitted.push(json!({ "parameter": "resolution", "value": value, "reason": reason }));
            warnings.push("Vision will not send resolution because support was not confirmed by the live model schema.".into());
        }
    }

    if let Some(value) = start_image.filter(|value| !value.trim().is_empty()) {
        if !introspectable {
            return Err("The live model schema could not be interpreted safely, so Vision will not submit a media input blindly.".into());
        }
        let resolved = resolve_media_input(&value)?;
        let flag = if schema_mentions(schema, "start_image") {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_parameters_in_nested_schema() {
        let schema = json!({
            "input": {
                "properties": {
                    "prompt": { "type": "string" },
                    "aspect_ratio": { "enum": ["16:9", "9:16"] },
                    "duration": { "type": "integer" },
                    "image": { "type": "media" }
                }
            }
        });
        assert!(schema_is_introspectable(&schema));
        assert!(schema_mentions(&schema, "aspect_ratio"));
        assert!(schema_mentions(&schema, "image"));
        assert!(!schema_mentions(&schema, "resolution"));
    }

    #[test]
    fn omits_unconfirmed_optional_flags() {
        let schema = json!({ "properties": { "prompt": {}, "duration": {} } });
        let (args, plan) = build_optional_args(
            &schema,
            Some("16:9".into()),
            Some(5),
            None,
            Some("1080p".into()),
        ).expect("preflight should succeed");
        assert_eq!(args, vec!["--duration", "5"]);
        assert_eq!(plan["applied"].as_array().map(|items| items.len()), Some(1));
        assert_eq!(plan["omitted"].as_array().map(|items| items.len()), Some(2));
    }

    #[test]
    fn accepts_opaque_media_id_for_supported_image_input() {
        let schema = json!({ "properties": { "prompt": {}, "image": {} } });
        let (args, _) = build_optional_args(
            &schema,
            None,
            None,
            Some("media_12345".into()),
            None,
        ).expect("opaque provider media id should be accepted");
        assert_eq!(args, vec!["--image", "media_12345"]);
    }

    #[test]
    fn blocks_media_when_schema_is_not_interpretable() {
        let schema = json!({ "name": "unknown-model", "metadata": { "version": 3 } });
        let error = build_optional_args(
            &schema,
            None,
            None,
            Some("media_12345".into()),
            None,
        ).expect_err("blind media submission must be blocked");
        assert!(error.contains("could not be interpreted safely"));
    }
}
