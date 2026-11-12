"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type Konva from "konva";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { submitDesignOrder } from "@/app/design/actions";
import {
  canvasGrey,
  designBlend,
  designProducts,
  garmentColours,
  inkForGarment,
  isDarkGarment,
  mockupSrc,
  printArea,
  productFrame,
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

export default function DesignerStudio() {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const designRef = useRef<Konva.Group>(null);
  const frameRef = useRef<HTMLDivElement>(null);
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
  const [dragging, setDragging] = useState(false);
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
  const ink = inkForGarment(colour);
  const blend = designBlend(colour);
  const childBlend = product === "mug" ? { composite: "source-over" as const, opacity: 1 } : blend;
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

  const rememberImage = useCallback(() => {
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
    const node = designRef.current;
    if (!node) return;
    node.clearCache();
    if (product === "mug" && !dragging) {
      node.cache({ pixelRatio: 2 });
      node.getLayer()?.batchDraw();
    }
  }, [product, dragging, items, imageTick, playerName, playerNumber, colour, side, fonts, ink]);

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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:items-start">
      <div>
        <div ref={frameRef} className="w-full border border-ink/15 bg-[#E9E9E9]">
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
              <Rect name="background" width={stageSize.width} height={stageSize.height} fill={canvasGrey} />
              <ProductPhoto src={mockupSrc(product, side)} colour={swatch.hex} dark={isDarkGarment(colour)} />
              <Group
                ref={designRef}
                x={print.x}
                y={print.y}
                clipX={0}
                clipY={0}
                clipWidth={print.width}
                clipHeight={print.height}
                globalCompositeOperation={product === "mug" ? blend.composite : "source-over"}
                opacity={product === "mug" ? blend.opacity : 1}
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
                    globalCompositeOperation={childBlend.composite}
                    opacity={childBlend.opacity}
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
                    globalCompositeOperation={childBlend.composite}
                    opacity={childBlend.opacity}
                  />
                ) : null}
                {items.map((item) =>
                  item.kind === "image" && item.src ? (
                    <ArtworkImage
                      key={item.id}
                      item={item}
                      composite={childBlend.composite}
                      opacity={childBlend.opacity}
                      bounds={print}
                      onReady={rememberImage}
                      onSelect={() => setSelectedId(item.id)}
                      onRemember={remember}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onDragState={setDragging}
                    />
                  ) : (
                    <ArtworkText
                      key={item.id}
                      item={item}
                      composite={childBlend.composite}
                      opacity={childBlend.opacity}
                      bounds={print}
                      onSelect={() => setSelectedId(item.id)}
                      onRemember={remember}
                      onChange={(patch) => updateItem(item.id, patch)}
                      onDragState={setDragging}
                    />
                  ),
                )}
                {product === "mug" && !dragging ? (
                  <Rect
                    width={print.width}
                    height={print.height}
                    listening={false}
                    globalCompositeOperation="destination-in"
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: print.width, y: 0 }}
                    fillLinearGradientColorStops={[0, "rgba(0,0,0,0.4)", 0.14, "rgba(0,0,0,1)", 0.86, "rgba(0,0,0,1)", 1, "rgba(0,0,0,0.4)"]}
                  />
                ) : null}
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
          {side === "back" ? " · back" : ""}
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

function ProductPhoto({ src, colour, dark }: { src: string; colour: string; dark: boolean }) {
  const groupRef = useRef<Konva.Group>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const size = productFrame.size;

  useEffect(() => {
    const next = new window.Image();
    next.onload = () => setImage(next);
    next.src = src;
    return () => setImage(null);
  }, [src]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !image) return;
    group.clearCache();
    group.cache({ pixelRatio: 2 });
    group.getLayer()?.batchDraw();
  }, [image, colour, dark, size]);

  if (!image) return null;

  return (
    <Group
      ref={groupRef}
      x={productFrame.x}
      y={productFrame.y}
      listening={false}
      shadowColor="rgba(0,0,0,0.45)"
      shadowBlur={28}
      shadowOffsetY={16}
      shadowOpacity={0.4}
    >
      <KonvaImage image={image} width={size} height={size} />
      <Rect width={size} height={size} fill={colour} globalCompositeOperation="multiply" listening={false} />
      <KonvaImage image={image} width={size} height={size} globalCompositeOperation="destination-in" listening={false} />
      {dark ? (
        <KonvaImage image={image} width={size} height={size} globalCompositeOperation="screen" opacity={0.2} listening={false} />
      ) : null}
    </Group>
  );
}

function ArtworkImage({
  item,
  composite,
  opacity,
  bounds,
  onReady,
  onSelect,
  onRemember,
  onChange,
  onDragState,
}: {
  item: DesignNode;
  composite: "source-over" | "multiply";
  opacity: number;
  bounds: { width: number; height: number };
  onReady: () => void;
  onSelect: () => void;
  onRemember: () => void;
  onChange: (patch: Partial<DesignNode>) => void;
  onDragState: (dragging: boolean) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!item.src) return;
    const next = new window.Image();
    next.onload = () => {
      setImage(next);
      onReady();
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
      opacity={opacity}
      draggable
      globalCompositeOperation={composite}
      onMouseDown={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onTouchStart={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onDragStart={() => {
        onRemember();
        onDragState(true);
      }}
      onDragMove={(event) => clampNode(event.target, bounds)}
      onDragEnd={(event) => {
        onDragState(false);
        onChange({ x: event.target.x(), y: event.target.y() });
      }}
      onTransformStart={() => {
        onRemember();
        onDragState(true);
      }}
      onTransformEnd={(event) => {
        const node = event.target;
        const placed = fitBox(node.x(), node.y(), node.width() * node.scaleX(), node.height() * node.scaleY(), bounds);
        node.scaleX(1);
        node.scaleY(1);
        onDragState(false);
        onChange({ ...placed, rotation: node.rotation() });
      }}
    />
  );
}

function ArtworkText({
  item,
  composite,
  opacity,
  bounds,
  onSelect,
  onRemember,
  onChange,
  onDragState,
}: {
  item: DesignNode;
  composite: "source-over" | "multiply";
  opacity: number;
  bounds: { width: number; height: number };
  onSelect: () => void;
  onRemember: () => void;
  onChange: (patch: Partial<DesignNode>) => void;
  onDragState: (dragging: boolean) => void;
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
      opacity={opacity}
      draggable
      globalCompositeOperation={composite}
      onMouseDown={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onTouchStart={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onDragStart={() => {
        onRemember();
        onDragState(true);
      }}
      onDragMove={(event) => clampNode(event.target, bounds)}
      onDragEnd={(event) => {
        onDragState(false);
        onChange({ x: event.target.x(), y: event.target.y() });
      }}
      onTransformStart={() => {
        onRemember();
        onDragState(true);
      }}
      onTransformEnd={(event) => {
        const node = event.target;
        const nextSize = Math.max(16, fontSize * node.scaleY());
        const placed = fitBox(node.x(), node.y(), node.width() * node.scaleX(), nextSize, bounds);
        node.scaleX(1);
        node.scaleY(1);
        onDragState(false);
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
