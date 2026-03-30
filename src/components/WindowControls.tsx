import React, { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './WindowControls.css';

export const WindowControls: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);
    const appWindow = getCurrentWindow();

    const checkMaximized = async () => {
        try {
            const max = await appWindow.isMaximized();
            setIsMaximized(max);
        } catch (e) {
            console.error("Window check error", e);
        }
    };

    useEffect(() => {
        checkMaximized();
        const unlisten = appWindow.onResized(() => {
            checkMaximized();
        });
        return () => {
            unlisten.then(f => f()).catch(() => { });
        };
    }, []);

    const handleMinimize = async () => {
        try {
            await appWindow.minimize();
        } catch (e) {
            console.error("Minimize error", e);
        }
    };

    const handleToggleMaximize = async () => {
        try {
            await appWindow.toggleMaximize();
            checkMaximized();
        } catch (e) {
            console.error("Toggle maximize error", e);
        }
    };

    const handleClose = async () => {
        try {
            await appWindow.close();
        } catch (e) {
            console.error("Close error", e);
        }
    };

    // The data-tauri-drag-region rule is vital: Buttons must NOT have the region!
    // Tauri handles this implicitly, but explicitly making it transparent is fine.
    return (
        <div className="window-controls">
            <button className="window-btn" onClick={handleMinimize} title="Minimize">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <rect x="1" y="4" width="8" height="1" fill="currentColor" />
                </svg>
            </button>
            <button className="window-btn" onClick={handleToggleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
                {isMaximized ? (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2.5 1h6.5v6.5h-1v-5.5h-5.5v-1z" fill="currentColor" />
                        <path d="M1 2.5h6.5v6.5h-6.5v-6.5z" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                        <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
                    </svg>
                )}
            </button>
            <button className="window-btn window-btn--close" onClick={handleClose} title="Close">
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1 1l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
};
