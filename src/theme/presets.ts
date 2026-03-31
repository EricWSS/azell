import { Theme } from './types';

export const AZELL_DEFAULT: Theme = {
    id: "azell-default",
    name: "AZELL Default",
    background_primary: "#0F1115",
    background_secondary: "#161822",
    text_primary: "#F5F5F2",
    text_secondary: "#8B8FA8",
    border_color: "#2A2D34",
    accent_color: "#7C6BF6",
};

export const LIGHT_THEME: Theme = {
    id: "light-theme",
    name: "Light Layout",
    background_primary: "#F5F6FA",
    background_secondary: "#EBEDF5",
    text_primary: "#1A1C28",
    text_secondary: "#6B6F82",
    border_color: "#CCD0DE",
    accent_color: "#6354D9",
};

export const DARK_THEME: Theme = {
    id: "dark-theme",
    name: "Deep Dark",
    background_primary: "#090A0C",
    background_secondary: "#111317",
    text_primary: "#E2E4E9",
    text_secondary: "#7A808C",
    border_color: "#1E2129",
    accent_color: "#5C67F2",
};

export const HIGH_CONTRAST: Theme = {
    id: "high-contrast",
    name: "High Contrast",
    background_primary: "#000000",
    background_secondary: "#000000",
    text_primary: "#FFFFFF",
    text_secondary: "#CCCCCC",
    border_color: "#FFFFFF",
    accent_color: "#FFFF00",
};

export const PRESETS: Theme[] = [
    AZELL_DEFAULT,
    LIGHT_THEME,
    DARK_THEME,
    HIGH_CONTRAST
];
