import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Brush } from "@/components/brush";
import { ProductCard } from "@/components/product-card";
import { categories, site } from "@/lib/site";
import { heroPhoto } from "@/lib/media";
import { getProducts } from "@/lib/products";

export default function HomePage() {
  const hero = heroPhoto();

  return (
    <>
      <section className="wrap grid items-end gap-8 py-8 md:grid-cols-12 md:py-14">
        <div className={`max-w-3xl ${hero ? "order-2 md:order-1 md:col-span-7" : "md:col-span-7"}`}>
          <p className="text-xs tracking-[0.22em] text-muted uppercase">Trinidad & Tobago</p>
          <h1 className="mt-3 font-display text-[clamp(3.15rem,14vw,6.4rem)] leading-[0.86] tracking-[-0.035em]">
            Doosumthng
            <span className="block">with a</span>
            <span className="relative inline-block">
              difference
              <Brush className="absolute -bottom-1 left-0 h-3 w-full text-brand md:h-4" />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg">Trinidad and Tobago streetwear. Bold pieces, made with care.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link className="btn" href="/shop">
              Shop now
            </Link>
            <Link className="btn-quiet" href="/custom">
              Custom order
            </Link>
          </div>
        </div>
        <div className={hero ? "order-1 md:order-2 md:col-span-5" : "md:col-span-5"}>
          {hero ? (
            <div className="relative aspect-[4/5] w-full bg-deep">
              <Image
                src={hero}
                alt="DooSumThng lookbook"
                fill
                priority
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <Image
              src={site.logoMark}
              alt=""
              width={640}
              height={640}
              priority
              className="mx-auto w-28 md:w-full md:max-w-md"
            />
          )}
        </div>
      </section>

      <Suspense fallback={<p className="wrap py-10 text-muted">Loading the drop…</p>}>
        <Lookbook />
      </Suspense>

      <section className="wrap py-12 md:py-16">
        <h2 className="font-display text-4xl md:text-5xl">Shop by piece</h2>
        <ul className="mt-4 border-t border-ink/15">
          {categories.map((category, index) => {
            const href = category === "Custom Jerseys & Mugs" ? "/custom" : `/shop?category=${encodeURIComponent(category)}`;
            return (
              <li key={category} className="border-b border-ink/15">
                <Link href={href} className="flex min-h-16 items-baseline justify-between gap-4 py-4">
                  <span className="font-display text-3xl leading-none md:text-5xl">{category}</span>
                  <span className="text-sm text-muted">0{index + 1}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="wrap py-8 pb-16">
        <h2 className="font-display text-4xl md:text-6xl">From Trinidad</h2>
        <p className="mt-4 max-w-2xl text-lg">
          DooSumThng is a Trinidad and Tobago brand. Every piece is made with care, from the tees to the custom jerseys.
        </p>
        <a className="btn mt-6" href={site.instagramUrl}>
          Instagram {site.instagram}
        </a>
      </section>
    </>
  );
}

async function Lookbook() {
  const products = await getProducts();
  const featured = products.filter((product) => product.featured);
  const pieces = (featured.length ? featured : products).slice(0, 6);
  if (!pieces.length) return null;

  return (
    <section className="py-6" aria-labelledby="lookbook-title">
      <div className="wrap flex items-end justify-between gap-4">
        <h2 id="lookbook-title" className="font-display text-4xl md:text-5xl">
          Lookbook
        </h2>
        <Link href="/shop" className="btn-quiet">
          Shop all
        </Link>
      </div>
      <div className="lookbook mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
        {pieces.map((product, index) => (
          <div key={product.id} className="w-[78vw] shrink-0 snap-start sm:w-80">
            <p className="mb-2 text-xs tracking-[0.18em] text-muted">0{index + 1}</p>
            <ProductCard product={product} priority={index === 0} heading="h3" />
          </div>
        ))}
      </div>
    </section>
  );
}
