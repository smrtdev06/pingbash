/**
 * AUTH functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add auth methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - setupPageVisibilityTracking method
    setupPageVisibilityTracking() {
      const handleVisibilityChange = () => {
        const isVisible = !document.hidden;
        this.pageVisible = isVisible;
        console.log('🔍 [Widget] Page visibility changed:', isVisible ? 'visible' : 'hidden');
  
        if (isVisible) {
          console.log('🔍 [Widget] Window reactivated - polling for new messages');
  
          // Clear any existing timeout
          if (this.reloadTimeoutRef) {
            clearTimeout(this.reloadTimeoutRef);
          }
  
          // Process any pending messages first
          if (this.pendingMessages.length > 0) {
            console.log('🔍 [Widget] Processing', this.pendingMessages.length, 'pending messages');
            const mergedMessages = this.mergeArrays(this.messages || [], this.pendingMessages);
            console.log('🔍 [Widget] After merging pending - total messages:', mergedMessages.length);
  
            // Force display of pending messages (bypass optimization checks)
            this.displayPendingMessages(mergedMessages);
            this.pendingMessages = []; // Clear pending messages
          }
  
          // Debounce polling to prevent rapid successive calls
          this.reloadTimeoutRef = setTimeout(() => {
            console.log('🔍 [Widget] Polling for new messages - Socket connected:', this.socket?.connected, 'Group ID:', this.groupId);
  
            if (this.socket && this.socket.connected && this.groupId) {
              console.log('🔍 [Widget] Emitting GET_GROUP_MSG to poll for new messages');
              // Use socket to poll for messages (same as W version)
              this.socket.emit('get group msg', {
                token: this.userId,
                groupId: parseInt(this.groupId)
              });
            } else {
              console.log('🔍 [Widget] Cannot poll messages - missing socket, group ID, or socket disconnected');
            }
          }, 200); // 200ms debounce (same as W version)
        }
      };
  
      // Listen for page visibility changes (same as W version)
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      // Log initial page visibility state
      console.log('🔍 [Widget] Page visibility tracking setup complete');
      console.log('🔍 [Widget] Initial page visibility:', this.pageVisible);
      console.log('🔍 [Widget] Document hidden:', document.hidden);
    },

  // EXACT COPY from widget.js - showSigninModal method
    showSigninModal() {
      console.log('🔍 [Widget] showSigninModal called');
      const modal = this.dialog.querySelector('.pingbash-signin-modal');
      modal.style.display = 'flex';
  
      // Re-attach event listeners when modal is shown (in case they got lost)
      setTimeout(() => {
        const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
        console.log('🔍 [Widget] Re-checking Continue As Guest buttons in showSigninModal:', continueAnonBtns.length);
  
        continueAnonBtns.forEach((continueAnonBtn, index) => {
          if (continueAnonBtn && !continueAnonBtn._listenerAttached) {
            console.log(`🔍 [Widget] Re-attaching event listener to Continue As Guest button ${index + 1}`);
            continueAnonBtn.addEventListener('click', (event) => {
              console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED (from showSigninModal)!`);
              event.preventDefault();
              event.stopPropagation();
              this.continueAsAnonymous();
            });
            continueAnonBtn._listenerAttached = true;
          }
        });
      }, 100);
    },

  // EXACT COPY from widget.js - hideSigninModal method
    hideSigninModal() {
      const modal = this.dialog.querySelector('.pingbash-signin-modal');
      modal.style.display = 'none';
    },

  // EXACT COPY from widget.js - continueAsAnonymous method
    continueAsAnonymous() {
      console.log('👤 [Widget] Continuing as anonymous user - START');
  
      try {
        this.hideSigninModal();
        console.log('👤 [Widget] Sign-in modal hidden');
  
        this.isAuthenticated = false;
        this.connectAsAuthenticated = false;
        this.authenticatedToken = null;
        console.log('👤 [Widget] Authentication state reset');
  
        // Generate anonymous ID using same method as W version
        const anonId = this.getAnonId();
        console.log("=== Anon Id ====", anonId);
  
        // Set anonymous user state (same as W version)
        this.anonId = anonId;
        this.currentUserId = anonId;
  
        // Create anonymous token (same format as W version)
        const anonToken = `anonuser${this.config.groupName}${anonId}`;
        this.userId = anonToken;
  
        // Store anonymous token in localStorage (same as W version)
        localStorage.setItem('anonToken', anonToken);
  
        // Initialize socket for anonymous user
        this.initializeSocket();
  
        // Register as anonymous user (same as W version)
        if (this.socket && this.socket.connected) {
          console.log('👤 [Widget] Registering as anonymous user with ID:', anonId);
          this.socket.emit('user logged as annon', { userId: anonId });
        } else {
          // If socket not ready, register after connection
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              console.log('👤 [Widget] Registering as anonymous user with ID (delayed):', anonId);
              this.socket.emit('user logged as annon', { userId: anonId });
            }
          }, 1000);
        }
  
        // Trigger chat rules after manual anonymous selection (same as W version)
        setTimeout(() => {
          console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after manual anonymous selection');
          this.triggerChatRulesAfterLogin(anonToken, 'anonymous');
        }, 1500); // Delay to ensure anonymous registration completes
  
        console.log('👤 [Widget] Continuing as anonymous user - COMPLETED');
  
      } catch (error) {
        console.error('❌ [Widget] Error in continueAsAnonymous:', error);
      }
    },

  // EXACT COPY from widget.js - updateUnreadBadge method
    updateUnreadBadge() {
      const badge = this.button.querySelector('.pingbash-unread-badge');
      if (this.unreadCount > 0 && !this.isOpen) {
        badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount.toString();
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    },


    // EXACT COPY from widget.js - handleSignin method
      async handleSignin() {
        const emailInput = this.dialog.querySelector('#signin-email');
        const passwordInput = this.dialog.querySelector('#signin-password');
    
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
    
        // Email validation (same as W version)
        const isValidEmail = (email) => {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return regex.test(email);
        };
    
        if (!email.trim()) {
          this.showError('Please enter your email address');
          emailInput.focus();
          return;
        }
    
        if (!isValidEmail(email)) {
          this.showError('Please enter a valid email address');
          emailInput.focus();
          return;
        }
    
        if (!password.trim()) {
          this.showError('Please enter your password');
          passwordInput.focus();
          return;
        }
    
        try {
          console.log('🔐 [Widget] Attempting sign in...');
    
          const requestBody = {
            Email: email,
            Password: password,
            Role: 1
          };
    
          console.log('🔐 [Widget] Request URL:', `${this.config.apiUrl}/api/user/login`);
          console.log('🔐 [Widget] Request body:', requestBody);
    
          // Use exact W version sign-in API format
          const response = await fetch(`${this.config.apiUrl}/api/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
    
          console.log('🔐 [Widget] Response status:', response.status);
    
          // Try to get response text regardless of status
          const responseText = await response.text();
          console.log('🔐 [Widget] Response text:', responseText);
    
          if (!response.ok) {
            if (response.status === 403) {
              throw new Error(`Forbidden: ${responseText}`);
            }
            throw new Error(`Sign in failed: ${response.status} - ${responseText}`);
          }
    
          // Parse the response text as JSON
          const result = JSON.parse(responseText);
          console.log('✅ [Widget] Sign in successful:', result);
    
          // Store token and user info (W version format)
          this.userId = result.token;
          this.currentUserId = result.id;
          this.isAuthenticated = true;
    
          console.log('🔍 [Widget] Sign-in successful - stored values:', {
            token: result.token ? 'present' : 'missing',
            userId: result.id,
            currentUserId: this.currentUserId
          });
    
          // Save to localStorage (same keys as W version)
          localStorage.setItem('pingbash_token', result.token);
          localStorage.setItem('pingbash_user_id', result.id);
    
          // Hide modal and continue
          this.hideSigninModal();
    
          // Always initialize socket with authenticated user after login
          console.log('🔐 [Widget] Initializing socket with authenticated user...');
          console.log('🔐 [Widget] - Authenticated token:', result.token.substring(0, 20) + '...');
    
          // Set a flag to indicate we're connecting as authenticated user
          this.connectAsAuthenticated = true;
          
          // Debug token storage
          console.log('🔐 [Widget] Storing authentication token:', {
            tokenLength: result.token?.length,
            tokenStart: result.token?.substring(0, 20) + '...',
            tokenType: typeof result.token,
            hasWhitespace: result.token !== result.token?.trim()
          });
          
          this.authenticatedToken = result.token;
    
          // Initialize socket (this will connect as authenticated user due to the flag)
          this.initializeSocket();
    
          // Update menu visibility after authentication
          setTimeout(() => {
            if (this.updateMenuVisibility) {
              this.updateMenuVisibility();
            }
          }, 2000); // Delay to ensure group data is loaded
    
          // Trigger chat rules after successful login (same as W version)
          setTimeout(() => {
            console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after logged-in authentication');
            console.log('🔍 [Widget] [Chat Rules] Current state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
            this.triggerChatRulesAfterLogin(result.token, 'logged-in');
          }, 1500); // Delay to ensure group state is properly set
    
        } catch (error) {
          console.error('❌ [Widget] Sign in error:', error);
          this.showError('Sign in failed. Please check your credentials.');
        }
      },

  });
}