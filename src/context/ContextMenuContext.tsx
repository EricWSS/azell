import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import ContextMenu, { ContextMenuState, MenuItemDef } from '../components/ContextMenu';

interface ContextMenuContextType {
    showMenu: (x: number, y: number, items: MenuItemDef[]) => void;
    hideMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

export const useContextMenu = () => {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) {
        throw new Error("useContextMenu must be used within a ContextMenuProvider");
    }
    return ctx;
};

export const ContextMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [menuState, setMenuState] = useState<ContextMenuState | null>(null);

    const showMenu = useCallback((x: number, y: number, items: MenuItemDef[]) => {
        setMenuState({ x, y, items });
    }, []);

    const hideMenu = useCallback(() => {
        setMenuState(null);
    }, []);

    const value = useMemo(() => ({ showMenu, hideMenu }), [showMenu, hideMenu]);

    return (
        <ContextMenuContext.Provider value={value}>
            {children}
            <ContextMenu state={menuState} onClose={hideMenu} />
        </ContextMenuContext.Provider>
    );
};
