import {
  Flash,
  Save2,
  Copy,
  DocumentDownload,
  Instagram,
  Facebook,
  Share,
} from "iconsax-react";

export default function StudioActions({
  generateImage,
  saveDesign,
  copyImage,
  downloadImage,
  openPlatform,
  message,
}) {
  return (
    <div className="w-full max-w-[360px] space-y-2">
      {/* Compact Action Toolbar (Small Icons + Short Names) */}
      <div className="w-full grid grid-cols-3 gap-1.5 pt-1">
        <ActionButton
          onClick={generateImage}
          icon={<Flash size={15} variant="Bold" />}
          label="Render"
          color="bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
        />
        <ActionButton
          onClick={saveDesign}
          icon={<Save2 size={15} variant="Bold" />}
          label="Save"
          color="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
        />
        <ActionButton
          onClick={copyImage}
          icon={<Copy size={15} variant="Bold" />}
          label="Copy"
          color="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-white/10"
        />
        <ActionButton
          onClick={downloadImage}
          icon={<DocumentDownload size={15} variant="Bold" />}
          label="Export"
          color="bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
        />
        <ActionButton
          onClick={() => openPlatform("instagram")}
          icon={<Instagram size={15} variant="Bold" />}
          label="Instagram"
          color="bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white"
        />
        <ActionButton
          onClick={() => openPlatform("facebook")}
          icon={<Facebook size={15} variant="Bold" />}
          label="Facebook"
          color="bg-blue-600 hover:bg-blue-500 text-white"
        />
      </div>

      {/* Status Message Notification */}
      {message && (
        <div className="w-full p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Share className="mt-0.5 shrink-0 text-cyan-400" size={13} />
          <p className="text-[11px] text-cyan-300 leading-snug font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-xl px-2 ${color} active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-md cursor-pointer`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
