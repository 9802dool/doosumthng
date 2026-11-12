export function clean(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function blockText(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function listFromText(value: FormDataEntryValue | null) {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const part of String(value ?? "").split(/[\n,]/)) {
    const item = part.trim().slice(0, 40);
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= 24) break;
  }
  return items;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
