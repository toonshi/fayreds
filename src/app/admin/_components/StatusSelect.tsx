"use client";
// Changing the status saves immediately: no separate Save button to forget.
import { useState, useTransition } from "react";
import type { EnquiryStatus } from "@prisma/client";
import { setEnquiryStatus } from "../_lib/actions";
import { STATUSES, statusDot } from "../_lib/format";
import { select } from "../_lib/ui";
import { Chevron } from "./Chevron";

export function StatusSelect({ id, status }: { id: string; status: EnquiryStatus }) {
  const [value, setValue] = useState(status);
  // follow changes made elsewhere (e.g. sending a reply moves New to In progress)
  const [seen, setSeen] = useState(status);
  if (status !== seen) { setSeen(status); setValue(status); }
  const [note, setNote] = useState<{ text: string; bad?: boolean }>();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <span role="status" aria-live="polite" className={`text-right text-sm ${note?.bad ? "text-rose-700" : "text-stone-500"}`}>
        {pending ? "Saving…" : note?.text}
      </span>
      <label className="flex items-center gap-2.5">
        <span className="text-sm text-stone-500">Status</span>
        <span className="relative inline-block">
          <span aria-hidden className={`pointer-events-none absolute top-1/2 left-3 size-2 -translate-y-1/2 rounded-full ${statusDot[value]}`} />
          <select
            value={value}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.value as EnquiryStatus;
              const prev = value;
              setValue(next);
              setNote(undefined);
              start(async () => {
                const r = await setEnquiryStatus(id, next);
                if (r?.ok) setNote({ text: "Saved" });
                else { setValue(prev); setNote({ text: r?.error ?? "Couldn't save. Try again.", bad: true }); }
              });
            }}
            className={`${select} w-48 pl-7 font-medium`}
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Chevron />
        </span>
      </label>
    </div>
  );
}
