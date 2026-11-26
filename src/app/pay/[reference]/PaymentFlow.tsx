"use client";
import { useCallback, useEffect, useState } from "react";
import type { MpesaPayResponse, PayMethod, PaymentStatusResponse, StripePayResponse } from "@/types/contracts";

export type PaymentFlowProps = {
  reference: string;
  enquiryType: "CONSULTATION" | "RESERVATION";
  label: string;
  phone: string; // +E.164 from the enquiry; prefills the M-Pesa field, editable
  mpesaDisplay: string; // e.g. "KES 13,000"
  stripeDisplay: string; // e.g. "$100"
  initialMethod: PayMethod;
  resumePaymentId: string | null; // set when returning from the simulated Stripe redirect: boot straight into polling
  alreadyPaid: boolean;
  whatsappHref: string; // precomputed server-side (CONSULTATION only; "" otherwise)
  mailtoHref: string; // precomputed server-side (CONSULTATION only; "" otherwise)
};

type Stage = "choose" | "submitting" | "waiting" | "paid" | "failed";

export default function PaymentFlow(props: PaymentFlowProps) {
  const [method, setMethod] = useState<PayMethod>(props.initialMethod);
  const [stage, setStage] = useState<Stage>(
    props.alreadyPaid ? "paid" : props.resumePaymentId ? "waiting" : "choose",
  );
  const [paymentId, setPaymentId] = useState<string | null>(props.resumePaymentId);
  const [phone, setPhone] = useState(props.phone);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== "waiting" || !paymentId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();
    const tick = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}`, { cache: "no-store" });
        const data = (await res.json()) as PaymentStatusResponse;
        if (cancelled) return;
        if (data.status === "PAID") {
          setStage("paid");
          return;
        }
        if (data.status === "FAILED" || data.status === "CANCELLED") {
          setError(data.message ?? "The payment didn't go through.");
          setStage("failed");
          return;
        }
      } catch {
        // transient network error: keep polling
      }
      if (cancelled) return;
      if (Date.now() - startedAt > 90_000) {
        setError("We didn't get a confirmation in time.");
        setStage("failed");
        return;
      }
      timer = setTimeout(tick, 3000);
    };
    timer = setTimeout(tick, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stage, paymentId]);

  const payWithMpesa = useCallback(async () => {
    if (stage === "submitting" || stage === "waiting") return;
    if (phone.trim() === "") {
      setError("Enter the phone number to pay from.");
      return;
    }
    setStage("submitting");
    setError(null);
    try {
      const res = await fetch("/api/payments/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: props.reference, phone }),
      });
      const body = (await res.json()) as MpesaPayResponse;
      if (body.ok) {
        setPaymentId(body.paymentId);
        setStage("waiting");
      } else {
        setError(body.message);
        setStage("choose");
      }
    } catch {
      setError("Network problem. Please try again.");
      setStage("choose");
    }
  }, [stage, phone, props.reference]);

  const payWithStripe = useCallback(async () => {
    if (stage === "submitting" || stage === "waiting") return;
    setStage("submitting");
    setError(null);
    try {
      const res = await fetch("/api/payments/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: props.reference }),
      });
      const body = (await res.json()) as StripePayResponse;
      if (body.ok) {
        window.location.assign(body.checkoutUrl);
      } else {
        setError(body.message);
        setStage("choose");
      }
    } catch {
      setError("Network problem. Please try again.");
      setStage("choose");
    }
  }, [stage, props.reference]);

  const retry = useCallback(() => {
    setError(null);
    setPaymentId(null);
    setStage("choose");
    window.history.replaceState(null, "", `/pay/${props.reference}`);
  }, [props.reference]);

  const amountDisplay = method === "mpesa" ? props.mpesaDisplay : props.stripeDisplay;

  return (
    <div className="mt-6">
      {stage === "choose" && (
        <div>
          <p className="text-3xl font-semibold">{amountDisplay}</p>
          <p className="mt-1 text-sm text-gray-500">
            {props.label} &middot; Reference {props.reference}
          </p>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6">
            {method === "mpesa" ? (
              <div>
                <label htmlFor="mpesa-phone" className="block text-sm font-medium text-gray-700">
                  M-Pesa phone number
                </label>
                <input
                  id="mpesa-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                  placeholder="+2547..."
                />
                <button
                  type="button"
                  onClick={payWithMpesa}
                  className="mt-4 w-full rounded-lg bg-green-600 p-3 font-semibold text-white"
                >
                  Pay with M-Pesa
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("stripe")}
                  className="mt-3 w-full text-center text-sm text-gray-500 underline"
                >
                  Paying from outside Kenya? Pay by card instead
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">You&apos;ll be taken to a secure card payment page.</p>
                <button
                  type="button"
                  onClick={payWithStripe}
                  className="mt-4 w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white"
                >
                  Pay by card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("mpesa")}
                  className="mt-3 w-full text-center text-sm text-gray-500 underline"
                >
                  Pay with M-Pesa instead
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "submitting" && (
        <button type="button" disabled className="w-full rounded-lg bg-gray-300 p-3 font-semibold text-gray-600">
          Starting payment&hellip;
        </button>
      )}

      {stage === "waiting" && (
        <div role="status" aria-live="polite" className="rounded-lg bg-amber-50 p-4 text-amber-900">
          {method === "mpesa" ? (
            <>
              <p className="font-bold">Check your phone</p>
              <p className="mt-1 text-sm">Enter your M-Pesa PIN to approve {props.mpesaDisplay}.</p>
            </>
          ) : (
            <p className="font-bold">Confirming your card payment&hellip;</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-amber-900 border-t-transparent"
              aria-hidden="true"
            />
            <span>Keep this page open.</span>
          </div>
          <button type="button" onClick={retry} className="mt-4 text-sm underline">
            Cancel / start again
          </button>
        </div>
      )}

      {stage === "paid" && (
        <div className="rounded-lg bg-green-50 p-4 text-green-900">
          <p className="text-lg font-bold">Payment received</p>
          <p className="mt-1 text-sm">Reference {props.reference}</p>
          <p className="mt-1 text-sm">{amountDisplay}</p>
          {props.enquiryType === "CONSULTATION" ? (
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={props.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-lg bg-green-600 p-3 text-center font-semibold text-white"
              >
                Continue on WhatsApp
              </a>
              <a
                href={props.mailtoHref}
                className="w-full rounded-lg border border-green-600 p-3 text-center font-semibold text-green-700"
              >
                Continue by email
              </a>
            </div>
          ) : (
            <p className="mt-4 text-sm">Your spot is confirmed &mdash; Faith will email you the details.</p>
          )}
        </div>
      )}

      {stage === "failed" && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-sm">If you need help, quote reference {props.reference} when you contact support.</p>
          <button type="button" onClick={retry} className="mt-4 w-full rounded-lg bg-red-600 p-3 font-semibold text-white">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
