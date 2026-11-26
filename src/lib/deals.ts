// Deal finder: matches Faith's partner offers to a client's consultation answers, so she no longer
// has to search many websites by hand. Pure functions (no database) so they're easy to test.
import type { Offer, OfferCategory } from "@prisma/client";

/** The consultation answers the matcher reads (keys from src/lib/forms.ts). */
export type ClientNeeds = {
  destination: string;
  adults: number;
  children: number;
  nights: number;
  /** most the client wants to spend per person for the whole trip, excluding flights; null = not sure */
  budgetPerPerson: number | null;
  wanted: OfferCategory[];
  /** lowercase words from interests and stay preference, compared with offer tags */
  likes: string[];
};

export type Fit = "fits" | "stretch" | "over" | "unknown";

export type Match = {
  offer: Offer;
  score: number;
  /** estimated cost for the whole group, in KES */
  totalKes: number;
  perPersonKes: number;
  commissionKes: number;
  fit: Fit;
  reasons: string[];
};

const VAGUE = /help me choose|anywhere|not sure|^$/i;

/** "KES 30,000–80,000 / $250–650" -> 80000. Takes the top of the range. */
export function parseBudget(band: string | undefined): number | null {
  if (!band || /not sure/i.test(band)) return null;
  if (/above/i.test(band)) return Infinity;
  const kes = band.split("/")[0];
  const nums = [...kes.matchAll(/[\d,]+/g)].map((m) => Number(m[0].replace(/,/g, ""))).filter((n) => n > 0);
  return nums.length ? Math.max(...nums) : null;
}

const HELP_TO_CATEGORY: Record<string, OfferCategory[]> = {
  "Full itinerary": ["STAY", "ACTIVITY", "TRANSPORT", "DINING"],
  Accommodation: ["STAY"],
  "Activities & tours": ["ACTIVITY"],
  "Transport on the ground": ["TRANSPORT"],
};
const INTEREST_TO_CATEGORY: Record<string, OfferCategory> = {
  "Food & restaurants": "DINING",
  Nightlife: "NIGHTLIFE",
};
const STAY_TO_TAGS: Record<string, string[]> = {
  "Budget / backpacker": ["budget"],
  "Mid-range hotel": ["mid-range", "hotel"],
  "Boutique / Airbnb": ["boutique", "airbnb"],
  "Luxury resort": ["luxury", "resort"],
  "Safari lodge / camp": ["safari", "lodge", "camp"],
};

const asList = (v: unknown) => (Array.isArray(v) ? v.map(String) : v ? [String(v)] : []);
const asInt = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
};

