"use client";
import { useActionState } from "react";
import type { EnquiryStatus } from "@prisma/client";
import { updateEnquiry, type EnquiryFormState } from "../_lib/actions";
import { STATUSES } from "../_lib/format";

export function EnquiryManageForm({ id, status, notes, updatedLabel }: { id: string; status: EnquiryStatus; notes: string; updatedLabel: string }) {
  const [state, action, pending] = useActionState<EnquiryFormState, FormData>(updateEnquiry.bind(null, id), undefined);
  return (
    <form action={action} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-stone-200 lg:sticky lg:top-20">
      <h2 className="font-semibold">Manage</h2>
      <label className="block text-sm">
        <span className="text-stone-600">Status</span>
        <select name="status" defaultValue={status} className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-2 text-base sm:text-sm">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Private notes</span>
        <textarea name="notes" rows={6} defaultValue={notes} placeholder="Calls, quotes sent, follow-up dates…"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-base sm:text-sm" />
      </label>
      <button disabled={pending} className="min-h-11 w-full rounded-lg bg-teal-700 font-semibold text-white transition-[background-color,scale] hover:bg-teal-800 active:not-disabled:scale-[0.96] disabled:opacity-60">
        {pending ? "Saving…" : "Save changes"}
      </button>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {state?.error ? <span className="text-rose-700">{state.error}</span>
          : state?.ok && !pending ? <span className="font-medium text-emerald-700">✓ Saved</span>
          : <span className="text-xs text-stone-600">Last updated {updatedLabel}</span>}
      </p>
    </form>
  );
}
