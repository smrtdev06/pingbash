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

        // For anonymous users, re-register on reconnection to ensure message reception
        if (!this.isAuthenticated && this.anonId) {
          console.log('🔌 [Widget] Re-registering anonymous user on connect:', this.anonId);
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              this.socket.emit('user logged as annon', { userId: this.anonId });
              
              // Request messages again for anonymous users to catch any missed messages
              setTimeout(() => {
                console.log('🔌 [Widget] Requesting messages for anonymous user after connect');
                this.socket.emit('get group msg', {
                  token: this.userId,
                  groupId: parseInt(this.groupId)
                });
              }, 500);
            }
          }, 500);
        }

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
        
        // Update menu visibility when messages are loaded (group is ready)
        setTimeout(() => {
          if (this.updateMenuVisibility) {
            console.log('🔍 [Debug] Calling updateMenuVisibility from get group msg');
            this.updateMenuVisibility();
          }
          // Make debug function available globally
          if (this.debugMenuPermissions) {
            window.debugMenuPermissions = () => this.debugMenuPermissions();
          }
        }, 500);
        
        // Request pinned messages after messages are loaded
        if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
          console.log('📌 [Widget] Messages loaded - requesting pinned messages');
          setTimeout(() => {
            // Call getPinnedMessages directly via socket emit
            if (this.socket && this.socket.connected) {
              console.log('📌 [Widget] Emitting get pinned messages request');
              this.socket.emit('get pinned messages', {
                token: this.authenticatedToken?.trim(),
                groupId: parseInt(this.groupId)
              });
            }
          }, 500);
        }
      });

      this.socket.on('send group msg', (messages) => {
        console.log('🔍 [Widget] Received send group msg (real-time):', messages?.length);
        console.log('🔍 [Widget] Raw message data:', messages);
        // Real-time message updates - merge with existing messages (same as W version)
        this.handleNewMessages(messages || []);
        
        // Update UI to reflect any slow mode timing changes
        this.onGroupDataUpdated();
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
        // Hide any moderator loading states
        this.hideModeratorLoading();
      });

      this.socket.on('forbidden', (data) => {
        console.error('🔍 [Widget] Forbidden access:', data);
        this.showError('Access denied. You may not have permission for this action.');
        // Hide any moderator loading states  
        this.hideModeratorLoading();
      });

      this.socket.on('server error', (data) => {
        console.error('🔍 [Widget] Server error:', data);
        this.showError('Server error occurred');
        // Hide any moderator loading states
        this.hideModeratorLoading();
      });

      this.socket.on('join to group anon', (response) => {
        console.log('🔍 [Widget] join to group anon response:', response);

        // Check if the response contains group information that can help us resolve the real ID
        if (response && response.groupId && response.groupId !== this.groupId) {
          console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
          // This might happen if the backend resolved the hash to a real ID
          this.groupId = response.groupId;
        }

        // Request pinned messages after joining (anonymous users can view pinned messages)
        if (response && response.success) {
          console.log('📌 [Widget] Join anon success - requesting pinned messages', {
            isAuthenticated: this.isAuthenticated,
            hasToken: !!this.authenticatedToken,
            groupId: this.groupId
          });
          setTimeout(() => {
            if (this.getPinnedMessages) {
              this.getPinnedMessages();
            } else {
              console.error('📌 [Widget] getPinnedMessages method not found');
            }
          }, 1000);
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

        // Request pinned messages after joining
        if (response && response.success && this.isAuthenticated) {
          setTimeout(() => this.getPinnedMessages(), 1000);
        }
      });

      this.socket.on('group updated', (group) => {
        console.log('🔍 [Widget] group updated:', group);
        
        // Check if moderators changed
        const oldModerators = this.group?.members?.filter(m => m.role_id === 2) || [];
        const newModerators = group?.members?.filter(m => m.role_id === 2) || [];
        
        console.log('👥 [Socket] 🔍 Checking moderator changes:', {
          oldCount: oldModerators.length,
          newCount: newModerators.length,
          oldMods: oldModerators.map(m => m.id),
          newMods: newModerators.map(m => m.id)
        });
        
        // Check for any moderator management activities
        const moderatorMgmtPopup = this.dialog.querySelector('.pingbash-moderator-management-popup');
        const isModeratorPopupOpen = moderatorMgmtPopup && moderatorMgmtPopup.style.display === 'flex';
        
        // Hide any loading states when group is updated
        if (isModeratorPopupOpen) {
          this.hideModeratorLoading();
          
          // Clear any pending timeouts
          if (this.removeModeratorTimeoutId) {
            clearTimeout(this.removeModeratorTimeoutId);
            this.removeModeratorTimeoutId = null;
          }
          
          // Hide loading state on permissions save button if it exists
          const saveBtn = this.dialog.querySelector('.pingbash-mod-permissions-save');
          this.setButtonLoading(saveBtn, false);
          
          // Hide permissions popup if it's open
          this.hideModeratorPermissionsPopup();
        }

        if (oldModerators.length !== newModerators.length) {
          console.log('👥 [Socket] 🔍 Moderator count changed!');
          
          // Check if we have a pending add moderator operation
          if (newModerators.length > oldModerators.length) {
            console.log('👥 [Socket] ✅ Moderator added via group update!');
          } else if (newModerators.length < oldModerators.length) {
            console.log('👥 [Socket] ✅ Moderator removed via group update!');
          }
        } else if (isModeratorPopupOpen) {
          // Moderator count didn't change, but popup is open - might be permissions update
          console.log('👥 [Socket] ✅ Moderator permissions updated via group update!');
        }
        
        // Refresh moderators list if popup is open
        if (isModeratorPopupOpen) {
          setTimeout(() => this.loadModerators(), 100);
        }
        
        this.group = group;
        this.groupMembers = group?.members || [];

        // Update chat limitation UI when group data changes
        this.onGroupDataUpdated();
        
        // Update menu visibility based on permissions
        if (this.updateMenuVisibility) {
          this.updateMenuVisibility();
        }

        // Check if censored content was updated and handle response
        if (this.censoredWordsTimeoutId) {
          console.log('🔍 [Widget] Censored content updated successfully');
          
          // Clear timeout
          clearTimeout(this.censoredWordsTimeoutId);
          this.censoredWordsTimeoutId = null;

          // Update local data
          this.originalCensoredWords = [...this.censoredWords];

          // Hide loading state
          const saveBtn = this.dialog?.querySelector('.pingbash-censored-save-btn');
          if (saveBtn) {
            this.setButtonLoading(saveBtn, false);
          }

          // Show success toast
          this.showSuccessToast('Success', 'Censored content updated successfully!');

          // Update save button visibility
          this.updateSaveButtonVisibility();
        }
        
        // Request pinned messages after group is updated (if we have messages loaded)
        if (this.isAuthenticated && this.authenticatedToken && this.groupId && this.messages?.length > 0) {
          console.log('📌 [Widget] Group updated - requesting pinned messages');
          setTimeout(() => {
            if (this.getPinnedMessages) {
              this.getPinnedMessages();
            } else {
              console.error('📌 [Widget] getPinnedMessages method not found');
            }
          }, 200);
        }

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

        // Trigger chat rules for anonymous users if they exist
        if (!this.isAuthenticated && group && group.rules && group.rules.trim()) {
          console.log('🔍 [Socket] Anonymous user - triggering chat rules from group updated');
          setTimeout(() => {
            this.triggerChatRulesAfterLogin(this.userId, 'anonymous');
          }, 1000);
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

      // Listen for chat limitations updates
      this.socket.on('udpate group post level', (data) => {
        console.log('🔒 [Widget] Chat limitations updated:', data);
        // The group data should be updated automatically via 'group updated' event
        // but we can trigger UI update here as well to be safe
        this.onGroupDataUpdated();
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

      // Ban and Timeout event listeners (same as W version)
      this.socket.on('ban group user', (userId) => {
        console.log('🚫 [Widget] User banned:', userId);
        // Refresh messages and group data after ban
        setTimeout(() => {
          this.socket.emit('get group msg', {
            groupId: parseInt(this.groupId),
            token: this.isAuthenticated ? this.authenticatedToken : `anonusermemine${this.anonId}`
          });
          this.requestOnlineUsers();
        }, 500);
      });

      // Note: Backend doesn't emit 'timeout user' response, only 'group updated' and 'user timeout notification'

      this.socket.on('user timeout notification', (data) => {
        console.log('⏰ [Widget] Timeout notification received:', data);
        this.handleTimeoutNotification(data);
      });

      // Listen for timeout success (via group updated or direct response)
      this.socket.on('timeout success', (data) => {
        console.log('✅ [Widget] Timeout successful:', data);
        alert('User has been timed out for 15 minutes');
      });

      // Listen for timeout errors
      this.socket.on('timeout error', (error) => {
        console.error('❌ [Widget] Timeout failed:', error);
        alert('Failed to timeout user: ' + (error.message || 'Unknown error'));
      });

      // Listen for ban success and errors
      this.socket.on('ban success', (data) => {
        console.log('✅ [Widget] Ban successful:', data);
        alert('User has been banned successfully');
      });

      this.socket.on('ban error', (error) => {
        console.error('❌ [Widget] Ban failed:', error);
        alert('Failed to ban user: ' + (error.message || 'Unknown error'));
      });

      // Listen for the actual events the backend sends for ban/timeout
      this.socket.on('ban group user', (userId) => {
        console.log('✅ [Widget] Backend confirmed ban for user:', userId);
        const isAnonymous = parseInt(userId) > 100000;
        const userType = isAnonymous ? 'Anonymous user' : 'User';
        alert(`${userType} ${userId} has been banned successfully`);
      });

      this.socket.on('unban group user', (userId) => {
        console.log('✅ [Widget] Backend confirmed unban for user:', userId);
        const isAnonymous = parseInt(userId) > 100000;
        const userType = isAnonymous ? 'Anonymous user' : 'User';
        alert(`${userType} ${userId} has been unbanned successfully`);
      });

      // Enhanced forbidden handler for ban/timeout errors
      this.socket.on('forbidden', (message) => {
        console.log('🔍 [Widget] Forbidden access:', message);
        
        // Check if this is a ban/timeout related forbidden error
        if (typeof message === 'string') {
          if (message.includes('ban') || message.includes('timeout')) {
            alert('Access denied: ' + message);
          } else if (message.includes('creator') || message.includes('permission')) {
            alert('Permission denied: ' + message);
          }
        }
      });

      // Banned users and IP bans event listeners
      this.socket.on('get banned users', (bannedUsers) => {
        console.log('🚫 [Widget] Banned users received:', bannedUsers?.length || 0, 'users');
        this.handleBannedUsersReceived(bannedUsers);
      });

      this.socket.on('get ip bans', (ipBans) => {
        console.log('🌐 [Widget] IP bans received:', ipBans?.length || 0, 'bans');
        this.handleIpBansReceived(ipBans);
      });

      // 🆕 IP unban response listeners
      this.socket.on('ip unban success', (data) => {
        console.log('✅ [Socket] IP unban success:', data);
        alert(`Successfully unbanned IP address: ${data.ipAddress}`);
        
        // Refresh the appropriate modal if open
        const bannedUsersModal = document.querySelector('.pingbash-banned-users-modal');
        const ipBansModal = document.querySelector('.pingbash-ip-bans-modal');
        
        if (bannedUsersModal) {
          this.showBannedUsers(); // Refresh the unified ban modal
        }
        
        if (ipBansModal) {
          this.refreshIpBans(); // Refresh the IP bans specific modal
        }
      });

      this.socket.on('ip unban error', (data) => {
        console.log('❌ [Socket] IP unban error:', data);
        alert(`Failed to unban IP address: ${data.message || 'Unknown error'}`);
      });

      this.socket.on('unban group users', (userIds) => {
        console.log('✅ [Widget] Users unbanned:', userIds);
        // Refresh banned users list and messages
        setTimeout(() => {
          this.socket.emit('get group msg', {
            groupId: parseInt(this.groupId),
            token: this.isAuthenticated ? this.authenticatedToken : `anonusermemine${this.anonId}`
          });
          this.requestOnlineUsers();
        }, 500);
        
        // Close banned users modal if open
        const modal = document.querySelector('.pingbash-banned-users-modal');
        if (modal) {
          modal.remove();
        }
      });

      // Pin message listeners (same as W version)
      this.socket.on('get pinned messages', (pinnedMessageIds) => {
        console.log('📌 [Widget] Pinned messages received:', pinnedMessageIds);
        this.pinnedMessageIds = pinnedMessageIds || [];
        
        console.log('📌 [Widget] Current pinned message IDs:', this.pinnedMessageIds);
        
        // Update the UI to reflect pinned status
        this.updatePinnedMessagesUI();
        
        // Update pinned messages widget with delay to ensure messages are loaded
        setTimeout(() => {
          this.updatePinnedMessagesWidget();
        }, 100);
      });

      // Clear group chat socket response (correct backend event)
      this.socket.on('clear group chat', (groupId) => {
        console.log('🧹 [Widget] Clear group chat response received for group:', groupId);
        
        // Clear timeout
        if (this.clearChatTimeout) {
          clearTimeout(this.clearChatTimeout);
          this.clearChatTimeout = null;
        }
        
        // Check if this is for our current group
        if (parseInt(groupId) === parseInt(this.groupId)) {
          // Clear local messages
          this.messages = [];
          this.pinnedMessageIds = [];
          
          // Update UI
          this.displayMessages([]);
          this.updatePinnedMessagesWidget();
          
          console.log('🧹 [Widget] Chat cleared successfully for group:', groupId);
        } else {
          console.log('🧹 [Widget] Clear chat event for different group:', groupId, 'current:', this.groupId);
        }
      });



      // Unpin message socket response
      this.socket.on('unpin message', (response) => {
        console.log('📌 [Widget] Unpin message response:', response);
        if (response.success) {
          // Update local pinned messages list
          this.pinnedMessageIds = this.pinnedMessageIds.filter(id => id !== response.messageId);
          
          // Update UI
          this.updatePinnedMessagesUI();
          this.updatePinnedMessagesWidget();
          
          // Refresh pinned messages view if open
          const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
          if (pinnedView && pinnedView.style.display !== 'none') {
            this.loadPinnedMessages();
          }
          
          console.log('📌 [Widget] Message unpinned successfully');
        } else {
          console.error('📌 [Widget] Failed to unpin message:', response.error);
          alert('Failed to unpin message: ' + (response.error || 'Unknown error'));
        }
      });

      // Moderator management socket events - using correct backend event names
      console.log('👥 [Socket] Setting up moderator management listeners');
      
      // The backend doesn't send specific responses for moderator updates
      // Instead, it sends 'group updated' events which we already handle above
      
      // Debug: Listen for ALL socket events to see what the server is sending
      this.socket.onAny((eventName, ...args) => {
        console.log(`👥 [Socket] 🔍 ALL EVENTS: Received '${eventName}' with args:`, args);
        
        // Special logging for moderator-related events
        if (eventName.includes('moderator') || eventName.includes('mod') || eventName.includes('permission') || eventName.includes('group') || eventName.includes('forbidden') || eventName.includes('error')) {
          console.log(`👥 [Socket] ⭐ IMPORTANT EVENT: '${eventName}':`, args);
        }
      });

      // Group members request for search
      this.socket.on('get group members', (response) => {
        console.log('👥 [Socket] Get group members response:', response);
        this.handleGroupMembersResponse(response);
      });

      // Block user socket events - based on backend implementation
      this.socket.on('get blocked users info', (blockedUsers) => {
        console.log('🚫 [Socket] Blocked users info received:', blockedUsers);
        console.log('🚫 [Socket] Blocked users detailed info:', {
          isArray: Array.isArray(blockedUsers),
          length: blockedUsers?.length,
          firstItem: blockedUsers?.[0],
          rawData: JSON.stringify(blockedUsers),
          fullArray: blockedUsers,
          type: typeof blockedUsers
        });
        
        // Debug each item in the array
        if (Array.isArray(blockedUsers) && blockedUsers.length > 0) {
          blockedUsers.forEach((item, index) => {
            console.log(`🚫 [Socket] Blocked user item ${index}:`, item, typeof item, JSON.stringify(item));
          });
        }
        
        // Store blocked users list for message filtering
        if (Array.isArray(blockedUsers)) {
          // Backend returns users with Opposite_Id field (line 1119 in controller.js)
          const userIds = blockedUsers.map(user => {
            const id = user.Opposite_Id || user.id || user.block_id;
            console.log('🚫 [Socket] Mapping blocked user:', { user, mappedId: id });
            return id;
          }).filter(id => id !== undefined);
          
          this.blockedUsers = new Set(userIds);
          console.log('🚫 [Socket] Updated blocked users list:', this.blockedUsers);
          
          // Hide messages from newly blocked users
          this.filterMessagesFromBlockedUsers();
          
          // Always show success message since backend is responding (even if list is empty)
          console.log('🚫 [Socket] User successfully blocked on server');
          alert('User blocked successfully. You will no longer see their messages.');
          
          // Log if no blocked users returned for debugging
          if (blockedUsers.length === 0) {
            console.log('🚫 [Socket] Block operation completed but no blocked users returned');
            console.log('🚫 [Socket] This could indicate:');
            console.log('  1. Backend blockUser succeeded but getBlockedUsersInfo query failed');
            console.log('  2. Race condition between insert and select');
            console.log('  3. Query parameter mismatch');
            console.log('  4. Database transaction not committed yet');
            console.log('🚫 [Socket] Using optimistic UI update (user should be blocked)');
          }
        } else {
          console.error('🚫 [Socket] Invalid blocked users response - not an array:', typeof blockedUsers);
        }
      });


    },

    // Note: Moderator management now relies on 'group updated' events
    // The backend sends group updates instead of specific moderator responses

    handleGroupMembersResponse(response) {
      console.log('👥 [Socket] Group members response:', response);
      
      if (response.success && response.members) {
        console.log('👥 [Socket] Received group members:', response.members.length);
        
        // Update group members data
        if (this.group) {
          this.group.members = response.members;
        }

        // If there's a pending search, perform it now
        if (this.pendingSearchQuery && this.pendingSearchContainer) {
          console.log('👥 [Socket] Performing pending search for:', this.pendingSearchQuery);
          this.performMemberSearch(this.pendingSearchQuery, this.pendingSearchContainer);
          
          // Clear pending search
          this.pendingSearchQuery = null;
          this.pendingSearchContainer = null;
        }
      } else {
        console.error('👥 [Socket] Failed to get group members:', response.error);
        
        // Show error in search results if there's a pending search
        if (this.pendingSearchContainer) {
          this.pendingSearchContainer.innerHTML = '<div class="pingbash-member-result-item">Failed to load members</div>';
          this.pendingSearchQuery = null;
          this.pendingSearchContainer = null;
        }
      }
    },

    // Update pinned messages UI (same as W version)
    updatePinnedMessagesUI() {
      // Update pin button states for all messages
      console.log('📌 [Widget] Updating pin/unpin button states for messages');
      
      if (!this.pinnedMessageIds) {
        console.log('📌 [Widget] No pinned message IDs available');
        return;
      }
      
      // Update each message's pin button
      this.messages?.forEach(message => {
        const messageElement = document.querySelector(`[data-message-id="${message.Id}"]`);
        if (messageElement) {
          const pinButton = messageElement.querySelector('.pingbash-message-action.pin');
          if (pinButton) {
            const isPinned = this.pinnedMessageIds.includes(message.Id);
            
            // Update button text and onclick
            pinButton.textContent = isPinned ? '📌' : '📍';
            pinButton.title = isPinned ? 'Unpin Message' : 'Pin Message';
            pinButton.onclick = () => {
              if (isPinned) {
                window.pingbashWidget.unpinMessage(message.Id);
              } else {
                window.pingbashWidget.pinMessage(message.Id);
              }
            };
            
            console.log(`📌 [Widget] Updated pin button for message ${message.Id}: ${isPinned ? 'UNPIN' : 'PIN'}`);
          }
        }
      });
    },

    updatePinnedMessagesWidget() {
      console.log('📌 [Widget] Updating pinned messages widget', {
        pinnedIds: this.pinnedMessageIds,
        messagesCount: this.messages?.length || 0
      });
      
      if (!this.pinnedMessageIds || this.pinnedMessageIds.length === 0) {
        // Hide pinned messages widget if no pinned messages
        const widget = document.querySelector('.pingbash-pinned-messages-widget');
        if (widget) {
          widget.style.setProperty('display', 'none', 'important');
          console.log('📌 [Widget] Widget hidden (no pinned messages)');
        }
        return;
      }

      // Get pinned messages from current messages
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds.includes(msg.Id)
      ) || [];

      if (pinnedMessages.length > 0) {
        this.showPinnedMessagesWidget(pinnedMessages);
      }
    },

    showPinnedMessagesWidget(pinnedMessages) {
      console.log('📌 [Widget] Showing pinned messages widget with', pinnedMessages.length, 'messages');
      
      let widget = document.querySelector('.pingbash-pinned-messages-widget');
      
      if (!widget) {
        // Create pinned messages widget
        widget = document.createElement('div');
        widget.className = 'pingbash-pinned-messages-widget';
        
        // Insert after header, before messages area (same as W version)
        const header = this.dialog.querySelector('.pingbash-header');
        const messagesArea = this.dialog.querySelector('.pingbash-messages-area');
        
        console.log('📌 [Widget] DOM elements found:', {
          header: !!header,
          messagesArea: !!messagesArea,
          dialog: !!this.dialog
        });
        
        if (header && messagesArea) {
          header.parentNode.insertBefore(widget, messagesArea);
          console.log('📌 [Widget] Widget inserted into DOM');
        } else {
          console.error('📌 [Widget] Could not find header or messages area to insert widget');
          return;
        }
      }

      // Show widget and ensure it's visible (override CSS !important)
      widget.style.setProperty('display', 'block', 'important');
      widget.style.setProperty('visibility', 'visible', 'important');
      widget.style.setProperty('opacity', '1', 'important');
      
      console.log('📌 [Widget] Widget display styles set');
      console.log('📌 [Widget] Widget computed styles after setting:', {
        display: getComputedStyle(widget).display,
        visibility: getComputedStyle(widget).visibility,
        opacity: getComputedStyle(widget).opacity,
        height: getComputedStyle(widget).height,
        width: getComputedStyle(widget).width
      });
      
      // Initialize or update widget content
      this.initializePinnedMessagesWidget(widget, pinnedMessages);
    },

    initializePinnedMessagesWidget(widget, pinnedMessages) {
      console.log('📌 [Widget] Initializing pinned messages widget', {
        pinnedMessages: pinnedMessages.length,
        currentIndex: this.currentPinnedIndex
      });
      
      if (!this.currentPinnedIndex) {
        this.currentPinnedIndex = 0;
      }
      
      // Ensure index is within bounds
      if (this.currentPinnedIndex >= pinnedMessages.length) {
        this.currentPinnedIndex = 0;
      }

      const currentMessage = pinnedMessages[this.currentPinnedIndex];
      if (!currentMessage) {
        console.error('📌 [Widget] No current message found at index', this.currentPinnedIndex);
        return;
      }
      
      console.log('📌 [Widget] Current message:', currentMessage);

      // Get group colors for styling
      const bgColor = this.group?.msg_bg_color || '#F5F5F5';
      const titleColor = this.group?.title_color || '#333333';
      const msgColor = this.group?.msg_txt_color || '#333333';
      const fontSize = this.group?.font_size || 14;

      widget.innerHTML = `
        <div class="pingbash-pinned-container" style="background: ${bgColor};">
          <div class="pingbash-pinned-navigation">
            ${pinnedMessages.map((_, i) => `
              <div class="pingbash-pinned-dot ${i === this.currentPinnedIndex ? 'active' : ''}" 
                   onclick="window.pingbashWidget.setPinnedMessageIndex(${i})"></div>
            `).join('')}
          </div>
          
          <div class="pingbash-pinned-content" onclick="window.pingbashWidget.scrollToPinnedMessage(${currentMessage.Id})">
            <div class="pingbash-pinned-header">
              <span class="pingbash-pinned-sender" style="color: ${titleColor}; font-size: ${fontSize}px;">
                ${this.getSenderName(currentMessage)}
              </span>
              <span class="pingbash-pinned-index" style="color: ${titleColor}; font-size: ${fontSize - 2}px;">
                #${this.currentPinnedIndex + 1}
              </span>
            </div>
            <div class="pingbash-pinned-text" style="color: ${msgColor}; font-size: ${fontSize}px;">
              ${this.truncateText(currentMessage.Content, 100)}
            </div>
          </div>
          
          <div class="pingbash-pinned-controls">
            <button class="pingbash-pinned-prev" onclick="window.pingbashWidget.previousPinnedMessage()" 
                    ${pinnedMessages.length <= 1 ? 'disabled' : ''}>‹</button>
            <button class="pingbash-pinned-next" onclick="window.pingbashWidget.nextPinnedMessage()" 
                    ${pinnedMessages.length <= 1 ? 'disabled' : ''}>›</button>
            <button class="pingbash-pinned-unpin" onclick="window.pingbashWidget.unpinCurrentMessage()" 
                    title="Unpin this message">📌</button>
          </div>
        </div>
      `;
    },

    setPinnedMessageIndex(index) {
      this.currentPinnedIndex = index;
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      this.initializePinnedMessagesWidget(
        document.querySelector('.pingbash-pinned-messages-widget'), 
        pinnedMessages
      );
      
      // Scroll to the selected message with blinking effect
      const currentMessage = pinnedMessages[index];
      if (currentMessage) {
        console.log('📌 [Widget] Navigating to pinned message:', currentMessage.Id);
        this.scrollToPinnedMessage(currentMessage.Id);
      }
    },

    nextPinnedMessage() {
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      
      if (pinnedMessages.length <= 1) return;
      
      this.currentPinnedIndex = (this.currentPinnedIndex + 1) % pinnedMessages.length;
      this.initializePinnedMessagesWidget(
        document.querySelector('.pingbash-pinned-messages-widget'), 
        pinnedMessages
      );
      
      // Scroll to the next message with blinking effect
      const currentMessage = pinnedMessages[this.currentPinnedIndex];
      if (currentMessage) {
        console.log('📌 [Widget] Next pinned message:', currentMessage.Id);
        this.scrollToPinnedMessage(currentMessage.Id);
      }
    },

    previousPinnedMessage() {
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      
      if (pinnedMessages.length <= 1) return;
      
      this.currentPinnedIndex = this.currentPinnedIndex === 0 
        ? pinnedMessages.length - 1 
        : this.currentPinnedIndex - 1;
      this.initializePinnedMessagesWidget(
        document.querySelector('.pingbash-pinned-messages-widget'), 
        pinnedMessages
      );
      
      // Scroll to the previous message with blinking effect
      const currentMessage = pinnedMessages[this.currentPinnedIndex];
      if (currentMessage) {
        console.log('📌 [Widget] Previous pinned message:', currentMessage.Id);
        this.scrollToPinnedMessage(currentMessage.Id);
      }
    },

    unpinCurrentMessage() {
      console.log('📌 [Widget] Unpin current message clicked');
      
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      
      if (pinnedMessages.length === 0) return;
      
      const currentMessage = pinnedMessages[this.currentPinnedIndex];
      if (!currentMessage) return;
      
      // Check permissions
      if (!this.canPinMessages()) {
        alert("Only moderators and admins can unpin messages");
        return;
      }
      
      // Confirm unpin
      const confirmed = confirm(`Are you sure you want to unpin this message?`);
      if (!confirmed) return;
      
      console.log(`📌 [Widget] Unpinning message ${currentMessage.Id} from widget`);
      
      // Call the unpin method
      this.unpinMessage(currentMessage.Id);
    },

    // Check if user can pin/unpin messages (same as chat.js)
    canPinMessages() {
      // Check if user is moderator or admin (role_id 1 or 2) or group creator
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId || !this.group) return false;
      
      // Group creator can always pin
      if (this.group.creater_id === currentUserId) return true;
      
      // Check if user is mod/admin in group members
      const userMember = this.group.members?.find(member => member.id === currentUserId);
      return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
    },

    // Get current user ID (same as chat.js)
    getCurrentUserId() {
      if (this.isAuthenticated && this.currentUserId) {
        return parseInt(this.currentUserId);
      } else if (this.anonId) {
        return parseInt(this.anonId);
      }
      return null;
    },

    scrollToPinnedMessage(messageId) {
      console.log('📌 [Widget] Scrolling to pinned message:', messageId);
      
      // Scroll to the message
      this.scrollToMessage(messageId);
      
      // Add blinking effect for 1 second
      setTimeout(() => {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          // Add blinking class
          messageElement.classList.add('pingbash-message-highlight');
          
          // Remove blinking after 1 second
          setTimeout(() => {
            messageElement.classList.remove('pingbash-message-highlight');
          }, 1000);
        }
      }, 100); // Small delay to ensure scroll completes first
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      // Remove HTML tags for display
      const plainText = text.replace(/<[^>]*>/g, '');
      return plainText.length > maxLength 
        ? plainText.substring(0, maxLength) + '...' 
        : plainText;
    },

    getSenderName(message) {
      if (!message) return 'Unknown';
      
      // Check if it's an anonymous user
      if (message.Sender_Id && message.Sender_Id > 1000000) {
        const anonId = message.Sender_Id;
        const lastThreeDigits = String(anonId).slice(-3);
        return `Anon${lastThreeDigits}`;
      }
      
      // Check if we have sender name in the message
      if (message.sender_name) {
        return message.sender_name;
      }
      
      // Try to get name from group members
      if (this.group && this.group.members) {
        const member = this.group.members.find(m => m.id === message.Sender_Id);
        if (member && member.name) {
          return member.name;
        }
      }
      
      // Fallback to User + ID
      return `User ${message.Sender_Id}`;
    },

    // Debug method to manually trigger pinned messages widget
    testPinnedMessagesWidget() {
      console.log('📌 [Widget] Testing pinned messages widget manually');
      console.log('📌 [Widget] Current state:', {
        pinnedMessageIds: this.pinnedMessageIds,
        messages: this.messages?.length || 0,
        dialog: !!this.dialog
      });
      
      if (this.pinnedMessageIds && this.pinnedMessageIds.length > 0) {
        this.updatePinnedMessagesWidget();
      } else {
        console.log('📌 [Widget] No pinned messages to display');
      }
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

            // Request blocked users list for authenticated users (no specific socket event needed, backend sends on block)
            // The backend automatically sends 'get blocked users info' when a user blocks someone
            console.log('🚫 [Widget] Authenticated user - blocked users will be loaded when blocking occurs');
    
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
            // Backend automatically sends 'group updated' event with group data for anonymous users
            this.socket.emit('join to group anon', {
              groupId: parseInt(this.groupId),
              anonId: this.anonId
            });
    
            console.log('🔍 [Widget] Anonymous user join request sent - backend will send group data via "group updated" event');
    
            // Get messages with anonymous token - add retry mechanism for better reliability
            console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with token:', anonToken.substring(0, 20) + '...');
            this.socket.emit('get group msg', {
              token: anonToken,
              groupId: parseInt(this.groupId)
            });

            // Add polling for anonymous users to ensure message reception
            setTimeout(() => {
              if (!this.isAuthenticated && this.socket && this.socket.connected) {
                console.log('🔍 [Widget] Anonymous user message polling - requesting messages again');
                this.socket.emit('get group msg', {
                  token: anonToken,
                  groupId: parseInt(this.groupId)
                });
              }
            }, 2000);
    
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
    
        // Validate message against chat limitations
        const validation = this.validateMessageBeforeSending(message);
        if (!validation.valid) {
          alert(validation.error);
          return;
        }

        // Apply censoring to the message (same as F version)
        const censoredMessage = this.applyCensoringToMessage(message);
    
        console.log('🔍 [Widget] Sending message:', censoredMessage);
        console.log('🔍 [Widget] Group ID:', this.groupId, 'User ID:', this.userId);
        console.log('🔍 [Widget] Authenticated:', this.isAuthenticated);
    
        if (this.isAuthenticated) {
          // Send as authenticated user (exact W version format)
          const safeMessage = this.makeTextSafe(censoredMessage);
          const payload = {
            groupId: parseInt(this.groupId),  // Ensure groupId is a number
            msg: safeMessage,
            token: this.userId,
            receiverId: this.getCurrentReceiverId(),
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
          const safeMessage = this.makeTextSafe(censoredMessage);
          const payload = {
            groupId: parseInt(this.groupId),  // Ensure groupId is a number
            msg: safeMessage,
            anonId: this.anonId,
            receiverId: this.getCurrentReceiverId(),
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

        // Update last message time for slow mode tracking
        this.updateLastMessageTime();
    
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

      // Handle timeout notification (same as W version)
      handleTimeoutNotification(data) {
        console.log('⏰ [Widget] Timeout notification received:', data);
        const { timeoutMinutes, expiresAt, message, groupId } = data;
        
        // Store timeout info in localStorage for persistence (same as W version)
        const timeoutInfo = {
          groupId: groupId,
          expiresAt: expiresAt,
          timeoutMinutes: timeoutMinutes
        };
        localStorage.setItem(`timeout_${groupId}`, JSON.stringify(timeoutInfo));
        
        // Show timeout notification
        // alert(message || `You have been timed out for ${timeoutMinutes} minutes.`);
        
        // Disable input and send button during timeout
        this.updateTimeoutUI(true, expiresAt);
      },

      // Update UI during timeout (disable input)
      updateTimeoutUI(isTimedOut, expiresAt) {
        const input = this.dialog.querySelector('.pingbash-message-input');
        const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
        
        if (input) {
          input.disabled = isTimedOut;
          if (isTimedOut) {
            const expiry = new Date(expiresAt);
            const now = new Date();
            const minutesLeft = Math.ceil((expiry - now) / (1000 * 60));
            input.placeholder = `You are timed out for ${minutesLeft} more minutes`;
          } else {
            input.placeholder = 'Type a message...';
          }
        }
        
        if (sendBtn) {
          sendBtn.disabled = isTimedOut;
        }
      },

      // Check for persisted timeout on page load
      checkPersistedTimeout(groupId) {
        try {
          const timeoutKey = `timeout_${groupId}`;
          const timeoutInfo = localStorage.getItem(timeoutKey);
          
          if (timeoutInfo) {
            const parsed = JSON.parse(timeoutInfo);
            const now = new Date().getTime();
            const expiry = new Date(parsed.expiresAt).getTime();
            
            if (expiry > now) {
              // Timeout is still active
              console.log(`⏰ [Widget] Restored timeout state for group ${groupId}, expires at ${parsed.expiresAt}`);
              this.updateTimeoutUI(true, parsed.expiresAt);
              return true;
            } else {
              // Timeout has expired, clean up
              console.log(`⏰ [Widget] Timeout expired for group ${groupId}, cleaning up`);
              localStorage.removeItem(timeoutKey);
              this.updateTimeoutUI(false);
              return false;
            }
          }
          return false;
        } catch (error) {
          console.error(`⏰ [Widget] Error checking persisted timeout:`, error);
          return false;
        }
      },

      // Handle banned users response
      handleBannedUsersReceived(bannedUsers) {
        console.log('🚫 [Widget] Processing banned users:', bannedUsers);
        
        if (!Array.isArray(bannedUsers)) {
          console.warn('🚫 [Widget] Invalid banned users data received');
          bannedUsers = [];
        }
        
        // Store banned users data
        this.bannedUsers = bannedUsers;
        
        // Show unified ban modal with both users and IPs
        this.showBannedUsersModal(bannedUsers, this.ipBans || []);
      },

      // 🆕 Handle IP bans response
      handleIpBansReceived(ipBans) {
        console.log('🌐 [Widget] Processing IP bans:', ipBans);
        
        if (!Array.isArray(ipBans)) {
          console.warn('🌐 [Widget] Invalid IP bans data received');
          ipBans = [];
        }
        
        // Store IP bans data
        this.ipBans = ipBans;
        
        // Update modals if they are currently open
        const bannedUsersModal = document.querySelector('.pingbash-banned-users-modal');
        const ipBansModal = document.querySelector('.pingbash-ip-bans-modal');
        
        if (bannedUsersModal) {
          this.showBannedUsersModal(this.bannedUsers || [], ipBans);
        }
        
        if (ipBansModal) {
          this.showIpBansModal(ipBans); // Refresh IP bans specific modal
        }
      },

      // Handle IP bans response
      handleIpBansReceived(ipBans) {
        console.log('🌐 [Widget] Processing IP bans:', ipBans);
        
        if (!Array.isArray(ipBans)) {
          console.warn('🌐 [Widget] Invalid IP bans data received');
          ipBans = [];
        }
        
        // Store IP bans data
        this.ipBans = ipBans;
        
        // Show IP bans modal/popup
        this.showIpBansModal(ipBans);
      },

      // 🆕 Show unified ban management modal (users + IPs)
      showBannedUsersModal(bannedUsers, ipBans = []) {
        console.log('🚫 [Widget] Showing ban management modal with', bannedUsers.length, 'users and', ipBans.length, 'IP bans');
        
        // Create a simple modal to display banned users
        const modalHtml = `
          <div class="pingbash-banned-users-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483648;
          ">
            <div style="
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 500px;
              max-height: 70vh;
              overflow-y: auto;
              width: 90%;
            ">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;">🚫 Ban Management - Users: ${bannedUsers.length} | IPs: ${ipBans.length}</h3>
                ${bannedUsers.length > 0 ? `
                  <button onclick="window.pingbashWidget.unbanAllUsers()" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                  ">Unban All</button>
                ` : ''}
              </div>
              
              <div class="banned-users-list">
                ${bannedUsers.length > 0 ? 
                  bannedUsers.map((user, index) => `
                    <div style="
                      padding: 12px;
                      border: 1px solid #ddd;
                      margin: 8px 0;
                      border-radius: 6px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      background: #f8f9fa;
                    ">
                      <div style="display: flex; align-items: center;">
                        <input type="checkbox" id="user-${user.id}" style="margin-right: 10px;" onchange="window.pingbashWidget.toggleUserSelection(${user.id}, this.checked)">
                        <label for="user-${user.id}" style="cursor: pointer;">
                          <strong>${user.name || `User ${user.id}`}</strong>
                          <br>
                          <small style="color: #666;">ID: ${user.id} • Banned: ${user.banned_at ? new Date(user.banned_at).toLocaleDateString() : 'Unknown'}</small>
                        </label>
                      </div>
                      <div>
                        <button onclick="window.pingbashWidget.unbanUser(${user.id})" style="
                          background: #28a745;
                          color: white;
                          border: none;
                          padding: 6px 12px;
                          border-radius: 4px;
                          cursor: pointer;
                          margin-left: 5px;
                        ">Unban</button>
                      </div>
                    </div>
                  `).join('') 
                  : '<div style="text-align: center; padding: 40px; color: #666;"><p>🎉 No banned users found!</p><p>All users are currently allowed in this group.</p></div>'
                }
              </div>

              <!-- 🆕 IP Bans Section -->
              <div class="ip-bans-section" style="margin-top: 20px;">
                <h4 style="margin: 10px 0; color: #dc3545;">🌐 Banned IP Addresses (${ipBans.length})</h4>
                <div class="ip-bans-list">
                  ${ipBans.length > 0 ? 
                    ipBans.map((ban, index) => `
                      <div style="
                        padding: 12px;
                        border: 1px solid #ddd;
                        margin: 8px 0;
                        border-radius: 6px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: #fff3cd;
                        border-color: #ffeaa7;
                      ">
                        <div style="flex: 1;">
                          <strong>${ban.ip_address}</strong>
                          <br>
                          <small style="color: #666;">
                            Banned: ${ban.banned_at ? new Date(ban.banned_at).toLocaleDateString() : 'Unknown'} • 
                            By: ${ban.banned_by_name || `User ${ban.banned_by}`}
                          </small>
                        </div>
                        <div>
                          <button onclick="window.pingbashWidget.unbanIpAddress('${ban.ip_address}')" style="
                            background: #28a745;
                            color: white;
                            border: none;
                            padding: 6px 12px;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-left: 5px;
                          ">Unban IP</button>
                        </div>
                      </div>
                    `).join('') 
                    : '<div style="text-align: center; padding: 20px; color: #666;"><p>No IP addresses are currently banned.</p></div>'
                  }
                </div>
              </div>
              
              ${bannedUsers.length > 0 ? `
                <div style="margin: 15px 0; padding: 10px; background: #e9ecef; border-radius: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <label style="cursor: pointer;">
                        <input type="checkbox" id="select-all-users" onchange="window.pingbashWidget.toggleAllUsers(this.checked)" style="margin-right: 8px;">
                        Select All Users
                      </label>
                    </div>
                    <button onclick="window.pingbashWidget.unbanSelectedUsers()" style="
                      background: #ffc107;
                      color: #212529;
                      border: none;
                      padding: 6px 12px;
                      border-radius: 4px;
                      cursor: pointer;
                      font-weight: bold;
                    " disabled id="unban-selected-btn">Unban Selected (0)</button>
                  </div>
                </div>
              ` : ''}
              
              <div style="text-align: right; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                <button onclick="window.pingbashWidget.refreshBannedUsers()" style="
                  background: #17a2b8;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                  margin-right: 10px;
                ">Refresh</button>
                <button onclick="this.closest('.pingbash-banned-users-modal').remove()" style="
                  background: #6c757d;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                ">Close</button>
              </div>
            </div>
          </div>
        `;
        
        // Remove any existing modal
        const existingModal = document.querySelector('.pingbash-banned-users-modal');
        if (existingModal) {
          existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      },

      // 🆕 Refresh IP bans modal
      refreshIpBans() {
        console.log('🔄 [Widget] Refreshing IP bans list');
        
        if (!this.socket || !this.socket.connected) {
          alert("Not connected to server");
          return;
        }

        if (!this.isAuthenticated) {
          alert("Please log in to refresh IP bans");
          return;
        }

        // Re-emit the get IP bans request
        this.socket.emit('get ip bans', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId)
        });
      },

      // Show IP bans modal
      showIpBansModal(ipBans) {
        console.log('🌐 [Widget] Showing IP bans modal with', ipBans.length, 'bans');
        
        // Create a simple modal to display IP bans
        const modalHtml = `
          <div class="pingbash-ip-bans-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483648;
          ">
            <div style="
              background: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              max-height: 70vh;
              overflow-y: auto;
              width: 90%;
            ">
              <h3>🌐 IP Address Bans (${ipBans.length})</h3>
              <p style="margin: 5px 0 15px 0; color: #666; font-size: 14px;">
                Anonymous users are highlighted in yellow with unban options for admins/moderators.
              </p>
              <div class="ip-bans-list">
                ${ipBans.length > 0 ? 
                  ipBans.map(ban => {
                    // Check if this is an anonymous user (user_id is null or > 100000000)
                    const isAnonymousUser = !ban.user_id || ban.user_id > 100000000;
                    const canUnban = window.pingbashWidget && window.pingbashWidget.canManageCensoredContent && window.pingbashWidget.canManageCensoredContent(); // Check if user has permission
                    
                    return `
                      <div style="
                        padding: 12px;
                        border: 1px solid #ddd;
                        margin: 8px 0;
                        border-radius: 6px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: ${isAnonymousUser ? '#fff3cd' : '#f8f9fa'};
                        border-color: ${isAnonymousUser ? '#ffeaa7' : '#ddd'};
                      ">
                        <div style="flex: 1;">
                          <div><strong>IP:</strong> ${ban.ip_address}</div>
                          <div><strong>User:</strong> ${ban.banned_user_name || (isAnonymousUser ? `Anonymous User #${ban.user_id || 'Unknown'}` : `User ${ban.user_id}`)}</div>
                          <div><strong>Banned by:</strong> ${ban.banned_by_name || `User ${ban.banned_by}`}</div>
                          <div><strong>Date:</strong> ${new Date(ban.banned_at).toLocaleString()}</div>
                          ${isAnonymousUser ? '<div style="color: #856404; font-weight: bold;">🎭 Anonymous User IP Ban</div>' : ''}
                        </div>
                        ${isAnonymousUser && canUnban ? `
                          <div>
                            <button onclick="window.pingbashWidget.unbanIpAddress('${ban.ip_address}')" style="
                              background: #28a745;
                              color: white;
                              border: none;
                              padding: 8px 16px;
                              border-radius: 4px;
                              cursor: pointer;
                              font-weight: bold;
                            ">🔓 Unban IP</button>
                          </div>
                        ` : ''}
                      </div>
                    `;
                  }).join('') 
                  : '<div style="text-align: center; padding: 40px; color: #666;"><p>🎉 No IP bans found!</p><p>All IP addresses are currently allowed.</p></div>'
                }
              </div>
              <div style="text-align: right; margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="window.pingbashWidget.refreshIpBans()" style="
                  background: #007bff;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                ">🔄 Refresh</button>
                <button onclick="this.closest('.pingbash-ip-bans-modal').remove()" style="
                  background: #6c757d;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                ">Close</button>
              </div>
            </div>
          </div>
        `;
        
        // Remove any existing modal
        const existingModal = document.querySelector('.pingbash-ip-bans-modal');
        if (existingModal) {
          existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      },

  });
}