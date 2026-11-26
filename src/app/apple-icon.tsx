// OWNER: Faith. Home-screen icon for iPhones (generated from the logo mark).
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#6b1c2b", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 50, top: 48, width: 80, height: 80, borderRadius: 40, background: "#f2a541" }} />
        <div style={{ position: "absolute", left: 0, top: 98, width: 180, height: 82, background: "#6b1c2b" }} />
        <div style={{ position: "absolute", left: 26, top: 102, width: 128, height: 10, borderRadius: 5, background: "#ffffff" }} />
        <div style={{ position: "absolute", left: 46, top: 128, width: 88, height: 10, borderRadius: 5, background: "#f5c2c7" }} />
      </div>
    ),
    size,
  );
}
