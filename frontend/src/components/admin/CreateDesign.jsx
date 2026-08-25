import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  DocumentDownload,
  Image as ImageIcon,
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
  Refresh,
  Key,
  Colorfilter,
  TextalignCenter,
  TextalignLeft,
  TextalignRight,
  Text,
  Mobile,
  ScanBarcode,
  Eye,
  Flash,
  Edit,
  Category,
} from "iconsax-react";
import { Sparkles } from "lucide-react";
import { dataUrlToBlob, renderTextToImage } from "../../lib/imageRenderer";
import { supabase } from "../../lib/supabase";
import { AI_TONE_PRESETS, generateAnswerDrafts } from "../../lib/aiAssistant";

const FONT_OPTIONS = [
  { id: "Mali", label: "Mali", sample: "Casual handwritten" },
  { id: "Racing Sans One", label: "Racing", sample: "Bold punchy" },
  { id: "Cause", label: "Cause", sample: "Modern script" },
];

const PRESETS = [
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
  { value: "9:16", label: "Story", ratio: "9:16" },
  { value: "1:1", label: "Post", ratio: "1:1" },
  { value: "16:9", label: "Wide", ratio: "16:9" },
];

const TOOL_TABS = [
  { id: "content", name: "Content", icon: Edit },
  { id: "theme", name: "Theme", icon: Colorfilter },
  { id: "type", name: "Type", icon: Text },
  { id: "canvas", name: "Canvas", icon: Category },
  { id: "ai", name: "AI Magic", icon: Magicpen },
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeToolTab, setActiveToolTab] = useState("content");
  const [previewMode, setPreviewMode] = useState("phone"); // 'phone' | 'rendered'
  const [currentTime, setCurrentTime] = useState("");

  const dropdownRef = useRef(null);

  // Live status bar time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seedDesign) {
      if (seedDesign.questionId) {
        setSelectedQuestionId(seedDesign.questionId);
      }
      if (seedDesign.text) {
        setAnswer(seedDesign.text);
      }
      if (seedDesign.style) {
        setStyle((prev) => ({ ...prev, ...seedDesign.style }));
      }
    }
  }, [seedDesign]);

  // AI Assistant State
  const [aiTone, setAiTone] = useState("witty");
  const [aiDrafts, setAiDrafts] = useState([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiApiKey, setAiApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gemini_api_key") || "";
    }
    return "";
  });
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleGenerateAi = async (tone = aiTone) => {
    const activeQuestion = questions?.find((q) => q.id === selectedQuestionId)?.question || "";
    if (!activeQuestion) {
      onNotify?.("Select a question first to generate draft answers.", "warning");
      return;
    }
    setIsGeneratingAi(true);
    setAiTone(tone);
    try {
      const res = await generateAnswerDrafts({ question: activeQuestion, toneId: tone, customApiKey: aiApiKey });
      if (res?.drafts) {
        setAiDrafts(res.drafts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyAiDraft = (draftText) => {
    setAnswer(draftText);
    onNotify?.("AI draft applied!", "success");
  };

  const handleSaveApiKey = (key) => {
    setAiApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setShowKeyInput(false);
    onNotify?.("Gemini API key saved!", "success");
  };

  // Realtime live typing
  const channelRef = useRef(null);
  const prevQuestionIdRef = useRef(selectedQuestionId);
  const lastBroadcastTimeRef = useRef(0);
  const pendingBroadcastRef = useRef(null);

  const sendBroadcastThrottled = (text, isTyping) => {
    const now = Date.now();
    const minInterval = 200;

    if (pendingBroadcastRef.current) {
      clearTimeout(pendingBroadcastRef.current);
      pendingBroadcastRef.current = null;
    }

    const performSend = () => {
      if (channelRef.current && selectedQuestionId) {
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: {
            questionId: selectedQuestionId,
            text,
            isTyping,
          },
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

  useEffect(() => {
    channelRef.current = supabase.channel("sila-typing");
    channelRef.current.subscribe();

    return () => {
      if (channelRef.current) {
        const currentQId = prevQuestionIdRef.current;
        if (currentQId) {
          channelRef.current.send({
            type: "broadcast",
            event: "typing",
            payload: {
              questionId: currentQId,
              text: "",
              isTyping: false,
            },
          });
        }
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedQuestionId) return;

    if (!answer.trim()) {
      sendBroadcastThrottled("", false);
      return;
    }

    sendBroadcastThrottled(answer, true);

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

  useEffect(() => {
    if (prevQuestionIdRef.current && prevQuestionIdRef.current !== selectedQuestionId) {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: {
            questionId: prevQuestionIdRef.current,
            text: "",
            isTyping: false,
          },
        });
      }
    }
    prevQuestionIdRef.current = selectedQuestionId;
  }, [selectedQuestionId]);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return sortedQuestions;
    return sortedQuestions.filter((q) =>
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedQuestion = sortedQuestions.find((q) => q.id === selectedQuestionId);

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
        : style.preset === "pastel"
        ? "linear-gradient(135deg, #2a1b2d 0%, #4a1d4d 50%, #831843 100%)"
        : style.preset === "minimal"
        ? "linear-gradient(135deg, #09090b 0%, #18181b 100%)"
        : `linear-gradient(160deg, ${style.bgColor}, ${style.accentColor})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: style.textColor,
      fontFamily: style.fontFamily,
      textAlign: style.align,
      border: `${Number(style.frameWidth || 0)}px solid ${style.frameColor}`,
      borderRadius: `${Number(style.frameRadius || 0)}px`,
    }),
    [style]
  );

  const setField = (name, value) => {
    setStyle((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (presetObj) => {
    setStyle((prev) => ({
      ...prev,
      ...presetObj.style,
      bgImageUrl: prev.bgImageUrl,
    }));
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onNotify?.("File Too Big", "Image size should be less than 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setField("bgImageUrl", event.target.result);
      onNotify?.("Photo Loaded", "Custom background set.", "success");
    };
    reader.readAsDataURL(file);
  };

  const removeBgImage = () => {
    setField("bgImageUrl", null);
  };

  const generateImage = async () => {
    if (!selectedQuestion?.question) {
      setMessage("Select a user question first.");
      onNotify?.("No Question", "Please select a question to render.", "warning");
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
        style
      );
      setImageDataUrl(nextDataUrl);
      setPreviewMode("rendered");
      setMessage("Image render complete. Ready to export or share.");
      onEvent?.("image_rendered", { fontFamily: style.fontFamily, showQRCode: style.showQRCode });
      onNotify?.("Render Ready", "Story preview image rendered successfully.", "success");
    } catch (err) {
      console.error(err);
      setMessage("Failed to render image.");
      onNotify?.("Error", "Failed to render image canvas", "error");
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

      if (channelRef.current && selectedQuestion.id) {
        channelRef.current.send({
          type: "broadcast",
          event: "typing",
          payload: {
            questionId: selectedQuestion.id,
            text: "",
            isTyping: false,
          },
        });
      }

      setAnswer("");
      setImageDataUrl("");
      setMessage("Answer saved to library and published.");
      onEvent?.("answer_saved", { hasImage: Boolean(imageDataUrl) });
      onNotify?.("Saved", "Answer saved to library and published.", "success");
    } catch (error) {
      console.error(error);
      setMessage("Save failed.");
      onNotify?.("Save failed", error.message || "Could not save the answer.", "error");
    }
  };

  const copyImage = async () => {
    if (!imageDataUrl) {
      await generateImage();
    }

    try {
      const activeDataUrl = imageDataUrl || (await renderTextToImage(
        {
          question: selectedQuestion.question,
          answer,
          askedAt: selectedQuestion.createdAt,
          url: `${window.location.origin}/q/${selectedQuestion.number || selectedQuestion.id}`,
        },
        style
      ));
      const blob = await dataUrlToBlob(activeDataUrl);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setMessage("Copied image to clipboard!");
      onEvent?.("image_copied");
      onNotify?.("Copied", "Image copied to clipboard.", "success");
    } catch {
      setMessage("Browser blocked direct copy. Use Export instead.");
      onEvent?.("image_copy_failed");
      onNotify?.("Copy Notice", "Browser blocked image copy. Use Export instead.", "info");
    }
  };

  const downloadImage = async () => {
    let activeUrl = imageDataUrl;
    if (!activeUrl) {
      if (!selectedQuestion?.question) {
        onNotify?.("Select Question", "Select a question to export.", "warning");
        return;
      }
      activeUrl = await renderTextToImage(
        {
          question: selectedQuestion.question,
          answer,
          askedAt: selectedQuestion.createdAt,
          url: `${window.location.origin}/q/${selectedQuestion.number || selectedQuestion.id}`,
        },
        style
      );
      setImageDataUrl(activeUrl);
    }

    const a = document.createElement("a");
    a.href = activeUrl;
    a.download = `ask-sila-story-${Date.now()}.png`;
    a.click();
    onEvent?.("image_downloaded");
    onNotify?.("Downloaded", "High-res story card saved.", "success");
  };

  const openPlatform = (platform) => {
    const map = {
      instagram: "https://www.instagram.com/",
      facebook: "https://www.facebook.com/stories/create/",
    };
    window.open(map[platform], "_blank", "noopener,noreferrer");
    setMessage(`Opened ${platform}. Ready to paste story.`);
    onEvent?.("share_opened", { platform });
  };

  return (
    <section className="w-full max-w-full overflow-hidden">
      {/* Studio Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Mobile size={18} variant="Bold" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight leading-tight flex items-center gap-2">
              <span>Story Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase tracking-wider">
                Mobile Base
              </span>
            </h2>
            <p className="text-[11px] text-[color:var(--app-muted)]">
              Craft styled story cards for Instagram &amp; Facebook
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/40 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setPreviewMode("phone")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              previewMode === "phone"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mobile size={14} />
            <span>Phone</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!imageDataUrl) {
                generateImage();
              } else {
                setPreviewMode("rendered");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              previewMode === "rendered"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye size={14} />
            <span>Render</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Tool Categories & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Question Selector Bar */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[color:var(--app-muted)] flex items-center gap-1.5">
                <Edit size={12} className="text-cyan-400" /> Question
              </span>
              {selectedQuestion?.notify_handle && (
                <a
                  href={`https://t.me/${selectedQuestion.notify_handle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:underline"
                >
                  <Notification size={12} />
                  <span>Notify: {selectedQuestion.notify_handle} ↗</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full h-11 px-3.5 rounded-2xl bg-white/5 dark:bg-black/20 border border-slate-200/50 dark:border-white/10 hover:border-cyan-500/50 transition-all text-left group shadow-inner"
            >
              <div className="truncate text-xs sm:text-sm font-medium pr-2 flex items-center gap-2">
                {selectedQuestion ? (
                  <>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        selectedQuestion.status === "answered"
                          ? "bg-emerald-400"
                          : "bg-amber-400 animate-pulse"
                      }`}
                    />
                    <span className="truncate">{selectedQuestion.question}</span>
                  </>
                ) : (
                  <span className="text-slate-400">Select a community question...</span>
                )}
              </div>
              <ArrowDown2
                className={`shrink-0 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                size={14}
              />
            </button>

            {/* Question Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-white/10">
                  <div className="relative">
                    <SearchNormal1 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/5 border border-white/5 text-xs outline-none text-slate-200 placeholder:text-slate-500"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-white/5">
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
                        className={`w-full p-2.5 text-left hover:bg-white/5 flex flex-col gap-1 transition-colors ${
                          selectedQuestionId === q.id ? "bg-cyan-500/10" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              q.status === "answered"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {q.status}
                          </span>
                          {selectedQuestionId === q.id && <Check className="text-cyan-400" size={12} />}
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{q.question}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      No matching questions.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Compact Category Navigation Bar (Small icons + Short names) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/10 overflow-x-auto custom-scrollbar">
            {TOOL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeToolTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveToolTab(tab.id)}
                  className={`flex-1 min-w-[72px] sm:min-w-0 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
                    isActive
                      ? "text-white bg-white/10 border border-white/15 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-cyan-400" : "opacity-70"} />
                  <span className="truncate">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 rounded-3xl bg-white/5 dark:bg-black/25 border border-white/10 backdrop-blur-xl min-h-[220px]">
            <AnimatePresence mode="wait">
              {/* TAB 1: CONTENT */}
              {activeToolTab === "content" && (
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
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all"
                    >
                      <Sparkles size={11} className="text-purple-400" />
                      <span>AI Drafts</span>
                    </button>
                  </div>

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl p-3.5 bg-black/20 border border-white/10 focus:outline-none focus:border-cyan-500/50 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none transition-all"
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
              )}

              {/* TAB 2: THEME PRESETS & COLORS */}
              {activeToolTab === "theme" && (
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
                            className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2 ${
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
              )}

              {/* TAB 3: TYPOGRAPHY */}
              {activeToolTab === "type" && (
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
                            className={`p-2.5 rounded-2xl border text-center transition-all ${
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
                            className={`flex-1 text-xs font-semibold rounded-lg transition-all inline-flex items-center justify-center gap-1.5 ${
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
                          value={style[item.field]}
                          onChange={(e) => setField(item.field, Number(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: CANVAS & FRAME */}
              {activeToolTab === "canvas" && (
                <motion.div
                  key="tab-canvas"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Aspect Ratio Chips */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-muted)] mb-2">
                      Device Ratio
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {ASPECT_RATIOS.map((opt) => {
                        const isActive = (style.aspectRatio || "9:16") === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setField("aspectRatio", opt.value)}
                            className={`p-2.5 rounded-2xl border text-center transition-all ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-400 font-bold"
                                : "bg-black/20 border-white/5 hover:border-white/20 text-slate-300"
                            }`}
                          >
                            <span className="text-xs block font-bold">{opt.label}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ({opt.ratio})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Frame Radius & Width Sliders */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    {[
                      { label: "Frame Width", field: "frameWidth", min: 0, max: 36 },
                      { label: "Corner Radius", field: "frameRadius", min: 0, max: 80 },
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
                          value={style[item.field]}
                          onChange={(e) => setField(item.field, Number(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>

                  {/* QR Stamp Toggle & Background Upload */}
                  <div className="grid sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    {/* QR Toggle */}
                    <button
                      type="button"
                      onClick={() => setField("showQRCode", !style.showQRCode)}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                        style.showQRCode
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ScanBarcode size={16} />
                        <div>
                          <span className="text-xs font-bold block">QR Stamp</span>
                          <span className="text-[10px] opacity-70">Embed question link</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          style.showQRCode ? "bg-cyan-500 text-slate-950" : "bg-white/10"
                        }`}
                      >
                        {style.showQRCode ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* Photo Upload / Remove */}
                    {style.bgImageUrl ? (
                      <div className="p-2 rounded-2xl bg-black/20 border border-cyan-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={style.bgImageUrl}
                            alt="Background"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <span className="text-xs font-medium text-slate-300">Custom Photo</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeBgImage}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 text-xs flex items-center gap-1"
                        >
                          <CloseCircle size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <label className="p-2.5 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:border-cyan-400 cursor-pointer flex items-center justify-center gap-2 text-xs text-slate-400 transition-all">
                        <GalleryAdd size={16} className="text-cyan-400" />
                        <span>Upload Photo BG</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: AI MAGIC */}
              {activeToolTab === "ai" && (
                <motion.div
                  key="tab-ai"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={13} /> Tone Preset
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowKeyInput(!showKeyInput)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors text-[11px] flex items-center gap-1"
                        title="Configure Gemini API Key"
                      >
                        <Key size={13} />
                        <span>Key</span>
                      </button>
                      <button
                        type="button"
                        disabled={isGeneratingAi}
                        onClick={() => handleGenerateAi(aiTone)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                      >
                        <Refresh size={12} className={isGeneratingAi ? "animate-spin" : ""} />
                        <span>{isGeneratingAi ? "Thinking..." : "Regen"}</span>
                      </button>
                    </div>
                  </div>

                  {/* API Key configuration input */}
                  {showKeyInput && (
                    <div className="flex gap-1.5 p-2 rounded-xl bg-black/40 border border-purple-500/30 animate-in fade-in duration-150">
                      <input
                        type="password"
                        defaultValue={aiApiKey}
                        id="gemini-key-input"
                        placeholder="Paste Gemini API Key (optional)"
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-black/50 border border-white/10 focus:outline-none text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = document.getElementById("gemini-key-input")?.value || "";
                          handleSaveApiKey(val);
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  {/* Tone Preset Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {AI_TONE_PRESETS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleGenerateAi(t.id)}
                        disabled={isGeneratingAi}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all text-left ${
                          aiTone === t.id
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold"
                            : "bg-black/20 text-slate-300 border border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <div>{t.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* AI Draft Options */}
                  <div className="space-y-2 pt-1 max-h-48 overflow-y-auto custom-scrollbar">
                    {isGeneratingAi ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2 text-purple-400">
                        <Refresh size={22} className="animate-spin" />
                        <span className="text-xs font-medium">Generating creative drafts...</span>
                      </div>
                    ) : aiDrafts.length > 0 ? (
                      aiDrafts.map((draft, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 transition-all flex items-start justify-between gap-3 group"
                        >
                          <p className="text-xs text-slate-200 leading-relaxed flex-1">{draft}</p>
                          <button
                            type="button"
                            onClick={() => handleApplyAiDraft(draft)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-[11px] font-bold shrink-0 transition-all active:scale-95"
                          >
                            Apply
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Select a question above and pick a tone to generate smart replies!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Realistic Phone Device Base Preview & Action Dock (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center min-w-0">
          {previewMode === "phone" ? (
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
                        className="whitespace-pre-wrap leading-tight mt-1 break-all sm:break-words font-bold"
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
          ) : (
            /* RENDERED CANVAS OUTPUT PREVIEW */
            <div className="w-full max-w-[360px] space-y-3 animate-in fade-in duration-200">
              {imageDataUrl ? (
                <div className="rounded-3xl border border-white/15 overflow-hidden bg-black/40 shadow-2xl p-1.5">
                  <img src={imageDataUrl} alt="Rendered Preview" className="w-full h-auto rounded-2xl" />
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-black/20">
                  <ImageIcon className="mx-auto mb-2 opacity-30 text-cyan-400" size={36} />
                  <p className="font-medium">No rendered image yet.</p>
                  <button
                    type="button"
                    onClick={generateImage}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md"
                  >
                    Render Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Compact Action Toolbar (Small Icons + Short Names) */}
          <div className="w-full max-w-[360px] grid grid-cols-3 gap-1.5 pt-1">
            <ActionButton
              onClick={generateImage}
              icon={<Flash size={15} variant="Bold" />}
              label="Render"
              color="bg-cyan-600 hover:bg-cyan-500 text-white"
            />
            <ActionButton
              onClick={saveDesign}
              icon={<Save2 size={15} variant="Bold" />}
              label="Save"
              color="bg-emerald-600 hover:bg-emerald-500 text-white"
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
              color="bg-indigo-600 hover:bg-indigo-500 text-white"
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
            <div className="w-full max-w-[360px] p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Share className="mt-0.5 shrink-0 text-cyan-400" size={13} />
              <p className="text-[11px] text-cyan-300 leading-snug font-medium">{message}</p>
            </div>
          )}
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
      className={`h-9 rounded-xl px-2 ${color} active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-md cursor-pointer`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
