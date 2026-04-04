export interface WorkspaceActions {
    newWorkspace: () => void;
    closeWorkspace: () => void;
}

let registeredActions: WorkspaceActions | null = null;

export function registerWorkspaceActions(actions: WorkspaceActions): void {
    registeredActions = actions;
}

export function unregisterWorkspaceActions(): void {
    registeredActions = null;
}

export function dispatchNewWorkspace(): void {
    registeredActions?.newWorkspace();
}

export function dispatchCloseWorkspace(): void {
    registeredActions?.closeWorkspace();
}
