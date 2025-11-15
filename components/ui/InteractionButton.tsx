import { clsx } from "clsx";

interface InteractionButtonProps {
  id?: string;
  handle: string;
  label: string;
  activeHandle: string;
  setActiveAction: (handle: string) => void;
}

export default function InteractionButton({
  id,
  handle,
  label,
  activeHandle,
  setActiveAction,
}: InteractionButtonProps) {
  return (
    <button
      key={id}
      type="button"
      onClick={() => setActiveAction(handle)}
      className={clsx(
        "w-full rounded-lg px-4 py-2 text-left text-sm transition cursor-pointer",
        activeHandle === handle
          ? "bg-primary-500 text-background dark:text-foreground"
          : "text-foreground hover:bg-secondary-500 dark:hover:text-background"
      )}
    >
      {label}
    </button>
  );
}
