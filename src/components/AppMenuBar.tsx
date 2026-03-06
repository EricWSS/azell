import React from "react";

// ── Menu Structure Definition ──

interface MenuItem {
    label: string;
    action?: string;
    separator?: boolean;
    shortcut?: string;
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

const MENU_STRUCTURE: MenuGroup[] = [
    {
        label: "File",
        items: [
            { label: "New Workspace", action: "new_workspace", shortcut: "Ctrl+N" },
            { label: "Open Workspace", action: "open_workspace" },
            { label: "Close Workspace", action: "close_workspace" },
            { separator: true, label: "" },
            { label: "Save", action: "save", shortcut: "Ctrl+S" },
            { separator: true, label: "" },
            { label: "Export Workspace", action: "export_workspace" },
            { label: "Import Markdown", action: "import_markdown" },
            { separator: true, label: "" },
            { label: "Exit", action: "exit", shortcut: "Alt+F4" },
        ],
    },
    {
        label: "Edit",
        items: [
            { label: "Undo", action: "undo", shortcut: "Ctrl+Z" },
            { label: "Redo", action: "redo", shortcut: "Ctrl+Shift+Z" },
            { separator: true, label: "" },
            { label: "Delete Cell", action: "delete_cell", shortcut: "Ctrl+Shift+D" },
            { label: "Duplicate Cell", action: "duplicate_cell", shortcut: "Ctrl+Shift+C" },
            { label: "Move Cell Up", action: "move_cell_up", shortcut: "Alt+↑" },
            { label: "Move Cell Down", action: "move_cell_down", shortcut: "Alt+↓" },
        ],
    },
    {
        label: "Insert",
        items: [
            { label: "Insert Markdown Cell", action: "insert_markdown" },
            { label: "Insert Image Cell", action: "insert_image" },
            { separator: true, label: "" },
            { label: "Insert Divider", action: "insert_divider" },
        ],
    },
    {
        label: "View",
        items: [
            { label: "Toggle Sidebar", action: "toggle_sidebar" },
            { label: "Toggle Line Numbers", action: "toggle_line_numbers" },
            { label: "Toggle Cell Borders", action: "toggle_cell_borders" },
            { label: "Toggle Dark Mode", action: "toggle_dark_mode" },
            { separator: true, label: "" },
            { label: "Zoom In", action: "zoom_in", shortcut: "Ctrl+=" },
            { label: "Zoom Out", action: "zoom_out", shortcut: "Ctrl+-" },
            { label: "Reset Zoom", action: "reset_zoom", shortcut: "Ctrl+0" },
        ],
    },
    {
        label: "Workspace",
        items: [
            { label: "New Tab", action: "new_tab" },
            { label: "Close Tab", action: "close_tab" },
            { label: "Rename Tab", action: "rename_tab" },
            { label: "Duplicate Tab", action: "duplicate_tab" },
            { separator: true, label: "" },
            { label: "New Workspace", action: "ws_new_workspace" },
            { label: "Rename Workspace", action: "rename_workspace" },
            { label: "Delete Workspace", action: "delete_workspace" },
        ],
    },
    {
        label: "Tools",
        items: [
            { label: "Search", action: "search", shortcut: "Ctrl+K" },
            { label: "Replace", action: "replace", shortcut: "Ctrl+H" },
            { label: "Command Palette", action: "command_palette", shortcut: "Ctrl+Shift+P" },
            { separator: true, label: "" },
            { label: "Open Database Folder", action: "open_db_folder" },
            { label: "Open Images Folder", action: "open_images_folder" },
        ],
    },
    {
        label: "Settings",
        items: [
            { label: "General", action: "settings_general" },
            { label: "Editor", action: "settings_editor" },
            { label: "Appearance", action: "settings_appearance" },
            { label: "Shortcuts", action: "settings_shortcuts" },
            { label: "Storage", action: "settings_storage" },
            { separator: true, label: "" },
            { label: "Language", action: "settings_language" },
        ],
    },
    {
        label: "Help",
        items: [
            { label: "Welcome", action: "help_welcome" },
            { label: "Documentation", action: "help_docs" },
            { label: "Keyboard Shortcuts", action: "help_shortcuts" },
            { separator: true, label: "" },
            { label: "Report Bug", action: "report_bug" },
            { label: "About AZELL", action: "about" },
        ],
    },
];

// ── Language State (future i18n) ──
type Language = "en" | "pt";

const LanguageContext = React.createContext<{
    language: Language;
    setLanguage: (l: Language) => void;
}>({
    language: "en",
    setLanguage: () => { },
});

export const useLanguage = () => React.useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = React.useState<Language>(() => {
        return (localStorage.getItem("azell_language") as Language) || "en";
    });

    const handleSetLanguage = React.useCallback((l: Language) => {
        setLanguage(l);
        localStorage.setItem("azell_language", l);
    }, []);

    const value = React.useMemo(() => ({
        language,
        setLanguage: handleSetLanguage,
    }), [language, handleSetLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// ── AppMenuBar Component ──

interface AppMenuBarProps {
    onMenuAction?: (action: string) => void;
}

const AppMenuBar: React.FC<AppMenuBarProps> = ({ onMenuAction }) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const menuBarRef = React.useRef<HTMLDivElement>(null);
    const { language, setLanguage } = useLanguage();

    const handleMenuAction = React.useCallback(
        (action: string) => {
            console.log("Menu action:", action);

            // Handle language switching internally
            if (action === "settings_language") {
                const next: Language = language === "en" ? "pt" : "en";
                setLanguage(next);
                console.log("Language changed to:", next);
            }

            onMenuAction?.(action);
            setOpenMenu(null);
        },
        [onMenuAction, language, setLanguage]
    );

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenMenu(null);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="app-menubar" ref={menuBarRef}>
            <span className="app-menubar__brand">AZELL</span>
            {MENU_STRUCTURE.map((group) => (
                <div
                    key={group.label}
                    className={`app-menubar__group${openMenu === group.label ? " app-menubar__group--open" : ""}`}
                >
                    <button
                        className="app-menubar__trigger"
                        onClick={() => setOpenMenu(openMenu === group.label ? null : group.label)}
                        onMouseEnter={() => {
                            if (openMenu !== null) setOpenMenu(group.label);
                        }}
                    >
                        {group.label}
                    </button>
                    {openMenu === group.label && (
                        <div className="app-menubar__dropdown">
                            {group.items.map((item, idx) =>
                                item.separator ? (
                                    <div key={`sep-${idx}`} className="app-menubar__separator" />
                                ) : (
                                    <button
                                        key={item.action}
                                        className="app-menubar__item"
                                        onClick={() => handleMenuAction(item.action!)}
                                    >
                                        <span className="app-menubar__item-label">
                                            {item.label}
                                            {item.action === "settings_language" && (
                                                <span className="app-menubar__lang-badge">
                                                    {language.toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                        {item.shortcut && (
                                            <span className="app-menubar__shortcut">{item.shortcut}</span>
                                        )}
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AppMenuBar;
