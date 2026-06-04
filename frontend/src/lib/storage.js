import { supabase } from './supabase';

// Helper for handling Supabase errors
async function handleSupabase(promise) {
  const { data, error } = await promise;
  if (error) {
    console.error('Supabase Error:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function getDesigns() {
  return handleSupabase(
    supabase
      .from('designs')
      .select('*')
      .order('updatedAt', { ascending: false })
  );
}

export async function deleteDesign(id) {
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return getDesigns();
}

export async function saveDesigns(designs) {
  // Use upsert to replace or update designs
  // Note: This logic assumes 'id' is the primary key and will update existing or insert new.
  // To match the 'replace' behavior of the backend (delete and re-insert), 
  // we would need to delete all then insert. But upsert is usually better.
  const { error } = await supabase
    .from('designs')
    .upsert(designs);
  
  if (error) throw new Error(error.message);
  return getDesigns();
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
  return handleSupabase(
    supabase
      .from('questions')
      .select('*')
      .neq('is_deleted', true)
      .order('createdAt', { ascending: false })
  );
}

export async function addQuestion(questionText) {
  const newQuestion = {
    id: crypto.randomUUID(),
    question: questionText,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('questions')
    .insert([newQuestion]);

  if (error) throw new Error(error.message);
  return getQuestions();
}

export async function likeQuestion(id) {
  // Supabase doesn't have a direct 'increment' method in the JS client without RPC 
  // or fetching first. We'll use a simple RPC call if available, or fetch and update.
  // For now, let's assume an RPC 'increment_likes' exists, or we fetch-then-update.
  
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('likes_count')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newCount = (question.likes_count || 0) + 1;
  
  const { data, error } = await supabase
    .from('questions')
    .update({ likes_count: newCount })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function incrementQuestionView(id) {
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('views_count')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newCount = (question.views_count || 0) + 1;
  
  const { data, error } = await supabase
    .from('questions')
    .update({ views_count: newCount })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function unlikeQuestion(id) {
  const { data: question, error: fetchError } = await supabase
    .from('questions')
    .select('likes_count')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newCount = Math.max(0, (question.likes_count || 0) - 1);
  
  const { data, error } = await supabase
    .from('questions')
    .update({ likes_count: newCount })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleQuestionVisibility(id, isHidden) {
  const { data, error } = await supabase
    .from('questions')
    .update({ is_hidden: isHidden })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleQuestionPin(id, isPinned) {
  const { data, error } = await supabase
    .from('questions')
    .update({ is_pinned: isPinned })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function softDeleteQuestion(id) {
  const { data, error } = await supabase
    .from('questions')
    .update({ is_deleted: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function saveQuestions(questions) {
  const { error } = await supabase
    .from('questions')
    .upsert(questions);
  
  if (error) throw new Error(error.message);
  return getQuestions();
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
  return handleSupabase(
    supabase
      .from('events')
      .select('*')
      .order('createdAt', { ascending: false })
  );
}

export async function addEvent(type, meta = {}) {
  const newEvent = {
    id: crypto.randomUUID(),
    type,
    meta,
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('events')
    .insert([newEvent]);

  if (error) throw new Error(error.message);
  return getEvents();
}

export async function getComments() {
  return handleSupabase(
    supabase
      .from('comments')
      .select('*')
      .order('createdAt', { ascending: true })
  );
}

export async function addComment(questionId, text) {
  const newComment = {
    id: crypto.randomUUID(),
    questionId,
    text,
    author: 'Anonymous',
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('comments')
    .insert([newComment]);

  if (error) throw new Error(error.message);
  return newComment;
}

