import React from "react";
import type { Workspace } from "../types";
import { getWorkspaces } from "../services/api";
import { useTrash } from "../context/TrashContext";
import { globalHistory } from "../editor/history/GlobalHistoryManager";
import { CreateWorkspaceCommand, DeleteWorkspaceCommand, RenameWorkspaceCommand, CloseWorkspaceCommand } from "../editor/history/commands/WorkspaceCommands";
import { registerWorkspaceActions, unregisterWorkspaceActions } from "../editor/WorkspaceActionDispatcher";

interface Props {
    activeId: number | null;
    onSelect: (id: number) => void;
    width: number;
}

const WorkspaceSidebar: React.FC<Props> = ({ activeId, onSelect, width }) => {
    const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editName, setEditName] = React.useState("");
    const { hiddenWorkspaces } = useTrash();

    const fetchWorkspaces = React.useCallback(() => {
        getWorkspaces().then((list) => {
            setWorkspaces(list);
            if (activeId === null && list.length > 0) {
                onSelect(list[0].id);
            }
        });
    }, [activeId, onSelect]);

    React.useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    const handleAdd = React.useCallback(() => {
        const name = `Workspace ${workspaces.length + 1}`;
        const cmd = new CreateWorkspaceCommand(name, (id) => {
            if (id !== null) onSelect(id);
        }, () => {
            fetchWorkspaces();
        });

        cmd.execute().then(() => globalHistory.push(cmd));
    }, [workspaces.length, onSelect, fetchWorkspaces]);

    const handleCloseWorkspace = React.useCallback(() => {
        if (activeId === null) return;
        const cmd = new CloseWorkspaceCommand(
            activeId,
            () => { }, // UI will react via useTrash globally 
            () => { onSelect(activeId); } // Select it when Undo brings it back
        );
        cmd.execute();
        globalHistory.push(cmd);

        const visible = workspaces.filter((w) => !hiddenWorkspaces.has(w.id) && w.id !== activeId);
        if (visible.length > 0) {
            onSelect(visible[0].id);
        } else {
            // No spaces left
            onSelect(-1); // or skip since it's nullable 
        }
    }, [activeId, hiddenWorkspaces, workspaces, onSelect]);

    // Register global actions
    React.useEffect(() => {
        registerWorkspaceActions({
            newWorkspace: handleAdd,
            closeWorkspace: handleCloseWorkspace
        });
        return () => unregisterWorkspaceActions();
    }, [handleAdd, handleCloseWorkspace]);

    const handleDelete = React.useCallback(
        (e: React.MouseEvent, id: number) => {
            e.stopPropagation();
            const cmd = new DeleteWorkspaceCommand(
                id,
                () => { }, // Let useTrash re-rendering handle row disappearing
                () => { onSelect(id); } // Auto-select on undo
            );
            cmd.execute();
            globalHistory.push(cmd);

            // If deleting the active workspace, switch to a fallback
            const visible = workspaces.filter((w) => !hiddenWorkspaces.has(w.id) && w.id !== id);
            if (activeId === id && visible.length > 0) {
                onSelect(visible[0].id);
            }
        },
        [activeId, onSelect, hiddenWorkspaces, workspaces]
    );

    // Double-click to start editing name
    const handleDoubleClick = React.useCallback((ws: Workspace) => {
        setEditingId(ws.id);
        setEditName(ws.name);
    }, []);

    const handleEditChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(e.target.value);
    }, []);

    const commitRename = React.useCallback(() => {
        if (editingId === null) return;
        const trimmed = editName.trim();
        const ws = workspaces.find(w => w.id === editingId);

        if (trimmed.length > 0 && ws && ws.name !== trimmed) {
            const cmd = new RenameWorkspaceCommand(editingId, ws.name, trimmed, () => {
                getWorkspaces().then(setWorkspaces);
            });
            cmd.execute().then(() => globalHistory.push(cmd));
        }
        setEditingId(null);
    }, [editingId, editName, workspaces]);

    const handleEditKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditingId(null);
        },
        [commitRename]
    );

    return (
        <aside className="sidebar" style={{ width, minWidth: width, maxWidth: width }}>
            <div className="sidebar__header">
                <h2 className="sidebar__title">Workspaces</h2>
                <button className="btn btn--sm" onClick={handleAdd}>
                    +
                </button>
            </div>
            <ul className="sidebar__list">
                {workspaces.filter(ws => !hiddenWorkspaces.has(ws.id)).map((ws) => (
                    <li
                        key={ws.id}
                        className={`sidebar__item${ws.id === activeId ? " sidebar__item--active" : ""}`}
                        onClick={() => onSelect(ws.id)}
                        onDoubleClick={() => handleDoubleClick(ws)}
                    >
                        {editingId === ws.id ? (
                            <input
                                className="sidebar__edit-input"
                                value={editName}
                                onChange={handleEditChange}
                                onBlur={commitRename}
                                onKeyDown={handleEditKeyDown}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span>{ws.name}</span>
                        )}
                        <button
                            className="sidebar__item-delete"
                            onClick={(e) => handleDelete(e, ws.id)}
                            title="Excluir"
                        >
                            ×
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default WorkspaceSidebar;
