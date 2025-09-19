const io = require('socket.io-client');
require('dotenv').config({ path: './db/env' });

// Test private message functionality
async function testPrivateMessage() {
    console.log('🧪 Testing Private Message Handler...\n');
    
    const socket = io(`http://localhost:${process.env.PORT || 19823}`);
    
    socket.on('connect', () => {
        console.log('✅ Connected to server');
        
        // Test with sample data (you may need to adjust these values)
        const testData = {
            to: 2,  // Receiver user ID
            msg: "This is a test private message to trigger email notification",
            token: "sample_token_here" // You'll need a valid token
        };
        
        console.log('📨 Sending private message:', testData);
        socket.emit('send msg', testData);
        
        // Disconnect after a short delay
        setTimeout(() => {
            console.log('🔌 Disconnecting...');
            socket.disconnect();
            process.exit(0);
        }, 3000);
    });
    
    socket.on('forbidden', (data) => {
        console.log('❌ Forbidden response:', data);
    });
    
    socket.on('expired', () => {
        console.log('❌ Token expired');
    });
    
    socket.on('server error', (data) => {
        console.log('❌ Server error:', data);
    });
    
    socket.on('send msg', (data) => {
        console.log('✅ Received response:', data?.length, 'messages');
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        process.exit(1);
    });
}

console.log('🚀 Starting Private Message Test...');
console.log(`📡 Connecting to: http://localhost:${process.env.PORT || 19823}`);

testPrivateMessage().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 