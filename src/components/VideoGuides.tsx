// OWNER: Faith. A row of Faith's TikTok guides. Server component: looks up cover images, then renders cards.
import Link from "next/link";
import { getTikTokMeta, type TikTokMeta } from "@/lib/tiktok";
import { TIKTOK_PROFILE, videoUrl, type Video } from "@/content/videos";
import { TikTokCard } from "./TikTokCard";
import { Icon } from "./Icon";

export async function VideoGuides({ videos, title, intro, id = "guides", showAllLink = false, tone = "white" }: {
  videos: Video[];
  title: string;
  intro?: string;
  id?: string;
  showAllLink?: boolean;
  tone?: "white" | "sand";
}) {
  if (videos.length === 0) return null;
  const metas: TikTokMeta[] = await Promise.all(videos.map((v) => (v.cover ? {} : getTikTokMeta(videoUrl(v.id)))));
  return (
    <section aria-labelledby={id} className={tone === "sand" ? "bg-sand-100 py-16 sm:py-20" : "bg-white py-16 sm:py-20"}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id={id} className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h2>
            {intro && <p className="mt-3 text-lg text-stone-700">{intro}</p>}
          </div>
          {showAllLink ? (
            <Link href="/guides" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-800 hover:underline">
              All guides <Icon name="arrowRight" />
            </Link>
          ) : (
            <a href={TIKTOK_PROFILE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-800 hover:underline">
              @faith_mutune on TikTok <Icon name="arrowRight" />
            </a>
          )}
        </div>
        {/* phones: swipe sideways; larger screens: a grid */}
        <ul className={`-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 ${videos.length > 3 ? "lg:grid-cols-5" : ""}`}>
          {videos.map((v, i) => (
            <li key={v.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
              <TikTokCard video={v} thumbnail={metas[i].thumbnail} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
