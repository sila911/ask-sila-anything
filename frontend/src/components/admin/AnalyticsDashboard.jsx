import { useMemo } from "react";
import { Eye, Heart, Message, MessageQuestion, Award, Activity, Chart, TrendUp, Flash } from "iconsax-react";

export default function AnalyticsDashboard({ questions = [], designs = [], comments = [], events = [] }) {
  // Aggregate Metrics
  const stats = useMemo(() => {
    const totalQ = questions.length;
    const answeredQ = questions.filter((q) => q.status === "answered").length;
    const answerRate = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;
    const totalViews = questions.reduce((sum, q) => sum + (q.views_count || 0), 0);
    const totalLikes = questions.reduce((sum, q) => sum + (q.likes_count || 0), 0);
    const totalAnswerLikes = questions.reduce((sum, q) => sum + (q.answer_likes_count || 0), 0);
    const totalComments = comments.length;

    // Reaction breakdown
    const reactionTotals = { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 };
    questions.forEach((q) => {
      if (q.reactions) {
        Object.entries(q.reactions).forEach(([k, v]) => {
          if (reactionTotals[k] !== undefined) reactionTotals[k] += v || 0;
        });
      }
    });

    const sumReactions = Object.values(reactionTotals).reduce((a, b) => a + b, 0) || 1;

    // Top questions by engagement
    const topQuestions = [...questions]
      .map((q) => {
        const qComments = comments.filter((c) => c.questionId === q.id).length;
        const score = (q.views_count || 0) + (q.likes_count || 0) * 3 + qComments * 5;
        return { ...q, commentCount: qComments, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Questions over time (last 7 days)
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = questions.filter((q) => q.createdAt?.startsWith(dateStr)).length;
      const ansCount = questions.filter((q) => q.status === "answered" && q.updatedAt?.startsWith(dateStr)).length;
      days.push({ date: dateStr, label: dayLabel, count, ansCount });
    }

    return {
      totalQ,
      answeredQ,
      answerRate,
      totalViews,
      totalLikes,
      totalAnswerLikes,
      totalComments,
      reactionTotals,
      sumReactions,
      topQuestions,
      days,
    };
  }, [questions, designs, comments]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Chart size={24} className="text-emerald-500" />
            <span>Platform Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time engagement metrics, views, and audience reaction trends.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Metrics</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Questions</span>
            <MessageQuestion size={16} className="text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalQ}</p>
          <span className="text-[10px] text-cyan-500 font-semibold">{stats.answeredQ} answered</span>
        </div>

        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Answer Rate</span>
            <TrendUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.answerRate}%</p>
          <span className="text-[10px] text-emerald-500 font-semibold">{stats.totalQ - stats.answeredQ} pending</span>
        </div>

        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
            <Eye size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalViews}</p>
          <span className="text-[10px] text-blue-500 font-semibold">Feed impressions</span>
        </div>

        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Question Likes</span>
            <Heart size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalLikes}</p>
          <span className="text-[10px] text-rose-500 font-semibold">Community hearts</span>
        </div>

        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Answer Likes</span>
            <Flash size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalAnswerLikes}</p>
          <span className="text-[10px] text-amber-500 font-semibold">Story appreciation</span>
        </div>

        <div className="glass-shell rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Comments</span>
            <Message size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalComments}</p>
          <span className="text-[10px] text-purple-500 font-semibold">Discussions</span>
        </div>
      </div>

      {/* Activity Timeline + Reaction Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Activity Chart */}
        <div className="lg:col-span-2 glass-shell rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-cyan-500" />
                <span>Questions Activity (Last 7 Days)</span>
              </h3>
              <span className="text-xs text-slate-400">Volume per day</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Track incoming question flow and answering velocity.
            </p>
          </div>

          <div className="flex items-end justify-between gap-3 h-44 pt-4 border-b border-slate-200 dark:border-white/10">
            {stats.days.map((d, i) => {
              const maxVal = Math.max(...stats.days.map((x) => x.count), 5);
              const heightPct = Math.max((d.count / maxVal) * 100, 8);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div className="w-full max-w-[32px] bg-slate-100 dark:bg-white/5 rounded-t-xl overflow-hidden relative flex items-end justify-center h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xl transition-all duration-500 group-hover:from-cyan-500 group-hover:to-cyan-300"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reaction Breakdown */}
        <div className="glass-shell rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Heart size={18} className="text-rose-500" />
              <span>Reaction Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Audience sentiment across all questions.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { type: "heart", emoji: "❤️", label: "Love", color: "bg-rose-500" },
              { type: "laugh", emoji: "😂", label: "Haha", color: "bg-amber-500" },
              { type: "think", emoji: "🤔", label: "Hmm", color: "bg-indigo-500" },
              { type: "gasp", emoji: "😮", label: "Wow", color: "bg-cyan-500" },
              { type: "fire", emoji: "🔥", label: "Hot", color: "bg-orange-500" },
            ].map((r) => {
              const count = stats.reactionTotals[r.type] || 0;
              const pct = Math.round((count / stats.sumReactions) * 100);
              return (
                <div key={r.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span>{r.emoji}</span>
                      <span className="text-slate-700 dark:text-slate-300">{r.label}</span>
                    </span>
                    <span className="text-slate-500 font-bold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${r.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Questions Leaderboard */}
      <div className="glass-shell rounded-3xl p-5 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <span>Top Performing Questions</span>
          </h3>
          <span className="text-xs text-slate-400">Ranked by engagement</span>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-white/5">
          {stats.topQuestions.length > 0 ? (
            stats.topQuestions.map((q, idx) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {q.question}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Status: <span className="font-bold text-cyan-500 uppercase">{q.status || "new"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1" title="Views">
                    <Eye size={13} className="text-blue-400" />
                    <span>{q.views_count || 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Likes">
                    <Heart size={13} className="text-rose-400" />
                    <span>{q.likes_count || 0}</span>
                  </span>
                  <span className="flex items-center gap-1" title="Comments">
                    <Message size={13} className="text-purple-400" />
                    <span>{q.commentCount || 0}</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">No questions available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
