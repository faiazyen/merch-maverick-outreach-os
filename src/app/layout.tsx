import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Outreach OS — Merch Maverick",
  description:
    "AI-powered outreach operating system: lead pipeline, fit+intent scoring, buyer-language ghostwriting, daily send queue.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