/** Reads an enquiry's stored answers (details JSON) into what the matcher needs. */
export function needsFromDetails(details: unknown): ClientNeeds {
  const d = (details ?? {}) as Record<string, unknown>;
  const help = asList(d.help);
  const interests = asList(d.interests);
  const wanted = new Set<OfferCategory>();
  for (const h of help) for (const c of HELP_TO_CATEGORY[h] ?? []) wanted.add(c);
  for (const i of interests) if (INTEREST_TO_CATEGORY[i]) wanted.add(INTEREST_TO_CATEGORY[i]);
  const transfers = String(d.transfers ?? "");
  if (transfers && !transfers.startsWith("No")) wanted.add("TRANSPORT");
  if (wanted.size === 0) ["STAY", "ACTIVITY"].forEach((c) => wanted.add(c as OfferCategory));

  const likes = [
    ...interests.flatMap((i) => i.toLowerCase().split(/[^a-z]+/)),
    ...(STAY_TO_TAGS[String(d.stay ?? "")] ?? []),
    ...String(d.tripType ?? "").toLowerCase().split(/[^a-z]+/),
  ].filter((w) => w.length > 2 && !["and", "the", "trip"].includes(w));

  return {
    destination: String(d.destination ?? "").trim(),
    adults: Math.max(1, asInt(d.adults, 1)),
    children: asInt(d.children, 0),
    nights: Math.max(1, asInt(d.nights, 3)),
    budgetPerPerson: parseBudget(d.budget ? String(d.budget) : undefined),
    wanted: [...wanted],
    likes: [...new Set(likes)],
  };
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");

/** True when the offer is in (or near) the place the client asked for. */
export function placeMatches(destination: string, location: string) {
  if (VAGUE.test(destination.trim())) return true;
  const want = norm(destination).split(/\s+/).filter((w) => w.length > 2);
  const loc = norm(location);
  if (/anywhere|kenya wide|countrywide|nationwide/.test(loc)) return true;
  return want.some((w) => loc.includes(w)) || norm(location).split(/\s+/).filter((w) => w.length > 2).some((w) => norm(destination).includes(w));
}

export function costFor(offer: Pick<Offer, "priceKes" | "unit" | "commissionPct">, needs: Pick<ClientNeeds, "adults" | "children" | "nights">) {
  const people = needs.adults + needs.children;
  const total =
    offer.unit === "PER_PERSON" ? offer.priceKes * people
    : offer.unit === "PER_NIGHT" ? offer.priceKes * needs.nights
    : offer.priceKes;
  return {
    totalKes: total,
    perPersonKes: Math.round(total / people),
    commissionKes: Math.round((total * offer.commissionPct) / 100),
  };
}

function fitOf(perPerson: number, budget: number | null, share = 1): Fit {
  if (budget === null) return "unknown";
  const limit = budget * share;
  return perPerson <= limit ? "fits" : perPerson <= limit * 1.25 ? "stretch" : "over";
}

/** Ranks active offers for one client. Offers in the wrong place or too small for the group are left out. */
export function matchOffers(offers: Offer[], needs: ClientNeeds): Match[] {
  const people = needs.adults + needs.children;
  const out: Match[] = [];
  for (const offer of offers) {
    if (!offer.active) continue;
    if (!placeMatches(needs.destination, offer.location)) continue;
    if (offer.maxGuests != null && offer.unit !== "PER_PERSON" && people > offer.maxGuests) continue;

    const reasons: string[] = [];
    let score = 0;
    if (needs.wanted.includes(offer.category)) { score += 3; reasons.push("what they asked for"); }
    if (!VAGUE.test(needs.destination)) { score += 2; reasons.push(`in ${offer.location}`); }
    const tags = offer.tags.map((t) => t.toLowerCase());
    const liked = needs.likes.filter((l) => tags.some((t) => t.includes(l) || l.includes(t)));
    if (liked.length) { score += Math.min(3, liked.length); reasons.push(`matches: ${[...new Set(liked)].slice(0, 3).join(", ")}`); }

    const cost = costFor(offer, needs);
    // a stay may use about half of the budget; any single extra about a quarter
    const share = offer.category === "STAY" ? 0.6 : 0.3;
    const fit = fitOf(cost.perPersonKes, needs.budgetPerPerson, share);
    if (fit === "fits") score += 2;
    if (fit === "over") score -= 2;
    if (offer.commissionPct > 0) score += 0.5;

    out.push({ offer, score, ...cost, fit, reasons });
  }
  const fitRank: Record<Fit, number> = { fits: 0, unknown: 1, stretch: 2, over: 3 };
  return out.sort((a, b) => fitRank[a.fit] - fitRank[b.fit] || b.score - a.score || a.perPersonKes - b.perPersonKes);
}

export type Package = { items: Match[]; totalKes: number; perPersonKes: number; commissionKes: number; withinBudget: boolean | null };

/**
 * Builds a ready-to-send package: the best offer in each category the client wants,
 * keeping the total per person inside their budget where possible.
 */
export function suggestPackage(matches: Match[], needs: ClientNeeds): Package {
  const order: OfferCategory[] = ["STAY", "TRANSPORT", "ACTIVITY", "DINING", "NIGHTLIFE"];
  const budget = needs.budgetPerPerson;
  const items: Match[] = [];
  let perPerson = 0;
  for (const cat of order.filter((c) => needs.wanted.includes(c))) {
    const options = matches.filter((m) => m.offer.category === cat && m.fit !== "over");
    if (!options.length) continue;
    const affordable = budget === null ? options : options.filter((m) => perPerson + m.perPersonKes <= budget);
    const pick = affordable[0] ?? (items.length === 0 ? [...options].sort((a, b) => a.perPersonKes - b.perPersonKes)[0] : undefined);
    if (!pick) continue;
    items.push(pick);
    perPerson += pick.perPersonKes;
  }
  const totalKes = items.reduce((n, m) => n + m.totalKes, 0);
  return {
    items,
    totalKes,
    perPersonKes: perPerson,
    commissionKes: items.reduce((n, m) => n + m.commissionKes, 0),
    withinBudget: budget === null ? null : perPerson <= budget,
  };
}

/** One-click searches on big booking sites, for anything Faith's partners don't cover. */
export function outsideSearches(needs: ClientNeeds) {
  const place = VAGUE.test(needs.destination) ? "Kenya" : needs.destination;
  const q = encodeURIComponent(place);
  return [
    { label: "Booking.com stays", href: `https://www.booking.com/searchresults.html?ss=${q}&group_adults=${needs.adults}&group_children=${needs.children}&no_rooms=1` },
    { label: "Airbnb homes", href: `https://www.airbnb.com/s/${q}/homes?adults=${needs.adults}&children=${needs.children}` },
    { label: "GetYourGuide activities", href: `https://www.getyourguide.com/s/?q=${q}` },
    { label: "Google: restaurants", href: `https://www.google.com/search?q=${encodeURIComponent(`best restaurants in ${place}`)}` },
  ];
}

export const CATEGORY_LABEL: Record<OfferCategory, string> = {
  STAY: "Stay",
  ACTIVITY: "Activity",
  TRANSPORT: "Transfers & transport",
  DINING: "Dining",
  NIGHTLIFE: "Nightlife",
  OTHER: "Other",
};
export const UNIT_LABEL = { PER_PERSON: "per person", PER_NIGHT: "per night", PER_GROUP: "per group" } as const;
