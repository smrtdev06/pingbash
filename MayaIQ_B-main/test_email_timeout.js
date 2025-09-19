const { PG_query } = require('./db');
const Controller = require('./middlewares/socket/controller');
require('dotenv').config({ path: './db/env' });

async function testEmailNotification() {
    console.log('\n🧪 Testing Email Notification...');
    
    try {
        // Test with sample user IDs (you may need to adjust these)
        const senderId = 1;
        const receiverId = 2;
        const messageContent = "This is a test private message for email notification.";
        
        await Controller.sendPrivateMessageEmailNotification(senderId, receiverId, messageContent);
        console.log('✅ Email notification test completed');
    } catch (error) {
        console.error('❌ Email notification test failed:', error);
    }
}

async function testTimeoutFunctionality() {
    console.log('\n🧪 Testing Timeout Functionality...');
    
    try {
        const groupId = 1; // Adjust this to a valid group ID
        const userId = 2;  // Adjust this to a valid user ID
        
        console.log('1. Setting timeout...');
        await Controller.timeoutUser(groupId, userId);
        
        console.log('2. Checking timeout...');
        const timeoutCheck = await Controller.checkUserTimeout(groupId, userId);
        console.log('Timeout check result:', timeoutCheck);
        
        if (timeoutCheck.isTimedOut) {
            console.log(`✅ Timeout is working! User will be restricted until: ${timeoutCheck.expiresAt}`);
        } else {
            console.log('❌ Timeout not working - user is not timed out');
        }
        
    } catch (error) {
        console.error('❌ Timeout test failed:', error);
    }
}

async function testSMTPConnection() {
    console.log('\n🧪 Testing SMTP Connection...');
    
    console.log('SMTP Configuration:');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Pass: ${process.env.SMTP_PASS ? '[SET]' : '[NOT SET]'}`);
    console.log(`From Name: ${process.env.SMTP_FROM_NAME}`);
    console.log(`From Email: ${process.env.SMTP_FROM_EMAIL}`);
}

async function listUsers() {
    console.log('\n📋 Available Users:');
    try {
        const users = await PG_query('SELECT "Id", "Name", "Email" FROM "Users" LIMIT 10;');
        console.table(users.rows);
    } catch (error) {
        console.error('❌ Failed to list users:', error);
    }
}

async function listGroups() {
    console.log('\n📋 Available Groups:');
    try {
        const groups = await PG_query('SELECT id, name, creater_id FROM groups LIMIT 10;');
        console.table(groups.rows);
    } catch (error) {
        console.error('❌ Failed to list groups:', error);
    }
}

async function runTests() {
    console.log('🚀 Starting Email and Timeout Tests...\n');
    
    await testSMTPConnection();
    await listUsers();
    await listGroups();
    await testTimeoutFunctionality();
    await testEmailNotification();
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
}

runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
}); 