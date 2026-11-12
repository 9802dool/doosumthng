import type { Metadata } from "next";
import { Brush } from "@/components/brush";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact DooSumThng by email, phone, or WhatsApp. Cash on delivery or bank transfer.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-6xl leading-none">Contact</h1>
      <Brush className="mt-3 h-3 w-28 text-brand" />
      <ul className="mt-8 space-y-3 text-lg">
        <li>
          Email{" "}
          <a className="underline decoration-brand decoration-2 underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </li>
        {site.phones.map((phone) => (
          <li key={phone.tel}>
            <a className="underline decoration-brand/70 underline-offset-4" href={phone.tel}>
              {phone.label}
            </a>
            {" · "}
            <a className="underline decoration-brand/70 underline-offset-4" href={`https://wa.me/${phone.whatsapp}`}>
              WhatsApp
            </a>
          </li>
        ))}
        <li>
          Instagram{" "}
          <a className="underline decoration-brand decoration-2 underline-offset-4" href={site.instagramUrl}>
            {site.instagram}
          </a>
        </li>
      </ul>
      <h2 className="mt-12 font-display text-4xl">Payment</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-lg">
        <li>Cash on delivery.</li>
        <li>Bank transfer. We send the account details when we confirm your order.</li>
        <li>Card payments with WiPay are planned for later. They are not available on this site yet.</li>
      </ul>
    </div>
  );
}
