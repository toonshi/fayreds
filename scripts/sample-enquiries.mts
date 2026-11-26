// LOCAL TESTING ONLY: fills a local database with made-up enquiries so the admin can be designed
// against realistic content. Every name, email and phone number here is fictional.
// Run: DATABASE_URL=... npx tsx scripts/sample-enquiries.mts   (refuses to run against a non-local database)
import { PrismaClient, type EnquiryStatus, type EnquiryType } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error("Refusing to run: DATABASE_URL is not a local database.");
  process.exit(1);
}
const db = new PrismaClient();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

type Row = { type: EnquiryType; status: EnquiryStatus; name: string; country: string; phone: string; h: number; details: Record<string, unknown>; notes?: string };
const rows: Row[] = [
  { type: "CONSULTATION", status: "NEW", name: "Amara Okafor", country: "United Kingdom", phone: "+447700900111", h: 1.5,
    details: { destination: "Diani & Zanzibar", departure: "London", tripType: "Honeymoon / couple's trip", dates: "12–22 Feb", adults: 2, children: 0, budget: "KES 80,000–200,000 / $650–1,600", interests: ["Beaches", "Food & restaurants", "Relaxation & spa"], help: ["Full itinerary", "Accommodation", "Transport on the ground"], stay: "Boutique / Airbnb", contactVia: "WhatsApp", message: "First time in Kenya! We'd love one night in Nairobi too, with a nice dinner." } },
  { type: "MARKETING", status: "NEW", name: "Wanjiru Kamau", country: "Kenya", phone: "+254711000222", h: 5,
    details: { role: "Marketing Manager", businessName: "Sandbar Beach Villas", businessType: "Airbnb / Staycation / Villa", location: "Watamu, Kenya", website: "@sandbarvillas", deliverables: ["Instagram reels", "TikTok videos", "Staycation / hosted stay review"], goal: "More bookings / sales", audience: "Kenyan travellers", timing: "Any weekend in March", budget: "KES 50,000–150,000 / $400–1,200", message: "We just renovated the pool villas and want a weekend feature before Easter.", source: "TikTok" } },
  { type: "PARTNERSHIP", status: "NEW", name: "Daniel Mwangi", country: "Kenya", phone: "+254722000333", h: 20,
    details: { role: "Founder", company: "Rift Valley Paragliding", partnerType: "Restaurant / Experience", locations: "Kerio Valley, Kenya", website: "https://example.com/paragliding", model: ["Commission per confirmed booking", "Exclusive discount code for Faith's followers"], commission: "10–15%", priceRange: "KES 18,000 per flight", bookingSystem: "Unique promo code", start: "Within a month", message: "Tandem flights for beginners, GoPro video included. Happy to host Faith for a flight." } },
  { type: "CONSULTATION", status: "AWAITING_PAYMENT", name: "Grace Njeri", country: "Kenya", phone: "+254733000444", h: 26,
    details: { destination: "Help me choose", departure: "Nairobi", tripType: "Girls' / boys' trip", dates: "Flexible, sometime in June", adults: 5, children: 0, budget: "KES 30,000–80,000 / $250–650", interests: ["Nightlife", "Beaches"], help: ["Full itinerary", "Budget planning"], contactVia: "WhatsApp" } },
  { type: "RESERVATION", status: "PAID", name: "Kevin Otieno", country: "Kenya", phone: "+254744000555", h: 50,
    details: { spots: 2, payOption: "Deposit", room: "Sharing with my group", emergency: "Mary Otieno +254 700 000 000", dietary: "Vegetarian" } },
  { type: "CONSULTATION", status: "IN_PROGRESS", name: "Sofia Martins", country: "Portugal", phone: "+351912000666", h: 72,
    details: { destination: "Masai Mara + Nairobi", departure: "Lisbon", tripType: "Family trip", dates: "3–10 Aug", adults: 2, children: 2, budget: "Above KES 200,000 / $1,600", interests: ["Safari & wildlife", "Culture & history"], help: ["Full itinerary", "Accommodation", "Visa & travel documents"], stay: "Safari lodge / camp", contactVia: "Email" },
    notes: "[24 Nov, 10:12] Replied by email: \"Hi Sofia, lovely to hear from you…\"\n\nSent 3 lodge options. Waiting on their pick." },
  { type: "MARKETING", status: "IN_PROGRESS", name: "Brian Kiptoo", country: "Kenya", phone: "+254755000777", h: 96,
    details: { businessName: "Mama Rocks Burgers", businessType: "Restaurant / Café / Bar", location: "Nairobi, Kenya", deliverables: ["TikTok videos", "Restaurant or experience review"], goal: "Brand awareness", budget: "Under KES 20,000 / $150", message: "New branch in Westlands." } },
  { type: "PARTNERSHIP", status: "COMPLETED", name: "Lucy Achieng", country: "Kenya", phone: "+254766000888", h: 200,
    details: { company: "Kilifi Kite School", partnerType: "Tour operator / DMC", locations: "Kilifi", website: "https://example.com/kite", model: ["Commission per confirmed booking"], commission: "15–20%", message: "Kite lessons for all levels." } },
  { type: "CONSULTATION", status: "DECLINED", name: "Tom Becker", country: "Germany", phone: "+491511000999", h: 300,
    details: { destination: "Kilimanjaro", departure: "Berlin", tripType: "Solo trip", dates: "Next week", adults: 1, budget: "Not sure, advise me", help: ["Activities & tours"], contactVia: "Email" } },
  { type: "MARKETING", status: "COMPLETED", name: "Aisha Hassan", country: "Kenya", phone: "+254777000123", h: 400,
    details: { businessName: "Lamu Dhow Tours", businessType: "Tour operator / Activities", location: "Lamu", deliverables: ["Instagram reels"], goal: "More bookings / sales", budget: "Hosted experience only (no fee)", message: "Sunset dhow cruise." } },
];

const trip = await db.trip.findFirst();
let n = 0;
for (const r of rows) {
  n++;
  const prefix = { CONSULTATION: "CON", MARKETING: "MKT", PARTNERSHIP: "PRT", RESERVATION: "RES" }[r.type];
  const first = r.name.split(" ")[0].toLowerCase();
  const e = await db.enquiry.create({
    data: {
      reference: `FT-${prefix}-SAMPLE${n}`,
      type: r.type, status: r.status, name: r.name, country: r.country, phone: r.phone,
      email: `${first}@example.com`, details: r.details as object, notes: r.notes ?? null,
      createdAt: hoursAgo(r.h), updatedAt: hoursAgo(r.h / 2),
      ...(r.type === "RESERVATION" && trip ? { tripId: trip.id, spots: 2 } : {}),
    },
  });
  if (r.status === "PAID" || r.status === "AWAITING_PAYMENT" || r.status === "IN_PROGRESS" && r.type === "CONSULTATION") {
    const paid = r.status !== "AWAITING_PAYMENT";
    await db.payment.create({
      data: {
        enquiryId: e.id, provider: r.country === "Kenya" ? "MPESA" : "STRIPE", status: paid ? "PAID" : "PENDING",
        amount: r.country === "Kenya" ? 13000 : 100, currency: r.country === "Kenya" ? "KES" : "USD",
        description: "Sample payment", paidAt: paid ? hoursAgo(r.h - 1) : null,
        mpesaReceipt: paid && r.country === "Kenya" ? `SAMPLE${n}X` : null, createdAt: hoursAgo(r.h - 1),
      },
    });
  }
}
console.log(`Inserted ${rows.length} sample enquiries.`);
await db.$disconnect();
