import { useCallback } from "react";

/**
 * Returns onDragOver and onDrop handlers for image drag-and-drop.
 * Converts dropped image files to byte arrays and calls onImage.
 */
export function useImageDrop(
    onImage: (bytes: number[]) => void
) {
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith("image/")) {
                    file.arrayBuffer().then((buf) => {
                        onImage(Array.from(new Uint8Array(buf)));
                    });
                    return;
                }
            }
        },
        [onImage]
    );

    return { onDragOver, onDrop };
}
