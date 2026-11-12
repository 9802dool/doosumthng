import { updateOrderStatus } from "@/app/admin/actions";
import { getAdminOrders } from "@/lib/admin-data";
import { orderStatuses } from "@/lib/site";

export default async function OrdersPage() {
  const { orders, error } = await getAdminOrders();

  return (
    <div className="py-8">
      <h1 className="font-display text-5xl">Custom orders</h1>
      {error ? <p className="mt-4 bg-deep p-4">{error}</p> : null}
      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <article key={order.id} className="border-b border-ink/10 pb-6">
            <h2 className="font-display text-3xl">{order.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {new Date(order.created_at).toLocaleString("en-TT", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-3">
              {order.item_type} · Qty {order.quantity}
              {order.sizes ? ` · ${order.sizes}` : ""}
              {order.colors ? ` · ${order.colors}` : ""}
            </p>
            {order.print_name || order.print_number ? (
              <p>
                Print {order.print_name} {order.print_number}
              </p>
            ) : null}
            {order.notes ? <p className="mt-2 max-w-2xl">{order.notes}</p> : null}
            {order.needed_by ? <p>Needed by {order.needed_by}</p> : null}
            <p className="mt-2">
              <a className="underline" href={`tel:${order.phone}`}>
                {order.phone}
              </a>
              {" · "}
              {order.email ? (
                <a className="underline" href={`mailto:${order.email}`}>
                  {order.email}
                </a>
              ) : (
                <span>No email</span>
              )}
              {order.design_url ? (
                <>
                  {" · "}
                  <a className="underline" href={order.design_url}>
                    Design file
                  </a>
                </>
              ) : null}
              {order.mockup_url && order.mockup_url !== order.design_url ? (
                <>
                  {" · "}
                  <a className="underline" href={order.mockup_url}>
                    Mockup
                  </a>
                </>
              ) : null}
            </p>
            <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={order.id} />
              <label className="text-sm">
                Status
                <select name="status" defaultValue={order.status} className="field">
                  {orderStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <button className="btn" type="submit">
                Update
              </button>
            </form>
          </article>
        ))}
        {!orders.length && !error ? <p>No custom orders yet.</p> : null}
      </div>
    </div>
  );
}
