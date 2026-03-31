import React from "react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import TabsBar from "./components/TabsBar";
import CellsContainer from "./components/CellsContainer";
import { ThemeSettings } from "./components/ThemeSettings";
import AppMenuBar, { LanguageProvider } from "./components/AppMenuBar";
import { undoRouterUndo, undoRouterRedo } from "./editor/undo/UndoRouter";
import { useKeyboardShortcuts } from "./editor/shortcuts/useKeyboardShortcuts";
import {
  dispatchDeleteCell,
  dispatchDuplicateCell,
  dispatchMoveCellUp,
  dispatchMoveCellDown,
} from "./editor/CellActionDispatcher";
import { exportWorkspaceById, importMarkdown } from "./services/importExport";
import { checkForUpdates } from "./services/updater";
import "./App.css";

const App: React.FC = () => {
  useKeyboardShortcuts();
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState<number | null>(null);
  const [activeTabId, setActiveTabId] = React.useState<number | null>(null);
  const [sidebarWidth, setSidebarWidth] = React.useState(220);
  const [showThemeSettings, setShowThemeSettings] = React.useState(false);

  const isDragging = React.useRef(false);

  const handleSelectWorkspace = React.useCallback((id: number) => {
    setActiveWorkspaceId(id);
    setActiveTabId(null);
  }, []);

  const handleSelectTab = React.useCallback((id: number) => {
    setActiveTabId(id);
  }, []);

  const handleMenuAction = React.useCallback((action: string) => {
    console.log("Menu action:", action);
    if (action === "undo") undoRouterUndo();
    if (action === "redo") undoRouterRedo();
    if (action === "delete_cell") dispatchDeleteCell();
    if (action === "duplicate_cell") dispatchDuplicateCell();
    if (action === "move_cell_up") dispatchMoveCellUp();
    if (action === "move_cell_down") dispatchMoveCellDown();

    if (action === "check_updates") {
      checkForUpdates();
    }

    if (action === "settings_theme") {
      setShowThemeSettings(true);
    }

    if (action === "export_workspace") {
      if (activeWorkspaceId !== null) {
        exportWorkspaceById(activeWorkspaceId).catch(console.error);
      } else {
        alert("Nenhum workspace selecionado para exportar.");
      }
    }
    if (action === "import_markdown") {
      importMarkdown().then((newWorkspaceId) => {
        if (newWorkspaceId) {
          setActiveWorkspaceId(newWorkspaceId);
          setActiveTabId(null);
        }
      }).catch(console.error);
    }
  }, [activeWorkspaceId]);

  const handleMouseDown = React.useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  }, []);

  React.useEffect(() => {
    // Check for updates silently on app startup
    checkForUpdates();
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      let newWidth = e.clientX;
      if (newWidth < 150) newWidth = 150;
      if (newWidth > 600) newWidth = 600;

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "default";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <LanguageProvider>
      <div className="app">
        {showThemeSettings && (
          <ThemeSettings onClose={() => setShowThemeSettings(false)} />
        )}
        <AppMenuBar onMenuAction={handleMenuAction} />
        <div className="app__body">
          <WorkspaceSidebar
            activeId={activeWorkspaceId}
            onSelect={handleSelectWorkspace}
            width={sidebarWidth}
          />
          <div className="resizer" onMouseDown={handleMouseDown} />
          <div className="main">
            <div className="topbar">
              <TabsBar
                workspaceId={activeWorkspaceId}
                activeTabId={activeTabId}
                onSelectTab={handleSelectTab}
              />
            </div>
            <CellsContainer tabId={activeTabId} />
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default App;
