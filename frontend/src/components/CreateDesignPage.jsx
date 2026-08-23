import { useEffect, useMemo, useState, useRef } from "react";
import {
  Copy,
  DocumentDownload,
  Image,
  Instagram,
  Save2,
  Share,
  ArrowDown2,
  SearchNormal1,
  Check,
  Facebook,
  GalleryAdd,
  CloseCircle,
  Magicpen,
  Notification,
} from "iconsax-react";
import { dataUrlToBlob, renderTextToImage } from "../lib/imageRenderer";
import { supabase } from "../lib/supabase";

const FONT_OPTIONS = [
  "Mali",
  "Racing Sans One",
  "Cause",
];

const PRESETS = [
  {
    id: "classic",
    name: "Classic",
    badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
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
    }
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    badge: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
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
    }
  },
  {
    id: "polaroid",
    name: "Polaroid",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
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
    }
  },
  {
    id: "receipt",
    name: "Receipt",
    badge: "bg-slate-200/20 text-slate-200 border-slate-400/30",
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
    }
  },
  {
    id: "aurora",
    name: "Aurora",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
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
    }
  }
];

const defaultStyle = {
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

const ASPECT_RATIOS = [
  { value: "9:16", label: "Story (9:16)" },
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
];

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
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const fontDropdownRef = useRef(null);
  const ratioDropdownRef = useRef(null);

  // Realtime live typing refs and handlers
  const channelRef = useRef(null);
  const prevQuestionIdRef = useRef(selectedQuestionId);
  const lastBroadcastTimeRef = useRef(0);
  const pendingBroadcastRef = useRef(null);

  const sendBroadcastThrottled = (text, isTyping) => {
    const now = Date.now();
    const minInterval = 200; // ms to throttle typing updates

    if (pendingBroadcastRef.current) {
      clearTimeout(pendingBroadcastRef.current);
      pendingBroadcastRef.current = null;
    }

    const performSend = () => {
      if (channelRef.current && selectedQuestionId) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            questionId: selectedQuestionId,
            text,
            isTyping
          }
        });
        lastBroadcastTimeRef.current = Date.now();
      }
    };

    if (!isTyping || now - lastBroadcastTimeRef.current >= minInterval) {
      performSend();
    } else {
      const delay = minInterval - (now - lastBroadcastTimeRef.current);
      pendingBroadcastRef.current = setTimeout(performSend, delay);
    }
  };

  // Initialize Supabase realtime channel for typing updates
  useEffect(() => {
    channelRef.current = supabase.channel('sila-typing');
    channelRef.current.subscribe();

    return () => {
      if (channelRef.current) {
        // Send final stop typing broadcast using current ref values
        const currentQId = prevQuestionIdRef.current;
        if (currentQId) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              questionId: currentQId,
              text: "",
              isTyping: false
            }
          });
        }
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Watch for answer changes to broadcast typing state
  useEffect(() => {
    if (!selectedQuestionId) return;

    if (!answer.trim()) {
      sendBroadcastThrottled("", false);
      return;
    }

    sendBroadcastThrottled(answer, true);

    // Idle timeout to stop typing after 3 seconds of inactivity
    const idleTimeout = setTimeout(() => {
      sendBroadcastThrottled(answer, false);
    }, 3000);

    return () => {
      clearTimeout(idleTimeout);
      if (pendingBroadcastRef.current) {
        clearTimeout(pendingBroadcastRef.current);
      }
    };
  }, [answer, selectedQuestionId]);

  // Watch for question changes to clear typing state on previous question
  useEffect(() => {
    if (prevQuestionIdRef.current && prevQuestionIdRef.current !== selectedQuestionId) {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            questionId: prevQuestionIdRef.current,
            text: "",
            isTyping: false
          }
        });
      }
    }
    prevQuestionIdRef.current = selectedQuestionId;
  }, [selectedQuestionId]);

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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target)) {
        setIsFontDropdownOpen(false);
      }
      if (ratioDropdownRef.current && !ratioDropdownRef.current.contains(event.target)) {
        setIsRatioDropdownOpen(false);
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
      backgroundImage: style.bgImageUrl
        ? `linear-gradient(rgba(10, 15, 29, 0.65), rgba(10, 15, 29, 0.65)), url(${style.bgImageUrl})`
        : style.preset === "aurora"
        ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0284c7 70%, #06b6d4 100%)"
        : style.preset === "cyberpunk"
        ? "linear-gradient(135deg, #0a0618 0%, #190a36 50%, #001a2e 100%)"
        : style.preset === "receipt"
        ? "linear-gradient(135deg, #18181b 0%, #27272a 100%)"
        : `linear-gradient(160deg, ${style.bgColor}, ${style.accentColor})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
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

  const applyPreset = (presetObj) => {
    setStyle((prev) => ({
      ...prev,
      ...presetObj.style,
      bgImageUrl: prev.bgImageUrl, // retain custom background if uploaded
    }));
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setField("bgImageUrl", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeBgImage = () => {
    setField("bgImageUrl", null);
  };

  const generateImage = async () => {
    if (!selectedQuestion?.question) {
      setMessage("Select a user question first.");
      return;
    }

    try {
      const questionUrl = `${window.location.origin}/q/${selectedQuestion.number || selectedQuestion.id}`;
      const nextDataUrl = await renderTextToImage(
        {
          question: selectedQuestion.question,
          answer,
          askedAt: selectedQuestion.createdAt,
          url: questionUrl,
        },
        style,
      );
      setImageDataUrl(nextDataUrl);
      setMessage("Image generated with user question + your answer.");
      onEvent("image_rendered", { fontFamily: style.fontFamily, showQRCode: style.showQRCode });
      onNotify?.(
        "Image generated",
        "Question and answer story preview is ready.",
        "success",
      );
    } catch (err) {
      console.error(err);
      setMessage("Failed to generate image.");
      onNotify?.("Error", "Failed to generate image", "error");
    }
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

      // Force stop typing broadcast immediately on save
      if (channelRef.current && selectedQuestion.id) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            questionId: selectedQuestion.id,
            text: "",
            isTyping: false
          }
        });
      }

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
    <section className="w-full max-w-full overflow-hidden px-1">
      <h2 className="text-lg sm:text-xl font-bold">Answer Creator</h2>
      <p className="text-xs sm:text-sm text-[color:var(--app-muted)] mt-1 mb-4">
        Pick a question, write answer, style, generate & share.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Controls */}
        <div className="space-y-4 min-w-0">
          <div className="relative" ref={dropdownRef}>
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[color:var(--app-muted)] mb-1.5 ml-1">
              User Question
            </span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full h-12 px-3 sm:px-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left"
            >
              <span className="truncate text-sm font-medium pr-2">
                {selectedQuestion ? (
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${selectedQuestion.status === 'answered' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="truncate">{selectedQuestion.question}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Select a question...</span>
                )}
              </span>
              <ArrowDown2 className={`shrink-0 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-[100] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                <div className="p-2 border-b border-slate-200 dark:border-white/5">
                  <div className="relative">
                    <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border-none text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
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
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${q.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {q.status}
                          </span>
                          {selectedQuestionId === q.id && <Check className="text-cyan-500" size={14} />}
                        </div>
                        <p className="text-xs sm:text-sm cause-medium line-clamp-2">{q.question}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">No matching questions.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[color:var(--app-muted)] ml-1">
                Admin Answer
              </span>
              {selectedQuestion?.notify_handle && (
                <a
                  href={`https://t.me/${selectedQuestion.notify_handle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <Notification size={12} />
                  <span>Notify: {selectedQuestion.notify_handle} ↗</span>
                </a>
              )}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full rounded-2xl p-3 sm:p-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm sm:text-base resize-none"
              placeholder="Write your answer..."
            />
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={saveDesign}
                className="rounded-xl px-4 py-2 bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-all text-xs sm:text-sm shadow-lg shadow-cyan-600/20 active:scale-95"
              >
                <Save2 className="inline-block mr-2" size={14} /> Submit Reply
              </button>
            </div>
          </div>

          {/* Preset Themes Selector */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[color:var(--app-muted)] ml-1">
              ✨ Story Theme Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => {
                const isActive = (style.preset || "classic") === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? `${p.badge} ring-2 ring-cyan-400 font-bold scale-105 shadow-sm`
                        : "bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-cyan-400/50"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Background Photo Upload */}
          <div className="p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[color:var(--app-muted)] flex items-center gap-1.5">
                <GalleryAdd size={14} className="text-cyan-500" /> Custom Photo Background
              </span>
              {style.bgImageUrl && (
                <button
                  type="button"
                  onClick={removeBgImage}
                  className="text-xs text-rose-500 hover:text-rose-600 inline-flex items-center gap-1"
                >
                  <CloseCircle size={13} /> Remove
                </button>
              )}
            </div>

            {style.bgImageUrl ? (
              <div className="relative h-14 w-full rounded-xl overflow-hidden border border-cyan-500/40">
                <img src={style.bgImageUrl} alt="Background preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] text-white font-semibold">Custom Photo Active</span>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white/30 dark:bg-white/5 hover:border-cyan-500 cursor-pointer transition-all text-xs text-slate-500 dark:text-slate-400">
                <GalleryAdd size={16} />
                <span>Upload background image (PNG, JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Styling Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Background', field: 'bgColor', type: 'color' },
              { label: 'Accent', field: 'accentColor', type: 'color' },
              { label: 'Text', field: 'textColor', type: 'color' },
              { label: 'Frame', field: 'frameColor', type: 'color' },
            ].map(item => (
              <label key={item.field} className="space-y-1">
                <span className="block text-[10px] text-[color:var(--app-muted)] font-bold ml-1 uppercase">{item.label}</span>
                <input
                  type={item.type}
                  value={style[item.field]}
                  onChange={(e) => setField(item.field, e.target.value)}
                  className="h-9 w-full rounded-xl cursor-pointer border-2 border-white/10 dark:border-white/5 overflow-hidden"
                />
              </label>
            ))}
            {/* Custom Font Dropdown */}
            <div className="relative space-y-1" ref={fontDropdownRef}>
              <span className="block text-[10px] text-[color:var(--app-muted)] font-bold ml-1 uppercase">Font</span>
              <button
                type="button"
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                className="flex items-center justify-between w-full h-9 px-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left text-xs font-semibold"
              >
                <span style={{ fontFamily: style.fontFamily }}>{style.fontFamily}</span>
                <ArrowDown2 className={`shrink-0 text-slate-400 transition-transform duration-200 ${isFontDropdownOpen ? 'rotate-180' : ''}`} size={14} />
            </button>
            {isFontDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden py-1 max-h-40 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => {
                        setField("fontFamily", font);
                        setIsFontDropdownOpen(false);
                      }}
                      style={{ fontFamily: font }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors ${style.fontFamily === font ? 'text-cyan-500 font-bold bg-cyan-500/5' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <span>{font}</span>
                      {style.fontFamily === font && <Check className="text-cyan-500" size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Aspect Ratio Dropdown */}
            <div className="relative space-y-1" ref={ratioDropdownRef}>
              <span className="block text-[10px] text-[color:var(--app-muted)] font-bold ml-1 uppercase">Aspect Ratio</span>
              <button
                type="button"
                onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
                className="flex items-center justify-between w-full h-9 px-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left text-xs font-semibold"
              >
                <span>
                  {style.aspectRatio === "9:16" ? "Story (9:16)" : style.aspectRatio === "1:1" ? "Square (1:1)" : "Landscape (16:9)"}
                </span>
                <ArrowDown2 className={`shrink-0 text-slate-400 transition-transform duration-200 ${isRatioDropdownOpen ? 'rotate-180' : ''}`} size={14} />
            </button>
            {isRatioDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden py-1">
                <div className="flex flex-col">
                  {ASPECT_RATIOS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setField("aspectRatio", opt.value);
                        setIsRatioDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors ${style.aspectRatio === opt.value ? 'text-cyan-500 font-bold bg-cyan-500/5' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <span>{opt.label}</span>
                      {style.aspectRatio === opt.value && <Check className="text-cyan-500" size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Text Alignment */}
            <div className="relative space-y-1 col-span-2 sm:col-span-3">
              <span className="block text-[10px] text-[color:var(--app-muted)] font-bold ml-1 uppercase">Alignment</span>
              <div className="flex h-9 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-0.5 gap-0.5">
                {[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setField('align', opt.value)}
                    className={`flex-1 text-xs font-semibold rounded-lg transition-all ${
                      (style.align || 'center') === opt.value
                        ? 'bg-cyan-500 text-white dark:text-slate-950 shadow-md font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Toggle */}
            <div className="relative space-y-1 col-span-2 sm:col-span-3">
              <span className="block text-[10px] text-[color:var(--app-muted)] font-bold ml-1 uppercase">QR Code Stamp</span>
              <button
                type="button"
                onClick={() => setField('showQRCode', !style.showQRCode)}
                className="flex items-center justify-between w-full h-9 px-3 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left text-xs font-semibold"
              >
                <span className="text-slate-600 dark:text-slate-300">Embed scanable QR code pointing to story page</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                  style.showQRCode 
                    ? 'bg-cyan-500/20 text-cyan-600 dark:bg-cyan-500/40 dark:text-cyan-300' 
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {style.showQRCode ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Question Size', field: 'questionFontSize', min: 28, max: 56 },
              { label: 'Answer Size', field: 'answerFontSize', min: 36, max: 88 },
              { label: 'Frame Width', field: 'frameWidth', min: 0, max: 36 },
              { label: 'Frame Radius', field: 'frameRadius', min: 0, max: 80 },
            ].map(item => (
              <div key={item.field} className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--app-muted)]">{item.label}</span>
                  <span className="text-[10px] font-mono text-cyan-500">{style[item.field]}px</span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  value={style[item.field]}
                  onChange={(e) => setField(item.field, Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-center bg-slate-100/50 dark:bg-black/10 rounded-[2.5rem] p-4 border border-slate-200 dark:border-white/5 h-[340px] sm:h-[480px]">
            <div
              className={`shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ${
                style.aspectRatio === "9:16"
                  ? "h-full aspect-[9/16]"
                  : style.aspectRatio === "1:1"
                  ? "h-full aspect-square"
                  : "w-full aspect-[16/9] max-h-full"
              }`}
              style={previewStyle}
            >
              <div
                className="flex-1 rounded-[1.8rem] m-2 px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-3 sm:gap-5 overflow-hidden"
                style={{ background: style.panelColor, textAlign: style.align }}
              >
                {selectedQuestion?.createdAt && (
                  <p className="text-right text-[9px] sm:text-xs opacity-70 font-mono tracking-tighter">
                    {formatAskedAt(selectedQuestion.createdAt)}
                  </p>
                )}

                <div className="min-w-0">
                  <p className="text-[0.6rem] sm:text-[0.7rem] uppercase tracking-widest font-bold opacity-60">Question</p>
                  <p
                    className="whitespace-pre-wrap leading-snug mt-1 break-all sm:break-words italic"
                    style={{ fontSize: `${Math.max(13, style.questionFontSize / 3.2)}px` }}
                  >
                    {selectedQuestion?.question || "Question preview..."}
                  </p>
                </div>

                <div className="h-px bg-white/20 w-full" />

                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[0.6rem] sm:text-[0.7rem] uppercase tracking-widest font-bold opacity-60">Answer</p>
                  <p
                    className="whitespace-pre-wrap leading-tight mt-1.5 break-all sm:break-words font-bold"
                    style={{ fontSize: `${Math.max(15, style.answerFontSize / 3)}px` }}
                  >
                    {answer || "Answer preview..."}
                  </p>
                </div>
              </div>

              {style.showQRCode && (
                <div 
                  className="absolute bottom-6 right-6 bg-white p-1 rounded-lg flex items-center justify-center shadow-lg z-10 pointer-events-none scale-75 sm:scale-100 origin-bottom-right"
                  style={{ width: '42px', height: '42px' }}
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

          {/* Action Buttons moved here */}
          <div className="flex flex-wrap gap-2 py-2">
            <ActionButton onClick={generateImage} icon={<Image size={18} />} label="Generate" color="bg-cyan-700" />
            <ActionButton onClick={saveDesign} icon={<Save2 size={18} />} label="Save" color="bg-slate-800 dark:bg-slate-100 dark:text-slate-900" />
            <ActionButton onClick={copyImage} icon={<Copy size={18} />} label="Copy" color="bg-emerald-700" />
            <ActionButton onClick={downloadImage} icon={<DocumentDownload size={18} />} label="Download" color="bg-indigo-700" />
            <ActionButton onClick={() => openPlatform("instagram")} icon={<Instagram size={18} />} label="IG Story" color="bg-pink-600" />
            <ActionButton onClick={() => openPlatform("facebook")} icon={<Facebook size={18} />} label="FB Story" color="bg-blue-700" />
          </div>

          <div className="space-y-3">
            {imageDataUrl ? (
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-black/20 shadow-inner p-1">
                <img src={imageDataUrl} alt="Preview" className="w-full h-auto rounded-xl" />
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-xs text-slate-400">
                <Image className="mx-auto mb-2 opacity-20" size={32} />
                Generate image for preview
              </div>
            )}

            {message && (
              <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Share className="mt-0.5 shrink-0 text-cyan-500" size={14} /> 
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ onClick, icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[100px] h-9 sm:h-10 rounded-xl px-2 sm:px-3 ${color} text-white hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold shadow-md`}
    >
      <span className="shrink-0 scale-90 sm:scale-100">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
