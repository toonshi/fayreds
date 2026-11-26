"use client";
// A native select that updates one URL search param (filters live in the URL so they can be shared and survive reloads).
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { select } from "../_lib/ui";
import { Chevron } from "./Chevron";

export function FilterSelect({ param, label, options, value }: { param: string; label: string; options: { value: string; label: string }[]; value?: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value) next.set(param, e.target.value); else next.delete(param);
          next.delete("page");
          router.push(next.size ? `${path}?${next}` : path);
        }}
        className={`${select} w-auto min-w-40`}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Chevron />
    </label>
  );
}
