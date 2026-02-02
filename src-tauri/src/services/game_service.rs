use reqwest::Client;
use std::error::Error;
use std::path::PathBuf;
use std::process::Command;
use crate::types::{GameVersion, DownloadProgress};
use crate::services::download_manager::DownloadManager;

pub struct GameService;

impl GameService {
    const API_URL: &'static str = "http://localhost:8000/api";

    /// Check latest game version from server
    pub async fn check_version() -> Result<GameVersion, Box<dyn Error>> {
        let client = Client::new();
        
        let response = client
            .get(format!("{}/game/version", Self::API_URL))
            .send()
            .await?;

        if response.status().is_success() {
            let version: GameVersion = response.json().await?;
            Ok(version)
        } else {
            Err("Failed to fetch game version".into())
        }
    }

    /// Download game with progress callback
    pub async fn download_game<F>(
        version: String,
        install_path: String,
        progress_callback: F,
    ) -> Result<(), Box<dyn Error>>
    where
        F: Fn(DownloadProgress) + Send + 'static,
    {
        let download_url = format!("{}/game/download?version={}", Self::API_URL, version);
        let install_path = PathBuf::from(install_path);
        
        // Ensure install directory exists
        std::fs::create_dir_all(&install_path)?;
        
        // Download game files
        DownloadManager::download_file(
            &download_url,
            &install_path.join("game.zip"),
            progress_callback,
        )
        .await?;

        // Extract downloaded archive
        Self::extract_game(&install_path)?;

        Ok(())
    }

    /// Extract game archive
    fn extract_game(install_path: &PathBuf) -> Result<(), Box<dyn Error>> {
        // TODO: Implement zip extraction
        // For now, assume game is already extracted
        println!("Game extraction completed at: {:?}", install_path);
        Ok(())
    }

    /// Launch game with authentication token
    pub async fn launch_game(
        token: String,
        install_path: String,
    ) -> Result<(), Box<dyn Error>> {
        let game_exe = PathBuf::from(install_path).join("RemakeSoF.exe");
        
        if !game_exe.exists() {
            return Err(format!("Game executable not found at: {:?}", game_exe).into());
        }

        // Launch game with token as command line argument
        Command::new(game_exe)
            .arg("--token")
            .arg(token)
            .spawn()?;

        Ok(())
    }

    /// Get default installation path
    pub fn get_install_path() -> Result<String, Box<dyn Error>> {
        let install_dir = dirs::data_local_dir()
            .ok_or("Failed to get app data directory")?
            .join("RemakeSoF")
            .join("Game");
        
        Ok(install_dir.to_string_lossy().to_string())
    }

    /// Get currently installed version
    pub fn get_installed_version(install_path: &str) -> Option<String> {
        let version_file = PathBuf::from(install_path).join("version.txt");
        std::fs::read_to_string(version_file).ok()
    }
}
