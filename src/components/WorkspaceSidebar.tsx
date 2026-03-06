import React from "react";
import type { Workspace } from "../types";
import { getWorkspaces, createWorkspace, deleteWorkspace, renameWorkspace } from "../services/api";

interface Props {
    activeId: number | null;
    onSelect: (id: number) => void;
    width: number;
}

const WorkspaceSidebar: React.FC<Props> = ({ activeId, onSelect, width }) => {
    const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editName, setEditName] = React.useState("");

    React.useEffect(() => {
        getWorkspaces().then((list) => {
            setWorkspaces(list);
            if (activeId === null && list.length > 0) {
                onSelect(list[0].id);
            }
        });
    }, [activeId, onSelect]);

    const handleAdd = React.useCallback(() => {
        const name = `Workspace ${workspaces.length + 1}`;
        createWorkspace(name).then((ws) => {
            setWorkspaces((prev) => [ws, ...prev]);
            onSelect(ws.id);
        });
    }, [workspaces.length, onSelect]);

    const handleDelete = React.useCallback(
        (e: React.MouseEvent, id: number) => {
            e.stopPropagation();
            deleteWorkspace(id).then(() => {
                setWorkspaces((prev) => prev.filter((w) => w.id !== id));
            });
        },
        []
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
        if (trimmed.length > 0) {
            renameWorkspace(editingId, trimmed).then(() => {
                setWorkspaces((prev) =>
                    prev.map((w) => (w.id === editingId ? { ...w, name: trimmed } : w))
                );
            });
        }
        setEditingId(null);
    }, [editingId, editName]);

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
                {workspaces.map((ws) => (
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
