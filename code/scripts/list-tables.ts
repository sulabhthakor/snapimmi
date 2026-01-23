
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function listTables() {
    try {
        await client.connect();
        const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        const res = await client.query(query);

        console.log('--- TABLES ---');
        console.table(res.rows);
        console.log('--------------');

        await client.end();
    } catch (err) {
        console.error('Error listing tables:', err);
        process.exit(1);
    }
}

listTables();
