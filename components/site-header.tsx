import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DesktopNav, DesktopNavFallback } from "@/components/desktop-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-paper">
      <div className="wrap flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-h-12 items-center gap-2.5">
          <Image src={site.logoMark} alt="" width={44} height={44} className="h-11 w-11" priority />
          <span className="font-display text-[1.65rem] leading-none tracking-tight">{site.name}</span>
        </Link>
        <Suspense fallback={<DesktopNavFallback />}>
          <DesktopNav />
        </Suspense>
        <MobileMenu />
      </div>
    </header>
  );
}
