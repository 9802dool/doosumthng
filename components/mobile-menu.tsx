"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/custom", label: "Custom" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="min-h-12 min-w-12 px-1 text-[0.95rem] md:hidden"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <nav id="site-menu" aria-label="Mobile" className="fixed inset-0 z-50 flex flex-col bg-paper px-6 pt-6 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl">{site.name}</span>
            <button type="button" className="min-h-12 min-w-12" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="mt-10 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 py-4 font-display text-5xl leading-none"
              >
                {link.label}
              </Link>
            ))}
            <a href={site.instagramUrl} className="py-5 text-lg" onClick={() => setOpen(false)}>
              Instagram {site.instagram}
            </a>
          </div>
        </nav>
      ) : null}
    </>
  );
}
