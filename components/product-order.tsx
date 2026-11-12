"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { GarmentArt } from "@/components/garment-art";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { apparelSizes, orderMessage, whatsappHref } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductOrder({ product }: { product: Product }) {
  const sizes = product.sizes.length ? product.sizes : [...apparelSizes];
  const colors = product.colors.length ? product.colors : ["Black"];
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(product.images[0] ?? "");
  const href = useMemo(
    () => whatsappHref(orderMessage(product.name, size, color, qty)),
    [product.name, size, color, qty],
  );

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <div>
        {photo ? (
          <div className="relative aspect-[4/5] bg-deep">
            {photo.startsWith("/") || photo.includes(".supabase.co") ? (
              <Image src={photo} alt={product.name} fill sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" priority />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        ) : (
          <GarmentArt product={product} />
        )}
        {product.images.length > 1 ? (
          <div className="mt-3 flex gap-2">
            {product.images.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(src)}
                aria-pressed={photo === src}
                className={`relative h-16 w-16 overflow-hidden ${photo === src ? "shadow-[inset_0_-3px_0_0_var(--brand)]" : "opacity-70"}`}
              >
                {src.startsWith("/") || src.includes(".supabase.co") ? (
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          window.open(href, "_blank", "noopener,noreferrer");
        }}
      >
        <fieldset>
          <legend className="text-sm tracking-wide">Size</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                onClick={() => setSize(option)}
                className={`min-h-12 min-w-12 px-3 ${size === option ? "bg-ink text-paper" : "text-ink"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm tracking-wide">Color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={color === option}
                onClick={() => setColor(option)}
                className={`min-h-12 px-3 ${color === option ? "shadow-[inset_0_-2px_0_0_var(--brand)]" : "text-muted"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm tracking-wide" htmlFor="qty">
          Quantity
          <input
            id="qty"
            className="field max-w-28"
            type="number"
            min={1}
            inputMode="numeric"
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
          />
        </label>
        <a className="btn w-full" href={href} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon className="h-5 w-5" />
          Order on WhatsApp
        </a>
      </form>
    </div>
  );
}
