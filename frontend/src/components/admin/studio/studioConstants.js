import {
  Colorfilter,
  Text,
  Category,
  Magicpen,
  Edit,
} from "iconsax-react";

export const FONT_OPTIONS = [
  { id: "Mali", label: "Mali", sample: "Casual handwritten" },
  { id: "Racing Sans One", label: "Racing", sample: "Bold punchy" },
  { id: "Cause", label: "Cause", sample: "Modern script" },
];

export const PRESETS = [
  {
    id: "classic",
    name: "Classic",
    icon: "💎",
    badge: "from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30",
    style: {
      preset: "classic",
      bgColor: "#102a43",
      accentColor: "#2cb1bc",
      panelColor: "rgba(255,255,255,0.13)",
      textColor: "#f0f4f8",
      frameColor: "#ffffff",
      frameWidth: 16,
      frameRadius: 48,
      fontFamily: "Mali",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyber",
    icon: "⚡",
    badge: "from-fuchsia-500/20 to-cyan-500/20 text-fuchsia-400 border-fuchsia-500/30",
    style: {
      preset: "cyberpunk",
      bgColor: "#0a0618",
      accentColor: "#00f0ff",
      panelColor: "rgba(18, 14, 38, 0.85)",
      textColor: "#ffffff",
      frameColor: "#ff007f",
      frameWidth: 12,
      frameRadius: 32,
      fontFamily: "Racing Sans One",
    },
  },
  {
    id: "polaroid",
    name: "Polaroid",
    icon: "📷",
    badge: "from-amber-500/20 to-orange-600/20 text-amber-300 border-amber-500/30",
    style: {
      preset: "polaroid",
      bgColor: "#3d2b1f",
      accentColor: "#d4a373",
      panelColor: "#fefae0",
      textColor: "#283618",
      frameColor: "#faedcd",
      frameWidth: 20,
      frameRadius: 18,
      fontFamily: "Mali",
    },
  },
  {
    id: "receipt",
    name: "Receipt",
    icon: "🧾",
    badge: "from-zinc-500/20 to-slate-600/20 text-zinc-300 border-zinc-500/30",
    style: {
      preset: "receipt",
      bgColor: "#18181b",
      accentColor: "#27272a",
      panelColor: "#ffffff",
      textColor: "#09090b",
      frameColor: "#e4e4e7",
      frameWidth: 8,
      frameRadius: 24,
      fontFamily: "Mali",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    icon: "🌌",
    badge: "from-sky-500/20 to-teal-500/20 text-sky-300 border-sky-500/30",
    style: {
      preset: "aurora",
      bgColor: "#0f172a",
      accentColor: "#38bdf8",
      panelColor: "rgba(255, 255, 255, 0.18)",
      textColor: "#ffffff",
      frameColor: "rgba(255, 255, 255, 0.7)",
      frameWidth: 10,
      frameRadius: 44,
      fontFamily: "Mali",
    },
  },
  {
    id: "pastel",
    name: "Pastel",
    icon: "🌸",
    badge: "from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/30",
    style: {
      preset: "pastel",
      bgColor: "#2a1b2d",
      accentColor: "#e879f9",
      panelColor: "rgba(255, 255, 255, 0.15)",
      textColor: "#ffffff",
      frameColor: "#f472b6",
      frameWidth: 12,
      frameRadius: 36,
      fontFamily: "Cause",
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    icon: "🖤",
    badge: "from-slate-700/30 to-black/30 text-slate-200 border-white/20",
    style: {
      preset: "minimal",
      bgColor: "#09090b",
      accentColor: "#18181b",
      panelColor: "rgba(255, 255, 255, 0.08)",
      textColor: "#fafafa",
      frameColor: "rgba(255, 255, 255, 0.2)",
      frameWidth: 6,
      frameRadius: 28,
      fontFamily: "Mali",
    },
  },
];

export const defaultStyle = {
  preset: "classic",
  bgColor: "#102a43",
  accentColor: "#2cb1bc",
  panelColor: "rgba(255,255,255,0.13)",
  textColor: "#f0f4f8",
  frameColor: "#ffffff",
  frameWidth: 16,
  frameRadius: 48,
  questionFontSize: 42,
  answerFontSize: 62,
  fontFamily: "Mali",
  align: "center",
  aspectRatio: "9:16",
  showQRCode: true,
  bgImageUrl: null,
};

export const ASPECT_RATIOS = [
  { value: "9:16", label: "Story", ratio: "9:16" },
  { value: "1:1", label: "Post", ratio: "1:1" },
  { value: "16:9", label: "Wide", ratio: "16:9" },
];

export const TOOL_TABS = [
  { id: "content", name: "Content", icon: Edit },
  { id: "theme", name: "Theme", icon: Colorfilter },
  { id: "type", name: "Type", icon: Text },
  { id: "canvas", name: "Canvas", icon: Category },
  { id: "ai", name: "AI Magic", icon: Magicpen },
];

export function formatAskedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} | ${timePart}`;
}
