// Home page copy. Edit text here, not in page.tsx.
// Bio, follower stats and testimonials live in bio.ts and testimonials.ts.

export const hero = {
  eyebrow: "Kenyan travel creator · Hospitality marketer",
  title: "Travel Kenya and beyond, planned by someone who's been there.",
  text: "I'm Faith. I share honest travel stories, plan trips that fit your budget, and help hotels and travel brands reach travellers who actually book.",
};

export const paths = [
  {
    kind: "marketing",
    href: "/marketing",
    title: "Marketing",
    who: "Hotels, staycations, restaurants, tour operators and brands",
    text: "Reels, TikToks, reviews and content that put your place in front of travellers.",
    cta: "Feature your business",
  },
  {
    kind: "consultation",
    href: "/consultation",
    title: "Travel Consultation",
    who: "Travellers who want a personal trip plan",
    text: "Where to go, where to stay and how to stretch your budget, then we plan on WhatsApp or email.",
    cta: "Plan my trip",
  },
  {
    kind: "partnership",
    href: "/partnership",
    title: "Partnerships",
    who: "Hotels, lodges, tour operators and travel brands",
    text: "Commission-based partnerships: Faith recommends and books partners she trusts.",
    cta: "Become a partner",
  },
] as const;

// Brands Faith has worked with. The section stays hidden while this list is empty.
// TODO(Faith): add real brand names, e.g. "Hotel Name, Diani".
export const brands: string[] = [];
