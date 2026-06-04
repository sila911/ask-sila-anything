import { useEffect, useMemo, useState, useRef } from "react";
import {
  FiCopy,
  FiDownload,
  FiImage,
  FiInstagram,
  FiSave,
  FiShare2,
  FiChevronDown,
  FiSearch,
  FiCheck,
} from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { dataUrlToBlob, renderTextToImage } from "../lib/imageRenderer";

const FONT_OPTIONS = [
  "Georgia",
  "Verdana",
  "Trebuchet MS",
  "Times New Roman",
  "Arial",
];

const defaultStyle = {
  bgColor: "#102a43",
  accentColor: "#2cb1bc",
  panelColor: "rgba(255,255,255,0.13)",
  textColor: "#f0f4f8",
  frameColor: "#ffffff",
  frameWidth: 16,
  frameRadius: 48,
  questionFontSize: 42,
  answerFontSize: 62,
  fontFamily: "Georgia",
  align: "center",
};

function formatAskedAt(value) {
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

export default function CreateDesignPage({
  seedDesign,
  onSave,
  onEvent,
  onNotify,
  questions,
  onQuestionAnswered,
}) {
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [answer, setAnswer] = useState("");
  const [style, setStyle] = useState(defaultStyle);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return sortedQuestions;
    return sortedQuestions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedQuestions, searchTerm]);

  useEffect(() => {
    const pending = sortedQuestions.find((q) => q.status !== "answered");
    if (!selectedQuestionId && pending) {
      setSelectedQuestionId(pending.id);
    }
  }, [sortedQuestions, selectedQuestionId]);

  useEffect(() => {
    if (!seedDesign) return;
    setStyle({ ...defaultStyle, ...(seedDesign.style || {}) });
    setImageDataUrl(seedDesign.imageDataUrl || "");
    setAnswer(seedDesign.answerText || "");
    if (seedDesign.questionId) {
      setSelectedQuestionId(seedDesign.questionId);
    }
  }, [seedDesign]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedQuestion = sortedQuestions.find(
    (q) => q.id === selectedQuestionId,
  );

  const previewStyle = useMemo(
    () => ({
      background: `linear-gradient(160deg, ${style.bgColor}, ${style.accentColor})`,
      color: style.textColor,
      fontFamily: style.fontFamily,
      textAlign: style.align,
      border: `${Number(style.frameWidth || 0)}px solid ${style.frameColor}`,
      borderRadius: `${Number(style.frameRadius || 0)}px`,
    }),
    [style],
  );

  const setField = (name, value) => {
    setStyle((prev) => ({ ...prev, [name]: value }));
  };

  const generateImage = () => {
    if (!selectedQuestion?.question) {
      setMessage("Select a user question first.");
      return;
    }

    const nextDataUrl = renderTextToImage(
      {
        question: selectedQuestion.question,
        answer,
        askedAt: selectedQuestion.createdAt,
      },
      style,
    );
    setImageDataUrl(nextDataUrl);
    setMessage("Image generated with user question + your answer.");
    onEvent("image_rendered", { fontFamily: style.fontFamily });
    onNotify?.(
      "Image generated",
      "Question and answer story preview is ready.",
      "success",
    );
  };

  const saveDesign = async () => {
    if (!selectedQuestion?.question) {
      setMessage("Select a question first.");
      return;
    }

    try {
      if (answer.trim()) {
        await onQuestionAnswered(selectedQuestion.id);
      }

      // Also save to our local library database
      const designData = {
        id: seedDesign?.id || crypto.randomUUID(),
        questionId: selectedQuestion.id,
        questionText: selectedQuestion.question,
        answerText: answer,
        text: `Q: ${selectedQuestion.question}\nA: ${answer}`,
        style,
        imageDataUrl: imageDataUrl || "",
        createdAt: seedDesign?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: seedDesign?.stats || { copies: 0, downloads: 0, shares: 0 },
      };
      await onSave(designData);

      setAnswer("");
      setImageDataUrl("");
      setMessage("Answer saved to library.");
      onEvent("answer_saved", { hasImage: Boolean(imageDataUrl) });
      onNotify?.("Saved", "Answer saved to library and displayed publicly.", "success");
    } catch (error) {
      console.error(error);
      setMessage("Save failed. Check server configuration.");
      onNotify?.(
        "Save failed",
        error.message || "Could not save the answer.",
        "error",
      );
    }
  };

  const copyImage = async () => {
    if (!imageDataUrl) {
      setMessage("Generate an image first.");
      return;
    }

    try {
      const blob = await dataUrlToBlob(imageDataUrl);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setMessage("Copied image to clipboard. You can paste into story editor.");
      onEvent("image_copied");
      onNotify?.("Copied", "Image copied to clipboard.", "success");
    } catch {
      setMessage("Copy failed in this browser. Use Download instead.");
      onEvent("image_copy_failed");
      onNotify?.(
        "Copy failed",
        "Browser blocked image clipboard. Use download.",
        "error",
      );
    }
  };

  const downloadImage = () => {
    if (!imageDataUrl) {
      setMessage("Generate an image first.");
      return;
    }

    const a = document.createElement("a");
    a.href = imageDataUrl;
    a.download = `answer-${Date.now()}.png`;
    a.click();
    onEvent("image_downloaded");
    onNotify?.("Downloaded", "Image file saved.", "success");
  };

  const openPlatform = (platform) => {
    const map = {
      instagram: "https://www.instagram.com/",
      facebook: "https://www.facebook.com/stories/create/",
    };

    window.open(map[platform], "_blank", "noopener,noreferrer");
    setMessage(`Opened ${platform}. Paste or upload your generated image.`);
    onEvent("share_opened", { platform });
    onNotify?.("Share opened", `Ready to post on ${platform}.`, "info");
  };

  return (
    <section>
      <h2 className="text-xl font-bold">Answer Creator</h2>
      <p className="text-sm text-[color:var(--app-muted)] mt-1 mb-4">
        Pick a user question, write answer, style the image, then generate and
        share.
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          {/* Custom User Question Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <span className="block text-sm text-[color:var(--app-muted)] mb-1">User Question</span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full h-12 px-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left group"
            >
              <span className="truncate text-sm font-medium">
                {selectedQuestion ? (
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${selectedQuestion.status === 'answered' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="truncate">{selectedQuestion.question}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Select a question...</span>
                )}
              </span>
              <FiChevronDown className={`shrink-0 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-[100] rounded-2xl bg-[#fcfcfd] dark:bg-[#131b2b] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                <div className="p-2 border-b border-slate-200 dark:border-white/5">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border-none focus:ring-2 focus:ring-cyan-500/30 text-sm outline-none"
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setIsDropdownOpen(false);
                          setSearchTerm("");
                        }}
                        className={`w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col gap-1 transition-colors ${selectedQuestionId === q.id ? 'bg-cyan-500/10 dark:bg-cyan-500/5' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            q.status === 'answered' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          }`}>
                            {q.status}
                          </span>
                          {selectedQuestionId === q.id && <FiCheck className="text-cyan-500" size={14} />}
                        </div>
                        <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                          {q.question}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                      No matching questions.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm">
              <span className="text-[color:var(--app-muted)]">Admin Answer</span>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="mt-1 w-full rounded-2xl p-4 bg-[color:var(--input-bg)] border border-[color:var(--input-border)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                placeholder="Write your answer here..."
              />
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveDesign}
                className="rounded-xl px-4 py-2 bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors inline-flex items-center gap-2 text-sm shadow-md"
              >
                <FiSave size={14} /> Submit Reply
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Background</span>
              <input
                type="color"
                value={style.bgColor}
                onChange={(e) => setField("bgColor", e.target.value)}
                className="h-10 w-full rounded-lg"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Accent</span>
              <input
                type="color"
                value={style.accentColor}
                onChange={(e) => setField("accentColor", e.target.value)}
                className="h-10 w-full rounded-lg"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Text</span>
              <input
                type="color"
                value={style.textColor}
                onChange={(e) => setField("textColor", e.target.value)}
                className="h-10 w-full rounded-lg"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Panel</span>
              <input
                type="text"
                value={style.panelColor}
                onChange={(e) => setField("panelColor", e.target.value)}
                className="h-10 w-full rounded-lg px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Frame Color</span>
              <input
                type="color"
                value={style.frameColor}
                onChange={(e) => setField("frameColor", e.target.value)}
                className="h-10 w-full rounded-lg"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[color:var(--app-muted)]">Font</span>
              <select
                value={style.fontFamily}
                onChange={(e) => setField("fontFamily", e.target.value)}
                className="h-10 w-full rounded-lg px-3 bg-[color:var(--input-bg)] border border-[color:var(--input-border)]"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">
              Question size ({style.questionFontSize}px)
            </span>
            <input
              type="range"
              min="28"
              max="56"
              value={style.questionFontSize}
              onChange={(e) =>
                setField("questionFontSize", Number(e.target.value))
              }
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">
              Answer size ({style.answerFontSize}px)
            </span>
            <input
              type="range"
              min="36"
              max="88"
              value={style.answerFontSize}
              onChange={(e) =>
                setField("answerFontSize", Number(e.target.value))
              }
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">
              Frame width ({style.frameWidth}px)
            </span>
            <input
              type="range"
              min="0"
              max="36"
              value={style.frameWidth}
              onChange={(e) => setField("frameWidth", Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <label className="block text-sm">
            <span className="text-[color:var(--app-muted)]">
              Frame radius ({style.frameRadius}px)
            </span>
            <input
              type="range"
              min="0"
              max="80"
              value={style.frameRadius}
              onChange={(e) => setField("frameRadius", Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              type="button"
              onClick={generateImage}
              className="rounded-xl px-3 py-2 bg-cyan-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <FiImage size={15} /> Generate
            </button>
            <button
              type="button"
              onClick={saveDesign}
              className="rounded-xl px-3 py-2 bg-slate-800 text-white hover:opacity-90 inline-flex items-center justify-center gap-2 dark:bg-slate-100 dark:text-slate-900"
            >
              <FiSave size={15} /> Save
            </button>
            <button
              type="button"
              onClick={copyImage}
              className="rounded-xl px-3 py-2 bg-emerald-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <FiCopy size={15} /> Copy
            </button>
            <button
              type="button"
              onClick={downloadImage}
              className="rounded-xl px-3 py-2 bg-indigo-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <FiDownload size={15} /> Download
            </button>
            <button
              type="button"
              onClick={() => openPlatform("instagram")}
              className="rounded-xl px-3 py-2 bg-pink-600 text-white hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <FiInstagram size={15} /> IG Story
            </button>
            <button
              type="button"
              onClick={() => openPlatform("facebook")}
              className="rounded-xl px-3 py-2 bg-blue-700 text-white hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <FaFacebookF size={13} /> FB Story
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className="h-[430px] rounded-3xl border border-[color:var(--card-border)] p-6 overflow-hidden"
            style={previewStyle}
          >
            <div
              className="h-full rounded-2xl px-5 py-7 flex flex-col gap-4"
              style={{ background: style.panelColor }}
            >
              {selectedQuestion?.createdAt && (
                <p className="text-right text-xs opacity-90">
                  {formatAskedAt(selectedQuestion.createdAt)}
                </p>
              )}

              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.12em] opacity-80">
                  Question
                </p>
                <p
                  className="whitespace-pre-wrap leading-[1.25] mt-1"
                  style={{
                    fontSize: `${Math.max(16, style.questionFontSize / 2.5)}px`,
                  }}
                >
                  {selectedQuestion?.question ||
                    "User question will appear here."}
                </p>
              </div>

              <div className="h-px bg-white/45" />

              <div className="flex-1">
                <p className="text-[0.72rem] uppercase tracking-[0.12em] opacity-80">
                  Answer
                </p>
                <p
                  className="whitespace-pre-wrap leading-[1.2] mt-1"
                  style={{
                    fontSize: `${Math.max(18, style.answerFontSize / 2.2)}px`,
                  }}
                >
                  {answer || "Admin answer appears below the question."}
                </p>
              </div>
            </div>
          </div>

          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt="Generated answer story"
              className="w-full rounded-2xl border border-[color:var(--card-border)]"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--input-border)] p-5 text-sm text-[color:var(--app-muted)]">
              Generated image will appear here.
            </div>
          )}

          {message && (
            <p className="text-sm text-[color:var(--app-muted)] inline-flex items-center gap-2">
              <FiShare2 size={14} /> {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
