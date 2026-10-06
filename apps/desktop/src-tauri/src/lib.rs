use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeCapabilities {
    platform: &'static str,
    native_shell: bool,
    local_filesystem: bool,
    native_secrets: bool,
    background_jobs: bool,
    local_render: bool,
}

#[tauri::command]
fn runtime_capabilities() -> RuntimeCapabilities {
    RuntimeCapabilities {
        platform: "desktop",
        native_shell: true,
        local_filesystem: true,
        native_secrets: true,
        background_jobs: true,
        local_render: true,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![runtime_capabilities])
        .run(tauri::generate_context!())
        .expect("error while running Abrxs Studio");
}
