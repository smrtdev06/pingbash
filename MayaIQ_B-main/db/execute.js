const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

/**
 * Executes a SQL file on PostgreSQL.
 * @param {string} fileName - The SQL file name (relative to project root or absolute).
 * @param {object} [dbConfig] - Optional: PostgreSQL connection config. If not provided, uses env vars.
 * @returns {Promise<void>}
 */
async function executeSqlFile(fileName, dbConfig) {
    if (!fileName) throw new Error('SQL file name is required');

    // Resolve file path
    const filePath = path.isAbsolute(fileName) ? fileName : path.resolve(process.cwd(), fileName);

    // Read SQL file
    let sql;
    try {
        sql = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        throw new Error(`Failed to read SQL file: ${err.message}`);
    }

    // Use provided dbConfig or env vars
    const config = dbConfig || {
        user: 'postgres',        // Your PostgreSQL username
        host: '23.27.164.88',                             // Use 'localhost' for local connections
        database: 'chatdb', // Your PostgreSQL database name
        password: 'newPostgres', // Your PostgreSQL password
        port: 5432,            // Default PostgreSQL port
    };

    const client = new Client(config);

    try {
        await client.connect();
        await client.query(sql);
        // Optionally, you can log success
        // console.log(`Executed SQL file: ${fileName}`);
    } catch (err) {
        throw new Error(`Failed to execute SQL: ${err.message}`);
    } finally {
        await client.end();
    }
}

executeSqlFile('./db/add_message_mode.sql');
