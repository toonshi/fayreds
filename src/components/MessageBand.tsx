"use client";
// OWNER: Faith. Full-width photo with a "Send Faith a message" card. Sending opens WhatsApp with the
// message filled in (works on phones and WhatsApp Web), so there's no inbox to set up.
import Image from "next/image";
import { useId, useState } from "react";
import { site, whatsappLink } from "@/lib/site";
import { Icon } from "./Icon";

export function MessageBand() {
  const uid = useId();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) { setError("Write a short message first."); return; }
    const text = `Hi Faith, I'm ${name.trim() || "getting in touch"} via fayreds.com. ${msg.trim()}`;
    window.open(whatsappLink(text), "_blank", "noopener");
  }

  const input = "mt-1 block w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2.5 text-base text-stone-900 placeholder:text-stone-500 focus:border-brand-800 focus:ring-0 focus-visible:shadow-none focus-visible:outline-none";
  return (
    <section aria-labelledby="message" className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0">
        <Image src="/images/faith-jetski.webp" alt="" fill sizes="100vw" className="parallax-img object-cover" style={{ objectPosition: "40% 60%" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
      </div>
      <div className="relative mx-auto grid min-h-[600px] max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div className="reveal text-white">
          <h2 className="font-display text-4xl font-bold leading-tight drop-shadow sm:text-5xl">Not sure where to start?</h2>
          <p className="mt-4 max-w-md text-lg text-white/90">Tell Faith what kind of trip you&apos;re dreaming of. She answers personally.</p>
        </div>
        <form onSubmit={send} aria-labelledby="message" className="reveal rounded-2xl bg-white p-7 shadow-2xl shadow-black/20 sm:p-8 md:justify-self-end md:w-[26rem]">
          <h2 id="message" className="font-display text-2xl font-bold text-stone-900">Send Faith a message</h2>
          <label htmlFor={`${uid}-name`} className="mt-5 block text-sm font-medium text-stone-700">Your name
            <input id={`${uid}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="e.g. Amina…" />
          </label>
          <label htmlFor={`${uid}-msg`} className="mt-4 block text-sm font-medium text-stone-700">Message
            <textarea id={`${uid}-msg`} value={msg} onChange={(e) => { setMsg(e.target.value); setError(""); }} rows={3}
              aria-invalid={error ? true : undefined} aria-describedby={error ? `${uid}-err` : undefined}
              className={`${input} resize-none`} placeholder="Where would you like to go, and when?…" />
          </label>
          {error && <p id={`${uid}-err`} role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
          <button className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-800 px-6 font-semibold text-white transition-[background-color,scale] hover:bg-brand-900 active:scale-[0.96]">
            <Icon name="send" className="h-4 w-4" /> Send on WhatsApp
          </button>
          <p className="mt-4 text-sm text-stone-600">Prefer email? <a href={`mailto:${site.email}`} className="font-medium text-brand-800 underline">{site.email}</a></p>
        </form>
      </div>
    </section>
  );
}
