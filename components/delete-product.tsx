"use client";

import { deleteProduct } from "@/app/admin/actions";

export function DeleteProduct({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-muted underline">
        Delete product
      </button>
    </form>
  );
}
