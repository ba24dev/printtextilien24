"use client";

import { DEBOUNCE_MS } from "@/config/app-config";
import { SearchResponse, SearchResult } from "@/lib/search/types";
import { useEffect, useMemo, useRef, useState } from "react";

type Status = "idle" | "loading" | "error" | "success";

export function useSearchProducts() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      controller.current?.abort();
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    const handle = setTimeout(async () => {
      controller.current?.abort();
      controller.current = new AbortController();

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const payload: SearchResponse = await response.json();
        setResults(payload.results);
        setStatus("success");
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
        setError((error as Error)?.message ?? "Search failed");
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
      controller.current?.abort();
    };
  }, [query]);

  return useMemo(
    () => ({
      query,
      setQuery,
      results,
      isLoading: status === "loading",
      isError: status === "error",
      hasResults: results.length > 0,
      error,
      reset() {
        setQuery("");
        setResults([]);
        setStatus("idle");
        setError(null);
      },
    }),
    [query, results, status, error]
  );
}
