use serde::{Deserialize, Serialize};
use crate::services::auth_service::AuthService;
use crate::types::{AuthResponse, LoginCredentials};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiError {
    pub message: String,
}

/// Login command - authenticates user with FastAPI backend
#[tauri::command]
pub async fn login(username: String, password: String) -> Result<AuthResponse, String> {
    let credentials = LoginCredentials { username, password };
    
    match AuthService::login(credentials).await {
        Ok(response) => Ok(response),
        Err(e) => Err(format!("Login failed: {}", e)),
    }
}

/// Logout command - clears stored credentials
#[tauri::command]
pub async fn logout() -> Result<(), String> {
    match AuthService::logout().await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Logout failed: {}", e)),
    }
}

/// Refresh token command - refreshes authentication token
#[tauri::command]
pub async fn refresh_token(token: String) -> Result<AuthResponse, String> {
    match AuthService::refresh_token(token).await {
        Ok(response) => Ok(response),
        Err(e) => Err(format!("Token refresh failed: {}", e)),
    }
}
