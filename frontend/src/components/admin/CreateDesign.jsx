import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Mobile, Eye } from "iconsax-react";
import { dataUrlToBlob, renderTextToImage } from "../../lib/imageRenderer";
import { supabase } from "../../lib/supabase";
import { generateAnswerDrafts } from "../../lib/aiAssistant";
import {
  defaultStyle,
  TOOL_TABS,
} from "./studio/studioConstants";
import QuestionSelector from "./studio/QuestionSelector";
import AnswerEditor from "./studio/AnswerEditor";
import StyleControls from "./studio/StyleControls";
import StoryPreview from "./studio/StoryPreview";
import StudioActions from "./studio/StudioActions";

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

  // AI draft state
  const [aiTone, setAiTone] = useState("casual");
  const [aiDrafts, setAiDrafts] = useState([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const dropdownRef = useRef(null);
  const channelRef = useRef(null);
  const prevQuestionIdRef = useRef("");

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

  // Set up Supabase broadcast channel for live typing simulation
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel("admin-typing-room");
    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Broadcast typing changes
  useEffect(() => {
    if (!channelRef.current || !selectedQuestionId) return;

    if (answer.trim().length > 0) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          questionId: selectedQuestionId,
          text: answer,
          isTyping: true,
        },
      });
    } else {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          questionId: selectedQuestionId,
          text: "",
          isTyping: false,
        },
      });
    }
  }, [answer, selectedQuestionId]);

  // Clean typing state on question switch
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
      const activeDataUrl =
        imageDataUrl ||
        (await renderTextToImage(
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

  const handleGenerateAi = async (tone) => {
    if (!selectedQuestion?.question) {
      onNotify?.("Select Question", "Select a question first to generate drafts.", "warning");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const drafts = await generateAnswerDrafts(selectedQuestion.question, tone);
      setAiDrafts(drafts);
    } catch (err) {
      console.error(err);
      onNotify?.("AI Error", "Could not generate drafts at this moment.", "error");
    } finally {
      setIsGeneratingAi(false);
    }
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
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
          <QuestionSelector
            dropdownRef={dropdownRef}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            selectedQuestion={selectedQuestion}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredQuestions={filteredQuestions}
          />

          {/* Compact Category Navigation Bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/20 border border-white/10 overflow-x-auto custom-scrollbar">
            {TOOL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeToolTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveToolTab(tab.id)}
                  className={`flex-1 min-w-[72px] sm:min-w-0 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative cursor-pointer ${
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
              {activeToolTab === "content" || activeToolTab === "ai" ? (
                <AnswerEditor
                  activeToolTab={activeToolTab}
                  setActiveToolTab={setActiveToolTab}
                  answer={answer}
                  setAnswer={setAnswer}
                  saveDesign={saveDesign}
                  selectedQuestionId={selectedQuestionId}
                  aiTone={aiTone}
                  setAiTone={setAiTone}
                  aiDrafts={aiDrafts}
                  isGeneratingAi={isGeneratingAi}
                  handleGenerateAi={handleGenerateAi}
                />
              ) : (
                <StyleControls
                  activeToolTab={activeToolTab}
                  style={style}
                  setField={setField}
                  applyPreset={applyPreset}
                  handleBgImageUpload={handleBgImageUpload}
                  removeBgImage={removeBgImage}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Realistic Phone Device Base Preview & Action Dock (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center min-w-0">
          <StoryPreview
            previewMode={previewMode}
            currentTime={currentTime}
            style={style}
            previewStyle={previewStyle}
            selectedQuestion={selectedQuestion}
            answer={answer}
            imageDataUrl={imageDataUrl}
            generateImage={generateImage}
          />

          <StudioActions
            generateImage={generateImage}
            saveDesign={saveDesign}
            copyImage={copyImage}
            downloadImage={downloadImage}
            openPlatform={openPlatform}
            message={message}
          />
        </div>
      </div>
    </section>
  );
}
