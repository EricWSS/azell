import { textUndoManager } from "../undo/TextUndoManager";

const COMMIT_DELAY_MS = 500;

interface EditSession {
    cellId: number;
    startContent: string;
    currentContent: string;
    commitTimer: ReturnType<typeof setTimeout> | null;
}

class EditSessionManager {
    private session: EditSession | null = null;

    /**
     * Begin or continue an edit session for a cell.
     * Call this when the user enters edit mode.
     */
    startSession(cellId: number, initialContent: string): void {
        // If switching cells, commit the old session first
        if (this.session && this.session.cellId !== cellId) {
            this.commitSession();
        }

        // Only create a new session if there isn't one for this cell
        if (!this.session || this.session.cellId !== cellId) {
            this.session = {
                cellId,
                startContent: initialContent,
                currentContent: initialContent,
                commitTimer: null,
            };
        }
    }

    /**
     * Call on every keystroke. Updates the current content
     * and resets the auto-commit timer.
     */
    updateSession(newContent: string): void {
        if (!this.session) return;

        this.session.currentContent = newContent;

        // Reset the idle timer
        if (this.session.commitTimer) {
            clearTimeout(this.session.commitTimer);
        }

        this.session.commitTimer = setTimeout(() => {
            this.commitSession();
        }, COMMIT_DELAY_MS);
    }

    /**
     * Commit the current edit session to the TEXT undo stack.
     * Only pushes if content actually changed.
     */
    commitSession(): void {
        if (!this.session) return;

        const { cellId, startContent, currentContent, commitTimer } = this.session;

        // Clear pending timer
        if (commitTimer) {
            clearTimeout(commitTimer);
        }

        // Only push to text undo if content actually changed
        if (startContent !== currentContent) {
            textUndoManager.pushEdit(cellId, startContent, currentContent);
        }

        this.session = null;
    }

    /**
     * Cancel and discard the current session without committing.
     */
    cancelSession(): void {
        if (!this.session) return;

        if (this.session.commitTimer) {
            clearTimeout(this.session.commitTimer);
        }

        this.session = null;
    }

    /** Check if there's an active session */
    get hasActiveSession(): boolean {
        return this.session !== null;
    }

    /** Get the cell ID of the active session */
    get activeCellId(): number | null {
        return this.session?.cellId ?? null;
    }
}

// Singleton
export const editSessionManager = new EditSessionManager();
