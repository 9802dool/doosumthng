import type { Metadata } from "next";
import { Suspense } from "react";
import { signIn } from "@/app/admin/actions";
import { adminEmail } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Owner login",
  description: "Sign in to manage DooSumThng products and orders.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="wrap py-10">Loading…</p>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const messages: Record<string, string> = {
    setup: `Supabase is not connected. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then create the owner user ${adminEmail}.`,
    credentials: "That email or password did not match.",
    denied: "This login is only for the DooSumThng owner account.",
  };
  const note = error ? messages[error] : null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="font-display text-5xl">Owner login</h1>
      {!isSupabaseConfigured() ? (
        <p className="mt-4 bg-deep p-4">{messages.setup}</p>
      ) : null}
      {note && error !== "setup" ? (
        <p className="mt-4 bg-deep p-4" role="alert">
          {note}
        </p>
      ) : null}
      <form action={signIn} className="mt-6 space-y-4">
        <label className="block text-sm">
          Email
          <input type="email" name="email" required autoComplete="username" className="field" />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" name="password" required autoComplete="current-password" className="field" />
        </label>
        <button className="btn w-full" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
