// OWNER: Faith. Awards and press. Only add items that are confirmed, and keep captions exact
// (e.g. "Nominee" vs "Winner").
export type Recognition = {
  kind: "Award" | "Nomination" | "Press";
  title: string;
  detail: string;
  /** leave out when unknown */
  year?: string;
  image: string;
  alt: string;
  width: number;
  height: number;
};

export const recognition: Recognition[] = [
  {
    kind: "Award",
    title: "Africa's 100 Most Impactful Travel & Tourism People",
    detail: "Africa Travel & Tourism Awards, recognising Faith as a travel & tourism content creator",
    year: "2025",
    image: "/images/award-africa-100-2025.webp",
    alt: "Africa Travel & Tourism '100 Most Impactful People 2025' certificate congratulating Faith Mutune, Travel & Tourism Content Creator",
    width: 1012,
    height: 1280,
  },
  {
    kind: "Nomination",
    title: "Nominee: Travel Creator of the Year",
    detail: "For taking her audience on journeys through stunning visuals and engaging storytelling",
    // TODO(Faith): add the awarding body and year once confirmed
    image: "/images/award-travel-creator-nominee.webp",
    alt: "'Travel creator of the year' award category card with a teal suitcase and a paper plane",
    width: 984,
    height: 1280,
  },
  {
    kind: "Press",
    title: "People Daily: “How a Kenyan Clinician Turned Travel Dreams into a Digital Career”",
    detail: "Cover story, Sunday Mornings, 12 April 2026",
    year: "2026",
    image: "/images/press-people-daily-2026.webp",
    alt: "People Daily Sunday Mornings cover, 12 April 2026, featuring Faith in a white robe on a hotel balcony under the headline 'How a Kenyan Clinician Turned Travel Dreams into a Digital Career'",
    width: 1006,
    height: 1280,
  },
];
