// OWNER: Faith. The preview image shown when the site is shared on WhatsApp, Facebook, X, LinkedIn…
import { ImageResponse } from "next/og";

export const alt = "Fayreds Travel: travel consultations, group trips and hospitality marketing with Faith Mutune";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 72, color: "white", background: "linear-gradient(135deg, #0E3533 0%, #185955 55%, #D2622F 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#D2622F", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E3533", fontSize: 40 }}>F</div>
          FAYREDS TRAVEL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>Travel smarter with Faith</div>
          <div style={{ fontSize: 34, opacity: 0.92 }}>Trip planning · Group trips · Hospitality marketing</div>
        </div>
        <div style={{ fontSize: 26, opacity: 0.85 }}>Kenya → the world</div>
      </div>
    ),
    size,
  );
}
