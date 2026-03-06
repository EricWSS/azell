import { useEffect } from "react";
import { attachKeyboardManager, detachKeyboardManager } from "./KeyboardManager";

/**
 * Hook that initializes the global keyboard shortcut listener.
 * Mount this ONCE at the root editor component.
 */
export function useKeyboardShortcuts(): void {
    useEffect(() => {
        attachKeyboardManager();
        return () => detachKeyboardManager();
    }, []);
}
