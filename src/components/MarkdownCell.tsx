import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Cell } from "../types";
import { updateCell, createCell } from "../services/api";
import { useDebouncedCallback } from "../hooks/useDebounce";
import getCaretCoordinates from "textarea-caret";
import SlashCommandMenu, { CommandOption } from "./SlashCommandMenu";
import { editSessionManager } from "../editor/editing/EditSessionManager";
import { textUndoManager } from "../editor/undo/TextUndoManager";
import { updateCell as apiUpdateCell } from "../services/api";

interface Props {
    cell: Cell;
    onDelete?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onInsertRender?: () => void; // Trigger parent reload
    onContentChange?: (id: number, content: string) => void;
}

const DEBOUNCE_MS = 400;

const COMMANDS: CommandOption[] = [
    { id: "text", label: "Text", icon: "T", description: "Escreva texto usando markdown." },
    { id: "image", label: "Image", icon: "🖼️", description: "Faça upload ou cole uma imagem." },
    { id: "duplicate", label: "Duplicate", icon: "⎘", description: "Duplica esta célula." },
    { id: "delete", label: "Delete", icon: "×", description: "Exclui esta célula." },
];

const MarkdownCell: React.FC<Props> = React.memo(({ cell, onDelete, onDuplicate, onInsertRender, onContentChange }) => {
    const [editing, setEditing] = React.useState(!cell.content);
    const [draft, setDraft] = React.useState(cell.content);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const [slashMenuPos, setSlashMenuPos] = React.useState<{ x: number; y: number } | null>(null);

    // Debounced persist — fires 400ms after last keystroke
    const [debouncedSave, cancelSave] = useDebouncedCallback(
        (id: number, content: string) => {
            updateCell(id, content);
        },
        DEBOUNCE_MS
    );

    // Auto-resize textarea to fit content
    const autoResize = React.useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, []);

    // Enter edit mode on double-click
    const handleDoubleClick = React.useCallback(() => {
        setEditing(true);
    }, []);

    // Focus + resize textarea when entering edit mode + start edit session
    React.useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
            autoResize();
            editSessionManager.startSession(cell.id, draft);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing, autoResize, cell.id]);

    // Register text undo applier — when text undo/redo fires, update this cell's draft
    React.useEffect(() => {
        textUndoManager.setApplier((cellId: number, content: string) => {
            if (cellId === cell.id) {
                setDraft(content);
                apiUpdateCell(cellId, content);
                // Start a new edit session from the restored content
                editSessionManager.startSession(cellId, content);
            }
        });
    }, [cell.id]);

    // Flush pending save + commit edit session on unmount
    React.useEffect(() => {
        return () => {
            cancelSave();
            editSessionManager.commitSession();
        };
    }, [cancelSave]);

    // Check for slash command invocation
    const handleCheckSlash = React.useCallback(
        (val: string, el: HTMLTextAreaElement) => {
            // Se começa com slash diretamente ou novo parágrafo -> abre menu
            if (val === "/") {
                const caret = getCaretCoordinates(el, el.selectionEnd);
                const rect = el.getBoundingClientRect();
                setSlashMenuPos({
                    x: rect.left + caret.left,
                    y: rect.top + caret.top + caret.height + 4,
                });
            } else {
                setSlashMenuPos(null);
            }
        },
        []
    );

    // On every keystroke: update local draft + schedule debounced save + auto-resize
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setDraft(value);
            debouncedSave(cell.id, value);
            autoResize();
            handleCheckSlash(value, e.target);
            editSessionManager.updateSession(value);
        },
        [cell.id, debouncedSave, autoResize, handleCheckSlash]
    );

    // Exit edit mode on blur — flush save + commit edit session
    const handleBlur = React.useCallback(() => {
        cancelSave();
        updateCell(cell.id, draft);
        editSessionManager.commitSession();
        onContentChange?.(cell.id, draft);
        if (draft.trim().length > 0) {
            setTimeout(() => setEditing(false), 200);
        }
    }, [cell.id, draft, cancelSave, onContentChange]);

    // Handle keydown for capturing / navigating Menu
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (slashMenuPos && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter")) {
                e.preventDefault(); // Menu takes over
                return;
            }

            if (e.key === "Escape") {
                if (slashMenuPos) {
                    setSlashMenuPos(null);
                    return;
                }
                e.preventDefault();
                cancelSave();
                updateCell(cell.id, draft);
                editSessionManager.commitSession();
                onContentChange?.(cell.id, draft);
                setEditing(false);
            }
        },
        [cell.id, draft, cancelSave, slashMenuPos, onContentChange]
    );

    const handleSelectCommand = React.useCallback(async (commandId: string) => {
        setSlashMenuPos(null);
        setDraft("");
        cancelSave();
        updateCell(cell.id, "");

        try {
            if (commandId === "text") {
                // Creates a new text cell immediately after this one
                await createCell(cell.tab_id, 0, "", cell.position);
                onInsertRender?.();
            } else if (commandId === "image") {
                // Create explicitly as image below this one
                await createCell(cell.tab_id, 1, "", cell.position);
                onInsertRender?.();
            } else if (commandId === "delete") {
                onDelete?.(cell.id);
            } else if (commandId === "duplicate") {
                onDuplicate?.(cell.id);
            }
        } catch (err) {
            console.error(err);
        }
    }, [cell, onInsertRender, onDelete, onDuplicate, cancelSave]);

    // Memoize line count — only recompute when draft changes
    const lineCount = React.useMemo(() => {
        if (!draft) return 1;
        return draft.split("\n").length;
    }, [draft]);

    // Sync gutter scroll with textarea scroll
    const gutterRef = React.useRef<HTMLDivElement>(null);
    const handleTextareaScroll = React.useCallback(() => {
        if (textareaRef.current && gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, []);

    return (
        <div className={`cell cell--markdown relative-host${editing ? " cell--focused" : ""}`} data-cell-id={cell.id}>
            <div className="cell__badge">MD</div>
            {editing ? (
                <>
                    <div className="cell__editor-row">
                        <div className="line-numbers" ref={gutterRef}>
                            {Array.from({ length: lineCount }, (_, i) => (
                                <span key={i} className="line-numbers__line">{i + 1}</span>
                            ))}
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="cell__textarea"
                            value={draft}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            onScroll={handleTextareaScroll}
                            rows={1}
                            spellCheck={false}
                            placeholder="Escreva markdown aqui ou digite '/' para ver comandos..."
                        />
                    </div>
                    <SlashCommandMenu
                        position={slashMenuPos}
                        options={COMMANDS}
                        onSelect={handleSelectCommand}
                        onClose={() => setSlashMenuPos(null)}
                    />
                </>
            ) : (
                <div className="cell__rendered" onDoubleClick={handleDoubleClick}>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{draft}</ReactMarkdown>
                </div>
            )}
        </div>
    );
});

MarkdownCell.displayName = "MarkdownCell";
export default MarkdownCell;
