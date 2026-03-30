import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import './ThemeSettings.css';

interface Props {
    onClose: () => void;
}

export const ThemeSettings: React.FC<Props> = ({ onClose }) => {
    const { theme, updateTheme, resetTheme } = useTheme();

    return (
        <div className="theme-modal-overlay">
            <div className="theme-modal">
                <header className="theme-modal-header">
                    <h3>Theme Preferences</h3>
                    <button onClick={onClose} className="theme-modal-close">×</button>
                </header>

                <div className="theme-modal-body">
                    <div className="theme-setting-row">
                        <label>Primary Background</label>
                        <input
                            type="color"
                            value={theme.background_primary}
                            onChange={e => updateTheme({ background_primary: e.target.value })}
                        />
                    </div>
                    <div className="theme-setting-row">
                        <label>Sidebar & Surface</label>
                        <input
                            type="color"
                            value={theme.background_secondary}
                            onChange={e => updateTheme({ background_secondary: e.target.value })}
                        />
                    </div>
                    <div className="theme-setting-row">
                        <label>Base Text</label>
                        <input
                            type="color"
                            value={theme.text_primary}
                            onChange={e => updateTheme({ text_primary: e.target.value })}
                        />
                    </div>
                    <div className="theme-setting-row">
                        <label>Dimmed Text</label>
                        <input
                            type="color"
                            value={theme.text_secondary}
                            onChange={e => updateTheme({ text_secondary: e.target.value })}
                        />
                    </div>
                    <div className="theme-setting-row">
                        <label>Borders & Dividers</label>
                        <input
                            type="color"
                            value={theme.border_color}
                            onChange={e => updateTheme({ border_color: e.target.value })}
                        />
                    </div>
                    <div className="theme-setting-row">
                        <label>Accent Color</label>
                        <input
                            type="color"
                            value={theme.accent_color}
                            onChange={e => updateTheme({ accent_color: e.target.value })}
                        />
                    </div>
                </div>

                <footer className="theme-modal-footer">
                    <button onClick={resetTheme} className="theme-btn-reset">Reset to Defaults</button>
                    <button onClick={onClose} className="theme-btn-done">Done</button>
                </footer>
            </div>
        </div>
    );
};
