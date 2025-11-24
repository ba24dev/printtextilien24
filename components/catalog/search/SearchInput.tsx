"use client";

import { copy } from "@/config/copy";

type SearchInputProps = {
  value: string;
  onChangeAction: (value: string) => void;
  onClearAction: () => void;
  isLoading: boolean;
};

export default function SearchInput({
  value,
  onChangeAction,
  onClearAction,
  isLoading,
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        name="search"
        type="search"
        value={value}
        onChange={(event) => onChangeAction(event.currentTarget.value)}
        placeholder={copy.search.placeholder}
        className="w-full rounded-lg border border-secondary-500 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={onClearAction}
          className="absolute inset-y-0 right-2 flex items-center text-md text-secondary-300 hover:text-secondary-100 cursor-pointer"
          aria-label={copy.search.clear}
          title={copy.search.clear}
        >
          ×
        </button>
      ) : null}
      {isLoading ? (
        <span className="absolute inset-y-0 right-12 flex items-center text-xs text-secondary-300">
          {copy.search.loading}
        </span>
      ) : null}
    </div>
  );
}
