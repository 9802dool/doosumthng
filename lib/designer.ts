/** TT$ prices for the design-your-own tool. Change them here. */
export const designPrices = {
  tee: 150,
  jersey: 220,
  mug: 90,
} as const;

export type DesignProductId = keyof typeof designPrices;
export type DesignSide = "front" | "back";

export const designProducts: {
  id: DesignProductId;
  label: string;
  price: number;
  sides: DesignSide[];
}[] = [
  { id: "tee", label: "T-shirt", price: designPrices.tee, sides: ["front"] },
  { id: "jersey", label: "Jersey", price: designPrices.jersey, sides: ["front", "back"] },
  { id: "mug", label: "Mug", price: designPrices.mug, sides: ["front"] },
];

export const garmentColours = [
  { id: "white", label: "White", hex: "#F3EFE7" },
  { id: "black", label: "Black", hex: "#17171A" },
  { id: "red", label: "Red", hex: "#D71216" },
  { id: "grey", label: "Grey", hex: "#8A8680" },
] as const;

export type GarmentColourId = (typeof garmentColours)[number]["id"];

export const stageSize = { width: 420, height: 560 };

export function printArea(product: DesignProductId, side: DesignSide) {
  if (product === "mug") return { x: 152, y: 206, width: 136, height: 156 };
  if (product === "jersey" && side === "back") return { x: 116, y: 150, width: 188, height: 250 };
  if (product === "jersey") return { x: 132, y: 196, width: 156, height: 168 };
  return { x: 130, y: 186, width: 160, height: 188 };
}

export function inkForGarment(hex: string) {
  return hex === "#17171A" || hex === "#D71216" ? "#F3EFE7" : "#161412";
}
