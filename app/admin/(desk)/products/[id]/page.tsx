import { notFound } from "next/navigation";
import { DeleteProduct } from "@/components/delete-product";
import { ProductForm } from "@/components/product-form";
import { localProductPhoto } from "@/lib/media";
import { getAdminProduct } from "@/lib/products";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getAdminProduct(id);
  if (!product) notFound();
  const local = localProductPhoto(product.slug);

  return (
    <div className="max-w-xl py-8">
      <h1 className="font-display text-5xl">Edit product</h1>
      {query.saved ? <p className="mt-4 bg-deep p-4">Saved.</p> : null}
      {query.error ? <p className="mt-4 bg-deep p-4">{query.error}</p> : null}
      {local ? (
        <p className="mt-4 text-sm text-muted">
          A file at <code>{local}</code> is shown in the shop before the URLs below. Remove that file if you want the
          saved URLs instead.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Or add <code>public/products/{product.slug}.jpg</code> and redeploy. That file is used first.
        </p>
      )}
      <ProductForm product={product} />
      <div className="mt-8">
        <DeleteProduct id={product.id} name={product.name} />
      </div>
    </div>
  );
}
