import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductOrder } from "@/components/product-order";
import { Reveal } from "@/components/reveal";
import { getProduct, getProducts } from "@/lib/products";
import { money } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <Reveal>
      <article className="wrap py-8 md:py-12">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="underline-offset-4 hover:underline">
            {product.category}
          </Link>
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none uppercase md:text-6xl">{product.name}</h1>
        <p className="mt-3 font-display text-3xl text-brand">{money(product.price_ttd)}</p>
        <p className="mt-4 max-w-2xl text-lg">{product.description}</p>
        <div className="mt-8">
          <ProductOrder product={product} />
        </div>
      </article>
    </Reveal>
  );
}
