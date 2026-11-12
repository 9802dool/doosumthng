import { Suspense } from "react";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <Suspense fallback={<p className="wrap py-10 text-muted">Loading…</p>}>{children}</Suspense>;
}
