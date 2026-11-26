// Every form on the site is defined here. The same definition renders the form
// and validates the submission on the server, so they can never drift apart.

export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "multi" | "date" | "number" | "country" | "url";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  half?: boolean; // render at half width on large screens
  min?: number;
  max?: number;
};

export type FormSection = { title: string; fields: Field[] };
export type FormKind = "marketing" | "consultation" | "partnership" | "reservation";

export const COUNTRIES = [
  "Kenya", "Uganda", "Tanzania", "Rwanda", "Ethiopia", "Nigeria", "Ghana", "South Africa", "Egypt", "Morocco",
  "United Kingdom", "Ireland", "United States", "Canada", "Germany", "France", "Netherlands", "Belgium", "Italy",
  "Spain", "Portugal", "Switzerland", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Austria",
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain", "Israel", "Turkey",
  "India", "Pakistan", "China", "Japan", "South Korea", "Singapore", "Malaysia", "Indonesia", "Thailand",
  "Philippines", "Vietnam", "Australia", "New Zealand", "Brazil", "Mexico", "Argentina", "Other",
];

const contact = (who = "Your"): Field[] => [
  { name: "name", label: `${who} full name`, type: "text", required: true, half: true },
  { name: "email", label: "Email address", type: "email", required: true, half: true },
  {
    name: "phone", label: "Phone number", type: "tel", required: true, half: true,
    placeholder: "0712 345 678",
    help: "Outside Kenya? Include your country code, e.g. +44 7700 900123. Kenyan numbers get an SMS confirmation; everyone gets an email.",
  },
  { name: "country", label: "Country you live in", type: "country", required: true, half: true },
];

