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
  
      // Re-attach event listeners when modal is shown (in case they got lost)
      setTimeout(() => {
        const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
        if( window.isDebugging ) console.log('🔍 [Widget] Re-checking Continue As Guest buttons in showSigninModal:', continueAnonBtns.length);
  
        continueAnonBtns.forEach((continueAnonBtn, index) => {
          if (continueAnonBtn && !continueAnonBtn._listenerAttached) {
            if( window.isDebugging ) console.log(`🔍 [Widget] Re-attaching event listener to Continue As Guest button ${index + 1}`);
            continueAnonBtn.addEventListener('click', (event) => {
              if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED (from showSigninModal)!`);
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

    // Show signup modal
    showSignupModal() {
      if( window.isDebugging ) console.log('🔍 [Widget] showSignupModal called');
      const modal = this.dialog.querySelector('.pingbash-signup-modal');
      modal.style.display = 'flex';
      
      // Focus on first input
      const emailInput = modal.querySelector('#signup-email');
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100);
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
  
        // Create anonymous token (same format as W version)
        const anonToken = `anonuser${this.config.groupName}${anonId}`;
        this.userId = anonToken;
  
        // Store anonymous token in localStorage (same as W version)
        localStorage.setItem('anonToken', anonToken);
  
        // Initialize socket for anonymous user
        this.initializeSocket();
  
        // Register as anonymous user (same as W version)
        if (this.socket && this.socket.connected) {
          if( window.isDebugging ) console.log('👤 [Widget] Registering as anonymous user with ID:', anonId);
          this.socket.emit('user logged as annon', { userId: anonId });
        } else {
          // If socket not ready, register after connection
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              if( window.isDebugging ) console.log('👤 [Widget] Registering as anonymous user with ID (delayed):', anonId);
              this.socket.emit('user logged as annon', { userId: anonId });
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
          if( window.isDebugging ) console.log('🔐 [Widget] Attempting sign in...');
    
          const requestBody = {
            Email: email,
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
        const emailInput = this.dialog.querySelector('#signup-email');
        const nameInput = this.dialog.querySelector('#signup-name');
        const passwordInput = this.dialog.querySelector('#signup-password');
        const confirmPasswordInput = this.dialog.querySelector('#signup-confirm-password');

        const email = emailInput.value.trim();
        const name = nameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // Basic validation
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

        if (!name) {
          alert('Please enter your full name');
          nameInput.focus();
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
            Email: email,
            Name: name,
            Password: password
          };

          if( window.isDebugging ) console.log('🔐 [Widget] Signup Request URL:', `${this.config.apiUrl}/api/user/register/group`);
          if( window.isDebugging ) console.log('🔐 [Widget] Signup Request body:', requestBody);

          // Use W version signup API format
          const response = await fetch(`${this.config.apiUrl}/api/user/register/group`, {
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
              throw new Error('An account with this email already exists');
            } else if (response.status === 400) {
              throw new Error('Invalid registration data provided');
            }
            throw new Error(`Sign up failed: ${response.status} - ${responseText}`);
          }

          // Parse the response text as JSON
          const result = JSON.parse(responseText);
          if( window.isDebugging ) console.log('✅ [Widget] Sign up successful:', result);

          // Handle verification flow like W version
          if (result.requiresVerification) {
            if( window.isDebugging ) console.log('📧 [Widget] Verification required, showing verification modal');
            this.showVerificationModal(result.email || email);
          } else {
            // Auto-signin if no verification required (backward compatibility)
            if( window.isDebugging ) console.log('✅ [Widget] No verification required, auto-signing in...');
            
            // Store token and user info (W version format)
            this.userId = result.token;
            this.currentUserId = result.id;
            this.isAuthenticated = true;

            // Save to localStorage (same keys as W version)
            localStorage.setItem('pingbash_token', result.token);
            localStorage.setItem('pingbash_user_id', result.id);

            // Hide modal and continue
            this.hideSignupModal();

            // Initialize socket with authenticated user
            if( window.isDebugging ) console.log('🔐 [Widget] Initializing socket with authenticated user after signup...');
            this.connectAsAuthenticated = true;
            this.authenticatedToken = result.token;
            
            this.initializeSocket();

            this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
          }
        } catch (error) {
          console.error('❌ [Widget] Sign up error:', error);
          alert(`Sign up failed: ${error.message}`);
        }
      },

      // Handle email verification
      async handleVerification() {
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
            if (response.status === 400) {
              throw new Error('Invalid verification code');
            } else if (response.status === 404) {
              throw new Error('Verification code expired or not found');
            }
            throw new Error(`Verification failed: ${response.status} - ${responseText}`);
          }
          
          const result = JSON.parse(responseText);
          if( window.isDebugging ) console.log('✅ [Widget] Email verification successful:', result);
          
          // Store token and user info
          this.userId = result.token;
          this.currentUserId = result.id;
          this.isAuthenticated = true;
          
          // Save to localStorage
          localStorage.setItem('pingbash_token', result.token);
          localStorage.setItem('pingbash_user_id', result.id);
          
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
          
          // Add a small delay to ensure token is properly set before socket operations
          setTimeout(() => {
            if( window.isDebugging ) console.log('📧 [Widget] Starting socket initialization after verification delay...');
            this.initializeSocket();
            
            // Trigger chat rules after a short delay to ensure socket is ready
            setTimeout(() => {
              this.triggerChatRulesAfterLogin(this.authenticatedToken, 'logged-in');
            }, 1000);
          }, 500);
          
        } catch (error) {
          console.error('❌ [Widget] Email verification error:', error);
          alert(`Verification failed: ${error.message}`);
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

