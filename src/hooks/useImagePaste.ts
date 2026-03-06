import { useEffect, useCallback } from "react";

/**
 * Listens for Ctrl+V paste events containing images.
 * Converts to byte array and calls onImage.
 */
export function useImagePaste(
    onImage: (bytes: number[]) => void,
    enabled: boolean
) {
    const handler = useCallback(
        (e: ClipboardEvent) => {
            if (!enabled || !e.clipboardData) return;
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                    e.preventDefault();
                    const blob = items[i].getAsFile();
                    if (!blob) return;
                    blob.arrayBuffer().then((buf) => {
                        onImage(Array.from(new Uint8Array(buf)));
                    });
                    return;
                }
            }
        },
        [onImage, enabled]
    );

    useEffect(() => {
        if (!enabled) return;
        window.addEventListener("paste", handler);
        return () => window.removeEventListener("paste", handler);
    }, [handler, enabled]);
}
