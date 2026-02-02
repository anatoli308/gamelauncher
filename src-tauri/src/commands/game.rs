use serde::{Deserialize, Serialize};
use tauri::Window;
use crate::services::game_service::GameService;
use crate::types::{GameVersion, DownloadProgress};

#[derive(Debug, Serialize, Deserialize)]
pub struct LaunchResult {
    pub success: bool,
    pub message: String,
}

/// Check current game version from server
#[tauri::command]
pub async fn check_version() -> Result<GameVersion, String> {
    match GameService::check_version().await {
        Ok(version) => Ok(version),
        Err(e) => Err(format!("Failed to check version: {}", e)),
    }
}

/// Download game files with progress tracking
#[tauri::command]
pub async fn download_game(
    window: Window,
    version: String,
    install_path: String,
) -> Result<(), String> {
    match GameService::download_game(version, install_path, move |progress| {
        // Emit progress to frontend
        let _ = window.emit("download-progress", progress);
    })
    .await
    {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Download failed: {}", e)),
    }
}

/// Launch the game with authentication token
#[tauri::command]
pub async fn launch_game(token: String, install_path: String) -> Result<LaunchResult, String> {
    match GameService::launch_game(token, install_path).await {
        Ok(_) => Ok(LaunchResult {
            success: true,
            message: "Game launched successfully".to_string(),
        }),
        Err(e) => Err(format!("Failed to launch game: {}", e)),
    }
}

/// Get the default installation path for the game
#[tauri::command]
pub async fn get_install_path() -> Result<String, String> {
    match GameService::get_install_path() {
        Ok(path) => Ok(path),
        Err(e) => Err(format!("Failed to get install path: {}", e)),
    }
}
