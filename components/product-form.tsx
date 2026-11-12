"use client";

import { useActionState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { apparelSizes, categories } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductForm({ product }: { product: Product | null }) {
  const [state, action, pending] = useActionState(saveProduct, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {state?.message ? (
        <p className="bg-deep px-4 py-3" role="alert">
          {state.message}
        </p>
      ) : null}
      <label className="block text-sm" htmlFor="name">
        Name
        <input id="name" name="name" required className="field" defaultValue={product?.name ?? ""} />
      </label>
      <label className="block text-sm" htmlFor="slug">
        Slug
        <input
          id="slug"
          name="slug"
          className="field"
          placeholder="ds-logo-tank-top"
          defaultValue={product?.slug ?? ""}
        />
      </label>
      <label className="block text-sm" htmlFor="category">
        Category
        <select id="category" name="category" className="field" defaultValue={product?.category ?? categories[0]}>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm" htmlFor="description">
        Description
        <textarea id="description" name="description" rows={4} className="field" defaultValue={product?.description ?? ""} />
      </label>
      <label className="block text-sm" htmlFor="price_ttd">
        Price (TT$)
        <input
          id="price_ttd"
          name="price_ttd"
          type="number"
          min={0}
          step="1"
          required
          className="field"
          defaultValue={product?.price_ttd ?? ""}
        />
      </label>
      <label className="block text-sm" htmlFor="sizes">
        Sizes
        <input
          id="sizes"
          name="sizes"
          className="field"
          placeholder={apparelSizes.join(", ")}
          defaultValue={product?.sizes.join(", ") ?? ""}
        />
      </label>
      <label className="block text-sm" htmlFor="colors">
        Colors
        <input
          id="colors"
          name="colors"
          className="field"
          placeholder="Black, White, Red"
          defaultValue={product?.colors.join(", ") ?? ""}
        />
      </label>
      <label className="block text-sm" htmlFor="images">
        Image URLs, one per line
        <textarea
          id="images"
          name="images"
          rows={3}
          className="field"
          placeholder="/products/ds-logo-tank-top.jpg"
          defaultValue={product?.images.join("\n") ?? ""}
        />
      </label>
      <label className="block text-sm" htmlFor="photo">
        Or upload a photo
        <input id="photo" name="photo" type="file" accept="image/*" className="mt-2 block w-full text-sm" />
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
        Featured on the home page
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Visible in the shop
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
