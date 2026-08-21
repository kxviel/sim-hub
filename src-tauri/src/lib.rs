#[tauri::command]
fn enable_native_backdrop(window: tauri::WebviewWindow) -> bool {
    #[cfg(target_os = "windows")]
    {
        if let Err(error) = window_vibrancy::apply_mica(&window, None) {
            eprintln!("Mica is unavailable; using the solid theme fallback: {error}");
            return false;
        }

        true
    }

    #[cfg(target_os = "macos")]
    {
        if let Err(error) = window_vibrancy::apply_vibrancy(
            &window,
            window_vibrancy::NSVisualEffectMaterial::UnderWindowBackground,
            None,
            None,
        ) {
            eprintln!("macOS vibrancy is unavailable; using the solid theme fallback: {error}");
            return false;
        }

        true
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = window;
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![enable_native_backdrop])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
