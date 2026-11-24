import type { Metadata, Viewport } from "next";
import { Anek_Tamil, Azeret_Mono, Catamaran } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

// Anek Tamil: one display family for Tamil and Latin, with a width axis for condensed headlines.
const display = Anek_Tamil({ variable: "--font-display", subsets: ["latin", "tamil"], axes: ["wdth"] });
// Catamaran was drawn for Tamil and carries Latin too, so mixed lines in body copy match.
const body = Catamaran({ variable: "--font-body", subsets: ["latin", "tamil"] });
// Dial numerals and small labels; also printed onto the 3D dial.
const mono = Azeret_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${site.name}: live Tamil radio`, template: `%s · ${site.name}` },
  description: "Listen to ILC Tamil Radio live, on the web and on Android.",
};

export const viewport: Viewport = { themeColor: "#0e1326" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
