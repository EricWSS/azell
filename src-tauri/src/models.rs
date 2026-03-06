use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Workspace {
    pub id: i64,
    pub name: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Tab {
    pub id: i64,
    pub workspace_id: i64,
    pub title: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Cell {
    pub id: i64,
    pub tab_id: i64,
    pub position: i64,
    pub cell_type: i64,
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}
