"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl">Something went wrong</h1>
      <p className="mt-3">The page did not load. Try again.</p>
      <button className="btn mt-6" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
