/**
 * EVENTS functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add events methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

    // EXACT COPY from widget.js - attachEventListeners method
    attachEventListeners() {
      // Chat button click
      this.button.addEventListener('click', () => this.toggleDialog());

      // Filter dropdown (same as F version)
      const filterIcon = this.dialog.querySelector('.pingbash-filter-icon');
      const filterDropdown = this.dialog.querySelector('.pingbash-filter-dropdown');
      
      if (filterIcon && filterDropdown) {
        filterIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          const isVisible = filterDropdown.style.display !== 'none';
          filterDropdown.style.display = isVisible ? 'none' : 'block';
          
          // Update mods option visibility when opening dropdown
          if (!isVisible) { // Opening the dropdown
            const modsOption = this.dialog.querySelector('.pingbash-mods-option');
            if (modsOption) {
              if (this.isAuthenticated && this.isModeratorOrAdmin()) {
                modsOption.style.display = 'block';
                if( window.isDebugging ) console.log('🔍 [Widget] Showing mods option for admin/moderator');
              } else {
                modsOption.style.display = 'none';
                if( window.isDebugging ) console.log('🔍 [Widget] Hiding mods option for regular user/anonymous');
              }
            }
          }
          
          // Close hamburger dropdown if open
          const hamburgerDropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
          if (hamburgerDropdown) {
            hamburgerDropdown.style.display = 'none';
          }
        });

        // Filter mode radio buttons (same as F version)
        const filterRadios = this.dialog.querySelectorAll('input[name="filter-mode"]');
        filterRadios.forEach(radio => {
          radio.addEventListener('change', (e) => {
            const filterMode = parseInt(e.target.value);
            this.handleFilterModeChange(filterMode);
          });

          radio.addEventListener('click', (e) => {
            this.handleFilterModeChange(parseInt(e.target.value));
          });
        });

        // User search now handled by modal - no inline search needed
      }

      // Popout button (mobile only)
      const popoutBtn = this.dialog.querySelector('.pingbash-popout-btn');
      popoutBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePopoutMode();
      });

      // Popup button - Toggle between embedded and popup modes
      const popupBtn = this.dialog.querySelector('.pingbash-popup-btn');
      popupBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isEmbeddedMode) {
          if( window.isDebugging ) console.log('🎯 [Widget] Popup button clicked - converting to popup mode');
          this.convertToPopupMode();
        } else {
          if( window.isDebugging ) console.log('🎯 [Widget] Popup button clicked - converting to embedded mode');
          this.convertToEmbeddedMode();
        }
      });

      // Hamburger menu
      const hamburgerBtn = this.dialog.querySelector('.pingbash-hamburger-btn');
      const hamburgerDropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');

      hamburgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleHamburgerMenu();
        
        // Close filter dropdown if open
        if (filterDropdown) {
          filterDropdown.style.display = 'none';
        }
      });

      // Settings menu
      const settingsBtn = this.dialog.querySelector('.pingbash-settings-btn');
      const settingsDropdown = this.dialog.querySelector('.pingbash-settings-dropdown');

      settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSettingsMenu();
        
        // Close hamburger dropdown if open
        if (hamburgerDropdown) {
          hamburgerDropdown.style.display = 'none';
        }
        // Close filter dropdown if open
        if (filterDropdown) {
          filterDropdown.style.display = 'none';
        }
      });

      // Hamburger menu items
      const menuItems = this.dialog.querySelectorAll('.pingbash-menu-item');
      menuItems.forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          this.handleMenuAction(action);
          this.hideHamburgerMenu();
          this.hideSettingsMenu();
        });
      });

      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!hamburgerBtn?.contains(e.target) && !hamburgerDropdown?.contains(e.target)) {
          this.hideHamburgerMenu();
        }
        if (!settingsBtn?.contains(e.target) && !settingsDropdown?.contains(e.target)) {
          this.hideSettingsMenu();
        }
        if (!e.target.closest('.pingbash-filter-container')) {
          if (filterDropdown) {
            filterDropdown.style.display = 'none';
          }
        }
        if (!e.target.closest('.pingbash-user-search')) {
          const userDropdown = this.dialog.querySelector('.pingbash-user-dropdown');
          if (userDropdown) {
            userDropdown.style.display = 'none';
          }
        }
      });

      // Logo click to open Pingbash website
      const logo = this.dialog.querySelector('.pingbash-logo');
      if( window.isDebugging ) console.log('🔍 [Widget] Logo element found:', !!logo, logo);

      if (logo) {
        // Add visual indicator that logo is clickable
        logo.style.cursor = 'pointer';
        logo.style.transition = 'opacity 0.2s';
        logo.title = 'Visit Pingbash.com';

        logo.addEventListener('click', (e) => {
          if( window.isDebugging ) console.log('🔍 [Widget] Logo clicked - opening Pingbash website');
          if( window.isDebugging ) console.log('🔍 [Widget] Event details:', e);
          e.preventDefault();
          e.stopPropagation();

          // Open Pingbash groupChat page in new window
          window.open('https://pingbash.com/groupChat', '_blank', 'noopener,noreferrer');
        });

        // Add hover effect
        logo.addEventListener('mouseenter', () => {
          logo.style.opacity = '0.8';
        });

        logo.addEventListener('mouseleave', () => {
          logo.style.opacity = '1';
        });
      } else {
        console.error('❌ [Widget] Logo element not found! Available elements:',
          Array.from(this.dialog.querySelectorAll('img')).map(img => ({
            src: img.src,
            className: img.className,
            alt: img.alt
          }))
        );
      }

      // Close modals when clicking outside (handled by modal overlay clicks)
      // Modal overlays will handle the click outside functionality

      // Message input
      const input = this.dialog.querySelector('.pingbash-message-input');
      const sendBtn = this.dialog.querySelector('.pingbash-send-btn');

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Handle @ mentions
      input.addEventListener('input', (e) => {
        this.handleInputChange(e);
      });

      input.addEventListener('keydown', (e) => {
        this.handleMentionNavigation(e);
      });

      sendBtn.addEventListener('click', () => this.sendMessage());

      // Media buttons
      const imageBtn = this.dialog.querySelector('.pingbash-image-btn');
      const fileBtn = this.dialog.querySelector('.pingbash-file-btn');
      const emojiBtn = this.dialog.querySelector('.pingbash-emoji-btn');
      const soundBtn = this.dialog.querySelector('.pingbash-sound-btn');

      imageBtn?.addEventListener('click', () => this.handleImageUpload());
      fileBtn?.addEventListener('click', () => this.handleFileUpload());
      emojiBtn?.addEventListener('click', () => this.toggleEmojiPicker());
      soundBtn?.addEventListener('click', () => this.showSoundSettings());

      // Sound popup
      const soundPopup = this.dialog.querySelector('.pingbash-sound-popup');
      const soundCloseBtn = soundPopup?.querySelector('.pingbash-popup-close');
      const soundOkBtn = soundPopup?.querySelector('.pingbash-sound-ok-btn');
      const soundOverlay = soundPopup?.querySelector('.pingbash-popup-overlay');

      soundCloseBtn?.addEventListener('click', () => this.hideSoundSettings());
      soundOkBtn?.addEventListener('click', () => this.saveSoundSettings());
      soundOverlay?.addEventListener('click', () => this.hideSoundSettings());

      // Reply preview close button event listener
      const replyCloseBtn = this.dialog.querySelector('.pingbash-reply-preview-close');
      replyCloseBtn?.addEventListener('click', () => {
        if( window.isDebugging ) console.log('💬 [Widget] Reply preview close button clicked');
        this.hideReplyPreview();
      });

      // Sign-in modal
      const signinModal = this.dialog.querySelector('.pingbash-signin-modal');
      const signinCloseBtn = signinModal?.querySelector('.pingbash-popup-close');
      const signinSubmitBtn = this.dialog.querySelector('.pingbash-signin-submit-btn');
      const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
      const signinOverlay = signinModal?.querySelector('.pingbash-popup-overlay');

      if( window.isDebugging ) console.log('🔍 [Widget] Button elements found:', {
        signinCloseBtn: !!signinCloseBtn,
        signinSubmitBtn: !!signinSubmitBtn,
        continueAnonBtns: continueAnonBtns.length
      });

      // Debug: Add visual indicator to all continue buttons
      continueAnonBtns.forEach((btn, index) => {
        btn.style.border = '2px solid red';
        btn.style.backgroundColor = '#ffcccc';
        if( window.isDebugging ) console.log(`🔍 [Widget] Continue button ${index + 1} styled for debugging`);
      });

      signinCloseBtn?.addEventListener('click', () => this.hideSigninModal());
      signinSubmitBtn?.addEventListener('click', () => this.handleSignin());
      
      // Signup modal event listeners
      const signupModal = this.dialog.querySelector('.pingbash-signup-modal');
      const signupCloseBtn = signupModal?.querySelector('.pingbash-popup-close');
      const signupSubmitBtn = this.dialog.querySelector('.pingbash-signup-submit-btn');
      const signupOverlay = signupModal?.querySelector('.pingbash-popup-overlay');
      const showSignupBtn = this.dialog.querySelector('.pingbash-show-signup-btn');
      const showSigninBtn = this.dialog.querySelector('.pingbash-show-signin-btn');

      signupCloseBtn?.addEventListener('click', () => this.hideSignupModal());
      signupSubmitBtn?.addEventListener('click', () => this.handleSignup());
      signupOverlay?.addEventListener('click', () => this.hideSignupModal());
      showSignupBtn?.addEventListener('click', () => this.switchToSignup());
      showSigninBtn?.addEventListener('click', () => this.switchToSignin());

               // Add Enter key support for signup form
       const signupInputs = this.dialog.querySelectorAll('#signup-email, #signup-name, #signup-password, #signup-confirm-password');
       signupInputs.forEach(input => {
         input.addEventListener('keypress', (e) => {
           if (e.key === 'Enter') {
             e.preventDefault();
             this.handleSignup();
           }
         });
       });

       // Verification modal event listeners
       const verificationModal = this.dialog.querySelector('.pingbash-verification-modal');
       const verificationCloseBtn = verificationModal?.querySelector('.pingbash-popup-close');
       const verifyBtn = this.dialog.querySelector('.pingbash-verify-btn');
       const resendBtn = this.dialog.querySelector('.pingbash-resend-btn');
       const verificationOverlay = verificationModal?.querySelector('.pingbash-popup-overlay');
       const backToSigninBtn = this.dialog.querySelector('.pingbash-back-to-signin-btn');

       verificationCloseBtn?.addEventListener('click', () => this.hideVerificationModal());
       verifyBtn?.addEventListener('click', () => this.handleVerification());
       resendBtn?.addEventListener('click', () => this.handleResendCode());
       verificationOverlay?.addEventListener('click', () => this.hideVerificationModal());
       backToSigninBtn?.addEventListener('click', () => {
         this.hideVerificationModal();
         this.showSigninModal();
       });

       // OTP input handling
       const otpInputs = this.dialog.querySelectorAll('.pingbash-otp-input');
       otpInputs.forEach((input, index) => {
         input.addEventListener('input', (e) => {
           const value = e.target.value;
           
           // Only allow digits
           if (value && !/^\d$/.test(value)) {
             e.target.value = '';
             return;
           }
           
           // Add filled class
           if (value) {
             e.target.classList.add('filled');
             // Auto-focus next input
             if (index < otpInputs.length - 1) {
               otpInputs[index + 1].focus();
             }
             
             // Auto-submit when all fields are filled
             const allValues = Array.from(otpInputs).map(inp => inp.value);
             if (allValues.every(val => val !== '') && allValues.join('').length === 4) {
               this.handleVerification();
             }
           } else {
             e.target.classList.remove('filled');
           }
         });
         
         input.addEventListener('keydown', (e) => {
           // Handle backspace to move to previous input
           if (e.key === 'Backspace' && !input.value && index > 0) {
             otpInputs[index - 1].focus();
           }
         });
       });

      // Attach event listeners to ALL Continue As Guest buttons
      continueAnonBtns.forEach((continueAnonBtn, index) => {
        if( window.isDebugging ) console.log(`🔍 [Widget] Adding click listener to Continue As Guest button ${index + 1}`);
        if( window.isDebugging ) console.log(`🔍 [Widget] Button ${index + 1} properties:`, {
          tagName: continueAnonBtn.tagName,
          className: continueAnonBtn.className,
          disabled: continueAnonBtn.disabled,
          style: continueAnonBtn.style.cssText,
          offsetWidth: continueAnonBtn.offsetWidth,
          offsetHeight: continueAnonBtn.offsetHeight,
          clientWidth: continueAnonBtn.clientWidth,
          clientHeight: continueAnonBtn.clientHeight
        });

        // Try multiple event types to debug
        continueAnonBtn.addEventListener('click', (event) => {
          if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED!`);
          if( window.isDebugging ) console.log('🔍 [Widget] Click event details:', {
            target: event.target,
            currentTarget: event.currentTarget,
            type: event.type
          });
          event.preventDefault();
          event.stopPropagation();
          this.continueAsAnonymous();
        });

        continueAnonBtn.addEventListener('mousedown', () => {
          if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEDOWN!`);
        });

        continueAnonBtn.addEventListener('mouseup', () => {
          if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEUP!`);
        });

        // Also try direct onclick
        continueAnonBtn.onclick = (event) => {
          if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} ONCLICK!`);
          event.preventDefault();
          event.stopPropagation();
          this.continueAsAnonymous();
        };

        // Mark that listener has been attached
        continueAnonBtn._listenerAttached = true;

        if( window.isDebugging ) console.log(`🔍 [Widget] All event listeners added to Continue As Guest button ${index + 1}`);
      });

      if (continueAnonBtns.length === 0) {
        console.error('❌ [Widget] No Continue As Guest buttons found!');
      }
      signinOverlay?.addEventListener('click', () => this.hideSigninModal());

      // Chat rules popup
      const chatRulesPopup = this.dialog.querySelector('.pingbash-chat-rules-popup');
      const chatRulesCloseBtn = chatRulesPopup?.querySelector('.pingbash-popup-close');
      const chatRulesCloseBtnFooter = this.dialog.querySelector('.pingbash-rules-close-btn');
      const chatRulesEditBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
      const chatRulesCancelBtn = this.dialog.querySelector('.pingbash-rules-cancel-btn');
      const chatRulesSaveBtn = this.dialog.querySelector('.pingbash-rules-save-btn');
      const chatRulesOverlay = chatRulesPopup?.querySelector('.pingbash-popup-overlay');

      chatRulesCloseBtn?.addEventListener('click', () => this.hideChatRules());
      chatRulesCloseBtnFooter?.addEventListener('click', () => this.hideChatRules());
      chatRulesEditBtn?.addEventListener('click', () => this.editChatRules());
      chatRulesCancelBtn?.addEventListener('click', () => this.cancelEditChatRules());
      chatRulesSaveBtn?.addEventListener('click', () => this.saveChatRules());
      chatRulesOverlay?.addEventListener('click', () => this.hideChatRules());

      // Chat limitations popup
      const chatLimitationsPopup = this.dialog.querySelector('.pingbash-chat-limitations-popup');
      const chatLimitationsCloseBtn = chatLimitationsPopup?.querySelector('.pingbash-popup-close');
      const chatLimitationsCancelBtn = this.dialog.querySelector('.pingbash-limitations-cancel-btn');
      const chatLimitationsOkBtn = this.dialog.querySelector('.pingbash-limitations-ok-btn');
      const chatLimitationsOverlay = chatLimitationsPopup?.querySelector('.pingbash-popup-overlay');
      const slowModeCheckbox = this.dialog.querySelector('#slow-mode-checkbox');
      const speedRadios = this.dialog.querySelectorAll('input[name="slow-speed"]');

      chatLimitationsCloseBtn?.addEventListener('click', () => this.hideChatLimitations());
      chatLimitationsCancelBtn?.addEventListener('click', () => this.hideChatLimitations());
      chatLimitationsOkBtn?.addEventListener('click', () => this.updateChatLimitations());
      chatLimitationsOverlay?.addEventListener('click', () => this.hideChatLimitations());

      // Slow mode checkbox toggle
      slowModeCheckbox?.addEventListener('change', (e) => {
        this.toggleSlowModeOptions(e.target.checked);
      });

      // Speed radio buttons - show/hide custom input
      speedRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          const customSecondsDiv = this.dialog.querySelector('.pingbash-custom-seconds');
          if (customSecondsDiv) {
            customSecondsDiv.style.display = e.target.value === 'custom' ? 'flex' : 'none';
          }
        });
      });

      // Manage Chat popup
      const manageChatPopup = this.dialog.querySelector('.pingbash-manage-chat-popup');
      const manageChatCloseBtn = manageChatPopup?.querySelector('.pingbash-popup-close');
      const manageChatOverlay = manageChatPopup?.querySelector('.pingbash-popup-overlay');
      const manageChatOptions = this.dialog.querySelectorAll('.pingbash-manage-chat-option');
      const manageChatBackBtn = this.dialog.querySelector('.pingbash-back-to-menu');
      const clearChatBtn = this.dialog.querySelector('.pingbash-clear-chat-btn');

      manageChatCloseBtn?.addEventListener('click', () => this.hideManageChat());
      manageChatOverlay?.addEventListener('click', () => this.hideManageChat());
      
      // Manage chat menu options
      manageChatOptions.forEach(option => {
        option.addEventListener('click', () => {
          const action = option.dataset.action;
          if( window.isDebugging ) console.log('🔧 [Widget] Manage chat option clicked:', action);
          if (action === 'pinned-messages') {
            this.showPinnedMessagesView();
          } else if (action === 'clear-chat') {
            if( window.isDebugging ) console.log('🧹 [Widget] Clear chat option selected, calling clearChat()');
            this.clearChat();
          }
        });
      });

      // Back button in pinned messages view
      manageChatBackBtn?.addEventListener('click', () => {
        this.showManageChatMenu();
      });

      // Clear chat button
      clearChatBtn?.addEventListener('click', () => {
        this.clearChat();
      });

      // Unpin buttons (delegated event handling since they're dynamically created)
      manageChatPopup?.addEventListener('click', (e) => {
        if (e.target.classList.contains('pingbash-unpin-btn')) {
          const messageId = e.target.dataset.messageId;
          this.unpinMessage(messageId);
        }
      });

      // Moderator Management popup
      const moderatorMgmtPopup = this.dialog.querySelector('.pingbash-moderator-management-popup');
      const moderatorMgmtCloseBtn = moderatorMgmtPopup?.querySelector('.pingbash-popup-close');
      const moderatorMgmtOverlay = moderatorMgmtPopup?.querySelector('.pingbash-popup-overlay');
      const moderatorsCancelBtn = this.dialog.querySelector('.pingbash-moderators-cancel-btn');
      const moderatorsSaveBtn = this.dialog.querySelector('.pingbash-moderators-save-btn');

      moderatorMgmtCloseBtn?.addEventListener('click', () => this.hideModeratorManagement());
      moderatorMgmtOverlay?.addEventListener('click', () => this.hideModeratorManagement());
      moderatorsCancelBtn?.addEventListener('click', () => this.hideModeratorManagement());
      moderatorsSaveBtn?.addEventListener('click', () => this.saveModerators());

      // Moderator Permissions popup
      const modPermissionsPopup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      const modPermissionsCloseBtn = modPermissionsPopup?.querySelector('.pingbash-mod-permissions-close');
      const modPermissionsOverlay = modPermissionsPopup?.querySelector('.pingbash-mod-permissions-overlay');
      const modPermissionsCancelBtn = modPermissionsPopup?.querySelector('.pingbash-mod-permissions-cancel');
      const modPermissionsSaveBtn = modPermissionsPopup?.querySelector('.pingbash-mod-permissions-save');

      modPermissionsCloseBtn?.addEventListener('click', () => this.hideModeratorPermissionsPopup());
      modPermissionsOverlay?.addEventListener('click', () => this.hideModeratorPermissionsPopup());
      modPermissionsCancelBtn?.addEventListener('click', () => this.hideModeratorPermissionsPopup());
      modPermissionsSaveBtn?.addEventListener('click', () => this.saveModeratorPermissions());

      // Add checkbox event listeners for debugging and ensuring they work
      modPermissionsPopup?.addEventListener('change', (e) => {
        if (e.target.matches('input[data-permission]')) {
          const permission = e.target.dataset.permission;
          const isChecked = e.target.checked;
          if( window.isDebugging ) console.log('👥 [Widget] Permission checkbox changed:', permission, 'checked:', isChecked);
        }
      });

      // Add click event listener for permission items to ensure they're clickable
      modPermissionsPopup?.addEventListener('click', (e) => {
        if (e.target.closest('.pingbash-permission-item')) {
          const permissionItem = e.target.closest('.pingbash-permission-item');
          const checkbox = permissionItem.querySelector('input[data-permission]');
          
          // If clicked on label or description, toggle checkbox
          if (checkbox && !e.target.matches('input[data-permission]')) {
            checkbox.checked = !checkbox.checked;
            const permission = checkbox.dataset.permission;
            if( window.isDebugging ) console.log('👥 [Widget] Permission toggled via click:', permission, 'checked:', checkbox.checked);
            
            // Trigger change event
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });

      // Member search for adding moderators
      const memberSearchInput = this.dialog.querySelector('.pingbash-member-search-input');
      const memberSearchResults = this.dialog.querySelector('.pingbash-member-search-results');

      memberSearchInput?.addEventListener('input', (e) => {
        this.searchMembers(e.target.value);
      });

      // Hide search results when clicking outside
      document.addEventListener('click', (e) => {
        if (!memberSearchInput?.contains(e.target) && !memberSearchResults?.contains(e.target)) {
          if (memberSearchResults) {
            memberSearchResults.style.display = 'none';
          }
        }
      });

      // Member result selection (delegated event handling)
      memberSearchResults?.addEventListener('click', (e) => {
        const memberItem = e.target.closest('.pingbash-member-result-item');
        if (memberItem) {
          const memberId = memberItem.dataset.memberId;
          this.addModerator(memberId);
        }
      });

      // Moderator actions (delegated event handling since they're dynamically created)
      moderatorMgmtPopup?.addEventListener('click', (e) => {
        if (e.target.classList.contains('pingbash-moderator-edit-btn')) {
          const moderatorId = e.target.dataset.moderatorId;
          this.editModeratorPermissions(moderatorId);
        } else if (e.target.classList.contains('pingbash-moderator-remove-btn')) {
          const moderatorId = e.target.dataset.moderatorId;
          this.removeModerator(moderatorId);
        }
      });

      // Censored Content popup event listeners
      const censoredContentPopup = this.dialog.querySelector('.pingbash-censored-content-popup');
      
      // Close button
      censoredContentPopup?.querySelector('.pingbash-popup-close')?.addEventListener('click', () => {
        this.hideCensoredContent();
      });

      // Close/Cancel button
      censoredContentPopup?.querySelector('.pingbash-censored-close-btn')?.addEventListener('click', () => {
        this.hideCensoredContent();
      });

      // Save button
      censoredContentPopup?.querySelector('.pingbash-censored-save-btn')?.addEventListener('click', () => {
        this.saveCensoredWords();
      });

      // Add word button
      censoredContentPopup?.querySelector('.pingbash-add-word-btn')?.addEventListener('click', () => {
        this.addCensoredWord();
      });

      // Enter key in input field
      censoredContentPopup?.querySelector('.pingbash-censored-word-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addCensoredWord();
        }
      });

      // Overlay click to close
      censoredContentPopup?.querySelector('.pingbash-popup-overlay')?.addEventListener('click', () => {
        this.hideCensoredContent();
      });

      // Delegated event handling for dynamically created word items
      const censoredWordsList = this.dialog.querySelector('.pingbash-censored-words-list');
      censoredWordsList?.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        
        if (e.target.classList.contains('pingbash-edit-word-btn')) {
          this.editCensoredWord(parseInt(index));
        } else if (e.target.classList.contains('pingbash-delete-word-btn')) {
          this.deleteCensoredWord(parseInt(index));
        } else if (e.target.classList.contains('pingbash-save-edit-btn')) {
          this.saveEditCensoredWord(parseInt(index));
        } else if (e.target.classList.contains('pingbash-cancel-edit-btn')) {
          this.cancelEditCensoredWord();
        }
      });

      // Handle Enter key in edit input
      censoredWordsList?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('pingbash-edit-word-input')) {
          e.preventDefault();
          const index = e.target.closest('.pingbash-censored-word-item').dataset.index;
          this.saveEditCensoredWord(parseInt(index));
        } else if (e.key === 'Escape' && e.target.classList.contains('pingbash-edit-word-input')) {
          e.preventDefault();
          this.cancelEditCensoredWord();
        }
      });

      // Group creation modal (body-attached modal will be set up when created)
      // Event listeners for body modal are set up in setupBodyModalEventListeners()

      // Online users icon click
      const onlineUsersContainer = this.dialog.querySelector('.pingbash-online-users-container');
      onlineUsersContainer?.addEventListener('click', () => {
        if( window.isDebugging ) console.log('👥 [Widget] Online users icon clicked');
        this.showOnlineUsers();
      });

      // Emoji picker
      const emojiPicker = this.dialog.querySelector('.pingbash-emoji-picker');

      emojiBtn?.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
      });

      // Emoji selection
      const emojis = this.dialog.querySelectorAll('.pingbash-emoji');
      emojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
          const emojiChar = emoji.dataset.emoji;
          input.value += emojiChar;
          emojiPicker.style.display = 'none';
          input.focus();
        });
      });

      // Close emoji picker when clicking outside
      document.addEventListener('click', (e) => {
        if (!emojiBtn?.contains(e.target) && !emojiPicker?.contains(e.target)) {
          emojiPicker.style.display = 'none';
        }
      });

      // Escape key to close dialog
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeDialog();
        }
      });
    },

    // EXACT COPY from widget.js - toggleDialog method
    toggleDialog() {
      if (this.isOpen) {
        this.closeDialog();
      } else {
        this.openDialog();
      }
    },

    // EXACT COPY from widget.js - openDialog method
    openDialog() {
      this.isOpen = true;
      this.dialog.classList.add('open');
      
      // Mark as initial load so group settings are applied on first open
      if (!this.dialog.hasAttribute('data-opened-before')) {
        this.dialog.setAttribute('data-initial-load', 'true');
        this.dialog.setAttribute('data-opened-before', 'true');
      }
      
      this.unreadCount = 0;
      this.updateUnreadBadge();

      // Update button/dialog visibility
      this.updateButtonVisibility();

      // Update chat limitation UI when dialog opens
      this.onGroupDataUpdated();

      // Focus input
      const input = this.dialog.querySelector('.pingbash-message-input');
      if (input && !input.disabled) {
        setTimeout(() => input.focus(), 100);
      }

      this.dispatchEvent('pingbash-opened');
    },

    // EXACT COPY from widget.js - closeDialog method
    closeDialog() {
      this.isOpen = false;
      this.dialog.classList.remove('open');
      
      // Update button/dialog visibility
      this.updateButtonVisibility();
      
      this.dispatchEvent('pingbash-closed');
    },

    // EXACT COPY from widget.js - toggleHamburgerMenu method
    toggleHamburgerMenu() {
      const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
      const isVisible = dropdown.style.display !== 'none';
      dropdown.style.display = isVisible ? 'none' : 'block';
    },

    // EXACT COPY from widget.js - hideHamburgerMenu method
    hideHamburgerMenu() {
      const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
      dropdown.style.display = 'none';
    },

    // Toggle popout mode (mobile only)
    togglePopoutMode() {
      if( window.isDebugging ) console.log('📱 [Widget] Toggling popout mode');
      
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        if( window.isDebugging ) console.log('📱 [Widget] Not mobile, ignoring popout');
        return;
      }
      
      const isPopout = this.dialog.classList.contains('popout-mode');
      const popoutIcon = this.dialog.querySelector('.pingbash-popout-icon');
      // const fullscreenIcon = this.dialog.querySelector('.pingbash-fullscreen-icon');
      const popoutBtn = this.dialog.querySelector('.pingbash-popout-btn');
      
      if (isPopout) {
        // Exit popout mode - back to full screen
        this.dialog.classList.remove('popout-mode');
        
        // Reset position to 0,0 for full-screen
        this.dialog.style.left = '0';
        this.dialog.style.top = '0';
        this.dialog.style.width = '100vw';
        this.dialog.style.height = '100vh';
        this.dialog.style.transform = '';
        
        // Change icon: show popout icon (minimize), hide fullscreen icon
        if (popoutIcon) popoutIcon.style.display = 'block';
        if (fullscreenIcon) fullscreenIcon.style.display = 'none';
        if (popoutBtn) popoutBtn.title = 'Popout Mode';
        
        if( window.isDebugging ) console.log('📱 [Widget] Exited popout mode - back to full screen (0,0)');
      } else {
        // Enter popout mode - 350x500 resizable
        this.dialog.classList.add('popout-mode');
        
        // Change icon: hide popout icon, show fullscreen icon (expand)
        if (popoutIcon) popoutIcon.style.display = 'none';
        if (fullscreenIcon) fullscreenIcon.style.display = 'block';
        if (popoutBtn) popoutBtn.title = 'Full Screen Mode';
        this.dialog.style.width = '350px';
        this.dialog.style.height = '500px';
        
        if( window.isDebugging ) console.log('📱 [Widget] Entered popout mode - 350x500 resizable');
      }
    },

    // Settings menu methods
    toggleSettingsMenu() {
      const dropdown = this.dialog.querySelector('.pingbash-settings-dropdown');
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      }
    },

    hideSettingsMenu() {
      const dropdown = this.dialog.querySelector('.pingbash-settings-dropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    },

    // Update auth menu visibility based on authentication status
    updateAuthMenuVisibility() {
      const myProfileItem = this.dialog?.querySelector('[data-action="my-profile"]');
      const logoutItem = this.dialog?.querySelector('[data-action="logout"]');
      const loginItem = this.dialog?.querySelector('[data-action="login"]');

      if (this.isAuthenticated) {
        // Show profile and logout, hide login
        if (myProfileItem) myProfileItem.style.display = 'flex';
        if (logoutItem) logoutItem.style.display = 'flex';
        if (loginItem) loginItem.style.display = 'none';
      } else {
        // Hide profile and logout, show login
        if (myProfileItem) myProfileItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'none';
        if (loginItem) loginItem.style.display = 'flex';
      }
    },

    // EXACT COPY from widget.js - handleMenuAction method
    handleMenuAction(action) {
      if( window.isDebugging ) console.log('🍔 [Widget] Menu action:', action);

      switch (action) {
        // Hamburger menu actions (general)
        case 'inbox':
          if( window.isDebugging ) console.log('📬 [Widget] Inbox clicked - redirecting to pingbash.com/inbox');
          // Redirect to F version inbox
          window.open('https://pingbash.com/inbox', '_blank');
          break;
        case 'my-profile':
          if( window.isDebugging ) console.log('👤 [Widget] My Profile clicked');
          this.showMyProfile();
          break;
        case 'chat-rules':
          this.showChatRules();
          break;
        case 'copy-group-url':
          this.copyGroupUrl();
          break;
        case 'edit-chat-style':
          this.showEditChatStyleModal();
          break;

        case 'toggle-theme':
          if( window.isDebugging ) console.log('🌙 [Widget] Dark mode toggle clicked');
          this.toggleDarkMode();
          break;

        case 'send-notification':
          if( window.isDebugging ) console.log('📢 [Widget] Send notification clicked');
          this.showNotificationModal();
          break;
        case 'toggle-favorites':
          this.toggleFavorites();
          break;
        case 'hide-chat':
          this.hideChat();
          break;
        case 'toggle-theme':
          this.toggleTheme();
          break;
        case 'logout':
          this.logout();
          break;
        case 'login':
          this.showSigninModal();
          break;
        
        // Settings menu actions (admin tools)
        case 'chat-limitations':
          this.showChatLimitations();
          break;
        case 'manage-chat':
          this.showManageChat();
          break;
        case 'moderator-management':
          this.showModeratorManagement();
          break;
        case 'censored-content':
          this.showCensoredContent();
          break;
        case 'banned-users':
          this.showBannedUsers();
          break;
        case 'ip-bans':
          this.showIpBans();
          break;
      }
    },

    // New menu action handlers
    copyGroupUrl() {
      // Construct the correct group URL format: {groupname}.pingbash.com
      let groupUrl = '';
      
      if (this.config && this.config.groupName) {
        groupUrl = `${this.config.groupName}.pingbash.com`;
      } else if (this.group && this.group.name) {
        // Fallback to group.name if config.groupName is not available
        groupUrl = `${this.group.name}.pingbash.com`;
      } else {
        // Last resort fallback
        groupUrl = window.location.href;
        console.warn('⚠️ [Widget] Could not determine group name, using current URL');
      }
      
      navigator.clipboard.writeText(groupUrl).then(() => {
        if( window.isDebugging ) console.log('📋 [Widget] Group URL copied to clipboard:', groupUrl);
        // Show success notification
        this.showNotification('Group URL copied to clipboard!', 'success');
      }).catch(err => {
        console.error('❌ [Widget] Failed to copy URL:', err);
        this.showNotification('Failed to copy URL', 'error');
      });
    },

    addToFavorites() {
      if( window.isDebugging ) console.log('⭐ [Widget] Adding group to favorites');
      if (this.socket && this.group) {
        const token = localStorage.getItem('pingbash_token');
        if (token) {
          this.socket.emit('update fav groups', {
            token: token,
            groupId: this.group.id,
            isMember: 1
          });
          if( window.isDebugging ) console.log('⭐ [Widget] Sent add to favorites request for group:', this.group.id);
        } else {
          this.showNotification('Please log in to add favorites', 'error');
        }
      }
    },

    removeFromFavorites() {
      if( window.isDebugging ) console.log('⭐ [Widget] Removing group from favorites');
      if (this.socket && this.group) {
        const token = localStorage.getItem('pingbash_token');
        if (token) {
          this.socket.emit('update fav groups', {
            token: token,
            groupId: this.group.id,
            isMember: 0
          });
          if( window.isDebugging ) console.log('⭐ [Widget] Sent remove from favorites request for group:', this.group.id);
        } else {
          this.showNotification('Please log in to manage favorites', 'error');
        }
      }
    },

    toggleFavorites() {
      const isCurrentlyFavorite = this.isGroupInFavorites();
      
      // Store the intended action for showing the correct notification later
      this.pendingFavoritesAction = isCurrentlyFavorite ? 'remove' : 'add';
      
      if (isCurrentlyFavorite) {
        this.removeFromFavorites();
      } else {
        this.addToFavorites();
      }
    },

    isGroupInFavorites() {
      if (!this.group || !this.favoriteGroups) {
        return false;
      }
      return this.favoriteGroups.some(favGroup => favGroup.id === this.group.id);
    },

    hideChat() {
      if( window.isDebugging ) console.log('👁️ [Widget] Hiding chat (closing dialog)');
      this.closeDialog();
    },



    toggleTheme() {
      if( window.isDebugging ) console.log('🌓 [Widget] Toggling theme');
      const isDarkMode = this.isDarkMode || false;
      this.isDarkMode = !isDarkMode;
      
      // Update theme icons and text
      const lightIcon = this.dialog.querySelector('.pingbash-theme-icon-light');
      const darkIcon = this.dialog.querySelector('.pingbash-theme-icon-dark');
      const themeText = this.dialog.querySelector('.pingbash-theme-text');
      
      if (this.isDarkMode) {
        // Switch to dark mode
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        themeText.textContent = 'Light Mode';
        this.applyDarkMode();
        localStorage.setItem('pingbash_theme', 'dark');
        this.showNotification('Dark mode enabled', 'info');
      } else {
        // Switch to light mode
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        themeText.textContent = 'Dark Mode';
        this.applyLightMode();
        localStorage.setItem('pingbash_theme', 'light');
        this.showNotification('Light mode enabled', 'info');
      }
    },

    applyDarkMode() {
      if( window.isDebugging ) console.log('🌙 [Widget] Applying dark mode styles');
      // Add dark mode class to dialog
      this.dialog.classList.add('pingbash-dark-mode');
    },

    applyLightMode() {
      if( window.isDebugging ) console.log('☀️ [Widget] Applying light mode styles');
      // Remove dark mode class from dialog
      this.dialog.classList.remove('pingbash-dark-mode');
    },

    logout() {
      if( window.isDebugging ) console.log('🚪 [Widget] Logging out');
      // Clear authentication data
      localStorage.removeItem('pingbash_token');
      localStorage.removeItem('pingbash_user_id');
      localStorage.removeItem('anonToken');
      
      // Disconnect socket
      if (this.socket) {
        this.socket.disconnect();
      }
      
      // Show signin modal
      this.showSigninModal();
      this.showNotification('Logged out successfully', 'info');
    },

    showNotification(message, type = 'info') {
      if( window.isDebugging ) console.log(`📢 [Widget] Notification (${type}): ${message}`);
      
      // Create a simple toast notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
        z-index: 2147483647;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
      `;
      notification.textContent = message;
      
      // Add animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translateX(100%); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 3000);
    },

    // EXACT COPY from widget.js - handleImageUpload method
    handleImageUpload() {
      if( window.isDebugging ) console.log('📷 [Widget] Image upload clicked');
      // Create hidden file input for images
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          if( window.isDebugging ) console.log('📷 [Widget] Image selected:', file.name);
          await this.uploadAndSendFile(file, 'image');
        }
      };
      input.click();
    },

    // EXACT COPY from widget.js - handleFileUpload method
    handleFileUpload() {
      if( window.isDebugging ) console.log('📎 [Widget] File upload clicked');
      // Create hidden file input for any file type
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          if( window.isDebugging ) console.log('📎 [Widget] File selected:', file.name);
          await this.uploadAndSendFile(file, 'file');
        }
      };
      input.click();
    },

    // EXACT COPY from widget.js - toggleEmojiPicker method
    toggleEmojiPicker() {
      if( window.isDebugging ) console.log('😀 [Widget] Emoji button clicked');
      const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
      if (!emojiModal) return;

      const isVisible = emojiModal.style.display !== 'none';

      if (isVisible) {
        // Hide the picker
        emojiModal.style.display = 'none';
      } else {
        // Show the picker
        emojiModal.style.display = 'flex';

        // Only attach listeners once when showing
        this.attachEmojiListeners();
        this.attachEmojiOverlayListener();
        this.setupEmojiSearch();
        this.setupEmojiTabs();
      }
    },

    // EXACT COPY from widget.js - attachEmojiListeners method
    attachEmojiListeners() {
      // Remove all existing listeners first
      const emojiElements = this.dialog.querySelectorAll('.pingbash-emoji');
      emojiElements.forEach(emoji => {
        // Clone the element to remove all event listeners
        const newEmoji = emoji.cloneNode(true);
        emoji.parentNode.replaceChild(newEmoji, emoji);
      });

      // Now add listeners to the clean elements
      const cleanEmojiElements = this.dialog.querySelectorAll('.pingbash-emoji');
      cleanEmojiElements.forEach(emoji => {
        emoji.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleEmojiClick(e);
        }, { once: false });
      });
    },

    // EXACT COPY from widget.js - handleEmojiClick method
    handleEmojiClick(e) {
      // Prevent multiple clicks with a more robust check
      const now = Date.now();
      if (this.lastEmojiClickTime && (now - this.lastEmojiClickTime) < 300) {
        if( window.isDebugging ) console.log('😀 [Widget] Emoji click ignored - too fast');
        return;
      }
      this.lastEmojiClickTime = now;

      const emoji = e.target.dataset.emoji;
      if (!emoji) {
        if( window.isDebugging ) console.log('😀 [Widget] No emoji data found');
        return;
      }

      if( window.isDebugging ) console.log('😀 [Widget] Emoji selected:', emoji);
      const input = this.dialog.querySelector('.pingbash-message-input');
      if (input) {
        // Insert emoji at cursor position
        const cursorPos = input.selectionStart;
        const textBefore = input.value.substring(0, cursorPos);
        const textAfter = input.value.substring(input.selectionEnd);
        input.value = textBefore + emoji + textAfter;

        // Move cursor after the emoji
        const newCursorPos = cursorPos + emoji.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
      }

      // Hide emoji picker
      this.hideEmojiPicker();
    },

    // EXACT COPY from widget.js - handleInputChange method
    handleInputChange(e) {
      const input = e.target;
      const value = input.value;
      const cursorPos = input.selectionStart;

      // Find @ symbol before cursor
      const textBeforeCursor = value.substring(0, cursorPos);
      const atIndex = textBeforeCursor.lastIndexOf('@');

      if (atIndex !== -1) {
        const searchTerm = textBeforeCursor.substring(atIndex + 1);

        // Only show dropdown if @ is at start or after space, and search term is reasonable
        const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
        if ((charBeforeAt === ' ' || atIndex === 0) && searchTerm.length <= 20) {
          this.showMentionDropdown(searchTerm, atIndex);
          return;
        }
      }

      // Hide dropdown if no valid @ mention
      this.hideMentionDropdown();
    },

    // EXACT COPY from widget.js - handleMentionNavigation method
    handleMentionNavigation(e) {
      const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
      if (mentionModal.style.display === 'none') return;

      const items = mentionModal.querySelectorAll('.pingbash-mention-item');
      const selected = mentionModal.querySelector('.pingbash-mention-item.selected');
      let selectedIndex = selected ? Array.from(items).indexOf(selected) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          this.updateMentionSelection(items, selectedIndex);
          break;

        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
          this.updateMentionSelection(items, selectedIndex);
          break;

        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (selected) {
            this.selectMention(selected);
          }
          break;

        case 'Escape':
          this.hideMentionDropdown();
          break;
      }
    },

    // EXACT COPY from widget.js - showMentionDropdown method
    showMentionDropdown(searchTerm, atIndex) {
      if( window.isDebugging ) console.log('@ [Widget] Showing mention dropdown for:', searchTerm);

      // Get online users (mock data for now - in real app would come from socket)
      const onlineUsers = this.getOnlineUsers();
      if( window.isDebugging ) console.log('👥 [Widget] Online users:', onlineUsers);
      const filteredUsers = onlineUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
      const list = mentionModal.querySelector('.pingbash-mention-list');

      if (filteredUsers.length === 0) {
        this.hideMentionDropdown();
        return;
      }

      // Store the atIndex for later use
      this.currentAtIndex = atIndex;

      // Populate dropdown
      list.innerHTML = filteredUsers.map((user, index) => `
      <div class="pingbash-mention-item ${index === 0 ? 'selected' : ''}" data-user-id="${user.id}" data-user-name="${user.name}" data-at-index="${atIndex}">
        <div class="pingbash-mention-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="pingbash-mention-name">${user.name}</div>
      </div>
    `).join('');

      // Add click listeners
      list.querySelectorAll('.pingbash-mention-item').forEach(item => {
        item.addEventListener('click', () => this.selectMention(item));
      });

      // Add overlay click listener
      this.attachMentionOverlayListener();

      mentionModal.style.display = 'flex';
    },

    // EXACT COPY from widget.js - hideMentionDropdown method
    hideMentionDropdown() {
      const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
      mentionModal.style.display = 'none';
    },

    // EXACT COPY from widget.js - updateMentionSelection method
    updateMentionSelection(items, selectedIndex) {
      items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
      });
    },

    // EXACT COPY from widget.js - selectMention method
    selectMention(item) {
      const userName = item.dataset.userName;
      const atIndex = parseInt(item.dataset.atIndex);
      const input = this.dialog.querySelector('.pingbash-message-input');

      const value = input.value;
      const cursorPos = input.selectionStart;

      // Find the end of the current @ mention
      const textAfterAt = value.substring(atIndex + 1);
      const spaceIndex = textAfterAt.search(/\s/);
      const endIndex = spaceIndex === -1 ? value.length : atIndex + 1 + spaceIndex;

      // Replace the @ mention with the selected user
      const newValue = value.substring(0, atIndex) + `@${userName} ` + value.substring(endIndex);
      input.value = newValue;

      // Position cursor after the mention
      const newCursorPos = atIndex + userName.length + 2;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();

      this.hideMentionDropdown();
    },

    // EXACT COPY from widget.js - requestOnlineUsers method
    requestOnlineUsers() {
      // Request online users from backend (now public endpoint)
      if (!this.socket || !this.isConnected || !this.groupId) {
        if( window.isDebugging ) console.log('👥 [Widget] Cannot request online users - missing socket, connection, or groupId');
        return;
      }

      // Prevent too frequent requests
      const now = Date.now();
      if (this.lastOnlineUsersRequest && (now - this.lastOnlineUsersRequest) < 2000) {
        if( window.isDebugging ) console.log('👥 [Widget] Skipping online users request - too frequent');
        return;
      }
      this.lastOnlineUsersRequest = now;

      if( window.isDebugging ) console.log('👥 [Widget] Requesting online users for group:', this.groupId, '(public endpoint)');
      // No token needed - endpoint is now public
      this.socket.emit('get group online users', { groupId: parseInt(this.groupId) });
    },

    // NEW METHOD - Request inbox unread count (only for authenticated users)
    requestInboxUnreadCount() {
      if (!this.socket || !this.isConnected) {
        if( window.isDebugging ) console.log('📬 [Widget] Cannot request unread count - socket not connected');
        return;
      }

      // Only request for authenticated users (not anonymous)
      const token = localStorage.getItem('pingbash_token');
      if (!token || token.includes('anonuser')) {
        if( window.isDebugging ) console.log('📬 [Widget] Skipping unread count - user is anonymous');
        // Clear badge for anonymous users
        if (this.updateInboxUnreadCount) {
          this.updateInboxUnreadCount(0);
        }
        return;
      }

      console.log('📬 [Widget] Requesting inbox unread count from backend (current:', this.inboxUnreadCount + ')');
      this.socket.emit('get inbox unread count', { token });
    },

    // EXACT COPY from widget.js - getOnlineUsers method
    getOnlineUsers() {
      // Get real online users from socket data mapped to group members
      let onlineUsers = [];

      // First, try to map online user IDs to actual member names
      if (this.onlineUserIds && this.onlineUserIds.length > 0 && this.groupMembers && this.groupMembers.length > 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Mapping online user IDs to names:', this.onlineUserIds);
        if( window.isDebugging ) console.log('👥 [Widget] Available group members:', this.groupMembers.length);

        onlineUsers = this.onlineUserIds
          .map(userId => {
            // Find member info from group members
            const member = this.groupMembers.find(m => m.id === userId);
            if (member) {
              return { id: member.id, name: member.name };
            } else {
              const last3Digits = String(userId).slice(-3);
              return { id: userId, name: `anon${last3Digits}` };
            }
          })
          .filter(user => user.name !== `User ${user.id}`); // Remove fallback names if possible
      }

      // If no online users mapped, use all group members as fallback
      if (onlineUsers.length === 0 && this.groupMembers && this.groupMembers.length > 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Using all group members as fallback');
        onlineUsers = this.groupMembers.map(member => ({
          id: member.id,
          name: member.name
        }));
      }

      // Final fallback to mock data if no real data available
      if (onlineUsers.length === 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Using mock data as final fallback');
        onlineUsers = [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Mike Johnson' },
          { id: 4, name: 'Sarah Wilson' },
          { id: 5, name: 'David Brown' }
        ];
      }

      if( window.isDebugging ) console.log('👥 [Widget] Final online users list:', onlineUsers);
      return onlineUsers;
    },

    // EXACT COPY from widget.js - hideEmojiPicker method
    hideEmojiPicker() {
      const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
      emojiModal.style.display = 'none';
    },

    // EXACT COPY from widget.js - attachEmojiOverlayListener method
    attachEmojiOverlayListener() {
      const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
      const emojiOverlay = emojiModal.querySelector('.pingbash-popup-overlay');

      // Remove existing listener
      emojiOverlay.removeEventListener('click', this.handleEmojiOverlayClick);

      // Add new listener
      emojiOverlay.addEventListener('click', () => {
        this.hideEmojiPicker();
      });
    },

    // NEW - Setup enhanced emoji search functionality
    setupEmojiSearch() {
      if( window.isDebugging ) console.log('😀 [Widget] Setting up emoji search');
      
      const searchInput = this.dialog.querySelector('.pingbash-emoji-search');
      if (!searchInput) {
        if( window.isDebugging ) console.log('😀 [Widget] Search input not found');
        return;
      }

      // Remove existing listener by cloning
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);
      
      // Add search listener to the new element
      newSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if( window.isDebugging ) console.log('😀 [Widget] Search query:', query);
        this.filterEmojis(query);
      });
      
      if( window.isDebugging ) console.log('😀 [Widget] Emoji search setup complete');
    },

    // NEW - Setup emoji category tabs
    setupEmojiTabs() {
      if( window.isDebugging ) console.log('😀 [Widget] Setting up emoji tabs');
      
      const tabs = this.dialog.querySelectorAll('.pingbash-emoji-tab');
      
      if( window.isDebugging ) console.log('😀 [Widget] Found tabs:', tabs.length);
      
      // Remove existing listeners by cloning (same approach as emoji elements)
      tabs.forEach((tab, index) => {
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
      });
      
      // Re-query tabs after cloning
      const newTabs = this.dialog.querySelectorAll('.pingbash-emoji-tab');
      
      newTabs.forEach((tab, index) => {
        if( window.isDebugging ) console.log('😀 [Widget] Adding listener to tab', index, 'category:', tab.dataset.category);
        
        tab.addEventListener('click', (e) => {
          const category = e.currentTarget.dataset.category;
          if( window.isDebugging ) console.log('😀 [Widget] Tab clicked, category:', category);
          
          this.switchEmojiCategory(category);
          
          // Update active tab
          newTabs.forEach(t => t.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Close button in header
      const closeBtn = this.dialog.querySelector('.pingbash-emoji-close');
      if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => {
          if( window.isDebugging ) console.log('😀 [Widget] Close button clicked');
          this.hideEmojiPicker();
        });
      }
      
      if( window.isDebugging ) console.log('😀 [Widget] Emoji tabs setup complete');
    },

    // NEW - Filter emojis based on search
    filterEmojis(query) {
      if( window.isDebugging ) console.log('😀 [Widget] Filtering emojis with query:', query);
      
      const emojiGrid = this.dialog.querySelector('.pingbash-emoji-grid');
      if (!emojiGrid) {
        if( window.isDebugging ) console.log('😀 [Widget] Emoji grid not found');
        return;
      }
      
      const emojis = emojiGrid.querySelectorAll('.pingbash-emoji');
      if( window.isDebugging ) console.log('😀 [Widget] Found emojis to filter:', emojis.length);
      
      let hasResults = false;
      
      emojis.forEach((emoji, index) => {
        const keywords = emoji.dataset.keywords || '';
        const emojiChar = emoji.dataset.emoji || '';
        
        const matches = query === '' || 
            keywords.toLowerCase().includes(query) || 
            emojiChar.includes(query);
        
        if (matches) {
          emoji.style.setProperty('display', 'inline-flex', 'important');
          hasResults = true;
        } else {
          emoji.style.setProperty('display', 'none', 'important');
        }
        
        if( window.isDebugging && index < 3) {
          console.log(`😀 [Widget] Emoji ${index}: ${emojiChar}, keywords: "${keywords}", matches: ${matches}`);
        }
      });

      if( window.isDebugging ) console.log('😀 [Widget] Filter complete, hasResults:', hasResults);

      // Show "no results" message if needed
      if (!hasResults && query !== '') {
        if( window.isDebugging ) console.log('😀 [Widget] No emojis found for:', query);
      }
    },

    // NEW - Switch emoji category
    switchEmojiCategory(category) {
      if( window.isDebugging ) console.log('😀 [Widget] Switching to category:', category);
      
      const emojiGrid = this.dialog.querySelector('.pingbash-emoji-grid');
      const gifGrid = this.dialog.querySelector('.pingbash-gif-grid');
      
      if (!emojiGrid || !gifGrid) {
        if( window.isDebugging ) console.log('😀 [Widget] Emoji or GIF grid not found');
        return;
      }
      
      if (category === 'gifs') {
        emojiGrid.style.display = 'none';
        gifGrid.style.display = 'flex';
        if( window.isDebugging ) console.log('😀 [Widget] ✅ Switched to GIFs, hiding emoji grid');
      } else {
        // Show emoji grid, hide GIF grid
        emojiGrid.style.display = 'grid';
        gifGrid.style.display = 'none';
        
        if( window.isDebugging ) console.log('😀 [Widget] ✅ Showing emoji grid, hiding GIF grid');
        
        // Clear search when switching categories
        const searchInput = this.dialog.querySelector('.pingbash-emoji-search');
        if (searchInput) {
          searchInput.value = '';
          if( window.isDebugging ) console.log('😀 [Widget] Cleared search input');
        }
        
        // Filter emojis by category
        this.filterEmojisByCategory(category);
      }
      
      if( window.isDebugging ) console.log('😀 [Widget] Category switch complete');
    },
    
    // NEW - Filter emojis by category
    filterEmojisByCategory(category) {
      if( window.isDebugging ) console.log('😀 [Widget] Filtering by category:', category);
      
      const emojiGrid = this.dialog.querySelector('.pingbash-emoji-grid');
      if (!emojiGrid) return;
      
      const emojis = emojiGrid.querySelectorAll('.pingbash-emoji');
      let visibleCount = 0;
      
      emojis.forEach(emoji => {
        const emojiCategory = emoji.dataset.category || 'smileys';
        
        // Show emoji if it matches the category, or show all if category is 'smileys' (default)
        if (emojiCategory === category || category === 'smileys') {
          emoji.style.setProperty('display', 'inline-flex', 'important');
          visibleCount++;
        } else {
          emoji.style.setProperty('display', 'none', 'important');
        }
      });
      
      if( window.isDebugging ) console.log('😀 [Widget] Category filter complete. Visible emojis:', visibleCount, '/', emojis.length);
      
      // If no emojis in this category, show a message
      if (visibleCount === 0) {
        if( window.isDebugging ) console.log('😀 [Widget] ⚠️ No emojis found for category:', category);
      }
    },

    // NEW - Show notification modal
    showNotificationModal() {
      const modal = this.dialog.querySelector('.pingbash-notification-modal');
      if (!modal) return;

      // Reset the modal
      this.resetNotificationModal();
      
      // Show the modal
      modal.style.display = 'flex';
      
      // Setup event listeners
      this.setupNotificationModalListeners();
      
      // Focus the textarea
      const textarea = modal.querySelector('.pingbash-notification-textarea');
      setTimeout(() => textarea?.focus(), 100);
    },

    // NEW - Hide notification modal
    hideNotificationModal() {
      const modal = this.dialog.querySelector('.pingbash-notification-modal');
      if (modal) {
        modal.style.display = 'none';
        this.resetNotificationModal();
      }
    },

    // NEW - Reset notification modal to default state
    resetNotificationModal() {
      const modal = this.dialog.querySelector('.pingbash-notification-modal');
      if (!modal) return;

      // Reset textarea
      const textarea = modal.querySelector('.pingbash-notification-textarea');
      if (textarea) {
        textarea.value = '';
      }

      // Reset character counter
      const charCount = modal.querySelector('.pingbash-char-count');
      if (charCount) {
        charCount.textContent = '0';
        charCount.classList.remove('over-limit');
      }

      // Reset preview
      const previewMessage = modal.querySelector('.pingbash-notification-preview-message');
      if (previewMessage) {
        previewMessage.textContent = 'Your notification will appear here...';
        previewMessage.classList.remove('has-content');
      }

      // Reset send button
      const sendBtn = modal.querySelector('.pingbash-notification-send-btn');
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Send Notification';
        sendBtn.classList.remove('sending');
      }
    },

    // NEW - Setup notification modal event listeners
    setupNotificationModalListeners() {
      const modal = this.dialog.querySelector('.pingbash-notification-modal');
      if (!modal) return;

      // Close button
      const closeBtn = modal.querySelector('.pingbash-popup-close');
      closeBtn?.addEventListener('click', () => this.hideNotificationModal());

      // Cancel button
      const cancelBtn = modal.querySelector('.pingbash-notification-cancel-btn');
      cancelBtn?.addEventListener('click', () => this.hideNotificationModal());

      // Overlay click
      const overlay = modal.querySelector('.pingbash-popup-overlay');
      overlay?.addEventListener('click', () => this.hideNotificationModal());

      // Textarea input
      const textarea = modal.querySelector('.pingbash-notification-textarea');
      textarea?.addEventListener('input', (e) => this.handleNotificationInput(e));

      // Send button
      const sendBtn = modal.querySelector('.pingbash-notification-send-btn');
      sendBtn?.addEventListener('click', () => this.sendGroupNotification());
    },

    // NEW - Handle notification textarea input
    handleNotificationInput(e) {
      const textarea = e.target;
      const value = textarea.value;
      const length = value.length;
      const maxLength = 500;

      // Update character counter
      const charCount = this.dialog.querySelector('.pingbash-char-count');
      if (charCount) {
        charCount.textContent = length.toString();
        
        if (length > maxLength) {
          charCount.classList.add('over-limit');
        } else {
          charCount.classList.remove('over-limit');
        }
      }

      // Update preview
      const previewMessage = this.dialog.querySelector('.pingbash-notification-preview-message');
      if (previewMessage) {
        if (value.trim()) {
          previewMessage.textContent = value.trim();
          previewMessage.classList.add('has-content');
        } else {
          previewMessage.textContent = 'Your notification will appear here...';
          previewMessage.classList.remove('has-content');
        }
      }

      // Update send button state
      const sendBtn = this.dialog.querySelector('.pingbash-notification-send-btn');
      if (sendBtn) {
        sendBtn.disabled = !value.trim() || length > maxLength;
      }
    },

    // NEW - Send group notification
    sendGroupNotification() {
      const textarea = this.dialog.querySelector('.pingbash-notification-textarea');
      const sendBtn = this.dialog.querySelector('.pingbash-notification-send-btn');
      
      if (!textarea || !sendBtn) return;
      
      const message = textarea.value.trim();
      if (!message) return;

      // Check permissions
      const currentUserId = this.getCurrentUserId();
      const isGroupCreator = this.group?.creater_id === currentUserId;
      
      if (!isGroupCreator) {
        alert("Only group admins can send notifications");
        return;
      }

      if (!this.socket || !this.socket.connected) {
        alert('Not connected to server');
        return;
      }

      // Update button state
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
      sendBtn.classList.add('sending');

      if( window.isDebugging ) console.log('📢 [Widget] Sending group notification:', {
        groupId: this.groupId,
        message: message,
        token: this.authenticatedToken
      });

      // Send notification via socket
      this.socket.emit('send group notify', {
        groupId: parseInt(this.groupId),
        message: message,
        token: this.authenticatedToken
      });

      // Hide modal after short delay
      setTimeout(() => {
        this.hideNotificationModal();
        // Show success message
        if (this.showNotification) {
          this.showNotification('📢 Group notification sent successfully!', 'success');
        }
      }, 1000);
    },

    // Show group notification dialog (when receiving notification)
    showGroupNotificationDialog(message, senderName) {
      if( window.isDebugging ) console.log('📢 [Widget] Showing group notification dialog:', { message, senderName });
      
      // Create modal HTML
      const modalHtml = `
        <div class="pingbash-group-notification-dialog" style="display: flex;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content" style="max-width: 500px;">
            <div class="pingbash-popup-header">
              <h3>📢 Group Notification</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-notification-sender">
                <strong>From: ${senderName}</strong>
              </div>
              <div class="pingbash-notification-message-display">
                ${message}
              </div>
              <div class="pingbash-notification-actions">
                <button class="pingbash-notification-ok-btn">OK</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Remove existing notification dialog if present
      const existingDialog = this.dialog?.querySelector('.pingbash-group-notification-dialog');
      if (existingDialog) {
        existingDialog.remove();
      }
      
      // Add to chat dialog instead of body
      if (!this.dialog) {
        if( window.isDebugging ) console.log('📢 [Widget] Chat dialog not found, cannot show notification');
        return;
      }
      
      this.dialog.insertAdjacentHTML('beforeend', modalHtml);
      
      // Add event listeners
      const dialog = this.dialog.querySelector('.pingbash-group-notification-dialog');
      
      // Apply dark mode if widget is in dark mode
      if (this.widget && this.widget.classList.contains('pingbash-dark-mode')) {
        dialog.classList.add('pingbash-dark-mode');
        if( window.isDebugging ) console.log('📢 [Widget] Applied dark mode to notification dialog');
      }
      const closeBtn = dialog.querySelector('.pingbash-popup-close');
      const okBtn = dialog.querySelector('.pingbash-notification-ok-btn');
      const overlay = dialog.querySelector('.pingbash-popup-overlay');
      
      const closeDialog = () => {
        if (dialog) {
          dialog.remove();
        }
      };
      
      closeBtn?.addEventListener('click', closeDialog);
      okBtn?.addEventListener('click', closeDialog);
      overlay?.addEventListener('click', closeDialog);
      
      // Auto-close after 10 seconds
      setTimeout(closeDialog, 10000);
    },

    // EXACT COPY from widget.js - attachMentionOverlayListener method
    attachMentionOverlayListener() {
      const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
      const mentionOverlay = mentionModal.querySelector('.pingbash-popup-overlay');

      // Remove existing listener
      mentionOverlay.removeEventListener('click', this.handleMentionOverlayClick);

      // Add new listener
      mentionOverlay.addEventListener('click', () => {
        this.hideMentionDropdown();
      });
    },



    // NEW METHOD - Set up event listeners for body-attached group creation modal
    setupBodyModalEventListeners() {
      const modal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (!modal) {
        if( window.isDebugging ) console.log('🏗️ [Widget] Body modal not found, skipping event listener setup');
        return;
      }

      if( window.isDebugging ) console.log('🏗️ [Widget] Setting up body modal event listeners');

            // Get elements from the body modal (W Version)
    const groupCreationCloseBtn = modal.querySelector('.pingbash-popup-close');
    const groupCreateBtn = modal.querySelector('.pingbash-create-group-btn');
    const groupCreationOverlay = modal.querySelector('.pingbash-popup-overlay');

      // Remove existing listeners to prevent duplicates
      groupCreationCloseBtn?.removeEventListener('click', this.hideGroupCreationModal);
      groupCreateBtn?.removeEventListener('click', this.createNewGroup);
      groupCreationOverlay?.removeEventListener('click', this.hideGroupCreationModal);

      // Add new listeners (W Version - no cancel button, only close and create)
      groupCreationCloseBtn?.addEventListener('click', () => this.hideGroupCreationModal());
      groupCreateBtn?.addEventListener('click', () => this.createNewGroup());
      groupCreationOverlay?.addEventListener('click', () => this.hideGroupCreationModal());

      // Set up form interactions for body modal
      this.setupBodyGroupCreationForm();

      if( window.isDebugging ) console.log('🏗️ [Widget] Body modal event listeners set up successfully');
    },

    // NEW METHOD - Set up form interactions for body-attached modal (W Version)
    setupBodyGroupCreationForm() {
      const modal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (!modal) return;

      // Get form elements with body-specific IDs
      const groupNameInput = modal.querySelector('#group-name-input-body');
      const createBtn = modal.querySelector('.pingbash-create-group-btn');
      const charCounter = modal.querySelector('.pingbash-char-counter');

      // Group name input handler (W Version style)
      if (groupNameInput && createBtn) {
        const updateCreateButton = () => {
          const length = groupNameInput.value.trim().length;
          createBtn.disabled = length === 0;
          
          // Show/hide character counter
          if (charCounter) {
            if (length > 0) {
              charCounter.style.display = 'block';
              charCounter.textContent = `${length}/50 characters`;
            } else {
              charCounter.style.display = 'none';
            }
          }

          // Update preview title
          const previewTitle = modal.querySelector('.pingbash-preview-title');
          if (previewTitle) {
            previewTitle.textContent = groupNameInput.value.trim() || 'New Group';
          }
        };

        groupNameInput.addEventListener('input', updateCreateButton);
        updateCreateButton(); // Initial update
      }

      // Set up configuration interactions
      this.setupConfigurationInteractions(modal);

      // Set up preview interactions (dragging, resizing, toggle)
      this.setupPreviewInteractions(modal);

      // Set up real-time content sync with actual chat
      this.setupPreviewContentSync(modal);

      if( window.isDebugging ) console.log('🏗️ [Widget] Body modal form interactions set up (W Version)');
    },

    // NEW METHOD - Set up configuration panel interactions
    setupConfigurationInteractions(modal) {
      // Helper function to update preview immediately
      const updatePreviewImmediately = () => {
        const config = this.getCurrentConfiguration(modal);
        this.applySettingsToPreview(modal, config);
        if( window.isDebugging ) console.log('🔄 [Widget] Preview updated immediately from form change');
      };

      // Size mode radio buttons
      const sizeModeRadios = modal.querySelectorAll('input[name="size-mode-body"]');
      const sizeInputs = modal.querySelector('.pingbash-size-inputs');
      
      sizeModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
          if (sizeInputs) {
            sizeInputs.style.display = radio.value === 'fixed' ? 'flex' : 'none';
          }
          // Update preview immediately when size mode changes
          updatePreviewImmediately();
        });
      });

      // Custom font size checkbox
      const customFontCheckbox = modal.querySelector('#custom-font-size-body');
      const fontSizeSection = modal.querySelector('.pingbash-font-size-section');
      
      if (customFontCheckbox && fontSizeSection) {
        customFontCheckbox.addEventListener('change', () => {
          fontSizeSection.style.display = customFontCheckbox.checked ? 'block' : 'none';
          // Update preview immediately when font size checkbox changes
          updatePreviewImmediately();
        });
      }

      // Font size slider - update both display and preview
      const fontSizeSlider = modal.querySelector('#font-size-slider-body');
      const fontSizeValue = modal.querySelector('.pingbash-font-size-value');
      
      if (fontSizeSlider && fontSizeValue) {
        // Use 'input' event for real-time updates as user drags
        fontSizeSlider.addEventListener('input', () => {
          fontSizeValue.textContent = `${fontSizeSlider.value}px`;
          // Update preview immediately as user drags slider
          updatePreviewImmediately();
        });
        
        // Also listen to 'change' for final value
        fontSizeSlider.addEventListener('change', updatePreviewImmediately);
      }

      // Corner radius slider - update both display and preview
      const cornerRadiusSlider = modal.querySelector('#corner-radius-slider-body');
      const cornerRadiusValue = modal.querySelector('.pingbash-corner-radius-value');
      
      if (cornerRadiusSlider && cornerRadiusValue) {
        // Use 'input' event for real-time updates as user drags
        cornerRadiusSlider.addEventListener('input', () => {
          cornerRadiusValue.textContent = `${cornerRadiusSlider.value}px`;
          // Update preview immediately as user drags slider
          updatePreviewImmediately();
        });
        
        // Also listen to 'change' for final value
        cornerRadiusSlider.addEventListener('change', updatePreviewImmediately);
      }

      // Round corners checkbox - immediate preview update
      const roundCornersCheckbox = modal.querySelector('#round-corners-body');
      if (roundCornersCheckbox) {
        roundCornersCheckbox.addEventListener('change', updatePreviewImmediately);
      }

      // Show avatars checkbox - immediate preview update
      const showAvatarsCheckbox = modal.querySelector('#show-avatars-body');
      if (showAvatarsCheckbox) {
        showAvatarsCheckbox.addEventListener('change', updatePreviewImmediately);
      }

      // ALL Color inputs - update preview in real time
      const colorInputs = modal.querySelectorAll('input[type="color"]');
      colorInputs.forEach(input => {
        // Use 'input' event for real-time updates as user picks colors
        input.addEventListener('input', () => {
          this.updatePreviewColors(modal);
          updatePreviewImmediately();
        });
        
        // Also listen to 'change' for final color selection
        input.addEventListener('change', () => {
          this.updatePreviewColors(modal);
          updatePreviewImmediately();
        });
      });

      // Width and Height inputs - immediate preview update with validation
      const widthInput = modal.querySelector('#width-input-body');
      const heightInput = modal.querySelector('#height-input-body');
      
      if (widthInput) {
        widthInput.addEventListener('input', (e) => {
          let value = parseInt(e.target.value);
          if (value < 400) e.target.value = 400;
          if (value > 800) e.target.value = 800;
          updatePreviewImmediately();
        });
        widthInput.addEventListener('change', (e) => {
          let value = parseInt(e.target.value);
          if (value < 400) e.target.value = 400;
          if (value > 800) e.target.value = 800;
          updatePreviewImmediately();
        });
      }
      
      if (heightInput) {
        heightInput.addEventListener('input', (e) => {
          let value = parseInt(e.target.value);
          if (value < 300) e.target.value = 300;
          if (value > 900) e.target.value = 900;
          updatePreviewImmediately();
        });
        heightInput.addEventListener('change', (e) => {
          let value = parseInt(e.target.value);
          if (value < 300) e.target.value = 300;
          if (value > 900) e.target.value = 900;
          updatePreviewImmediately();
        });
      }

      // Group name input - update preview title immediately
      const groupNameInput = modal.querySelector('#group-name-body');
      if (groupNameInput) {
        groupNameInput.addEventListener('input', () => {
          // Update preview title immediately
          const previewTitle = modal.querySelector('.pingbash-preview-title');
          if (previewTitle) {
            previewTitle.textContent = groupNameInput.value || 'Group Name';
          }
          updatePreviewImmediately();
        });
      }

      // ALL form inputs - catch any we might have missed
      const allFormInputs = modal.querySelectorAll('input, select, textarea');
      allFormInputs.forEach(input => {
        // Skip if we already handled this input above
        if (input.type === 'color' || 
            input.name === 'size-mode-body' ||
            input.id === 'custom-font-size-body' ||
            input.id === 'font-size-slider-body' ||
            input.id === 'corner-radius-slider-body' ||
            input.id === 'round-corners-body' ||
            input.id === 'show-avatars-body' ||
            input.id === 'width-input-body' ||
            input.id === 'height-input-body' ||
            input.id === 'group-name-body') {
          return;
        }
        
        // Add listeners for any remaining inputs
        input.addEventListener('input', updatePreviewImmediately);
        input.addEventListener('change', updatePreviewImmediately);
      });

      // Apply initial form settings to preview ONLY
      const initialConfig = this.getCurrentConfiguration(modal);
      this.applySettingsToPreview(modal, initialConfig);
      
      if( window.isDebugging ) console.log('🎯 [Widget] All form inputs configured for immediate preview updates');
    },

    // NEW METHOD - Update preview colors based on configuration
    updatePreviewColors(modal) {
      const previewContainer = modal.querySelector('.pingbash-preview-container');
      if (!previewContainer) return;

      const bgColor = modal.querySelector('#bg-color-body')?.value || '#FFFFFF';
      const titleColor = modal.querySelector('#title-color-body')?.value || '#333333';
      const msgBgColor = modal.querySelector('#msg-bg-color-body')?.value || '#F5F5F5';
      const msgTextColor = modal.querySelector('#msg-text-color-body')?.value || '#000000';
      const inputBgColor = modal.querySelector('#input-bg-color-body')?.value || '#FFFFFF';

      // Apply colors to preview
      const header = previewContainer.querySelector('.pingbash-preview-header');
      const messages = previewContainer.querySelector('.pingbash-preview-messages');
      const messageTexts = previewContainer.querySelectorAll('.pingbash-preview-text');
      const input = previewContainer.querySelector('.pingbash-preview-input input');

      if (header) header.style.background = titleColor;
      if (messages) messages.style.background = msgBgColor;
      if (input) input.style.background = inputBgColor;
      
      messageTexts.forEach(text => {
        if (!text.closest('.pingbash-preview-message.own')) {
          text.style.color = msgTextColor;
        }
      });
    },

    // NEW METHOD - Set up preview interactions (toggle, drag, resize)
    setupPreviewInteractions(modal) {
      // Toggle button functionality
      const toggleBtn = modal.querySelector('.pingbash-config-toggle');
      const configContainer = modal.querySelector('.pingbash-config-container');
      const configPanel = modal.querySelector('.pingbash-config-panel');
      
      if (toggleBtn && configContainer) {
        let isConfigVisible = true;
        
        toggleBtn.addEventListener('click', () => {
          isConfigVisible = !isConfigVisible;
          
          if (isConfigVisible) {
            configContainer.classList.remove('config-hidden');
            toggleBtn.classList.remove('collapsed');
            toggleBtn.title = 'Hide Configuration Panel';
          } else {
            configContainer.classList.add('config-hidden');
            toggleBtn.classList.add('collapsed');
            toggleBtn.title = 'Show Configuration Panel';
          }
        });
      }

      // Preview is now part of horizontal layout - no dragging needed
      const previewContainer = modal.querySelector('#draggable-chat-preview');
      if (previewContainer) {
        if( window.isDebugging ) console.log('🎯 [Widget] Preview container found - using horizontal layout');
      }

      if( window.isDebugging ) console.log('🏗️ [Widget] Preview interactions set up (horizontal layout)');
    },

    // NEW METHOD - Sync preview content with actual chat (EXACT HTML)
    syncPreviewWithActualChat(modal) {
      const previewMessagesContainer = modal.querySelector('#preview-messages-list');
      const actualMessagesContainer = document.querySelector('#pingbash-messages');
      
      if (!previewMessagesContainer) return;
      
      // Sync header content (group name)
      this.syncPreviewHeader(modal);
      
      // Sync input area content
      this.syncPreviewInput(modal);
      
      // Sync user count badge
      this.syncPreviewUserCount(modal);
      
      if (actualMessagesContainer && actualMessagesContainer.children.length > 0) {
        // Clone the EXACT content from actual chat
        const clonedContent = actualMessagesContainer.cloneNode(true);
        
        // Replace preview content with EXACT same HTML
        previewMessagesContainer.innerHTML = clonedContent.innerHTML;
        
        if( window.isDebugging ) console.log('🔄 [Widget] Preview synced with EXACT actual chat content');
      } else {
        // Show placeholder content when no messages
        this.showPreviewPlaceholder(previewMessagesContainer);
      }
    },

    // NEW METHOD - Sync preview header with actual chat (EXACT HTML)
    syncPreviewHeader(modal) {
      // The actual chat dialog doesn't have a group name in header initially
      // Group name is shown in the group creation form, not in the header
      if( window.isDebugging ) console.log('🔄 [Widget] Header sync - no group name in header to sync');
    },

    // NEW METHOD - Sync preview online user count with actual chat
    syncPreviewUserCount(modal) {
      const previewUserCount = modal.querySelector('.pingbash-online-count-badge');
      const actualUserCount = document.querySelector('.pingbash-online-count-badge');
      
      if (previewUserCount && actualUserCount) {
        previewUserCount.textContent = actualUserCount.textContent;
      }
    },

    // NEW METHOD - Sync preview input with actual chat input (EXACT HTML)
    syncPreviewInput(modal) {
      const previewInput = modal.querySelector('#preview-message-input');
      const actualInput = document.querySelector('#pingbash-message-input');
      
      if (previewInput && actualInput) {
        previewInput.placeholder = actualInput.placeholder;
        previewInput.value = actualInput.value;
        previewInput.disabled = actualInput.disabled;
      }
    },



    // NEW METHOD - Show placeholder when no messages (EXACT HTML structure)
    showPreviewPlaceholder(container) {
      container.innerHTML = `
        <div class="pingbash-loading" style="display: none;">Loading messages...</div>
        <div class="pingbash-preview-placeholder">
          <div class="pingbash-preview-placeholder-text">
            <h3>Welcome to ${this.config.groupName || 'New Group'}!</h3>
            <p>Messages will appear here when users start chatting.</p>
            <p>This preview shows exactly what the chat dialog will look like.</p>
          </div>
        </div>
      `;
    },

    // NEW METHOD - Set up real-time content sync
    setupPreviewContentSync(modal) {
      // Sync immediately
      this.syncPreviewWithActualChat(modal);
      
      // Set up observer to watch for changes in actual chat
      const actualMessagesContainer = document.querySelector('.pingbash-messages-list');
      if (actualMessagesContainer) {
        const observer = new MutationObserver(() => {
          this.syncPreviewWithActualChat(modal);
        });
        
        observer.observe(actualMessagesContainer, {
          childList: true,
          subtree: true,
          characterData: true
        });
        
        // Store observer for cleanup
        modal._contentSyncObserver = observer;
      }
      
      // Hook into displayMessages to sync preview when messages update
      if (typeof this.displayMessages === 'function') {
        const originalDisplayMessages = this.displayMessages.bind(this);
        this.displayMessages = function(...args) {
          const result = originalDisplayMessages(...args);
          // Sync preview after messages are displayed
          setTimeout(() => {
            const openModal = document.querySelector('.pingbash-group-creation-modal-body');
            if (openModal) {
              this.syncPreviewWithActualChat(openModal);
            }
          }, 50);
          return result;
        }.bind(this);
      }

      // Also hook into addMessage for real-time updates
      if (typeof this.addMessage === 'function') {
        const originalAddMessage = this.addMessage.bind(this);
        this.addMessage = function(...args) {
          const result = originalAddMessage(...args);
          // Sync preview after message is added
          setTimeout(() => {
            const openModal = document.querySelector('.pingbash-group-creation-modal-body');
            if (openModal) {
              this.syncPreviewWithActualChat(openModal);
            }
          }, 50);
          return result;
        }.bind(this);
      }
      
      if( window.isDebugging ) console.log('🔄 [Widget] Preview content sync set up');
    },

    // NEW METHOD - Apply settings to preview ONLY (from form values)
    applySettingsToPreview(modal, settings) {
      const previewContainer = modal.querySelector('#draggable-chat-preview');
      
      if (!previewContainer) return;
      
      // Create CSS variables for the PREVIEW using form values
      const cssVars = {
        '--title-bg-color': settings.colors.background || 'white',
        '--title-color': settings.colors.title || '#333',
        '--msg-bg-color': settings.colors.msgBg || '#f8f9fa',
        '--msg-text-color': settings.colors.msgText || '#333',
        '--date-color': settings.colors.dateText || '#999',
        '--owner-msg-bg-color': settings.colors.ownerMsg || '#2596be',
        '--input-bg-color': settings.colors.inputBg || '#f8f9fa',
        '--input-text-color': settings.colors.inputText || '#333',
        '--font-size': (settings.settings.customFontSize ? settings.settings.fontSize : 14) + 'px',
        '--show-avatars': settings.settings.userImages ? 'block' : 'none',
        '--corner-radius': settings.settings.roundCorners ? (settings.settings.cornerRadius || 12) + 'px' : '12px'
      };
      
      // Apply to preview ONLY (using form values)
      Object.entries(cssVars).forEach(([property, value]) => {
        previewContainer.style.setProperty(property, value);
      });
      
      // Update preview size from form values
      if (settings.width && settings.height && settings.sizeMode === 'fixed') {
        // For fixed size mode, override flex constraints
        previewContainer.style.setProperty('width', settings.width + 'px', 'important');
        previewContainer.style.setProperty('height', settings.height + 'px', 'important');
        previewContainer.style.setProperty('min-width', settings.width + 'px', 'important');
        previewContainer.style.setProperty('min-height', settings.height + 'px', 'important');
        previewContainer.style.setProperty('max-width', settings.width + 'px', 'important');
        previewContainer.style.setProperty('max-height', settings.height + 'px', 'important');
        previewContainer.style.setProperty('flex', 'none', 'important');
      } else {
        // For responsive mode, use flex layout
        previewContainer.style.removeProperty('width');
        previewContainer.style.removeProperty('height');
        previewContainer.style.removeProperty('min-width');
        previewContainer.style.removeProperty('min-height');
        previewContainer.style.removeProperty('max-width');
        previewContainer.style.removeProperty('max-height');
        previewContainer.style.removeProperty('flex');
      }
      
      // Apply border radius from form values
      if (settings.settings.roundCorners && settings.settings.cornerRadius) {
        previewContainer.style.borderRadius = settings.settings.cornerRadius + 'px';
      }
      
      if( window.isDebugging ) console.log('🎨 [Widget] Preview settings applied from form values:', settings);
    },

    // ENHANCED METHOD - Apply ALL chat style settings to actual chat dialog
    applyGroupSettingsToChatDialog(groupData) {
      const actualChatDialog = document.querySelector('.pingbash-chat-dialog');
      
      if (!actualChatDialog || !groupData) {
        if( window.isDebugging ) console.log('🎨 [Widget] Cannot apply settings - missing dialog or group data');
        return;
      }
      
      if( window.isDebugging ) console.log('🎨 [Widget] Applying comprehensive chat style settings:', groupData);
      
      // Create comprehensive CSS variables from group data
      const cssVars = {
        // Color variables
        '--title-bg-color': groupData.bg_color || '#ffffff',
        '--title-color': groupData.title_color || '#333333',
        '--msg-bg-color': groupData.msg_bg_color || '#f8f9fa',
        '--msg-text-color': groupData.msg_txt_color || '#333333',
        '--date-color': groupData.msg_date_color || '#999999',
        '--owner-msg-bg-color': groupData.reply_msg_color || '#2596be',
        '--input-bg-color': groupData.input_bg_color || '#ffffff',
        '--input-text-color': groupData.msg_txt_color || '#333333',
        
        // Font size variables
        '--font-size': (groupData.custom_font_size && groupData.font_size ? groupData.font_size : 14) + 'px',
        
        // Avatar visibility
        '--show-avatars': groupData.show_user_img !== false ? 'block' : 'none',
        
        // Corner radius
        '--corner-radius': (groupData.round_corners !== false && groupData.corner_radius ? groupData.corner_radius : 8) + 'px'
      };
      
      // Apply CSS variables to chat dialog
      Object.entries(cssVars).forEach(([property, value]) => {
        if (value && value !== 'null' && value !== 'undefined') {
          actualChatDialog.style.setProperty(property, value);
        }
      });
      
      // Apply size settings (frame dimensions)
      // On mobile (≤768px), skip inline size styles - let CSS media query handle it
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Mobile: Don't apply inline styles unless in popout mode with custom size
        const isPopout = actualChatDialog.classList.contains('popout-mode');
        const hasCustomSize = actualChatDialog.style.width && actualChatDialog.style.width !== '';
        
        if (isPopout && hasCustomSize) {
          // Preserve user's custom size in popout mode
          if( window.isDebugging ) console.log('📱 [Widget] Mobile popout mode - preserving custom size:', actualChatDialog.style.width, 'x', actualChatDialog.style.height);
        } else {
          // Full-screen mode or no custom size - clear styles
          actualChatDialog.style.width = '';
          actualChatDialog.style.height = '';
          actualChatDialog.style.minWidth = '';
          actualChatDialog.style.minHeight = '';
          actualChatDialog.style.maxWidth = '';
          actualChatDialog.style.maxHeight = '';
          if( window.isDebugging ) console.log('📱 [Widget] Mobile detected - using CSS media query sizing');
        }
      } else {
        // Desktop: Check if in embedded mode first
        if (this.isEmbeddedMode) {
          // In embedded mode, ensure dialog fills parent container
          actualChatDialog.style.width = '100%';
          actualChatDialog.style.height = '100%';
          actualChatDialog.style.minWidth = '';
          actualChatDialog.style.minHeight = '';
          actualChatDialog.style.maxWidth = '';
          actualChatDialog.style.maxHeight = '';
          if( window.isDebugging ) console.log('🎯 [Widget] Embedded mode: dialog set to fill parent (100% x 100%)');
        } else {
          // Desktop: Check if user has manually resized
          const hasCustomSize = actualChatDialog.style.width && 
                                actualChatDialog.style.width !== '' &&
                                !actualChatDialog.hasAttribute('data-initial-load');
          
          if (hasCustomSize) {
            // Preserve user's manual resize on desktop
            if( window.isDebugging ) console.log('🖥️ [Widget] Desktop - preserving user resized size:', actualChatDialog.style.width, 'x', actualChatDialog.style.height);
          } else if (groupData.size_mode === 'fixed' && groupData.frame_width && groupData.frame_height) {
            // Desktop: Apply fixed size from group data (first load)
          actualChatDialog.style.width = groupData.frame_width + 'px';
          actualChatDialog.style.height = groupData.frame_height + 'px';
            actualChatDialog.style.minWidth = '0px';
            actualChatDialog.style.minHeight = '0px';
            actualChatDialog.style.maxWidth = 'none';
            actualChatDialog.style.maxHeight = 'none';
            if( window.isDebugging ) console.log('🎨 [Widget] Applied fixed size:', groupData.frame_width + 'x' + groupData.frame_height);
          } else if (groupData.frame_width && groupData.frame_height) {
            // Desktop: Fallback for older format without size_mode
            actualChatDialog.style.width = groupData.frame_width + 'px';
            actualChatDialog.style.height = groupData.frame_height + 'px';
            if( window.isDebugging ) console.log('🎨 [Widget] Applied legacy size:', groupData.frame_width + 'x' + groupData.frame_height);
          } else {
            // Desktop: Responsive mode - reset to default responsive behavior
            actualChatDialog.style.width = '';
            actualChatDialog.style.height = '';
            actualChatDialog.style.minWidth = '';
            actualChatDialog.style.minHeight = '';
            actualChatDialog.style.maxWidth = '';
            actualChatDialog.style.maxHeight = '';
            if( window.isDebugging ) console.log('🎨 [Widget] Applied responsive sizing');
          }
        }
        
        // Remove initial load flag after first settings apply
        actualChatDialog.removeAttribute('data-initial-load');
      }
      
      // Apply border radius to dialog itself
      if (groupData.round_corners !== false && groupData.corner_radius) {
        actualChatDialog.style.borderRadius = groupData.corner_radius + 'px';
      }
      
      // Apply background color to dialog
      if (groupData.bg_color) {
        actualChatDialog.style.backgroundColor = groupData.bg_color;
      }
      
      // Apply specific styling to chat elements
      this.applyDetailedChatStyling(actualChatDialog, groupData);
      
      // Also refresh styling on all existing messages
      this.refreshAllMessagesStyling(actualChatDialog, groupData);
      
      // Ensure reply indicator CSS is injected (backup call)
      if (groupData.reply_msg_color && !this.widget?.classList.contains('pingbash-dark-mode')) {
        if( window.isDebugging ) console.log('🎨 [Widget] Backup CSS injection for reply indicator with color:', groupData.reply_msg_color);
        this.injectReplyIndicatorCSS(groupData.reply_msg_color);
      }
      
      if( window.isDebugging ) console.log('🎨 [Widget] ✅ Applied ALL chat style settings to dialog');
    },

    // NEW METHOD - Apply detailed styling to specific chat elements
    applyDetailedChatStyling(chatDialog, groupData) {
      if (!chatDialog || !groupData) return;
      
      // Apply header styling
      const header = chatDialog.querySelector('.pingbash-header');
      if (header && groupData.bg_color) {
        header.style.backgroundColor = groupData.bg_color;
        if (groupData.title_color) {
          header.style.color = groupData.title_color;
          // Apply color to header elements
          const headerElements = header.querySelectorAll('svg, .pingbash-online-count-badge');
          headerElements.forEach(el => el.style.color = groupData.title_color);
        }
      }
      
      // Apply input bar styling
      const inputBars = chatDialog.querySelectorAll('.pingbash-input-bar, .pingbash-controls-bar');
      inputBars.forEach(bar => {
        if (groupData.bg_color) {
          bar.style.backgroundColor = groupData.bg_color;
        }
      });
      
      // Apply message input styling
      const messageInput = chatDialog.querySelector('.pingbash-message-input');
      if (messageInput) {
        if (groupData.input_bg_color) {
          messageInput.style.backgroundColor = groupData.input_bg_color;
        }
        if (groupData.msg_txt_color) {
          messageInput.style.color = groupData.msg_txt_color;
        }
        if (groupData.custom_font_size && groupData.font_size) {
          messageInput.style.fontSize = groupData.font_size + 'px';
        }
        if (groupData.round_corners && groupData.corner_radius) {
          messageInput.style.borderRadius = Math.min(groupData.corner_radius, 20) + 'px';
        }
      }
      
      // Apply message styling to existing messages
      const messages = chatDialog.querySelectorAll('.pingbash-message');
      messages.forEach(message => {
        // Apply message background colors
        if (message.classList.contains('own')) {
          // User's own messages
          if (groupData.reply_msg_color) {
            //message.style.backgroundColor = groupData.reply_msg_color;
          }
        } else {
          // Other users' messages
          if (groupData.msg_bg_color) {
            //message.style.backgroundColor = groupData.msg_bg_color;
          }
        }
        
        // Apply text color
        if (groupData.msg_txt_color) {
          message.style.color = groupData.msg_txt_color;
          const messageContent = message.querySelector('.pingbash-message-content');
          if (messageContent) messageContent.style.color = groupData.msg_txt_color;
        }
        
        // Apply font size
        if (groupData.custom_font_size && groupData.font_size) {
          message.style.fontSize = groupData.font_size + 'px';
        }
        
        // Apply border radius to messages
        if (groupData.round_corners && groupData.corner_radius) {
          message.style.borderRadius = Math.min(groupData.corner_radius, 16) + 'px';
        }
        
        // Apply date color
        const dateElement = message.querySelector('.pingbash-message-time, .pingbash-message-date');
        if (dateElement && groupData.msg_date_color) {
          dateElement.style.color = groupData.msg_date_color;
        }
        
        // Handle avatar visibility
        const avatar = message.querySelector('.pingbash-message-avatar, .pingbash-avatar');
        if (avatar) {
          avatar.style.display = groupData.show_user_img !== false ? 'block' : 'none';
        }
        
        // Apply reply indicator styling in light mode - handled by CSS injection now
      });
      
      // Apply send button styling
      const sendBtn = chatDialog.querySelector('.pingbash-send-btn');
      if (sendBtn && groupData.reply_msg_color) {
        sendBtn.style.backgroundColor = groupData.reply_msg_color;
        if (groupData.round_corners && groupData.corner_radius) {
          sendBtn.style.borderRadius = Math.min(groupData.corner_radius, 20) + 'px';
        }
      }
      
      // Apply styling to control buttons
      const controlBtns = chatDialog.querySelectorAll('.pingbash-control-btn, .pingbash-media-btn');
      controlBtns.forEach(btn => {
        if (groupData.title_color) {
          btn.style.color = groupData.title_color;
        }
      });
      
      // Inject dynamic CSS for reply indicator styling in light mode
      if (groupData.reply_msg_color && !this.widget?.classList.contains('pingbash-dark-mode')) {
        this.injectReplyIndicatorCSS(groupData.reply_msg_color);
      }
      
      if( window.isDebugging ) console.log('🎨 [Widget] Applied detailed styling to chat elements');
    },

    // NEW METHOD - Inject CSS for reply indicator styling
    injectReplyIndicatorCSS(replyColor) {
      if( window.isDebugging ) console.log('🎨 [Widget] injectReplyIndicatorCSS called with color:', replyColor);
      
      // Remove existing reply indicator CSS if it exists
      const existingStyle = document.getElementById('pingbash-reply-indicator-custom-css');
      if (existingStyle) {
        if( window.isDebugging ) console.log('🎨 [Widget] Removing existing reply indicator CSS');
        existingStyle.remove();
      }
      
      // Convert hex to rgba
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      // Create dynamic CSS
      const css = `
        /* Custom reply indicator styling for light mode */
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-reply-indicator {
          background: ${hexToRgba(replyColor, 0.5)} !important;
          border-left-color: ${replyColor} !important;
        }
        
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-reply-indicator:hover {
          background: ${hexToRgba(replyColor, 0.3)} !important;
        }
        
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-reply-line {
          background: ${replyColor} !important;
        }
        
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-reply-sender {
          color: ${replyColor} !important;
        }
        
        /* Don't override own message reply indicators 
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-message.own .pingbash-reply-indicator {
          background: rgba(255, 255, 255, 0.2) !important;
          border-left-color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-message.own .pingbash-reply-line {
          background: rgba(255, 255, 255, 0.8) !important;
        }
        
        .pingbash-chat-dialog:not(.pingbash-dark-mode) .pingbash-message.own .pingbash-reply-sender {
          color: rgba(255, 255, 255, 0.9) !important;
        }*/
      `;
      
      // Inject the CSS
      const style = document.createElement('style');
      style.id = 'pingbash-reply-indicator-custom-css';
      style.textContent = css;
      document.head.appendChild(style);
      
      if( window.isDebugging ) console.log('🎨 [Widget] Injected custom reply indicator CSS with color:', replyColor);
      if( window.isDebugging ) console.log('🎨 [Widget] CSS content:', css);
      if( window.isDebugging ) console.log('🎨 [Widget] Style element added to head:', document.getElementById('pingbash-reply-indicator-custom-css'));
    },

    // TEST METHOD - Manual CSS injection for testing
    testReplyIndicatorCSS(color = '#ff0000') {
      console.log('🧪 [Widget] Testing reply indicator CSS injection with color:', color);
      this.injectReplyIndicatorCSS(color);
      console.log('🧪 [Widget] Test complete - check if reply indicators changed color');
    },

    // NEW METHOD - Refresh styling on all existing messages
    refreshAllMessagesStyling(chatDialog, groupData) {
      if (!chatDialog || !groupData || !this.applyStyleToMessage) return;
      
      const messages = chatDialog.querySelectorAll('.pingbash-message');
      if( window.isDebugging ) console.log('🎨 [Widget] Refreshing styles for', messages.length, 'existing messages');
      
      messages.forEach(messageEl => {
        const isOwn = messageEl.classList.contains('own');
        this.applyStyleToMessage(messageEl, groupData, isOwn);
      });
      
      if( window.isDebugging ) console.log('🎨 [Widget] ✅ Refreshed styling for all existing messages');
    },

    // NEW METHOD - Get current configuration from form
    getCurrentConfiguration(modal) {
      // Get all form values with proper selectors and fallbacks
      const config = {
        colors: {
          background: modal.querySelector('#bg-color-body')?.value || '#FFFFFF',
          title: modal.querySelector('#title-color-body')?.value || '#333333',
          msgBg: modal.querySelector('#msg-bg-color-body')?.value || '#F5F5F5',
          msgText: modal.querySelector('#msg-text-color-body')?.value || '#000000',
          ownerMsg: modal.querySelector('#owner-msg-color-body')?.value || '#2596be',
          dateText: modal.querySelector('#date-color-body')?.value || '#999999',
          inputBg: modal.querySelector('#input-bg-color-body')?.value || '#FFFFFF',
          inputText: modal.querySelector('#input-text-color-body')?.value || '#000000'
        },
        settings: {
          userImages: modal.querySelector('#show-avatars-body')?.checked ?? true,
          customFontSize: modal.querySelector('#custom-font-size-body')?.checked ?? false,
          fontSize: parseInt(modal.querySelector('#font-size-slider-body')?.value) || 14,
          roundCorners: modal.querySelector('#round-corners-body')?.checked ?? true,
          cornerRadius: parseInt(modal.querySelector('#corner-radius-slider-body')?.value) || 12
        },
        // Size settings
        sizeMode: modal.querySelector('input[name="size-mode-body"]:checked')?.value || 'responsive',
        width: Math.max(400, Math.min(800, parseInt(modal.querySelector('#width-input-body')?.value) || 500)),
        height: Math.max(300, Math.min(900, parseInt(modal.querySelector('#height-input-body')?.value) || 400)),
        // Group name
        groupName: modal.querySelector('#group-name-body')?.value || 'Group Name'
      };
      
      // Debug log for troubleshooting
      if( window.isDebugging ) console.log('🔍 [Widget] Current configuration extracted:', config);
      
      return config;
          },

    // Chat Mode Filter Methods (same as F version)
    handleFilterModeChange(filterMode) {
      if( window.isDebugging ) console.log('🔍 [Widget] Filter mode changed to:', filterMode);
      
      // Store current filter mode
      this.filterMode = filterMode;
      this.filteredUser = null;
      
      // Show user search modal for 1-on-1 mode
      if (filterMode === 1) {
        if( window.isDebugging ) console.log('🔍 [Widget] Opening user search modal for 1-on-1 mode');
        this.showUserSearchModal();
        return; // Don't continue with filter logic until user is selected
      }
      
      // Show mods option only for admins/moderators
      const modsOption = this.dialog.querySelector('.pingbash-mods-option');
      if (modsOption) {
        if (this.isAuthenticated && this.isModeratorOrAdmin()) {
          modsOption.style.display = 'block';
          if( window.isDebugging ) console.log('🔍 [Widget] Showing mods mode for admin/moderator');
        } else {
          modsOption.style.display = 'none';
          if( window.isDebugging ) console.log('🔍 [Widget] Hiding mods mode for regular user/anonymous');
        }
      }
      
      // Re-filter messages
      this.applyMessageFilter();
      
      // Show mode status feedback (same as F version)
      this.showModeStatus(filterMode);
    },

    handleUserSearch(searchTerm) {
      if( window.isDebugging ) console.log('🔍 [Widget] User search:', searchTerm);
      
      const userDropdown = this.dialog.querySelector('.pingbash-user-dropdown');
      if (!userDropdown) return;
      
      if (!searchTerm.trim()) {
        userDropdown.style.display = 'none';
        return;
      }
      
      // Get all group members (not just online users) for 1-on-1 messaging
      const allGroupMembers = this.getGroupMembers();
      const filteredUsers = allGroupMembers.filter(user => 
        user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Get online user IDs for status indicators
      const onlineUserIds = this.onlineUserIds || [];
      
      // Populate dropdown
      userDropdown.innerHTML = '';
      
      if (filteredUsers.length === 0) {
        userDropdown.innerHTML = '<div class="pingbash-user-dropdown-item">No users found</div>';
      } else {
        filteredUsers.forEach(user => {
          const item = document.createElement('div');
          item.className = 'pingbash-user-dropdown-item';
          
          // Check if user is online
          const isOnline = onlineUserIds.includes(user.id);
          const statusIndicator = isOnline ? 
            '<span style="color: #4CAF50; margin-right: 5px;">●</span>' : 
            '<span style="color: #999; margin-right: 5px;">●</span>';
          
          item.innerHTML = `${statusIndicator}${user.name}${isOnline ? '' : ' (offline)'}`;
          item.addEventListener('click', () => {
            this.selectUser(user);
          });
          userDropdown.appendChild(item);
        });
      }
      
      userDropdown.style.display = 'block';
    },

    selectUser(user) {
      if( window.isDebugging ) console.log('🔍 [Widget] User selected:', user);
      
      this.filteredUser = user;
      
      // Update search input
      const userSearchInput = this.dialog.querySelector('.pingbash-user-search-input');
      if (userSearchInput) {
        userSearchInput.value = user.name;
      }
      
      // Hide dropdown
      const userDropdown = this.dialog.querySelector('.pingbash-user-dropdown');
      if (userDropdown) {
        userDropdown.style.display = 'none';
      }
      
      // Re-filter messages
      this.applyMessageFilter();
      
      // Update placeholder if in 1-on-1 mode
      if (this.filterMode === 1) {
        this.updateInputPlaceholder(1);
      }
    },

    getOnlineUsers() {
      // Get real online users from socket data mapped to group members (same as widget.js)
      let onlineUsers = [];

      // First, try to map online user IDs to actual member names
      if (this.onlineUserIds && this.onlineUserIds.length > 0 && this.groupMembers && this.groupMembers.length > 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Mapping online user IDs to names:', this.onlineUserIds);
        if( window.isDebugging ) console.log('👥 [Widget] Available group members:', this.groupMembers.length);

        onlineUsers = this.onlineUserIds
          .map(userId => {
            // Find member info from group members
            const member = this.groupMembers.find(m => m.id === userId);
            if (member) {
              return { id: member.id, name: member.name };
            } else {
              const last3Digits = String(userId).slice(-3);
              return { id: userId, name: `anon${last3Digits}` };
            }
          })
          .filter(user => user.name !== `User ${user.id}`); // Remove fallback names if possible
      }

      // If no online users mapped, use all group members as fallback
      if (onlineUsers.length === 0 && this.groupMembers && this.groupMembers.length > 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Using all group members as fallback');
        onlineUsers = this.groupMembers.map(member => ({
          id: member.id,
          name: member.name
        }));
      }

      // Final fallback - create mock users from online IDs
      if (onlineUsers.length === 0 && this.onlineUserIds && this.onlineUserIds.length > 0) {
        if( window.isDebugging ) console.log('👥 [Widget] Creating mock users from online IDs');
        onlineUsers = this.onlineUserIds.map(userId => {
          const last3Digits = String(userId).slice(-3);
          return { id: userId, name: `anon${last3Digits}` };
        });
      }

      if( window.isDebugging ) console.log('👥 [Widget] Final online users list:', onlineUsers);
      return onlineUsers;
    },

    getGroupMembers() {
      // Get all group members for 1-on-1 messaging (includes both registered members AND online anonymous users)
      if( window.isDebugging ) console.log('👥 [Widget] Getting all group members for 1-on-1 search');
      
      const currentUserId = this.getCurrentUserId();
      let allMembers = [];
      
      // Use group.members if available, otherwise fall back to groupMembers
      const membersSource = this.group?.members || this.groupMembers || [];
      
      if (membersSource.length > 0) {
        // Convert to consistent format and exclude current user
        allMembers = membersSource
          .filter(member => member.id !== currentUserId) // Don't include self in 1-on-1 search
          .map(member => {
            // For anonymous users (ID >= 1000000), show "anon" + last 3 digits
            let displayName = member.name;
            if (!displayName) {
              if (member.id >= 1000000) {
                // Anonymous user - show "anon" + last 3 digits
                displayName = `anon${String(member.id).slice(-3)}`;
              } else {
                // Regular user without name
                displayName = `User ${member.id}`;
              }
            }
            
            return {
              id: member.id,
              name: displayName,
              avatar: member.avatar,
              email: member.email
            };
          });
        
        if( window.isDebugging ) console.log('👥 [Widget] Registered members:', allMembers.length);
      } else {
        if( window.isDebugging ) console.log('👥 [Widget] No registered group members available');
      }
      
      // ALSO include online anonymous users (they're not in group.members from DB)
      const onlineUsers = this.getOnlineUsers();
      if( window.isDebugging ) console.log('👥 [Widget] Online users for merge:', onlineUsers.length);
      
      onlineUsers.forEach(onlineUser => {
        // Only add anonymous users (ID >= 1000000) and users not already in the list
        if (onlineUser.id >= 1000000 && onlineUser.id !== currentUserId) {
          const alreadyExists = allMembers.some(m => m.id === onlineUser.id);
          if (!alreadyExists) {
            if( window.isDebugging ) console.log('👥 [Widget] Adding online anonymous user:', onlineUser.id, onlineUser.name);
            allMembers.push({
              id: onlineUser.id,
              name: onlineUser.name, // Already formatted as "anonXXX" by getOnlineUsers
              avatar: onlineUser.avatar,
              email: onlineUser.email
            });
          }
        }
      });
      
      if( window.isDebugging ) console.log('👥 [Widget] Total members available for 1-on-1 search:', allMembers.length);
      if( window.isDebugging ) console.log('👥 [Widget] All members:', allMembers.map(m => ({ id: m.id, name: m.name })));
      
      return allMembers;
    },

    applyMessageFilter() {
      if( window.isDebugging ) console.log('🔍 [Widget] Applying message filter - mode:', this.filterMode, 'user:', this.filteredUser);
      
      // Re-display messages with current filter
      if (this.allMessages) {
        this.displayMessages(this.allMessages);
      }
    },

    showModeStatus(filterMode) {
      // Show temporary status message for mode changes (same as F version)
      const modes = {
        0: 'Public Mode - All users can see your messages',
        1: '1-on-1 Mode - Private messages with selected user + public messages',
        2: 'Mods Mode - Send messages only to moderators and admins'
      };
      
      const statusMessage = modes[filterMode] || 'Unknown mode';
      if( window.isDebugging ) console.log('🔍 [Widget] Chat mode:', statusMessage);
      
      // Update input placeholder to show current mode
      this.updateInputPlaceholder(filterMode);
      
      // You could add a temporary toast notification here if desired
      // For now, just log the mode change
    },

    updateInputPlaceholder(filterMode) {
      // Update input placeholder based on current mode (same as F version)
      const messageInput = this.dialog.querySelector('.pingbash-message-input');
      if (!messageInput) return;
      
      switch (filterMode) {
        case 0:
          messageInput.placeholder = 'Type a public message...';
          break;
        case 1:
          const selectedUser = this.filteredUser?.name || 'a user';
          messageInput.placeholder = `Private message to ${selectedUser}...`;
          break;
        case 2:
          messageInput.placeholder = 'Report to moderators or ask for help...';
          break;
        default:
          messageInput.placeholder = 'Type a message...';
      }
    },

    // NEW METHOD - Toggle Dark Mode
    toggleDarkMode() {
      if( window.isDebugging ) console.log('🌙 [Widget] Toggling dark mode');
      
      // Toggle the dark mode state
      this.isDarkMode = !this.isDarkMode;
      
      // Save preference to localStorage
      try {
        localStorage.setItem('pingbash_dark_mode', JSON.stringify(this.isDarkMode));
      } catch (error) {
        if( window.isDebugging ) console.log('❌ [Widget] Error saving dark mode preference:', error);
      }
      
      // Apply dark mode to the widget
      this.applyDarkMode();
      
      // Update toggle icons and text
      this.updateDarkModeToggle();
      
      if( window.isDebugging ) console.log('🌙 [Widget] Dark mode toggled:', this.isDarkMode ? 'ON' : 'OFF');
    },

    // NEW METHOD - Apply Dark Mode Styling
    applyDarkMode() {
      if (!this.dialog) return;
      
      if (this.isDarkMode) {
        this.dialog.classList.add('pingbash-dark-mode');
        document.documentElement.setAttribute('data-pingbash-theme', 'dark');
      } else {
        this.dialog.classList.remove('pingbash-dark-mode');
        document.documentElement.setAttribute('data-pingbash-theme', 'light');
      }
      
      // Apply to any existing modals/popups
      const modals = document.querySelectorAll([
        '.pingbash-signin-modal',
        '.pingbash-signup-modal', 
        '.pingbash-verification-modal',
        '.pingbash-chat-rules-popup',
        '.pingbash-sound-popup',
        '.pingbash-group-creation-modal-body',
        '.pingbash-edit-style-modal-body',
        '.pingbash-user-search-modal'
      ].join(','));
      
      modals.forEach(modal => {
        if (this.isDarkMode) {
          modal.classList.add('pingbash-dark-mode');
        } else {
          modal.classList.remove('pingbash-dark-mode');
        }
      });
    },

    // NEW METHOD - Update Dark Mode Toggle UI
    updateDarkModeToggle() {
      const lightIcons = this.dialog.querySelectorAll('.pingbash-theme-icon-light');
      const darkIcons = this.dialog.querySelectorAll('.pingbash-theme-icon-dark'); 
      const themeTexts = this.dialog.querySelectorAll('.pingbash-theme-text');
      
      lightIcons.forEach(icon => {
        icon.style.display = this.isDarkMode ? 'none' : 'inline';
      });
      
      darkIcons.forEach(icon => {
        icon.style.display = this.isDarkMode ? 'inline' : 'none';
      });
      
      themeTexts.forEach(text => {
        text.textContent = this.isDarkMode ? 'Light Mode' : 'Dark Mode';
      });
    },

    // NEW METHOD - Initialize Dark Mode from localStorage
    initializeDarkMode() {
      // Load dark mode preference from localStorage
      try {
        const savedDarkMode = localStorage.getItem('pingbash_dark_mode');
        this.isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
      } catch (error) {
        if( window.isDebugging ) console.log('❌ [Widget] Error loading dark mode preference:', error);
        this.isDarkMode = false;
      }
      
            // Apply the mode and update UI
    this.applyDarkMode();
    this.updateDarkModeToggle();
    
    // Set up observer for dynamically created modals
    this.setupDarkModeObserver();
    
    if( window.isDebugging ) console.log('🌙 [Widget] Dark mode initialized:', this.isDarkMode ? 'ON' : 'OFF');
  },

  // NEW METHOD - Apply dark mode to a specific element (for dynamically created modals)
  applyDarkModeToElement(element) {
    if (!element) return;
    
    if (this.isDarkMode) {
      element.classList.add('pingbash-dark-mode');
    } else {
      element.classList.remove('pingbash-dark-mode');
    }
  },

  // NEW METHOD - Set up observer to watch for new modals
  setupDarkModeObserver() {
    if (this.darkModeObserver) {
      this.darkModeObserver.disconnect();
    }
    
    this.darkModeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if it's a modal or contains modals
            const modalSelectors = [
              '.pingbash-signin-modal',
              '.pingbash-signup-modal', 
              '.pingbash-verification-modal',
              '.pingbash-chat-rules-popup',
              '.pingbash-sound-popup',
              '.pingbash-group-creation-modal-body',
              '.pingbash-edit-style-modal-body',
              '.pingbash-user-search-modal'
            ];
            
            modalSelectors.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                this.applyDarkModeToElement(node);
              } else if (node.querySelector) {
                const childModals = node.querySelectorAll(selector);
                childModals.forEach(modal => this.applyDarkModeToElement(modal));
              }
            });
          }
        });
      });
    });
    
    // Start observing
    this.darkModeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  },

});
}


