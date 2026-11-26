// OWNER: Hendy. Sample trips so the site has data from day one. Run: npx prisma db seed
// Faith replaces these with real trips from the admin panel.
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const y = new Date().getFullYear() + 1;
const trips = [
  {
    slug: "diani-beach-escape", title: "Diani Beach Escape", destination: "Diani, Kenya",
    startDate: new Date(`${y}-02-13`), endDate: new Date(`${y}-02-16`),
    summary: "Four days of white sand, snorkelling at Kisite and sunset dhow cruises on the south coast.",
    highlights: ["Kisite-Mpunguti snorkelling", "Sunset dhow cruise", "Beachfront villa stay", "Colobus Conservation visit"],
    includes: ["3 nights accommodation", "Breakfast & 2 dinners", "Airport transfers", "Excursions listed"],
    priceKes: 48000, priceUsd: 375, depositKes: 15000, depositUsd: 120, totalSpots: 14,
  },
  {
    slug: "maasai-mara-safari", title: "Maasai Mara Safari Weekend", destination: "Maasai Mara, Kenya",
    startDate: new Date(`${y}-08-21`), endDate: new Date(`${y}-08-24`),
    summary: "Catch the Great Migration with game drives, a bush breakfast and nights in a tented camp.",
    highlights: ["Great Migration game drives", "Bush breakfast", "Maasai village visit", "Optional balloon safari"],
    includes: ["Tented camp, full board", "Park fees", "4x4 safari van & guide", "Nairobi pickup"],
    priceKes: 65000, priceUsd: 505, depositKes: 20000, depositUsd: 155, totalSpots: 12,
  },
  {
    slug: "zanzibar-girls-trip", title: "Zanzibar Girls' Trip", destination: "Zanzibar, Tanzania",
    startDate: new Date(`${y}-05-07`), endDate: new Date(`${y}-05-12`),
    summary: "Stone Town tours, Nungwi beaches, Prison Island and the best photo spots on the island.",
    highlights: ["Stone Town walking tour", "Nakupenda sandbank picnic", "Spice farm tour", "Rooftop dinner"],
    includes: ["5 nights accommodation", "Breakfast daily", "Island transfers", "Tours listed"],
    priceKes: 98000, priceUsd: 760, depositKes: 30000, depositUsd: 235, totalSpots: 10,
  },
  {
    slug: "naivasha-staycation", title: "Naivasha Weekend Staycation", destination: "Naivasha, Kenya",
    startDate: new Date(`${y}-03-20`), endDate: new Date(`${y}-03-22`),
    summary: "A slow weekend by the lake: boat ride to Crescent Island, cycling in Hell's Gate and a spa afternoon.",
    highlights: ["Crescent Island walking safari", "Hell's Gate cycling", "Lake boat ride", "Spa session"],
    includes: ["2 nights lakeside resort", "Full board", "Transport from Nairobi", "Activities listed"],
    priceKes: 32000, priceUsd: 250, depositKes: 10000, depositUsd: 80, totalSpots: 16,
  },
];

async function main() {
  for (const t of trips) await db.trip.upsert({ where: { slug: t.slug }, update: t, create: t });
  console.log(`Seeded ${trips.length} trips`);
}
main().finally(() => db.$disconnect());
