"use client";
// OWNER: Faith. A light, accessible carousel on top of native scrolling:
// swipe / trackpad / shift+wheel / arrow keys all work, buttons page through, snap keeps cards aligned.
import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Carousel({ label, children, itemClassName = "w-[72%] sm:w-[42%] lg:w-[calc((100%-3*1.25rem)/4.25)]" }: {
  /** what the carousel shows, e.g. "Faith's video guides" */
  label: string;
  children: ReactNode;
  /** card width per breakpoint; the partial last card hints there's more */
  itemClassName?: string;
}) {
  const id = useId();
  const track = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ prev: false, next: true, progress: 0, visible: 1 });
  const items = Children.toArray(children);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft < max - 4,
      progress: max > 0 ? el.scrollLeft / max : 1,
      visible: max > 0 ? el.clientWidth / el.scrollWidth : 1,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", measure); ro.disconnect(); };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  const btn = "flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-900 shadow-sm ring-1 ring-stone-200 transition-[background-color,opacity,scale] hover:bg-brand-50 active:not-disabled:scale-[0.94] disabled:cursor-default disabled:opacity-35";
  const thumb = Math.max(state.visible, 0.12);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="[--carousel-bg:white]">
      <div className="relative">
        {/* edge fades show there is more to scroll (desktop) */}
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[var(--carousel-bg)] to-transparent transition-opacity sm:block ${state.prev ? "opacity-100" : "opacity-0"}`} />
        <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[var(--carousel-bg)] to-transparent transition-opacity sm:block ${state.next ? "opacity-100" : "opacity-0"}`} />
        <ul
          id={id}
          ref={track}
          tabIndex={0}
          aria-label={`${label}: scroll sideways or use the arrow buttons`}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto overscroll-x-contain px-4 pb-4 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-800 focus-visible:ring-offset-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
        >
          {items.map((child, i) => (
            <li key={i} aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`} className={`shrink-0 snap-start ${itemClassName}`}>
              {child}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div aria-hidden className="relative h-1 flex-1 overflow-hidden rounded-full bg-stone-300/60">
          <div className="absolute inset-y-0 rounded-full bg-brand-800 transition-[left] duration-150 ease-out"
            style={{ width: `${thumb * 100}%`, left: `${state.progress * (1 - thumb) * 100}%` }} />
        </div>
        <div className="flex gap-2">
          <button type="button" className={btn} onClick={() => page(-1)} disabled={!state.prev} aria-controls={id} aria-label="Previous">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </button>
          <button type="button" className={btn} onClick={() => page(1)} disabled={!state.next} aria-controls={id} aria-label="Next">
            <Icon name="arrowRight" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
