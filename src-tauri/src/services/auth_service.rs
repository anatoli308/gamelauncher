use reqwest::Client;
use serde_json::json;
use crate::types::{AuthResponse, LoginCredentials};
use std::error::Error;

pub struct AuthService;

impl AuthService {
    const API_URL: &'static str = "http://localhost:8000/api";

    /// Authenticate user with FastAPI backend
    pub async fn login(credentials: LoginCredentials) -> Result<AuthResponse, Box<dyn Error>> {
        let client = Client::new();
        
        let response = client
            .post(format!("{}/loginUser", Self::API_URL))
            .json(&json!({
                "username": credentials.username,
                "password": credentials.password
            }))
            .send()
            .await?;

        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            
            // Store token securely (in production, use OS keychain)
            Self::store_token(&auth_response.token)?;
            
            Ok(auth_response)
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            Err(format!("Authentication failed ({}): {}", status, error_text).into())
        }
    }

    /// Logout user and clear stored credentials
    pub async fn logout() -> Result<(), Box<dyn Error>> {
        Self::clear_token()?;
        Ok(())
    }

    /// Refresh authentication token
    pub async fn refresh_token(token: String) -> Result<AuthResponse, Box<dyn Error>> {
        let client = Client::new();
        
        let response = client
            .post(format!("{}/refreshToken", Self::API_URL))
            .header("Authorization", format!("Bearer {}", token))
            .send()
            .await?;

        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            Self::store_token(&auth_response.token)?;
            Ok(auth_response)
        } else {
            Err("Token refresh failed".into())
        }
    }

    /// Store token securely
    fn store_token(token: &str) -> Result<(), Box<dyn Error>> {
        // In production: use keyring crate for OS keychain
        // For now, store in app data directory
        let app_dir = dirs::data_local_dir()
            .ok_or("Failed to get app data directory")?
            .join("RemakeSoF");
        
        std::fs::create_dir_all(&app_dir)?;
        std::fs::write(app_dir.join(".token"), token)?;
        Ok(())
    }

    /// Clear stored token
    fn clear_token() -> Result<(), Box<dyn Error>> {
        let app_dir = dirs::data_local_dir()
            .ok_or("Failed to get app data directory")?
            .join("RemakeSoF");
        
        let token_path = app_dir.join(".token");
        if token_path.exists() {
            std::fs::remove_file(token_path)?;
        }
        Ok(())
    }

    /// Retrieve stored token
    pub fn get_stored_token() -> Option<String> {
        let app_dir = dirs::data_local_dir()?.join("RemakeSoF");
        let token = std::fs::read_to_string(app_dir.join(".token")).ok()?;
        Some(token)
    }
}
