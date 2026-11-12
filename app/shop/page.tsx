import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Brush } from "@/components/brush";
import { ProductCard } from "@/components/product-card";
import { categories } from "@/lib/site";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop DooSumThng tees, tanks, sweaters, caps, slippers, and accessories. Prices in TT$.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="wrap py-10 text-muted">Loading the shop…</p>}>
      <ShopResults searchParams={searchParams} />
    </Suspense>
  );
}

async function ShopResults({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = categories.find((item) => item === raw);
  const products = await getProducts();
  const visible = category ? products.filter((product) => product.category === category) : products;

  return (
    <div className="wrap py-8 md:py-12">
      <h1 className="font-display text-6xl leading-none md:text-7xl">Shop</h1>
      <Brush className="mt-3 h-3 w-28 text-brand" />
      <p className="mt-4 max-w-xl text-lg">
        Tees, tanks, sweaters, caps, slippers, and accessories. Prices in TT$.
      </p>
      <nav className="mt-6 flex gap-5 overflow-x-auto pb-2" aria-label="Categories">
        <CategoryLink href="/shop" active={!category}>
          All
        </CategoryLink>
        {categories.map((item) =>
          item === "Custom Jerseys & Mugs" ? (
            <CategoryLink key={item} href="/custom">
              {item}
            </CategoryLink>
          ) : (
            <CategoryLink key={item} href={`/shop?category=${encodeURIComponent(item)}`} active={category === item}>
              {item}
            </CategoryLink>
          ),
        )}
      </nav>
      {visible.length ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-lg">
          Nothing in {category ?? "the shop"} yet.{" "}
          <Link href="/custom" className="underline decoration-brand decoration-2 underline-offset-4">
            Ask for a custom piece
          </Link>
          .
        </p>
      )}
    </div>
  );
}

function CategoryLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative shrink-0 py-3 text-sm ${active ? "text-ink" : "text-muted"}`}
    >
      {children}
      {active ? <Brush className="absolute right-0 -bottom-1 left-0 h-2 text-brand" /> : null}
    </Link>
  );
}
