const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Eduana.1107@db.jnqkjnbztqwwflkbxtcm.supabase.co:5432/postgres'
});

async function clearDB() {
  try {
    await client.connect();
    console.log('Connected to DB. Truncating tables...');
    await client.query(`
      TRUNCATE TABLE transactions CASCADE;
      TRUNCATE TABLE accounts CASCADE;
      TRUNCATE TABLE goals CASCADE;
      TRUNCATE TABLE loans CASCADE;
      TRUNCATE TABLE history CASCADE;
      TRUNCATE TABLE settings CASCADE;
    `);
    console.log('All data cleared successfully.');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await client.end();
  }
}

clearDB();
