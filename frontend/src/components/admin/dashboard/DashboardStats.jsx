import {
  Image,
  Category,
  Notification,
  Copy,
  DocumentDownload,
  Share,
} from "iconsax-react";

export default function DashboardStats({
  total,
  rendered,
  totalQuestions,
  pendingQuestions,
  totalCopies,
  totalDownloads,
  totalShareClicks,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <StatCard label="Total Designs" value={total} icon={<Category size={16} />} />
      <StatCard label="Rendered" value={rendered} icon={<Image size={16} />} />
      <StatCard label="Total Questions" value={totalQuestions} icon={<Notification size={16} />} />
      <StatCard
        label="Pending"
        value={pendingQuestions}
        icon={<Notification size={16} />}
        highlight={pendingQuestions > 0}
      />
      <StatCard label="Copies" value={totalCopies} icon={<Copy size={16} />} />
      <StatCard label="Downloads" value={totalDownloads} icon={<DocumentDownload size={16} />} />
      <StatCard label="Shares" value={totalShareClicks} icon={<Share size={16} />} />
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div
      className={`glass-subpane p-3 rounded-2xl border transition-all ${
        highlight
          ? "border-amber-500/30 bg-amber-500/5 text-amber-500"
          : "border-white/10 hover:border-cyan-500/30"
      }`}
    >
      <div className="flex items-center justify-between text-[color:var(--app-muted)] mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-bold font-['Racing_Sans_One',sans-serif] text-[color:var(--app-text)]">
        {value}
      </p>
    </div>
  );
}
