/**
 * Pingbash Chat Widget - Authentication Module
 * User authentication and session management
 */

// Extend the PingbashChatWidget class with authentication methods
Object.assign(PingbashChatWidget.prototype, {
  showSigninModal() {
    console.log('🔐 [Widget] Showing sign-in modal');
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'flex';
    
    // Focus on email input
    const emailInput = modal.querySelector('#signin-email');
    setTimeout(() => emailInput?.focus(), 100);
  },

  hideSigninModal() {
    console.log('🔐 [Widget] Hiding sign-in modal');
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'none';
    
    // Clear form
    const emailInput = modal.querySelector('#signin-email');
    const passwordInput = modal.querySelector('#signin-password');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  },

  async handleSignin() {
    const emailInput = this.dialog.querySelector('#signin-email');
    const passwordInput = this.dialog.querySelector('#signin-password');
    
    const email = emailInput?.value?.trim();
    const password = passwordInput?.value?.trim();
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }
    
    console.log('🔐 [Widget] Attempting to sign in with email:', email);
    
    // Disable submit button during login
    const submitBtn = this.dialog.querySelector('.pingbash-signin-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
      // Use HTTP API authentication (same as original widget.js)
      console.log('🔐 [Widget] Attempting sign in...');
      console.log('🔐 [Widget] Request URL:', `${this.config.apiUrl}/api/user/login`);
      console.log('🔐 [Widget] Request body:', {
        Email: email,
        Password: password,
        Role: 1
      });

      const response = await fetch(`${this.config.apiUrl}/api/user/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
          Role: 1
        })
      });

      console.log('🔐 [Widget] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Widget] Login failed:', response.status, errorText);
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('🔐 [Widget] Response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [Widget] Failed to parse response:', parseError);
        throw new Error('Invalid response format');
      }

      console.log('✅ [Widget] Sign in successful:', result);

      if (!result.token || !result.id) {
        throw new Error('Invalid response: missing token or id');
      }

      // Store authentication data
      this.authenticatedToken = result.token;
      this.currentUserId = result.id;
      this.userId = result.token;
      this.isAuthenticated = true;
      this.connectAsAuthenticated = true;

      console.log('🔍 [Widget] Sign-in successful - stored values:', {
        token: this.authenticatedToken ? 'present' : 'missing',
        userId: this.currentUserId,
        currentUserId: this.currentUserId
      });

      // Save to localStorage (same keys as W version)
      localStorage.setItem('pingbash_token', this.authenticatedToken);
      localStorage.setItem('pingbash_user_id', this.currentUserId.toString());

      // Hide sign-in modal
      this.hideSigninModal();

      // Initialize socket with authenticated user
      console.log('🔐 [Widget] Initializing socket with authenticated user...');
      console.log('🔐 [Widget] - Authenticated token:', this.authenticatedToken.substring(0, 20) + '...');
      
      if (!this.socket || !this.socket.connected) {
        this.initializeSocket();
      } else {
        // Directly proceed with authenticated group operations (same as original widget.js)
        console.log('🔍 [Widget] About to call proceedWithAuthenticatedGroupOperations...');
        this.proceedWithAuthenticatedGroupOperations();
        console.log('🔍 [Widget] Called proceedWithAuthenticatedGroupOperations');
        
        // Also directly request messages as a fallback
        setTimeout(() => {
          console.log('🔍 [Widget] Direct message request after authentication');
          this.socket.emit('user logged', { token: this.authenticatedToken });
          this.socket.emit('get group msg', {
            groupId: parseInt(this.groupId),
            token: this.authenticatedToken
          });
        }, 500);
      }

      // Trigger chat rules after successful authentication (same as W version)
      setTimeout(() => {
        console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after logged-in authentication');
        console.log('🔍 [Widget] [Chat Rules] Current state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
        this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
      }, 1000);
      
      // Also request messages directly (fallback to ensure messages load)
      setTimeout(() => {
        if (this.socket && this.socket.connected && this.groupId) {
          console.log('🔍 [Widget] Fallback: Requesting messages after authentication');
          this.socket.emit('get group msg', {
            groupId: parseInt(this.groupId),
            token: this.authenticatedToken
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ [Widget] Sign-in error:', error);
      this.showError('Sign-in failed: ' + error.message);
      
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  },

  async handleContinueAsAnonymous() {
    console.log('👤 [Widget] Continuing as anonymous user - START');
    
    try {
      // Generate anonymous ID using same method as W version
      const anonId = this.getAnonId();
      console.log('=== Anon Id ====', anonId);
      
      // Set anonymous state
      this.isAuthenticated = false;
      this.connectAsAuthenticated = false;
      this.authenticatedToken = null;
      this.anonId = anonId;
      this.currentUserId = anonId;
      this.userId = `anonuser${this.config.groupName}${anonId}`;
      
      // Save anonymous token to localStorage (same as W version)
      localStorage.setItem('anonToken', this.userId);
      
      console.log('👤 [Widget] Continuing as anonymous user - COMPLETED');
      
      this.hideSigninModal();
      
      // Trigger chat rules for manual anonymous selection (same as W version)
      console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after manual anonymous selection');
      this.triggerChatRulesAfterLogin(this.userId, 'anonymous');
      
      // Join group as anonymous user
      if (this.socket && this.socket.connected) {
        this.joinAsAnonymousUser();
      } else {
        // If socket not ready, initialize it first
        this.initializeSocket();
      }
      
    } catch (error) {
      console.error('❌ [Widget] Anonymous login error:', error);
      this.showError('Failed to continue as guest');
    }
  },

  logout() {
    console.log('🔐 [Widget] Logging out user');
    
    // Clear authentication state
    this.isAuthenticated = false;
    this.connectAsAuthenticated = false;
    this.authenticatedToken = null;
    this.currentUserId = null;
    this.anonId = null;
    this.userId = null;
    
    // Clear localStorage
    localStorage.removeItem('pingbash_token');
    localStorage.removeItem('pingbash_user_id');
    localStorage.removeItem('anonToken');
    
    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear messages
    this.messages = [];
    this.groupId = null;
    this.group = null;
    
    // Reset UI
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (messagesList) {
      messagesList.innerHTML = '<div class="pingbash-loading">Loading messages...</div>';
    }
    
    // Show sign-in modal
    setTimeout(() => {
      this.initializeSocket();
      this.showSigninModal();
    }, 500);
  },

  // Trigger chat rules after login (same logic as W version)
  triggerChatRulesAfterLogin(token, userType) {
    console.log('🔍 [Widget] [Chat Rules] triggerChatRulesAfterLogin called with:', { token: token?.substring(0, 20) + '...', userType });
    
    // Set pending display info
    this.pendingChatRulesDisplay = {
      groupId: this.groupId,
      userType: userType,
      timestamp: Date.now()
    };
    
    console.log('🔍 [Widget] [Chat Rules] Set pending display:', this.pendingChatRulesDisplay);
    
    // Check if we can display immediately
    this.checkAndDisplayPendingChatRules();
    
    // Also set up a periodic check in case the group info comes later
    const checkInterval = setInterval(() => {
      console.log('🔍 [Widget] [Chat Rules] Checking pending trigger:', {
        hasPending: !!this.pendingChatRulesDisplay.groupId || !!this.pendingChatRulesDisplay.userType,
        pendingGroupId: this.pendingChatRulesDisplay.groupId,
        pendingUserType: this.pendingChatRulesDisplay.userType,
        currentGroupId: this.groupId,
        timeDiff: Date.now() - this.pendingChatRulesDisplay.timestamp
      });
      
      if (this.checkAndDisplayPendingChatRules()) {
        clearInterval(checkInterval);
      }
      
      // Stop checking after 10 seconds
      if (Date.now() - this.pendingChatRulesDisplay.timestamp > 10000) {
        console.log('🔍 [Widget] [Chat Rules] Timeout waiting for group info, stopping periodic check');
        clearInterval(checkInterval);
      }
    }, 1000);
  },

  // Check and display pending chat rules (same logic as W version)
  checkAndDisplayPendingChatRules() {
    if (!this.pendingChatRulesDisplay.userType) {
      console.log('🔍 [Widget] [Chat Rules] No pending chat rules display');
      return false;
    }
    
    if (!this.groupId) {
      console.log('🔍 [Widget] [Chat Rules] Group ID not available yet, waiting...');
      return false;
    }
    
    console.log('🔍 [Widget] [Chat Rules] Conditions met, checking if rules should be displayed');
    console.log('🔍 [Widget] [Chat Rules] Group ID:', this.groupId);
    console.log('🔍 [Widget] [Chat Rules] Has seen rules for this group:', this.hasSeenRulesForGroup[this.groupId]);
    
    // Check if user has already seen rules for this group
    if (this.hasSeenRulesForGroup[this.groupId]) {
      console.log('🔍 [Widget] [Chat Rules] User has already seen rules for group', this.groupId, '- skipping display');
      this.pendingChatRulesDisplay = { groupId: null, userType: null, timestamp: 0 };
      return true;
    }
    
    console.log('🔍 [Widget] [Chat Rules] User has NOT seen rules for group', this.groupId, '- will display rules');
    
    // Display chat rules after a short delay to ensure UI is ready
    setTimeout(() => {
      console.log('🔍 [Widget] [Chat Rules] Displaying chat rules for first-time user');
      this.showChatRules();
    }, 1500);
    
    // Clear pending display
    this.pendingChatRulesDisplay = { groupId: null, userType: null, timestamp: 0 };
    return true;
  },

  // Setup page visibility tracking (same as W version)
  setupPageVisibilityTracking() {
    console.log('🔍 [Widget] Setting up page visibility tracking');
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.pageVisible = !document.hidden;
      console.log('🔍 [Widget] Page visibility changed:', this.pageVisible ? 'visible' : 'hidden');
      
      if (this.pageVisible) {
        console.log('🔍 [Widget] Window reactivated - polling for new messages');
        this.pollForNewMessages();
      }
    });
    
    // Handle window focus/blur
    window.addEventListener('focus', () => {
      this.pageVisible = true;
      console.log('🔍 [Widget] Window focused - polling for new messages');
      this.pollForNewMessages();
    });
    
    window.addEventListener('blur', () => {
      this.pageVisible = false;
      console.log('🔍 [Widget] Window blurred');
    });
  },

  // Poll for new messages when page becomes visible (same as W version)
  pollForNewMessages() {
    if (!this.socket || !this.socket.connected || !this.groupId) {
      console.log('🔍 [Widget] Cannot poll for messages - socket not ready');
      return;
    }
    
    console.log('🔍 [Widget] Polling for new messages - Socket connected:', this.socket.connected, 'Group ID:', this.groupId);
    console.log('🔍 [Widget] Emitting GET_GROUP_MSG to poll for new messages');
    
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
  },

  // Admin functions
  banUser(userId) {
    if (!this.isAuthenticated) {
      this.showError('You must be signed in to ban users');
      return;
    }
    
    if (!confirm('Are you sure you want to ban this user?')) {
      return;
    }
    
    console.log('🚫 [Widget] Banning user:', userId);
    this.socket.emit('ban user', {
      groupId: parseInt(this.groupId),
      userId: parseInt(userId),
      token: this.userId
    });
  },

  timeoutUser(userId) {
    if (!this.isAuthenticated) {
      this.showError('You must be signed in to timeout users');
      return;
    }
    
    if (!confirm('Are you sure you want to timeout this user?')) {
      return;
    }
    
    console.log('⏰ [Widget] Timing out user:', userId);
    this.socket.emit('timeout user', {
      groupId: parseInt(this.groupId),
      userId: parseInt(userId),
      token: this.userId
    });
  }
}); 