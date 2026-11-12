import Image from "next/image";
import { isLight, printLabel, swatch } from "@/lib/colors";
import type { Product } from "@/lib/types";

const GROUNDS: Record<string, string[]> = {
  Tees: ["#efe4d6", "#e5efe6", "#f4e3ea"],
  Tanks: ["#f6ddd8", "#f8e7c8"],
  Sweaters: ["#e6e2dc", "#dde4ee"],
  Caps: ["#e5efe4", "#f3e6d4"],
  Slippers: ["#e7e2d2", "#efe6d4"],
  Accessories: ["#f3eee4", "#ece6dc"],
  "Custom Jerseys & Mugs": ["#f6eee6"],
};

function hash(value: string) {
  let total = 0;
  for (const char of value) total = (total * 31 + char.charCodeAt(0)) >>> 0;
  return total;
}

function groundFor(product: Product, garment: string) {
  const options = GROUNDS[product.category] ?? ["#efe4d6"];
  const picked = options[hash(product.slug) % options.length] ?? options[0];
  return isLight(garment) ? "#ddcbb6" : picked;
}

const TEE =
  "M76 46 C58 40 36 52 18 66 L12 84 L34 98 L50 74 L50 204 Q100 214 150 204 L150 74 L166 98 L188 84 L182 66 C164 52 142 40 124 46 Q100 66 76 46 Z";
const TANK =
  "M80 38 L68 64 C56 90 52 108 50 124 L48 200 Q100 210 152 200 L150 124 C148 108 144 90 132 64 L120 38 Q100 60 80 38 Z";
const SWEATER =
  "M74 46 L8 90 L24 108 L42 84 L42 214 L158 214 L158 84 L176 108 L192 90 L126 46 Q100 66 74 46 Z";

export function GarmentArt({ product }: { product: Product }) {
  const garment = swatch(product.colors[0] ?? "Black");
  const ground = groundFor(product, garment);
  const ink = isLight(garment) ? "#161412" : "#f4f0e6";
  const label = printLabel(product.name);
  const kind = product.category;
  const showMark = garment.toLowerCase() !== "#d71216";

  return (
    <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: ground }}>
      <svg viewBox="0 0 200 250" className="piece-zoom absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" aria-hidden="true">
        {kind === "Caps" ? <Cap fill={garment} ink={ink} label={label} /> : null}
        {kind === "Slippers" ? <Slides fill={garment} label={label} /> : null}
        {kind === "Accessories" ? <Watch /> : null}
        {kind !== "Caps" && kind !== "Slippers" && kind !== "Accessories" ? (
          <Shirt
            d={kind === "Tanks" ? TANK : kind === "Sweaters" ? SWEATER : TEE}
            fill={garment}
            ink={ink}
            label={label}
            rib={kind === "Sweaters"}
          />
        ) : null}
      </svg>
      {showMark && kind !== "Accessories" ? (
        <Image
          src="/logo-mark.png"
          alt=""
          width={160}
          height={160}
          className={`pointer-events-none absolute h-auto -translate-x-1/2 ${
            kind === "Caps"
              ? "top-[31%] left-1/2 w-[18%]"
              : kind === "Slippers"
                ? "top-[54%] left-[52%] w-[13%]"
                : "top-[28%] left-1/2 w-[16%]"
          }`}
        />
      ) : null}
    </div>
  );
}

function Shirt({
  d,
  fill,
  ink,
  label,
  rib,
}: {
  d: string;
  fill: string;
  ink: string;
  label: string;
  rib: boolean;
}) {
  return (
    <>
      <path d={d} fill="#161412" opacity="0.08" transform="translate(5 7)" />
      <path d={d} fill={fill} />
      <path d="M78 50 Q100 68 122 50" fill="none" stroke={ink} strokeWidth="3" opacity="0.45" />
      {rib ? (
        <g stroke={ink} strokeWidth="2" opacity="0.35">
          <path d="M46 196 H154" />
          <path d="M46 204 H154" />
        </g>
      ) : null}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill={ink}
        fontSize={label.length > 8 ? 13 : 16}
        fontFamily="var(--font-outfit), sans-serif"
        letterSpacing="1.5"
      >
        {label}
      </text>
    </>
  );
}

function Cap({ fill, ink, label }: { fill: string; ink: string; label: string }) {
  return (
    <>
      <path d="M48 124 Q100 168 168 124 Q100 140 48 124 Z" fill="#161412" opacity="0.1" transform="translate(3 4)" />
      <path d="M62 126 Q64 74 100 66 Q136 74 138 126 Q100 136 62 126 Z" fill={fill} />
      <path d="M40 122 Q100 164 160 122 Q100 138 40 122 Z" fill={fill} />
      <circle cx="100" cy="68" r="4" fill={ink} />
      <text
        x="100"
        y="112"
        textAnchor="middle"
        fill={ink}
        fontSize="11"
        fontFamily="var(--font-outfit), sans-serif"
        letterSpacing="1"
      >
        {label.slice(0, 8)}
      </text>
    </>
  );
}

function Slides({ fill, label }: { fill: string; label: string }) {
  return (
    <>
      <g opacity="0.4">
        <path d="M26 112 C72 98 150 98 176 114 L168 128 C132 120 70 120 32 128 Z" fill={fill} />
        <path d="M78 114 C98 92 136 92 152 110 L146 124 C124 112 104 112 86 124 Z" fill={fill} />
      </g>
      <path d="M34 162 C78 148 156 148 188 166 L178 186 C138 176 74 176 42 184 Z" fill={fill} />
      <path d="M84 164 C104 136 152 136 168 156 L160 170 C136 158 112 158 90 170 Z" fill="#161412" opacity="0.28" />
      <text
        x="110"
        y="222"
        textAnchor="middle"
        fill="#161412"
        fontSize="13"
        fontFamily="var(--font-outfit), sans-serif"
        letterSpacing="1.6"
      >
        {label.slice(0, 8)}
      </text>
    </>
  );
}

function Watch() {
  return (
    <>
      <rect x="86" y="28" width="28" height="70" rx="8" fill="#1b1917" />
      <rect x="86" y="156" width="28" height="68" rx="8" fill="#1b1917" />
      <circle cx="100" cy="128" r="42" fill="#1b1917" />
      <circle cx="100" cy="128" r="34" fill="#f7f4ef" />
      <circle cx="100" cy="128" r="30" fill="none" stroke="#d71216" strokeWidth="2" />
      <text
        x="100"
        y="134"
        textAnchor="middle"
        fill="#d71216"
        fontSize="16"
        fontFamily="var(--font-fraunces), serif"
      >
        DS
      </text>
    </>
  );
}
