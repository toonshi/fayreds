"use client";
// Faith writes a reply and it goes to the customer by SMS (Africa's Talking) and/or email,
// straight from the admin. No phone or mail app needed.
import { useActionState, useEffect, useRef, useState } from "react";
import { replyToEnquiry, type ReplyState } from "../_lib/actions";

type Template = { label: string; text: string };

export function ReplyForm({ id, firstName, reference, smsAvailable, templates }: {
  id: string;
  firstName: string;
  reference: string;
  /** false when the number isn't Kenyan (SMS only goes to +254 unless SMS_INTERNATIONAL is on) */
  smsAvailable: boolean;
  templates: Template[];
}) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToEnquiry.bind(null, id), undefined);
  const [message, setMessage] = useState("");
  const [sms, setSms] = useState(smsAvailable);
  const [email, setEmail] = useState(true);
  const box = useRef<HTMLTextAreaElement>(null);

  // clear the box after a successful send
  useEffect(() => {
    if (state?.ok) setMessage("");
  }, [state?.sentAt, state?.ok]);

  const parts = Math.max(1, Math.ceil(message.length / 160));

  return (
    <form action={action} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-stone-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Reply to {firstName}</h2>
        <span className="text-xs text-stone-600">Sent from {reference}&apos;s enquiry</span>
      </div>

      {templates.length > 0 && (
        <div>
          <p className="text-sm text-stone-600">Start from a template</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {templates.map((t) => (
              <button key={t.label} type="button" onClick={() => { setMessage(t.text); box.current?.focus(); }}
                className="min-h-9 rounded-full border border-stone-300 bg-white px-3 text-sm hover:bg-stone-50">
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block text-sm">
        <span className="text-stone-600">Message</span>
        <textarea ref={box} name="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={2000}
          placeholder={`Hi ${firstName}, …`}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-base sm:text-sm" />
        <span className="mt-1 block text-xs text-stone-600 tabular-nums">
          {message.length} characters{sms && message.length > 0 ? ` · ${parts} SMS${parts > 1 ? " (long messages cost more)" : ""}` : ""}
        </span>
      </label>

      {email && (
        <label className="block text-sm">
          <span className="text-stone-600">Email subject</span>
          <input name="subject" defaultValue={`Re: your request ${reference}`} maxLength={150}
            className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base sm:text-sm" />
        </label>
      )}

      <fieldset className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <legend className="sr-only">Send by</legend>
        <label className={`inline-flex min-h-11 items-center gap-2 ${smsAvailable ? "" : "text-stone-400"}`}>
          <input type="checkbox" name="sms" checked={sms} disabled={!smsAvailable} onChange={(e) => setSms(e.target.checked)} className="h-5 w-5" />
          SMS{!smsAvailable && " (Kenyan numbers only)"}
        </label>
        <label className="inline-flex min-h-11 items-center gap-2">
          <input type="checkbox" name="email" checked={email} onChange={(e) => setEmail(e.target.checked)} className="h-5 w-5" />
          Email
        </label>
      </fieldset>

      <button disabled={pending || !message.trim() || (!sms && !email)}
        className="min-h-11 w-full rounded-lg bg-teal-700 font-semibold text-white transition-[background-color,scale] hover:bg-teal-800 active:not-disabled:scale-[0.96] disabled:opacity-60">
        {pending ? "Sending…" : `Send ${[sms && "SMS", email && "email"].filter(Boolean).join(" + ") || "reply"}`}
      </button>

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {state?.error ? <span className="text-rose-700">{state.error}</span>
          : state?.result && !pending ? <span className={state.ok ? "font-medium text-emerald-700" : "text-amber-800"}>{state.ok ? "✓ " : ""}{state.result}</span>
          : <span className="text-xs text-stone-600">Each reply is saved at the top of your private notes.</span>}
      </p>
    </form>
  );
}
