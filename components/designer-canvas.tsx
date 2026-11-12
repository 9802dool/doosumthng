"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("@/components/designer-studio"), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-muted">Loading the designer…</p>,
});

export function DesignerCanvas() {
  return <Studio />;
}
