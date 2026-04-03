type Listener = () => void;

class TrashStore {
    private hiddenWorkspaces = new Set<number>();
    private hiddenTabs = new Set<number>();
    private hiddenCells = new Set<number>();
    private listeners = new Set<Listener>();

    // Cached snapshot to prevent useSyncExternalStore infinite loops
    // Initial clones
    private snapshot = {
        workspaces: new Set<number>(),
        tabs: new Set<number>(),
        cells: new Set<number>()
    };

    // ── Workspaces ──
    softDeleteWorkspace(id: number) {
        this.hiddenWorkspaces.add(id);
        this.notify();
    }
    restoreWorkspace(id: number) {
        this.hiddenWorkspaces.delete(id);
        this.notify();
    }
    isHiddenWorkspace(id: number) {
        return this.hiddenWorkspaces.has(id);
    }
    getHiddenWorkspaces() {
        return Array.from(this.hiddenWorkspaces);
    }

    // ── Tabs ──
    softDeleteTab(id: number) {
        this.hiddenTabs.add(id);
        this.notify();
    }
    restoreTab(id: number) {
        this.hiddenTabs.delete(id);
        this.notify();
    }
    isHiddenTab(id: number) {
        return this.hiddenTabs.has(id);
    }
    getHiddenTabs() {
        return Array.from(this.hiddenTabs);
    }

    // ── Cells ──
    softDeleteCell(id: number) {
        this.hiddenCells.add(id);
        this.notify();
    }
    restoreCell(id: number) {
        this.hiddenCells.delete(id);
        this.notify();
    }
    isHiddenCell(id: number) {
        return this.hiddenCells.has(id);
    }
    getHiddenCells() {
        return Array.from(this.hiddenCells);
    }

    // ── Pub/Sub ──
    subscribe = (listener: Listener): () => void => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    private notify() {
        // Regenerate the snapshot object AND clone the Sets so React 
        // detects reference changes inside useMemo dependencies.
        this.snapshot = {
            workspaces: new Set(this.hiddenWorkspaces),
            tabs: new Set(this.hiddenTabs),
            cells: new Set(this.hiddenCells)
        };
        this.listeners.forEach(fn => fn());
    }

    // React useSyncExternalStore Snapshot helpers
    getSnapshot = () => {
        return this.snapshot;
    };
}

export const trashStore = new TrashStore();
