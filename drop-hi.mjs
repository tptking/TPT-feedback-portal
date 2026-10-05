import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:tpt%402000%40tpt@db.welaaaqfbgqxhpjjbmzl.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    
    // Drop the table
    await client.query(`
      DROP TABLE IF EXISTS hi;
    `);
    console.log("Table 'hi' dropped successfully!");
    
  } catch (err) {
    console.error("Error dropping table:", err.message);
  } finally {
    await client.end();
  }
}

run();
