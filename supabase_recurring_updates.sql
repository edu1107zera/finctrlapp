-- Adiciona suporte a descontos recorrentes nas Metas
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS deduct_monthly BOOLEAN DEFAULT false;

-- Adiciona suporte a aportes recorrentes nos Investimentos
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS monthly_contribution NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS deduct_monthly BOOLEAN DEFAULT false;
