import React from "react";
import type { Cell } from "../types";
import MarkdownCell from "./MarkdownCell";
import ImageCell from "./ImageCell";
import { useContextMenu } from "../context/ContextMenuContext";

interface Props {
    cell: Cell;
    onDelete: (id: number) => void;
    onDuplicate: (id: number) => void;
    onMoveUp: (id: number) => void;
    onMoveDown: (id: number) => void;
    onCellUpdated?: (updated: Cell) => void;
    onContentChange?: (id: number, content: string) => void;
}

const CellRenderer: React.FC<Props> = React.memo(
    ({ cell, onDelete, onDuplicate, onMoveUp, onMoveDown, onCellUpdated, onContentChange }) => {
        const { showMenu } = useContextMenu();

        const handleDelete = React.useCallback(() => {
            onDelete(cell.id);
        }, [cell.id, onDelete]);

        const openCellMenu = React.useCallback((e: React.MouseEvent) => {
            e.stopPropagation();
            // Optional: MD / Text Cells can also right click anywhere to see this.
            // But doing it on the dots is explicit.
            showMenu(e.clientX, e.clientY, [
                { id: "duplicate", label: "Duplicate Cell", icon: "📋", action: () => onDuplicate(cell.id) },
                { id: "move-up", label: "Move Up", icon: "⬆️", action: () => onMoveUp(cell.id) },
                { id: "move-down", label: "Move Down", icon: "⬇️", action: () => onMoveDown(cell.id) },
                { id: "sep", separator: true },
                { id: "delete", label: "Delete Cell", icon: "🗑️", danger: true, action: () => onDelete(cell.id) }
            ]);
        }, [cell.id, onDuplicate, onMoveUp, onMoveDown, onDelete, showMenu]);

        return (
            <div className="cell-wrapper" onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openCellMenu(e);
            }}>
                {cell.cell_type === 0 ? (
                    <MarkdownCell
                        cell={cell}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onInsertRender={() => onCellUpdated?.(cell)}
                        onContentChange={onContentChange}
                    />
                ) : (
                    <ImageCell
                        cell={cell}
                        onCellUpdated={onCellUpdated}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                    />
                )}
                <div className="cell-actions">
                    <button
                        className="cell-menu__trigger"
                        onClick={openCellMenu}
                        title="Ações da célula"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px', color: 'inherit' }}
                    >
                        ⋮
                    </button>
                    <button className="cell__delete" onClick={handleDelete} title="Excluir célula">
                        ×
                    </button>
                </div>
            </div>
        );
    }
);

CellRenderer.displayName = "CellRenderer";
export default CellRenderer;

