export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
    const clamp = (n: number) => Math.max(0, Math.min(255, n));
    return "#" + (1 << 24 | clamp(r) << 16 | clamp(g) << 8 | clamp(b)).toString(16).slice(1).toUpperCase();
}

export function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function isLight(hex: string): boolean {
    const rgb = hexToRgb(hex);
    if (!rgb) return false;
    return getLuminance(rgb.r, rgb.g, rgb.b) > 0.179;
}

export function lighten(hex: string, percent: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const amount = Math.floor(255 * (percent / 100));
    return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount);
}

export function darken(hex: string, percent: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const amount = Math.floor(255 * (percent / 100));
    return rgbToHex(rgb.r - amount, rgb.g - amount, rgb.b - amount);
}

export function applyOpacity(hex: string, opacity: number): string {
    const o = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
    return hex + o.toString(16).padStart(2, '0').toUpperCase();
}

export function getContrastColor(hexBg: string): string {
    return isLight(hexBg) ? "#1A1C28" : "#F5F5F2";
}

export function getMutedContrastColor(hexBg: string): string {
    return isLight(hexBg) ? "#6B6F82" : "#8B8FA8";
}
