import { sampleProducts } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Product } from "@/lib/types";

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
  if (!isSupabaseConfigured()) {
    return sampleProducts.filter((product) => product.active);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as Product[]).map(normalize);
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return sampleProducts.find((product) => product.slug === slug && product.active) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) return null;
  return normalize(data as Product);
}

export async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as Product[]).map(normalize);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return normalize(data as Product);
}
