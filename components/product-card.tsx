import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { money } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
  heading = "h2",
}: {
  product: Product;
  priority?: boolean;
  heading?: "h2" | "h3";
}) {
  const Title = heading;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <ProductVisual product={product} alt="" priority={priority} sizes="(min-width: 768px) 30vw, 46vw" />
      <div className="mt-3 flex items-end justify-between gap-3">
        <Title className="piece-title font-display text-xl leading-none uppercase md:text-2xl">{product.name}</Title>
        <p className="shrink-0 text-sm">{money(product.price_ttd)}</p>
      </div>
    </Link>
  );
}
