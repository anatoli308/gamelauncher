use serde_json;
use std::error::Error;
use std::path::PathBuf;
use crate::commands::settings::LauncherSettings;

pub struct SettingsService;

impl SettingsService {
    /// Load settings from disk
    pub async fn load_settings() -> Result<LauncherSettings, Box<dyn Error>> {
        let settings_path = Self::get_settings_path()?;
        
        if settings_path.exists() {
            let content = std::fs::read_to_string(settings_path)?;
            let settings: LauncherSettings = serde_json::from_str(&content)?;
            Ok(settings)
        } else {
            Ok(LauncherSettings::default())
        }
    }

    /// Save settings to disk
    pub async fn save_settings(settings: LauncherSettings) -> Result<(), Box<dyn Error>> {
        let settings_path = Self::get_settings_path()?;
        
        // Ensure parent directory exists
        if let Some(parent) = settings_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        
        let json = serde_json::to_string_pretty(&settings)?;
        std::fs::write(settings_path, json)?;
        Ok(())
    }

    /// Get settings file path
    fn get_settings_path() -> Result<PathBuf, Box<dyn Error>> {
        let app_dir = dirs::data_local_dir()
            .ok_or("Failed to get app data directory")?
            .join("RemakeSoF");
        
        Ok(app_dir.join("launcher_settings.json"))
    }
}
