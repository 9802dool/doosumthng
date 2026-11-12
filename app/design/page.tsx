import type { Metadata } from "next";
import { DesignerCanvas } from "@/components/designer-canvas";
import { Reveal } from "@/components/reveal";
import { designProducts } from "@/lib/designer";
import { money } from "@/lib/site";

export const metadata: Metadata = {
  title: "Design your own",
  description: "Design a DooSumThng t-shirt, jersey, or mug, then send the mockup on WhatsApp.",
  alternates: { canonical: "/design" },
};

export default function DesignPage() {
  return (
    <Reveal>
      <div className="wrap py-8 pb-28 md:py-12">
        <p className="font-script text-4xl text-brand">Your design. Our print.</p>
        <h1 className="mt-2 font-display text-5xl leading-none uppercase md:text-7xl">Design your own</h1>
        <p className="mt-4 max-w-2xl text-lg">
          Pick a piece and a colour, add your art, then send it.{" "}
          {designProducts.map((product) => `${product.label} ${money(product.price)}`).join(" · ")}.
        </p>
        <div className="mt-8">
          <DesignerCanvas />
        </div>
      </div>
    </Reveal>
  );
}
