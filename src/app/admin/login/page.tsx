import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin login · Fayreds Travel", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4 font-sans text-stone-900 antialiased">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-8px_rgb(0_0_0/0.08)] ring-1 ring-stone-200/70">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Fayreds admin</h1>
        <p className="mt-1.5 text-sm text-stone-600">Sign in to see enquiries, payments and trips.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </main>
  );
}
