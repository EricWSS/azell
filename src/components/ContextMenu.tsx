import React from "react";
import ReactDOM from "react-dom";
import "./ContextMenu.css";

export interface MenuItemDef {
    id: string;
    label?: string;
    icon?: React.ReactNode | string;
    action?: () => void;
    separator?: boolean;
    danger?: boolean;
}

export interface ContextMenuState {
    x: number;
    y: number;
    items: MenuItemDef[];
}

interface Props {
    state: ContextMenuState | null;
    onClose: () => void;
}

const ContextMenu: React.FC<Props> = ({ state, onClose }) => {
    const menuRef = React.useRef<HTMLDivElement>(null);

    const [coords, setCoords] = React.useState({ x: -9999, y: -9999 });

    React.useEffect(() => {
        if (!state) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("scroll", onClose, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("scroll", onClose, true);
        };
    }, [state, onClose]);

    React.useLayoutEffect(() => {
        if (!state || !menuRef.current) return;

        let finalX = state.x;
        let finalY = state.y;
        const rect = menuRef.current.getBoundingClientRect();

        if (window.innerWidth - finalX < rect.width) {
            finalX -= rect.width;
        }
        if (window.innerHeight - finalY < rect.height) {
            finalY -= rect.height;
        }

        setCoords({ x: Math.max(8, finalX), y: Math.max(8, finalY) });
    }, [state]);

    if (!state) return null;

    return ReactDOM.createPortal(
        <div
            className="context-menu"
            ref={menuRef}
            style={{
                left: coords.x === -9999 ? state.x : coords.x,
                top: coords.y === -9999 ? state.y : coords.y,
                visibility: coords.x === -9999 ? 'hidden' : 'visible'
            }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
            <div className="context-menu__inner">
                {state.items.map((item, i) => {
                    if (item.separator) {
                        return <div key={`sep-${i}`} className="context-menu__separator" />;
                    }
                    return (
                        <button
                            key={item.id}
                            className={`context-menu__item${item.danger ? " context-menu__item--danger" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.action?.();
                                onClose();
                            }}
                        >
                            {item.icon && <span className="context-menu__icon">{item.icon}</span>}
                            <span className="context-menu__label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>,
        document.body
    );
};

export default ContextMenu;
