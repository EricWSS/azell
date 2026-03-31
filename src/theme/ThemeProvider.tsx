import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeStorage } from './types';
import { PRESETS, AZELL_DEFAULT } from './presets';
import { lighten, darken, isLight, applyOpacity, getContrastColor, getMutedContrastColor } from './utils';

interface ThemeContextType {
    theme: Theme;
    activeThemeId: string;
    customThemes: Theme[];
    updateTheme: (newTheme: Partial<Theme>) => void;
    setThemeById: (id: string) => void;
    saveCustomTheme: (theme: Theme) => void;
    deleteCustomTheme: (id: string) => void;
    resetTheme: () => void;
    importTheme: (jsonStr: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = 'azell_theme_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storage, setStorage] = useState<ThemeStorage>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.activeThemeId) return parsed as ThemeStorage;
            } catch (e) {
                console.warn("Failed to parse stored theme v2", e);
            }
        }
        return {
            activeThemeId: AZELL_DEFAULT.id,
            customThemes: []
        };
    });

    // Derived active theme
    const theme = React.useMemo(() => {
        const preset = PRESETS.find(p => p.id === storage.activeThemeId);
        if (preset) return preset;
        const custom = storage.customThemes.find(c => c.id === storage.activeThemeId);
        if (custom) return custom;
        return AZELL_DEFAULT;
    }, [storage]);

    // Sync to local variable
    useEffect(() => {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(storage));
    }, [storage]);

    const updateTheme = (newThemeData: Partial<Theme>) => {
        setStorage(prev => {
            // If editing a preset, fork it to a custom theme instantly
            let active = [...prev.customThemes].find(t => t.id === prev.activeThemeId);
            let newCustomThemes = [...prev.customThemes];
            let newActiveId = prev.activeThemeId;

            if (!active) {
                const basePreset = PRESETS.find(p => p.id === prev.activeThemeId) || AZELL_DEFAULT;
                active = { ...basePreset, id: `custom-${Date.now()}`, name: `Custom (${basePreset.name})` };
                newCustomThemes.push(active);
                newActiveId = active.id;
            }

            // Update the custom theme
            const updatedTheme = { ...active, ...newThemeData };
            newCustomThemes = newCustomThemes.map(t => t.id === newActiveId ? updatedTheme : t);

            return {
                activeThemeId: newActiveId,
                customThemes: newCustomThemes
            };
        });
    };

    const setThemeById = (id: string) => {
        setStorage(prev => ({ ...prev, activeThemeId: id }));
    };

    const saveCustomTheme = (t: Theme) => {
        setStorage(prev => ({
            ...prev,
            customThemes: [...prev.customThemes.filter(c => c.id !== t.id), t],
            activeThemeId: t.id
        }));
    };

    const deleteCustomTheme = (id: string) => {
        setStorage(prev => {
            const remaining = prev.customThemes.filter(c => c.id !== id);
            return {
                customThemes: remaining,
                activeThemeId: prev.activeThemeId === id ? AZELL_DEFAULT.id : prev.activeThemeId
            };
        });
    };

    const resetTheme = () => {
        setStorage({
            activeThemeId: AZELL_DEFAULT.id,
            customThemes: []
        });
    };

    const importTheme = (jsonStr: string) => {
        try {
            const parsed = JSON.parse(jsonStr) as Theme;
            if (parsed.background_primary && parsed.accent_color) {
                parsed.id = `imported-${Date.now()}`;
                if (!parsed.name) parsed.name = "Imported Theme";
                saveCustomTheme(parsed);
            } else {
                alert("Invalid theme JSON structure.");
            }
        } catch (e) {
            console.error("Failed to parse theme JSON", e);
            alert("Invalid JSON file formatting.");
        }
    };

    useEffect(() => {
        const root = document.documentElement;
        const isBgLight = isLight(theme.background_primary);

        // Core semantics
        root.style.setProperty('--bg-primary', theme.background_primary);
        root.style.setProperty('--bg-secondary', theme.background_secondary);

        // Auto contrast enforcement (WCAG check algorithm)
        const safeText = (isLight(theme.background_primary) === isLight(theme.text_primary))
            ? getContrastColor(theme.background_primary)
            : theme.text_primary;

        const safeTextDim = (isLight(theme.background_secondary) === isLight(theme.text_secondary))
            ? getMutedContrastColor(theme.background_secondary)
            : theme.text_secondary;

        root.style.setProperty('--text-primary', safeText);
        root.style.setProperty('--text-secondary', safeTextDim);
        root.style.setProperty('--border-color', theme.border_color);
        root.style.setProperty('--accent', theme.accent_color);

        // Derived utility variables mathematically mapped
        root.style.setProperty('--accent-hover', isBgLight ? darken(theme.accent_color, 12) : lighten(theme.accent_color, 12));
        root.style.setProperty('--bg-hover', applyOpacity(theme.accent_color, 0.08));
        root.style.setProperty('--bg-active', applyOpacity(theme.accent_color, 0.15));
        root.style.setProperty('--bg-elevated', isBgLight ? darken(theme.background_primary, 4) : lighten(theme.background_primary, 6));

    }, [theme]);

    const contextValue = {
        theme,
        activeThemeId: storage.activeThemeId,
        customThemes: storage.customThemes,
        updateTheme,
        setThemeById,
        saveCustomTheme,
        deleteCustomTheme,
        resetTheme,
        importTheme
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
