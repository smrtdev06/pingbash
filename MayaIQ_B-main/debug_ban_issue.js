const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Chatgram',
    password: 'root',
    port: 5432
});

async function debugBanIssue(groupId) {
    try {
        console.log(`🔍 Debugging ban issue for group ${groupId}\n`);
        
        // 1. Check all users in group_users table
        const groupUsers = await pool.query(`
            SELECT user_id, banned, unban_request, is_member 
            FROM group_users 
            WHERE group_id = $1
            ORDER BY user_id;
        `, [groupId]);
        
        console.log('📋 Group Users Status:');
        console.table(groupUsers.rows);
        
        // 2. Check all IP bans
        const ipBans = await pool.query(`
            SELECT id, user_id, ip_address, banned_by, banned_at, is_active,
                   u1.name as banned_user_name, u1.email as banned_user_email,
                   u2.name as banned_by_name
            FROM ip_bans ib
            LEFT JOIN "Users" u1 ON ib.user_id = u1."Id"
            LEFT JOIN "Users" u2 ON ib.banned_by = u2."Id"
            WHERE group_id = $1
            ORDER BY banned_at DESC;
        `, [groupId]);
        
        console.log('\n🚫 IP Bans Status:');
        console.table(ipBans.rows);
        
        // 3. Check for active IP bans
        const activeIpBans = await pool.query(`
            SELECT COUNT(*) as active_count, 
                   array_agg(ip_address) as active_ips
            FROM ip_bans 
            WHERE group_id = $1 AND is_active = true;
        `, [groupId]);
        
        console.log('\n⚠️  Active IP Bans Summary:');
        console.log(`Active IP bans: ${activeIpBans.rows[0].active_count}`);
        console.log(`Active IPs: ${activeIpBans.rows[0].active_ips}`);
        
        // 4. Check group creator
        const groupInfo = await pool.query(`
            SELECT id, name, creater_id, u.name as creator_name
            FROM groups g
            LEFT JOIN "Users" u ON g.creater_id = u."Id"
            WHERE g.id = $1;
        `, [groupId]);
        
        console.log('\n👑 Group Info:');
        console.table(groupInfo.rows);
        
    } catch (error) {
        console.error('Error debugging ban issue:', error);
    } finally {
        await pool.end();
    }
}

// Usage: node debug_ban_issue.js [groupId]
const groupId = process.argv[2] || 45; // Default to group 45
debugBanIssue(parseInt(groupId)); 