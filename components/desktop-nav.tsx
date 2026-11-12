"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/custom", label: "Custom" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`min-h-12 py-3 text-[0.95rem] ${active ? "shadow-[inset_0_-2px_0_0_var(--brand)]" : "text-muted"}`}
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
    <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="min-h-12 py-3 text-[0.95rem] text-muted">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
