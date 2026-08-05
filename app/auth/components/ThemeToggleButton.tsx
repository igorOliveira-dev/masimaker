// Este componente alterna o tema claro/escuro da interface.

"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

// Alterna entre tema claro e escuro e persiste a preferência no navegador.
export function ThemeToggleButton() {
const [theme, setTheme] = useState<"light" | "dark">("light");

useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme ?? systemTheme;

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
}, []);

useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
};

return (
    <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--foreground)]/30 bg-[var(--background-secondary)] text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)]/10"
    >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
);
}
