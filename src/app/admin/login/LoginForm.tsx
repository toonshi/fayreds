"use client";
import { useActionState } from "react";
import { login } from "../_lib/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password" type="password" required autoFocus autoComplete="current-password"
          className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 px-3 text-base outline-none focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/40"
        />
      </label>
      {state?.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      <button disabled={pending} className="min-h-11 w-full cursor-pointer rounded-lg bg-teal-700 font-semibold text-white transition-[background-color,scale] hover:bg-teal-800 active:not-disabled:scale-[0.96] disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
