"use client";
// Faith writes a reply and it goes to the customer by SMS (Africa's Talking) and/or email,
// straight from the admin. No phone or mail app needed.
import { useActionState, useEffect, useRef, useState } from "react";
import { replyToEnquiry, type ReplyState } from "../_lib/actions";
import { btn, h2, input, textarea } from "../_lib/ui";

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
  const channels = [sms && "SMS", email && "email"].filter(Boolean).join(" + ");

  return (
    <form action={action} className="space-y-3">
      <label htmlFor={`reply-${id}`} className={`block ${h2}`}>Reply to {firstName}</label>

      {templates.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Start from a template">
          {templates.map((t) => (
            <button key={t.label} type="button" onClick={() => { setMessage(t.text); box.current?.focus(); }}
              className="h-8 rounded-full border border-stone-200 bg-white px-3 text-[13px] text-stone-700 transition-[background-color,border-color,scale] duration-150 hover:border-stone-300 hover:bg-sand-50 active:scale-[0.96]">
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div>
        <textarea id={`reply-${id}`} ref={box} name="message" rows={6} value={message} onChange={(e) => setMessage(e.target.value)}
          required maxLength={2000} placeholder={`Hi ${firstName}, …`} autoComplete="off" className={textarea} />
        <p className="mt-1.5 text-[13px] tabular-nums text-stone-500">
          {message.length} characters{sms && message.length > 0 ? ` · ${parts} SMS${parts > 1 ? " (long messages cost more)" : ""}` : ""}
        </p>
      </div>

      {email && (
        <label className="block">
          <span className="text-[13px] text-stone-500">Email subject</span>
          <input name="subject" defaultValue={`Re: your request ${reference}`} maxLength={150} autoComplete="off" className={`mt-1 ${input}`} />
        </label>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-1">
        <fieldset className="flex gap-5 text-sm">
          <legend className="sr-only">Send by</legend>
          <label className={`inline-flex h-10 items-center gap-2 ${smsAvailable ? "text-stone-800" : "text-stone-400"}`}
            title={smsAvailable ? undefined : "SMS only goes to Kenyan (+254) numbers"}>
            <input type="checkbox" name="sms" checked={sms} disabled={!smsAvailable} onChange={(e) => setSms(e.target.checked)} className="size-4 accent-brand-800" />
            SMS{!smsAvailable && <span className="sr-only"> (Kenyan numbers only)</span>}
          </label>
          <label className="inline-flex h-10 items-center gap-2 text-stone-800">
            <input type="checkbox" name="email" checked={email} onChange={(e) => setEmail(e.target.checked)} className="size-4 accent-brand-800" />
            Email
          </label>
        </fieldset>
        <button disabled={pending || !message.trim() || (!sms && !email)} className={btn.primary}>
          {pending ? "Sending…" : channels ? `Send ${channels}` : "Choose SMS or email"}
        </button>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-[13px]">
        {state?.error ? <span className="text-rose-700">{state.error}</span>
          : state?.result && !pending ? <span className={state.ok ? "text-emerald-700" : "text-sun-700"}>{state.result}</span>
          : <span className="text-stone-500">{smsAvailable ? "Replies are logged in your private notes." : "SMS only goes to Kenyan numbers. Replies are logged in your private notes."}</span>}
      </p>
    </form>
  );
}
