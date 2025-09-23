/**
 * @author
 * @published June 9, 2023
 * @description Socket handler for main chat
 */

const Controller = require("./controller");
const httpCode = require("../../libs/httpCode");
const chatCode = require("../../libs/chatCode");
const { users, sockets } = require("../../libs/global");
const jwt = require('jsonwebtoken');
const { isExpired } = require("./method");

// Helper function to safely emit to multiple sockets
const safeEmitToSockets = (receiverSockets, eventName, data) => {
    if (receiverSockets && receiverSockets.length > 0) {
        receiverSockets.forEach(receiverSocket => {
            if (receiverSocket && typeof receiverSocket.emit === 'function') {
                receiverSocket.emit(eventName, data);
            }
        });
    }
};

// Function to verify user token and extract user ID
const verifyUser = (token) => {
    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        return id;
    } catch (error) {
        console.error("Failed to verify user token:", error);
        throw new Error("Invalid token");
    }
};

// Helper function to extract real client IP address
const getClientIpAddress = (socket) => {
    // Try different methods to get the real client IP
    let clientIp = null;
    
    // Method 1: Check X-Forwarded-For header (most common for proxies)
    const xForwardedFor = socket.handshake.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // X-Forwarded-For can contain multiple IPs, take the first one (original client)
        clientIp = xForwardedFor.split(',')[0].trim();
        console.log(`🔍 IP from X-Forwarded-For: ${clientIp}`);
        if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
            return clientIp;
        }
    }
    
    // Method 2: Check X-Real-IP header
    const xRealIp = socket.handshake.headers['x-real-ip'];
    if (xRealIp) {
        console.log(`🔍 IP from X-Real-IP: ${xRealIp}`);
        if (xRealIp !== '127.0.0.1' && xRealIp !== '::1') {
            return xRealIp;
        }
    }
    
    // Method 3: Check CF-Connecting-IP (Cloudflare)
    const cfConnectingIp = socket.handshake.headers['cf-connecting-ip'];
    if (cfConnectingIp) {
        console.log(`🔍 IP from CF-Connecting-IP: ${cfConnectingIp}`);
        if (cfConnectingIp !== '127.0.0.1' && cfConnectingIp !== '::1') {
            return cfConnectingIp;
        }
    }
    
    // Method 4: Check X-Client-IP header
    const xClientIp = socket.handshake.headers['x-client-ip'];
    if (xClientIp) {
        console.log(`🔍 IP from X-Client-IP: ${xClientIp}`);
        if (xClientIp !== '127.0.0.1' && xClientIp !== '::1') {
            return xClientIp;
        }
    }
    
    // Method 5: Socket handshake address
    clientIp = socket.handshake.address;
    if (clientIp) {
        console.log(`🔍 IP from handshake.address: ${clientIp}`);
        if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
            return clientIp;
        }
    }
    
    // Method 6: Connection remote address
    if (socket.request && socket.request.connection) {
        clientIp = socket.request.connection.remoteAddress;
        if (clientIp) {
            console.log(`🔍 IP from connection.remoteAddress: ${clientIp}`);
            if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
                return clientIp;
            }
        }
    }
    
    // Method 7: Socket connection remote address
    if (socket.conn && socket.conn.remoteAddress) {
        clientIp = socket.conn.remoteAddress;
        console.log(`🔍 IP from conn.remoteAddress: ${clientIp}`);
        if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
            return clientIp;
        }
    }
    
    // If all methods return localhost, use a fallback approach
    console.log(`⚠️ All IP detection methods returned localhost. Available headers:`, socket.handshake.headers);
    
    // For development: generate a unique fake IP based on socket ID
    if (clientIp === '127.0.0.1' || clientIp === '::1' || !clientIp) {
        // Create a fake but consistent IP for development/testing
        const socketId = socket.id || 'unknown';
        const hash = socketId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const fakeIp = `192.168.${Math.abs(hash) % 255}.${Math.abs(hash >> 8) % 255}`;
        console.log(`🔧 Generated development IP: ${fakeIp} for socket ${socketId}`);
        return fakeIp;
    }
    
    return clientIp || '127.0.0.1';
};

