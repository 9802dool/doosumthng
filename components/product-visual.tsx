import Image from "next/image";
import { GarmentArt } from "@/components/garment-art";
import type { Product } from "@/lib/types";

export function ProductVisual({
  product,
  alt,
  sizes,
  priority = false,
}: {
  product: Product;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const photo = product.images[0];
  if (!photo) return <GarmentArt product={product} />;

  const optimized = photo.startsWith("/") || photo.includes(".supabase.co");
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-deep">
      {optimized ? (
        <Image
          src={photo}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="piece-zoom object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        // Remote hosts outside Supabase are owner-supplied and not in the image allowlist.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={alt} className="piece-zoom absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      )}
    </div>
  );
}
