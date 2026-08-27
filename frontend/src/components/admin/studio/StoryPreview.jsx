import { Mobile, Eye, Image as ImageIcon } from "iconsax-react";
import { formatAskedAt } from "./studioConstants";

export default function StoryPreview({
  previewMode,
  currentTime,
  style,
  previewStyle,
  selectedQuestion,
  answer,
  imageDataUrl,
  generateImage,
}) {
  if (previewMode === "rendered") {
    return (
      <div className="w-full max-w-[360px] space-y-3 animate-in fade-in duration-200">
        {imageDataUrl ? (
          <div className="rounded-3xl border border-white/15 overflow-hidden bg-black/40 shadow-2xl p-1.5">
            <img
              src={imageDataUrl}
              alt="Rendered Preview"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-black/20">
            <ImageIcon className="mx-auto mb-2 opacity-30 text-cyan-400" size={36} />
            <p className="font-medium">No rendered image yet.</p>
            <button
              type="button"
              onClick={generateImage}
              className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Render Now
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    /* REALISTIC PHONE CHASSIS MOCKUP */
    <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/18.5] rounded-[44px] sm:rounded-[48px] bg-slate-950 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] sm:border-[8px] border-slate-800 dark:border-zinc-800 ring-1 ring-white/15 flex flex-col overflow-hidden transition-all duration-300">
      {/* Dynamic Island / Notch Pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 h-5 w-24 rounded-full bg-black border border-white/10 flex items-center justify-between px-2 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] text-slate-300 font-mono">Live</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-white/90">
        <span className="font-mono tracking-tight">{currentTime || "20:00"}</span>
        <div className="flex items-center gap-1.5 text-[9px]">
          <span>5G</span>
          <div className="flex gap-0.5 items-end h-2">
            <span className="w-0.5 h-1 bg-white rounded-full" />
            <span className="w-0.5 h-1.5 bg-white rounded-full" />
            <span className="w-0.5 h-2 bg-white rounded-full" />
          </div>
          <div className="w-4 h-2 rounded-[3px] border border-white/80 p-0.5 flex items-center">
            <div className="w-2.5 h-full bg-emerald-400 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Phone Viewport (Story Card Inner Area) */}
      <div className="flex-1 rounded-[32px] sm:rounded-[36px] overflow-hidden my-1 relative flex items-center justify-center p-2 bg-slate-900/50">
        <div
          className={`w-full overflow-hidden flex flex-col relative transition-all duration-300 shadow-2xl ${
            style.aspectRatio === "9:16"
              ? "h-full aspect-[9/16]"
              : style.aspectRatio === "1:1"
              ? "aspect-square"
              : "aspect-[16/9]"
          }`}
          style={previewStyle}
        >
          <div
            className="flex-1 rounded-[1.6rem] m-2 px-3 py-5 sm:px-4 sm:py-6 flex flex-col gap-2.5 overflow-hidden"
            style={{ background: style.panelColor, textAlign: style.align }}
          >
            {selectedQuestion?.createdAt && (
              <p className="text-right text-[8px] sm:text-[9px] opacity-70 font-mono tracking-tighter">
                {formatAskedAt(selectedQuestion.createdAt)}
              </p>
            )}

            <div className="min-w-0">
              <p className="text-[0.55rem] sm:text-[0.65rem] uppercase tracking-widest font-bold opacity-60">
                Question
              </p>
              <p
                className="whitespace-pre-wrap leading-snug mt-0.5 break-all sm:break-words italic"
                style={{ fontSize: `${Math.max(12, style.questionFontSize / 3.4)}px` }}
              >
                {selectedQuestion?.question || "Select a question above..."}
              </p>
            </div>

            <div className="h-px bg-white/20 w-full my-0.5" />

            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[0.55rem] sm:text-[0.65rem] uppercase tracking-widest font-bold opacity-60">
                Answer
              </p>
              <p
                className="whitespace-pre-wrap leading-tight mt-1 break-all sm:break-words font-bold mali-medium"
                style={{ fontSize: `${Math.max(14, style.answerFontSize / 3.2)}px` }}
              >
                {answer || "Answer preview will show here..."}
              </p>
            </div>
          </div>

          {/* QR Stamp Badge */}
          {style.showQRCode && (
            <div
              className="absolute bottom-4 right-4 bg-white p-1 rounded-lg flex items-center justify-center shadow-lg z-10 pointer-events-none scale-75 origin-bottom-right"
              style={{ width: "36px", height: "36px" }}
            >
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex justify-between h-[45%]">
                  <div className="w-[45%] h-full bg-slate-950 border border-white rounded-[1px]" />
                  <div className="w-[45%] h-full bg-slate-950 rounded-[1px] opacity-40" />
                </div>
                <div className="flex justify-between h-[45%]">
                  <div className="w-[45%] h-full bg-slate-950 rounded-[1px] opacity-60" />
                  <div className="w-[45%] h-full bg-slate-950 border border-white rounded-[1px]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Home Swipe Bar */}
      <div className="relative z-20 pb-1 flex justify-center">
        <div className="w-28 h-1 rounded-full bg-white/40" />
      </div>
    </div>
  );
}
