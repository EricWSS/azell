PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 30000000000;

CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY,
    workspace_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cells (
    id INTEGER PRIMARY KEY,
    tab_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    type INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tabs_workspace
ON tabs(workspace_id);

CREATE INDEX IF NOT EXISTS idx_cells_tab_position
ON cells(tab_id, position);
