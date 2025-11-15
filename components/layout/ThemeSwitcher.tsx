"use client";

import { useTheme } from "@/hooks/useTheme";
import { Laptop, MoonStar, SunMedium } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { useEffect } from "react";

const OPTIONS = [
    { label: "Light", value: "light", icon: SunMedium },
    { label: "Dark", value: "dark", icon: MoonStar },
    { label: "System", value: "system", icon: Laptop },
];

let mounted = false;

export default function ThemeSwitcher() {
    const { theme, setTheme, isDark } = useTheme();

    useEffect(() => {
        if (!mounted) {
            mounted = true;
        }
    }, []);

    const Icon = mounted && isDark ? MoonStar : SunMedium;

    return (
        <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-800/60 bg-primary-900/30 text-primary-100 transition hover:border-primary-600"
                    aria-label="Toggle theme"
                >
                    {mounted ? <Icon className="h-5 w-5" /> : null}
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
                sideOffset={8}
                className="min-w-40 rounded-xl border border-primary-900/40 bg-background p-2 text-sm text-foreground shadow-lg shadow-primary-900/40"
            >
                {OPTIONS.map(({ value, label, icon: Icon }) => (
                    <DropdownMenu.Item
                        key={value}
                        onSelect={() => setTheme(value as "light" | "dark" | "system")}
                        className={`flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                            theme === value ? "bg-primary-900/40 text-primary-100" : "hover:bg-primary-900/25"
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}
