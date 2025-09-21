/**
 * Pingbash Chat Widget - Socket Module
 * Socket.IO communication and event handling
 */

// Extend the PingbashChatWidget class with socket methods
Object.assign(PingbashChatWidget.prototype, {
  async loadSocketIO() {
    if (window.io) {
      console.log('📡 [Widget] Socket.IO already loaded');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.0.0/socket.io.min.js';
      script.onload = () => {
        console.log('📡 [Widget] Socket.IO loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ [Widget] Failed to load Socket.IO');
        reject(new Error('Failed to load Socket.IO'));
      };
      document.head.appendChild(script);
    });
  },

  initializeSocket() {
    if (this.socket) {
      console.log('📡 [Widget] Socket already initialized');
      return;
    }

    console.log('📡 [Widget] Initializing socket connection...');
    this.socket = io(this.config.apiUrl, {
      transports: ['polling', 'websocket'],
      timeout: 30000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });

    this.setupSocketEventListeners();
  },

  setupSocketEventListeners() {
    console.log('📡 [Widget] Setting up socket event listeners...');

    // Add debug listener for ALL socket events
    this.socket.onAny((eventName, ...args) => {
      console.log('📥 [Widget] Socket received event:', eventName, args);
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('📡 [Widget] Socket connected');
      this.isConnected = true;
      this.joinGroup();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('📡 [Widget] Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [Widget] Socket connection error:', error);
      this.isConnected = false;
      
      // Show user-friendly error message
      setTimeout(() => {
        if (!this.isConnected) {
          console.log('📡 [Widget] Connection failed, showing offline message');
          this.showConnectionError();
        }
      }, 5000);
    });

    // Group events
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
      } else if (group && group.id && !this.groupId) {
        // If we don't have a group ID yet, set it
        console.log('✅ [Widget] Setting group ID from group updated event:', group.id);
        this.groupId = group.id;
      }

      // Request online users after getting group data
      if (group && group.id === parseInt(this.groupId)) {
        this.requestOnlineUsers();
      }
      
      // Update group name in header if needed
      const groupNameDisplay = this.dialog?.querySelector('.pingbash-group-name-display');
      if (groupNameDisplay) {
        groupNameDisplay.textContent = group.name || this.config.groupName;
      }
    });

    // Message events
    this.socket.on('get group msg', (messages) => {
      console.log('🔍 [Widget] Received get group msg:', messages?.length);
      if (messages && Array.isArray(messages)) {
        this.displayMessages(messages);
      }
    });

    this.socket.on('send group msg', (messages) => {
      console.log('🔍 [Widget] Received send group msg (real-time):', messages?.length);
      console.log('🔍 [Widget] Raw message data:', messages);
      this.handleNewMessages(messages);
    });

    // Authentication events (HTTP-based, handled in auth.js)
    // Anonymous user authentication (no response expected - same as original widget.js)

    this.socket.on('join to group', (response) => {
      console.log('🔍 [Widget] join to group response:', response);
      
      // Handle different response formats
      if (response && response.success) {
        if (response.groupId) {
          console.log('✅ [Widget] Setting group ID from join response:', response.groupId);
          this.groupId = response.groupId;
        }
        this.currentUserId = response.userId || this.currentUserId;
        
        // Request initial messages for authenticated users
        if (this.isAuthenticated && this.authenticatedToken) {
          console.log('🔍 [Widget] Requesting messages for authenticated user');
          this.socket.emit('get group msg', { 
            groupId: parseInt(this.groupId),
            token: this.authenticatedToken 
          });
        } else {
          console.log('🔍 [Widget] Requesting messages for anonymous user');
          this.socket.emit('get group msg', { 
            groupId: parseInt(this.groupId),
            token: this.userId 
          });
        }
        
        // Request online users
        this.requestOnlineUsers();
      } else if (response && response.groupId && response.groupId !== this.groupId) {
        // Check if the response contains group information that can help us resolve the real ID
        console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
        // This might happen if the backend resolved the hash to a real ID
        this.groupId = response.groupId;
      }
    });

    this.socket.on('join to group anon', (response) => {
      console.log('🔍 [Widget] join to group anon response:', response);
      
      // Handle response same as original widget.js - only check for group ID updates
      if (response && response.groupId && response.groupId !== this.groupId) {
        console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
        // This might happen if the backend resolved the hash to a real ID
        this.groupId = response.groupId;
      }
    });

    // Online users events
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
      console.log('📡 [Widget] Socket disconnected:', reason);
      this.isConnected = false;
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (!this.isConnected) {
          console.log('📡 [Widget] Attempting to reconnect...');
          this.socket.connect();
        }
      }, 3000);
    });

    // Chat rules events
    this.socket.on('get chat rules', (response) => {
      console.log('📋 [Widget] [Chat Rules] Received chat rules:', response);
      this.handleGetChatRules(response);
    });

    this.socket.on('update chat rules', (response) => {
      console.log('📋 [Widget] [Chat Rules] Update chat rules response:', response);
      this.handleUpdateChatRules(response);
    });

    // Admin events
    this.socket.on('ban user', (response) => {
      console.log('🚫 [Widget] Ban user response:', response);
      if (response.success) {
        this.showSuccess('User banned successfully');
      } else {
        this.showError(response.message || 'Failed to ban user');
      }
    });

    this.socket.on('timeout user', (response) => {
      console.log('⏰ [Widget] Timeout user response:', response);
      if (response.success) {
        this.showSuccess('User timed out successfully');
      } else {
        this.showError(response.message || 'Failed to timeout user');
      }
    });

    // File upload events
    this.socket.on('file uploaded', (response) => {
      console.log('📎 [Widget] File uploaded:', response);
      if (response.success) {
        // File upload success is handled in the upload method
      } else {
        this.showError(response.message || 'File upload failed');
      }
    });

    // Groups events
    this.socket.on('get my groups', (groups) => {
      console.log('🔍 [Widget] get my groups:', groups);
      this.handleGroupsReceived(groups, 'my');
    });

    this.socket.on('get fav groups', (groups) => {
      console.log('🔍 [Widget] get fav groups:', groups);
      this.handleGroupsReceived(groups, 'fav');
    });

    // Refresh event
    this.socket.on('refresh', (data) => {
      console.log('🔍 [Widget] refresh:', data);
    });

    // Error events
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

    this.socket.on('error', (error) => {
      console.error('❌ [Widget] Socket error:', error);
      this.showError('Connection error occurred');
    });

    // Generic event logger for debugging
    const originalEmit = this.socket.emit;
    this.socket.emit = (...args) => {
      console.log('📤 [Widget] Socket emit:', args[0], args.slice(1));
      return originalEmit.apply(this.socket, args);
    };
  },

  async joinGroup() {
    if (!this.socket || !this.socket.connected) {
      console.log('📡 [Widget] Socket not connected, cannot join group');
      return;
    }

    try {
      // Resolve group ID - use known groups
      this.groupId = await this.getGroupIdFromName();

      console.log('🔍 [Widget] Joining group:', this.config.groupName, 'ID:', this.groupId);
      console.log('🔍 [Widget] Connect as authenticated:', !!this.connectAsAuthenticated);
      console.log('🔍 [Widget] Is authenticated:', this.isAuthenticated);

      // Check if we have a pending chat rules trigger waiting for group ID
      this.checkAndDisplayPendingChatRules();

      console.log('🔍 [Widget] Authentication state:', {
        isAuthenticated: this.isAuthenticated,
        connectAsAuthenticated: this.connectAsAuthenticated,
        userId: this.userId,
        currentUserId: this.currentUserId,
        anonId: this.anonId
      });

    if (this.connectAsAuthenticated && this.authenticatedToken) {
      // Join as authenticated user
      console.log('🔐 [Widget] Joining as authenticated user');
      this.userId = this.authenticatedToken;

      // Proceed directly with group operations (same as original widget.js)
      console.log('🔍 [Widget] Proceeding with authenticated group operations...');
      this.proceedWithAuthenticatedGroupOperations();
    } else {
      // Check if we're already in the process of joining as anonymous user
      if (this.anonId && this.userId && this.userId.includes('anonuser')) {
        console.log('🔍 [Widget] Anonymous user already joining, skipping duplicate join');
        return;
      }
      
      // Don't automatically join as anonymous - wait for user to click "Continue as Guest"
      console.log('🔍 [Widget] Not authenticated - waiting for user to choose sign in or continue as guest');
    }
    } catch (error) {
      console.error('❌ [Widget] Failed to join group:', error);
      this.showError('Failed to join chat group');
    }
  },

  joinAsAnonymousUser() {
    console.log('🔍 [Widget] Joining as anonymous user after user choice');
    
    // Generate anonymous ID if not exists
    if (!this.anonId) {
      this.anonId = this.getAnonId();
      console.log('🔍 [Widget] Generated anonymous ID:', this.anonId);
    }
    
    // EXACT COPY from original widget.js lines 3070-3099
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
  },

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

  hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  },

  handleGroupsReceived(groups, type) {
    console.log(`🔍 [Widget] handleGroupsReceived (${type}):`, groups);
    
    if (!groups || !Array.isArray(groups)) {
      console.log('🔍 [Widget] No groups received or invalid format');
      return;
    }

    // Look for our target group in the received groups
    const targetGroup = groups.find(group => 
      group.name && group.name.toLowerCase() === this.config.groupName.toLowerCase()
    );

    if (targetGroup && targetGroup.id && targetGroup.id !== this.groupId) {
      console.log('✅ [Widget] Found target group in', type, 'groups:', targetGroup);
      console.log('🔄 [Widget] Updating group ID from', this.groupId, 'to', targetGroup.id);
      
      const oldGroupId = this.groupId;
      this.groupId = targetGroup.id;
      
      // If we have a significant change, rejoin with the correct ID
      if (oldGroupId !== targetGroup.id) {
        console.log('🔄 [Widget] Rejoining with correct group ID...');
        setTimeout(() => {
          this.rejoinGroupWithCorrectId();
        }, 500);
      }
    } else {
      console.log('🔍 [Widget] Target group not found in', type, 'groups');
    }
  },

  requestOnlineUsers() {
    if (!this.socket || !this.socket.connected || !this.groupId) {
      console.log('👥 [Widget] Cannot request online users - socket not ready');
      return;
    }

    console.log('👥 [Widget] Requesting online users for group:', this.groupId, '(public endpoint)');
    this.socket.emit('get group online users', { groupId: parseInt(this.groupId) });
  },

  sendMessage(messageText, parentId = null) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ [Widget] Cannot send message - socket not connected');
      return;
    }

    if (!messageText.trim()) {
      console.log('📤 [Widget] Empty message, not sending');
      return;
    }

    console.log('🔍 [Widget] Group ID:', this.groupId, 'User ID:', this.userId);

    // Make message content safe for transmission
    const safeMessage = this.makeTextSafe(messageText);

    if (this.isAuthenticated) {
      console.log('📤 [Widget] Sending as authenticated user');
      const payload = {
        groupId: parseInt(this.groupId),
        msg: safeMessage,
        token: this.userId,
        receiverId: null,
        parent_id: parentId
      };
      console.log('📤 [Widget] Full payload:', payload);
      this.socket.emit('send group msg', payload);
    } else {
      console.log('📤 [Widget] Sending as anonymous user');
      console.log('📤 [Widget] AnonId:', this.anonId);
      const payload = {
        groupId: parseInt(this.groupId),
        msg: safeMessage,
        anonId: this.anonId,
        receiverId: null,
        parent_id: parentId
      };
      console.log('📤 [Widget] Full payload:', payload);
      this.socket.emit('send group msg', payload);
    }

    // Check if message was sent successfully after 2 seconds
    setTimeout(() => {
      console.log('📤 [Widget] Anonymous message sent 2 seconds ago - checking for response...');
    }, 2000);
  },

  makeTextSafe(text) {
    // Escape special characters that might cause issues in socket transmission
    return text
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/"/g, '\\"')    // Escape quotes
      .replace(/\n/g, '\\n')   // Escape newlines
      .replace(/\r/g, '\\r')   // Escape carriage returns
      .replace(/\t/g, '\\t');  // Escape tabs
  },

  proceedWithAuthenticatedGroupOperations() {
    console.log('🔍 [Widget] Proceeding with authenticated group operations...');
    
    // EXACT COPY from original widget.js lines 3019-3057
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
  },

  rejoinGroupWithCorrectId() {
    if (!this.socket || !this.socket.connected || !this.groupId) {
      console.log('📡 [Widget] Cannot rejoin - socket not ready or no group ID');
      return;
    }

    console.log('🔄 [Widget] Rejoining group with correct ID:', this.groupId);

    if (this.isAuthenticated && this.connectAsAuthenticated) {
      this.socket.emit('join to group', {
        groupName: this.config.groupName,
        token: this.userId
      });
    } else {
      this.socket.emit('join to group anon', {
        groupName: this.config.groupName,
        anonId: this.anonId
      });
    }

    // Request messages with the correct group ID
    setTimeout(() => {
      if (this.isAuthenticated) {
        this.socket.emit('get group msg', {
          groupId: parseInt(this.groupId),
          token: this.userId
        });
      } else {
        this.socket.emit('get group msg', {
          groupId: parseInt(this.groupId),
          anonId: this.anonId
        });
      }
    }, 500);
  }
}); 