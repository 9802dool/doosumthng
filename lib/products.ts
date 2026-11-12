import { cacheLife, cacheTag } from "next/cache";
import { sampleProducts } from "@/lib/catalog";
import { resolveProductImages } from "@/lib/media";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Product } from "@/lib/types";

function withPhotos(product: Product): Product {
  return { ...product, images: resolveProductImages(product) };
}

function normalize(row: Product): Product {
  return {
    ...row,
    price_ttd: Number(row.price_ttd),
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    images: row.images ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  if (!isSupabaseConfigured()) {
    return sampleProducts.filter((product) => product.active).map(withPhotos);
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as Product[]).map((row) => withPhotos(normalize(row)));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getAdminProducts(): Promise<{ products: Product[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return { products: [], error: error?.message ?? "Could not load products." };
  return { products: (data as Product[]).map(normalize), error: null };
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return normalize(data as Product);
}
