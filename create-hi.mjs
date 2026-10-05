import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");
    
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hi (
        id serial PRIMARY KEY,
        message text
      );
    `);
    console.log("Table 'hi' created successfully!");
    
  } catch (err) {
    console.error("Error creating table:", err.message);
  } finally {
    await client.end();
  }
}

run();
