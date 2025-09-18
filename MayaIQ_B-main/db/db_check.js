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

    const bannedUsers = await pool.query(`
      SELECT * FROM public.Users
    `);
    console.log('🚫 Banned users in group_users:', bannedUsers.rows);

    // Get all active IP bans from ip_bans table
    const ipBans = await pool.query(`
      SELECT * FROM ip_bans WHERE is_active = true
    `);
    console.log('🚫 Active IP bans in ip_bans:', ipBans.rows);
  } catch (error) {
    console.error('❌ Error fetching banned records:', error);
  } finally {
    await pool.end();
  }
}

logAllBannedRecords();
