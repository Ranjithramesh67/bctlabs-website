import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCT Labs",
  description: "BCT Labs administration and client portal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The legacy Bootstrap/Stisla theme owns all body styling, so the root
    // layout stays a plain, unstyled document shell.
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
