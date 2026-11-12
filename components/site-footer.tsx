import Image from "next/image";
import Link from "next/link";
import { Brush } from "@/components/brush";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto pb-24">
      <div className="wrap">
        <Brush className="h-3 w-40 text-brand" />
        <div className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-3 font-display text-4xl leading-none">
              <Image src={site.logoMark} alt="" width={48} height={48} className="h-12 w-12" />
              {site.name}
            </p>
            <p className="mt-2 text-muted">{site.tagline}</p>
            <a className="btn-quiet mt-3" href={site.instagramUrl}>
              Instagram {site.instagram}
            </a>
          </div>
          <div className="space-y-2">
            <a className="block min-h-12 py-2 underline decoration-brand decoration-2 underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            {site.phones.map((phone) => (
              <p key={phone.tel}>
                <a className="underline decoration-brand/70 underline-offset-4" href={phone.tel}>
                  {phone.label}
                </a>
                {" · "}
                <a className="underline decoration-brand/70 underline-offset-4" href={`https://wa.me/${phone.whatsapp}`}>
                  WhatsApp
                </a>
              </p>
            ))}
            <p className="pt-2 text-sm text-muted">Cash on delivery or bank transfer. Card payments later.</p>
            <Link href="/admin" className="inline-flex min-h-12 items-center text-sm text-muted underline">
              Owner login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
