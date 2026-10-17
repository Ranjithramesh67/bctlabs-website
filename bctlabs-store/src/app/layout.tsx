import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getStoreSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: {
      default: `${settings.name} | Electronic components & STEM kits`,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    metadataBase: new URL(settings.url),
    icons: { icon: "/brand/icon.png", apple: "/brand/icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#6d3284",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
