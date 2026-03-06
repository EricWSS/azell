import React from "react";

export interface CommandOption {
    id: string;
    label: string;
    icon: string;
    description: string;
}

interface Props {
    position: { x: number; y: number } | null;
    options: CommandOption[];
    onSelect: (optionId: string) => void;
    onClose: () => void;
}

const SlashCommandMenu: React.FC<Props> = ({ position, options, onSelect, onClose }) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!position) return;
        setSelectedIndex(0);
    }, [position]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!position) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % options.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + options.length) % options.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onSelect(options[selectedIndex].id);
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        if (position) {
            document.addEventListener("keydown", handleKeyDown, true);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [position, options, selectedIndex, onSelect, onClose]);

    // Handle outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (position) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [position, onClose]);

    if (!position) return null;

    return (
        <div
            ref={menuRef}
            className="slash-menu"
            style={{
                position: "fixed",
                top: position.y,
                left: position.x,
            }}
        >
            <div className="slash-menu__title">Add Block</div>
            {options.map((option, index) => (
                <button
                    key={option.id}
                    className={`slash-menu__item ${index === selectedIndex ? "slash-menu__item--active" : ""}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(option.id);
                    }}
                >
                    <span className="slash-menu__icon">{option.icon}</span>
                    <div className="slash-menu__text">
                        <div className="slash-menu__label">{option.label}</div>
                        <div className="slash-menu__desc">{option.description}</div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SlashCommandMenu;
