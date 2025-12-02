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
        if( window.isDebugging ) console.log('🔍 [Widget] Page visibility changed:', isVisible ? 'visible' : 'hidden');
  
        if (isVisible) {
          if( window.isDebugging ) console.log('🔍 [Widget] Window reactivated - polling for new messages');
  
          // Clear any existing timeout
          if (this.reloadTimeoutRef) {
            clearTimeout(this.reloadTimeoutRef);
          }
  
          // Process any pending messages first
          if (this.pendingMessages.length > 0) {
            if( window.isDebugging ) console.log('🔍 [Widget] Processing', this.pendingMessages.length, 'pending messages');
            const mergedMessages = this.mergeArrays(this.messages || [], this.pendingMessages);
            if( window.isDebugging ) console.log('🔍 [Widget] After merging pending - total messages:', mergedMessages.length);
  
            // Force display of pending messages (bypass optimization checks)
            this.displayPendingMessages(mergedMessages);
            this.pendingMessages = []; // Clear pending messages
          }
  
          // Request fresh inbox unread count when page becomes visible
          if (this.requestInboxUnreadCount) {
            if( window.isDebugging ) console.log('📬 [Widget] Page became visible - requesting fresh inbox unread count');
            setTimeout(() => {
              this.requestInboxUnreadCount();
            }, 300);
          }
  
          // Debounce polling to prevent rapid successive calls
          this.reloadTimeoutRef = setTimeout(() => {
            if( window.isDebugging ) console.log('🔍 [Widget] Polling for new messages - Socket connected:', this.socket?.connected, 'Group ID:', this.groupId);
  
            if (this.socket && this.socket.connected && this.groupId) {
              if( window.isDebugging ) console.log('🔍 [Widget] Emitting GET_GROUP_MSG to poll for new messages');
              // Use socket to poll for messages (same as W version)
              this.socket.emit('get group msg', {
                token: this.userId,
                groupId: parseInt(this.groupId)
              });
            } else {
              if( window.isDebugging ) console.log('🔍 [Widget] Cannot poll messages - missing socket, group ID, or socket disconnected');
            }
          }, 200); // 200ms debounce (same as W version)
        }
      };
  
      // Listen for page visibility changes (same as W version)
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      // Log initial page visibility state
      if( window.isDebugging ) console.log('🔍 [Widget] Page visibility tracking setup complete');
      if( window.isDebugging ) console.log('🔍 [Widget] Initial page visibility:', this.pageVisible);
      if( window.isDebugging ) console.log('🔍 [Widget] Document hidden:', document.hidden);
    },

  // EXACT COPY from widget.js - showSigninModal method
    showSigninModal() {
      if( window.isDebugging ) console.log('🔍 [Widget] showSigninModal called');
      const modal = this.dialog.querySelector('.pingbash-signin-modal');
      modal.style.display = 'flex';
    },

  // EXACT COPY from widget.js - hideSigninModal method
    hideSigninModal() {
      const modal = this.dialog.querySelector('.pingbash-signin-modal');
      modal.style.display = 'none';
    },

    // Show signup modal
    showSignupModal() {
      if( window.isDebugging ) console.log('🔍 [Widget] showSignupModal called');
      const modal = this.dialog.querySelector('.pingbash-signup-modal');
      modal.style.display = 'flex';
      
      // Focus on first input (username)
      const usernameInput = modal.querySelector('#signup-username');
      if (usernameInput) {
        setTimeout(() => usernameInput.focus(), 100);
      }
    },

    // Hide signup modal
    hideSignupModal() {
      const modal = this.dialog.querySelector('.pingbash-signup-modal');
      modal.style.display = 'none';
    },

    // Switch from signin to signup
    switchToSignup() {
      this.hideSigninModal();
      this.showSignupModal();
    },

    // Switch from signup to signin
    switchToSignin() {
      this.hideSignupModal();
      this.showSigninModal();
    },

    // Show verification modal
    showVerificationModal(email) {
      if( window.isDebugging ) console.log('📧 [Widget] showVerificationModal called for:', email);
      this.hideSignupModal();
      
      const modal = this.dialog.querySelector('.pingbash-verification-modal');
      const emailDisplay = modal.querySelector('.pingbash-verification-email');
      
      if (emailDisplay) {
        emailDisplay.textContent = email;
      }
      
      modal.style.display = 'flex';
      
      // Store email for verification
      this.verificationEmail = email;
      
      // Reset OTP inputs
      this.resetOtpInputs();
      
      // Start countdown timer
      this.startVerificationTimer();
      
      // Focus first OTP input
      const firstInput = modal.querySelector('.pingbash-otp-input[data-index="0"]');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    },

    // Hide verification modal
    hideVerificationModal() {
      const modal = this.dialog.querySelector('.pingbash-verification-modal');
      modal.style.display = 'none';
      
      // Clear timer
      if (this.verificationTimer) {
        clearInterval(this.verificationTimer);
        this.verificationTimer = null;
      }
    },

    // Reset OTP inputs
    resetOtpInputs() {
      const inputs = this.dialog.querySelectorAll('.pingbash-otp-input');
      inputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled');
      });
    },

    // Start verification countdown timer
    startVerificationTimer() {
      const timerDisplay = this.dialog.querySelector('.pingbash-timer-display');
      const resendBtn = this.dialog.querySelector('.pingbash-resend-btn');
      
      let timeLeft = 300; // 5 minutes in seconds
      
      // Clear existing timer
      if (this.verificationTimer) {
        clearInterval(this.verificationTimer);
      }
      
      // Enable resend button after timer expires
      resendBtn.disabled = true;
      
      this.verificationTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
          clearInterval(this.verificationTimer);
          this.verificationTimer = null;
          resendBtn.disabled = false;
          timerDisplay.textContent = 'Expired';
        }
        
        timeLeft--;
      }, 1000);
    },

  // EXACT COPY from widget.js - continueAsAnonymous method
    continueAsAnonymous() {
      if( window.isDebugging ) console.log('👤 [Widget] Continuing as anonymous user - START');
  
      try {
        this.hideSigninModal();
        if( window.isDebugging ) console.log('👤 [Widget] Sign-in modal hidden');
  
        this.isAuthenticated = false;
        this.connectAsAuthenticated = false;
        this.authenticatedToken = null;
        if( window.isDebugging ) console.log('👤 [Widget] Authentication state reset');
  
        // Generate anonymous ID using same method as W version
        const anonId = this.getAnonId();
        if( window.isDebugging ) console.log("=== Anon Id ====", anonId);
  
        // Set anonymous user state (same as W version)
        this.anonId = anonId;
        this.currentUserId = anonId;
  
        // Create anonymous token with separators to prevent parsing issues
        const anonToken = `anonuser_${this.config.groupName}_${anonId}`;
        this.userId = anonToken;
  
        // Store anonymous token in localStorage (same as W version)
        localStorage.setItem('anonToken', anonToken);
  
        // Initialize socket for anonymous user
        this.initializeSocket();
  
        // Register as anonymous user (same as W version) - only if not already registered
        if (this.socket && this.socket.connected && !this.anonUserRegistered) {
          if( window.isDebugging ) console.log('👤 [Widget] Registering as anonymous user with ID:', anonId);
          this.socket.emit('user logged as annon', { userId: anonId });
          this.anonUserRegistered = true;
          if( window.isDebugging ) console.log('👤 [Widget] Anonymous user registered in continueAsAnonymous');
        } else if (this.anonUserRegistered) {
          if( window.isDebugging ) console.log('👤 [Widget] Anonymous user already registered, skipping duplicate');
        } else {
          // If socket not ready, register after connection
          setTimeout(() => {
            if (this.socket && this.socket.connected && !this.anonUserRegistered) {
              if( window.isDebugging ) console.log('👤 [Widget] Registering as anonymous user with ID (delayed):', anonId);
              this.socket.emit('user logged as annon', { userId: anonId });
              this.anonUserRegistered = true;
              if( window.isDebugging ) console.log('👤 [Widget] Anonymous user registered (delayed) in continueAsAnonymous');
            }
          }, 1000);
        }
  
        // Trigger chat rules after manual anonymous selection (same as W version)
        setTimeout(() => {
          if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after manual anonymous selection');
          this.triggerChatRulesAfterLogin(anonToken, 'anonymous');
        }, 1500); // Delay to ensure anonymous registration completes
  
        if( window.isDebugging ) console.log('👤 [Widget] Continuing as anonymous user - COMPLETED');
  
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
  
      const emailOrUsername = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!emailOrUsername.trim()) {
        this.showError('Please enter your username or email');
        emailInput.focus();
        return;
      }
  
      if (!password.trim()) {
        this.showError('Please enter your password');
        passwordInput.focus();
        return;
      }
    
      try {
        if( window.isDebugging ) console.log('🔐 [Widget] Attempting sign in...');
  
        const requestBody = {
          Email: emailOrUsername, // Can be username or email
          Password: password,
          Role: 1
        };
    
          if( window.isDebugging ) console.log('🔐 [Widget] Request URL:', `${this.config.apiUrl}/api/user/login`);
          if( window.isDebugging ) console.log('🔐 [Widget] Request body:', requestBody);
    
          // Use exact W version sign-in API format
          const response = await fetch(`${this.config.apiUrl}/api/user/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
    
          if( window.isDebugging ) console.log('🔐 [Widget] Response status:', response.status);
    
          // Try to get response text regardless of status
          const responseText = await response.text();
          if( window.isDebugging ) console.log('🔐 [Widget] Response text:', responseText);
    
          if (!response.ok) {
            if (response.status === 403) {
              throw new Error(`Forbidden: ${responseText}`);
            }
            throw new Error(`Sign in failed: ${response.status} - ${responseText}`);
          }
    
          // Parse the response text as JSON
          const result = JSON.parse(responseText);
          if( window.isDebugging ) console.log('✅ [Widget] Sign in successful:', result);
    
          // Store token and user info (W version format)
          this.userId = result.token;
          this.currentUserId = result.id;
          this.isAuthenticated = true;
    
          if( window.isDebugging ) console.log('🔍 [Widget] Sign-in successful - stored values:', {
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
          if( window.isDebugging ) console.log('🔐 [Widget] Initializing socket with authenticated user...');
          if( window.isDebugging ) console.log('🔐 [Widget] - Authenticated token:', result.token.substring(0, 20) + '...');
    
          // Set a flag to indicate we're connecting as authenticated user
          this.connectAsAuthenticated = true;
          
          // Debug token storage
          if( window.isDebugging ) console.log('🔐 [Widget] Storing authentication token:', {
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
            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after logged-in authentication');
            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Current state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
            this.triggerChatRulesAfterLogin(result.token, 'logged-in');
          }, 1500); // Delay to ensure group state is properly set
    
        } catch (error) {
          console.error('❌ [Widget] Sign in error:', error);
          this.showError('Sign in failed. Please check your credentials.');
        }
      },

      // Handle signup form submission
      async handleSignup() {
        const usernameInput = this.dialog.querySelector('#signup-username');
        const emailInput = this.dialog.querySelector('#signup-email');
        const passwordInput = this.dialog.querySelector('#signup-password');
        const confirmPasswordInput = this.dialog.querySelector('#signup-confirm-password');

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Basic validation
        if (!username) {
          alert('Please enter a username');
          usernameInput.focus();
          return;
        }

        if (username.length < 3) {
          alert('Username must be at least 3 characters long');
          usernameInput.focus();
          return;
        }

        if (!email) {
          alert('Please enter your email address');
          emailInput.focus();
          return;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          alert('Please enter a valid email address');
          emailInput.focus();
          return;
        }

        if (!password) {
          alert('Please enter a password');
          passwordInput.focus();
          return;
        }

        if (password.length < 6) {
          alert('Password must be at least 6 characters long');
          passwordInput.focus();
          return;
        }

        if (!confirmPassword) {
          alert('Please confirm your password');
          confirmPasswordInput.focus();
          return;
        }

        if (password !== confirmPassword) {
          alert('Passwords do not match');
          passwordInput.focus();
          return;
        }

        try {
          if( window.isDebugging ) console.log('🔐 [Widget] Attempting sign up...');

          const requestBody = {
            Username: username,
            Email: email,
            Password: password
          };

          if( window.isDebugging ) console.log('🔐 [Widget] Signup Request URL:', `${this.config.apiUrl}/api/user/register/widget`);
          if( window.isDebugging ) console.log('🔐 [Widget] Signup Request body:', requestBody);

          // Use new simplified widget signup API
          const response = await fetch(`${this.config.apiUrl}/api/user/register/widget`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if( window.isDebugging ) console.log('🔐 [Widget] Signup Response status:', response.status);

          // Try to get response text regardless of status
          const responseText = await response.text();
          if( window.isDebugging ) console.log('🔐 [Widget] Signup Response text:', responseText);

          if (!response.ok) {
            if (response.status === 409) {
              throw new Error('An account with this username or email already exists');
            } else if (response.status === 400) {
              throw new Error('Invalid registration data provided');
            }
            throw new Error(`Sign up failed: ${response.status} - ${responseText}`);
          }

          // Parse the response text as JSON
          const result = JSON.parse(responseText);
          if( window.isDebugging ) console.log('✅ [Widget] Sign up successful:', result);

          // Auto-signin without verification requirement
          if( window.isDebugging ) console.log('✅ [Widget] Auto-signing in after successful registration...');
          
          // Store token and user info
          this.userId = result.token;
          this.currentUserId = result.id;
          this.isAuthenticated = true;

          // Save to localStorage
          localStorage.setItem('pingbash_token', result.token);
          localStorage.setItem('pingbash_user_id', result.id);

          // Hide modal and continue
          this.hideSignupModal();

          // Show success message (optional verification link sent)
          if (result.verificationLinkSent) {
            alert('Account created successfully! We\'ve sent a verification link to your email (optional).');
          } else {
            alert('Account created successfully! Welcome to ' + this.config.groupName + '!');
          }

          // Initialize socket with authenticated user
          if( window.isDebugging ) console.log('🔐 [Widget] Initializing socket with authenticated user after signup...');
          this.connectAsAuthenticated = true;
          this.authenticatedToken = result.token;
          
          this.initializeSocket();

          this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
        } catch (error) {
          console.error('❌ [Widget] Sign up error:', error);
          alert(`Sign up failed: ${error.message}`);
        }
      },

      // Handle email verification
      async handleVerification() {
        // Prevent double submission
        if (this.isVerifying) {
          if( window.isDebugging ) console.log('⚠️ [Widget] Verification already in progress, ignoring...');
          return;
        }
        
        const inputs = this.dialog.querySelectorAll('.pingbash-otp-input');
        const otp = Array.from(inputs).map(input => input.value).join('');
        
        if (otp.length !== 4) {
          alert('Please enter the complete 4-digit verification code');
          return;
        }
        
        if (!this.verificationEmail) {
          alert('Email not found. Please try signing up again.');
          return;
        }
        
        // Set verification flag to prevent double submission
        this.isVerifying = true;
        if( window.isDebugging ) console.log('📧 [Widget] Setting isVerifying flag to prevent double submission');
        
        // Disable verify button
        const verifyBtn = this.dialog.querySelector('.pingbash-verify-btn');
        if (verifyBtn) {
          verifyBtn.disabled = true;
          verifyBtn.textContent = 'Verifying...';
        }
        
        try {
          if( window.isDebugging ) console.log('📧 [Widget] Attempting email verification...');
          
          const requestBody = {
            email: this.verificationEmail,
            otp: parseInt(otp)
          };
          
          if( window.isDebugging ) console.log('📧 [Widget] Verification Request URL:', `${this.config.apiUrl}/api/user/confirm/group`);
          if( window.isDebugging ) console.log('📧 [Widget] Verification Request body:', requestBody);
          
          const response = await fetch(`${this.config.apiUrl}/api/user/confirm/group`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if( window.isDebugging ) console.log('📧 [Widget] Verification Response status:', response.status);
          
          const responseText = await response.text();
          if( window.isDebugging ) console.log('📧 [Widget] Verification Response text:', responseText);
          
          if (!response.ok) {
            if (response.status === 403) {
              // 403 usually means double submission - first request succeeded, second request found no OTP
              if( window.isDebugging ) console.log('🚫 [Widget] Got 403 - this might be a double submission, checking if verification already succeeded...');
              
              // Wait a bit to give the first request time to save the token
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Check if we already have a token saved (from a previous successful verification)
              const savedToken = localStorage.getItem('pingbash_token');
              const savedUserId = localStorage.getItem('pingbash_user_id');
              
              if( window.isDebugging ) console.log('🔍 [Widget] Checking localStorage after 403:', {
                hasSavedToken: !!savedToken,
                hasSavedUserId: !!savedUserId
              });
              
              if (savedToken && savedUserId) {
                if( window.isDebugging ) console.log('✅ [Widget] Found saved token - verification already succeeded, continuing with existing token');
                
                // Use the saved token instead of throwing error
                this.userId = savedToken;
                this.currentUserId = parseInt(savedUserId);
                this.isAuthenticated = true;
                this.connectAsAuthenticated = true;
                this.authenticatedToken = savedToken;
                
                // Hide modal and continue
                this.hideVerificationModal();
                alert('Account verified successfully! Welcome to Pingbash!');
                
                // Initialize sound settings
                this.initializeSoundSettings();
                
                // Initialize socket
                setTimeout(() => {
                  if( window.isDebugging ) console.log('📧 [Widget] Starting socket initialization with existing token...');
                  this.initializeSocket();
                  
                  setTimeout(() => {
                    this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
                  }, 1500);
                }, 800);
                
                return; // Exit successfully
              }
              
              // If no saved token after waiting, throw the error
              if( window.isDebugging ) console.log('❌ [Widget] No saved token found after 403 - this is a genuine error');
              throw new Error(responseText || 'Verification code not found or expired');
            }
            
            if (response.status === 400) {
              throw new Error('Invalid verification code');
            } else if (response.status === 404) {
              throw new Error('Verification code expired or not found');
            }
            throw new Error(responseText || `Verification failed with status ${response.status}`);
          }
          
          const result = JSON.parse(responseText);
          if( window.isDebugging ) console.log('✅ [Widget] Email verification successful:', result);
          
          // IMPORTANT: Save to localStorage FIRST before any UI updates or alerts
          // This ensures that if there's a double submission, the second request can find the token
          localStorage.setItem('pingbash_token', result.token);
          localStorage.setItem('pingbash_user_id', result.id);
          if( window.isDebugging ) console.log('✅ [Widget] Token saved to localStorage immediately');
          
          // Store token and user info in instance
          this.userId = result.token;
          this.currentUserId = result.id;
          this.isAuthenticated = true;
          
          // Hide verification modal
          this.hideVerificationModal();
          
          // Show success message
          alert('Account verified successfully! Welcome to Pingbash!');
          
          // Ensure sound settings are properly initialized for new users
          this.initializeSoundSettings();
          
          // Initialize socket with authenticated user
          if( window.isDebugging ) console.log('📧 [Widget] Initializing socket with verified user...');
          this.connectAsAuthenticated = true;
          this.authenticatedToken = result.token;
          
          // IMPORTANT: Disconnect existing socket first to avoid 403 errors
          if (this.socket && this.socket.connected) {
            if( window.isDebugging ) console.log('📧 [Widget] Disconnecting existing socket before reconnecting with verified token...');
            this.socket.disconnect();
            this.socket = null;
          }
          
          // Add a delay to ensure old socket is fully disconnected and token is properly set
          setTimeout(() => {
            if( window.isDebugging ) console.log('📧 [Widget] Starting socket initialization after verification delay...');
            this.initializeSocket();
            
            // Trigger chat rules after a longer delay to ensure socket is ready
            setTimeout(() => {
              this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
            }, 1500);
          }, 800);
          
        } catch (error) {
          console.error('❌ [Widget] Email verification error:', error);
          alert(`Verification failed: ${error.message}`);
          
          // Reset verification flag and button on error
          this.isVerifying = false;
          const verifyBtn = this.dialog.querySelector('.pingbash-verify-btn');
          if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
          }
        }
      },

      // Handle resend verification code
      async handleResendCode() {
        if (!this.verificationEmail) {
          alert('Email not found. Please try signing up again.');
          return;
        }
        
        try {
          if( window.isDebugging ) console.log('📧 [Widget] Attempting to resend verification code...');
          
          const requestBody = {
            email: this.verificationEmail
          };
          
          if( window.isDebugging ) console.log('📧 [Widget] Resend Request URL:', `${this.config.apiUrl}/api/user/resend`);
          if( window.isDebugging ) console.log('📧 [Widget] Resend Request body:', requestBody);
          
          const response = await fetch(`${this.config.apiUrl}/api/user/resend`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if( window.isDebugging ) console.log('📧 [Widget] Resend Response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to resend code: ${response.status}`);
          }
          
          if( window.isDebugging ) console.log('✅ [Widget] Verification code resent successfully');
          alert('Verification code resent successfully!');
          
          // Reset OTP inputs and restart timer
          this.resetOtpInputs();
          this.startVerificationTimer();
          
        } catch (error) {
          console.error('❌ [Widget] Resend code error:', error);
          alert('Failed to resend verification code. Please try again.');
        }
      },

  });
}


