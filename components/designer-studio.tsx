"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type Konva from "konva";
import { Ellipse, Group, Image as KonvaImage, Layer, Path, Rect, Shape, Stage, Text, Transformer } from "react-konva";
import { submitDesignOrder } from "@/app/design/actions";
import {
  designProducts,
  garmentColours,
  inkForGarment,
  printArea,
  stageSize,
  type DesignProductId,
  type DesignSide,
  type GarmentColourId,
} from "@/lib/designer";
import { money } from "@/lib/site";

type DesignNode = {
  id: string;
  kind: "image" | "text";
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  src?: string;
  lowRes?: boolean;
  text?: string;
  fontFamily?: string;
  fill?: string;
  fontSize?: number;
};

type Snapshot = {
  boards: Record<string, DesignNode[]>;
  name: string;
  number: string;
  product: DesignProductId;
  side: DesignSide;
};

const EMPTY_BOARD: DesignNode[] = [];
const TEE = "M124 108 C160 82 260 82 296 108 L374 140 L330 186 L302 150 L296 452 C246 476 174 476 124 452 L118 150 L90 186 L46 140 Z";
const JERSEY = "M116 114 C158 78 262 78 304 114 L396 156 L336 210 L308 158 L302 470 C246 494 174 494 118 470 L112 158 L84 210 L24 156 Z";
const SCOOP = "M176 104 C192 146 228 146 244 104 C224 122 196 122 176 104 Z";
const VNECK = "M174 106 L210 164 L246 106 C226 122 194 122 174 106 Z";
const MUG = "M132 176 C132 148 288 148 288 176 L282 400 C282 434 138 434 138 400 Z";
const HANDLE = "M284 214 C360 208 362 366 284 370 L274 336 C330 330 328 250 274 244 Z";

function boardKey(product: DesignProductId, side: DesignSide) {
  return `${product}:${side}`;
}

