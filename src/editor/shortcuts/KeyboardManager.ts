import { globalHistory } from "../history/GlobalHistoryManager";
import {
    dispatchDeleteCell,
    dispatchDuplicateCell,
    dispatchMoveCellUp,
    dispatchMoveCellDown,
} from "../CellActionDispatcher";
import { dispatchNewWorkspace } from "../WorkspaceActionDispatcher";

// ── Shortcut Definition ──

export interface ShortcutDef {
    id: string;
    label: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    key: string;
    /** If true, this shortcut fires even when the user is typing in a textarea/input */
    allowInTextInput?: boolean;
    handler: () => void;
}

// ── Default Shortcuts ──

const shortcuts: ShortcutDef[] = [
    // ── Undo / Redo ──
    {
        id: "undo",
        label: "Undo",
        ctrl: true,
        key: "z",
        // allowInTextInput is false to permit the native OS text-undo to work inside cells
        handler: () => { globalHistory.undo(); },
    },
    {
        id: "redo",
        label: "Redo",
        ctrl: true,
        shift: true,
        key: "z",
        handler: () => { globalHistory.redo(); },
    },
    {
        id: "redo_y",
        label: "Redo",
        ctrl: true,
        key: "y",
        handler: () => { globalHistory.redo(); },
    },

    // ── Cell Manipulation (only outside text inputs) ──
    {
        id: "delete_cell",
        label: "Delete Cell",
        ctrl: true,
        shift: true,
        key: "d",
        handler: () => { dispatchDeleteCell(); },
    },
    {
        id: "duplicate_cell",
        label: "Duplicate Cell",
        ctrl: true,
        shift: true,
        key: "c",
        handler: () => { dispatchDuplicateCell(); },
    },
    {
        id: "move_cell_up",
        label: "Move Cell Up",
        alt: true,
        key: "ArrowUp",
        handler: () => { dispatchMoveCellUp(); },
    },
    {
        id: "move_cell_down",
        label: "Move Cell Down",
        alt: true,
        key: "ArrowDown",
        handler: () => { dispatchMoveCellDown(); },
    },

    // ── Workspace Manipulation ──
    {
        id: "new_workspace",
        label: "New Workspace",
        ctrl: true,
        key: "n",
        handler: () => { dispatchNewWorkspace(); },
    },

];

// ── Keyboard Manager ──

function matchShortcut(e: KeyboardEvent, def: ShortcutDef): boolean {
    if (def.ctrl && !e.ctrlKey && !e.metaKey) return false;
    if (!def.ctrl && (e.ctrlKey || e.metaKey)) return false;
    if (def.shift && !e.shiftKey) return false;
    if (!def.shift && e.shiftKey) return false;
    if (def.alt && !e.altKey) return false;
    if (!def.alt && e.altKey) return false;
    return e.key.toLowerCase() === def.key.toLowerCase();
}

function handleKeyDown(e: KeyboardEvent): void {
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
    if (!hasModifier) return;

    const activeEl = document.activeElement as HTMLElement;
    const isEditing = activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT' || activeEl.isContentEditable);

    for (const def of shortcuts) {
        if (!matchShortcut(e, def)) continue;

        if (def.id === "undo" || def.id === "redo" || def.id === "redo_y") {
            if (isEditing) {
                // DO NOT intercept: let the browser handle native text undo/redo
                return;
            } else {
                // Not editing: let the global history handle it
                e.preventDefault();
                e.stopPropagation();
                def.handler();
                return;
            }
        }

        // Generic block for other shortcuts
        if (isEditing && !def.allowInTextInput) continue;

        e.preventDefault();
        e.stopPropagation();
        def.handler();
        return;
    }
}

let isAttached = false;

export function attachKeyboardManager(): void {
    if (isAttached) return;
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    isAttached = true;
}

export function detachKeyboardManager(): void {
    if (!isAttached) return;
    window.removeEventListener("keydown", handleKeyDown, { capture: true });
    isAttached = false;
}

export function registerShortcut(def: ShortcutDef): () => void {
    shortcuts.push(def);
    return () => {
        const idx = shortcuts.indexOf(def);
        if (idx >= 0) shortcuts.splice(idx, 1);
    };
}

export function getShortcuts(): readonly ShortcutDef[] {
    return shortcuts;
}
