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
    socket.on(chatCode.SEND_MSG, async (data) => {
        if (!data.to || !data.msg || !data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.SEND_MSG);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }

        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { msg: content, to: receiverId, parent_id } = data;

            // Save message to the database
            await Controller.saveMsg(senderId, content, receiverId, parent_id);

            // Find the receiver's and sender's socket IDs
            const receiver = users.find(user => user.ID === receiverId);
            const sender = users.find(user => user.ID === senderId);

            const senderSocketId = sender?.Socket;
            const receiverSocketId = receiver?.Socket;

            const senderSocket = sockets[senderSocketId];
            const receiverSocket = sockets[receiverSocketId];

            // Retrieve message list for the user
            const msgList = await Controller.getMsg(senderId, receiverId);

            if (senderSocket) {
                senderSocket.emit(chatCode.SEND_MSG, msgList);
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
                    console.error("Failed to send email notification:", error);
                }
            }
        } catch (error) {
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
                const isIpBanned = await Controller.checkIpBan(groupId, clientIp);
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
            
            // Save message to the database
            await Controller.saveGroupMsg(senderId, content, groupId, receiverId, data.parent_id);
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            
            // Find the receiver's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]).filter(socket => socket);

            // Retrieve message list for the user
            const msgList = await Controller.getGroupMsg(groupId);
            
            console.log("======receiverIds =======", receiverIds);
            console.log("======= users ==========", users.length);
            console.log("======= receiverSocketIds =======", receiverSocketIds);
            
            // Send message to all receivers
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                        receiverSocket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID));
                    }
                });
            }
            
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
        if (!data.groupId || !data.msg || !data.anonId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        try {
            const { anonId, msg: content, groupId, receiverId } = data;
            console.log("== Anon Id ===", anonId);
            
            // Get user's IP address using improved detection
            const clientIp = getClientIpAddress(socket);
            console.log(`🔍 Anonymous user ${anonId} sending message from IP ${clientIp} to group ${groupId}`);

            // Check if IP is banned from this group
            const isIpBanned = await Controller.checkIpBan(groupId, clientIp);
            if (isIpBanned) {
                console.log(`🚫 IP BAN BLOCKING ANON MESSAGE: IP ${clientIp} is banned from group ${groupId}`);
                console.log(`🚫 Anonymous user trying to send message: ${anonId}`);
                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                return;
            }

            // Check if IP is timed out from this group
            const ipTimeoutCheck = await Controller.checkIpTimeout(groupId, clientIp);
            if (ipTimeoutCheck.isTimedOut) {
                console.log(`⏰ IP TIMEOUT BLOCKING ANON MESSAGE: IP ${clientIp} is timed out from group ${groupId} until ${ipTimeoutCheck.expiresAt}`);
                socket.emit(chatCode.FORBIDDEN, `You are temporarily restricted from sending messages. Restriction expires at ${new Date(ipTimeoutCheck.expiresAt).toLocaleString()}`);
                return;
            }
            
            // Add user to users list if not already present
            if (!users.find(user => user.ID == anonId)) {
                users.push({ ID: anonId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Save message to the database
            await Controller.saveGroupMsg(anonId, content, groupId, receiverId, data.parent_id);
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            
            // Find the receiver's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]).filter(socket => socket);

            // Retrieve message list for the user
            const msgList = await Controller.getGroupMsg(groupId);
            
            console.log("======receiverIds =======", receiverIds);
            console.log("======= users ==========", users.length);
            console.log("======= receiverSocketIds =======", receiverSocketIds);
            
            // Send message to all receivers
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                    }
                });
            }
            
            // Send message back to sender
            socket.emit(chatCode.SEND_GROUP_MSG, msgList);
            console.log(`✅ Anonymous message sent successfully by ${anonId} to group ${groupId}`);
            
        } catch (error) {
            console.error("Error sending anonymous group message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
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
            const bannedUserSocket = users.find(user => user.ID == userId);
            let bannedUserIp = null;
            
            if (bannedUserSocket) {
                const bannedSocket = sockets[bannedUserSocket.Socket];
                if (bannedSocket) {
                    // Try multiple methods to get the real client IP
                    bannedUserIp = getClientIpAddress(bannedSocket);
                }
            }

            console.log(`Ban request: User ${senderId} banning user ${userId} (IP: ${bannedUserIp}) in group ${groupId}`);

            // RULE 2 & 3: Both verified and anonymous users should be banned by IP
            // Anonymous users especially need IP bans since they don't have persistent accounts
            if (bannedUserIp) {
                console.log(`Banning user ${userId} and IP ${bannedUserIp}`);
                await Controller.banGroupUserWithIp(groupId, userId, bannedUserIp, senderId);
            } else {
                // Fallback: ban only user ID if IP is not available
                console.log(`Banning user ${userId} only (IP not available)`);
                await Controller.banGroupUser(groupId, userId);
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

            console.log(`Unban request: Group Master ${senderId} unbanning user ${userId} in group ${groupId}`);

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Unban user (includes both group_users and ip_bans tables)
            await Controller.unbanGroupUser(groupId, userId);
            
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

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            
            // Check if this is an anonymous user by checking token format
            const isAnonymousUser = data.token && data.token.includes('anonuser');
            
            if (isAnonymousUser) {
                // For anonymous users, apply IP-based timeout
                const timeoutUser = users.find(user => user.ID == userId);
                if (timeoutUser) {
                    const timeoutSocket = sockets[timeoutUser.Socket];
                    if (timeoutSocket) {
                        const clientIp = getClientIpAddress(timeoutSocket);
                        await Controller.timeoutIpAddress(groupId, clientIp, senderId);
                        console.log(`⏰ Anonymous user ${userId} (IP: ${clientIp}) timed out in group ${groupId} by ${senderId} for ${chatCode.TIMEOUT_MINS} minutes`);
                        
                        // Send notification to the timed out anonymous user
                        timeoutSocket.emit(chatCode.USER_TIMEOUT_NOTIFICATION, { 
                            groupId, 
                            timeoutMinutes: chatCode.TIMEOUT_MINS,
                            message: `You have been temporarily restricted from sending messages for ${chatCode.TIMEOUT_MINS} minutes.`,
                            expiresAt: new Date(Date.now() + chatCode.TIMEOUT_MINS * 60 * 1000).toISOString()
                        });
                        console.log(`📢 Timeout notification sent to anonymous user ${userId} (IP: ${clientIp})`);
                    }
                }
            } else {
                // For verified users, apply user-based timeout
                await Controller.timeoutUser(groupId, userId);
                console.log(`⏰ User ${userId} timed out in group ${groupId} by ${senderId} for ${chatCode.TIMEOUT_MINS} minutes`);
                
                // Send notification to the timed out user
                const timeoutUser = users.find(user => user.ID == userId);
                if (timeoutUser) {
                    const timeoutSocket = sockets[timeoutUser.Socket];
                    if (timeoutSocket) {
                        timeoutSocket.emit(chatCode.USER_TIMEOUT_NOTIFICATION, { 
                            groupId, 
                            timeoutMinutes: chatCode.TIMEOUT_MINS,
                            message: `You have been temporarily restricted from sending messages for ${chatCode.TIMEOUT_MINS} minutes.`,
                            expiresAt: new Date(Date.now() + chatCode.TIMEOUT_MINS * 60 * 1000).toISOString()
                        });
                        console.log(`📢 Timeout notification sent to user ${userId}`);
                    }
                }
            }
            
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers.find(receiverId => receiverId == user.ID));
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            
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
            await Controller.pinChatMessage(msgId, groupId, senderId);
            const msgIds = await Controller.getPinnedMsgInfo(groupId);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers?.find(receiverId => receiverId == user.ID));
            
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);            
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user         
            
            if (receiverSockets && receiverSockets.length > 0) {
                // console.log("==receiverSocketIds ===>", receiverSocketIds);
                receiverSockets.forEach(receiverSocket => {
                    if (receiverSocket && typeof receiverSocket.emit === 'function') {
                        receiverSocket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
                    }
                });                
            }
            socket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
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
            
            if (receiverSockets && receiverSockets.length > 0) {
                receiverSockets.map(receiverSocket => {
                    if (receiverSocket) {
                        receiverSocket.emit(chatCode.GET_PINNED_MESSAGES, msgIds)
                    }                    
                });                
            }
            // socket.emit(chatCode.GET_PINNED_MESSAGES, msgIds);
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
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
        if (!data.token) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }

        const res = isExpired(socket, data, chatCode.GET_GROUP_ONLINE_USERS);
        if (res.expired) {
            socket.emit(chatCode.EXPIRED);
            return;
        }
        try {
            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { 
                groupId
            } = data;
            // Save message to the database
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            
            console.log("======= users ==========", receiveUsers)
            socket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID))
        } catch (error) {
            console.error("Error sending message:", error);
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
            const ipBanCheck = await Controller.checkIpBan(groupId, clientIp);
            if (ipBanCheck) {
                console.log(`Anonymous join attempt blocked: IP ${clientIp} is banned from group ${groupId}`);
                socket.emit(chatCode.FORBIDDEN, "Your IP address is banned from this group");
                return;
            }

            console.log(`✅ Anonymous user ${anonId} authorized to join group ${groupId} (IP: ${clientIp})`);

            // Add anonymous user to users list
            if (!users.find(user => user.ID == anonId)) {
                users.push({ ID: anonId, Socket: socket.id });
                sockets[socket.id] = socket;
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
};