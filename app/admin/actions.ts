"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminProduct } from "@/lib/products";
import { adminEmail, categories, orderStatuses } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { blockText, clean, listFromText, slugify } from "@/lib/text";

const MAX_FILE = 5 * 1024 * 1024;

async function requireOwner() {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== adminEmail.toLowerCase()) redirect("/admin/login?error=denied");
  return supabase;
}

export type ProductFormState = { message: string } | null;

export async function signIn(formData: FormData) {
  const email = clean(formData.get("email"), 160);
  const password = String(formData.get("password") ?? "");
  if (!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=credentials");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=denied");
  }
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const supabase = await requireOwner();
  const name = clean(formData.get("name"), 120);
  const slug = slugify(clean(formData.get("slug"), 80) || name);
  const category = clean(formData.get("category"), 80);
  const description = blockText(formData.get("description"), 2000);
  const price = Number(formData.get("price_ttd"));
  const sizes = listFromText(formData.get("sizes"));
  const colors = listFromText(formData.get("colors"));
  const images = String(formData.get("images") ?? "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
  const featured = formData.get("featured") === "on";
  const active = formData.get("active") === "on";
  const id = clean(formData.get("id"), 80);

  if (!name) return { message: "Add a product name." };
  if (!slug) return { message: "Add a slug, like ds-logo-tank-top." };
  if (!(categories as readonly string[]).includes(category)) return { message: "Pick a category." };
  if (!Number.isFinite(price) || price < 0 || price > 100000) return { message: "Enter a price in TT$." };

  const file = formData.get("photo");
  let uploaded: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return { message: "The product photo needs to be an image." };
    if (file.size > MAX_FILE) return { message: "That photo is over 5 MB. Try a smaller file, or drop it in public/products." };
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
    const path = `${slug}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      return {
        message: "The photo did not upload. Paste an image URL, or add the file to public/products using the product slug.",
      };
    }
    uploaded = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const nextImages = uploaded ? [uploaded, ...images.filter((src) => src !== uploaded)] : images;
  const row = {
    name,
    slug,
    category,
    description,
    price_ttd: price,
    sizes,
    colors,
    images: nextImages,
    featured,
    active,
  };

  if (id) {
    const existing = await getAdminProduct(id);
    if (!existing) return { message: "That product is no longer in the shop." };
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) return { message: error.message };
    updateTag("products");
    redirect(`/admin/products/${id}?saved=1`);
  }

  const { data, error } = await supabase.from("products").insert(row).select("id").single();
  if (error || !data) return { message: error?.message ?? "Could not save the product." };
  updateTag("products");
  redirect(`/admin/products/${data.id}?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  const supabase = await requireOwner();
  const id = clean(formData.get("id"), 80);
  if (!id) redirect("/admin");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) redirect(`/admin/products/${id}?error=${encodeURIComponent(error.message)}`);
  updateTag("products");
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await requireOwner();
  const id = clean(formData.get("id"), 80);
  const status = clean(formData.get("status"), 40);
  if (!id || !(orderStatuses as readonly string[]).includes(status)) redirect("/admin/orders");
  await supabase.from("custom_orders").update({ status }).eq("id", id);
  redirect("/admin/orders");
}
