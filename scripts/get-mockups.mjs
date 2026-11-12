import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const names = ["tee-front.png", "tee-back.png", "jersey-front.png", "jersey-back.png", "mug.png"];
const dir = path.join(process.cwd(), "public", "mockups");

await mkdir(dir, { recursive: true });

for (const name of names) {
  const url = `https://doosumthng-mockups.vercel.app/mockups/${name}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url} (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);
  console.log(`${name} ${bytes.length} bytes`);
}
