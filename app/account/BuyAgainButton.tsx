"use client";

import { copy } from "@/config/copy";
import { useCart } from "@shopify/hydrogen-react";
import { useEffect, useMemo, useRef, useState } from "react";

type OrderLineInput = {
  title: string;
  quantity: number;
  variantId?: string | null;
};

type BuyAgainButtonProps = {
  orderName: string;
  lines: OrderLineInput[];
};

function totalQuantity(
  lines: Array<{ quantity?: number | null } | null | undefined>,
): number {
  return lines.reduce((sum, line) => sum + (line?.quantity ?? 0), 0);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BuyAgainButton({ orderName, lines }: BuyAgainButtonProps) {
  const { lines: cartLines, linesAdd, linesRemove, error } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{
    kind: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const cartLinesRef = useRef(cartLines ?? []);
  const cartErrorRef = useRef(error);

  useEffect(() => {
    cartLinesRef.current = cartLines ?? [];
  }, [cartLines]);

  useEffect(() => {
    cartErrorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen]);

  const reorderableLines = useMemo(
    () =>
      lines
        .filter((line) => Boolean(line.variantId) && (line.quantity ?? 0) > 0)
        .map((line) => ({
          merchandiseId: String(line.variantId),
          quantity: line.quantity,
        })),
    [lines],
  );

  const skippedCount = Math.max(lines.length - reorderableLines.length, 0);

  const runBuyAgain = async (mode: "merge" | "replace") => {
    if (busy) return;
    if (!reorderableLines.length) {
      setToast({
        kind: "warning",
        message: copy.account.buyAgainNoReorderable,
      });
      setModalOpen(false);
      return;
    }

    setBusy(true);
    setModalOpen(false);
    setToast(null);

    const beforeQty = totalQuantity(cartLinesRef.current);
    const lineIdsToRemove = (cartLinesRef.current ?? [])
      .map((line: any) => line?.id)
      .filter((id: string | undefined) => Boolean(id));

    try {
      if (mode === "replace" && lineIdsToRemove.length) {
        linesRemove(lineIdsToRemove);
        await sleep(300);
      }

      linesAdd(reorderableLines);
      await sleep(600);

      const afterQty = totalQuantity(cartLinesRef.current);
      const delta = afterQty - beforeQty;

      if (delta <= 0 && cartErrorRef.current) {
        setToast({
          kind: "error",
          message: copy.account.buyAgainAddFailed,
        });
      } else {
        const baseMessage =
          delta <= 0
            ? copy.account.buyAgainProcessed(orderName)
            : copy.account.buyAgainAdded(orderName);

        if (skippedCount > 0) {
          setToast({
            kind: "warning",
            message: `${baseMessage} ${copy.account.buyAgainSkippedSuffix(skippedCount)}`,
          });
        } else {
          setToast({
            kind: "success",
            message: baseMessage,
          });
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const hasCartItems = (cartLines ?? []).length > 0;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className="btn-outline small"
        onClick={() => {
          setToast(null);
          if (hasCartItems) {
            setModalOpen(true);
            return;
          }
          void runBuyAgain("merge");
        }}
        disabled={busy}
      >
        {busy ? copy.account.buyAgainBusy : copy.account.buyAgain}
      </button>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/65"
            onClick={() => {
              if (!busy) setModalOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-primary-900/40 bg-background p-5 text-sm text-primary-100 shadow-2xl shadow-primary-900/50">
            <h3 className="text-base font-semibold">{copy.account.buyAgainCartNotEmptyTitle}</h3>
            <p className="mt-2 text-primary-200/90">
              <span className="font-medium">{orderName}</span>
            </p>
            <p className="mt-2 text-primary-200/90">{copy.account.buyAgainCartNotEmptyText}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary small"
                onClick={() => void runBuyAgain("merge")}
                disabled={busy}
              >
                {copy.account.mergeCart}
              </button>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => void runBuyAgain("replace")}
                disabled={busy}
              >
                {copy.account.replaceCart}
              </button>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => setModalOpen(false)}
                disabled={busy}
              >
                {copy.account.cancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed right-6 top-20 z-[60] max-w-sm">
          <div
            className={`rounded-lg border px-4 py-3 text-sm shadow-xl ${
              toast.kind === "error"
                ? "border-red-500/50 bg-red-900/70 text-red-100"
                : toast.kind === "warning"
                  ? "border-yellow-500/50 bg-yellow-900/70 text-yellow-100"
                  : "border-green-500/50 bg-green-900/70 text-green-100"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
