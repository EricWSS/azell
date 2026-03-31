import React, { useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { PRESETS, AZELL_DEFAULT } from '../theme/presets';
import './ThemeSettings.css';

interface Props {
    onClose: () => void;
}

export const ThemeSettings: React.FC<Props> = ({ onClose }) => {
    const { theme, activeThemeId, customThemes, updateTheme, setThemeById, importTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `azell-theme-${theme.id}.json`);
        dlAnchorElem.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    importTheme(event.target.result as string);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="theme-modal-overlay">
            <div className="theme-modal">
                <header className="theme-modal-header">
                    <h3>Theme Preferences</h3>
                    <button onClick={onClose} className="theme-modal-close">×</button>
                </header>

                <div className="theme-modal-body">
                    <div className="theme-preset-selector">
                        <select
                            value={activeThemeId}
                            onChange={(e) => setThemeById(e.target.value)}
                            className="theme-select"
                        >
                            <optgroup label="Presets">
                                {PRESETS.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </optgroup>
                            {customThemes.length > 0 && (
                                <optgroup label="Custom Themes">
                                    {customThemes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>

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

                    <div className="theme-io-actions">
                        <button onClick={handleExport} className="theme-btn-io">Export JSON</button>
                        <button onClick={handleImportClick} className="theme-btn-io">Import JSON</button>
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <footer className="theme-modal-footer">
                    <button onClick={() => setThemeById(AZELL_DEFAULT.id)} className="theme-btn-reset">Reset to Default</button>
                    <button onClick={onClose} className="theme-btn-done">Done</button>
                </footer>
            </div>
        </div>
    );
};
