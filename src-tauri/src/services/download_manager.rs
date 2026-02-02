use reqwest::Client;
use futures_util::StreamExt;
use std::error::Error;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use crate::types::DownloadProgress;

pub struct DownloadManager;

impl DownloadManager {
    /// Download file with progress tracking
    pub async fn download_file<F>(
        url: &str,
        destination: &Path,
        progress_callback: F,
    ) -> Result<(), Box<dyn Error>>
    where
        F: Fn(DownloadProgress) + Send + 'static,
    {
        let client = Client::new();
        let response = client.get(url).send().await?;

        let total_size = response.content_length().unwrap_or(0);
        let mut downloaded: u64 = 0;
        let mut stream = response.bytes_stream();
        let mut file = File::create(destination)?;

        while let Some(chunk) = stream.next().await {
            let chunk = chunk?;
            file.write_all(&chunk)?;
            downloaded += chunk.len() as u64;

            let progress = if total_size > 0 {
                (downloaded as f32 / total_size as f32) * 100.0
            } else {
                0.0
            };

            progress_callback(DownloadProgress {
                downloaded_bytes: downloaded,
                total_bytes: total_size,
                progress_percent: progress,
                speed_mbps: 0.0, // TODO: Calculate speed
            });
        }

        Ok(())
    }

    /// Resume download from partial file
    pub async fn resume_download<F>(
        url: &str,
        destination: &Path,
        progress_callback: F,
    ) -> Result<(), Box<dyn Error>>
    where
        F: Fn(DownloadProgress) + Send + 'static,
    {
        let existing_size = if destination.exists() {
            std::fs::metadata(destination)?.len()
        } else {
            0
        };

        let client = Client::new();
        let response = client
            .get(url)
            .header("Range", format!("bytes={}-", existing_size))
            .send()
            .await?;

        let total_size = response.content_length().unwrap_or(0) + existing_size;
        let mut downloaded = existing_size;
        let mut stream = response.bytes_stream();
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(destination)?;

        while let Some(chunk) = stream.next().await {
            let chunk = chunk?;
            file.write_all(&chunk)?;
            downloaded += chunk.len() as u64;

            let progress = if total_size > 0 {
                (downloaded as f32 / total_size as f32) * 100.0
            } else {
                0.0
            };

            progress_callback(DownloadProgress {
                downloaded_bytes: downloaded,
                total_bytes: total_size,
                progress_percent: progress,
                speed_mbps: 0.0,
            });
        }

        Ok(())
    }
}
