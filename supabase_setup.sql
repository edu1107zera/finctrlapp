-- Este script prepara o seu banco de dados para segurança com logins.
-- 1. Ele adiciona a coluna "user_id" em todas as tabelas (sem apagar dados antigos).
-- 2. Ele ativa o RLS (Row Level Security), impedindo que usuários vejam dados uns dos outros.
-- 3. Ele permite que dados antigos (sem dono) continuem visíveis para não perder o que você já fez.

-- Adicionar user_id (com valor padrão sendo o usuário logado no momento)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE cards ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE loans ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE history ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT auth.uid();

-- Ativar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas (caso existam) para recriar
DROP POLICY IF EXISTS "Isolar transações por usuario" ON transactions;
DROP POLICY IF EXISTS "Isolar cartoes por usuario" ON cards;
DROP POLICY IF EXISTS "Isolar settings por usuario" ON settings;
DROP POLICY IF EXISTS "Isolar loans por usuario" ON loans;
DROP POLICY IF EXISTS "Isolar history por usuario" ON history;
DROP POLICY IF EXISTS "Isolar goals por usuario" ON goals;
DROP POLICY IF EXISTS "Isolar accounts por usuario" ON accounts;

-- Criar Policies (Regras de Segurança)
-- Permite acesso aos dados cujo user_id seja o seu, ou cujo user_id seja nulo (dados antigos de teste)
CREATE POLICY "Isolar transações por usuario" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar cartoes por usuario" ON cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar settings por usuario" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar loans por usuario" ON loans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar history por usuario" ON history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar goals por usuario" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Isolar accounts por usuario" ON accounts FOR ALL USING (auth.uid() = user_id);
