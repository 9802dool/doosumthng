import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Marquee } from "@/components/marquee";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { heroPhoto } from "@/lib/media";
import { getProducts } from "@/lib/products";
import { site } from "@/lib/site";

const pieces = [
  { label: "Tees", href: "/shop?category=Tees", image: "/products/ds-logo-tank-top.jpg" },
  { label: "Sweaters", href: "/shop?category=Sweaters", image: "/products/ds-pullover-hoodie.jpg" },
  { label: "Caps", href: "/shop?category=Caps", image: "/products/ds-dad-cap.jpg" },
  { label: "Accessories", href: "/shop?category=Accessories", image: "/products/ds-designer-watch.jpg" },
];

export default function HomePage() {
  const hero = heroPhoto();

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden">
        {hero ? (
          <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-deep" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <Reveal className="relative wrap w-full pt-16 pb-28 md:pb-14">
          <p className="font-script text-4xl text-brand sm:text-5xl">{site.tagline}</p>
          <h1 className="mt-2 max-w-5xl font-display text-[clamp(4.2rem,18vw,8.5rem)] leading-[0.82] uppercase">
            DooSumThng
          </h1>
          <p className="mt-4 max-w-md text-lg">Trinidad and Tobago streetwear. Bold pieces, made to be worn.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link className="btn" href="/shop">
              Shop now
            </Link>
            <Link className="btn-quiet" href="/design">
              Design your own
            </Link>
          </div>
        </Reveal>
      </section>
      <Marquee />
      <Suspense fallback={<p className="wrap py-10 text-muted">Loading the drop…</p>}>
        <Featured />
      </Suspense>
      <section className="wrap py-12 md:py-16">
        <Reveal>
          <h2 className="font-display text-4xl uppercase md:text-6xl">Shop by piece</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {pieces.map((piece, index) => (
            <Reveal key={piece.label} delay={index * 0.05}>
              <Link href={piece.href} className="group relative block aspect-[3/4] overflow-hidden bg-deep">
                <Image
                  src={piece.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 22vw, 46vw"
                  className="piece-zoom object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pt-16 pb-3 font-display text-2xl uppercase sm:text-3xl">
                  {piece.label}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-brand text-[#F3EFE7]">
        <Reveal className="wrap py-14 md:py-20">
          <h2 className="max-w-3xl font-display text-5xl leading-[0.9] uppercase md:text-7xl">Your design. Our print.</h2>
          <p className="mt-4 max-w-xl text-lg">Put your art on a tee, jersey, or mug. We print it here in Trinidad.</p>
          <Link className="btn mt-6" href="/design">
            Design your own
          </Link>
        </Reveal>
      </section>
    </>
  );
}

async function Featured() {
  const products = await getProducts();
  const featured = products.filter((product) => product.featured);
  const piecesOnShow = (featured.length ? featured : products).slice(0, 8);
  if (!piecesOnShow.length) return null;

  return (
    <section className="wrap py-12 md:py-16" aria-labelledby="featured-title">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-title" className="font-display text-4xl uppercase md:text-6xl">
            Featured
          </h2>
          <Link href="/shop" className="btn-quiet">
            Shop all
          </Link>
        </div>
      </Reveal>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {piecesOnShow.map((product, index) => (
          <Reveal key={product.id} delay={Math.min(index, 4) * 0.04}>
            <ProductCard product={product} priority={index < 2} heading="h3" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
