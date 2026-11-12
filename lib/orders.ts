import { whatsappHref } from "@/lib/site";

export type CustomDraft = {
  name: string;
  phone: string;
  email: string;
  item_type: string;
  quantity: number;
  sizes: string;
  colors: string;
  print_name: string;
  print_number: string;
  notes: string;
  needed_by: string;
};

export function customOrderText(order: CustomDraft) {
  const lines = [
    "Hi DooSumThng! I'd like a custom order.",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Item: ${order.item_type}`,
    `Qty: ${order.quantity}`,
  ];
  if (order.sizes) lines.push(`Sizes: ${order.sizes}`);
  if (order.colors) lines.push(`Colors: ${order.colors}`);
  if (order.print_name) lines.push(`Name to print: ${order.print_name}`);
  if (order.print_number) lines.push(`Number to print: ${order.print_number}`);
  if (order.needed_by) lines.push(`Needed by: ${order.needed_by}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  return lines.join("\n").slice(0, 3500);
}

export function customOrderLink(order: CustomDraft) {
  return whatsappHref(customOrderText(order));
}
