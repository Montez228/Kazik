-- SQL script to create the 'profiles' table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname TEXT UNIQUE NOT NULL,
    spins INTEGER DEFAULT 10,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime for this table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add a sample policy (Careful: this makes the table public for reads/updates)
-- For a real app, use better Auth/RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for all" ON public.profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);
