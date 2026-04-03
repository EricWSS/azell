use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn init(app_data_dir: &PathBuf) -> Self {
        fs::create_dir_all(app_data_dir).expect("failed to create app data dir");

        let db_path = app_data_dir.join("notebook.db");
        let conn = Connection::open(&db_path).expect("failed to open database");

        // WAL + performance pragmas
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;
             PRAGMA temp_store = MEMORY;
             PRAGMA mmap_size = 30000000000;",
        )
        .expect("failed to set pragmas");

        // Create schema
        conn.execute_batch(include_str!("schema.sql"))
            .expect("failed to create schema");

        // Initialize default workspace if empty
        let count: i64 = conn
            .query_row("SELECT count(*) FROM workspaces", [], |row| row.get(0))
            .unwrap_or(0);

        if count == 0 {
            use std::time::{SystemTime, UNIX_EPOCH};
            let ts = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64;

            // Workspace
            conn.execute(
                "INSERT INTO workspaces (name, created_at) VALUES (?1, ?2)",
                rusqlite::params!["WELCOME", ts],
            )
            .ok();
            let ws_id = conn.last_insert_rowid();

            // Tab
            conn.execute(
                "INSERT INTO tabs (workspace_id, title, created_at) VALUES (?1, ?2, ?3)",
                rusqlite::params![ws_id, "Getting Started", ts],
            )
            .ok();
            let tab_id = conn.last_insert_rowid();

            // Cells
            let cells = vec![
                "# Welcome\n\nWelcome to your new notebook workspace.\n\nThis editor combines the flexibility of markdown\nwith the power of notebook-style cells.",
                "## Creating Cells\n\nUse the floating + buttons between cells\nto insert new cells.\n\nYou can create:\n\n- Markdown text cells\n- Image cells",
                "## Drag and Drop\n\nYou can reorder cells by dragging them.\n\nJust click and drag a cell to move it.",
                "## Slash Commands\n\nInside a cell you can type:\n\n`/text`\n`/image`\n\nto quickly create new content blocks.",
                "## Undo and Redo\n\nKeyboard shortcuts:\n\nCtrl + Z → Undo\n\nCtrl + Shift + Z → Redo",
                "## Images\n\nYou can paste images directly or create\nan image cell.\n\nImages are stored locally and referenced\nin the SQLite database.",
                "## Tabs\n\nTabs allow you to organize multiple documents\ninside a workspace.",
                "## Performance\n\nThis app is built with:\n\nRust\nTauri\nReact\nSQLite\n\nCells are virtualized for extremely fast\nscroll performance even with thousands\nof cells.",
            ];

            for (i, content) in cells.iter().enumerate() {
                let pos = (i + 1) as i64 * 10;
                conn.execute(
                    "INSERT INTO cells (tab_id, position, type, content, created_at, updated_at) VALUES (?1, ?2, 0, ?3, ?4, ?5)",
                    rusqlite::params![tab_id, pos, content, ts, ts],
                ).ok();
            }
        }

        Database {
            conn: Mutex::new(conn),
        }
    }
}