// Event handler for sending a message
module.exports = (socket, users) => {
    console.log(`🔌 [SOCKET] Registering private message handler for socket ${socket.id}`);
    
    socket.on(chatCode.SEND_MSG, async (data) => {
        console.log(`📨 [PRIVATE] Private message handler triggered`);
        console.log(`📨 [PRIVATE] Data received:`, { to: data.to, msg: data.msg?.substring(0, 50), hasToken: !!data.token });
        
        if (!data.to || !data.msg || !data.token) {
            console.log(`📨 [PRIVATE] Missing required data - rejecting`);
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.SEND_MSG);
        if (res.expired) {
            console.log(`📨 [PRIVATE] Token expired - rejecting`);
            socket.emit(chatCode.EXPIRED);
            return;
        }

        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { msg: content, to: receiverId, parent_id } = data;
            
            console.log(`📨 [PRIVATE] Processing private message: sender=${senderId}, receiver=${receiverId}`);

            // Save message to the database
            await Controller.saveMsg(senderId, content, receiverId, parent_id);

            // Find the receiver's and sender's socket IDs
            const receiver = users.find(user => user.ID === receiverId);
            const sender = users.find(user => user.ID === senderId);

            console.log(`📨 [PRIVATE] Online users count: ${users.length}`);
            console.log(`📨 [PRIVATE] Sender found: ${!!sender}, Receiver found: ${!!receiver}`);
            console.log(`📨 [PRIVATE] Receiver details:`, receiver ? { ID: receiver.ID, Socket: receiver.Socket } : 'Not found');

            const senderSocketId = sender?.Socket;
            const receiverSocketId = receiver?.Socket;

            const senderSocket = sockets[senderSocketId];
            const receiverSocket = sockets[receiverSocketId];

            console.log(`📨 [PRIVATE] Sender socket exists: ${!!senderSocket}, Receiver socket exists: ${!!receiverSocket}`);

            // Retrieve message list for the user
            const msgList = await Controller.getMsg(senderId, receiverId);

            if (senderSocket) {
                senderSocket.emit(chatCode.SEND_MSG, msgList);
                console.log(`📨 [PRIVATE] Message sent to sender socket`);
            }

            // Handle receiver notification
            if (receiverSocket) {
                // Receiver is online - send inbox notification via socket
                receiverSocket.emit(chatCode.SEND_MSG, msgList);
                console.log(`📨 [PRIVATE] Inbox notification sent to online user ${receiverId}`);
            } else {
                // Receiver is offline - send both inbox and email notification
                console.log(`📨 [PRIVATE] Receiver ${receiverId} is offline - sending email notification`);
                
                // Send inbox notification (will be delivered when user comes online)
                // This is handled by the normal message storage and retrieval system
                
                // Send email notification for offline user
                try {
                    await Controller.sendPrivateMessageEmailNotification(senderId, receiverId, content);
                } catch (error) {
                    console.error("📨 [PRIVATE] Failed to send email notification:", error);
                }
            }
        } catch (error) {
            console.error(`📨 [PRIVATE] Error in private message handler:`, error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.SEND_GROUP_MSG, async (data) => {        
        if (!data.groupId || !data.msg || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.SEND_GROUP_MSG);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token first
            const senderId = verifyUser(data.token);
            const { msg: content, groupId, receiverId } = data;

            console.log(`🔍 User ${senderId} sending message to group ${groupId}`);

            // Get user's IP address using improved detection
            const clientIp = getClientIpAddress(socket);

            // Get group info to check if user is the creator
            const group = await Controller.getGroup(groupId);
            const isGroupCreator = group && group.creater_id === senderId;

            // Check if IP is banned from this group (but skip for group creators)
            if (!isGroupCreator) {
                console.log(`🔍 [IP-BAN-CHECK] [AUTH] Checking IP ban for user ${senderId}, IP: ${clientIp}, group: ${groupId}`);
                const isIpBanned = await Controller.checkIpBan(groupId, clientIp);
                console.log(`🔍 [IP-BAN-CHECK] [AUTH] Result: ${isIpBanned ? 'BANNED' : 'NOT BANNED'}`);
                
                if (isIpBanned) {
                    console.log(`🚫 IP BAN BLOCKING MESSAGE: IP ${clientIp} is banned from group ${groupId}`);
                    console.log(`🚫 User trying to send message: ${senderId}`);
                    socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                    return;
                }
            } else {
                console.log(`👑 Group creator ${senderId} sending message to group ${groupId} - IP ban check skipped`);
            }

            // Check if user is timed out (but skip for group creators)
            if (!isGroupCreator) {
                // Check for user timeout
                const userTimeoutCheck = await Controller.checkUserTimeout(groupId, senderId);
                if (userTimeoutCheck.isTimedOut) {
                    console.log(`⏰ USER TIMEOUT BLOCKING MESSAGE: User ${senderId} is timed out in group ${groupId} until ${userTimeoutCheck.expiresAt}`);
                    socket.emit(chatCode.FORBIDDEN, `You are temporarily restricted from sending messages until ${new Date(userTimeoutCheck.expiresAt).toLocaleString()}`);
                    return;
                }

                // Check for IP timeout (for anonymous users or additional security)
                const ipTimeoutCheck = await Controller.checkIpTimeout(groupId, clientIp);
                if (ipTimeoutCheck.isTimedOut) {
                    console.log(`⏰ IP TIMEOUT BLOCKING MESSAGE: IP ${clientIp} is timed out in group ${groupId} until ${ipTimeoutCheck.expiresAt}`);
                    socket.emit(chatCode.FORBIDDEN, `Your IP address is temporarily restricted from sending messages until ${new Date(ipTimeoutCheck.expiresAt).toLocaleString()}`);
                    return;
                }
            } else {
                console.log(`👑 Group creator ${senderId} sending message to group ${groupId} - timeout checks skipped`);
            }

            // Add user to users list if not already present
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Handle Mods Mode messaging (receiverId = -1 indicates mods-only message)
            if (receiverId === -1) {
                console.log(`📋 [MODS-MODE] User ${senderId} sending message to moderators and admins in group ${groupId}`);
                
                // Get all moderator and admin IDs
                const modAdminIds = await Controller.getGroupModeratorsAndAdmins(groupId);
                console.log(`📋 [MODS-MODE] Found ${modAdminIds.length} moderators/admins:`, modAdminIds);
                
                if (modAdminIds.length > 0) {
                    // Save the message once for each moderator/admin
                    for (const modAdminId of modAdminIds) {
                        await Controller.saveGroupMsg(senderId, content, groupId, modAdminId, data.parent_id);
                        console.log(`📋 [MODS-MODE] Message saved for moderator/admin ${modAdminId}`);
                    }
                } else {
                    console.log(`📋 [MODS-MODE] No moderators/admins found, saving as regular group message`);
                    await Controller.saveGroupMsg(senderId, content, groupId, null, data.parent_id);
                }
            } else {
                // Regular message (public or 1-on-1)
                await Controller.saveGroupMsg(senderId, content, groupId, receiverId, data.parent_id);
                
                // Send email notification for 1-on-1 messages to offline users
                if (receiverId && receiverId !== -1) {
                    console.log(`📧 [EMAIL-CHECK] Checking if user ${receiverId} is online for email notification`);
                    
                    // Check if the target user is online
                    const targetUserSocket = users.find(user => user.ID == receiverId);
                    const isTargetUserOnline = targetUserSocket && sockets[targetUserSocket.Socket] && sockets[targetUserSocket.Socket].connected;
                    
                    console.log(`📧 [EMAIL-CHECK] Target user ${receiverId} online status:`, {
                        hasSocket: !!targetUserSocket,
                        socketId: targetUserSocket?.Socket,
                        isConnected: isTargetUserOnline
                    });
                    
                    if (!isTargetUserOnline) {
                        console.log(`📧 [EMAIL-NOTIFICATION] User ${receiverId} is offline, sending email notification for message from ${senderId}`);
                        
                        // Send email notification asynchronously (don't block message sending)
                        setImmediate(async () => {
                            try {
                                await Controller.sendPrivateMessageEmailNotification(senderId, receiverId, content);
                            } catch (error) {
                                console.error(`❌ [EMAIL-NOTIFICATION] Failed to send email notification:`, error);
                            }
                        });
                    } else {
                        console.log(`📧 [EMAIL-CHECK] User ${receiverId} is online, skipping email notification`);
                    }
                }
            }
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            
            // Find the receiver's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]).filter(socket => socket);

            // Retrieve message list for the user
            const msgList = await Controller.getGroupMsg(groupId);
            
            console.log("🔍 [BROADCAST] Group:", groupId, "Sender:", senderId);
            console.log("🔍 [BROADCAST] Total receiverIds:", receiverIds?.length, receiverIds);
            console.log("🔍 [BROADCAST] Total users tracked:", users.length);
            console.log("🔍 [BROADCAST] Matched receiveUsers:", receiveUsers?.length, receiveUsers?.map(u => ({ ID: u.ID, Socket: u.Socket })));
            console.log("🔍 [BROADCAST] Valid receiverSockets:", receiverSockets?.length);
            
            // Enhanced broadcasting: Try to reach all group members
            let successfulBroadcasts = 0;
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach((receiverSocket, index) => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        try {
                            receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                            receiverSocket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID));
                            successfulBroadcasts++;
                            console.log(`🔍 [BROADCAST] ✅ Message sent to socket ${index + 1}/${receiverSockets.length}`);
                        } catch (error) {
                            console.log(`🔍 [BROADCAST] ❌ Failed to send to socket ${index + 1}:`, error.message);
                        }
                    } else {
                        console.log(`🔍 [BROADCAST] ❌ Invalid socket ${index + 1}: socket is null or missing emit function`);
                    }
                });
            }
            
            // Additional broadcast attempt: Use socket.io rooms for better reliability
            try {
                // Broadcast to all sockets in the group room (if implemented)
                socket.to(`group_${groupId}`).emit(chatCode.SEND_GROUP_MSG, msgList);
                console.log(`🔍 [BROADCAST] 📡 Room broadcast sent to group_${groupId}`);
            } catch (error) {
                console.log(`🔍 [BROADCAST] ❌ Room broadcast failed:`, error.message);
            }
            
            console.log(`🔍 [BROADCAST] Summary: ${successfulBroadcasts}/${receiverSockets?.length || 0} direct broadcasts successful`);
            
            // Send message back to sender
            socket.emit(chatCode.SEND_GROUP_MSG, msgList);
            socket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID));
            
            console.log(`✅ Message sent successfully by user ${senderId} to group ${groupId}`);
            
        } catch (error) {
            console.error("Error sending group message:", error);
            console.error("Error details:", error.message);
            console.error("Stack trace:", error.stack);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.SEND_GROUP_MSG_ANON, async (data) => {  
        console.log(`📨 [ANON-MSG] Anonymous message handler triggered! Data:`, JSON.stringify(data, null, 2));
        
        if (!data.groupId || !data.msg || !data.anonId) {
            console.log(`❌ [ANON-MSG] Missing required data:`, {
                hasGroupId: !!data.groupId,
                hasMsg: !!data.msg,
                hasAnonId: !!data.anonId,
                data: data
            });
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        
        try {
            const { anonId, msg: content, groupId, receiverId } = data;
            console.log(`📨 [ANON-MSG] Processing message from anonymous user ${anonId} to group ${groupId}`);
            console.log(`📨 [ANON-MSG] Socket connected: ${socket.connected}, Socket ID: ${socket.id}`);
            
            // Ensure anonymous user is registered in users array
            const existingUser = users.find(user => user.ID == anonId);
            if (!existingUser) {
                console.log(`🔄 [ANON-MSG] Registering anonymous user ${anonId} in users array`);
                users.push({ ID: anonId, Socket: socket.id });
                sockets[socket.id] = socket;
            } else if (existingUser.Socket !== socket.id) {
                console.log(`🔄 [ANON-MSG] Updating socket ID for anonymous user ${anonId}: ${existingUser.Socket} -> ${socket.id}`);
                existingUser.Socket = socket.id;
                sockets[socket.id] = socket;
            }
            
            // Check IP ban status
            const clientIp = getClientIpAddress(socket);
            console.log(`🔍 [ANON-MSG] Checking IP ban for ${clientIp} in group ${groupId}`);
            
            const isIpBanned = await Controller.checkIpBan(groupId, clientIp);
            if (isIpBanned) {
                console.log(`🚫 [ANON-MSG] BLOCKING: IP ${clientIp} is banned from group ${groupId}`);
                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                return;
            }
            console.log(`✅ [ANON-MSG] IP ${clientIp} is not banned - proceeding`);
            
            // Check IP timeout status  
            const ipTimeoutCheck = await Controller.checkIpTimeout(groupId, clientIp);
            if (ipTimeoutCheck.isTimedOut) {
                console.log(`⏰ [ANON-MSG] BLOCKING: IP ${clientIp} is timed out until ${ipTimeoutCheck.expiresAt}`);
                socket.emit(chatCode.FORBIDDEN, `You are temporarily restricted from sending messages. Restriction expires at ${new Date(ipTimeoutCheck.expiresAt).toLocaleString()}`);
                return;
            }
            console.log(`✅ [ANON-MSG] IP ${clientIp} is not timed out - proceeding`);
            
            console.log(`📨 [ANON-MSG] Starting message save and broadcast process`);
            
            // Handle Mods Mode messaging for anonymous users (receiverId = -1 indicates mods-only message)
            console.log(`💾 [ANON-MSG] Saving message to database`);
            if (receiverId === -1) {
                console.log(`📋 [ANON-MODS-MODE] Anonymous user ${anonId} sending message to moderators and admins in group ${groupId}`);
                
                // Get all moderator and admin IDs
                const modAdminIds = await Controller.getGroupModeratorsAndAdmins(groupId);
                console.log(`📋 [ANON-MODS-MODE] Found ${modAdminIds.length} moderators/admins:`, modAdminIds);
                
                if (modAdminIds.length > 0) {
                    // Save the message once for each moderator/admin
                    for (const modAdminId of modAdminIds) {
                        await Controller.saveGroupMsg(anonId, content, groupId, modAdminId, data.parent_id);
                        console.log(`📋 [ANON-MODS-MODE] Message saved for moderator/admin ${modAdminId}`);
                    }
                } else {
                    console.log(`📋 [ANON-MODS-MODE] No moderators/admins found, saving as regular group message`);
                    await Controller.saveGroupMsg(anonId, content, groupId, null, data.parent_id);
                }
            } else {
                // Regular message (public or 1-on-1)
                await Controller.saveGroupMsg(anonId, content, groupId, receiverId, data.parent_id);
                
                // Send email notification for 1-on-1 messages to offline users from anonymous senders
                if (receiverId && receiverId !== -1) {
                    console.log(`📧 [ANON-EMAIL-CHECK] Checking if user ${receiverId} is online for email notification`);
                    
                    // Check if the target user is online
                    const targetUserSocket = users.find(user => user.ID == receiverId);
                    const isTargetUserOnline = targetUserSocket && sockets[targetUserSocket.Socket] && sockets[targetUserSocket.Socket].connected;
                    
                    console.log(`📧 [ANON-EMAIL-CHECK] Target user ${receiverId} online status:`, {
                        hasSocket: !!targetUserSocket,
                        socketId: targetUserSocket?.Socket,
                        isConnected: isTargetUserOnline
                    });
                    
                    if (!isTargetUserOnline) {
                        console.log(`📧 [ANON-EMAIL-NOTIFICATION] User ${receiverId} is offline, sending email notification for message from anonymous user ${anonId}`);
                        
                        // Send email notification asynchronously (don't block message sending)
                        // Note: For anonymous senders, we use anonId as senderId but the email template should handle this gracefully
                        setImmediate(async () => {
                            try {
                                await Controller.sendPrivateMessageEmailNotification(anonId, receiverId, content);
                            } catch (error) {
                                console.error(`❌ [ANON-EMAIL-NOTIFICATION] Failed to send email notification:`, error);
                            }
                        });
                    } else {
                        console.log(`📧 [ANON-EMAIL-CHECK] User ${receiverId} is online, skipping email notification`);
                    }
                }
            }
            console.log(`✅ [ANON-MSG] Message saved to database`);
            
            // Get receiver IDs for the group
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            console.log(`👥 [ANON-MSG] Found ${receiverIds.length} group members:`, receiverIds);
            
            // Find active receiver sockets
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket).filter(socketId => socketId);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]).filter(socket => socket && socket.connected);
            
            console.log(`🔌 [ANON-MSG] Active receivers: ${receiveUsers.length} users, ${receiverSockets.length} connected sockets`);

            // Retrieve updated message list
            const msgList = await Controller.getGroupMsg(groupId);
            console.log(`📨 [ANON-MSG] Retrieved ${msgList.length} messages from database`);
            
            // Send message to all connected receivers
            let successCount = 0;
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach((receiverSocket, index) => {
                    try {
                        if (receiverSocket && typeof receiverSocket.emit === 'function' && receiverSocket.connected) {
                            receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                            successCount++;
                            console.log(`📤 [ANON-MSG] Sent to receiver ${index + 1}/${receiverSockets.length}`);
                        }
                    } catch (error) {
                        console.log(`❌ [ANON-MSG] Failed to send to receiver ${index + 1}:`, error.message);
                    }
                });
            }
            
            // Send message back to sender
            try {
                if (socket && socket.connected) {
                    socket.emit(chatCode.SEND_GROUP_MSG, msgList);
                    console.log(`📤 [ANON-MSG] Sent message back to sender`);
                }
            } catch (error) {
                console.log(`❌ [ANON-MSG] Failed to send to sender:`, error.message);
            }
            
            console.log(`✅ [ANON-MSG] Message broadcast complete: ${successCount}/${receiverSockets.length} receivers notified`);
            
        } catch (error) {
            console.error(`❌ [ANON-MSG] Error sending anonymous message from ${data.anonId}:`, error);
            console.error(`❌ [ANON-MSG] Error details:`, {
                message: error.message,
                stack: error.stack?.substring(0, 500),
                data: data
            });
            
            // Send specific error response
            socket.emit('message error', { 
                message: "Failed to send message", 
                error: error.message,
                type: 'anonymous'
            });
        }
    });

    socket.on(chatCode.DELETE_MSG, async (data) => {        
        if (!data.msgId || !data.token || !data.receiverId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.DELETE_MSG);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { msgId, receiverId} = data;
            
            // Save message to the database
            await Controller.deleteMsg(msgId, senderId, receiverId);

            // Find the receiver's and sender's socket IDs
            const sender = users.find(user => user.ID === senderId);
            const receiver = users.find(user => user.ID === receiverId);
            
            const senderSocketId = sender?.Socket;
            const receiverSocketId = receiver?.Socket;

            const senderSocket = sockets[senderSocketId];
            const receiverSocket = sockets[receiverSocketId];

            if (senderSocket) {
                senderSocket.emit(chatCode.DELETE_MSG, msgId);
            }
            if (receiverSocket) {
                receiverSocket.emit(chatCode.DELETE_MSG, msgId);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.DELETE_GROUP_MSG, async (data) => {        
        if (!data.msgId || !data.token || !data.groupId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.DELETE_GROUP_MSG);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { msgId, groupId} = data;

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.deleteGroupMsg(msgId);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers.find(receiverId => receiverId == user.ID));
            // const sender = users.find(user => user.ID === senderId);
            
            // const senderSocketId = sender?.Socket;
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);

            // const senderSocket = sockets[senderSocketId];
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);

            // if (senderSocket) {
            //     senderSocket.emit(chatCode.DELETE_GROUP_MSG, msgId);
            // }
            safeEmitToSockets(receiverSockets, chatCode.DELETE_GROUP_MSG, msgId);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.BAN_GROUP_USER, async (data) => {        
        if (!data.groupId || !data.token || !data.userId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.BAN_GROUP_USER);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { userId, groupId } = data;

            // RULE 1: User cannot ban himself
            if (senderId === userId) {
                console.log(`Ban attempt blocked: User ${senderId} tried to ban themselves`);
                socket.emit(chatCode.FORBIDDEN, "Cannot ban yourself");
                return;
            }

            // RULE 2: Only Group Master (creator) can ban users
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo || groupInfo.creater_id !== senderId) {
                console.log(`Ban attempt blocked: User ${senderId} is not the group master of group ${groupId} (creator: ${groupInfo?.creater_id})`);
                socket.emit(chatCode.FORBIDDEN, "Only the group creator can ban users");
                return;
            }
            console.log(`✅ Group Master ${senderId} authorized to ban users in group ${groupId}`);

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }

            // Find the banned user's socket to get their IP address
            // Fix: Ensure userId is parsed as integer for proper comparison
    const targetUserId = parseInt(userId);
    console.log(`🔍 [BAN] Looking for user ${targetUserId} (type: ${typeof targetUserId}) in ${users.length} users`);
    
    const bannedUserSocket = users.find(user => {
      const userIdInt = parseInt(user.ID);
      console.log(`🔍 [BAN] Comparing ${userIdInt} (${typeof userIdInt}) with ${targetUserId} (${typeof targetUserId})`);
      return userIdInt === targetUserId;
    });
            let bannedUserIp = null;
            
            if (bannedUserSocket) {
                const bannedSocket = sockets[bannedUserSocket.Socket];
                if (bannedSocket) {
                    // Try multiple methods to get the real client IP
                    bannedUserIp = getClientIpAddress(bannedSocket);
                    console.log(`🔍 [BAN] Extracted IP for user ${targetUserId}: ${bannedUserIp}`);
                }
            }

            console.log(`🚫 [BAN-REQUEST] User ${senderId} banning user ${targetUserId} (IP: ${bannedUserIp}) in group ${groupId}`);

            // 🆕 Use unified ban system (Rule 1 & 2: Admin/Mod can ban any user, always ban IP)
            if (bannedUserIp) {
                console.log(`🚫 [UNIFIED-BAN] Banning user ${targetUserId} and IP ${bannedUserIp} using unified system`);
                await Controller.unifiedBanUser(groupId, targetUserId, bannedUserIp, senderId);
            } else {
                // Fallback: ban only user ID if IP is not available (for registered users)
                console.log(`🚫 [FALLBACK-BAN] Banning user ${targetUserId} only (IP not available)`);
                await Controller.banGroupUser(groupId, targetUserId);
            }

            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            
            const group = await Controller.getGroup(groupId);
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.BAN_GROUP_USER, userId);
                        receiverSocket.emit(chatCode.GROUP_UPDATED, group);
                    }
                });
            }

            console.log(`Ban completed successfully for user ${userId} by ${senderId}`);
        } catch (error) {
            console.error("Error banning user:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UNBAN_GROUP_USER, async (data) => {        
        if (!data.groupId || !data.token || !data.userId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UNBAN_GROUP_USER);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { userId, groupId } = data;

            // Only Group Master (creator) can unban users
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo || groupInfo.creater_id !== senderId) {
                console.log(`Unban attempt blocked: User ${senderId} is not the group master of group ${groupId} (creator: ${groupInfo?.creater_id})`);
                socket.emit(chatCode.FORBIDDEN, "Only the group creator can unban users");
                return;
            }

            console.log(`✅ [UNIFIED-UNBAN] Group Master ${senderId} unbanning user ${userId} from group ${groupId}`);

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Get the user's IP for unified unban (if available)
            const targetUserSocket = users.find(user => user.ID == userId);
            let targetUserIp = null;
            if (targetUserSocket) {
                const userSocket = sockets[targetUserSocket.Socket];
                if (userSocket) {
                    targetUserIp = getClientIpAddress(userSocket);
                }
            }
            
            // 🆕 Use unified unban system
            if (targetUserIp) {
                console.log(`✅ [UNIFIED-UNBAN] Unbanning user ${userId} and IP ${targetUserIp} using unified system`);
                await Controller.unifiedUnbanUser(groupId, userId, targetUserIp);
            } else {
                console.log(`✅ [FALLBACK-UNBAN] Unbanning user ${userId} only (IP not available)`);
                await Controller.unbanGroupUser(groupId, userId);
            }
            
            // Send unban notification to the unbanned user (if they're online)
            if (targetUserSocket) {
                const userSocket = sockets[targetUserSocket.Socket];
                if (userSocket) {
                    userSocket.emit(chatCode.USER_UNBAN_NOTIFICATION, { 
                        groupId, 
                        message: `You have been unbanned and can now send messages in this group.`,
                        groupName: groupInfo.name || 'Group'
                    });
                    console.log(`📢 [UNBAN-NOTIFICATION] Sent unban notification to user ${userId}`);
                }
            }
            
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            
            const group = await Controller.getGroup(groupId);
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.UNBAN_GROUP_USER, userId);
                        receiverSocket.emit(chatCode.GROUP_UPDATED, group);
                    }
                });
            }

            console.log(`Unban completed successfully for user ${userId} by ${senderId}`);
        } catch (error) {
            console.error("Error unbanning user:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UNBAN_GROUP_USERS, async (data) => {        
        if (!data.groupId || !data.token || !data.userIds) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UNBAN_GROUP_USERS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { userIds, groupId} = data;

            // Only Group Master (creator) can unban users
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo || groupInfo.creater_id !== senderId) {
                console.log(`Bulk unban attempt blocked: User ${senderId} is not the group master of group ${groupId} (creator: ${groupInfo?.creater_id})`);
                socket.emit(chatCode.FORBIDDEN, "Only the group creator can unban users");
                return;
            }

            console.log(`Bulk unban request: Group Master ${senderId} unbanning users [${userIds}] in group ${groupId}`);

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.unbanGroupUsers(groupId, userIds);
            
            // Send unban notifications to all unbanned users (if they're online)
            userIds.forEach(userId => {
                const targetUserSocket = users.find(user => user.ID == userId);
                if (targetUserSocket) {
                    const userSocket = sockets[targetUserSocket.Socket];
                    if (userSocket) {
                        userSocket.emit(chatCode.USER_UNBAN_NOTIFICATION, { 
                            groupId, 
                            message: `You have been unbanned and can now send messages in this group.`,
                            groupName: groupInfo.name || 'Group'
                        });
                        console.log(`📢 [BULK-UNBAN-NOTIFICATION] Sent unban notification to user ${userId}`);
                    }
                }
            });
            
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user
            const group = await Controller.getGroup(groupId);           
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket && receiverSocket.emit(chatCode.GROUP_UPDATED, group));
                receiverSockets.map(receiverSocket => receiverSocket && receiverSocket.emit(chatCode.UNBAN_GROUP_USERS, userIds));
            }
            socket.emit(chatCode.GROUP_UPDATED, group)
            socket.emit(chatCode.UNBAN_GROUP_USERS, userIds)
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.TIMEOUT_USER, async (data) => {
        console.log("🔍 [TIMEOUT] Socket received timeout user data:", data);        
        if (!data.groupId || !data.token || !data.userId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.TIMEOUT_USER);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            const senderId = verifyUser(data.token);
            const { userId, groupId} = data;

            // Check if sender is group creator
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo || groupInfo.creater_id !== senderId) {
                            socket.emit(chatCode.FORBIDDEN, "Only the group creator can timeout users");
            return;
        }

        // Fix: Ensure userId is parsed as integer for proper comparison
        const targetUserId = parseInt(userId);
        console.log(`🔍 [TIMEOUT] Processing timeout for user ${targetUserId} (type: ${typeof targetUserId})`);

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // 🆕 Use unified timeout system (just like ban system)
            // Get the user's IP address from their socket connection
            const timeoutUser = users.find(user => user.ID == targetUserId);
            let timeoutUserIp = null;
            
            if (timeoutUser) {
                const userSocket = sockets[timeoutUser.Socket];
                if (userSocket) {
                    timeoutUserIp = getClientIpAddress(userSocket);
                }
            }

            console.log(`⏰ [TIMEOUT-REQUEST] User ${senderId} timing out user ${targetUserId} (IP: ${timeoutUserIp}) in group ${groupId}`);

            // Use unified timeout system (timeout duration in seconds)
            const timeoutDurationSeconds = chatCode.TIMEOUT_MINS * 60;
            
            if (timeoutUserIp) {
                console.log(`⏰ [UNIFIED-TIMEOUT] Timing out user ${targetUserId} and IP ${timeoutUserIp} using unified system`);
                await Controller.unifiedTimeoutUser(groupId, targetUserId, timeoutUserIp, timeoutDurationSeconds, senderId);
            } else {
                console.log(`⏰ [FALLBACK-TIMEOUT] Timing out user ${targetUserId} only (IP not available)`);
                await Controller.timeoutUser(groupId, targetUserId, timeoutDurationSeconds);
            }

            // Send notification to the timed out user
            if (timeoutUser) {
                const userSocket = sockets[timeoutUser.Socket];
                if (userSocket) {
                    userSocket.emit(chatCode.USER_TIMEOUT_NOTIFICATION, { 
                        groupId, 
                        timeoutMinutes: chatCode.TIMEOUT_MINS,
                        message: `You have been temporarily restricted from sending messages for ${chatCode.TIMEOUT_MINS} minutes.`,
                        expiresAt: new Date(Date.now() + timeoutDurationSeconds * 1000).toISOString()
                    });
                    console.log(`📢 [UNIFIED-TIMEOUT] Timeout notification sent to user ${targetUserId} (IP: ${timeoutUserIp || 'unknown'})`);
                }
            }
            
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers.find(receiverId => receiverId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            
            // Broadcast group update to all members so they see updated timeout status
            const updatedGroup = await Controller.getGroup(groupId);
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket && receiverSocket.emit(chatCode.GROUP_UPDATED, updatedGroup));
            }
            socket.emit(chatCode.GROUP_UPDATED, updatedGroup);

            // 🆕 Send success response (like ban system)
            socket.emit('timeout success', { 
                message: `User ${targetUserId} has been timed out for ${chatCode.TIMEOUT_MINS} minutes`,
                userId: targetUserId,
                timeoutMinutes: chatCode.TIMEOUT_MINS
            });
        } catch (error) {
            console.error("❌ [UNIFIED-TIMEOUT] Error timing out user:", error);
            socket.emit('timeout error', { 
                message: "Failed to timeout user", 
                error: error.message,
                userId: data.userId
            });
        }
    });

    // 🆕 Unban IP address event handler
    socket.on('unban ip address', async (data) => {
        console.log("✅ [IP-UNBAN] Socket received unban IP request:", data);
        
        if (!data.groupId || !data.token || !data.ipAddress) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, 'unban ip address');
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }

        try {
            const senderId = verifyUser(data.token);
            const { groupId, ipAddress } = data;

            // Check if sender has permission (group creator or moderator with ban permission)
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo) {
                socket.emit(chatCode.FORBIDDEN, "Group not found");
                return;
            }

            const isGroupCreator = groupInfo.creater_id === senderId;
            
            if (!isGroupCreator) {
                // Check if user is moderator with ban permission
                const groupMembers = await Controller.getGroupUsersData(groupId);
                const senderMember = groupMembers.find(member => member.id === senderId);
                const isModerator = senderMember && senderMember.role_id === 2 && senderMember.ban_user === true;
                
                if (!isModerator) {
                    console.log(`IP unban attempt blocked: User ${senderId} is not authorized`);
                    socket.emit(chatCode.FORBIDDEN, "Only group creators or moderators with ban permission can unban IP addresses");
                    return;
                }
            }

            console.log(`✅ [IP-UNBAN] User ${senderId} unbanning IP ${ipAddress} from group ${groupId}`);

            // Unban the IP address
            await Controller.unbanIpAddress(groupId, ipAddress);

            // Send success response
            socket.emit('ip unban success', { 
                message: `IP address ${ipAddress} has been unbanned successfully`,
                ipAddress: ipAddress
            });

            // Note: Don't broadcast IP bans to all users - only send success to requesting user
            // Updated IP bans will be fetched when users specifically open IP bans dialog

            console.log(`✅ [IP-UNBAN] Successfully unbanned IP ${ipAddress} and notified group members`);

        } catch (error) {
            console.error("❌ [IP-UNBAN] Error unbanning IP:", error);
            socket.emit('ip unban error', { 
                message: "Failed to unban IP address", 
                error: error.message 
            });
        }
    });

    socket.on(chatCode.UPDATE_CENSORED_CONTENTS, async (data) => {        
        if (!data.groupId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UPDATE_CENSORED_CONTENTS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { contents, groupId} = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.updateCensoredContents(groupId, contents);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user
            const group = await Controller.getGroup(groupId);           
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket && receiverSocket.emit(chatCode.GROUP_UPDATED, group));
                
            }
             socket.emit(chatCode.GROUP_UPDATED, group);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UPDATE_GROUP_MODERATORS, async (data) => {        
        if (!data.groupId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UPDATE_GROUP_MODERATORS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { modIds, groupId} = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.updateGroupModerators(groupId, senderId, modIds);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user
            const group = await Controller.getGroup(groupId);           
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket && receiverSocket.emit(chatCode.GROUP_UPDATED, group));                
            }
            socket.emit(chatCode.GROUP_UPDATED, group)
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.GET_BLOCKED_USERS_INFO, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.GET_BLOCKED_USERS_INFO);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            // Save message to the database
            const usersInfo = await Controller.getBlockedUsersInfo(senderId);
            socket.emit(chatCode.GET_BLOCKED_USERS_INFO, usersInfo);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.BLOCK_USER, async (data) => {        
        if (!data.userId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.BLOCK_USER);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { userId } = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.blockUser(senderId, userId);
            const blockedUsers = await Controller.getBlockedUsersInfo(senderId);
            socket.emit(chatCode.GET_BLOCKED_USERS_INFO, blockedUsers);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UNBLOCK_USER, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UNBLOCK_USER);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { userId } = data;
            // Save message to the database
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            await Controller.unblockUser(senderId, userId);
            const blockedUsers = await Controller.getBlockedUsersInfo(senderId);
            socket.emit(chatCode.GET_BLOCKED_USERS_INFO, blockedUsers);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.CLEAR_GROUP_CHAT, async (data) => {        
        if (!data.groupId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.CLEAR_GROUP_CHAT);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId} = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.clearGroupChat(groupId);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user         
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.CLEAR_GROUP_CHAT, groupId);
                    }
                });                
            }
            socket.emit(chatCode.CLEAR_GROUP_CHAT, groupId);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.PIN_MESSAGE, async (data) => {        
        if (!data.msgId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.PIN_MESSAGE);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId, msgId} = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            console.log(`📌 [Backend] Pinning message ${msgId} in group ${groupId} by user ${senderId}`);
            await Controller.pinChatMessage(msgId, groupId, senderId);
            const msgIds = await Controller.getPinnedMsgInfo(groupId);
            console.log(`📌 [Backend] Updated pinned messages for group ${groupId}:`, msgIds);
            
            // Send success response to the requester
            socket.emit('pin message', { 
                success: true, 
                messageId: msgId,
                message: 'Message pinned successfully'
            });
            
            // Get all group members and their sockets
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket).filter(socketId => socketId);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]).filter(socket => socket && socket.connected);
            
            console.log(`📌 [Backend] Broadcasting to ${receiverSockets.length} connected users`);
            
            // Broadcast updated pinned messages to all group members (including sender)
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach((receiverSocket, index) => {
                    try {
                        if (receiverSocket && typeof receiverSocket.emit === 'function' && receiverSocket.connected) {
                            receiverSocket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
                            console.log(`📌 [Backend] Sent pinned messages to user ${index + 1}/${receiverSockets.length}`);
                        }
                    } catch (error) {
                        console.log(`📌 [Backend] Failed to send pinned messages to user ${index + 1}:`, error.message);
                    }
                });                
            }
            
            // Also send to the requester (in case they're not in the receivers list)
            socket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
            
            console.log(`📌 [Backend] Message ${msgId} pinned successfully and broadcast completed`);
        } catch (error) {
            console.error("📌 [Backend] Error pinning message:", error);
            
            // Send error response to the requester
            socket.emit('pin message', { 
                success: false, 
                error: error.message || 'Failed to pin message',
                messageId: data.msgId
            });
        }
    });

    socket.on(chatCode.UNPIN_MESSAGE, async (data) => {        
        if (!data.msgId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UNPIN_MESSAGE);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId, msgId} = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.unpinChatMessage(msgId);
            const msgIds = await Controller.getPinnedMsgInfo(groupId);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user         
            
            // Send success response to the requester (same as F version expects)
            socket.emit('unpin message', { 
                success: true, 
                messageId: msgId,
                message: 'Message unpinned successfully'
            });
            
            // Broadcast updated pinned messages to all group members
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach((receiverSocket, index) => {
                    try {
                        if (receiverSocket && typeof receiverSocket.emit === 'function' && receiverSocket.connected) {
                            receiverSocket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
                            console.log(`📌 [Backend] Sent unpinned messages to user ${index + 1}/${receiverSockets.length}`);
                        }
                    } catch (error) {
                        console.log(`📌 [Backend] Failed to send unpinned messages to user ${index + 1}:`, error.message);
                    }
                });                
            }
            
            // Also send to the requester (in case they're not in the receivers list)
            socket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
            
            console.log(`📌 [Backend] Message ${msgId} unpinned successfully by user ${senderId}`);
        } catch (error) {
            console.error("📌 [Backend] Error unpinning message:", error);
            
            // Send error response to the requester
            socket.emit('unpin message', { 
                success: false, 
                error: error.message || 'Failed to unpin message',
                messageId: data.msgId
            });
        }
    });

    socket.on(chatCode.GET_PINNED_MESSAGES, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        if (!data.token.includes("anonuser")) {
            const res = isExpired(socket, data, chatCode.GET_PINNED_MESSAGES);
            if (res.expired) {
                socket.emit(chatCode.EXPIRED);
                return;
            }
        }
        
        try {
            // Get sender ID from the token
            const { groupId } = data;
            // Save message to the database
            const msgIds = await Controller.getPinnedMsgInfo(groupId);
            // const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            // const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            // const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            // const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user         
            
            // if (receiverSockets && receiverSockets.length > 0) {
            //     console.log("==receiverSocketIds ===>", receiverSocketIds);
            //     receiverSockets.map(receiverSocket => receiverSocket.emit(chatCode.CLEAR_GROUP_CHAT, groupId));                
            // }
            socket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UPDATE_GROUP_POST_LEVEL, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UPDATE_GROUP_POST_LEVEL);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { 
                groupId, 
                post_level, 
                url_level, 
                slow_mode, 
                slow_time 
            } = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.updateGroupPostModes(
                groupId, 
                post_level, 
                url_level, 
                slow_mode, 
                slow_time
            );
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user

            const group = await Controller.getGroup(groupId); 
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.GROUP_UPDATED, group);
                    }
                });                
            }
            socket.emit(chatCode.GROUP_UPDATED, group)
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UPDATE_GROUP_CHATBOX_STYLE, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UPDATE_GROUP_CHATBOX_STYLE);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { 
                groupId, 
                size_mode,
                frame_width,
                frame_height,
                bg_color,
                title_color,
                msg_bg_color,
                msg_txt_color,
                reply_msg_color,
                msg_date_color,
                input_bg_color,
                show_user_img,
                custom_font_size,
                font_size,
                round_corners,
                corner_radius 
            } = data;
            // Save message to the database
            await Controller.updateGroupChatboxStyle(
                groupId, 
                size_mode,
                frame_width,
                frame_height,
                bg_color,
                title_color,
                msg_bg_color,
                msg_txt_color,
                reply_msg_color,
                msg_date_color,
                input_bg_color,
                show_user_img,
                custom_font_size,
                font_size,
                round_corners,
                corner_radius
            );
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user

            const group = await Controller.getGroup(groupId); 
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket.emit(chatCode.GROUP_UPDATED, group));                
            }
            socket.emit(chatCode.GROUP_UPDATED, group)
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UPDATE_MOD_PERMISSIONS, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UPDATE_MOD_PERMISSIONS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { 
                groupId, 
                modId,
                chat_limit, 
                manage_mods, 
                manage_chat, 
                manage_censored, 
                ban_user 
            } = data;
            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.updateGroupModPriorities(
                modId,
                groupId, 
                chat_limit, 
                manage_mods, 
                manage_chat, 
                manage_censored, 
                ban_user
            );
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user

            const group = await Controller.getGroup(groupId); 
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => receiverSocket.emit(chatCode.GROUP_UPDATED, group));                
            }
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.SEND_GROUP_NOTIFY, async (data) => {        
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.SEND_GROUP_NOTIFY);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { 
                groupId, 
                message 
            } = data;
            // Save message to the database
            await Controller.sendGroupNotification(
                senderId,
                groupId, 
                message
            );
            const receiverEmails = await Controller.getReceiverEmailsOfGroup(groupId);
            console.log("receiverEmails ====", receiverEmails)
            // Controller.sendNotificationEamil(receiverEmails, message)
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            for (const receiverId of receivers) {
            // receivers.forEach(async receiverId => {
                if (receiverId < 1000000 && receiverId != senderId) {
                    const receiver = users.find(u => u.ID == receiverId)
                    const receiverSocketId = receiver?.Socket
                    if (receiver && receiverSocketId) {                        
                        const receiverSocket = sockets[receiverSocketId]
                        
                        // const lastMsg = await Controller.getLastMessage(senderId, receiverId)
                        const msgList = await Controller.getMsg(senderId, receiverId);                        
                        if (receiverSocket && msgList) {
                            receiverSocket.emit(chatCode.SEND_MSG, msgList)
                        }
                    }                    
                }
            }
            socket.emit(chatCode.SEND_GROUP_NOTIFY, "Sent Notification successfully.")
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.GET_GROUP_ONLINE_USERS, async (data) => {        
        // Make this endpoint public - no token requirement
        if (!data.groupId) {
            socket.emit(chatCode.FORBIDDEN, "Group ID is required");
            return;
        }

        try {
            const { groupId } = data;
            
            // Get all group member IDs from database
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            
            // Find all online users (both authenticated and anonymous) for this group
            // This includes:
            // 1. Authenticated users who are group members
            // 2. Anonymous users currently in the group
            const onlineUsers = users.filter(user => {
                // Include authenticated users who are group members
                if (user.ID < 100000 && receiverIds.find(recId => recId == user.ID)) {
                    return true;
                }
                // Include anonymous users (ID > 100000) - they are already filtered by group when added
                if (user.ID > 100000) {
                    return true;
                }
                return false;
            });
            
            console.log("======= Group", groupId, "online users ==========", onlineUsers.length);
            console.log("Authenticated members:", onlineUsers.filter(u => u.ID < 100000).map(u => u.ID));
            console.log("Anonymous users:", onlineUsers.filter(u => u.ID > 100000).map(u => u.ID));
            
            // Return all online user IDs (both authenticated and anonymous)
            socket.emit(chatCode.GET_GROUP_ONLINE_USERS, onlineUsers?.map(u => u.ID))
        } catch (error) {
            console.error("Error getting group online users:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.GET_BANNED_USERS, async (data) => {
        if (!data.groupId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.GET_BANNED_USERS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId } = data;

            console.log(`Getting banned users for group ${groupId} requested by user ${senderId}`);

            // Get the group with all members to find banned users
            const group = await Controller.getGroup(groupId);
            if (!group || !group.members) {
                console.log(`No group data or members found for group ${groupId}`);
                socket.emit(chatCode.GET_BANNED_USERS, []);
                return;
            }

            console.log(`Group ${groupId} has ${group.members.length} total members`);
            console.log(`Sample member data:`, group.members[0]);

            // Filter banned users
            const bannedUsers = group.members.filter(member => member.banned === 1);
            console.log(`Found ${bannedUsers.length} banned users in group ${groupId}`);
            
            if (bannedUsers.length > 0) {
                console.log(`Banned users:`, bannedUsers.map(u => ({ id: u.id, name: u.name, banned: u.banned })));
            }

            socket.emit(chatCode.GET_BANNED_USERS, bannedUsers);
        } catch (error) {
            console.error("Error getting banned users:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.GET_IP_BANS, async (data) => {
        if (!data.groupId || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.GET_IP_BANS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId } = data;

            console.log(`Getting IP bans for group ${groupId} requested by user ${senderId}`);

            // Get IP bans from the database
            const ipBans = await Controller.getIpBans(groupId);
            console.log(`Found ${ipBans.length} IP bans in group ${groupId}`);

            socket.emit(chatCode.GET_IP_BANS, ipBans);
        } catch (error) {
            console.error("Error getting IP bans:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.UNBAN_GROUP_IPS, async (data) => {
        if (!data.groupId || !data.token || !data.ipAddresses) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.UNBAN_GROUP_IPS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { groupId, ipAddresses } = data;

            // Only Group Master (creator) can unban IPs
            const groupInfo = await Controller.getGroup(groupId);
            if (!groupInfo || groupInfo.creater_id !== senderId) {
                console.log(`IP unban attempt blocked: User ${senderId} is not the group master of group ${groupId} (creator: ${groupInfo?.creater_id})`);
                socket.emit(chatCode.FORBIDDEN, "Only the group creator can unban IP addresses");
                return;
            }

            console.log(`IP unban request: Group Master ${senderId} unbanning IPs ${ipAddresses} in group ${groupId}`);

            // Unban IPs
            await Controller.unbanGroupIps(groupId, ipAddresses);

            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);

            const group = await Controller.getGroup(groupId);
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.UNBAN_GROUP_IPS, ipAddresses);
                        receiverSocket.emit(chatCode.GROUP_UPDATED, group);
                    }
                });
            }

            console.log(`IP unban completed successfully for IPs ${ipAddresses} by ${senderId}`);
        } catch (error) {
            console.error("Error unbanning IPs:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.JOIN_TO_GROUP_ANON, async (data) => {
        if (!data.groupId || !data.anonId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        try {
            const { anonId, groupId } = data;

                    // Check if IP is banned from this group (anonymous users only need IP check)
        const clientIp = getClientIpAddress(socket);
        console.log(`🔍 [IP-BAN-CHECK] [ANON-JOIN] Checking IP ban for anonymous join: IP ${clientIp}, group: ${groupId}`);
        const ipBanCheck = await Controller.checkIpBan(groupId, clientIp);
        console.log(`🔍 [IP-BAN-CHECK] [ANON-JOIN] Result: ${ipBanCheck ? 'BANNED' : 'NOT BANNED'}`);
        
        if (ipBanCheck) {
            console.log(`🚫 Anonymous join attempt blocked: IP ${clientIp} is banned from group ${groupId}`);
            socket.emit(chatCode.FORBIDDEN, "Your IP address is banned from this group");
            return;
        }

            console.log(`✅ Anonymous user ${anonId} authorized to join group ${groupId} (IP: ${clientIp})`);

            // Add anonymous user to users list
            if (!users.find(user => user.ID == anonId)) {
                users.push({ ID: anonId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Join socket room for better message broadcasting
            try {
                socket.join(`group_${groupId}`);
                console.log(`🔗 Anonymous user ${anonId} joined socket room: group_${groupId}`);
            } catch (error) {
                console.log(`🔗 Failed to join socket room for anonymous user ${anonId}:`, error.message);
            }

            // Get group info
            const group = await Controller.getGroup(groupId);
            socket.emit(chatCode.GROUP_UPDATED, group);
            socket.emit(chatCode.JOIN_TO_GROUP_ANON, { success: true, groupId, anonId });

            console.log(`✅ Anonymous user ${anonId} successfully joined group ${groupId}`);

        } catch (error) {
            console.error("Error joining group as anonymous user:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on('DEBUG_IP_BAN', async (data) => {
        if (!data.groupId || !data.ipAddress || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, 'DEBUG_IP_BAN');
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        
        try {
            const senderId = verifyUser(data.token);
            console.log(`🔍 DEBUG: Checking IP ban status for ${data.ipAddress} in group ${data.groupId} by user ${senderId}`);
            
            const debugInfo = await Controller.debugIpBanStatus(data.groupId, data.ipAddress);
            const isCurrentlyBanned = await Controller.checkIpBan(data.groupId, data.ipAddress);
            
            const result = {
                ipAddress: data.ipAddress,
                groupId: data.groupId,
                isCurrentlyBanned,
                debugInfo
            };
            
            console.log(`🔍 DEBUG RESULT:`, result);
            socket.emit('DEBUG_IP_BAN_RESULT', result);
        } catch (error) {
            console.error("Error debugging IP ban:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.JOIN_TO_GROUP, async (data) => {
        if (!data.groupId || !data.userId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        const res = isExpired(socket, data, chatCode.JOIN_TO_GROUP);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const {userId, groupId} = data;

            // Check if user is banned from this group
            const banCheck = await Controller.checkUserBan(groupId, userId);
            if (banCheck) {
                console.log(`Join attempt blocked: User ${userId} is banned from group ${groupId}`);
                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                return;
            }

            // Check if user's IP is banned from this group
            const clientIp = getClientIpAddress(socket);
            const ipBanCheck = await Controller.checkIpBan(groupId, clientIp);
            if (ipBanCheck) {
                console.log(`Join attempt blocked: IP ${clientIp} is banned from group ${groupId}`);
                socket.emit(chatCode.FORBIDDEN, "Your IP address is banned from this group");
                return;
            }

            console.log(`✅ User ${userId} authorized to join group ${groupId} (IP: ${clientIp})`);

            // Check if user is timed out (for notification purposes, not blocking join)
            const groupInfo = await Controller.getGroup(groupId);
            const isGroupCreator = groupInfo && groupInfo.creater_id === userId;
            
            if (!isGroupCreator) {
                const userTimeoutCheck = await Controller.checkUserTimeout(groupId, userId);
                if (userTimeoutCheck.isTimedOut) {
                    console.log(`⏰ [JOIN] User ${userId} is timed out until ${userTimeoutCheck.expiresAt}`);
                    // Send timeout notification immediately on join
                    socket.emit(chatCode.USER_TIMEOUT_NOTIFICATION, {
                        groupId: groupId,
                        timeoutMinutes: 15,
                        message: `You are temporarily restricted from sending messages for 15 minutes.`,
                        expiresAt: new Date(userTimeoutCheck.expiresAt).toISOString()
                    });
                    console.log(`📢 [JOIN] Timeout notification sent to user ${userId} on group join`);
                }
            }

            // Add user to users list if not already present for real-time messaging
            if (!users.find(user => user.ID == userId)) {
                console.log(`🔗 Adding user ${userId} to socket tracking for real-time messages`);
                users.push({ ID: userId, Socket: socket.id });
                sockets[socket.id] = socket;
            } else {
                console.log(`🔗 User ${userId} already in socket tracking, updating socket ID`);
                // Update socket ID in case user reconnected
                const existingUser = users.find(user => user.ID == userId);
                if (existingUser) {
                    existingUser.Socket = socket.id;
                    sockets[socket.id] = socket;
                }
            }
            
            // Join socket room for better message broadcasting
            try {
                socket.join(`group_${groupId}`);
                console.log(`🔗 User ${userId} joined socket room: group_${groupId}`);
            } catch (error) {
                console.log(`🔗 Failed to join socket room for user ${userId}:`, error.message);
            }

            // Save message to the database
            await Controller.joinToGroup(groupId, userId);
            // Find the receiver's and sender's socket IDs
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user
            const group = await Controller.getGroup(groupId); 
            const groups = await Controller.getFavGroups(userId);
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.GROUP_UPDATED, group);
                    }
                });                
            }
            // const sender = users.find(user => user.ID === senderId);
            // const senderSocketId = sender?.Socket;
            // const senderSocket = sockets[senderSocketId];
            //  // Retrieve message list for the user            
            socket.emit(chatCode.GET_FAV_GROUPS, groups);

        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });
    
    // Periodic cleanup of stale socket connections (run once per socket handler setup)
    if (!global.socketCleanupStarted) {
        global.socketCleanupStarted = true;
        setInterval(() => {
            const beforeCount = users.length;
            const validUsers = [];
            
            users.forEach(user => {
                const socket = sockets[user.Socket];
                if (socket && socket.connected) {
                    validUsers.push(user);
                } else {
                    // Remove stale socket
                    delete sockets[user.Socket];
                    console.log(`🧹 Cleaned up stale socket for user ${user.ID}`);
                }
            });
            
            users.length = 0;
            users.push(...validUsers);
            
            if (beforeCount !== users.length) {
                console.log(`🧹 Socket cleanup: ${beforeCount} -> ${users.length} active connections`);
            }
        }, 30000); // Clean up every 30 seconds
        
        console.log("🧹 Socket cleanup service started");
    }
};