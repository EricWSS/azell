export interface Theme {
    id: string;
    name: string;
    background_primary: string;
    background_secondary: string;
    text_primary: string;
    text_secondary: string;
    border_color: string;
    accent_color: string;
}

export interface ThemeStorage {
    activeThemeId: string;
    customThemes: Theme[];
}

export const defaultTheme: Theme = {
    id: "azell-default",
    name: "AZELL Default",
    background_primary: "#0F1115",    // Deep Obsidian
    background_secondary: "#161822",  // Lighter dark for sidebar/surface
    text_primary: "#F5F5F2",          // White Ash
    text_secondary: "#8b8fa8",        // Dimmed text
    border_color: "#2A2D34",          // Subtle gray
    accent_color: "#7c6bf6",          // Vibrant purple accent
};
