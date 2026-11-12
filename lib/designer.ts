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
  { id: "tee", label: "T-shirt", price: designPrices.tee, sides: ["front", "back"] },
  { id: "jersey", label: "Jersey", price: designPrices.jersey, sides: ["front", "back"] },
  { id: "mug", label: "Mug", price: designPrices.mug, sides: ["front"] },
];

export const garmentColours = [
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "black", label: "Black", hex: "#2A2A2A" },
  { id: "red", label: "Red", hex: "#D71216" },
  { id: "grey", label: "Grey", hex: "#8A8A8A" },
  { id: "navy", label: "Navy", hex: "#1F2A44" },
  { id: "royal", label: "Royal Blue", hex: "#1E4FB4" },
] as const;

export type GarmentColourId = (typeof garmentColours)[number]["id"];

export const stageSize = { width: 500, height: 560 };
export const productFrame = { x: 40, y: 28, size: 420 };
export const canvasGrey = "#E9E9E9";

/** Print boxes as fractions of each 1000×1000 mockup photo. */
export const printBoxes = {
  "tee-front": { x: 0.33, y: 0.26, w: 0.34, h: 0.42 },
  "tee-back": { x: 0.33, y: 0.2, w: 0.34, h: 0.46 },
  "jersey-front": { x: 0.34, y: 0.28, w: 0.32, h: 0.4 },
  "jersey-back": { x: 0.32, y: 0.18, w: 0.36, h: 0.5 },
  mug: { x: 0.25, y: 0.28, w: 0.42, h: 0.5 },
} as const;

export function mockupFile(product: DesignProductId, side: DesignSide) {
  if (product === "mug") return "mug" as const;
  return `${product}-${side}` as const;
}

export function mockupSrc(product: DesignProductId, side: DesignSide) {
  return `/mockups/${mockupFile(product, side)}.png`;
}

export function printArea(product: DesignProductId, side: DesignSide) {
  const box = printBoxes[mockupFile(product, side)];
  return {
    x: productFrame.x + box.x * productFrame.size,
    y: productFrame.y + box.y * productFrame.size,
    width: box.w * productFrame.size,
    height: box.h * productFrame.size,
  };
}

export function isDarkGarment(id: GarmentColourId) {
  return id === "black" || id === "navy";
}

export function inkForGarment(id: GarmentColourId) {
  return isDarkGarment(id) ? "#F4F4F4" : "#1A1A1A";
}

export function designBlend(id: GarmentColourId) {
  if (isDarkGarment(id)) return { composite: "source-over" as const, opacity: 0.95 };
  return { composite: "multiply" as const, opacity: 1 };
}
