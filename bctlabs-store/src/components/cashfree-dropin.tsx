"use client";

import { useEffect, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

const CONTAINER_ID = "cashfree-dropin-container";

type CashfreeCheckoutOptions = {
  paymentSessionId: string;
  redirectTarget: "_modal" | { type: "element"; container: string };
};

type CashfreeInstance = {
  checkout: (options: CashfreeCheckoutOptions) => Promise<unknown>;
};

type CashfreeLoader = (options: {
  mode: "sandbox" | "production";
}) => Promise<CashfreeInstance | null>;

const loadCashfree = load as unknown as CashfreeLoader;

export function CashfreeDropIn({
  sessionId,
  mode,
  onFailure,
}: {
  sessionId: string;
  mode: "sandbox" | "production";
  onSuccess: () => void;
  onFailure: (message: string) => void;
}) {
  const [readySession, setReadySession] = useState<string | null>(null);
  const onFailureRef = useRef(onFailure);
  const sessionKey = `${mode}:${sessionId}`;
  const ready = readySession === sessionKey;

  useEffect(() => {
    onFailureRef.current = onFailure;
  }, [onFailure]);

  useEffect(() => {
    let cancelled = false;

    async function mountCheckout() {
      try {
        const cashfree = await loadCashfree({ mode });
        if (cancelled) return;
        if (!cashfree) throw new Error("Cashfree did not load");

        const elementTarget = {
          type: "element" as const,
          container: `#${CONTAINER_ID}`,
        };

        try {
          await cashfree.checkout({
            paymentSessionId: sessionId,
            redirectTarget: elementTarget,
          });
        } catch {
          if (cancelled) return;
          // Element mode can be unavailable (for example in a hostile iframe
          // environment); the modal keeps the customer on this domain.
          await cashfree.checkout({ paymentSessionId: sessionId, redirectTarget: "_modal" });
        }

        if (!cancelled) setReadySession(sessionKey);
      } catch {
        if (!cancelled) {
          onFailureRef.current("Could not load the payment form. Please try again.");
        }
      }
    }

    void mountCheckout();
    return () => {
      cancelled = true;
    };
  }, [sessionId, mode, sessionKey]);

  return (
    <div className="mt-4">
      <p data-testid="cashfree-dropin-status" role="status" className="mb-3 text-xs font-medium text-slate-500">
        {ready ? "Payment form ready" : "Loading secure payment form..."}
      </p>
      <div id={CONTAINER_ID} data-testid={CONTAINER_ID} />
    </div>
  );
}
