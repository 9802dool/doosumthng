const SWATCHES: Record<string, string> = {
  black: "#1b1917",
  white: "#f7f4ef",
  red: "#d71216",
  grey: "#8e8a84",
  gray: "#8e8a84",
  camo: "#6a7044",
  gold: "#c6a15a",
  navy: "#1e2a44",
  blue: "#2a4e8a",
  green: "#2f6b45",
  pink: "#e7a3b0",
  brown: "#6b4634",
  cream: "#f3e6cf",
  orange: "#e0702f",
};

export function swatch(color: string) {
  return SWATCHES[color.trim().toLowerCase()] ?? "#1b1917";
}

export function isLight(hex: string) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

const SKIP = new Set(["ds", "tee", "top", "beach", "the", "a", "and"]);

export function printLabel(name: string) {
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const picked = words.find((word) => !SKIP.has(word.toLowerCase())) ?? words[0] ?? "DS";
  return picked.slice(0, 12).toUpperCase();
}
