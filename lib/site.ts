export const site = {
  name: "DooSumThng",
  tagline: "Doosumthng With A Difference",
  email: "doosumthng@gmail.com",
  instagram: "@doosumthng",
  instagramUrl: "https://www.instagram.com/doosumthng/",
  whatsapp: "18683563722",
  phones: [
    { label: "(868) 356-3722", tel: "tel:+18683563722", whatsapp: "18683563722" },
    { label: "(868) 345-8301", tel: "tel:+18683458301", whatsapp: "18683458301" },
  ],
  logo: "/logo.png",
  logoAlt: "DooSumThng — red DS letters in a black brush-stroke circle",
} as const;

export const adminEmail = "doosumthng@gmail.com";

export const categories = [
  "Tees",
  "Tanks",
  "Sweaters",
  "Caps",
  "Slippers",
  "Accessories",
  "Custom Jerseys & Mugs",
] as const;

export const apparelSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

export const orderStatuses = ["New", "In Progress", "Ready", "Delivered"] as const;

export const customItemTypes = ["Jersey", "T-shirt", "Mug"] as const;

export function whatsappHref(text?: string, number: string = site.whatsapp) {
  const base = `https://wa.me/${number}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(product: string, size: string, color: string, qty: number) {
  return `Hi DooSumThng! I'd like to order: ${product}, Size ${size}, Color ${color}, Qty ${qty}`;
}

export function money(amount: number) {
  return `TT$${Number(amount).toLocaleString("en-TT")}`;
}
