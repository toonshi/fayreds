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
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
      </label>
      {state?.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
