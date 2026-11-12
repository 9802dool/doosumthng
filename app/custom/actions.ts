"use server";

import { customItemTypes, whatsappHref } from "@/lib/site";
import { customOrderLink, type CustomDraft } from "@/lib/orders";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { blockText, clean } from "@/lib/text";
import type { CustomOrderResult } from "@/lib/types";

const MAX_FILE = 5 * 1024 * 1024;

function draftFrom(formData: FormData): { draft: CustomDraft | null; message: string } {
  const item = clean(formData.get("item_type"), 40);
  const quantity = Number(formData.get("quantity"));
  const draft: CustomDraft = {
    name: clean(formData.get("name"), 120),
    phone: clean(formData.get("phone"), 40),
    email: clean(formData.get("email"), 160),
    item_type: (customItemTypes as readonly string[]).includes(item) ? item : "",
    quantity: Number.isFinite(quantity) ? Math.min(500, Math.max(1, Math.round(quantity))) : 0,
    sizes: clean(formData.get("sizes"), 160),
    colors: clean(formData.get("colors"), 160),
    print_name: clean(formData.get("print_name"), 80),
    print_number: clean(formData.get("print_number"), 20),
    notes: blockText(formData.get("notes"), 2000),
    needed_by: clean(formData.get("needed_by"), 20),
  };
  if (!draft.name || !draft.phone || !draft.email || !draft.item_type || !draft.quantity) {
    return { draft: null, message: "Add your name, phone, email, item, and quantity." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
    return { draft: null, message: "That email does not look right." };
  }
  return { draft, message: "" };
}

async function uploadDesign(file: File) {
  if (!file || file.size === 0) return { url: null as string | null, error: "" };
  const allowed = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!allowed) return { url: null, error: "Send an image or a PDF." };
  if (file.size > MAX_FILE) return { url: null, error: "That file is over 5 MB." };
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const supabase = createPublicClient();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("custom-designs").upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { url: null, error: "The design file did not upload." };
  const { data } = supabase.storage.from("custom-designs").getPublicUrl(path);
  return { url: data.publicUrl, error: "" };
}

export async function submitCustomOrder(
  _prev: CustomOrderResult | null,
  formData: FormData,
): Promise<CustomOrderResult> {
  if (clean(formData.get("company_website"), 200)) {
    return {
      ok: true,
      message: "Thank you. We have your custom order.",
      whatsapp: whatsappHref("Hi DooSumThng!"),
    };
  }

  const { draft, message } = draftFrom(formData);
  if (!draft) {
    return { ok: false, message, whatsapp: whatsappHref("Hi DooSumThng! I'd like a custom order.") };
  }

  const whatsapp = customOrderLink(draft);
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      setup: true,
      message: "We could not save this on the site yet. Send it on WhatsApp and we will confirm the order.",
      whatsapp,
    };
  }

  const file = formData.get("design");
  let designUrl: string | null = null;
  let uploadNote = "";
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadDesign(file);
    if (uploaded.error && !uploaded.url) {
      return { ok: false, message: `${uploaded.error} Send the order on WhatsApp instead.`, whatsapp };
    }
    designUrl = uploaded.url;
    if (uploaded.error) uploadNote = ` ${uploaded.error}`;
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("custom_orders").insert({
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    item_type: draft.item_type,
    quantity: draft.quantity,
    sizes: draft.sizes || null,
    colors: draft.colors || null,
    print_name: draft.print_name || null,
    print_number: draft.print_number || null,
    notes: draft.notes || null,
    design_url: designUrl,
    needed_by: draft.needed_by || null,
    status: "New",
  });

  if (error) {
    return {
      ok: false,
      message: "We could not save the order. Send it on WhatsApp instead.",
      whatsapp,
    };
  }

  return {
    ok: true,
    message: `We have your custom order. Message us on WhatsApp if you want to add anything.${uploadNote}`,
    whatsapp,
  };
}
