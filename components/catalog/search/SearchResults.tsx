"use client";

import { copy } from "@/config/copy";
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
    <div className="absolute z-40 mt-2 w-full rounded-lg border border-secondary-500 bg-secondary-800 shadow-lg">
      {isLoading ? (
        <p className="px-4 py-3 text-sm text-gray-500">{copy.search.searching}</p>
      ) : isError ? (
        <p className="px-4 py-3 text-sm text-red-600">{error ?? copy.search.failed}</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-gray-500">{copy.general.noResultsLabel}</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={`/products/${result.handle}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-secondary-600 rounded-lg"
                onClick={onSelectAction}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  {result.imageUrl ? (
                    <Image
                      src={result.imageUrl}
                      alt={result.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-secondary-300">
                      {copy.general.noImageLabel}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{result.title}</p>
                  {result.price ? (
                    <p className="mt-1 text-sm text-secondary-300">
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
