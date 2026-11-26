// Central place for Faith's details. Edit here and the whole site updates.
export const site = {
  name: "Fayreds Travel",
  owner: "Faith Mutune",
  tagline: "Travel stories, curated trips & hospitality marketing from Kenya to the world.",
  phoneDisplay: "+254 701 484 995",
  phoneE164: "+254701484995",
  whatsapp: "254701484995", // wa.me format: country code, no "+"
  email: "fayredstravel@gmail.com",
  socials: {
    instagram: "https://www.instagram.com/fayreds_travel",
    tiktok: "https://www.tiktok.com/@faith_mutune",
    facebook: "https://www.facebook.com/share/155D1sg16C9/",
  },
  consultation: {
    priceUsd: Number(process.env.CONSULTATION_PRICE_USD ?? 100),
    // KES price shown to Kenyan clients. Update when the exchange rate moves.
    priceKes: Number(process.env.CONSULTATION_PRICE_KES ?? 13000),
  },
};

export function whatsappLink(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function siteUrl(path = "") {
  const base = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return base + path;
}
