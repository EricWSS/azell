mod commands;
mod db;
mod models;
mod storage;

use db::Database;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_prevent_default::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let app_data = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            let database = Database::init(&app_data);
            app.manage(database);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::workspace::create_workspace,
            commands::workspace::list_workspaces,
            commands::workspace::delete_workspace,
            commands::workspace::rename_workspace,
            commands::tab::create_tab,
            commands::tab::list_tabs,
            commands::tab::rename_tab,
            commands::tab::delete_tab,
            commands::cell::create_cell,
            commands::cell::list_cells,
            commands::cell::update_cell,
            commands::cell::delete_cell,
            commands::cell::move_cell,
            commands::cell::save_image_file,
            commands::cell::save_image_cell,
            commands::cell::duplicate_cell,
            commands::cell::move_cell_up,
            commands::cell::move_cell_down,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
