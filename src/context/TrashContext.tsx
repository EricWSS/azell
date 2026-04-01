import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { trashStore } from '../store/TrashStore';

interface TrashContextType {
    hiddenWorkspaces: Set<number>;
    hiddenTabs: Set<number>;
    hiddenCells: Set<number>;
}

const TrashContext = createContext<TrashContextType | null>(null);

export const TrashProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // We use useSyncExternalStore to trigger re-renders exactly when TrashStore changes
    // It's CRITICAL to use direct stable references to avoid infinite React loops.
    const snapshot = useSyncExternalStore(
        trashStore.subscribe,
        trashStore.getSnapshot
    );

    return (
        <TrashContext.Provider value={{
            hiddenWorkspaces: snapshot.workspaces,
            hiddenTabs: snapshot.tabs,
            hiddenCells: snapshot.cells,
        }}>
            {children}
        </TrashContext.Provider>
    );
};

export function useTrash() {
    const context = useContext(TrashContext);
    if (!context) {
        throw new Error("useTrash must be used within a TrashProvider");
    }
    return context;
}
