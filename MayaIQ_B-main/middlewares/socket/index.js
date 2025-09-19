/**
 * @author
 * @published June 9, 2024
 * @description
 **  index for Chat function
 */
// Import necessary modules and dependencies
const chatCode = require("../../libs/chatCode");
const httpCode = require("../../libs/httpCode");
const socketIo = require("socket.io");
const jwt = require('jsonwebtoken');
const { isExpired } = require("./method");
const Controller = require("./controller.js");
const chatSocket = require("./chat");
const { users, sockets } = require("../../libs/global.js");

// Export the function responsible for setting up the chat server
module.exports = async (http) => {
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

    // Function to verify user token and extract user ID
    const verifyUser = (token) => {
        try {
            // Check if token exists and is not empty
            if (!token || token.trim() === '') {
                console.error("❌ Token verification failed: Token is null, undefined, or empty");
                throw new Error("Token is missing");
            }

            // Check if token is an anonymous token
            if (typeof token === 'string' && token.startsWith('anon')) {
                console.log("🔍 Anonymous token detected:", token.substring(0, 10) + "...");
                // Extract user ID from anonymous token (format: "anonUSER_ID")
                const anonUserId = token.replace('anon', '');
                if (anonUserId && !isNaN(anonUserId)) {
                    return parseInt(anonUserId);
                } else {
                    console.error("❌ Invalid anonymous token format:", token);
                    throw new Error("Invalid anonymous token");
                }
            }

            // Check if token looks like a JWT (has 3 parts separated by dots)
            if (typeof token === 'string' && token.split('.').length !== 3) {
                console.error("❌ Token verification failed: Token is not a valid JWT format");
                console.error("❌ Token received:", token.substring(0, 50) + "...");
                throw new Error("Malformed JWT token");
            }

            // Verify JWT token
            const { id } = jwt.verify(token, process.env.JWT_SECRET);
            console.log("✅ JWT token verified successfully for user:", id);
            return id;
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                console.error("❌ JWT Error:", error.message);
                console.error("❌ Token that failed:", token ? token.substring(0, 50) + "..." : "null/undefined");
            } else if (error.name === 'TokenExpiredError') {
                console.error("❌ JWT Token expired:", error.message);
            } else {
                console.error("❌ Token verification error:", error.message);
            }
            throw new Error("Invalid token: " + error.message);
        }
    };

    // Initialize Socket.IO with HTTP server
    const io = socketIo(http, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Socket.IO event handlers
    io.on('connection', (socket) => {
        console.log("A user connected");

        // Emit REFRESH event to the connected socket
        socket.emit(chatCode.REFRESH);

        // Attach chatSocket event handlers to the socket
        chatSocket(socket, users);

        // Event handler to fetch user list for chat
        socket.on(chatCode.GET_USERS, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_USERS);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Retrieve user list for chat
                        const chatList = await Controller.getUsers(loggedId);

                        // Assign socket IDs to users in the chat list
                        chatList.forEach(chat => {
                            chat["Socket"] = users.find(user => user.ID === chat.Opposite_Id)?.Socket || null;
                        });

                        // Emit GET_USERS event with chat list to the socket
                        socket.emit(chatCode.GET_USERS, chatList);
                    } catch (error) {
                        console.error("Error getting users:", error);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch friend users
        socket.on(chatCode.GET_FRIEND_USERS, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_FRIEND_USERS);
                if (!res.expired) {
                    try {
                        const loggedId = verifyUser(data.token);
                        const friends = await Controller.getFriends(loggedId);
                        
                        // Assign socket IDs to friends
                        friends.forEach(friend => {
                            friend["Socket"] = users.find(user => user.ID === friend.Opposite_Id)?.Socket || null;
                        });
                        
                        socket.emit(chatCode.GET_FRIEND_USERS, friends);
                    } catch (error) {
                        console.error("Error getting friends:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to search users
        socket.on(chatCode.GET_SEARCH_USERS, async (data) => {
            if (!data.token || !data.search) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_SEARCH_USERS);
                if (!res.expired) {
                    try {
                        const searchResults = await Controller.getSearchUsers(data.search);
                        
                        // Assign socket IDs to search results
                        searchResults.forEach(user => {
                            user["Socket"] = users.find(u => u.ID === user.Opposite_Id)?.Socket || null;
                        });
                        
                        socket.emit(chatCode.GET_SEARCH_USERS, searchResults);
                    } catch (error) {
                        console.error("Error searching users:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to get chat rules for a group
        socket.on(chatCode.GET_CHAT_RULES, async (data) => {
            if (!data.token || !data.groupId) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_CHAT_RULES);
                if (!res.expired) {
                    try {
                        const chatRules = await Controller.getChatRules(data.groupId);
                        if (chatRules) {
                            socket.emit(chatCode.GET_CHAT_RULES, {
                                chatRules: chatRules.chat_rules || '',
                                showChatRules: chatRules.show_chat_rules || false,
                                isCreator: chatRules.creater_id === res.user?.id
                            });
                        } else {
                            socket.emit(chatCode.GET_CHAT_RULES, {
                                chatRules: '',
                                showChatRules: false,
                                isCreator: false
                            });
                        }
                    } catch (error) {
                        console.error("Error getting chat rules:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to update chat rules for a group
        socket.on(chatCode.UPDATE_CHAT_RULES, async (data) => {
            if (!data.token || !data.groupId) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.UPDATE_CHAT_RULES);
                if (!res.expired) {
                    try {
                        console.log("UPDATE_CHAT_RULES - User ID:", res.user?.id);
                        const result = await Controller.updateChatRules(
                            data.groupId, 
                            data.chatRules, 
                            data.showChatRules, 
                            res.user?.id
                        );
                        
                        if (result.success) {
                            // Emit to the sender
                            socket.emit(chatCode.UPDATE_CHAT_RULES, {
                                success: true,
                                chatRules: result.chatRules,
                                showChatRules: result.showChatRules
                            });
                            
                            // Broadcast to all users in the group
                            socket.broadcast.emit(chatCode.UPDATE_CHAT_RULES, {
                                groupId: data.groupId,
                                chatRules: result.chatRules,
                                showChatRules: result.showChatRules
                            });
                        } else {
                            console.log("UPDATE_CHAT_RULES failed:", result.error);
                            socket.emit(chatCode.FORBIDDEN, result.error);
                        }
                    } catch (error) {
                        console.error("Error updating chat rules:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch messages for a specific user
        socket.on(chatCode.GET_MSG, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_MSG);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Retrieve message list for the user
                        const msgList = await Controller.getMsg(loggedId, data.target);

                        // Emit GET_MSG event with message list to the socket
                        socket.emit(chatCode.GET_MSG, msgList);
                    } catch (error) {
                        console.error("Error getting messages:", error);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch chat history for a user
        socket.on(chatCode.GET_HISTORY, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_HISTORY);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Retrieve chat history for the user
                        const historyList = await Controller.getHistory(loggedId, data.target, data.limit);

                        // Emit GET_HISTORY event with history list to the socket
                        socket.emit(chatCode.GET_HISTORY, historyList);
                    } catch (error) {
                        console.error("Error getting chat history:", error);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler for user login
        socket.on(chatCode.USER_LOGGED, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.USER_LOGGED);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Find user position in the users array
                        const loggedUserPos = users.findIndex(user => user.ID === loggedId);

                        // Update or add user to the users array
                        if (loggedUserPos === -1) {
                            users.push({ ID: loggedId, Socket: socket.id });
                        } else {
                            users[loggedUserPos].Socket = socket.id;
                        }

                        // Add socket to the sockets object
                        sockets[socket.id] = socket;

                        // Broadcast USER_LOGGED event with user ID and socket ID
                        socket.broadcast.emit(chatCode.LOGGED_NEW_USER, { ID: loggedId, Socket: socket.id });
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler for message read
        socket.on(chatCode.READ_MSG, async (data) => {
            if (!data.token || !data.id) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.READ_MSG);
                if (!res.expired) {
                    try {
                        const receiver = verifyUser(data.token);

                        await Controller.readMSG(data.id, receiver);
                        // Emit REFRESH event to the connected socket
                        socket.emit(chatCode.REFRESH);
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch user's created groups
        socket.on(chatCode.GET_MY_GROUPS, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_MY_GROUPS);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Retrieve user's created groups
                        const myGroups = await Controller.getMyGroups(loggedId);

                        // Emit GET_MY_GROUPS event with groups list to the socket
                        socket.emit(chatCode.GET_MY_GROUPS, myGroups);
                    } catch (error) {
                        console.error("Error getting my groups:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch user's favorite groups
        socket.on(chatCode.GET_FAV_GROUPS, async (data) => {
            if (!data.token) {
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_FAV_GROUPS);
                if (!res.expired) {
                    try {
                        // Verify user token and extract user ID
                        const loggedId = verifyUser(data.token);

                        // Retrieve user's favorite groups
                        const favGroups = await Controller.getFavGroups(loggedId);

                        // Emit GET_FAV_GROUPS event with groups list to the socket
                        socket.emit(chatCode.GET_FAV_GROUPS, favGroups);
                    } catch (error) {
                        console.error("Error getting favorite groups:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler to fetch group messages
        socket.on(chatCode.GET_GROUP_MSG, async (data) => {
            console.log("🔍 GET_GROUP_MSG received - Token exists:", !!data.token, "Group ID:", data.groupId);
            
            if (!data.token || !data.groupId) {
                console.error("❌ GET_GROUP_MSG: Missing token or groupId");
                socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN);
            } else {
                const res = isExpired(socket, data, chatCode.GET_GROUP_MSG);
                if (!res.expired) {
                    try {
                        console.log("🔍 Attempting to verify token for GET_GROUP_MSG...");
                        // Verify user token and extract user ID first
                        const loggedId = verifyUser(data.token);
                        console.log("✅ Token verified successfully, user ID:", loggedId);

                        // Get user's IP address using improved detection
                        const clientIp = getClientIpAddress(socket);

                        // Get group info to check if user is the creator
                        const group = await Controller.getGroup(data.groupId);
                        const isGroupCreator = group && group.creater_id === loggedId;

                        // Check if IP is banned from this group (but skip for group creators)
                        if (!isGroupCreator) {
                            const isIpBanned = await Controller.checkIpBan(data.groupId, clientIp);
                            if (isIpBanned) {
                                console.log(`🚫 IP BAN BLOCKING ACCESS: IP ${clientIp} is banned from group ${data.groupId}`);
                                console.log(`🚫 User ID: ${loggedId}, Group ID: ${data.groupId}`);
                                socket.emit(chatCode.FORBIDDEN, "You are banned from this group");
                                return;
                            }
                        } else {
                            console.log(`👑 Group creator ${loggedId} accessing group ${data.groupId} - IP ban check skipped`);
                        }

                        // Check if user is timed out (for notification purposes, not blocking)
                        let timeoutStatus = null;
                        if (!isGroupCreator) {
                            const userTimeoutCheck = await Controller.checkUserTimeout(data.groupId, loggedId);
                            if (userTimeoutCheck.isTimedOut) {
                                timeoutStatus = {
                                    isTimedOut: true,
                                    expiresAt: userTimeoutCheck.expiresAt,
                                    timeoutMinutes: 15
                                };
                                console.log(`⏰ [GET_MSG] User ${loggedId} is timed out until ${userTimeoutCheck.expiresAt}`);
                            }
                        }

                        // Retrieve group messages
                        const groupMessages = await Controller.getGroupMsg(data.groupId);

                        // Also send updated group data to ensure timeout status is current
                        const updatedGroup = await Controller.getGroup(data.groupId);
                        if (updatedGroup) {
                            socket.emit(chatCode.GROUP_UPDATED, updatedGroup);
                            console.log(`🔄 [GET_MSG] Updated group data sent to user ${loggedId} for group ${data.groupId}`);
                        }

                        // Emit GET_GROUP_MSG event with messages list to the socket
                        socket.emit(chatCode.GET_GROUP_MSG, groupMessages);
                        
                        // If user is timed out, send timeout notification
                        if (timeoutStatus) {
                            socket.emit(chatCode.USER_TIMEOUT_NOTIFICATION, {
                                groupId: data.groupId,
                                timeoutMinutes: timeoutStatus.timeoutMinutes,
                                message: `You are temporarily restricted from sending messages for ${timeoutStatus.timeoutMinutes} minutes.`,
                                expiresAt: new Date(timeoutStatus.expiresAt).toISOString()
                            });
                            console.log(`📢 [GET_MSG] Timeout notification sent to user ${loggedId} on message load`);
                        }
                    } catch (error) {
                        console.error("Error getting group messages:", error);
                        socket.emit(chatCode.SERVER_ERROR, httpCode.SERVER_ERROR);
                    }
                } else {
                    socket.emit(chatCode.EXPIRED);
                }
            }
        });

        // Event handler for user logout
        socket.on(chatCode.USER_OUT, (data) => {
            try {
                console.log('User logged out:', data);

                // Find and remove user from the users array
                const loggedOutUserPos = users.findIndex(user => user.Socket === socket.id);

                if (loggedOutUserPos !== -1) {
                    const ID = users[loggedOutUserPos].ID;
                    users.splice(loggedOutUserPos, 1);

                    // Remove socket from the sockets object
                    delete sockets[socket.id];

                    // Broadcast USER_OUT event with logged out user's ID
                    socket.broadcast.emit(chatCode.USER_OUT, { ID });
                    console.log(`📤 User ${ID} logged out and removed from online users`);
                }
            } catch (error) {
                console.error('Error handling user logout:', error);
            }
        });

        // Event handler for socket disconnection
        socket.on(chatCode.DISCONNECT, () => {
            try {
                console.log('Client disconnected');

                // Find and remove user from the users array
                const disconnectedUserPos = users.findIndex(user => user.Socket === socket.id);

                if (disconnectedUserPos !== -1) {
                    const ID = users[disconnectedUserPos].ID;
                    users.splice(disconnectedUserPos, 1);

                    // Remove socket from the sockets object
                    delete sockets[socket.id];

                    // Broadcast USER_OUT event with disconnected user's ID
                    socket.broadcast.emit(chatCode.USER_OUT, { ID });
                    console.log(`📤 User ${ID} disconnected and removed from online users`);
                }
            } catch (error) {
                console.error('Error handling socket disconnect:', error);
            }
        });
    });
};