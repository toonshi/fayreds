"use client";
// Shows "Saved ✓" once after a redirect with ?saved=1, then cleans the URL so it doesn't reappear on reload.
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SavedNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (params.get("saved") !== "1") return;
    setShow(true);
    router.replace(path, { scroll: false });
    const t = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(t);
  }, [params, path, router]);
  return (
    <p role="status" aria-live="polite" className={`rounded-lg px-3 py-2 text-sm transition-opacity ${show ? "bg-emerald-50 text-emerald-800 opacity-100" : "opacity-0"}`}>
      {show ? "✓ Saved" : ""}
    </p>
  );
}
