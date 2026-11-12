import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/lib/types";

const PHOTO = /\.(jpe?g|png|webp|avif)$/i;
const EXTENSIONS = ["webp", "jpg", "jpeg", "png", "avif"] as const;

function publicFile(urlPath: string) {
  const relative = urlPath.replace(/^\/+/, "").split("?")[0] ?? "";
  return path.join(process.cwd(), "public", relative);
}

export function localProductPhoto(slug: string): string | null {
  const dir = path.join(process.cwd(), "public", "products");
  for (const ext of EXTENSIONS) {
    const filename = `${slug}.${ext}`;
    if (fs.existsSync(path.join(dir, filename))) return `/products/${filename}`;
  }
  return null;
}

export function safeImageSrc(src: string): string | null {
  if (!src || src.endsWith(".svg")) return null;
  if (src.startsWith("/") && !src.startsWith("//")) {
    if (!PHOTO.test(src)) return null;
    return fs.existsSync(publicFile(src)) ? src.split("?")[0] : null;
  }
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!PHOTO.test(url.pathname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Local `public/products/<slug>.<ext>` wins, then saved photo URLs. */
export function resolveProductImages(product: Pick<Product, "slug" | "images">): string[] {
  const local = localProductPhoto(product.slug);
  const stored = (product.images ?? [])
    .map((src) => safeImageSrc(src))
    .filter((src): src is string => Boolean(src));
  if (!local) return stored;
  return [local, ...stored.filter((src) => src !== local)];
}

export function heroPhoto(): string | null {
  for (const ext of EXTENSIONS) {
    const filename = `hero.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", filename))) return `/${filename}`;
  }
  return null;
}
