
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function listUsers() {
    try {
        await client.connect();
        const query = 'SELECT name, email, role, password FROM "User"';
        const res = await client.query(query);

        console.log('--- USER LIST ---');
        console.table(res.rows.map(row => ({
            Name: row.name,
            Email: row.email,
            Role: row.role,
            HasPassword: !!row.password
        })));
        console.log('-----------------');

        await client.end();
    } catch (err) {
        console.error('Error querying users:', err);
        process.exit(1);
    }
}

listUsers();
