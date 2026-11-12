import type { Metadata } from "next";
import { Brush } from "@/components/brush";
import { CustomOrderForm } from "@/components/custom-order-form";

export const metadata: Metadata = {
  title: "Custom orders",
  description: "Order a custom DooSumThng jersey, t-shirt, or mug. Names, numbers, colors, and your artwork.",
  alternates: { canonical: "/custom" },
};

export default function CustomPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-5xl leading-none md:text-6xl">Custom orders</h1>
      <Brush className="mt-3 h-3 w-28 text-brand" />
      <p className="mt-4 text-lg">
        Jerseys, t-shirts, and mugs. Tell us the names, numbers, and colors, and send a design if you have one.
      </p>
      <div className="mt-8">
        <CustomOrderForm />
      </div>
    </div>
  );
}
