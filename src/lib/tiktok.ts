// Looks up a TikTok video's cover image through TikTok's public oEmbed endpoint.
// Cached for 12 hours; if TikTok is slow or unreachable the card falls back to a branded cover.
export type TikTokMeta = { thumbnail?: string; caption?: string };

export async function getTikTokMeta(url: string): Promise<TikTokMeta> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 60 * 60 * 12 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    const json = (await res.json()) as { thumbnail_url?: string; title?: string };
    return { thumbnail: json.thumbnail_url, caption: json.title };
  } catch {
    return {};
  }
}
