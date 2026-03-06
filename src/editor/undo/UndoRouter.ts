/**
 * UndoRouter — contextual undo/redo dispatcher.
 *
 * Detects what the user is currently interacting with and routes
 * Ctrl+Z / Ctrl+Shift+Z to the correct undo manager:
 *
 *   - Inside a markdown cell textarea → TextUndoManager (text edits)
 *   - Outside any text input → HistoryManager (structural: insert/delete/move)
 */

import { historyManager } from "../history/HistoryManager";
import { textUndoManager } from "./TextUndoManager";
import { editSessionManager } from "../editing/EditSessionManager";

/**
 * Detect if the user is currently editing a markdown cell.
 * Returns the cell ID if yes, null otherwise.
 */
function getEditingCellId(): number | null {
    const el = document.activeElement;
    if (!el || (el.tagName !== "TEXTAREA" && el.tagName !== "INPUT")) return null;

    // Walk up the DOM to find the cell wrapper with data-cell-id
    const cellEl = el.closest("[data-cell-id]");
    if (!cellEl) return null;

    const id = cellEl.getAttribute("data-cell-id");
    return id ? parseInt(id, 10) : null;
}

export function undoRouterUndo(): void {
    const cellId = getEditingCellId();

    if (cellId !== null) {
        // Commit any pending edit session first, so the current changes are saved
        editSessionManager.commitSession();
        // Then undo the last text edit for this cell
        textUndoManager.undo(cellId);
    } else {
        // Structural undo
        historyManager.undo();
    }
}

export function undoRouterRedo(): void {
    const cellId = getEditingCellId();

    if (cellId !== null) {
        textUndoManager.redo(cellId);
    } else {
        // Structural redo
        historyManager.redo();
    }
}
