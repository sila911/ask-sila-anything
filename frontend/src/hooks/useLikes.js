import { useState, useRef } from "react";
import {
  reactToQuestion,
  reactToComment,
  reactToAnswer,
} from "../lib/storage";

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      const obj = {};
      parsed.forEach((id) => { obj[id] = "heart"; });
      return obj;
    }
    return parsed || {};
  } catch {
    return {};
  }
}

/**
 * Manages liked state and reaction handlers for questions, comments, and answers.
 */
export function useLikes(questions, setQuestions, comments, setComments) {
  const [likedQuestions, setLikedQuestions] = useState(() => loadFromStorage("likedQuestions"));
  const [likedComments, setLikedComments] = useState(() => loadFromStorage("likedComments"));
  const [likedAnswers, setLikedAnswers] = useState(() => loadFromStorage("likedAnswers"));
  const likingInProgress = useRef(new Set());

  // ─── Questions ──────────────────────────────────────────────────────────────

  const handleLike = async (id, reactionType = "heart") => {
    if (likingInProgress.current.has(id)) return;
    likingInProgress.current.add(id);

    const prevReaction = likedQuestions[id] || null;
    const isRemoving = prevReaction === reactionType;
    const actualNewReaction = isRemoving ? null : reactionType;

    const nextLiked = { ...likedQuestions };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }
    setLikedQuestions(nextLiked);
    localStorage.setItem("likedQuestions", JSON.stringify(nextLiked));

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        let reactions = { ...( q.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
        let likes_count = q.likes_count || 0;
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          likes_count = Math.max(0, likes_count - 1);
        }
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          likes_count = likes_count + 1;
        }
        return { ...q, reactions, likes_count };
      })
    );

    try {
      const data = await reactToQuestion(id, actualNewReaction, prevReaction);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, likes_count: data.likes_count, reactions: data.reactions } : q))
      );
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      setLikedQuestions(likedQuestions);
      localStorage.setItem("likedQuestions", JSON.stringify(likedQuestions));
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          let reactions = { ...( q.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
          let likes_count = q.likes_count || 0;
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            likes_count = Math.max(0, likes_count - 1);
          }
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            likes_count = likes_count + 1;
          }
          return { ...q, reactions, likes_count };
        })
      );
    } finally {
      likingInProgress.current.delete(id);
    }
  };

  // ─── Comments ────────────────────────────────────────────────────────────────

  const handleLikeComment = async (id, reactionType = "heart") => {
    const prevReaction = likedComments[id] || null;
    const isRemoving = prevReaction === reactionType;
    const actualNewReaction = isRemoving ? null : reactionType;

    const nextLiked = { ...likedComments };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }
    setLikedComments(nextLiked);
    localStorage.setItem("likedComments", JSON.stringify(nextLiked));

    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        let reactions = { ...( c.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
        let likes_count = c.likes_count || 0;
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          likes_count = Math.max(0, likes_count - 1);
        }
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          likes_count = likes_count + 1;
        }
        return { ...c, reactions, likes_count };
      })
    );

    try {
      const data = await reactToComment(id, actualNewReaction, prevReaction);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes_count: data.likes_count, reactions: data.reactions } : c))
      );
    } catch (error) {
      console.error("Failed to toggle comment reaction:", error);
      setLikedComments(likedComments);
      localStorage.setItem("likedComments", JSON.stringify(likedComments));
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          let reactions = { ...( c.reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
          let likes_count = c.likes_count || 0;
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            likes_count = Math.max(0, likes_count - 1);
          }
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            likes_count = likes_count + 1;
          }
          return { ...c, reactions, likes_count };
        })
      );
    }
  };

  // ─── Answers ─────────────────────────────────────────────────────────────────

  const handleLikeAnswer = async (id, reactionType = "heart") => {
    if (likingInProgress.current.has(`answer-${id}`)) return;
    likingInProgress.current.add(`answer-${id}`);

    const prevReaction = likedAnswers[id] || null;
    const isRemoving = prevReaction === reactionType;
    const actualNewReaction = isRemoving ? null : reactionType;

    const nextLiked = { ...likedAnswers };
    if (isRemoving) {
      delete nextLiked[id];
    } else {
      nextLiked[id] = reactionType;
    }
    setLikedAnswers(nextLiked);
    localStorage.setItem("likedAnswers", JSON.stringify(nextLiked));

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        let reactions = { ...( q.answer_reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
        let answer_likes_count = q.answer_likes_count || 0;
        if (prevReaction && reactions[prevReaction] !== undefined) {
          reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
          answer_likes_count = Math.max(0, answer_likes_count - 1);
        }
        if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
          reactions[actualNewReaction] = (reactions[actualNewReaction] || 0) + 1;
          answer_likes_count = answer_likes_count + 1;
        }
        return { ...q, answer_reactions: reactions, answer_likes_count };
      })
    );

    try {
      const data = await reactToAnswer(id, actualNewReaction, prevReaction);
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, answer_likes_count: data.answer_likes_count, answer_reactions: data.answer_reactions } : q))
      );
    } catch (error) {
      console.error("Failed to toggle answer reaction:", error);
      setLikedAnswers(likedAnswers);
      localStorage.setItem("likedAnswers", JSON.stringify(likedAnswers));
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          let reactions = { ...( q.answer_reactions || { heart: 0, laugh: 0, think: 0, gasp: 0, fire: 0 }) };
          let answer_likes_count = q.answer_likes_count || 0;
          if (actualNewReaction && reactions[actualNewReaction] !== undefined) {
            reactions[actualNewReaction] = Math.max(0, reactions[actualNewReaction] - 1);
            answer_likes_count = Math.max(0, answer_likes_count - 1);
          }
          if (prevReaction && reactions[prevReaction] !== undefined) {
            reactions[prevReaction] = (reactions[prevReaction] || 0) + 1;
            answer_likes_count = answer_likes_count + 1;
          }
          return { ...q, answer_reactions: reactions, answer_likes_count };
        })
      );
    } finally {
      likingInProgress.current.delete(`answer-${id}`);
    }
  };

  return {
    likedQuestions,
    setLikedQuestions,
    likedComments,
    likedAnswers,
    handleLike,
    handleLikeComment,
    handleLikeAnswer,
  };
}
