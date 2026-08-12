const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Eduana.1107@db.jnqkjnbztqwwflkbxtcm.supabase.co:5432/postgres'
});

async function migrateCards() {
  try {
    await client.connect();
    console.log('Connected. Running migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        limit_amount NUMERIC DEFAULT 0,
        closing_day INTEGER NOT NULL,
        due_day INTEGER NOT NULL,
        color TEXT DEFAULT '#6366f1'
      );

      ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Enable read access for all users" ON cards;
      CREATE POLICY "Enable read access for all users" ON cards FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "Enable insert access for all users" ON cards;
      CREATE POLICY "Enable insert access for all users" ON cards FOR INSERT WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Enable update access for all users" ON cards;
      CREATE POLICY "Enable update access for all users" ON cards FOR UPDATE USING (true) WITH CHECK (true);
      
      DROP POLICY IF EXISTS "Enable delete access for all users" ON cards;
      CREATE POLICY "Enable delete access for all users" ON cards FOR DELETE USING (true);

      -- Add cardId to transactions
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS card_id UUID REFERENCES cards(id) ON DELETE SET NULL;
      
      -- We also want to store installments in transactions?
      -- "installments" count might be useful, but for now we can just store the transaction.
      -- Let's add installment info to transactions just in case
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_current INTEGER DEFAULT 1;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_total INTEGER DEFAULT 1;
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error migrating data:', error);
  } finally {
    await client.end();
  }
}

migrateCards();