function readFont(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function fitBox(x: number, y: number, width: number, height: number, bounds: { width: number; height: number }) {
  const nextWidth = Math.min(bounds.width, Math.max(20, width));
  const nextHeight = Math.min(bounds.height, Math.max(16, height));
  return {
    width: nextWidth,
    height: nextHeight,
    x: Math.max(nextWidth / 2, Math.min(x, bounds.width - nextWidth / 2)),
    y: Math.max(nextHeight / 2, Math.min(y, bounds.height - nextHeight / 2)),
  };
}

function rasterDesign(items: DesignNode[], images: Record<string, HTMLImageElement>, print: { width: number; height: number }) {
  const ratio = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(print.width * ratio));
  canvas.height = Math.max(1, Math.round(print.height * ratio));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(ratio, ratio);
  for (const item of items) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    if (item.kind === "image") {
      const image = images[item.id];
      if (image) ctx.drawImage(image, -item.width / 2, -item.height / 2, item.width, item.height);
    } else {
      ctx.fillStyle = item.fill || "#161412";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${item.fontSize || 32}px ${item.fontFamily || "sans-serif"}`;
      ctx.fillText(item.text || "", 0, 0);
    }
    ctx.restore();
  }
  return canvas;
}

function drawMugWrap(ctx: Konva.Context, art: HTMLCanvasElement, box: { x: number; y: number; width: number; height: number }) {
  const slices = 42;
  for (let index = 0; index < slices; index += 1) {
    const curve = Math.sin(((index + 0.5) / slices) * Math.PI);
    const srcW = art.width / slices;
    const slot = box.width / slices;
    const destW = slot * (0.38 + 0.62 * curve);
    const destX = box.x + index * slot + (slot - destW) / 2;
    const destH = box.height * (0.9 + 0.1 * curve);
    const destY = box.y + (box.height - destH) / 2;
    ctx.drawImage(art, index * srcW, 0, srcW + 0.5, art.height, destX, destY, destW, destH);
  }
}

export default function DesignerStudio() {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const pastRef = useRef<Snapshot[]>([]);
  const idRef = useRef(1);
  const captureMode = useRef<"download" | "send">("download");
  const fileRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<DesignProductId>("tee");
  const [colour, setColour] = useState<GarmentColourId>("white");
  const [side, setSide] = useState<DesignSide>("front");
  const [boards, setBoards] = useState<Record<string, DesignNode[]>>({});
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [real, setReal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageTick, setImageTick] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [note, setNote] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  const [mockupUri, setMockupUri] = useState("");
  const [sending, setSending] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fonts, setFonts] = useState({ display: "Anton", body: "Inter", script: "Caveat" });
  const [draft, setDraft] = useState("");
  const [fontFamily, setFontFamily] = useState("Anton");
  const [textFill, setTextFill] = useState("#161412");
  const [textSize, setTextSize] = useState(36);

  const piece = designProducts.find((item) => item.id === product) ?? designProducts[0];
  const swatch = garmentColours.find((item) => item.id === colour) ?? garmentColours[0];
  const print = printArea(product, side);
  const items = boards[boardKey(product, side)] ?? EMPTY_BOARD;
  const printed = real || capturing;
  const ink = inkForGarment(swatch.hex);
  const blurry = items.some((item) => item.lowRes);

  function remember() {
    pastRef.current.push({
      boards: structuredClone(boards),
      name: playerName,
      number: playerNumber,
      product,
      side,
    });
    if (pastRef.current.length > 30) pastRef.current.shift();
    setPastCount(pastRef.current.length);
  }

  function undo() {
    const previous = pastRef.current.pop();
    setPastCount(pastRef.current.length);
    if (!previous) return;
    setBoards(previous.boards);
    setPlayerName(previous.name);
    setPlayerNumber(previous.number);
    setProduct(previous.product);
    setSide(previous.side);
    setSelectedId(null);
  }

  function writeItems(next: DesignNode[]) {
    const key = boardKey(product, side);
    setBoards((current) => ({ ...current, [key]: next }));
  }

  function updateItem(id: string, patch: Partial<DesignNode>) {
    writeItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addNode(node: DesignNode) {
    remember();
    writeItems([...items, node]);
    setSelectedId(node.id);
  }

  const rememberImage = useCallback((id: string, image: HTMLImageElement) => {
    setImages((current) => ({ ...current, [id]: image }));
    setImageTick((value) => value + 1);
  }, []);

  function removeSelected() {
    if (!selectedId) return;
    remember();
    writeItems(items.filter((item) => item.id !== selectedId));
    setSelectedId(null);
  }

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => setScale(Math.min(1, frame.clientWidth / stageSize.width));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (!live) return;
      const display = readFont("--font-anton", "Anton");
      const body = readFont("--font-inter", "Inter");
      const script = readFont("--font-caveat", "Caveat");
      setFonts({ display, body, script });
      setFontFamily((current) => (current === "Anton" ? display : current));
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const transformer = trRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    if (!selectedId || printed) {
      transformer.nodes([]);
    } else {
      const node = stage.findOne(`#${selectedId}`);
      transformer.nodes(node ? [node] : []);
    }
    transformer.getLayer()?.batchDraw();
  }, [selectedId, printed, items, scale, side, product, imageTick]);

  useEffect(() => {
    if (!capturing) return;
    const handle = window.setTimeout(() => {
      const stage = stageRef.current;
      const layer = stage?.getLayers()[0];
      if (!stage || !layer) {
        setCapturing(false);
        setNote("The mockup could not be created. Try again.");
        return;
      }
      const previous = { sx: layer.scaleX(), sy: layer.scaleY(), w: stage.width(), h: stage.height() };
      layer.scale({ x: 1, y: 1 });
      stage.width(stageSize.width);
      stage.height(stageSize.height);
      stage.draw();
      const uri = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
      layer.scale({ x: previous.sx, y: previous.sy });
      stage.width(previous.w);
      stage.height(previous.h);
      stage.draw();
      if (captureMode.current === "download") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = "doosumthng-mockup.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setCapturing(false);
      } else {
        setMockupUri(uri);
        setCapturing(false);
        setSendOpen(true);
      }
    }, 80);
    return () => window.clearTimeout(handle);
  }, [capturing]);

  function onUpload(file: File | undefined) {
    if (!file) return;
    const svg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    const allowed = svg || file.type === "image/png" || file.type === "image/jpeg";
    if (!allowed) {
      setWarning("Use a PNG, JPG, or SVG.");
      return;
    }
    const src = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const naturalWidth = image.naturalWidth || 300;
      const naturalHeight = image.naturalHeight || 300;
      const scaleToFit = Math.min((print.width * 0.86) / naturalWidth, (print.height * 0.86) / naturalHeight, 1);
      const width = Math.max(48, naturalWidth * (naturalWidth ? scaleToFit : 0.7));
      const height = Math.max(48, naturalHeight * (naturalHeight ? scaleToFit : 0.7));
      const lowRes = !svg && image.naturalWidth > 0 && image.naturalWidth < 1500;
      addNode({
        id: `n${idRef.current++}`,
        kind: "image",
        src,
        x: print.width / 2,
        y: print.height / 2,
        width,
        height,
        rotation: 0,
        lowRes,
      });
      setWarning(lowRes ? "This image is under 1500px wide and may print blurry." : "");
    };
    image.src = src;
    if (fileRef.current) fileRef.current.value = "";
  }

  function addText() {
    const text = draft.trim();
    if (!text) return;
    const width = Math.min(print.width - 12, Math.max(80, text.length * textSize * 0.62));
    addNode({
      id: `n${idRef.current++}`,
      kind: "text",
      text,
      x: print.width / 2,
      y: print.height / 2,
      width,
      height: textSize,
      rotation: 0,
      fontFamily,
      fill: textFill,
      fontSize: textSize,
    });
  }

  async function sendDesign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mockupUri) return;
    setSending(true);
    setNote("");
    const response = await fetch(mockupUri);
    const blob = await response.blob();
    const formData = new FormData();
    formData.set("name", customerName);
    formData.set("phone", customerPhone);
    formData.set("product", product);
    formData.set("colour", colour);
    formData.set("print_name", playerName);
    formData.set("print_number", playerNumber);
    formData.set("mockup", new File([blob], "mockup.png", { type: "image/png" }));
    const result = await submitDesignOrder(formData);
    setSending(false);
    setNote(result.message);
    if (result.whatsapp) {
      window.open(result.whatsapp, "_blank", "noopener,noreferrer");
      setSendOpen(false);
    }
  }

  const fontChoices = [
    { label: "Anton", value: fonts.display },
    { label: "Inter", value: fonts.body },
    { label: "Caveat", value: fonts.script },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
      <div>
        <div ref={frameRef} className="w-full border border-ink/15 bg-black">
          <Stage
            ref={stageRef}
            width={stageSize.width * scale}
            height={stageSize.height * scale}
            onMouseDown={(event) => {
              if (event.target.name() === "background") setSelectedId(null);
            }}
            onTouchStart={(event) => {
              if (event.target.name() === "background") setSelectedId(null);
            }}
          >
            <Layer scaleX={scale} scaleY={scale}>
              <Rect name="background" width={stageSize.width} height={stageSize.height} fill="#0A0A0B" />
              <Garment product={product} side={side} fill={swatch.hex} />
              {printed && product === "mug" ? (
                <MugWrap key={`${imageTick}-${items.map((item) => item.id).join(",")}-${swatch.hex}`} items={items} images={images} print={print} />
              ) : null}
              <Group
                x={print.x}
                y={print.y}
                clipX={0}
                clipY={0}
                clipWidth={print.width}
                clipHeight={print.height}
                visible={!(printed && product === "mug")}
              >
                {product === "jersey" && side === "back" && playerName ? (
                  <Text
                    text={playerName.toUpperCase()}
                    x={print.width / 2}
                    y={print.height * 0.28}
                    width={print.width - 16}
                    offsetX={(print.width - 16) / 2}
                    offsetY={14}
                    align="center"
                    fontFamily={fonts.display}
                    fontSize={28}
                    fill={ink}
                    listening={false}
                    globalCompositeOperation={printed ? "multiply" : "source-over"}
                  />
                ) : null}
                {product === "jersey" && side === "back" && playerNumber ? (
                  <Text
                    text={playerNumber}
                    x={print.width / 2}
                    y={print.height * 0.58}
                    width={print.width - 12}
                    offsetX={(print.width - 12) / 2}
                    offsetY={48}
                    align="center"
                    fontFamily={fonts.display}
                    fontSize={96}
                    fill={ink}
                    listening={false}
                    globalCompositeOperation={printed ? "multiply" : "source-over"}
                  />
                ) : null}
                {items.map((item) =>
                  item.kind === "image" && item.src ? (
                    <ArtworkImage
                      key={item.id}
                      item={item}
                      printed={printed}
                      bounds={print}
                      onReady={rememberImage}
                      onSelect={() => setSelectedId(item.id)}
                      onRemember={remember}
                      onChange={(patch) => updateItem(item.id, patch)}
                    />
                  ) : (
                    <ArtworkText
                      key={item.id}
                      item={item}
                      printed={printed}
                      bounds={print}
                      onSelect={() => setSelectedId(item.id)}
                      onRemember={remember}
                      onChange={(patch) => updateItem(item.id, patch)}
                    />
                  ),
                )}
              </Group>
              {!printed ? (
                <Rect
                  x={print.x}
                  y={print.y}
                  width={print.width}
                  height={print.height}
                  stroke="#D71216"
                  dash={[7, 5]}
                  strokeWidth={1.5}
                  listening={false}
                />
              ) : null}
              {!printed ? <Transformer ref={trRef} rotateEnabled borderStroke="#D71216" anchorStroke="#F3EFE7" anchorFill="#D71216" /> : null}
            </Layer>
          </Stage>
        </div>
        <p className="mt-2 text-sm text-muted">
          {piece.label} · {swatch.label} · {money(piece.price)}
          {printed ? " · print preview" : " · dashed box is the print area"}
        </p>
      </div>

      <div className="space-y-6 lg:pr-44">
        <fieldset>
          <legend className="font-display text-2xl uppercase">1. Piece</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {designProducts.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={product === option.id}
                className={`min-h-12 border px-4 ${product === option.id ? "border-brand bg-brand text-[#F3EFE7]" : "border-ink/25"}`}
                onClick={() => {
                  setProduct(option.id);
                  setSide("front");
                  setSelectedId(null);
                }}
              >
                {option.label} {money(option.price)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {garmentColours.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={colour === option.id}
                className={`min-h-12 border px-3 ${colour === option.id ? "border-brand" : "border-ink/25"}`}
                onClick={() => setColour(option.id)}
              >
                <span className="mr-2 inline-block h-3 w-3 rounded-full ring-1 ring-ink/40" style={{ backgroundColor: option.hex }} />
                {option.label}
              </button>
            ))}
          </div>
          {piece.sides.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {piece.sides.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={side === option}
                  className={`min-h-12 border px-4 capitalize ${side === option ? "border-ink bg-ink text-paper" : "border-ink/25"}`}
                  onClick={() => {
                    setSide(option);
                    setSelectedId(null);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </fieldset>

        {product === "jersey" ? (
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="font-display text-2xl uppercase sm:col-span-2">Name and number</legend>
            <label className="text-sm">
              Name on the back
              <input
                className="field"
                maxLength={16}
                value={playerName}
                onFocus={remember}
                onChange={(event) => setPlayerName(event.target.value)}
              />
            </label>
            <label className="text-sm">
              Number on the back
              <input
                className="field"
                inputMode="numeric"
                maxLength={3}
                value={playerNumber}
                onFocus={remember}
                onChange={(event) => setPlayerNumber(event.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </label>
          </fieldset>
        ) : null}

        <div>
          <h2 className="font-display text-2xl uppercase">2. Artwork</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="btn cursor-pointer">
              Upload PNG, JPG, or SVG
              <input
                ref={fileRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,.svg"
                onChange={(event) => onUpload(event.target.files?.[0])}
              />
            </label>
            <button type="button" className="btn" onClick={() => setReal((value) => !value)} aria-pressed={real}>
              {real ? "Back to editing" : "See it real"}
            </button>
          </div>
          {blurry || warning ? (
            <p className="mt-3 text-sm text-brand" role="status">
              {warning || "This image is under 1500px wide and may print blurry."}
            </p>
          ) : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              Text
              <input className="field" value={draft} maxLength={40} placeholder="Your words" onChange={(event) => setDraft(event.target.value)} />
            </label>
            <label className="text-sm">
              Font
              <select className="field" value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}>
                {fontChoices.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Colour
              <input className="mt-2 block h-12 w-16 cursor-pointer border border-ink/30 bg-transparent" type="color" value={textFill} onChange={(event) => setTextFill(event.target.value)} />
            </label>
            <label className="text-sm">
              Size {textSize}px
              <input
                className="mt-3 block w-full"
                type="range"
                min={16}
                max={96}
                value={textSize}
                onChange={(event) => setTextSize(Number(event.target.value))}
              />
            </label>
            <div className="flex items-end">
              <button type="button" className="btn w-full" onClick={addText}>
                Add text
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={undo} disabled={pastCount === 0}>
            Undo
          </button>
          <button type="button" className="btn" onClick={removeSelected} disabled={!selectedId}>
            Delete
          </button>
          <button
            type="button"
            className="btn"
            disabled={capturing}
            onClick={() => {
              captureMode.current = "download";
              setCapturing(true);
            }}
          >
            Download mockup
          </button>
          <button
            type="button"
            className="btn"
            disabled={capturing}
            onClick={() => {
              captureMode.current = "send";
              setCapturing(true);
            }}
          >
            Send my design
          </button>
        </div>
        {note ? (
          <p className="bg-deep px-4 py-3" role="status">
            {note}
          </p>
        ) : null}
        {real && colour === "black" ? (
          <p className="text-sm text-muted">On black, the print preview looks darker because it uses a multiply blend.</p>
        ) : null}
      </div>

      {sendOpen ? (
        <form
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4"
          onSubmit={sendDesign}
        >
          <div className="w-full max-w-md bg-paper p-5">
            <h2 className="font-display text-4xl uppercase">Send my design</h2>
            <p className="mt-2 text-sm text-muted">We save the mockup, then open WhatsApp with your details.</p>
            <label className="mt-4 block text-sm">
              Name
              <input className="field" required value={customerName} autoComplete="name" onChange={(event) => setCustomerName(event.target.value)} />
            </label>
            <label className="mt-3 block text-sm">
              Phone
              <input className="field" required value={customerPhone} autoComplete="tel" inputMode="tel" onChange={(event) => setCustomerPhone(event.target.value)} />
            </label>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn" type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send on WhatsApp"}
              </button>
              <button className="btn-quiet" type="button" onClick={() => setSendOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function Garment({ product, side, fill }: { product: DesignProductId; side: DesignSide; fill: string }) {
  if (product === "mug") {
    return (
      <>
        <Path data={HANDLE} fill={fill} listening={false} />
        <Path data={MUG} fill={fill} listening={false} />
        <Ellipse x={210} y={176} radiusX={78} radiusY={16} fill={fill} stroke="#0A0A0B" strokeWidth={2} listening={false} />
        <Path data="M150 190 C162 210 168 300 162 390" stroke="#000" strokeWidth={10} opacity={0.18} listening={false} />
        <Ellipse x={210} y={176} radiusX={62} radiusY={8} fill="#0A0A0B" opacity={0.35} listening={false} />
      </>
    );
  }
  const body = product === "jersey" ? JERSEY : TEE;
  const neck = product === "jersey" && side === "front" ? VNECK : SCOOP;
  return (
    <>
      <Path data={body} fill={fill} listening={false} />
      <Path data={neck} fill="#0A0A0B" listening={false} />
    </>
  );
}

function MugWrap({
  items,
  images,
  print,
}: {
  items: DesignNode[];
  images: Record<string, HTMLImageElement>;
  print: { x: number; y: number; width: number; height: number };
}) {
  return (
    <Shape
      listening={false}
      sceneFunc={(context, shape) => {
        const art = rasterDesign(items, images, print);
        context.save();
        context.beginPath();
        context.moveTo(138, 184);
        context.bezierCurveTo(138, 156, 282, 156, 282, 184);
        context.lineTo(276, 396);
        context.bezierCurveTo(276, 426, 144, 426, 144, 396);
        context.closePath();
        context.clip();
        context.globalCompositeOperation = "multiply";
        drawMugWrap(context, art, print);
        context.restore();
        context.fillStrokeShape(shape);
      }}
    />
  );
}

function ArtworkImage({
  item,
  printed,
  bounds,
  onReady,
  onSelect,
  onRemember,
  onChange,
}: {
  item: DesignNode;
  printed: boolean;
  bounds: { width: number; height: number };
  onReady: (id: string, image: HTMLImageElement) => void;
  onSelect: () => void;
  onRemember: () => void;
  onChange: (patch: Partial<DesignNode>) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!item.src) return;
    const next = new window.Image();
    next.onload = () => {
      setImage(next);
      onReady(item.id, next);
    };
    next.src = item.src;
  }, [item.id, item.src, onReady]);

  if (!image) return null;

  return (
    <KonvaImage
      id={item.id}
      image={image}
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
      offsetX={item.width / 2}
      offsetY={item.height / 2}
      rotation={item.rotation}
      draggable={!printed}
      globalCompositeOperation={printed ? "multiply" : "source-over"}
      onMouseDown={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onTouchStart={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onDragStart={onRemember}
      onDragMove={(event) => clampNode(event.target, bounds)}
      onDragEnd={(event) => onChange({ x: event.target.x(), y: event.target.y() })}
      onTransformStart={onRemember}
      onTransformEnd={(event) => {
        const node = event.target;
        const placed = fitBox(node.x(), node.y(), node.width() * node.scaleX(), node.height() * node.scaleY(), bounds);
        node.scaleX(1);
        node.scaleY(1);
        onChange({ ...placed, rotation: node.rotation() });
      }}
    />
  );
}

function ArtworkText({
  item,
  printed,
  bounds,
  onSelect,
  onRemember,
  onChange,
}: {
  item: DesignNode;
  printed: boolean;
  bounds: { width: number; height: number };
  onSelect: () => void;
  onRemember: () => void;
  onChange: (patch: Partial<DesignNode>) => void;
}) {
  const fontSize = item.fontSize || 32;
  return (
    <Text
      id={item.id}
      text={item.text || ""}
      x={item.x}
      y={item.y}
      width={item.width}
      offsetX={item.width / 2}
      offsetY={fontSize / 2}
      align="center"
      fontFamily={item.fontFamily}
      fontSize={fontSize}
      fill={item.fill || "#161412"}
      rotation={item.rotation}
      draggable={!printed}
      globalCompositeOperation={printed ? "multiply" : "source-over"}
      onMouseDown={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onTouchStart={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onDragStart={onRemember}
      onDragMove={(event) => clampNode(event.target, bounds)}
      onDragEnd={(event) => onChange({ x: event.target.x(), y: event.target.y() })}
      onTransformStart={onRemember}
      onTransformEnd={(event) => {
        const node = event.target;
        const nextSize = Math.max(16, fontSize * node.scaleY());
        const placed = fitBox(node.x(), node.y(), node.width() * node.scaleX(), nextSize, bounds);
        node.scaleX(1);
        node.scaleY(1);
        onChange({ x: placed.x, y: placed.y, width: placed.width, height: nextSize, fontSize: nextSize, rotation: node.rotation() });
      }}
    />
  );
}

function clampNode(node: Konva.Node, bounds: { width: number; height: number }) {
  const halfW = (node.width() * Math.abs(node.scaleX())) / 2;
  const halfH = (node.height() * Math.abs(node.scaleY())) / 2;
  node.x(Math.max(halfW, Math.min(node.x(), bounds.width - halfW)));
  node.y(Math.max(halfH, Math.min(node.y(), bounds.height - halfH)));
}
