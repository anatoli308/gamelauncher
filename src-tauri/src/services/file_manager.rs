use sha2::{Sha256, Digest};
use std::error::Error;
use std::fs::File;
use std::io::Read;
use std::path::Path;

pub struct FileManager;

impl FileManager {
    /// Calculate SHA256 hash of a file
    pub fn calculate_file_hash(path: &Path) -> Result<String, Box<dyn Error>> {
        let mut file = File::open(path)?;
        let mut hasher = Sha256::new();
        let mut buffer = [0u8; 8192];

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }

        let hash = hasher.finalize();
        Ok(hex::encode(hash))
    }

    /// Verify file integrity against expected hash
    pub fn verify_file_integrity(
        path: &Path,
        expected_hash: &str,
    ) -> Result<bool, Box<dyn Error>> {
        let actual_hash = Self::calculate_file_hash(path)?;
        Ok(actual_hash.eq_ignore_ascii_case(expected_hash))
    }

    /// Get file size in bytes
    pub fn get_file_size(path: &Path) -> Result<u64, Box<dyn Error>> {
        let metadata = std::fs::metadata(path)?;
        Ok(metadata.len())
    }

    /// Delete file safely
    pub fn delete_file(path: &Path) -> Result<(), Box<dyn Error>> {
        if path.exists() {
            std::fs::remove_file(path)?;
        }
        Ok(())
    }

    /// Create directory recursively
    pub fn create_directory(path: &Path) -> Result<(), Box<dyn Error>> {
        std::fs::create_dir_all(path)?;
        Ok(())
    }
}
