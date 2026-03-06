import React from "react";
import { historyManager, HistoryAction } from "./HistoryManager";
import type { Cell } from "../../types";
import {
    createCell,
    deleteCell,
    updateCell,
    moveCellUp,
    moveCellDown,
} from "../../services/api";

/**
 * React hook that exposes undo/redo capabilities and action tracking.
 *
 * @param reloadCells - callback to refresh the cell list from the DB after undo/redo
 */
export function useHistory(reloadCells: () => void) {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    // Subscribe to history changes for re-render
    React.useEffect(() => {
        return historyManager.subscribe(forceUpdate);
    }, []);

    // ── Apply an action (persists to SQLite + reloads UI) ──
    const applyAction = React.useCallback(
        async (action: HistoryAction) => {
            try {
                switch (action.type) {
                    case "insert_cell":
                        await createCell(
                            action.payload.cell.tab_id,
                            action.payload.cell.cell_type,
                            action.payload.cell.content,
                            action.payload.cell.position
                        );
                        break;
                    case "delete_cell":
                        await deleteCell(action.payload.cell.id);
                        break;
                    case "edit_cell":
                        await updateCell(action.payload.cellId, action.payload.newContent);
                        break;
                    case "move_cell":
                        if (action.payload.direction === "up") {
                            await moveCellUp(action.payload.cellId);
                        } else {
                            await moveCellDown(action.payload.cellId);
                        }
                        break;
                }
                reloadCells();
            } catch (err) {
                console.error("History apply action failed:", err);
            }
        },
        [reloadCells]
    );

    // Register the applier with the singleton so undo/redo from ANYWHERE works
    React.useEffect(() => {
        historyManager.setApplier(applyAction);
    }, [applyAction]);

    // Clear history when component unmounts (tab switch)
    React.useEffect(() => {
        return () => historyManager.clear();
    }, []);

    // ── Track actions ──

    const trackInsert = React.useCallback((cell: Cell) => {
        historyManager.pushAction({
            type: "insert_cell",
            payload: { cell },
        });
    }, []);

    const trackDelete = React.useCallback((cell: Cell) => {
        historyManager.pushAction({
            type: "delete_cell",
            payload: { cell },
        });
    }, []);

    const trackEdit = React.useCallback(
        (cellId: number, previousContent: string, newContent: string) => {
            if (previousContent === newContent) return;
            historyManager.pushAction({
                type: "edit_cell",
                payload: { cellId, previousContent, newContent },
            });
        },
        []
    );

    const trackMove = React.useCallback(
        (cellId: number, direction: "up" | "down") => {
            historyManager.pushAction({
                type: "move_cell",
                payload: { cellId, direction },
            });
        },
        []
    );

    return {
        undo: () => historyManager.undo(),
        redo: () => historyManager.redo(),
        canUndo: historyManager.canUndo,
        canRedo: historyManager.canRedo,
        trackInsert,
        trackDelete,
        trackEdit,
        trackMove,
    };
}
