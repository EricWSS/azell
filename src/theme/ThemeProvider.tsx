import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, defaultTheme } from './types';

interface ThemeContextType {
    theme: Theme;
    updateTheme: (newTheme: Partial<Theme>) => void;
    resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'azell_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
            try {
                return { ...defaultTheme, ...JSON.parse(stored) };
            } catch (e) {
                console.warn("Failed to parse stored theme", e);
            }
        }
        return defaultTheme;
    });

    const updateTheme = (newThemeData: Partial<Theme>) => {
        setTheme(prev => {
            const updated = { ...prev, ...newThemeData };
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const resetTheme = () => {
        setTheme(defaultTheme);
        localStorage.removeItem(THEME_STORAGE_KEY);
    };

    useEffect(() => {
        const root = document.documentElement;
        // Map our semantic tokens natively to the CSS engine
        root.style.setProperty('--bg-primary', theme.background_primary);
        root.style.setProperty('--bg-secondary', theme.background_secondary);
        root.style.setProperty('--text-primary', theme.text_primary);
        root.style.setProperty('--text-secondary', theme.text_secondary);
        root.style.setProperty('--border-color', theme.border_color);
        root.style.setProperty('--accent', theme.accent_color);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
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
