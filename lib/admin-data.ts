import { createClient } from "@/lib/supabase/server";
import type { CustomOrder } from "@/lib/types";

export async function getAdminOrders(): Promise<{ orders: CustomOrder[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return { orders: [], error: error?.message ?? "Could not load orders." };
  return {
    orders: (data as CustomOrder[]).map((order) => ({
      ...order,
      quantity: Number(order.quantity),
    })),
    error: null,
  };
}
