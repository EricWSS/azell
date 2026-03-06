/**
 * TextUndoManager — manages per-cell text undo/redo stacks.
 *
 * Each cell gets its own pair of stacks so edits across cells don't interfere.
 * The EditSessionManager pushes committed text snapshots here.
 */

const MAX_TEXT_HISTORY = 50;

interface TextSnapshot {
    previousContent: string;
    newContent: string;
}

export type TextApplier = (cellId: number, content: string) => void;

class TextUndoManager {
    private undoStacks: Map<number, TextSnapshot[]> = new Map();
    private redoStacks: Map<number, TextSnapshot[]> = new Map();
    private applier: TextApplier | null = null;

    /** Register callback to apply content changes to cells */
    setApplier(fn: TextApplier): void {
        this.applier = fn;
    }

    /** Push a committed text edit for a specific cell */
    pushEdit(cellId: number, previousContent: string, newContent: string): void {
        if (previousContent === newContent) return;

        if (!this.undoStacks.has(cellId)) {
            this.undoStacks.set(cellId, []);
        }
        const stack = this.undoStacks.get(cellId)!;
        stack.push({ previousContent, newContent });
        if (stack.length > MAX_TEXT_HISTORY) stack.shift();

        // Clear redo for this cell
        this.redoStacks.set(cellId, []);
    }

    /** Undo: restore previous content for a cell */
    undo(cellId: number): void {
        const stack = this.undoStacks.get(cellId);
        if (!stack || stack.length === 0) return;

        const snapshot = stack.pop()!;

        // Push to redo
        if (!this.redoStacks.has(cellId)) {
            this.redoStacks.set(cellId, []);
        }
        this.redoStacks.get(cellId)!.push(snapshot);

        // Apply the previous content
        if (this.applier) {
            this.applier(cellId, snapshot.previousContent);
        }
    }

    /** Redo: restore new content for a cell */
    redo(cellId: number): void {
        const redoStack = this.redoStacks.get(cellId);
        if (!redoStack || redoStack.length === 0) return;

        const snapshot = redoStack.pop()!;

        // Push back to undo
        if (!this.undoStacks.has(cellId)) {
            this.undoStacks.set(cellId, []);
        }
        this.undoStacks.get(cellId)!.push(snapshot);

        // Apply the new content
        if (this.applier) {
            this.applier(cellId, snapshot.newContent);
        }
    }

    canUndo(cellId: number): boolean {
        const stack = this.undoStacks.get(cellId);
        return !!stack && stack.length > 0;
    }

    canRedo(cellId: number): boolean {
        const stack = this.redoStacks.get(cellId);
        return !!stack && stack.length > 0;
    }

    /** Clear stacks for a specific cell */
    clearCell(cellId: number): void {
        this.undoStacks.delete(cellId);
        this.redoStacks.delete(cellId);
    }

    /** Clear everything */
    clearAll(): void {
        this.undoStacks.clear();
        this.redoStacks.clear();
    }
}

export const textUndoManager = new TextUndoManager();
