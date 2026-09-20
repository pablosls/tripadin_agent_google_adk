-- ==========================================================
-- Tripadinho - Database Schema (PostgreSQL / Supabase)
-- ==========================================================

-- 1. Tabela de Experiências Curadas (pelo Agente ADK)
CREATE TABLE IF NOT EXISTS curated_cards (
    id SERIAL PRIMARY KEY,
    destination TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Desativa RLS para permitir inserções e leituras pelo agente e frontend
ALTER TABLE curated_cards DISABLE ROW LEVEL SECURITY;

-- 2. Tabela de Objetivos Salvos pelo Usuário
CREATE TABLE IF NOT EXISTS saved_cards (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    destination TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Desativa RLS para permitir que o usuário salve e remova seus objetivos
ALTER TABLE saved_cards DISABLE ROW LEVEL SECURITY;

-- Opcional: Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_curated_destination ON curated_cards(destination);
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON saved_cards(user_id);
