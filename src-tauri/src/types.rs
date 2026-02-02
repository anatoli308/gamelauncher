use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthResponse {
    pub message: String,
    #[serde(rename = "playerId")]
    pub player_id: String,
    pub username: String,
    pub token: String,
    #[serde(rename = "selectedSkinName")]
    pub selected_skin_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginCredentials {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameVersion {
    pub version: String,
    pub release_date: String,
    pub download_url: String,
    pub file_size: u64,
    pub checksum: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub progress_percent: f32,
    pub speed_mbps: f32,
}
