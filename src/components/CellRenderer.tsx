import React from "react";
import type { Cell } from "../types";
import MarkdownCell from "./MarkdownCell";
import ImageCell from "./ImageCell";
import CellMenu from "./CellMenu";

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
        const handleDelete = React.useCallback(() => {
            onDelete(cell.id);
        }, [cell.id, onDelete]);

        return (
            <div className="cell-wrapper">
                {cell.cell_type === 0 ? (
                    <MarkdownCell
                        cell={cell}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onInsertRender={() => onCellUpdated?.(cell)}
                        onContentChange={onContentChange}
                    />
                ) : (
                    <ImageCell cell={cell} onCellUpdated={onCellUpdated} />
                )}
                <div className="cell-actions">
                    <CellMenu
                        cellId={cell.id}
                        onDuplicate={onDuplicate}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                    />
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

