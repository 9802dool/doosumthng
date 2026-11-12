import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-xl py-8">
      <h1 className="font-display text-5xl">New product</h1>
      <p className="mt-3 text-sm text-muted">
        Photos: upload one here, paste a direct image URL, or add{" "}
        <code>public/products/&lt;slug&gt;.jpg</code> and redeploy. A file in that folder is used first.
      </p>
      <ProductForm product={null} />
    </div>
  );
}
