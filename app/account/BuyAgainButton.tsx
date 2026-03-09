"use client";

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
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
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
      setFeedback({
        kind: "warning",
        message: "Diese Bestellung enthält keine wiederbestellbaren Artikel.",
      });
      setConfirming(false);
      return;
    }

    setBusy(true);
    setConfirming(false);
    setFeedback(null);

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
        setFeedback({
          kind: "error",
          message: "Artikel konnten nicht in den Warenkorb gelegt werden.",
        });
      } else {
        const baseMessage =
          delta <= 0
            ? `${orderName} wurde verarbeitet.`
            : `${orderName} wurde dem Warenkorb hinzugefügt.`;

        if (skippedCount > 0) {
          setFeedback({
            kind: "warning",
            message: `${baseMessage} ${skippedCount} Artikel konnten nicht wiederbestellt werden.`,
          });
        } else {
          setFeedback({
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
          setFeedback(null);
          if (hasCartItems) {
            setConfirming(true);
            return;
          }
          void runBuyAgain("merge");
        }}
        disabled={busy}
      >
        {busy ? "Wird hinzugefügt…" : "Erneut kaufen"}
      </button>

      {confirming ? (
        <div className="rounded-lg border border-primary-900/40 bg-background p-3 text-xs text-primary-200/90">
          <p className="mb-2">Warenkorb ist nicht leer. Wie möchten Sie fortfahren?</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary small"
              onClick={() => void runBuyAgain("merge")}
              disabled={busy}
            >
              Zusammenführen
            </button>
            <button
              type="button"
              className="btn-outline small"
              onClick={() => void runBuyAgain("replace")}
              disabled={busy}
            >
              Ersetzen
            </button>
            <button
              type="button"
              className="btn-outline small"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p
          className={`max-w-xs text-right text-xs ${
            feedback.kind === "error"
              ? "text-red-300"
              : feedback.kind === "warning"
                ? "text-yellow-200"
                : "text-green-200"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
