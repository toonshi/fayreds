"use client";
// OWNER: Faith. One TikTok video: a light cover with a play button. TikTok's player only
// loads when someone taps play, so five videos on a page cost nothing until they're watched.
import { useState } from "react";
import { categoryLabel, videoUrl, type Video } from "@/content/videos";
import { Icon } from "./Icon";

export function TikTokCard({ video, thumbnail }: { video: Video; thumbnail?: string }) {
  const [playing, setPlaying] = useState(false);
  const cover = video.cover ?? thumbnail;
  const url = videoUrl(video.id);

  return (
    <figure className="flex h-full flex-col">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-brand-900 shadow-sm ring-1 ring-black/5">
        {playing ? (
          <iframe
            src={`https://www.tiktok.com/player/v1/${video.id}?autoplay=1&rel=0&description=1&music_info=1`}
            title={`TikTok video: ${video.title}`}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 text-left">
            <span className="sr-only">Play video: </span>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- cover image comes from TikTok's CDN
              <img src={cover} alt="" loading="lazy" decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
            ) : (
              <BrandCover video={video} />
            )}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-900">
              {categoryLabel[video.category]}
            </span>
            <span aria-hidden className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-brand-900 shadow-lg transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
            </span>
            <span className="absolute bottom-3 left-3 right-[4.25rem] text-white">
              <span className="block text-xs font-medium text-white/85">{video.place}</span>
              <span className="mt-0.5 block font-display text-lg font-semibold leading-snug text-balance">{video.title}</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 flex flex-1 flex-col">
        <p className="text-sm text-stone-700">{video.blurb}</p>
        <a href={url} target="_blank" rel="noreferrer"
          className="mt-auto inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-800 hover:underline">
          Watch on TikTok <Icon name="arrowRight" />
        </a>
      </figcaption>
    </figure>
  );
}

/** Used when TikTok's cover image isn't available: the brand sunset, tinted per category. */
function BrandCover({ video }: { video: Video }) {
  const sky = { Eat: "from-sun-200 to-sun-400", Stay: "from-sand-100 to-sun-300", Do: "from-brand-100 to-sun-300", Budget: "from-sun-100 to-sun-200" }[video.category];
  return (
    <span aria-hidden className={`absolute inset-0 bg-gradient-to-b ${sky}`}>
      <span className="absolute left-1/2 top-[30%] aspect-square w-1/2 -translate-x-1/2 rounded-full bg-sun-400" />
      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-800" />
    </span>
  );
}
