"use client";
import { useActionState, useState } from "react";
import { saveNotes, type EnquiryFormState } from "../_lib/actions";
import { btn, h2, textarea } from "../_lib/ui";

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action, pending] = useActionState<EnquiryFormState, FormData>(saveNotes.bind(null, id), undefined);
  const [value, setValue] = useState(notes);
  const [saved, setSaved] = useState(notes);
  const dirty = value !== saved;
  // a sent reply adds a line to the notes on the server: show it, unless Faith is mid-edit
  const [seen, setSeen] = useState(notes);
  if (notes !== seen) { setSeen(notes); setSaved(notes); if (!dirty) setValue(notes); }

  return (
    <form
      action={(fd) => { setSaved(String(fd.get("notes") ?? "")); return action(fd); }}
      className="space-y-3"
    >
      <label htmlFor={`notes-${id}`} className={`block ${h2}`}>Private notes</label>
      <textarea
        id={`notes-${id}`} name="notes" rows={7} value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="Calls, quotes sent, follow-up dates…" autoComplete="off" className={textarea}
      />
      <div className="flex items-center gap-3">
        <button disabled={pending || !dirty} className={btn.secondary}>{pending ? "Saving…" : "Save notes"}</button>
        <p role="status" aria-live="polite" className="text-sm text-stone-500">
          {state?.error ? <span className="text-rose-700">{state.error}</span>
            : dirty ? "Unsaved changes" : state?.ok ? "Saved" : "Only you can see these."}
        </p>
      </div>
    </form>
  );
}
