import type { Cell } from "../../types";

// ── Action Types ──

export type HistoryActionType =
    | "insert_cell"
    | "delete_cell"
    | "edit_cell"
    | "move_cell";

export interface InsertCellAction {
    type: "insert_cell";
    payload: {
        cell: Cell;
    };
}

export interface DeleteCellAction {
    type: "delete_cell";
    payload: {
        cell: Cell;
    };
}

export interface EditCellAction {
    type: "edit_cell";
    payload: {
        cellId: number;
        previousContent: string;
        newContent: string;
    };
}

export interface MoveCellAction {
    type: "move_cell";
    payload: {
        cellId: number;
        direction: "up" | "down";
    };
}

export type HistoryAction =
    | InsertCellAction
    | DeleteCellAction
    | EditCellAction
    | MoveCellAction;

// ── Applier type ──
export type ActionApplier = (action: HistoryAction) => Promise<void>;

// ── History Manager ──

const MAX_HISTORY = 100;

export class HistoryManager {
    private undoStack: HistoryAction[] = [];
    private redoStack: HistoryAction[] = [];
    private listeners: Set<() => void> = new Set();
    private applier: ActionApplier | null = null;

    /** Register the function that actually executes actions (API calls + reload) */
    setApplier(fn: ActionApplier): void {
        this.applier = fn;
        console.log("[History] Applier registered");
    }

    /** Push a new action. Clears redo stack. */
    pushAction(action: HistoryAction): void {
        this.undoStack.push(action);
        if (this.undoStack.length > MAX_HISTORY) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.notify();
        console.log(`[History] Pushed: ${action.type} | undoStack: ${this.undoStack.length}`);
    }

    /** Undo: pop last action, reverse it, execute it, push to redo stack */
    async undo(): Promise<void> {
        console.log(`[History] Undo called | undoStack: ${this.undoStack.length} | applier: ${!!this.applier}`);
        const action = this.undoStack.pop();
        if (!action) {
            console.log("[History] Undo: nothing to undo");
            return;
        }
        this.redoStack.push(action);
        this.notify();
        const reversed = this.reverseAction(action);
        console.log(`[History] Undo: reversing ${action.type} → applying ${reversed.type}`);
        if (this.applier) {
            await this.applier(reversed);
        } else {
            console.warn("[History] Undo: applier is NULL — action not executed!");
        }
    }

    /** Redo: pop from redo stack, re-execute, push to undo stack */
    async redo(): Promise<void> {
        console.log(`[History] Redo called | redoStack: ${this.redoStack.length} | applier: ${!!this.applier}`);
        const action = this.redoStack.pop();
        if (!action) {
            console.log("[History] Redo: nothing to redo");
            return;
        }
        this.undoStack.push(action);
        this.notify();
        console.log(`[History] Redo: re-applying ${action.type}`);
        if (this.applier) {
            await this.applier(action);
        } else {
            console.warn("[History] Redo: applier is NULL — action not executed!");
        }
    }

    get canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    get canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /** Clear undo/redo stacks (e.g. when switching tabs). Does NOT clear the applier. */
    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.notify();
        console.log("[History] Stacks cleared");
    }

    /** Subscribe to state changes */
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach((fn) => fn());
    }

    /** Compute the reverse of an action */
    private reverseAction(action: HistoryAction): HistoryAction {
        switch (action.type) {
            case "insert_cell":
                return {
                    type: "delete_cell",
                    payload: { cell: action.payload.cell },
                };
            case "delete_cell":
                return {
                    type: "insert_cell",
                    payload: { cell: action.payload.cell },
                };
            case "edit_cell":
                return {
                    type: "edit_cell",
                    payload: {
                        cellId: action.payload.cellId,
                        previousContent: action.payload.newContent,
                        newContent: action.payload.previousContent,
                    },
                };
            case "move_cell":
                return {
                    type: "move_cell",
                    payload: {
                        cellId: action.payload.cellId,
                        direction: action.payload.direction === "up" ? "down" : "up",
                    },
                };
        }
    }
}

// Singleton instance
export const historyManager = new HistoryManager();
