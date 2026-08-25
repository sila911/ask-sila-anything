import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "iconsax-react";
import { sounds } from "../utils/soundEffects";

export const REACTION_TYPES = [
  { type: "heart", emoji: "❤️", label: "Love", freq: 520 },
  { type: "laugh", emoji: "😂", label: "Haha", freq: 580 },
  { type: "think", emoji: "🤔", label: "Hmm", freq: 480 },
  { type: "gasp", emoji: "😮", label: "Wow", freq: 540 },
  { type: "fire", emoji: "🔥", label: "Hot", freq: 640 },
];

export function getEmojiForType(type) {
  const found = REACTION_TYPES.find((r) => r.type === type);
  return found ? found.emoji : "❤️";
}

export function triggerEmojiBurst(x, y, emoji) {
  sounds.playPop(emoji === "🔥" ? 640 : emoji === "❤️" ? 520 : emoji === "😂" ? 580 : 480);

  if (x !== undefined && y !== undefined) {
    window.dispatchEvent(
      new CustomEvent("trigger-emoji-burst", {
        detail: { x, y, emoji },
      })
    );
  }
}

export default function ReactionButton({
  targetId,
  userReaction,
  reactions = {},
  likesCount = 0,
  onReact,
  isLocked = false,
  size = "md", // 'sm' | 'md'
  showCount = true,
  pickerPlacement = "top", // 'top' | 'right'
  activeEmojis = [],
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeHoverType, setActiveHoverType] = useState(null);
  const buttonRef = useRef(null);
  const pickerRef = useRef(null);
  const emojiElementsRef = useRef({});
  const longPressTimerRef = useRef(null);
  const isSwipingRef = useRef(false);
  const lastHoverTypeRef = useRef(null);
  const touchStartRef = useRef(null);
  const ignoreClickRef = useRef(false);

  const isLiked = Boolean(userReaction);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // Select a specific reaction from picker
  const selectReaction = useCallback(
    (reactType, touchPoint = null) => {
      if (isLocked) return;
      setShowPicker(false);
      setActiveHoverType(null);
      isSwipingRef.current = false;
      lastHoverTypeRef.current = null;

      const isUnreacting = userReaction === reactType;

      if (isUnreacting) {
        // UNREACT: Play unreact sound, NO emoji burst (have no effect)
        sounds.playUnreact();
        onReact(targetId, reactType);
      } else {
        // REACT / CHANGE: Pop sound + emoji burst
        const found = REACTION_TYPES.find((r) => r.type === reactType);
        const emoji = found ? found.emoji : "❤️";

        let x = touchPoint?.x;
        let y = touchPoint?.y;
        if (!x && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }

        triggerEmojiBurst(x, y, emoji);
        onReact(targetId, reactType);
      }
    },
    [isLocked, userReaction, targetId, onReact]
  );

  // Handle single tap or click to toggle reaction
  const handleSingleClick = (e) => {
    if (isLocked || ignoreClickRef.current) return;

    const currentReaction = userReaction;
    if (currentReaction) {
      // UNREACT: Play unreact sound, NO emoji burst
      sounds.playUnreact();
      onReact(targetId, currentReaction);
    } else {
      // REACT: Play pop sound and trigger emoji burst
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX || rect.left + rect.width / 2;
      const y = e.clientY || rect.top + rect.height / 2;
      triggerEmojiBurst(x, y, "❤️");
      onReact(targetId, "heart");
    }
  };

  // Helper: Find closest emoji on mobile swipe using geometric proximity
  const updateEmojiProximity = (clientX, clientY) => {
    if (!pickerRef.current) return;

    const pickerRect = pickerRef.current.getBoundingClientRect();
    // Vertical reach: allow generous finger movement above and below the bar
    const isWithinVerticalBounds =
      clientY >= pickerRect.top - 85 && clientY <= pickerRect.bottom + 95;

    if (!isWithinVerticalBounds) {
      if (lastHoverTypeRef.current !== null) {
        lastHoverTypeRef.current = null;
        setActiveHoverType(null);
      }
      return;
    }

    let closestType = null;
    let minDistance = Infinity;

    REACTION_TYPES.forEach((react) => {
      const el = emojiElementsRef.current[react.type];
      if (el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(clientX - centerX);
        if (dist < minDistance) {
          minDistance = dist;
          closestType = react.type;
        }
      }
    });

    // Horizontal reach: within picker width + margin
    const isWithinHorizontalBounds =
      clientX >= pickerRect.left - 40 && clientX <= pickerRect.right + 40;

    if (closestType && isWithinHorizontalBounds) {
      if (closestType !== lastHoverTypeRef.current) {
        lastHoverTypeRef.current = closestType;
        setActiveHoverType(closestType);
        const item = REACTION_TYPES.find((r) => r.type === closestType);
        sounds.playHoverTick(item?.freq || 480);

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch (_) {}
        }
      }
    } else {
      if (lastHoverTypeRef.current !== null) {
        lastHoverTypeRef.current = null;
        setActiveHoverType(null);
      }
    }
  };

  // Touch handlers for mobile smooth swipe-to-select
  const handleTouchStart = (e) => {
    if (isLocked || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    isSwipingRef.current = false;
    lastHoverTypeRef.current = null;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Responsive 190ms long-press trigger for picker
    longPressTimerRef.current = setTimeout(() => {
      setShowPicker(true);
      isSwipingRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch (_) {}
      }
      // Update proximity immediately at current finger location
      updateEmojiProximity(touch.clientX, touch.clientY);
    }, 190);
  };

  const handleTouchMove = (e) => {
    if (isLocked || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const start = touchStartRef.current;

    // Check if user dragged upwards towards reaction bar before timer fired
    if (!showPicker && start) {
      const deltaY = start.y - touch.clientY;
      const deltaX = Math.abs(touch.clientX - start.x);

      // Fast swipe up gesture directly opens reaction bar
      if (deltaY > 18 && deltaY > deltaX) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        setShowPicker(true);
        isSwipingRef.current = true;
      } else if (Math.hypot(deltaX, touch.clientY - start.y) > 25) {
        // Dragged far away before long press -> let native scroll handle it
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }
    }

    // If picker is open, track element under finger with geometric proximity
    if (showPicker || isSwipingRef.current) {
      if (e.cancelable) e.preventDefault(); // Prevent page scroll while swiping reactions
      isSwipingRef.current = true;
      updateEmojiProximity(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    const touch = e.changedTouches?.[0];
    const start = touchStartRef.current;
    const duration = start ? Date.now() - start.time : 999;
    const dist = (start && touch) ? Math.hypot(touch.clientX - start.x, touch.clientY - start.y) : 999;

    // Set flag to prevent synthetic click after touch
    ignoreClickRef.current = true;
    setTimeout(() => {
      ignoreClickRef.current = false;
    }, 350);

    if (isSwipingRef.current || showPicker) {
      if (e.cancelable) e.preventDefault();

      // If released over an emoji, select it
      if (activeHoverType) {
        selectReaction(
          activeHoverType,
          touch ? { x: touch.clientX, y: touch.clientY } : null
        );
      } else {
        // Released outside -> dismiss picker
        setShowPicker(false);
        setActiveHoverType(null);
        isSwipingRef.current = false;
        lastHoverTypeRef.current = null;
      }
    } else if (duration < 280 && dist < 16 && touch) {
      // Quick clean tap on mobile
      const currentReaction = userReaction;
      if (currentReaction) {
        // UNREACT: Play unreact sound, NO emoji burst
        sounds.playUnreact();
        onReact(targetId, currentReaction);
      } else {
        // REACT: Pop sound + burst
        triggerEmojiBurst(touch.clientX, touch.clientY, "❤️");
        onReact(targetId, "heart");
      }
    }
  };

  // Render main icon
  const renderReactionIcon = () => {
    const iconSize = size === "sm" ? 14 : 18;
    if (!isLiked) {
      return (
        <Heart
          size={iconSize}
          className="text-slate-400 group-hover/heart:text-rose-400 group-hover/heart:fill-rose-400/20 transition-colors"
        />
      );
    }

    switch (userReaction) {
      case "heart":
        return <Heart size={iconSize} className="fill-red-500 text-red-500" />;
      case "laugh":
        return <span className={size === "sm" ? "text-sm leading-none" : "text-lg leading-none"}>😂</span>;
      case "think":
        return <span className={size === "sm" ? "text-sm leading-none" : "text-lg leading-none"}>🤔</span>;
      case "gasp":
        return <span className={size === "sm" ? "text-sm leading-none" : "text-lg leading-none"}>😮</span>;
      case "fire":
        return <span className={size === "sm" ? "text-sm leading-none" : "text-lg leading-none"}>🔥</span>;
      default:
        return <Heart size={iconSize} className="fill-red-500 text-red-500" />;
    }
  };

  const getReactionColorClass = () => {
    if (!isLiked) return "text-slate-600 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400";
    switch (userReaction) {
      case "heart":
        return "text-red-500";
      case "laugh":
        return "text-amber-500";
      case "think":
        return "text-indigo-400";
      case "gasp":
        return "text-cyan-500";
      case "fire":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <div
      className="relative inline-flex items-center select-none touch-manipulation"
      onMouseEnter={() => !isLocked && setShowPicker(true)}
      onMouseLeave={() => {
        setShowPicker(false);
        setActiveHoverType(null);
        lastHoverTypeRef.current = null;
      }}
    >
      {/* Floating Reaction Bar (Swipe on mobile & hover on desktop) */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.88 }}
            transition={{ type: "spring", damping: 22, stiffness: 350 }}
            style={{
              position: "absolute",
              ...(pickerPlacement === "right"
                ? { top: "50%", transform: "translateY(-50%)", right: "100%", marginRight: "8px" }
                : { bottom: "100%", left: "-8px", marginBottom: "8px" }),
            }}
            className="z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-full px-2.5 py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-2xl border border-white/60 dark:border-white/15 whitespace-nowrap touch-none"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {REACTION_TYPES.map((react) => {
              const isHovered = activeHoverType === react.type;
              const isCurrent = userReaction === react.type;

              return (
                <button
                  key={react.type}
                  ref={(el) => {
                    if (el) emojiElementsRef.current[react.type] = el;
                  }}
                  type="button"
                  data-reaction-type={react.type}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    selectReaction(react.type, {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseEnter={() => {
                    setActiveHoverType(react.type);
                    sounds.playHoverTick(react.freq);
                  }}
                  onMouseLeave={() => {
                    if (activeHoverType === react.type) {
                      setActiveHoverType(null);
                    }
                  }}
                  className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-150 cursor-pointer select-none ${
                    isHovered
                      ? "scale-145 -translate-y-2 z-20 bg-white/50 dark:bg-white/20 shadow-xl"
                      : isCurrent
                      ? "scale-110 bg-white/25 dark:bg-white/10"
                      : "opacity-85 hover:opacity-100 hover:scale-130 hover:-translate-y-1"
                  }`}
                  title={react.label}
                  aria-label={react.label}
                >
                  {/* Floating tooltip label over active emoji */}
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, y: 4, scale: 0.8 }}
                      animate={{ opacity: 1, y: -24, scale: 1 }}
                      exit={{ opacity: 0, y: 2, scale: 0.8 }}
                      transition={{ duration: 0.12 }}
                      className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-[10px] font-bold shadow-lg border border-white/20 dark:border-slate-800 pointer-events-none whitespace-nowrap z-30"
                    >
                      {react.label}
                    </motion.span>
                  )}

                  <span className="text-xl sm:text-2xl leading-none pointer-events-none transition-transform">
                    {react.emoji}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Like / Reaction Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleSingleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex items-center gap-1.5 transition-colors duration-200 group/heart cursor-pointer ${getReactionColorClass()}`}
        aria-label="React"
      >
        <motion.div
          key={userReaction || "unliked"}
          initial={isLiked ? { scale: 0.85 } : { scale: 1 }}
          animate={isLiked ? { scale: [1, 1.35, 0.92, 1] } : { scale: 1 }}
          whileTap={{ scale: 0.82 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {renderReactionIcon()}
        </motion.div>

        {showCount && (
          <div className="flex items-center gap-1">
            {activeEmojis.length > 0 && (
              <div className="flex -space-x-1.5 items-center mr-1 text-[11px] sm:text-xs">
                {activeEmojis.slice(0, 3).map((emoji, idx) => (
                  <span key={idx} className="z-[2] scale-100 select-none">
                    {emoji}
                  </span>
                ))}
              </div>
            )}
            <span
              className={`font-semibold ${
                size === "sm" ? "text-xs" : "text-sm md:text-base"
              } ${isLiked ? getReactionColorClass() : "text-slate-700 dark:text-slate-300"}`}
            >
              {likesCount || 0}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
