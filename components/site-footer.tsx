import Image from "next/image";
import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-black pb-28">
      <div className="bg-brand py-3 text-center font-display tracking-[0.28em] text-[#F3EFE7] uppercase">
        Trinidad & Tobago
      </div>
      <div className="wrap py-10">
        <p className="flex items-center gap-4 font-display text-[clamp(3.2rem,12vw,7rem)] leading-[0.85] uppercase">
          <Image src={site.logoMark} alt="" width={72} height={72} className="h-14 w-14 sm:h-16 sm:w-16" />
          {site.name}
        </p>
        <p className="mt-3 font-script text-3xl text-brand sm:text-4xl">{site.tagline}</p>
        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="min-h-11 py-2 text-sm tracking-wide uppercase">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <a className="block min-h-11 py-1 underline decoration-brand decoration-2 underline-offset-4" href={`mailto:${site.email}`}>
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
          </div>
          <div className="space-y-2">
            <a className="btn-quiet" href={site.instagramUrl}>
              Instagram {site.instagram}
            </a>
            <p className="text-sm text-muted">Cash on delivery or bank transfer. Card payments later.</p>
            <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-muted underline">
              Owner login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
