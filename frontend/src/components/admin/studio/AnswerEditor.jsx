import { motion } from "framer-motion";
import { Edit, Magicpen, Save2, Refresh } from "iconsax-react";
import { AI_TONE_PRESETS } from "../../../lib/aiAssistant";

export default function AnswerEditor({
  activeToolTab,
  setActiveToolTab,
  answer,
  setAnswer,
  saveDesign,
  selectedQuestionId,
  aiTone,
  setAiTone,
  aiDrafts,
  isGeneratingAi,
  handleGenerateAi,
}) {
  if (activeToolTab === "content") {
    return (
      <motion.div
        key="tab-content"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] flex items-center gap-1.5">
            <Edit size={12} className="text-cyan-400" /> Write Answer
          </label>
          <button
            type="button"
            onClick={() => {
              setActiveToolTab("ai");
              if (aiDrafts.length === 0 && selectedQuestionId) {
                handleGenerateAi(aiTone);
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all cursor-pointer"
          >
            <Magicpen size={11} className="text-purple-400" />
            <span>AI Drafts</span>
          </button>
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          className="w-full rounded-2xl p-3.5 bg-black/20 border border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none transition-all mali-regular"
          placeholder="Type your story answer (or generate with AI)..."
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400 font-mono">
            {answer.length} characters • Live typing broadcast active
          </span>
          <button
            type="button"
            onClick={saveDesign}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Save2 size={14} />
            <span>Publish Reply</span>
          </button>
        </div>
      </motion.div>
    );
  }

  if (activeToolTab === "ai") {
    return (
      <motion.div
        key="tab-ai"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)]">
            AI Tone Assistant
          </span>
          <button
            type="button"
            disabled={isGeneratingAi || !selectedQuestionId}
            onClick={() => handleGenerateAi(aiTone)}
            className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer disabled:opacity-50"
          >
            <Refresh size={12} className={isGeneratingAi ? "animate-spin" : ""} />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Tone Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AI_TONE_PRESETS.map((t) => {
            const isSelected = aiTone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setAiTone(t.id);
                  handleGenerateAi(t.id);
                }}
                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/50 ring-1 ring-purple-400 font-bold"
                    : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300"
                }`}
              >
                <span className="text-sm">{t.icon}</span>
                <span className="text-xs truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Generated Drafts List */}
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {isGeneratingAi ? (
            <div className="p-6 text-center text-xs text-purple-300 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating tailored drafts...</span>
            </div>
          ) : aiDrafts.length > 0 ? (
            aiDrafts.map((draft, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setAnswer(draft);
                  setActiveToolTab("content");
                }}
                className="p-3 rounded-2xl bg-black/20 border border-white/5 hover:border-purple-500/40 hover:bg-purple-500/5 cursor-pointer transition-all group"
              >
                <p className="text-xs text-slate-200 line-clamp-3 group-hover:text-purple-200">
                  {draft}
                </p>
                <div className="mt-1.5 flex justify-end">
                  <span className="text-[10px] text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Use Draft →
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs italic">
              Select a question and choose a tone to generate creative reply drafts.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}
