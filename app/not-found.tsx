import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl">Not found</h1>
      <p className="mt-3">That page is not in the shop.</p>
      <Link className="btn mt-6" href="/shop">
        Back to shop
      </Link>
    </div>
  );
}
