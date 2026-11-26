"use client";
import { useActionState } from "react";
import { login } from "../_lib/actions";
import { btn, input } from "../_lib/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-medium text-stone-800">Password</span>
        <input
          name="password" type="password" required autoFocus autoComplete="current-password"
          className={`mt-1.5 ${input}`}
        />
      </label>
      {state?.error && <p role="alert" className="text-sm text-rose-700">{state.error}</p>}
      <button disabled={pending} className={`${btn.primary} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
