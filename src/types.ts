export interface Workspace {
  id: number;
  name: string;
  created_at: number;
}

export interface Tab {
  id: number;
  workspace_id: number;
  title: string;
  created_at: number;
}

export interface Cell {
  id: number;
  tab_id: number;
  position: number;
  cell_type: number; // 0=markdown, 1=image
  content: string;
  created_at: number;
  updated_at: number;
}
