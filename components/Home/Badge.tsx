import { MonitorSmartphone } from "lucide-react";

interface BadgeProps {
    text: string;
}

export default function Badge({ text }: BadgeProps) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-900/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-primary-100">
            <MonitorSmartphone className="h-3.5 w-3.5" />
            {text}
        </span>
    );
}
