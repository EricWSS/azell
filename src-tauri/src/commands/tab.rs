use crate::db::Database;
use crate::models::Tab;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

#[tauri::command]
pub fn create_tab(db: State<'_, Database>, workspace_id: i64, title: String) -> Result<Tab, String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO tabs (workspace_id, title, created_at) VALUES (?1, ?2, ?3)",
        rusqlite::params![workspace_id, title, ts],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    Ok(Tab {
        id,
        workspace_id,
        title,
        created_at: ts,
    })
}

#[tauri::command]
pub fn list_tabs(db: State<'_, Database>, workspace_id: i64) -> Result<Vec<Tab>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, workspace_id, title, created_at FROM tabs WHERE workspace_id = ?1 ORDER BY created_at")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![workspace_id], |row| {
            Ok(Tab {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                title: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

#[tauri::command]
pub fn rename_tab(db: State<'_, Database>, id: i64, title: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE tabs SET title = ?1 WHERE id = ?2",
        rusqlite::params![title, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_tab(db: State<'_, Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tabs WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
