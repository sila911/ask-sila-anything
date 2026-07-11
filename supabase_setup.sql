-- Create Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    is_hidden BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    answer_likes_count INTEGER DEFAULT 0,
    reactions JSONB DEFAULT '{"heart": 0, "laugh": 0, "think": 0, "gasp": 0, "fire": 0}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP WITH TIME ZONE
);

-- Migration: Add new columns if table already exists
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_likes_count INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{"heart": 0, "laugh": 0, "think": 0, "gasp": 0, "fire": 0}'::jsonb;

CREATE INDEX IF NOT EXISTS questions_status_idx ON questions (status);
CREATE INDEX IF NOT EXISTS questions_createdAt_idx ON questions ("createdAt");

-- Create Designs Table
CREATE TABLE IF NOT EXISTS designs (
    id TEXT PRIMARY KEY,
    "questionId" TEXT,
    "questionText" TEXT,
    "answerText" TEXT,
    text TEXT NOT NULL,
    style JSONB NOT NULL,
    "imageDataUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stats JSONB NOT NULL DEFAULT '{"copies": 0, "downloads": 0, "shares": 0}'::jsonb
);

CREATE INDEX IF NOT EXISTS designs_questionId_idx ON designs ("questionId");
CREATE INDEX IF NOT EXISTS designs_updatedAt_idx ON designs ("updatedAt");

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    meta JSONB NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS events_createdAt_idx ON events ("createdAt");

-- Create Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    text TEXT NOT NULL,
    author TEXT DEFAULT 'Anonymous',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS comments_questionId_idx ON comments ("questionId");

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent "already exists" errors
DROP POLICY IF EXISTS "Public Read Access" ON questions;
DROP POLICY IF EXISTS "Public Insert Access" ON questions;
DROP POLICY IF EXISTS "Public Update Access" ON questions;
DROP POLICY IF EXISTS "Public Delete Access" ON questions;

DROP POLICY IF EXISTS "Public Read Access" ON designs;
DROP POLICY IF EXISTS "Public Insert Access" ON designs;
DROP POLICY IF EXISTS "Public Update Access" ON designs;
DROP POLICY IF EXISTS "Public Delete Access" ON designs;

DROP POLICY IF EXISTS "Public Read Access" ON events;
DROP POLICY IF EXISTS "Public Insert Access" ON events;

DROP POLICY IF EXISTS "Public Read Access" ON comments;
DROP POLICY IF EXISTS "Public Insert Access" ON comments;

-- Create Policies
CREATE POLICY "Public Read Access" ON questions FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON questions FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON questions FOR DELETE USING (true);

CREATE POLICY "Public Read Access" ON designs FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON designs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON designs FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access" ON designs FOR DELETE USING (true);

CREATE POLICY "Public Read Access" ON events FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON events FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access" ON comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON comments FOR INSERT WITH CHECK (true);

