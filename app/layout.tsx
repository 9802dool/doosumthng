import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { site } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-fraunces",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-outfit",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://doosumthng.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "DooSumThng is a Trinidad and Tobago clothing brand. Tees, tanks, sweaters, caps, slippers, and custom jerseys.",
  applicationName: site.name,
  openGraph: {
    title: site.name,
    description: site.tagline,
    siteName: site.name,
    images: [{ url: site.logo, alt: site.logoAlt }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description:
      "DooSumThng is a Trinidad and Tobago clothing brand. Tees, tanks, sweaters, caps, slippers, and custom jerseys.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
