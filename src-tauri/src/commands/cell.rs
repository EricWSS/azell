use crate::db::Database;
use crate::models::Cell;
use crate::storage::image_store;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Manager, State};

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

#[tauri::command]
pub fn create_cell(
    db: State<'_, Database>,
    tab_id: i64,
    cell_type: i64,
    content: String,
    position: Option<i64>,
) -> Result<Cell, String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let pos = match position {
        Some(p) => p,
        None => {
            let max_pos: i64 = conn
                .query_row(
                    "SELECT COALESCE(MAX(position), 0) FROM cells WHERE tab_id = ?1",
                    rusqlite::params![tab_id],
                    |row| row.get(0),
                )
                .map_err(|e| e.to_string())?;
            max_pos + 1000
        }
    };

    conn.execute(
        "INSERT INTO cells (tab_id, position, type, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![tab_id, pos, cell_type, content, ts, ts],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    eprintln!("[DEBUG] create_cell id={} tab_id={} type={} pos={}", id, tab_id, cell_type, pos);
    Ok(Cell {
        id,
        tab_id,
        position: pos,
        cell_type,
        content,
        created_at: ts,
        updated_at: ts,
    })
}

/// Save image bytes to filesystem (compressed PNG). Returns the file path only.
/// Does NOT create a cell — use update_cell to set the path on an existing cell.
#[tauri::command]
pub fn save_image_file(
    app: tauri::AppHandle,
    image_bytes: Vec<u8>,
) -> Result<String, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let path = image_store::save_image(&app_data, &image_bytes)?;
    eprintln!("[DEBUG] save_image_file path={}", path);
    Ok(path)
}

/// Save image to filesystem AND create a new cell in one call.
#[tauri::command]
pub fn save_image_cell(
    app: tauri::AppHandle,
    db: State<'_, Database>,
    tab_id: i64,
    position: Option<i64>,
    image_bytes: Vec<u8>,
) -> Result<Cell, String> {
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let path = image_store::save_image(&app_data, &image_bytes)?;

    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let pos = match position {
        Some(p) => p,
        None => {
            let max_pos: i64 = conn
                .query_row(
                    "SELECT COALESCE(MAX(position), 0) FROM cells WHERE tab_id = ?1",
                    rusqlite::params![tab_id],
                    |row| row.get(0),
                )
                .map_err(|e| e.to_string())?;
            max_pos + 1000
        }
    };

    conn.execute(
        "INSERT INTO cells (tab_id, position, type, content, created_at, updated_at) VALUES (?1, ?2, 1, ?3, ?4, ?5)",
        rusqlite::params![tab_id, pos, path, ts, ts],
    )
    .map_err(|e| e.to_string())?;
    let id = conn.last_insert_rowid();
    eprintln!("[DEBUG] save_image_cell id={} path={}", id, path);
    Ok(Cell {
        id,
        tab_id,
        position: pos,
        cell_type: 1,
        content: path,
        created_at: ts,
        updated_at: ts,
    })
}

#[tauri::command]
pub fn list_cells(db: State<'_, Database>, tab_id: i64) -> Result<Vec<Cell>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, tab_id, position, type, content, created_at, updated_at FROM cells WHERE tab_id = ?1 ORDER BY position",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![tab_id], |row| {
            Ok(Cell {
                id: row.get(0)?,
                tab_id: row.get(1)?,
                position: row.get(2)?,
                cell_type: row.get(3)?,
                content: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for r in rows {
        result.push(r.map_err(|e| e.to_string())?);
    }
    eprintln!("[DEBUG] list_cells tab_id={} count={}", tab_id, result.len());
    Ok(result)
}

#[tauri::command]
pub fn update_cell(db: State<'_, Database>, id: i64, content: String) -> Result<(), String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE cells SET content = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![content, ts, id],
    )
    .map_err(|e| e.to_string())?;
    eprintln!("[DEBUG] update_cell id={} content_len={}", id, content.len());
    Ok(())
}

#[tauri::command]
pub fn delete_cell(db: State<'_, Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM cells WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    eprintln!("[DEBUG] delete_cell id={}", id);
    Ok(())
}

#[tauri::command]
pub fn move_cell(db: State<'_, Database>, id: i64, new_position: i64) -> Result<(), String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE cells SET position = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![new_position, ts, id],
    )
    .map_err(|e| e.to_string())?;
    eprintln!("[DEBUG] move_cell id={} new_pos={}", id, new_position);
    Ok(())
}

#[tauri::command]
pub fn duplicate_cell(db: State<'_, Database>, id: i64) -> Result<Cell, String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Read original cell
    let original = conn
        .query_row(
            "SELECT id, tab_id, position, type, content, created_at, updated_at FROM cells WHERE id = ?1",
            rusqlite::params![id],
            |row| {
                Ok(Cell {
                    id: row.get(0)?,
                    tab_id: row.get(1)?,
                    position: row.get(2)?,
                    cell_type: row.get(3)?,
                    content: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    let new_position = original.position + 1;

    conn.execute(
        "INSERT INTO cells (tab_id, position, type, content, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![original.tab_id, new_position, original.cell_type, original.content, ts, ts],
    )
    .map_err(|e| e.to_string())?;
    let new_id = conn.last_insert_rowid();
    eprintln!("[DEBUG] duplicate_cell original={} new={} pos={}", id, new_id, new_position);
    Ok(Cell {
        id: new_id,
        tab_id: original.tab_id,
        position: new_position,
        cell_type: original.cell_type,
        content: original.content,
        created_at: ts,
        updated_at: ts,
    })
}

#[tauri::command]
pub fn move_cell_up(db: State<'_, Database>, id: i64) -> Result<(), String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let current = conn
        .query_row(
            "SELECT tab_id, position FROM cells WHERE id = ?1",
            rusqlite::params![id],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
        )
        .map_err(|e| e.to_string())?;

    let prev = conn
        .query_row(
            "SELECT id, position FROM cells WHERE tab_id = ?1 AND position < ?2 ORDER BY position DESC LIMIT 1",
            rusqlite::params![current.0, current.1],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
        )
        .map_err(|_| "no cell above".to_string())?;

    // Swap positions
    conn.execute(
        "UPDATE cells SET position = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![prev.1, ts, id],
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE cells SET position = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![current.1, ts, prev.0],
    ).map_err(|e| e.to_string())?;

    eprintln!("[DEBUG] move_cell_up id={} swapped with id={}", id, prev.0);
    Ok(())
}

#[tauri::command]
pub fn move_cell_down(db: State<'_, Database>, id: i64) -> Result<(), String> {
    let ts = now();
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let current = conn
        .query_row(
            "SELECT tab_id, position FROM cells WHERE id = ?1",
            rusqlite::params![id],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
        )
        .map_err(|e| e.to_string())?;

    let next = conn
        .query_row(
            "SELECT id, position FROM cells WHERE tab_id = ?1 AND position > ?2 ORDER BY position ASC LIMIT 1",
            rusqlite::params![current.0, current.1],
            |row| Ok((row.get::<_, i64>(0)?, row.get::<_, i64>(1)?)),
        )
        .map_err(|_| "no cell below".to_string())?;

    // Swap positions
    conn.execute(
        "UPDATE cells SET position = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![next.1, ts, id],
    ).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE cells SET position = ?1, updated_at = ?2 WHERE id = ?3",
        rusqlite::params![current.1, ts, next.0],
    ).map_err(|e| e.to_string())?;

    eprintln!("[DEBUG] move_cell_down id={} swapped with id={}", id, next.0);
    Ok(())
}

