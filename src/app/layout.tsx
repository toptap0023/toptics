import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Applies the saved theme before first paint to avoid a dark→light flash.
const NO_FOUC = `(function(){try{var t=localStorage.getItem('toptics:theme')||'dark';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('light',!d);}catch(e){}})();`;

export const metadata: Metadata = {
  title: "TOPtics · Personal Finance",
  description:
    "Track expenses and income. A clean personal finance tracker.",
  applicationName: "TOPtics",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TOPtics",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FOUC }} />
      </head>
      <body className="font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
