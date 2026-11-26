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

// SAMPLE partner offers for the deal finder, so the matching can be demoed.
// Prices and partners are placeholders: Faith replaces them with her real partners in /admin/offers.
const offers = [
  { title: "Beachfront Airbnb villa (sleeps 4)", partner: "Sample partner: Diani villa host", category: "STAY", location: "Diani, Kenya", priceKes: 12000, unit: "PER_NIGHT", maxGuests: 4, tags: ["airbnb", "boutique", "beach", "family"], commissionPct: 10 },
  { title: "Mid-range beach hotel, B&B", partner: "Sample partner: Diani hotel", category: "STAY", location: "Diani, Kenya", priceKes: 9000, unit: "PER_PERSON", tags: ["mid-range", "hotel", "beach"], commissionPct: 8 },
  { title: "Luxury resort, half board", partner: "Sample partner: Diani resort", category: "STAY", location: "Diani, Kenya", priceKes: 38000, unit: "PER_NIGHT", maxGuests: 2, tags: ["luxury", "resort", "honeymoon", "spa"], commissionPct: 12 },
  { title: "Kisite snorkelling and dhow day trip", partner: "Sample partner: south coast tours", category: "ACTIVITY", location: "Diani, Kenya", priceKes: 6500, unit: "PER_PERSON", tags: ["beaches", "snorkelling", "adventure", "family"], commissionPct: 15 },
  { title: "Skydive over the coast", partner: "Sample partner: Diani skydiving", category: "ACTIVITY", location: "Diani, Kenya", priceKes: 45000, unit: "PER_PERSON", tags: ["adventure", "hiking"], commissionPct: 10 },
  { title: "Airport transfer Ukunda/Mombasa", partner: "Sample partner: coast transfers", category: "TRANSPORT", location: "Diani, Ukunda, Mombasa", priceKes: 4500, unit: "PER_GROUP", maxGuests: 6, tags: ["transfer"], commissionPct: 10 },
  { title: "Seafood dinner by the beach", partner: "Sample partner: Diani restaurant", category: "DINING", location: "Diani, Kenya", priceKes: 3500, unit: "PER_PERSON", tags: ["food", "restaurants", "romantic"], commissionPct: 5 },
  { title: "Tandem paragliding flight", partner: "Sample partner: Kerio Valley paragliding", category: "ACTIVITY", location: "Kerio Valley, Iten", priceKes: 15000, unit: "PER_PERSON", tags: ["adventure", "photography"], commissionPct: 15 },
  { title: "Boutique hotel in Westlands", partner: "Sample partner: Nairobi hotel", category: "STAY", location: "Nairobi, Westlands", priceKes: 14000, unit: "PER_NIGHT", maxGuests: 2, tags: ["boutique", "mid-range", "nightlife"], commissionPct: 10 },
  { title: "Nairobi night out: rooftop and live music", partner: "Sample partner: Nairobi nights", category: "NIGHTLIFE", location: "Nairobi", priceKes: 5000, unit: "PER_PERSON", tags: ["nightlife", "music"], commissionPct: 10 },
  { title: "JKIA airport pickup", partner: "Sample partner: Nairobi transfers", category: "TRANSPORT", location: "Nairobi", priceKes: 3500, unit: "PER_GROUP", maxGuests: 4, tags: ["transfer"], commissionPct: 10 },
  { title: "Nairobi National Park half-day game drive", partner: "Sample partner: city safaris", category: "ACTIVITY", location: "Nairobi", priceKes: 9000, unit: "PER_PERSON", tags: ["safari", "wildlife", "photography", "family"], commissionPct: 12 },
] as const;

async function main() {
  for (const t of trips) await db.trip.upsert({ where: { slug: t.slug }, update: t, create: t });
  console.log(`Seeded ${trips.length} trips`);
  if ((await db.offer.count()) === 0) {
    for (const o of offers) await db.offer.create({ data: { ...o, tags: [...o.tags], notes: "SAMPLE offer: replace with a real partner." } });
    console.log(`Seeded ${offers.length} sample offers`);
  }
}
main().finally(() => db.$disconnect());
