"use client";

import { useActionState } from "react";
import { submitCustomOrder } from "@/app/custom/actions";
import { customItemTypes } from "@/lib/site";

export function CustomOrderForm() {
  const [state, action, pending] = useActionState(submitCustomOrder, null);

  if (state?.ok) {
    return (
      <div role="status" className="bg-deep px-5 py-6">
        <h2 className="font-display text-4xl">Thank you</h2>
        <p className="mt-3 text-lg">{state.message}</p>
        <a className="btn mt-6" href={state.whatsapp} target="_blank" rel="noopener noreferrer">
          Follow up on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <p className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company_website">Leave this blank</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </p>
      {state && !state.ok ? (
        <p className="bg-deep px-4 py-3 font-medium" role="alert">
          {state.message}
        </p>
      ) : null}
      <label className="block text-sm" htmlFor="name">
        Name
        <input id="name" name="name" required autoComplete="name" className="field" />
      </label>
      <label className="block text-sm" htmlFor="phone">
        Phone
        <input id="phone" name="phone" required autoComplete="tel" className="field" />
      </label>
      <label className="block text-sm" htmlFor="email">
        Email
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block text-sm" htmlFor="item_type">
        Item
        <select id="item_type" name="item_type" required className="field" defaultValue="Jersey">
          {customItemTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm" htmlFor="quantity">
        Quantity
        <input id="quantity" name="quantity" type="number" min={1} defaultValue={1} required className="field" />
      </label>
      <label className="block text-sm" htmlFor="sizes">
        Sizes
        <input id="sizes" name="sizes" className="field" placeholder="M, L" />
      </label>
      <label className="block text-sm" htmlFor="colors">
        Colors
        <input id="colors" name="colors" className="field" placeholder="Black, Red" />
      </label>
      <label className="block text-sm" htmlFor="print_name">
        Name to print (jerseys)
        <input id="print_name" name="print_name" className="field" />
      </label>
      <label className="block text-sm" htmlFor="print_number">
        Number to print (jerseys)
        <input id="print_number" name="print_number" className="field" />
      </label>
      <label className="block text-sm" htmlFor="notes">
        Notes
        <textarea id="notes" name="notes" rows={4} className="field" />
      </label>
      <label className="block text-sm" htmlFor="design">
        Design or logo (image or PDF)
        <input id="design" name="design" type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" />
      </label>
      <label className="block text-sm" htmlFor="needed_by">
        Needed by
        <input id="needed_by" name="needed_by" type="date" className="field" />
      </label>
      <button className="btn w-full" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send custom order"}
      </button>
      {state && !state.ok ? (
        <a className="btn-quiet w-full justify-center" href={state.whatsapp} target="_blank" rel="noopener noreferrer">
          Send it on WhatsApp instead
        </a>
      ) : null}
    </form>
  );
}
