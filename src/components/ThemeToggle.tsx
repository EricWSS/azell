import React from "react";

const ThemeToggle: React.FC = () => {
    const [dark, setDark] = React.useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : true;
    });

    React.useEffect(() => {
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    const toggle = React.useCallback(() => setDark((d) => !d), []);

    return (
        <button
            className="theme-toggle"
            onClick={toggle}
            title={dark ? "Modo claro" : "Modo escuro"}
            aria-label="Alternar tema"
        >
            <span className="theme-toggle__track">
                <span className="theme-toggle__thumb" />
            </span>
            <span className="theme-toggle__icon">{dark ? "🌙" : "☀️"}</span>
        </button>
    );
};

export default ThemeToggle;