export const forms: Record<FormKind, { title: string; intro: string; sections: FormSection[] }> = {
  marketing: {
    title: "Work with Faith: Marketing",
    intro:
      "For hotels, staycations, restaurants, tour operators and brands that want to reach Faith's travel community. Tell us about your business and what you have in mind.",
    sections: [
      { title: "Your details", fields: [...contact(), { name: "role", label: "Your role", type: "text", placeholder: "e.g. Marketing Manager…", half: true }] },
      {
        title: "Your business",
        fields: [
          { name: "businessName", label: "Business or brand name", type: "text", required: true, half: true },
          {
            name: "businessType", label: "Type of business", type: "select", required: true, half: true,
            options: ["Hotel / Resort", "Airbnb / Staycation / Villa", "Lodge / Safari camp", "Restaurant / Café / Bar", "Tour operator / Activities", "Travel or lifestyle brand", "Tourism board / Destination", "Event", "Other"],
          },
          { name: "location", label: "Location (town / city, country)", type: "text", required: true, half: true },
          { name: "website", label: "Website or social media handle", type: "text", placeholder: "@yourbusiness or https://…", half: true },
        ],
      },
      {
        title: "The campaign",
        fields: [
          {
            name: "deliverables", label: "What would you like?", type: "multi", required: true,
            options: ["Instagram reels", "Instagram posts & stories", "TikTok videos", "Facebook posts", "Staycation / hosted stay review", "Restaurant or experience review", "Event coverage", "Photos & videos for your own use (UGC)", "Long-term brand ambassadorship", "Giveaway with followers"],
          },
          { name: "goal", label: "Main goal", type: "select", required: true, half: true, options: ["More bookings / sales", "Brand awareness", "Launching something new", "Content for our own pages", "Not sure yet"] },
          { name: "audience", label: "Who you want to reach", type: "select", half: true, options: ["Kenyan travellers", "International travellers", "Both"] },
          { name: "timing", label: "Preferred dates for the visit or campaign", type: "text", placeholder: "e.g. mid-March…", help: "Rough timing is fine, e.g. any weekend in April.", half: true },
          { name: "budget", label: "Budget", type: "select", required: true, half: true, options: ["Hosted experience only (no fee)", "Under KES 20,000 / $150", "KES 20,000–50,000 / $150–400", "KES 50,000–150,000 / $400–1,200", "Above KES 150,000 / $1,200", "Open to a proposal"] },
          { name: "message", label: "Tell us more", type: "textarea", required: true, placeholder: "What makes your place special, and what you’d like Faith to show…" },
          { name: "source", label: "How did you hear about Faith?", type: "select", options: ["Instagram", "TikTok", "Facebook", "Referral", "Google", "Other"] },
        ],
      },
    ],
  },

  consultation: {
    title: "Book a Travel Consultation",
    intro:
      "Get a personal trip plan from Faith: where to go, where to stay, what to do, and how to make your budget go further. The consultation fee is paid after this form, then you continue with Faith on WhatsApp or email.",
    sections: [
      { title: "Your details", fields: contact() },
      {
        title: "Your trip",
        fields: [
          { name: "destination", label: "Where do you want to go?", type: "text", required: true, placeholder: "e.g. Zanzibar…", help: "A place, a region, or “help me choose”.", half: true },
          { name: "departure", label: "Travelling from (city)", type: "text", required: true, half: true },
          { name: "tripType", label: "Type of trip", type: "select", required: true, half: true, options: ["Holiday / leisure", "Honeymoon / couple's trip", "Family trip", "Solo trip", "Girls' / boys' trip", "Group / company retreat", "Birthday or special occasion", "Business + leisure"] },
          { name: "dates", label: "Travel dates", type: "text", required: true, placeholder: "e.g. 12–19 Dec…", help: "Exact dates or “flexible, sometime in June”.", half: true },
          { name: "adults", label: "Adults", type: "number", required: true, min: 1, max: 100, half: true },
          { name: "children", label: "Children (under 12)", type: "number", min: 0, max: 50, half: true },
          { name: "ages", label: "Ages of the travellers", type: "text", placeholder: "e.g. 34, 32, 8 and 5", half: true },
          { name: "nights", label: "How many nights?", type: "number", min: 1, max: 90, half: true },
          { name: "transfers", label: "Airport and hotel transfers?", type: "select", half: true, options: ["Yes, airport and hotel transfers", "Only from the airport", "No, I'll sort my own transport"] },
          { name: "budget", label: "Budget per person (excluding flights)", type: "select", required: true, options: ["Under KES 30,000 / $250", "KES 30,000–80,000 / $250–650", "KES 80,000–200,000 / $650–1,600", "Above KES 200,000 / $1,600", "Not sure, advise me"] },
        ],
      },
      {
        title: "Your style",
        fields: [
          { name: "interests", label: "What you enjoy", type: "multi", options: ["Beaches", "Safari & wildlife", "Food & restaurants", "Nightlife", "Culture & history", "Hiking & adventure", "Relaxation & spa", "Photography spots", "Shopping"] },
          { name: "help", label: "What do you need help with?", type: "multi", required: true, options: ["Full itinerary", "Accommodation", "Flights", "Activities & tours", "Visa & travel documents", "Transport on the ground", "Budget planning"] },
          { name: "stay", label: "Where you like to stay", type: "select", half: true, options: ["Budget / backpacker", "Mid-range hotel", "Boutique / Airbnb", "Luxury resort", "Safari lodge / camp", "No preference"] },
          { name: "contactVia", label: "How should Faith follow up?", type: "select", required: true, half: true, options: ["WhatsApp", "Email"] },
          { name: "message", label: "Anything else Faith should know?", type: "textarea", placeholder: "Dietary needs, mobility, must-see places, celebrations…" },
        ],
      },
    ],
  },

  partnership: {
    title: "Partner with Fayreds Travel",
    intro:
      "Commission-based partnerships with hotels, lodges, tour operators and travel brands. Faith recommends and books partners she trusts for her clients and community, and earns a commission on each confirmed booking.",
    sections: [
      { title: "Your details", fields: [...contact(), { name: "role", label: "Your role", type: "text", required: true, half: true }] },
      {
        title: "Your company",
        fields: [
          { name: "company", label: "Company name", type: "text", required: true, half: true },
          { name: "partnerType", label: "Type of partner", type: "select", required: true, half: true, options: ["Hotel / Resort", "Lodge / Safari camp", "Airbnb / Villa / Apartments", "Tour operator / DMC", "Airline / Travel agency", "Car hire / Transfers", "Restaurant / Experience", "Travel gear or lifestyle brand", "Other"] },
          { name: "locations", label: "Where you operate", type: "text", required: true, placeholder: "e.g. Diani & Watamu, Kenya…", half: true },
          { name: "website", label: "Website", type: "url", required: true, placeholder: "https://…", half: true },
        ],
      },
      {
        title: "The partnership",
        fields: [
          { name: "model", label: "Partnership model(s) you're open to", type: "multi", required: true, options: ["Commission per confirmed booking", "Affiliate / referral link", "Exclusive discount code for Faith's followers", "Co-hosted group trips", "Net rates for Faith's clients", "Other"] },
          { name: "commission", label: "Commission you offer", type: "select", required: true, half: true, options: ["Under 5%", "5–10%", "10–15%", "15–20%", "Above 20%", "Let's discuss"] },
          { name: "priceRange", label: "Typical price per night / per person", type: "text", placeholder: "e.g. KES 15,000 per night…", half: true },
          { name: "bookingSystem", label: "How bookings would be tracked", type: "select", half: true, options: ["Unique promo code", "Booking link / affiliate platform", "Faith books directly with us", "Not sure yet"] },
          { name: "start", label: "When would you like to start?", type: "select", half: true, options: ["Immediately", "Within a month", "Next season", "Just exploring"] },
          { name: "message", label: "Tell us about your offer", type: "textarea", required: true, placeholder: "What you offer, who it’s for, and any special terms…" },
        ],
      },
    ],
  },

  reservation: {
    title: "Reserve your spot",
    intro: "Fill in your details, then pay the deposit or the full amount to secure your place.",
    sections: [
      {
        title: "Your details",
        fields: [
          ...contact(),
          { name: "spots", label: "Number of spots", type: "number", required: true, min: 1, max: 10, half: true },
          { name: "payOption", label: "Pay now", type: "select", required: true, half: true, options: ["Deposit", "Full amount"] },
          { name: "travellers", label: "Names of other travellers (if any)", type: "textarea" },
          { name: "room", label: "Room preference", type: "select", half: true, options: ["Sharing with my group", "Happy to share with another traveller", "Single room (extra cost may apply)"] },
          { name: "dietary", label: "Dietary needs or allergies", type: "text", half: true },
          { name: "emergency", label: "Emergency contact (name & phone)", type: "text", required: true },
          { name: "message", label: "Questions or special requests", type: "textarea" },
        ],
      },
    ],
  },
};

