-- Script para criar a tabela de Investimentos no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar tabela investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT DEFAULT '',
  invested_amount NUMERIC(15,2) DEFAULT 0,
  current_amount NUMERIC(15,2) DEFAULT 0,
  investment_date DATE DEFAULT CURRENT_DATE,
  objective TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS (Row Level Security)
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Limpar policy antiga se existir
DROP POLICY IF EXISTS "Isolar investments por usuario" ON investments;

-- Criar Policy de segurança — usuário só vê seus próprios dados
CREATE POLICY "Isolar investments por usuario" ON investments
  FOR ALL USING (auth.uid() = user_id);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_date ON investments(investment_date);
