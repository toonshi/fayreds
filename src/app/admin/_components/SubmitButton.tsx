"use client";
// A submit button for server-action forms: shows a pending label and, optionally, asks before destructive actions.
import { useFormStatus } from "react-dom";

import { btn } from "../_lib/ui";

/** Pass one of the shared `btn` styles as className (defaults to the secondary button). */
export function SubmitButton({ children, pendingLabel, confirm: confirmText, className = btn.secondary }: {
  children: React.ReactNode;
  pendingLabel: string;
  /** if set, the browser asks "OK / Cancel" with this text first */
  confirm?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      onClick={(e) => { if (confirmText && !window.confirm(confirmText)) e.preventDefault(); }}
      className={className}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
