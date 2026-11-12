import Link from "next/link";
import { getAdminProducts } from "@/lib/products";
import { money } from "@/lib/site";

export default async function AdminHomePage() {
  const { products, error } = await getAdminProducts();

  return (
    <div className="py-8">
      <h1 className="font-display text-5xl">Products</h1>
      {error ? <p className="mt-4 bg-deep p-4">{error}</p> : null}
      <div className="mt-6 divide-y divide-ink/10">
        {products.map((product) => (
          <div key={product.id} className="flex flex-wrap items-baseline justify-between gap-3 py-4">
            <div>
              <Link href={`/admin/products/${product.id}`} className="font-display text-2xl leading-none">
                {product.name}
              </Link>
              <p className="mt-1 text-sm text-muted">
                {money(product.price_ttd)} · {product.category}
                {product.featured ? " · Featured" : ""}
                {product.active ? "" : " · Hidden"}
              </p>
            </div>
            <Link href={`/product/${product.slug}`} className="text-sm underline">
              View
            </Link>
          </div>
        ))}
        {!products.length && !error ? <p className="py-6">No products yet.</p> : null}
      </div>
    </div>
  );
}
