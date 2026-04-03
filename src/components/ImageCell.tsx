import React from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useContextMenu } from "../context/ContextMenuContext";
import type { Cell } from "../types";
import { saveImageFile, updateCell } from "../services/api";

interface Props {
    cell: Cell;
    onCellUpdated?: (updated: Cell) => void;
    onDelete?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onMoveUp?: (id: number) => void;
    onMoveDown?: (id: number) => void;
}

const ImageCell: React.FC<Props> = React.memo(({ cell, onCellUpdated, onDelete, onDuplicate, onMoveUp, onMoveDown }) => {
    const [dragging, setDragging] = React.useState(false);
    const [localContent, setLocalContent] = React.useState(cell.content);
    const hasImage = localContent.length > 0;
    const src = React.useMemo(
        () => (hasImage ? convertFileSrc(localContent) : ""),
        [localContent, hasImage]
    );

    // Sync if parent updates cell
    React.useEffect(() => {
        setLocalContent(cell.content);
    }, [cell.content]);

    /** Save image bytes, update THIS cell's content — no new cell created */
    const handleImageBytes = React.useCallback(
        async (bytes: number[]) => {
            console.log("[ImageCell] saving image for cell", cell.id);
            try {
                const path = await saveImageFile(bytes);
                console.log("[ImageCell] image saved at:", path);
                await updateCell(cell.id, path);
                console.log("[ImageCell] cell updated with path");
                setLocalContent(path);
                if (onCellUpdated) {
                    onCellUpdated({ ...cell, content: path });
                }
            } catch (err) {
                console.error("[ImageCell] error:", err);
            }
        },
        [cell, onCellUpdated]
    );

    // ── Handle drop on empty cell ──
    const handleDragOver = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    }, []);

    const handleDragLeave = React.useCallback(() => {
        setDragging(false);
    }, []);

    const handleDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragging(false);
            const files = e.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith("image/")) {
                    file.arrayBuffer().then((buf) => {
                        handleImageBytes(Array.from(new Uint8Array(buf)));
                    });
                    return;
                }
            }
        },
        [handleImageBytes]
    );

    // ── Handle paste on empty cell ──
    const handlePaste = React.useCallback(
        (e: React.ClipboardEvent) => {
            if (hasImage) return;
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    const blob = items[i].getAsFile();
                    if (!blob) return;
                    blob.arrayBuffer().then((buf) => {
                        handleImageBytes(Array.from(new Uint8Array(buf)));
                    });
                    return;
                }
            }
        },
        [hasImage, handleImageBytes]
    );

    const [showCopyToast, setShowCopyToast] = React.useState(false);

    const handleCopyImage = React.useCallback(async () => {
        if (!hasImage || !localContent) return;
        try {
            // Priority: Read physical bytes via FS
            const { Image } = await import("@tauri-apps/api/image");
            const img = await Image.fromPath(localContent);
            console.log(`[ImageCell] RGBA Image Decoded from: ${localContent}`);

            // Gravar RGBA diretos no sistema nativo
            const { writeImage } = await import("@tauri-apps/plugin-clipboard-manager");
            await writeImage(img);
            console.log(`[ImageCell] Copiado com Sucesso para o OS via plugin.`);

            setShowCopyToast(true);
            setTimeout(() => setShowCopyToast(false), 2000);
        } catch (err) {
            console.error("[ImageCell] [CRITICAL] Copy Image via Image/Plugin Failed:", err);
        }
    }, [hasImage, localContent]);

    const { showMenu } = useContextMenu();

    const handleContextMenu = React.useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        showMenu(e.clientX, e.clientY, [
            { id: 'copy', label: 'Copy Image', icon: '📋', action: handleCopyImage },
            { id: 'sep1', separator: true },
            { id: 'delete', label: 'Delete Cell', icon: '🗑️', danger: true, action: () => onDelete?.(cell.id) },
            { id: 'move-up', label: 'Move Up', icon: '⬆️', action: () => onMoveUp?.(cell.id) },
            { id: 'move-down', label: 'Move Down', icon: '⬇️', action: () => onMoveDown?.(cell.id) },
            { id: 'duplicate', label: 'Duplicate Cell', icon: '📋', action: () => onDuplicate?.(cell.id) },
        ]);
    }, [cell.id, handleCopyImage, onDelete, onDuplicate, onMoveUp, onMoveDown, showMenu]);

    if (!hasImage) {
        return (
            <div
                className={`cell cell--image cell--dropzone${dragging ? " cell--dropzone-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
                tabIndex={0}
            >
                <div className="cell__badge">IMG</div>
                <div className="cell__dropzone-content">
                    <span className="cell__dropzone-icon">🖼️</span>
                    <span className="cell__dropzone-text">
                        Cole (Ctrl+V) ou arraste uma imagem aqui
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="cell cell--image" onContextMenu={handleContextMenu}>
            <div className="cell__badge">IMG</div>
            <img
                className="cell__image"
                src={src}
                alt="cell image"
                style={{ display: "block", height: "auto", width: "100%" }}
                onLoad={() => {
                    // Force react-virtual to recalculate layout after image is fully loaded
                    window.dispatchEvent(new Event("resize"));
                }}
                onError={(e) => console.error("[ImageCell] img load error, src:", (e.target as HTMLImageElement).src)}
            />
            {showCopyToast && (
                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(0,0,0,0.75)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    pointerEvents: "none",
                    animation: "fadeIn 0.2s ease",
                    zIndex: 10
                }}>
                    Image copied to clipboard!
                </div>
            )}
        </div>
    );
});

ImageCell.displayName = "ImageCell";
export default ImageCell;
