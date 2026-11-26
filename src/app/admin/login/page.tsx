import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin login · Fayreds Travel", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 text-stone-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Fayreds Travel</p>
        <h1 className="mt-1 text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-stone-500">Sign in to see enquiries, payments and trips.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </main>
  );
}
