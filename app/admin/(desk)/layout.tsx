import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/admin/actions";
import { adminEmail } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function DeskLayout({ children }: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== adminEmail.toLowerCase()) redirect("/admin/login");

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ink/15 pb-4">
        <p className="font-display text-2xl">Owner</p>
        <Link href="/admin" className="min-h-12 py-3 text-sm">
          Desk
        </Link>
        <Link href="/admin/products/new" className="min-h-12 py-3 text-sm">
          New product
        </Link>
        <Link href="/admin/orders" className="min-h-12 py-3 text-sm">
          Orders
        </Link>
        <Link href="/shop" className="min-h-12 py-3 text-sm">
          View shop
        </Link>
        <form action={signOut}>
          <button type="submit" className="min-h-12 py-3 text-sm text-muted">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
