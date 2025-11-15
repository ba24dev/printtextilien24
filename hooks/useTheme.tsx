import { useEffect, useMemo, useState } from "react";

type ThemeOption = "light" | "dark" | "system";
const STORAGE_KEY = "theme-preference";

export function useTheme() {
    const [theme, setTheme] = useState<ThemeOption>(() => {
        if (typeof window === "undefined") return "system";
        return (localStorage.getItem(STORAGE_KEY) as ThemeOption) ?? "system";
    });

    useEffect(() => {
        if (theme === "system") {
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            const applySystemTheme = () => {
                document.documentElement.classList.toggle("dark", media.matches);
            };
            applySystemTheme();
            media.addEventListener("change", applySystemTheme);
            return () => media.removeEventListener("change", applySystemTheme);
        }

        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    return useMemo(
        () => ({
            theme,
            setTheme,
            isDark:
                theme === "dark" ||
                (theme === "system" &&
                    typeof window !== "undefined" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches),
        }),
        [theme]
    );
}
