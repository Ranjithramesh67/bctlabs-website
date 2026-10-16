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
  };
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
