"use client";

import { formatPrice } from "@/lib/helpers";
import { SearchResult } from "@/lib/search/types";
import Image from "next/image";
import Link from "next/link";

type SearchResultsProps = {
    show: boolean;
    results: SearchResult[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    onSelectAction?: () => void;
};

export default function SearchResults({
    show,
    results,
    isLoading,
    isError,
    error,
    onSelectAction,
}: SearchResultsProps) {
    if (!show) return null;

    return (
        <div className="absolute z-40 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {isLoading ? (
                <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
            ) : isError ? (
                <p className="px-4 py-3 text-sm text-red-600">{error ?? "Search failed"}</p>
            ) : results.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No products found.</p>
            ) : (
                <ul className="max-h-80 overflow-y-auto">
                    {results.map((result) => (
                        <li key={result.id}>
                            <Link
                                href={`/products/${result.handle}`}
                                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100"
                                onClick={onSelectAction}
                            >
                                <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100">
                                    {result.imageUrl ? (
                                        <Image
                                            src={result.imageUrl}
                                            alt={result.title}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                                            No Image
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{result.title}</p>
                                    {result.price ? (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {formatPrice(result.price.amount, result.price.currencyCode)}
                                        </p>
                                    ) : null}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
