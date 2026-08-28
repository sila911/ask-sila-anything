import { motion } from "framer-motion";
import {
  TextalignLeft,
  TextalignCenter,
  TextalignRight,
  GalleryAdd,
  CloseCircle,
  ScanBarcode,
  Colorfilter,
  Text,
  Category,
} from "iconsax-react";
import { PRESETS, FONT_OPTIONS, ASPECT_RATIOS } from "./studioConstants";

export default function StyleControls({
  activeToolTab,
  style,
  setField,
  applyPreset,
  handleBgImageUpload,
  removeBgImage,
}) {
  if (activeToolTab === "theme") {
    return (
      <motion.div
        key="tab-theme"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="space-y-4"
      >
        {/* Preset Pills */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
            Theme Presets
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const isActive = (style.preset || "classic") === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? `bg-gradient-to-br ${p.badge} ring-2 ring-cyan-400 font-bold scale-[1.02] shadow-sm`
                      : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-semibold truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Color Controls */}
        <div className="pt-2 border-t border-white/5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
            Custom Color Palette
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Background", field: "bgColor", icon: "🎨" },
              { label: "Accent", field: "accentColor", icon: "✨" },
              { label: "Text", field: "textColor", icon: "✏️" },
              { label: "Frame", field: "frameColor", icon: "🔲" },
            ].map((item) => (
              <label
                key={item.field}
                className="flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 hover:border-white/20 cursor-pointer transition-all"
              >
                <input
                  type="color"
                  value={style[item.field] || "#ffffff"}
                  onChange={(e) => setField(item.field, e.target.value)}
                  className="w-6 h-6 rounded-lg border-0 bg-transparent cursor-pointer overflow-hidden p-0"
                />
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">
                    {item.label}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-200 truncate">
                    {style[item.field]}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeToolTab === "type") {
    return (
      <motion.div
        key="tab-type"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="space-y-4"
      >
        {/* Font Chips */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
            Font Family
          </span>
          <div className="grid grid-cols-3 gap-2">
            {FONT_OPTIONS.map((font) => {
              const isActive = style.fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setField("fontFamily", font.id)}
                  style={{ fontFamily: font.id }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-400 font-bold"
                      : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <span className="text-sm block">{font.label}</span>
                  <span className="text-[10px] opacity-60 block mt-0.5 font-sans">
                    {font.sample}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alignment Chips */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
            Text Alignment
          </span>
          <div className="flex h-9 rounded-xl bg-black/20 border border-white/10 p-0.5 gap-1">
            {[
              { value: "left", label: "Left", icon: TextalignLeft },
              { value: "center", label: "Center", icon: TextalignCenter },
              { value: "right", label: "Right", icon: TextalignRight },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = (style.align || "center") === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setField("align", opt.value)}
                  className={`flex-1 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size Sliders */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {[
            { label: "Question Size", field: "questionFontSize", min: 28, max: 56 },
            { label: "Answer Size", field: "answerFontSize", min: 36, max: 88 },
          ].map((item) => (
            <div key={item.field} className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-[color:var(--app-muted)] uppercase">
                  {item.label}
                </span>
                <span className="font-mono text-cyan-400">{style[item.field]}px</span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                value={style[item.field] || item.min}
                onChange={(e) => setField(item.field, Number(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (activeToolTab === "canvas") {
    return (
      <motion.div
        key="tab-canvas"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="space-y-4"
      >
        {/* Aspect Ratio Selector */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
            Card Format
          </span>
          <div className="grid grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((item) => {
              const isSelected = (style.aspectRatio || "9:16") === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setField("aspectRatio", item.value)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-400 font-bold"
                      : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <span className="text-xs font-semibold block">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block">{item.ratio}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frame Width & Radius */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
          {[
            { label: "Frame Border", field: "frameWidth", min: 0, max: 24, unit: "px" },
            { label: "Corner Radius", field: "frameRadius", min: 0, max: 64, unit: "px" },
          ].map((item) => (
            <div key={item.field} className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-[color:var(--app-muted)] uppercase">
                  {item.label}
                </span>
                <span className="font-mono text-cyan-400">
                  {style[item.field]}
                  {item.unit}
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                value={style[item.field] ?? 0}
                onChange={(e) => setField(item.field, Number(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          ))}
        </div>

        {/* Background Image Upload & Toggles */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 cursor-pointer transition-all">
              <GalleryAdd size={14} className="text-cyan-400" />
              <span>{style.bgImageUrl ? "Replace Photo" : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgImageUpload}
                className="hidden"
              />
            </label>
            {style.bgImageUrl && (
              <button
                type="button"
                onClick={removeBgImage}
                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
                title="Remove Custom Background"
              >
                <CloseCircle size={14} />
              </button>
            )}
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={style.showQRCode}
              onChange={(e) => setField("showQRCode", e.target.checked)}
              className="rounded bg-black/40 border-white/10 text-cyan-500 focus:ring-cyan-500/30"
            />
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <ScanBarcode size={14} className="text-cyan-400" />
              <span>QR Code</span>
            </span>
          </label>
        </div>
      </motion.div>
    );
  }

  return null;
}
