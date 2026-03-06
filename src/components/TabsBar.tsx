import React from "react";
import type { Tab } from "../types";
import { getTabs, createTab, deleteTab, renameTab } from "../services/api";

interface Props {
    workspaceId: number | null;
    activeTabId: number | null;
    onSelectTab: (id: number) => void;
}

const TabsBar: React.FC<Props> = ({ workspaceId, activeTabId, onSelectTab }) => {
    const [tabs, setTabs] = React.useState<Tab[]>([]);
    const [editingId, setEditingId] = React.useState<number | null>(null);
    const [editTitle, setEditTitle] = React.useState("");

    React.useEffect(() => {
        if (workspaceId === null) {
            setTabs([]);
            return;
        }
        getTabs(workspaceId).then((data) => {
            setTabs(data);
            if (activeTabId === null && data.length > 0) {
                onSelectTab(data[0].id);
            }
        });
    }, [workspaceId, activeTabId, onSelectTab]);

    const handleAdd = React.useCallback(() => {
        if (workspaceId === null) return;
        const title = `Tab ${tabs.length + 1}`;
        createTab(workspaceId, title).then((tab) => {
            setTabs((prev) => [...prev, tab]);
            onSelectTab(tab.id);
        });
    }, [workspaceId, tabs.length, onSelectTab]);

    const handleDelete = React.useCallback(
        (e: React.MouseEvent, id: number) => {
            e.stopPropagation();
            deleteTab(id).then(() => {
                setTabs((prev) => {
                    const next = prev.filter((t) => t.id !== id);
                    if (activeTabId === id && next.length > 0) {
                        onSelectTab(next[0].id);
                    }
                    return next;
                });
            });
        },
        [activeTabId, onSelectTab]
    );

    // Double-click to edit tab title
    const handleDoubleClick = React.useCallback((tab: Tab) => {
        setEditingId(tab.id);
        setEditTitle(tab.title);
    }, []);

    const handleEditChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditTitle(e.target.value);
    }, []);

    const commitRename = React.useCallback(() => {
        if (editingId === null) return;
        const trimmed = editTitle.trim();
        if (trimmed.length > 0) {
            renameTab(editingId, trimmed).then(() => {
                setTabs((prev) =>
                    prev.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t))
                );
            });
        }
        setEditingId(null);
    }, [editingId, editTitle]);

    const handleEditKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditingId(null);
        },
        [commitRename]
    );

    if (workspaceId === null) {
        return <div className="tabs-bar tabs-bar--empty">Selecione um workspace</div>;
    }

    return (
        <div className="tabs-bar">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={`tab-item${tab.id === activeTabId ? " tab-item--active" : ""}`}
                    onClick={() => onSelectTab(tab.id)}
                    onDoubleClick={() => handleDoubleClick(tab)}
                >
                    {editingId === tab.id ? (
                        <input
                            className="tab-edit-input"
                            value={editTitle}
                            onChange={handleEditChange}
                            onBlur={commitRename}
                            onKeyDown={handleEditKeyDown}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="tab-item__title">{tab.title}</span>
                    )}
                    <button
                        className="tab-item__close"
                        onClick={(e) => handleDelete(e, tab.id)}
                        title="Fechar aba"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button className="btn btn--sm tab-add" onClick={handleAdd}>
                +
            </button>
        </div>
    );
};

export default TabsBar;
