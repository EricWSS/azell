import { Command } from "./Command";

const MAX_HISTORY = 100;

export class GlobalHistoryManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];
    private listeners: Set<() => void> = new Set();
    private isExecuting = false;

    /** 
     * Pushes a completed command onto the stack.
     * Clears the redo stack.
     */
    push(command: Command) {
        if (this.isExecuting) return; // Prevent infinite loops if commands trigger events

        this.undoStack.push(command);
        if (this.undoStack.length > MAX_HISTORY) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.notify();
        console.log(`[GlobalHistory] Pushed command. UndoStack: ${this.undoStack.length}`);
    }

    /** Reverses the last action */
    async undo(): Promise<void> {
        if (this.isExecuting || this.undoStack.length === 0) return;
        this.isExecuting = true;

        try {
            const command = this.undoStack.pop()!;
            this.redoStack.push(command);

            console.log(`[GlobalHistory] Undoing command...`);
            await command.undo();

            this.notify();
        } catch (err) {
            console.error("[GlobalHistory] Undo failed:", err);
        } finally {
            this.isExecuting = false;
        }
    }

    /** Re-applies the last undone action */
    async redo(): Promise<void> {
        if (this.isExecuting || this.redoStack.length === 0) return;
        this.isExecuting = true;

        try {
            const command = this.redoStack.pop()!;
            this.undoStack.push(command);

            console.log(`[GlobalHistory] Redoing command...`);
            await command.execute();

            this.notify();
        } catch (err) {
            console.error("[GlobalHistory] Redo failed:", err);
        } finally {
            this.isExecuting = false;
        }
    }

    get canUndo() { return this.undoStack.length > 0; }
    get canRedo() { return this.redoStack.length > 0; }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.notify();
    }

    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((fn) => fn());
    }
}

// Global Singleton Instance
export const globalHistory = new GlobalHistoryManager();
