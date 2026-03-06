import { invoke } from "@tauri-apps/api/core";
import type { Workspace, Tab, Cell } from "../types";

// ── Workspaces ──

export async function getWorkspaces(): Promise<Workspace[]> {
    return invoke<Workspace[]>("list_workspaces");
}

export async function createWorkspace(name: string): Promise<Workspace> {
    return invoke<Workspace>("create_workspace", { name });
}

export async function deleteWorkspace(id: number): Promise<void> {
    return invoke("delete_workspace", { id });
}

export async function renameWorkspace(id: number, name: string): Promise<void> {
    return invoke("rename_workspace", { id, name });
}

// ── Tabs ──

export async function getTabs(workspaceId: number): Promise<Tab[]> {
    return invoke<Tab[]>("list_tabs", { workspaceId });
}

export async function createTab(workspaceId: number, title: string): Promise<Tab> {
    return invoke<Tab>("create_tab", { workspaceId, title });
}

export async function renameTab(id: number, title: string): Promise<void> {
    return invoke("rename_tab", { id, title });
}

export async function deleteTab(id: number): Promise<void> {
    return invoke("delete_tab", { id });
}

// ── Cells ──

export async function getCells(tabId: number): Promise<Cell[]> {
    return invoke<Cell[]>("list_cells", { tabId });
}

export async function createCell(
    tabId: number,
    cellType: number,
    content: string,
    position?: number
): Promise<Cell> {
    return invoke<Cell>("create_cell", { tabId, cellType, content, position: position ?? null });
}

export async function updateCell(id: number, content: string): Promise<void> {
    return invoke("update_cell", { id, content });
}

export async function deleteCell(id: number): Promise<void> {
    return invoke("delete_cell", { id });
}

export async function moveCell(id: number, newPosition: number): Promise<void> {
    return invoke("move_cell", { id, newPosition });
}

export async function duplicateCell(id: number): Promise<Cell> {
    return invoke<Cell>("duplicate_cell", { id });
}

export async function moveCellUp(id: number): Promise<void> {
    return invoke("move_cell_up", { id });
}

export async function moveCellDown(id: number): Promise<void> {
    return invoke("move_cell_down", { id });
}

// ── Images ──

/** Save image bytes to filesystem only. Returns the file path. */
export async function saveImageFile(imageBytes: number[]): Promise<string> {
    return invoke<string>("save_image_file", { imageBytes });
}

/** Save image bytes AND create a new image cell in one call. */
export async function saveImageCell(
    tabId: number,
    imageBytes: number[],
    position?: number
): Promise<Cell> {
    return invoke<Cell>("save_image_cell", {
        tabId,
        imageBytes,
        position: position ?? null,
    });
}
