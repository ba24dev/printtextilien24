import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PrintCustomizationMetadata } from "@/lib/customizer/print-metadata";

export type CustomizationState = {
  metadata: PrintCustomizationMetadata;
  attributes: { key: string; value: string }[];
};

export type CustomizationMap = Record<string, CustomizationState>;

type StoragePayload = { surfaces?: CustomizationMap } | CustomizationState;

/**
 * Reads and parses a customization snapshot from localStorage using the provided storage key.
 *
 * Handles both multi-surface and single-surface payloads, returning a map of customizations and the current state.
 * If running in a non-browser environment or if the cache is malformed, returns empty defaults.
 *
 * @param storageKey - The key used to retrieve the snapshot from localStorage.
 * @returns An object containing:
 *   - `map`: A mapping of surface names to their customization states.
 *   - `current`: The current customization state, or `null` if unavailable.
 */
function readSnapshot(storageKey: string) {
  if (typeof window === "undefined") {
    return { map: {} as CustomizationMap, current: null as CustomizationState | null };
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { map: {} as CustomizationMap, current: null as CustomizationState | null };
  const nextMap: CustomizationMap = {};
  let nextCurrent: CustomizationState | null = null;
  try {
    const parsed = JSON.parse(raw) as StoragePayload;
    if (parsed && "surfaces" in parsed && parsed.surfaces) {
      Object.assign(nextMap, parsed.surfaces);
      nextCurrent = Object.values(parsed.surfaces)[0] ?? null;
    } else if (parsed && "attributes" in parsed) {
      const single = parsed as CustomizationState;
      nextCurrent = single;
      if (single?.metadata?.surfaceName) {
        nextMap[single.metadata.surfaceName] = single;
      }
    }
  } catch {
    // ignore malformed cache
  }
  return { map: nextMap, current: nextCurrent };
}

export function useCustomizationStorage(storageKey: string) {
  const initial = useMemo(() => readSnapshot(storageKey), [storageKey]);
  const [customization, setCustomization] = useState<CustomizationState | null>(initial.current);
  const [customizationMap, setCustomizationMap] = useState<CustomizationMap>(initial.map);
  const [initialMap, setInitialMap] = useState<CustomizationMap>(initial.map);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const currentKeyRef = useRef(storageKey);
  // eslint-disable-next-line react-hooks/refs
  const keyChanged = currentKeyRef.current !== storageKey;
  const pendingSnapshot = keyChanged ? readSnapshot(storageKey) : null;

  const handleChange = useCallback(
    (data: CustomizationState) => {
      console.log(
        "[useCustomizationStorage] handleChange",
        storageKey,
        data.metadata.surfaceName,
        data
      );
      const surfaceName = data.metadata.surfaceName;
      const isEmpty = (data.attributes?.length ?? 0) === 0;
      setCustomization(isEmpty ? null : data);
      setCustomizationMap((prev) => {
        const next = { ...prev };
        if (isEmpty) {
          delete next[surfaceName];
        } else {
          next[surfaceName] = data;
        }
        return next;
      });
    },
    [storageKey]
  );

  // Refresh state when the storage key changes.
  // We need to read from localStorage here because the key is driven by variant changes.
  useEffect(() => {
    if (currentKeyRef.current === storageKey) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    currentKeyRef.current = storageKey;
    const next = readSnapshot(storageKey);
    setCustomization(next.current);
    setCustomizationMap(next.map);
    setInitialMap(next.map);
  }, [storageKey]);

  // Persist changes (debounced)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      if (currentKeyRef.current !== storageKey) return;
      const hasEntries = Object.keys(customizationMap).length > 0;
      try {
        if (hasEntries) {
          console.log("[useCustomizationStorage] persist", storageKey, customizationMap);
          window.localStorage.setItem(storageKey, JSON.stringify({ surfaces: customizationMap }));
        } else {
          console.log("[useCustomizationStorage] clear", storageKey);
          window.localStorage.removeItem(storageKey);
        }
      } catch {
        // ignore storage failures
      }
    }, 300);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [customizationMap, storageKey]);

  return {
    customization: keyChanged ? pendingSnapshot?.current ?? null : customization,
    customizationMap: keyChanged ? pendingSnapshot?.map ?? {} : customizationMap,
    initialMap: keyChanged ? pendingSnapshot?.map ?? {} : initialMap,
    hasCustomization: keyChanged
      ? ((pendingSnapshot?.current?.attributes.length ?? 0) > 0)
      : (customization?.attributes.length ?? 0) > 0,
    ready: true,
    handleChange,
  };
}
