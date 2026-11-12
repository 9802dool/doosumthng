import type { Metadata } from "next";
import { Brush } from "@/components/brush";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "DooSumThng is a Trinidad and Tobago clothing brand. Doosumthng With A Difference.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-6xl leading-none">About</h1>
      <Brush className="mt-3 h-3 w-28 text-brand" />
      <p className="mt-6 font-display text-3xl leading-tight md:text-4xl">{site.tagline}</p>
      <div className="mt-6 space-y-4 text-lg">
        <p>
          DooSumThng started in Trinidad and Tobago as a clothing brand with a simple idea: do something with a
          difference. The pieces are bold, clean, and made to be worn, not just looked at.
        </p>
        <p>
          We print tees, tanks, sweaters, caps, and custom jerseys and mugs. You pick the color and the size. If you
          want a name, a number, or your own artwork, send it through the custom order form.
        </p>
        <p className="text-base text-muted">This story is a placeholder. Edit it in app/about/page.tsx when you are ready.</p>
      </div>
    </div>
  );
}
