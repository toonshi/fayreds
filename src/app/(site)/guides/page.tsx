// OWNER: Faith. /guides: Faith's TikTok guides, grouped by what they help you plan.
import type { Metadata } from "next";
import Link from "next/link";
import { getTikTokMeta } from "@/lib/tiktok";
import { TIKTOK_PROFILE, videoUrl, videos } from "@/content/videos";
import { GuideGrid } from "@/components/GuideGrid";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Travel guides · Fayreds Travel",
  description: "Faith Mutune's video guides to restaurants, hotels, beach resorts, adventures and budget days out in Nairobi and across Kenya.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  // TikTok cover lookups only for videos without their own cover image
  const thumbs = Object.fromEntries(await Promise.all(videos.map(async (v) => [v.id, v.cover ? undefined : (await getTikTokMeta(videoUrl(v.id))).thumbnail] as const)));

  return (
    <main className="bg-sand-50 text-stone-900">
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-12 sm:pt-16">
        <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">Travel guides</h1>
        <p className="mt-4 max-w-2xl text-lg text-stone-700">
          Short video guides from places Faith has been: where to stay, where to eat, what to do and how to do Nairobi on a budget.
        </p>
      </section>

      <section aria-label="All guides" className="mx-auto max-w-6xl px-4 pb-12 pt-4">
        <GuideGrid key={topic ?? "all"} videos={videos} thumbs={thumbs} initialTopic={topic} />
      </section>

      <section className="mt-8 bg-brand-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Want a plan like this for your own trip?</h2>
            <p className="mt-2 text-brand-100">Tell Faith your dates and budget and she&apos;ll put together the places worth your money.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/consultation" className="rounded-full bg-sun-400 px-6 py-3.5 font-semibold text-brand-950 transition-[background-color,scale] hover:bg-sun-300 active:scale-[0.96]">Book a consultation</Link>
            <a href={TIKTOK_PROFILE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full px-6 py-3.5 font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10">
              More on TikTok <Icon name="arrowRight" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
