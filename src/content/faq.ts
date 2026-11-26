// OWNER: Faith. DRAFT answers — Faith must confirm every policy (refunds, deposits, deadlines) before launch.
export type Faq = { q: string; a: string };

export const faqs: { topic: string; items: Faq[] }[] = [
  {
    topic: "Travel consultations",
    items: [
      {
        q: "What do I get from a consultation?",
        a: "A personal trip plan based on your budget, dates and travel style: recommended destinations, places to stay, activities, a day-by-day itinerary and tips to make your money go further. We go through it together on WhatsApp or email.",
      },
      {
        q: "How much does it cost?",
        a: "US$100 for international clients, or the equivalent in Kenyan shillings via M-Pesa for clients in Kenya. You pay after filling in the consultation form, and then Faith continues with you on WhatsApp or email.",
      },
      {
        q: "Do you book flights and hotels for me?",
        a: "The consultation covers planning and recommendations. If you would like Faith to handle bookings with her partners as well, mention it in the form and she will share the options.",
      },
    ],
  },
  {
    topic: "Group trips",
    items: [
      {
        q: "How do I reserve a spot?",
        a: "Open the trip, fill in the reservation form and pay either the deposit or the full amount. Your spot is confirmed once payment is received, and you get an SMS (Kenyan numbers) and an email.",
      },
      {
        q: "When is the balance due?",
        a: "Faith will share the payment schedule after you reserve. As a guide, the balance is usually due before the trip starts.",
      },
      {
        q: "Can I come alone?",
        a: "Yes. Many travellers join solo. Choose 'Happy to share with another traveller' or ask for a single room in the form.",
      },
    ],
  },
  {
    topic: "Brands & partners",
    items: [
      {
        q: "Do you do hosted stays?",
        a: "Yes, for places that fit the community. Use the Marketing form to share your property, what you have in mind and your budget, including hosted-only options.",
      },
      {
        q: "How do commission partnerships work?",
        a: "Faith recommends and books partners she trusts for her clients and group trips, and earns an agreed commission on confirmed bookings, tracked with a promo code or booking link. Start with the Partnerships form.",
      },
    ],
  },
];
