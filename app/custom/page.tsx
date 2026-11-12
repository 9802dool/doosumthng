import type { Metadata } from "next";
import Link from "next/link";
import { CustomOrderForm } from "@/components/custom-order-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Custom orders",
  description: "Order a custom DooSumThng jersey, t-shirt, or mug. Names, numbers, colors, and your artwork.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <Reveal>
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-5xl leading-none uppercase md:text-6xl">Custom orders</h1>
      <p className="mt-4 text-lg">
        Jerseys, t-shirts, and mugs. Tell us the names, numbers, and colors, and send a design if you have one. Or{" "}
        <Link href="/design" className="underline decoration-brand decoration-2 underline-offset-4">
          design your own
        </Link>{" "}
        and send the mockup.
      </p>
      <div className="mt-8">
        <CustomOrderForm />
      </div>
    </div>
    </Reveal>
  );
}
