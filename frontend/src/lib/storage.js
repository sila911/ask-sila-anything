async function requestJSON(path, options = {}) {
  const token = localStorage.getItem("sila-admin-token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  let data;
  let isJson = false;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
    isJson = true;
  } else {
    data = await response.text().catch(() => "");
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    if (isJson && data && data.message) {
      message = data.message;
    } else if (!isJson && typeof data === "string" && data.includes("<!DOCTYPE html>")) {
      message = `Server Error: Received HTML instead of JSON. Check if the backend is running and the proxy is correct.`;
    }
    throw new Error(message);
  }

  return data;
}

// Legacy local-storage import removed. The app now only uses the API-backed storage.

export async function getDesigns() {
  return requestJSON("/api/designs");
}

export async function saveDesigns(designs) {
  return requestJSON("/api/designs/replace", {
    method: "PUT",
    body: JSON.stringify({ designs }),
  });
}

export function createDesign({ text, style, imageDataUrl }) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    text,
    style,
    imageDataUrl: imageDataUrl || "",
    createdAt: now,
    updatedAt: now,
    stats: {
      copies: 0,
      downloads: 0,
      shares: 0,
    },
  };
}

export async function getQuestions() {
  return requestJSON("/api/questions");
}

export async function addQuestion(question) {
  return requestJSON("/api/questions", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

export async function likeQuestion(id) {
  return requestJSON(`/api/questions/${id}/like`, {
    method: "POST",
  });
}

export async function unlikeQuestion(id) {
  return requestJSON(`/api/questions/${id}/unlike`, {
    method: "POST",
  });
}

export async function saveQuestions(questions) {
  return requestJSON("/api/questions/replace", {
    method: "PUT",
    body: JSON.stringify({ questions }),
  });
}

export function createQuestion(question) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    question,
    status: "pending",
    createdAt: now,
    answeredAt: null,
  };
}

export function markQuestionAnswered(questions, questionId) {
  const now = new Date().toISOString();
  return questions.map((item) => {
    if (item.id !== questionId) return item;
    return {
      ...item,
      status: "answered",
      answeredAt: now,
    };
  });
}

export async function getEvents() {
  return requestJSON("/api/events");
}

export async function addEvent(type, meta = {}) {
  return requestJSON("/api/events", {
    method: "POST",
    body: JSON.stringify({ type, meta }),
  });
}
