import { ImageResponse } from "next/og";

// iOS "Add to Home Screen" uses apple-touch-icon (PNG, opaque) — not the SVG
// favicon or manifest. Next renders this to a 180×180 PNG and injects the link.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// ponytail: redraw the "T" monogram with divs (satori has no SVG/font here).
export default function AppleIcon() {
  const white = "#ffffff";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0b",
        }}
      >
        {/* top bar */}
        <div style={{ position: "absolute", left: 42, top: 55, width: 96, height: 22, background: white, borderRadius: 5 }} />
        {/* stem */}
        <div style={{ position: "absolute", left: 79, top: 55, width: 22, height: 82, background: white, borderRadius: 5 }} />
        {/* accent dot */}
        <div style={{ position: "absolute", left: 123, top: 37, width: 30, height: 30, background: "#0a84ff", borderRadius: 15 }} />
      </div>
    ),
    size
  );
}
