/**
 * CellActionDispatcher — global bridge between keyboard shortcuts / menu bar
 * and the CellsContainer's action handlers.
 *
 * CellsContainer registers its handlers on mount.
 * KeyboardManager and menu bar call the dispatch functions.
 */

export interface CellActions {
    deleteCell: () => void;
    duplicateCell: () => void;
    moveCellUp: () => void;
    moveCellDown: () => void;
    getSelectedCellId: () => number | null;
}

let registeredActions: CellActions | null = null;

export function registerCellActions(actions: CellActions): void {
    registeredActions = actions;
}

export function unregisterCellActions(): void {
    registeredActions = null;
}

export function dispatchDeleteCell(): void {
    registeredActions?.deleteCell();
}

export function dispatchDuplicateCell(): void {
    registeredActions?.duplicateCell();
}

export function dispatchMoveCellUp(): void {
    registeredActions?.moveCellUp();
}

export function dispatchMoveCellDown(): void {
    registeredActions?.moveCellDown();
}

export function getSelectedCellId(): number | null {
    return registeredActions?.getSelectedCellId() ?? null;
}