export const allFields = (kind: FormKind) => forms[kind].sections.flatMap((s) => s.fields);

/** Validates a submission against the form definition. Returns clean values or a map of errors. */
const lc = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);
const requiredMsg = (f: Field) =>
  f.label.endsWith("?") ? "Please answer this question"
  : f.type === "select" || f.type === "country" ? `Choose ${lc(f.label)}`
  : `Enter ${lc(f.label)}`;

export function validate(kind: FormKind, input: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const values: Record<string, string | string[] | number> = {};
  for (const f of allFields(kind)) {
    const raw = input[f.name];
    if (f.type === "multi") {
      const arr = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(String).filter((v) => f.options!.includes(v));
      if (f.required && arr.length === 0) errors[f.name] = "Choose at least one option";
      values[f.name] = arr;
      continue;
    }
    const v = typeof raw === "string" ? raw.trim().slice(0, 3000) : raw == null ? "" : String(raw).trim();
    if (!v) {
      if (f.required) errors[f.name] = requiredMsg(f);
      continue;
    }
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[f.name] = "Enter a valid email, e.g. name@example.com";
    if (f.type === "url" && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(v)) errors[f.name] = "Enter a web address, e.g. https://yourhotel.com";
    if (f.type === "select" && !f.options!.includes(v)) errors[f.name] = `Choose ${lc(f.label)}`;
    if (f.type === "country" && !COUNTRIES.includes(v)) errors[f.name] = "Choose your country";
    if (f.type === "number") {
      const n = Number(v);
      if (!Number.isInteger(n) || (f.min != null && n < f.min) || (f.max != null && n > f.max)) {
        errors[f.name] = `Enter a number${f.min != null ? ` from ${f.min}` : ""}${f.max != null ? ` to ${f.max}` : ""}`;
      } else values[f.name] = n;
      continue;
    }
    values[f.name] = v;
  }
  return { values, errors, ok: Object.keys(errors).length === 0 };
}
