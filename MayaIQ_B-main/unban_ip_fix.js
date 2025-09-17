const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Chatgram',
  password: 'root',
  port: 5432,
});

async function unbanAllIpsFromGroup(groupId) {
  try {
    console.log(`🔧 Unbanning all IPs from group ${groupId}...`);
    
    // First, show current IP bans
    const currentBans = await pool.query(`
      SELECT * FROM ip_bans 
      WHERE group_id = $1 AND is_active = true
    `, [groupId]);
    
    console.log(`📋 Current IP bans in group ${groupId}:`, currentBans.rows);
    
    // Unban all IPs from the group
    const result = await pool.query(`
      UPDATE ip_bans 
      SET is_active = false 
      WHERE group_id = $1 AND is_active = true
    `, [groupId]);
    
    console.log(`✅ Unbanned ${result.rowCount} IP addresses from group ${groupId}`);
    
    // Also unban all users in group_users table
    const userResult = await pool.query(`
      UPDATE group_users 
      SET banned = 0, unban_request = 0 
      WHERE group_id = $1 AND banned = 1
    `, [groupId]);
    
    console.log(`✅ Unbanned ${userResult.rowCount} users from group ${groupId}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Usage: node unban_ip_fix.js [groupId]
const groupId = process.argv[2] || 45; // Default to group 45
unbanAllIpsFromGroup(groupId); 