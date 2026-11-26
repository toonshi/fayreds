"use client";
// OWNER: Faith. All guides in one grid, with topic filters (each card still shows its topic).
import { useState } from "react";
import { categoryLabel, type Video, type VideoCategory } from "@/content/videos";
import { TikTokCard } from "./TikTokCard";

export function GuideGrid({ videos, thumbs }: { videos: Video[]; thumbs: Record<string, string | undefined> }) {
  const topics = [...new Set(videos.map((v) => v.category))] as VideoCategory[];
  const [topic, setTopic] = useState<VideoCategory | "all">("all");
  const shown = topic === "all" ? videos : videos.filter((v) => v.category === topic);
  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors ${active ? "bg-brand-800 text-white" : "bg-white text-stone-800 ring-1 ring-stone-300 hover:bg-brand-50"}`;

  return (
    <>
      <div role="group" aria-label="Filter guides by topic" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={topic === "all"} onClick={() => setTopic("all")} className={chip(topic === "all")}>
          All <span className="tabular-nums opacity-70">{videos.length}</span>
        </button>
        {topics.map((t) => (
          <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={chip(topic === t)}>
            {categoryLabel[t]} <span className="tabular-nums opacity-70">{videos.filter((v) => v.category === t).length}</span>
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} guides shown</p>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((v) => <li key={v.id}><TikTokCard video={v} thumbnail={thumbs[v.id]} /></li>)}
      </ul>
    </>
  );
}
