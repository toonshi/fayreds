// OWNER: Faith. Faith's TikTok guides shown on the site. Add new videos at the top.
// `id` is the number at the end of the TikTok link: tiktok.com/@faith_mutune/video/<id>
export type VideoCategory = "Eat" | "Stay" | "Do" | "Budget";

export type Video = {
  id: string;
  title: string;
  category: VideoCategory;
  place: string;
  blurb: string;
  /** true = good proof for hotels/restaurants on the Marketing page */
  forBrands?: boolean;
  /** optional cover image, e.g. "/images/videos/beach-resorts.webp" (a 9:16 screenshot of the video).
   *  Without one, the site uses TikTok's cover if available, otherwise a branded cover. */
  cover?: string;
};

export const TIKTOK_PROFILE = "https://www.tiktok.com/@faith_mutune";
export const videoUrl = (id: string) => `${TIKTOK_PROFILE}/video/${id}`;

export const categoryLabel: Record<VideoCategory, string> = {
  Eat: "Food & restaurants",
  Stay: "Hotels & resorts",
  Do: "Adventures",
  Budget: "On a budget",
};

export const videos: Video[] = [
  {
    id: "7706035281358490898",
    title: "Beach resorts worth the trip",
    category: "Stay",
    place: "Diani",
    blurb: "Beachfront stays Faith has tried, from the pool to the plate.",
    forBrands: true,
    cover: "/images/videos/beach-resorts.webp",
  },
  {
    id: "7669743160960093461",
    title: "5 luxury hotels to visit in Nairobi",
    category: "Stay",
    place: "Nairobi",
    blurb: "Five city hotels for a treat-yourself staycation.",
    forBrands: true,
    cover: "/images/videos/luxury-hotels-nairobi.webp",
  },
  {
    id: "7551368704890539276",
    title: "10 restaurants to visit in Nairobi",
    category: "Eat",
    place: "Nairobi",
    blurb: "Ten places to eat in Nairobi, and what to order.",
    forBrands: true,
    cover: "/images/videos/restaurants-nairobi.webp",
  },
  {
    id: "7664942181051944212",
    title: "Adventures to try",
    category: "Do",
    place: "Ruiru",
    blurb: "Get off the sofa: outdoor experiences Faith recommends.",
    cover: "/images/videos/adventures.webp",
  },
  {
    id: "7375108451283766534",
    title: "Affordable places to visit in Nairobi",
    category: "Budget",
    place: "Nairobi",
    blurb: "Great days out in Nairobi that won't empty your wallet.",
    cover: "/images/videos/affordable-nairobi.webp",
  },
];
