const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    user: 'postgres',        // Your PostgreSQL username
    host: '23.27.164.88',                             // Use 'localhost' for local connections
    database: 'chatdb', // Your PostgreSQL database name
    password: 'newPostgres', // Your PostgreSQL password
    port: 5432, 
});

async function logAllBannedRecords() {
  try {
    // Get all banned users from group_users table

    
    // Get all active IP bans from ip_bans table
    const ipBans = await pool.query(`
      UPDATE groups
      SET show_chat_rules = true, chat_rules = 'Test Chat Rules
1. Be respectful to all members
2. No spam or excessive posting
3. Stay on topic
4. No harassment or bullying
5. Follow community guidelines'
      WHERE name = 'gsx'
      RETURNING *;
    `);
    console.log('🚫 Active IP bans in ip_bans:', ipBans.rows);
  } catch (error) {
    console.error('❌ Error fetching banned records:', error);
  } finally {
    await pool.end();
  }
}

logAllBannedRecords();
