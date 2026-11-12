"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/nav";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-4 lg:flex" aria-label="Primary">
      {navLinks.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`min-h-12 py-3 text-sm whitespace-nowrap ${active ? "shadow-[inset_0_-2px_0_0_var(--brand)]" : "text-muted"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopNavFallback() {
  return (
    <nav className="hidden items-center gap-4 lg:flex" aria-label="Primary">
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className="min-h-12 py-3 text-sm whitespace-nowrap text-muted">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
