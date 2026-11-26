// OWNER: Hendy. One-tap WhatsApp / Email / Call. The client's preferred channel comes first and is the filled button.
// WhatsApp opens the app (wa.me) with a greeting filled in; Email opens the mail app with a subject; Call dials.
// The phone number and email are shown on the buttons themselves, so there is no separate contact box.
import { site } from "@/lib/site";
import type { ContactPref } from "../_lib/format";
import { waNumber } from "../_lib/format";
import { btn } from "../_lib/ui";

type Props = { name: string; phone: string; email: string; reference: string; what: string; pref: ContactPref };

const icons = {
  WhatsApp: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.6c-.2.6-1.2 1.1-1.7 1.1-.4.1-1 .1-3-.7-2.6-1-4.2-3.6-4.3-3.8-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.4l.8 1.9c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2z",
  Email: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 1 8 6 8-6",
  Call: "M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z",
} as const;

export function ContactButtons({ name, phone, email, reference, what, pref }: Props) {
  const first = name.split(" ")[0];
  const greeting = `Hi ${first}, this is Faith from ${site.name} about your ${what} request (${reference}).`;
  const links = {
    WhatsApp: { href: `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(greeting)}`, external: true, text: "WhatsApp", sr: "" },
    Email: { href: `mailto:${email}?subject=${encodeURIComponent(`${site.name}: your request ${reference}`)}&body=${encodeURIComponent(`${greeting}\n\n`)}`, external: false, text: email, sr: "Email " },
    Call: { href: `tel:${phone}`, external: false, text: phone, sr: "Call " },
  } as const;
  const order = (pref.via === "Email" ? ["Email", "WhatsApp", "Call"] : ["WhatsApp", "Email", "Call"]) as (keyof typeof links)[];

  return (
    <div className="flex flex-wrap gap-2">
      {order.map((k) => {
        const preferred = k === pref.via;
        const l = links[k];
        return (
          <a key={k} href={l.href} {...(l.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className={`${preferred ? btn.primary : btn.secondary} max-w-full`}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill={k === "WhatsApp" ? "currentColor" : "none"} stroke={k === "WhatsApp" ? "none" : "currentColor"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d={icons[k]} />
            </svg>
            {l.sr && <span className="sr-only">{l.sr}</span>}
            <span className={`truncate ${k === "Call" ? "tabular-nums" : ""}`}>{l.text}</span>
            {preferred && <span className="sr-only"> (preferred)</span>}
          </a>
        );
      })}
    </div>
  );
}
