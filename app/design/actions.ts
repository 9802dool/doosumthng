"use server";

import { designProducts, garmentColours, type DesignProductId, type GarmentColourId } from "@/lib/designer";
import { money, whatsappHref } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { clean } from "@/lib/text";
import type { CustomOrderResult } from "@/lib/types";

const MAX_FILE = 30 * 1024 * 1024;

function designMessage(input: {
  name: string;
  phone: string;
  label: string;
  colour: string;
  price: number;
  printName: string;
  printNumber: string;
  url: string | null;
}) {
  const lines = [
    "Hi DooSumThng! I designed something on the site.",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Piece: ${input.label}`,
    `Colour: ${input.colour}`,
    `Price: ${money(input.price)}`,
  ];
  if (input.printName) lines.push(`Name on the back: ${input.printName}`);
  if (input.printNumber) lines.push(`Number on the back: ${input.printNumber}`);
  if (input.url) lines.push(`Mockup: ${input.url}`);
  return lines.join("\n").slice(0, 3500);
}

export async function submitDesignOrder(formData: FormData): Promise<CustomOrderResult> {
  const name = clean(formData.get("name"), 120);
  const phone = clean(formData.get("phone"), 40);
  const productId = clean(formData.get("product"), 20) as DesignProductId;
  const colourId = clean(formData.get("colour"), 20) as GarmentColourId;
  const printName = clean(formData.get("print_name"), 16);
  const printNumber = clean(formData.get("print_number"), 3);
  const product = designProducts.find((item) => item.id === productId);
  const colour = garmentColours.find((item) => item.id === colourId);

  if (!name || !phone || !product || !colour) {
    return { ok: false, message: "Add your name and phone, and pick a piece.", whatsapp: "" };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { ok: false, message: "That phone number looks too short.", whatsapp: "" };
  }

  const file = formData.get("mockup");
  let url: string | null = null;
  let saved = false;
  const configured = isSupabaseConfigured();

  if (configured && file instanceof File && file.size > 0) {
    if (file.type === "image/png" && file.size <= MAX_FILE) {
      const supabase = createPublicClient();
      const path = `${crypto.randomUUID()}.png`;
      const uploaded = await supabase.storage.from("designer-files").upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: "image/png",
        upsert: false,
      });
      if (!uploaded.error) {
        url = supabase.storage.from("designer-files").getPublicUrl(path).data.publicUrl;
        const row = {
          name,
          phone,
          email: "",
          item_type: product.label,
          quantity: 1,
          sizes: null,
          colors: colour.label,
          print_name: printName || null,
          print_number: printNumber || null,
          notes: "Designed on the website.",
          design_url: url,
          needed_by: null,
          status: "New",
          mockup_url: url,
          product_type: product.label,
        };
        let inserted = await supabase.from("custom_orders").insert(row);
        if (inserted.error && /mockup_url|product_type/i.test(inserted.error.message)) {
          const { mockup_url, product_type, ...withoutNewColumns } = row;
          void mockup_url;
          void product_type;
          inserted = await supabase.from("custom_orders").insert(withoutNewColumns);
        }
        saved = !inserted.error;
      }
    }
  }

  const whatsapp = whatsappHref(
    designMessage({
      name,
      phone,
      label: product.label,
      colour: colour.label,
      price: product.price,
      printName,
      printNumber,
      url,
    }),
  );

  if (!configured) {
    return {
      ok: false,
      setup: true,
      message: "Supabase is not connected, so this was not saved on the site. WhatsApp is open with your design details.",
      whatsapp,
    };
  }
  if (!saved) {
    return {
      ok: false,
      message: "We could not save the mockup on the site. WhatsApp is open so you can still send the order.",
      whatsapp,
    };
  }
  return {
    ok: true,
    message: "We saved your design and opened WhatsApp with the mockup link.",
    whatsapp,
  };
}
