import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="-ml-2 inline-flex min-h-11 items-center rounded-md px-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900">
      ← {children}
    </Link>
  );
}
