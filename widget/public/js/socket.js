/**
 * SOCKET functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add socket methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

    // EXACT COPY from widget.js - loadSocketIO method
    async loadSocketIO() {
      if (window.io) {
        console.log('🔌 Socket.IO already loaded');
        return;
      }

      console.log('📥 Loading Socket.IO...');
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
        script.onload = () => {
          console.log('✅ Socket.IO loaded');
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    // EXACT COPY from widget.js - initializeSocket method
    initializeSocket() {
      console.log('🔌 Connecting to:', this.config.apiUrl);

      // Use exact same configuration as W version
      this.socket = io(this.config.apiUrl);

      // Add the same debugging as W version
      this.socket.on('connect', () => {
        console.log('🔍 [Widget] Socket connected successfully!', this.socket.id);
        this.isConnected = true;
        this.updateConnectionStatus(true);
        this.joinGroup();

        // Request online users after connecting
        setTimeout(() => {
          this.requestOnlineUsers();

          // Set up periodic refresh of online users (every 60 seconds like F version)
          if (this.onlineUsersInterval) {
            clearInterval(this.onlineUsersInterval);
          }
          this.onlineUsersInterval = setInterval(() => {
            this.requestOnlineUsers();
          }, 60000);
        }, 1000);
      });

      this.socket.on('disconnect', () => {
        console.log('🔍 [Widget] Socket disconnected');
        this.isConnected = false;
        this.updateConnectionStatus(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔍 [Widget] Socket connection error:', error);
        this.showError('Connection failed: ' + error.message);
        this.updateConnectionStatus(false);
      });

      this.setupSocketListeners();
    },

    // EXACT COPY from widget.js - setupSocketListeners method
    setupSocketListeners() {
      // Add debug listener for ALL socket events
      this.socket.onAny((eventName, ...args) => {
        console.log('🔍 [Widget] Socket received event:', eventName, args);
      });

      // Use exact same event names as W version
      this.socket.on('get group msg', (messages) => {
        console.log('🔍 [Widget] Received get group msg:', messages?.length);
        // Initial message load - replace all messages
        this.displayMessages(messages || []);
      });

      this.socket.on('send group msg', (messages) => {
        console.log('🔍 [Widget] Received send group msg (real-time):', messages?.length);
        console.log('🔍 [Widget] Raw message data:', messages);
        // Real-time message updates - merge with existing messages (same as W version)
        this.handleNewMessages(messages || []);
      });

      this.socket.on('forbidden', (message) => {
        console.error('🔍 [Widget] forbidden:', message);
        this.showError(message || 'Access denied');
      });

      this.socket.on('server error', (error) => {
        console.error('🔍 [Widget] server error:', error);
        this.showError('Server error occurred');
      });

      this.socket.on('expired', (data) => {
        console.error('🔍 [Widget] Token expired:', data);
        this.showError('Session expired. Please sign in again.');
      });

      this.socket.on('join to group anon', (response) => {
        console.log('🔍 [Widget] join to group anon response:', response);

        // Check if the response contains group information that can help us resolve the real ID
        if (response && response.groupId && response.groupId !== this.groupId) {
          console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
          // This might happen if the backend resolved the hash to a real ID
          this.groupId = response.groupId;
        }
      });

      this.socket.on('join to group', (response) => {
        console.log('🔍 [Widget] join to group response:', response);

        // Check if the response contains group information that can help us resolve the real ID
        if (response && response.groupId && response.groupId !== this.groupId) {
          console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
          // This might happen if the backend resolved the hash to a real ID
          this.groupId = response.groupId;
        }
      });

      this.socket.on('group updated', (group) => {
        console.log('🔍 [Widget] group updated:', group);
        this.group = group;
        this.groupMembers = group?.members || [];

        // Check if this group update contains the correct ID for our group name
        if (group && group.name && group.id &&
          group.name.toLowerCase() === this.config.groupName.toLowerCase() &&
          group.id !== this.groupId) {

          console.log('✅ [Widget] Group updated event contains correct ID:', group.id, 'for', this.config.groupName);
          console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to real ID:', group.id);

          const oldGroupId = this.groupId;
          this.groupId = group.id;

          // Rejoin with the correct ID to ensure proper message sync
          console.log('🔄 [Widget] Rejoining group with correct ID for better message sync...');
          this.rejoinGroupWithCorrectId();
        }

        // Request online users after getting group data
        if (group && group.id === parseInt(this.groupId)) {
          this.requestOnlineUsers();
        }
      });

      this.socket.on('refresh', (data) => {
        console.log('🔍 [Widget] refresh:', data);
      });

      // Listen for online users
      this.socket.on('get group online users', (userIds) => {
        console.log('👥 [Widget] Online users:', userIds);
        this.onlineUserIds = userIds || [];

        // Update the online user count badge
        this.updateOnlineUserCount(this.onlineUserIds.length);
      });

      // Listen for real-time user login/logout events
      this.socket.on('logged new user', (data) => {
        console.log('👥 [Widget] New user logged in:', data);
        // Request fresh online users when someone logs in
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      });

      this.socket.on('user out', (data) => {
        console.log('👥 [Widget] User logged out:', data);
        // Request fresh online users when someone logs out
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      });

      // Listen for user disconnect events
      this.socket.on('disconnect', (reason) => {
        console.log('👥 [Widget] User disconnected:', reason);
        // Request fresh online users when someone disconnects
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      });

      // Listen for new user joining the group
      this.socket.on('new user', (data) => {
        console.log('👥 [Widget] New user joined:', data);
        // Request fresh online users when someone joins
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      });

      this.socket.on('get fav groups', (groups) => {
        console.log('🔍 [Widget] get fav groups response:', groups?.length, 'groups');
        if (groups && groups.length > 0) {
          console.log('🔍 [Widget] Fav groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));
        }
        this.handleGroupsReceived(groups);
      });

      this.socket.on('get my groups', (groups) => {
        console.log('🔍 [Widget] get my groups response:', groups?.length, 'groups');
        if (groups && groups.length > 0) {
          console.log('🔍 [Widget] My groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));
        }
        this.handleGroupsReceived(groups);
      });

      // Chat rules listeners
      this.socket.on('get chat rules', (data) => {
        console.log('🔍 [Widget] [Chat Rules] Received get chat rules:', data);
        this.handleGetChatRules(data);
      });

      this.socket.on('update chat rules', (data) => {
        console.log('🔍 [Widget] [Chat Rules] Received update chat rules:', data);
        this.handleUpdateChatRules(data);
      });

      // Listen for join to group events (when users join/leave groups)
      this.socket.on('join to group', (response) => {
        console.log('👥 [Widget] Someone joined group:', response);
        // Request fresh online users when someone joins the group
        if (response && response.groupId === parseInt(this.groupId)) {
          setTimeout(() => {
            this.requestOnlineUsers();
          }, 500);
        }
      });

      this.socket.on('join to group anon', (response) => {
        console.log('👥 [Widget] Anonymous user joined group:', response);
        // Request fresh online users when anonymous user joins
        if (response && response.groupId === parseInt(this.groupId)) {
          setTimeout(() => {
            this.requestOnlineUsers();
          }, 500);
        }
      });
    },

    // EXACT COPY from widget.js - hashCode method
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    },

    // EXACT COPY from widget.js - updateConnectionStatus method
    updateConnectionStatus(connected) {
      const indicator = this.dialog.querySelector('.pingbash-status-indicator');
      const statusText = this.dialog.querySelector('.pingbash-status-text');
      const input = this.dialog.querySelector('.pingbash-message-input');
      const sendBtn = this.dialog.querySelector('.pingbash-send-btn');

      if (indicator) {
        indicator.classList.toggle('connected', connected);
      }

      if (statusText) {
        statusText.textContent = connected ? 'Online' : 'Connecting...';
      }

      if (input) {
        input.disabled = !connected;
        input.placeholder = connected ? 'Type a message...' : 'Connecting...';
      }

      if (sendBtn) {
        sendBtn.disabled = !connected;
      }
    },

    // EXACT COPY from widget.js - loginAsReal method
    loginAsReal(token, groupId, anonId) {
      console.log('🔐 [Widget] loginAsReal:', anonId, '/', groupId, '/', token ? 'token-present' : 'no-token');
      if (token && groupId && anonId && this.socket) {
        // Use exact same event name as W version
        this.socket.emit('user logged wild sub', { token, groupId, anonId });
      }
    },


    // EXACT COPY from widget.js - joinGroup method
      async joinGroup() {
        try {
          // Resolve group ID - use known groups
          this.groupId = await this.getGroupIdFromName();
    
          console.log('🔍 [Widget] Joining group:', this.config.groupName, 'ID:', this.groupId);
          console.log('🔍 [Widget] Connect as authenticated:', !!this.connectAsAuthenticated);
          console.log('🔍 [Widget] Is authenticated:', this.isAuthenticated);
    
          // Check if we have a pending chat rules trigger waiting for group ID
          this.checkPendingChatRulesTrigger();
    
          if (this.connectAsAuthenticated && this.authenticatedToken) {
            // Join as authenticated user
            console.log('🔐 [Widget] Joining as authenticated user');
            this.userId = this.authenticatedToken;
    
            // First, register as logged in user (same as F version)
            console.log('🔍 [Widget] Registering as logged in user...');
            this.socket.emit('user logged', { token: this.authenticatedToken });
    
            // Request user's groups to get correct group IDs (this will trigger handleGroupsReceived)
            console.log('🔍 [Widget] Requesting user groups to verify group ID...');
            this.socket.emit('get my groups', { token: this.authenticatedToken });
            this.socket.emit('get fav groups', { token: this.authenticatedToken });
    
            // Join the group as authenticated user (same as W version)
            console.log('🔍 [Widget] Emitting join to group with:', {
              token: this.authenticatedToken ? 'present' : 'missing',
              groupId: this.groupId,
              userId: this.currentUserId,
              userIdType: typeof this.currentUserId
            });
    
            // Debug: Let's also check what the token would decode to
            console.log('🔍 [Widget] Token details for verification:', {
              tokenLength: this.authenticatedToken?.length,
              tokenStart: this.authenticatedToken?.substring(0, 10),
              currentUserId: this.currentUserId,
              currentUserIdType: typeof this.currentUserId
            });
            this.socket.emit('join to group', {
              token: this.authenticatedToken,
              groupId: parseInt(this.groupId),  // Ensure groupId is a number
              userId: parseInt(this.currentUserId)  // Ensure userId is a number
            });
    
            // Get messages with authenticated token
            console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with authenticated token');
            this.socket.emit('get group msg', {
              token: this.authenticatedToken,
              groupId: parseInt(this.groupId)
            });
    
                      // Keep the authenticated flag for future rejoins
    
          } else {
            // Join as anonymous user (original flow)
            console.log('🔍 [Widget] Joining as anonymous user');
    
            // Generate anonymous user ID - use same format as W version
            this.anonId = this.getAnonId();
            this.currentUserId = this.anonId;
    
            // Create anonymous token (same format as W version)
            const anonToken = `anonuser${this.config.groupName}${this.anonId}`;
            this.userId = anonToken;
    
            console.log('🔍 [Widget] Anonymous user ID:', this.anonId);
            console.log('🔍 [Widget] Anonymous token:', anonToken);
    
            // Store anonymous token in localStorage (same as W version)
            localStorage.setItem('anonToken', anonToken);
    
            // First register as anonymous user (same as W version)
            this.socket.emit('user logged as annon', { userId: this.anonId });
    
            // Join the group as anonymous user (same event name as W version)
            this.socket.emit('join to group anon', {
              groupId: parseInt(this.groupId),
              anonId: this.anonId
            });
    
            // Get messages with anonymous token
            console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with token:', anonToken.substring(0, 20) + '...');
            this.socket.emit('get group msg', {
              token: anonToken,
              groupId: parseInt(this.groupId)
            });
    
            // Trigger chat rules after anonymous user setup (same as W version)
            setTimeout(() => {
              console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after anonymous authentication');
              this.triggerChatRulesAfterLogin(anonToken, 'anonymous');
            }, 1500); // Delay to ensure group state is properly set
    
            // For anonymous users, try comprehensive group resolution after a short delay
            // This gives time for socket events to potentially provide the correct ID
            setTimeout(async () => {
              if (this.groupId === this.hashCode(this.config.groupName)) {
                console.log('🔍 [Widget] Still using hash ID after 3 seconds, trying comprehensive resolution...');
                await this.tryComprehensiveGroupResolution();
              }
            }, 3000);
          }
    
          if (!this.socket.connected) {
            console.warn('🔍 [Widget] WARNING: Attempting to emit but socket is not connected!');
          }
    
        } catch (error) {
          console.error('🔍 [Widget] Failed to join group:', error);
          this.showError('Failed to join chat group');
        }
      },

    // EXACT COPY from widget.js - getGroupIdFromName method
      async getGroupIdFromName() {
        console.log('🔍 [Widget] Resolving group ID for:', this.config.groupName);
    
        // Try multiple approaches to get the real group ID
        let realGroupId = null;
    
        // Approach 1: Try the public API (if it works)
        try {
          console.log('🔍 [Widget] Trying public API approach...');
          const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
    
          if (response.ok) {
            const groupData = await response.json();
            console.log('✅ [Widget] Public API resolved group:', groupData);
            realGroupId = groupData.id;
          } else {
            console.log('❌ [Widget] Public API failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.log('❌ [Widget] Public API error:', error.message);
        }
    
        // Approach 2: If authenticated, try private API
        if (!realGroupId && this.isAuthenticated && this.authenticatedToken) {
          try {
            console.log('🔍 [Widget] Trying private API approach...');
            const response = await fetch(`${this.config.apiUrl}/api/private/get/groups/getGroup`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': this.authenticatedToken
              },
              body: JSON.stringify({
                groupName: this.config.groupName,
                userId: parseInt(this.currentUserId)
              })
            });
    
            if (response.ok) {
              const result = await response.json();
              if (result.group && result.group.id) {
                console.log('✅ [Widget] Private API resolved group:', result.group);
                realGroupId = result.group.id;
              }
            } else {
              console.log('❌ [Widget] Private API failed:', response.status, response.statusText);
            }
          } catch (error) {
            console.log('❌ [Widget] Private API error:', error.message);
          }
        }
    
        // If we found the real ID, use it; otherwise fall back to hash
        if (realGroupId) {
          console.log('✅ [Widget] Using real group ID:', realGroupId, 'for', this.config.groupName);
          return realGroupId;
        } else {
          const hashId = this.hashCode(this.config.groupName);
          console.log('🔍 [Widget] Using hash-based ID as fallback:', hashId, 'for', this.config.groupName);
          console.log('🔍 [Widget] Real group ID will be resolved later via socket events if possible');
          return hashId;
        }
      },

    // EXACT COPY from widget.js - sendMessage method
      async sendMessage() {
        const input = this.dialog.querySelector('.pingbash-message-input');
        const message = input.value.trim();
    
        if (!message || !this.socket || !this.isConnected) return;
    
        console.log('🔍 [Widget] Sending message:', message);
        console.log('🔍 [Widget] Group ID:', this.groupId, 'User ID:', this.userId);
        console.log('🔍 [Widget] Authenticated:', this.isAuthenticated);
    
        if (this.isAuthenticated) {
          // Send as authenticated user (exact W version format)
          const safeMessage = this.makeTextSafe(message);
          const payload = {
            groupId: parseInt(this.groupId),  // Ensure groupId is a number
            msg: safeMessage,
            token: this.userId,
            receiverId: null,
            parent_id: this.replyingTo ? this.replyingTo.id : null
          };
          console.log('📤 [Widget] Sending as authenticated user');
          console.log('📤 [Widget] Token (first 20 chars):', this.userId.substring(0, 20) + '...');
          console.log('📤 [Widget] Full payload:', payload);
          console.log('📤 [Widget] Socket connected:', this.socket.connected);
          console.log('📤 [Widget] Socket ID:', this.socket.id);
    
          this.socket.emit('send group msg', payload);
    
          // Add a timeout to check if we get a response
          setTimeout(() => {
            console.log('📤 [Widget] Message sent 2 seconds ago - checking for response...');
          }, 2000);
        } else {
          // Send as anonymous user (exact W version format)
          const safeMessage = this.makeTextSafe(message);
          const payload = {
            groupId: parseInt(this.groupId),  // Ensure groupId is a number
            msg: safeMessage,
            anonId: this.anonId,
            receiverId: null,
            parent_id: this.replyingTo ? this.replyingTo.id : null
          };
          console.log('📤 [Widget] Sending as anonymous user');
          console.log('📤 [Widget] AnonId:', this.anonId);
          console.log('📤 [Widget] Full payload:', payload);
          console.log('📤 [Widget] Socket connected:', this.socket.connected);
          console.log('📤 [Widget] Socket ID:', this.socket.id);
    
          this.socket.emit('send group msg anon', payload);
    
          // Add a timeout to check if we get a response
          setTimeout(() => {
            console.log('📤 [Widget] Anonymous message sent 2 seconds ago - checking for response...');
          }, 2000);
        }
    
        input.value = '';
    
        // Clear reply state after sending
        if (this.replyingTo) {
          this.hideReplyPreview();
        }
    
        console.log('🔍 [Widget] Input cleared, message sending complete');
      },

    // EXACT COPY from widget.js - handleGroupsReceived method
      handleGroupsReceived(groups) {
        if (!groups || !Array.isArray(groups)) {
          console.log('🔍 [Widget] No groups received or invalid format');
          return;
        }
    
        console.log('🔍 [Widget] Processing', groups.length, 'groups to find correct ID for:', this.config.groupName);
        console.log('🔍 [Widget] Available groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));
    
        // Find the group that matches our group name (case-insensitive)
        const matchingGroup = groups.find(group =>
          group.name && group.name.toLowerCase() === this.config.groupName.toLowerCase()
        );
    
        if (matchingGroup) {
          console.log('✅ [Widget] Found matching group:', matchingGroup.name, 'with ID:', matchingGroup.id);
    
          // Apply group settings to chat dialog
          this.applyGroupSettingsToChat(matchingGroup);
    
          if (matchingGroup.id !== this.groupId) {
            console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to real ID:', matchingGroup.id);
    
            const oldGroupId = this.groupId;
            this.groupId = matchingGroup.id;
    
            // Rejoin with the correct ID to ensure proper message sync
            console.log('🔄 [Widget] Rejoining group with correct ID...');
            this.rejoinGroupWithCorrectId();
    
            // Check if we have a pending chat rules trigger waiting for group ID
            this.checkPendingChatRulesTrigger();
          } else {
            console.log('✅ [Widget] Group ID already correct:', this.groupId);
          }
        } else {
          console.log('❌ [Widget] Group not found in user\'s group list:', this.config.groupName);
          console.log('🔍 [Widget] Available groups:', groups.map(g => g.name).join(', '));
    
          // For anonymous users or groups not in user's list, try the API as fallback
          if (!this.isAuthenticated) {
            console.log('🔍 [Widget] Anonymous user - trying API fallback for group resolution...');
            this.tryApiGroupResolution();
          }
        }
      },

    // EXACT COPY from widget.js - trySocketGroupResolution method
      async trySocketGroupResolution() {
        return new Promise((resolve) => {
          console.log('🔍 [Widget] Trying socket-based group resolution for:', this.config.groupName);
    
          // Set up a one-time listener for group resolution
          const timeout = setTimeout(() => {
            console.log('❌ [Widget] Socket group resolution timed out');
            resolve(false);
          }, 5000);
    
          // Try to get group info via socket (this might trigger group updated events)
          if (this.socket && this.socket.connected) {
            // For anonymous users, we can try joining with hash ID and see if we get group info back
            console.log('🔍 [Widget] Attempting to get group info via socket events...');
    
            // The join events might return group information
            const originalGroupId = this.groupId;
    
            // Listen for group updated event that might contain the real ID
            const groupUpdatedHandler = (group) => {
              if (group && group.name && group.id &&
                group.name.toLowerCase() === this.config.groupName.toLowerCase() &&
                group.id !== originalGroupId) {
    
                console.log('✅ [Widget] Socket resolved group via group updated:', group);
                clearTimeout(timeout);
                this.socket.off('group updated', groupUpdatedHandler);
    
                this.groupId = group.id;
                this.rejoinGroupWithCorrectId();
                resolve(true);
              }
            };
    
            this.socket.on('group updated', groupUpdatedHandler);
    
            // Clean up after timeout
            setTimeout(() => {
              this.socket.off('group updated', groupUpdatedHandler);
              resolve(false);
            }, 4500);
    
          } else {
            console.log('❌ [Widget] Socket not connected for group resolution');
            clearTimeout(timeout);
            resolve(false);
          }
        });
      },

    // EXACT COPY from widget.js - tryComprehensiveGroupResolution method
      async tryComprehensiveGroupResolution() {
        console.log('🔍 [Widget] Starting comprehensive group resolution for:', this.config.groupName);
    
        // Approach 1: Public API (fixed backend)
        let resolved = await this.tryPublicApiResolution();
        if (resolved) return;
    
        // Approach 2: Socket-based resolution
        resolved = await this.trySocketGroupResolution();
        if (resolved) return;
    
        // Approach 3: If authenticated, try private API
        if (this.isAuthenticated && this.authenticatedToken) {
          resolved = await this.tryPrivateApiResolution();
          if (resolved) return;
        }
    
        console.log('❌ [Widget] All group resolution approaches failed, staying with hash ID:', this.groupId);
      },

    // EXACT COPY from widget.js - tryPublicApiResolution method
      async tryPublicApiResolution() {
        try {
          console.log('🔍 [Widget] Trying public API resolution...');
          const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
    
          if (response.ok) {
            const groupData = await response.json();
            console.log('✅ [Widget] Public API resolved group:', groupData);
    
            if (groupData.id && groupData.id !== this.groupId) {
              console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to public API ID:', groupData.id);
              this.groupId = groupData.id;
              this.rejoinGroupWithCorrectId();
              return true;
            }
          } else {
            console.log('❌ [Widget] Public API failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.log('❌ [Widget] Public API error:', error.message);
        }
        return false;
      },

    // EXACT COPY from widget.js - tryPrivateApiResolution method
      async tryPrivateApiResolution() {
        try {
          console.log('🔍 [Widget] Trying private API resolution...');
          const response = await fetch(`${this.config.apiUrl}/api/private/get/groups/getGroup`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': this.authenticatedToken
            },
            body: JSON.stringify({
              groupName: this.config.groupName,
              userId: parseInt(this.currentUserId)
            })
          });
    
          if (response.ok) {
            const result = await response.json();
            if (result.group && result.group.id) {
              console.log('✅ [Widget] Private API resolved group:', result.group);
    
              if (result.group.id !== this.groupId) {
                console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to private API ID:', result.group.id);
                this.groupId = result.group.id;
                this.rejoinGroupWithCorrectId();
    
                // Check if we have a pending chat rules trigger waiting for group ID
                this.checkPendingChatRulesTrigger();
                return true;
              }
            }
          } else {
            console.log('❌ [Widget] Private API failed:', response.status, response.statusText);
          }
        } catch (error) {
          console.log('❌ [Widget] Private API error:', error.message);
        }
        return false;
      },

    // EXACT COPY from widget.js - tryApiGroupResolution method
      async tryApiGroupResolution() {
        try {
          console.log('🔍 [Widget] Trying API-based group resolution for:', this.config.groupName);
    
          const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
    
          if (response.ok) {
            const groupData = await response.json();
            console.log('✅ [Widget] API resolved group:', groupData);
    
            if (groupData.id && groupData.id !== this.groupId) {
              console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to API-resolved ID:', groupData.id);
              this.groupId = groupData.id;
              this.rejoinGroupWithCorrectId();
    
              // Check if we have a pending chat rules trigger waiting for group ID
              this.checkPendingChatRulesTrigger();
            }
          } else {
            console.log('❌ [Widget] API group resolution failed:', response.status, response.statusText);
    
            // If API fails, try socket-based resolution
            if (!this.isAuthenticated) {
              console.log('🔍 [Widget] Trying socket-based resolution as final fallback...');
              await this.trySocketGroupResolution();
            }
          }
        } catch (error) {
          console.log('❌ [Widget] API group resolution error:', error.message);
    
          // If API fails, try socket-based resolution
          if (!this.isAuthenticated) {
            console.log('🔍 [Widget] Trying socket-based resolution as final fallback...');
            await this.trySocketGroupResolution();
          }
        }
      },

    // EXACT COPY from widget.js - rejoinGroupWithCorrectId method
      async rejoinGroupWithCorrectId() {
        try {
          // Prevent rapid rejoining that can cause 403 loops
          const now = Date.now();
          if (this.lastRejoinTime && (now - this.lastRejoinTime) < 2000) {
            console.log('🔄 [Widget] Skipping rejoin - too frequent (within 2 seconds)');
            return;
          }
          this.lastRejoinTime = now;
          
          console.log('🔄 [Widget] Rejoining group with correct ID:', this.groupId);
          
          // Check if we're already in the correct group
          if (this.currentJoinedGroupId === parseInt(this.groupId)) {
            console.log('🔄 [Widget] Already joined to correct group:', this.groupId);
            return;
          }
          this.currentJoinedGroupId = parseInt(this.groupId);
    
          if (this.isAuthenticated && this.authenticatedToken) {
            // Join as authenticated user (use isAuthenticated instead of connectAsAuthenticated)
            console.log('🔐 [Widget] Rejoining as authenticated user');
            this.socket.emit('join to group', {
              token: this.authenticatedToken,
              groupId: parseInt(this.groupId),
              userId: parseInt(this.currentUserId)
            });
          } else {
            // Join as anonymous user
            console.log('👤 [Widget] Rejoining as anonymous user');
            this.socket.emit('join to group anon', {
              groupId: parseInt(this.groupId),
              anonId: this.anonId
            });
          }
    
          // Get messages with correct group ID
          const token = this.connectAsAuthenticated ? this.authenticatedToken : `anonuser${this.config.groupName}${this.anonId}`;
          this.socket.emit('get group msg', {
            token: token,
            groupId: parseInt(this.groupId)
          });
    
        } catch (error) {
          console.error('❌ [Widget] Error rejoining group with correct ID:', error);
        }
      },

  });
}