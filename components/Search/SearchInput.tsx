"use client";

type SearchInputProps = {
    value: string;
    onChangeAction: (value: string) => void;
    onClearAction: () => void;
    isLoading: boolean;
};

export default function SearchInput({ value, onChangeAction, onClearAction, isLoading }: SearchInputProps) {
    return (
        <div className="relative">
            <input
                type="search"
                value={value}
                onChange={(event) => onChangeAction(event.currentTarget.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {value ? (
                <button
                    type="button"
                    onClick={onClearAction}
                    className="absolute inset-y-0 right-2 flex items-center text-md text-gray-300 hover:text-gray-100 cursor-pointer"
                >
                    ×
                </button>
            ) : null}
            {isLoading ? (
                <span className="absolute inset-y-0 right-12 flex items-center text-xs text-gray-400">Loading...</span>
            ) : null}
        </div>
    );
}
