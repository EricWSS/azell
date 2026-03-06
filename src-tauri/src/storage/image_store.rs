use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::ImageReader;
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};

/// Ensure the images directory exists and return its path.
pub fn images_dir(app_data: &Path) -> PathBuf {
    let dir = app_data.join("data").join("images");
    fs::create_dir_all(&dir).expect("failed to create images directory");
    dir
}

/// Decode raw image bytes, re-encode as compressed PNG, save to disk.
/// Returns the absolute path of the saved file.
pub fn save_image(app_data: &Path, raw_bytes: &[u8]) -> Result<String, String> {
    let dir = images_dir(app_data);
    let id = uuid::Uuid::new_v4();
    let filename = format!("{}.png", id.simple());
    let file_path = dir.join(&filename);

    // Decode whatever image format was pasted
    let img = ImageReader::new(Cursor::new(raw_bytes))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    // Re-encode as PNG with compression level 3
    let out_file = fs::File::create(&file_path).map_err(|e| e.to_string())?;
    let encoder = PngEncoder::new_with_quality(out_file, CompressionType::Fast, FilterType::Sub);
    img.write_with_encoder(encoder)
        .map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}
