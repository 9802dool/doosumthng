import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { swatch } from "@/lib/colors";
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
      <ProductVisual
        product={product}
        alt=""
        priority={priority}
        sizes="(min-width: 768px) 30vw, 46vw"
      />
      <div className="mt-3 flex items-start justify-between gap-3">
        <Title className="piece-title font-display text-[1.35rem] leading-none">{product.name}</Title>
        <p className="shrink-0 pt-1 text-sm">{money(product.price_ttd)}</p>
      </div>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="flex gap-1" aria-hidden="true">
          {product.colors.map((color) => (
            <span
              key={color}
              className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/20"
              style={{ backgroundColor: swatch(color) }}
            />
          ))}
        </span>
        {product.colors.join(" · ")}
      </p>
    </Link>
  );
}
