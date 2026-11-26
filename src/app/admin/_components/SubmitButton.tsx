"use client";
// A submit button for server-action forms: shows a pending label and, optionally, asks before destructive actions.
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel, confirm: confirmText, className = "" }: {
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
      className={`min-h-11 rounded-md px-3 transition-[background-color,scale] active:not-disabled:scale-[0.96] disabled:opacity-60 ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
