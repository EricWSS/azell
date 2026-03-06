import React from "react";

interface Props {
    cellId: number;
    onDuplicate: (id: number) => void;
    onMoveUp: (id: number) => void;
    onMoveDown: (id: number) => void;
}

const CellMenu: React.FC<Props> = React.memo(
    ({ cellId, onDuplicate, onMoveUp, onMoveDown }) => {
        const [open, setOpen] = React.useState(false);
        const menuRef = React.useRef<HTMLDivElement>(null);

        React.useEffect(() => {
            if (!open) return;
            const handler = (e: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
        }, [open]);

        const toggle = React.useCallback(() => setOpen((o) => !o), []);

        const action = React.useCallback(
            (fn: (id: number) => void) => {
                setOpen(false);
                fn(cellId);
            },
            [cellId]
        );

        return (
            <div className="cell-menu" ref={menuRef}>
                <button
                    className="cell-menu__trigger"
                    onClick={toggle}
                    title="Ações da célula"
                >
                    ⋮
                </button>
                {open && (
                    <div className="cell-menu__dropdown">
                        <button className="cell-menu__item" onClick={() => action(onDuplicate)}>
                            Duplicate
                        </button>
                        <button className="cell-menu__item" onClick={() => action(onMoveUp)}>
                            Move Up
                        </button>
                        <button className="cell-menu__item" onClick={() => action(onMoveDown)}>
                            Move Down
                        </button>
                    </div>
                )}
            </div>
        );
    }
);

CellMenu.displayName = "CellMenu";
export default CellMenu;
