use serde::{Deserialize, Serialize};
use crate::services::settings_service::SettingsService;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherSettings {
    pub server_url: String,
    pub install_path: String,
    pub auto_update: bool,
    pub remember_me: bool,
    pub language: String,
}

impl Default for LauncherSettings {
    fn default() -> Self {
        Self {
            server_url: "http://localhost:8000".to_string(),
            install_path: String::new(),
            auto_update: true,
            remember_me: false,
            language: "en".to_string(),
        }
    }
}

/// Get launcher settings
#[tauri::command]
pub async fn get_settings() -> Result<LauncherSettings, String> {
    match SettingsService::load_settings().await {
        Ok(settings) => Ok(settings),
        Err(e) => {
            eprintln!("Failed to load settings, using defaults: {}", e);
            Ok(LauncherSettings::default())
        }
    }
}

/// Save launcher settings
#[tauri::command]
pub async fn save_settings(settings: LauncherSettings) -> Result<(), String> {
    match SettingsService::save_settings(settings).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to save settings: {}", e)),
    }
}
