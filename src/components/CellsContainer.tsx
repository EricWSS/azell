import React from "react";
import type { Cell } from "../types";
import {
    getCells, createCell, deleteCell, saveImageCell,
    duplicateCell, moveCellUp, moveCellDown,
} from "../services/api";
import CellRenderer from "./CellRenderer";
import InsertCellButton from "./InsertCellButton";
import { useImagePaste } from "../hooks/useImagePaste";
import { useImageDrop } from "../hooks/useImageDrop";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useHistory } from "../editor/history/useHistory";
import { registerCellActions, unregisterCellActions } from "../editor/CellActionDispatcher";

// ── Title Cell Detection ──

/**
 * A cell is a "title cell" if its content is exactly ONE line starting with "# ".
 */
function isTitleCell(cell: Cell): boolean {
    if (cell.cell_type !== 0) return false; // only markdown
    const content = cell.content.trim();
    if (!content.startsWith("# ")) return false;
    // Must be a single line (no newlines)
    return !content.includes("\n");
}

// ── Component ──

interface Props {
    tabId: number | null;
}

const CellsContainer: React.FC<Props> = ({ tabId }) => {
    const [cells, setCells] = React.useState<Cell[]>([]);
    const [selectedCellId, setSelectedCellId] = React.useState<number | null>(null);
    const [collapsedSections, setCollapsedSections] = React.useState<Set<number>>(new Set());
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const reload = React.useCallback(() => {
        if (tabId === null) return;
        getCells(tabId).then(setCells);
    }, [tabId]);

    // ── History (Undo / Redo) ──
    const {
        trackInsert,
        trackDelete,
        trackMove,
    } = useHistory(reload);

    React.useEffect(() => {
        if (tabId === null) {
            setCells([]);
            setSelectedCellId(null);
            setCollapsedSections(new Set());
            return;
        }
        getCells(tabId).then(setCells);
    }, [tabId]);

    // Auto-select first cell when cells load and nothing is selected
    React.useEffect(() => {
        if (cells.length > 0 && selectedCellId === null) {
            setSelectedCellId(cells[0].id);
        }
        if (selectedCellId !== null && !cells.find(c => c.id === selectedCellId)) {
            setSelectedCellId(cells.length > 0 ? cells[0].id : null);
        }
    }, [cells, selectedCellId]);

    // ── Toggle collapse ──
    const toggleCollapse = React.useCallback((cellId: number) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(cellId)) {
                next.delete(cellId);
            } else {
                next.add(cellId);
            }
            return next;
        });
    }, []);

    // ── Compute visible cells (hide cells under collapsed title sections) ──
    const visibleCells = React.useMemo(() => {
        const result: Cell[] = [];
        let hiding = false;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const isTitle = isTitleCell(cell);

            if (isTitle) {
                // Any title cell ends the current hidden section
                hiding = false;
                result.push(cell);
                // If this title is collapsed, start hiding subsequent cells
                if (collapsedSections.has(cell.id)) {
                    hiding = true;
                }
            } else {
                if (!hiding) {
                    result.push(cell);
                }
            }
        }

        return result;
    }, [cells, collapsedSections]);

    // ── Global Ctrl+V paste ──
    const handleGlobalImageBytes = React.useCallback(
        (bytes: number[]) => {
            if (tabId === null) return;
            saveImageCell(tabId, bytes).then((cell) => {
                trackInsert(cell);
                reload();
            });
        },
        [tabId, reload, trackInsert]
    );
    useImagePaste(handleGlobalImageBytes, tabId !== null);

    const { onDragOver, onDrop } = useImageDrop(handleGlobalImageBytes);

    // ── Cell updated callback ──
    const handleCellUpdated = React.useCallback(
        (updated: Cell) => {
            setCells((prev) => {
                const filtered = prev.filter(
                    (c) => c.id !== updated.id && c.position !== updated.position
                );
                const next = [...filtered, updated];
                next.sort((a, b) => a.position - b.position);
                return next;
            });
        },
        []
    );

    // ── Cell content change (updates local state for title detection) ──
    const handleContentChange = React.useCallback(
        (id: number, content: string) => {
            setCells((prev) =>
                prev.map((c) => (c.id === id ? { ...c, content } : c))
            );
        },
        []
    );

    // ── Cell actions (with history tracking) ──
    const handleDelete = React.useCallback(
        (id: number) => {
            if (cells.length <= 1) return;
            const cellToDelete = cells.find((c) => c.id === id);
            const cellIndex = cells.findIndex((c) => c.id === id);
            deleteCell(id).then(() => {
                if (cellToDelete) trackDelete(cellToDelete);
                setCells((prev) => prev.filter((c) => c.id !== id));
                const nextIdx = cellIndex < cells.length - 1 ? cellIndex + 1 : cellIndex - 1;
                if (nextIdx >= 0 && nextIdx < cells.length) {
                    setSelectedCellId(cells[nextIdx].id);
                }
            });
        },
        [cells, trackDelete]
    );

    const handleDuplicate = React.useCallback(
        (id: number) => {
            duplicateCell(id).then((newCell) => {
                trackInsert(newCell);
                reload();
                setSelectedCellId(newCell.id);
            });
        },
        [reload, trackInsert]
    );

    const handleMoveUp = React.useCallback(
        (id: number) => {
            const idx = cells.findIndex((c) => c.id === id);
            if (idx <= 0) return;
            moveCellUp(id).then(() => {
                trackMove(id, "up");
                reload();
            }).catch(() => { });
        },
        [cells, reload, trackMove]
    );

    const handleMoveDown = React.useCallback(
        (id: number) => {
            const idx = cells.findIndex((c) => c.id === id);
            if (idx >= cells.length - 1) return;
            moveCellDown(id).then(() => {
                trackMove(id, "down");
                reload();
            }).catch(() => { });
        },
        [cells, reload, trackMove]
    );

    const handleInsert = React.useCallback(
        (position: number, cellType: number) => {
            if (tabId === null) return;
            createCell(tabId, cellType, "", position).then((cell) => {
                trackInsert(cell);
                reload();
            });
        },
        [tabId, reload, trackInsert]
    );

    const handleAddMarkdown = React.useCallback(() => {
        if (tabId === null) return;
        createCell(tabId, 0, "").then((cell) => {
            trackInsert(cell);
            setCells((prev) => [...prev, cell]);
            setSelectedCellId(cell.id);
        });
    }, [tabId, trackInsert]);

    const handleAddImage = React.useCallback(() => {
        if (tabId === null) return;
        createCell(tabId, 1, "").then((cell) => {
            trackInsert(cell);
            setCells((prev) => [...prev, cell]);
            setSelectedCellId(cell.id);
        });
    }, [tabId, trackInsert]);

    // ── Register cell actions with the global dispatcher ──
    React.useEffect(() => {
        registerCellActions({
            deleteCell: () => {
                if (selectedCellId !== null) handleDelete(selectedCellId);
            },
            duplicateCell: () => {
                if (selectedCellId !== null) handleDuplicate(selectedCellId);
            },
            moveCellUp: () => {
                if (selectedCellId !== null) handleMoveUp(selectedCellId);
            },
            moveCellDown: () => {
                if (selectedCellId !== null) handleMoveDown(selectedCellId);
            },
            getSelectedCellId: () => selectedCellId,
        });

        return () => unregisterCellActions();
    }, [selectedCellId, handleDelete, handleDuplicate, handleMoveUp, handleMoveDown]);

    // ── Virtualization — operates on VISIBLE cells only ──
    const rowVirtualizer = useVirtualizer({
        count: visibleCells.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 150,
        overscan: 5,
        getItemKey: (index) => visibleCells[index].id,
    });

    const handleScrollPageDown = React.useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: scrollRef.current.clientHeight, behavior: "smooth" });
        }
    }, []);

    const handleScrollPageUp = React.useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ top: -scrollRef.current.clientHeight, behavior: "smooth" });
        }
    }, []);

    const handleScrollToEnd = React.useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: rowVirtualizer.getTotalSize(), left: 0, behavior: "smooth" });
        }
    }, [rowVirtualizer]);

    const handleScrollToTop = React.useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
    }, []);

    if (tabId === null) {
        return <div className="cells-empty">Selecione uma aba</div>;
    }

    return (
        <div className="cells-container" onDragOver={onDragOver} onDrop={onDrop}>
            <div className="cells-toolbar">
                <button className="btn btn--sm" onClick={handleAddMarkdown}>
                    + Markdown
                </button>
                <button className="btn btn--sm" onClick={handleAddImage}>
                    + Image
                </button>
                <span className="cells-count">{cells.length} células</span>
            </div>
            <div className="cells-list" ref={scrollRef}>
                {visibleCells.length > 0 ? (
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: "100%",
                            position: "relative",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const i = virtualRow.index;
                            const cell = visibleCells[i];
                            const isSelected = cell.id === selectedCellId;
                            const isTitle = isTitleCell(cell);
                            const isCollapsed = collapsedSections.has(cell.id);

                            return (
                                <div
                                    key={cell.id}
                                    data-index={virtualRow.index}
                                    ref={rowVirtualizer.measureElement}
                                    className="cell-virtual-row"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        transform: `translateY(${virtualRow.start}px)`,
                                        zIndex: visibleCells.length - i,
                                    }}
                                >
                                    {i === 0 && (
                                        <InsertCellButton
                                            tabId={tabId}
                                            positionBefore={null}
                                            positionAfter={cell.position}
                                            onInsert={handleInsert}
                                        />
                                    )}
                                    <div
                                        className={`cell-slot${isSelected ? " cell-slot--selected" : ""}${isTitle ? " cell-slot--has-toggle" : ""}`}
                                        onClick={() => setSelectedCellId(cell.id)}
                                    >
                                        {isTitle && (
                                            <button
                                                className={`section-toggle${isCollapsed ? " section-toggle--collapsed" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCollapse(cell.id);
                                                }}
                                                title={isCollapsed ? "Expandir seção" : "Recolher seção"}
                                            >
                                                <span className="section-toggle__icon">▶</span>
                                            </button>
                                        )}
                                        <CellRenderer
                                            cell={cell}
                                            onDelete={handleDelete}
                                            onDuplicate={handleDuplicate}
                                            onMoveUp={handleMoveUp}
                                            onMoveDown={handleMoveDown}
                                            onCellUpdated={handleCellUpdated}
                                            onContentChange={handleContentChange}
                                        />
                                    </div>
                                    <InsertCellButton
                                        tabId={tabId}
                                        positionBefore={cell.position}
                                        positionAfter={
                                            i < visibleCells.length - 1 ? visibleCells[i + 1].position : null
                                        }
                                        onInsert={handleInsert}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="cells-empty-state">
                        Comece adicionando uma célula
                    </div>
                )}
            </div>
            <div className="scroll-actions-zone">
                <button className="scroll-btn" onClick={handleScrollToTop} title="Home (Início)">
                    ⤒
                </button>
                <button className="scroll-btn" onClick={handleScrollPageUp} title="Page Up">
                    ↑
                </button>
                <button className="scroll-btn" onClick={handleScrollPageDown} title="Page Down">
                    ↓
                </button>
                <button className="scroll-btn" onClick={handleScrollToEnd} title="End (Fim)">
                    ⤓
                </button>
            </div>
        </div>
    );
};

export default CellsContainer;
