const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',        // Your PostgreSQL username
    host: '23.27.164.88',                             // Use 'localhost' for local connections
    database: 'chatdb', // Your PostgreSQL database name
    password: 'newPostgres', // Your PostgreSQL password
    port: 5432, 
});

async function checkUserMembership() {
  try {
    console.log('🔍 Checking Me_Mine user (ID: 102) membership status...');
    
    // Check user details
    const userRes = await pool.query('SELECT * FROM "Users" WHERE "Id" = 102');
    console.log('User details:', userRes.rows[0]);
    
    // Check group membership for group 56 (testgroup3)
    const memberRes = await pool.query('SELECT * FROM group_users WHERE user_id = 102 AND group_id = 56');
    console.log('Group membership:', memberRes.rows);
    
    // Check all group members for group 56
    const allMembersRes = await pool.query('SELECT gu.*, u."Name" FROM group_users gu LEFT JOIN "Users" u ON gu.user_id = u."Id" WHERE gu.group_id = 56 ORDER BY gu.user_id');
    console.log('All members in group 56:', allMembersRes.rows);
    
    // Check recent messages from this user
    const messagesRes = await pool.query('SELECT * FROM "Messages" WHERE "Sender_Id" = 102 AND group_id = 56 ORDER BY "Send_Time" DESC LIMIT 5');
    console.log('Recent messages from user 102:', messagesRes.rows);
    
    // Fix: Add user to group if not present
    if (memberRes.rows.length === 0) {
      console.log('🔧 User not in group, adding...');
      await pool.query(`
        INSERT INTO group_users (group_id, user_id, is_member, role_id, banned, muted, to_time) 
        VALUES (56, 102, 1, 0, 0, 0, NULL)
        ON CONFLICT (group_id, user_id) 
        DO UPDATE SET is_member = 1, banned = 0
      `);
      console.log('✅ User added to group successfully');
    } else {
      console.log('🔧 User exists in group, ensuring proper status...');
      await pool.query(`
        UPDATE group_users 
        SET is_member = 1, banned = 0 
        WHERE group_id = 56 AND user_id = 102
      `);
      console.log('✅ User status updated successfully');
    }
    
    // Verify the fix
    const verifyRes = await pool.query('SELECT * FROM group_users WHERE user_id = 102 AND group_id = 56');
    console.log('✅ Final membership status:', verifyRes.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkUserMembership(); 