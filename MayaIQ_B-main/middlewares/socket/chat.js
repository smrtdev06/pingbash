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

            if (receiverSocket) {
                receiverSocket.emit(chatCode.SEND_MSG, msgList);
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
            // Get user's IP address
            const clientIp = socket.handshake.address || 
                            socket.handshake.headers['x-forwarded-for'] || 
                            socket.handshake.headers['x-real-ip'] ||
                            socket.request.connection.remoteAddress;

            // Check if IP is banned from this group
            const isIpBanned = await Controller.checkIpBan(data.groupId, clientIp);
            if (isIpBanned) {
                console.log(`IP ${clientIp} is banned from group ${data.groupId} - message blocked`);
                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                return;
            }

            // Get sender ID from the token
            const senderId = verifyUser(data.token);
            const { msg: content, groupId, receiverId } = data;

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.saveGroupMsg(senderId, content, groupId, receiverId, data.parent_id);
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            // const sender = users.find(user => user.ID === senderId);
            
            // const senderSocketId = sender?.Socket;
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);

            // const senderSocket = sockets[senderSocketId];
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);

            // Retrieve message list for the user
            const msgList = await Controller.getGroupMsg(groupId);
            // if (senderSocket) {
            //     console.log("=== Sent To sender =====");
            //     senderSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
            // }
            console.log("======receiverIds =======", receiverIds)
            console.log("======= users ==========", users)
            console.log("======= receiverSocketIds =======", receiverSocketIds)
            if (receiverSockets && receiverSockets.length > 0) {
                
                receiverSockets.map(receiverSocket => {
                    receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                    receiverSocket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID));
                });
            }
            socket.emit(chatCode.SEND_GROUP_MSG, msgList);
            socket.emit(chatCode.GET_GROUP_ONLINE_USERS, receiveUsers?.map(u => u.ID))
        } catch (error) {
            socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
        }
    });

    socket.on(chatCode.SEND_GROUP_MSG_ANON, async (data) => {  
        if (!data.groupId || !data.msg || !data.anonId) {
            socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            return;
        }
        try {
            // Get user's IP address
            const clientIp = socket.handshake.address || 
                            socket.handshake.headers['x-forwarded-for'] || 
                            socket.handshake.headers['x-real-ip'] ||
                            socket.request.connection.remoteAddress;

            // Check if IP is banned from this group
            const isIpBanned = await Controller.checkIpBan(data.groupId, clientIp);
            if (isIpBanned) {
                console.log(`IP ${clientIp} is banned from group ${data.groupId} - anonymous message blocked`);
                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                return;
            }
            
            // Get sender ID from the token
            const { anonId, msg: content, groupId, receiverId } = data;
            console.log("== Anon Id ===", anonId)
            if (!users.find(user => user.ID == anonId)) {
                users.push({ ID: anonId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.saveGroupMsg(anonId, content, groupId, receiverId, data.parent_id);
            const receiverIds = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receiverIds.find(recId => recId == user.ID));
            // const sender = users.find(user => user.ID === senderId);
            
            // const senderSocketId = sender?.Socket;
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);

            // const senderSocket = sockets[senderSocketId];
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);

            // Retrieve message list for the user
            const msgList = await Controller.getGroupMsg(groupId);
            // if (senderSocket) {
            //     console.log("=== Sent To sender =====");
            //     senderSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
            // }
            console.log("======receiverIds =======", receiverIds)
            console.log("======= users ==========", users)
            console.log("======= receiverSocketIds =======", receiverSocketIds)
            if (receiverSockets && receiverSockets.length > 0) {
                
                receiverSockets.map(receiverSocket => {
                    receiverSocket && receiverSocket.emit(chatCode.SEND_GROUP_MSG, msgList);
                });
            }
            socket.emit(chatCode.SEND_GROUP_MSG, msgList);
        } catch (error) {
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
                    bannedUserIp = bannedSocket.handshake.address || 
                                  bannedSocket.handshake.headers['x-forwarded-for'] || 
                                  bannedSocket.handshake.headers['x-real-ip'] ||
                                  bannedSocket.request.connection.remoteAddress;
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

            console.log(`Unban request: User ${senderId} unbanning user ${userId} in group ${groupId}`);

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

            if (!users.find(user => user.ID == senderId)) {
                users.push({ ID: senderId, Socket: socket.id });
                sockets[socket.id] = socket;
            }
            // Save message to the database
            await Controller.timoutUser(groupId, userId);
            const receivers = await Controller.getReceiverIdsOfGroup(groupId);
            // Find the receiver's and sender's socket IDs
            const receiveUsers = users.filter(user => receivers.find(receiverId => receiverId == user.ID));
            // const sender = users.find(user => user.ID === senderId);
            
            // const senderSocketId = sender?.Socket;
            const receiverSocketIds = receiveUsers.map(user => user?.Socket);

            // const senderSocket = sockets[senderSocketId];
            const receiverSockets = receiverSocketIds.map(socketId => sockets[socketId]);
            // Retrieve message list for the user
            // const msgList = await Controller.getGroupMsg(groupId);
            // if (senderSocket) {
            //     senderSocket.emit(chatCode.BAN_GROUP_USER, userId);
            // }
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
                socket.emit(chatCode.GET_BANNED_USERS, []);
                return;
            }

            // Filter banned users
            const bannedUsers = group.members.filter(member => member.banned === 1);
            console.log(`Found ${bannedUsers.length} banned users in group ${groupId}`);

            socket.emit(chatCode.GET_BANNED_USERS, bannedUsers);
        } catch (error) {
            console.error("Error getting banned users:", error);
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