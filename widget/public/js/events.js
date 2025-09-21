/**
 * EVENTS functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add events methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype)
  if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
    Object.assign(window.PingbashChatWidget.prototype, {

      // EXACT COPY from widget.js - attachEventListeners method
      attachEventListeners() {
        // Chat button click
        this.button.addEventListener('click', () => this.toggleDialog());

        // Hamburger menu
        const hamburgerBtn = this.dialog.querySelector('.pingbash-hamburger-btn');
        const hamburgerDropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');

        hamburgerBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleHamburgerMenu();
        });

        // Hamburger menu items
        const menuItems = this.dialog.querySelectorAll('.pingbash-menu-item');
        menuItems.forEach(item => {
          item.addEventListener('click', () => {
            const action = item.dataset.action;
            this.handleMenuAction(action);
            this.hideHamburgerMenu();
          });
        });

        // Close hamburger menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!hamburgerBtn?.contains(e.target) && !hamburgerDropdown?.contains(e.target)) {
            this.hideHamburgerMenu();
          }
        });

        // Logo click to create group
        const logo = this.dialog.querySelector('.pingbash-logo');
        console.log('🔍 [Widget] Logo element found:', !!logo, logo);

        if (logo) {
          // Add visual indicator that logo is clickable
          logo.style.cursor = 'pointer';
          logo.style.transition = 'opacity 0.2s';

          logo.addEventListener('click', (e) => {
            console.log('🔍 [Widget] Logo clicked - opening create new group modal');
            console.log('🔍 [Widget] Event details:', e);
            e.preventDefault();
            e.stopPropagation();

            this.showGroupCreationModal();
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
        const soundCloseBtn = this.dialog.querySelector('.pingbash-popup-close');
        const soundOkBtn = this.dialog.querySelector('.pingbash-sound-ok-btn');
        const soundOverlay = this.dialog.querySelector('.pingbash-popup-overlay');

        soundCloseBtn?.addEventListener('click', () => this.hideSoundSettings());
        soundOkBtn?.addEventListener('click', () => this.saveSoundSettings());
        soundOverlay?.addEventListener('click', () => this.hideSoundSettings());

        // Reply preview close button event listener
        const replyCloseBtn = this.dialog.querySelector('.pingbash-reply-preview-close');
        replyCloseBtn?.addEventListener('click', () => {
          console.log('💬 [Widget] Reply preview close button clicked');
          this.hideReplyPreview();
        });

        // Sign-in modal
        const signinModal = this.dialog.querySelector('.pingbash-signin-modal');
        const signinCloseBtn = signinModal?.querySelector('.pingbash-popup-close');
        const signinSubmitBtn = this.dialog.querySelector('.pingbash-signin-submit-btn');
        const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
        const signinOverlay = signinModal?.querySelector('.pingbash-popup-overlay');

        console.log('🔍 [Widget] Button elements found:', {
          signinCloseBtn: !!signinCloseBtn,
          signinSubmitBtn: !!signinSubmitBtn,
          continueAnonBtns: continueAnonBtns.length
        });

        // Debug: Add visual indicator to all continue buttons
        continueAnonBtns.forEach((btn, index) => {
          btn.style.border = '2px solid red';
          btn.style.backgroundColor = '#ffcccc';
          console.log(`🔍 [Widget] Continue button ${index + 1} styled for debugging`);
        });

        signinCloseBtn?.addEventListener('click', () => this.hideSigninModal());
        signinSubmitBtn?.addEventListener('click', () => this.handleSignin());

        // Attach event listeners to ALL Continue As Guest buttons
        continueAnonBtns.forEach((continueAnonBtn, index) => {
          console.log(`🔍 [Widget] Adding click listener to Continue As Guest button ${index + 1}`);
          console.log(`🔍 [Widget] Button ${index + 1} properties:`, {
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
            console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED!`);
            console.log('🔍 [Widget] Click event details:', {
              target: event.target,
              currentTarget: event.currentTarget,
              type: event.type
            });
            event.preventDefault();
            event.stopPropagation();
            this.continueAsAnonymous();
          });

          continueAnonBtn.addEventListener('mousedown', () => {
            console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEDOWN!`);
          });

          continueAnonBtn.addEventListener('mouseup', () => {
            console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEUP!`);
          });

          // Also try direct onclick
          continueAnonBtn.onclick = (event) => {
            console.log(`🔍 [Widget] Continue As Guest button ${index + 1} ONCLICK!`);
            event.preventDefault();
            event.stopPropagation();
            this.continueAsAnonymous();
          };

          // Mark that listener has been attached
          continueAnonBtn._listenerAttached = true;

          console.log(`🔍 [Widget] All event listeners added to Continue As Guest button ${index + 1}`);
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

        // Group creation modal (body-attached modal will be set up when created)
        // Event listeners for body modal are set up in setupBodyModalEventListeners()

        // Online users icon click
        const onlineUsersContainer = this.dialog.querySelector('.pingbash-online-users-container');
        onlineUsersContainer?.addEventListener('click', () => {
          console.log('👥 [Widget] Online users icon clicked');
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
        this.unreadCount = 0;
        this.updateUnreadBadge();

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

      // EXACT COPY from widget.js - handleMenuAction method
      handleMenuAction(action) {
        console.log('🍔 [Widget] Menu action:', action);

        switch (action) {
          case 'group-info':
            this.showGroupInfo();
            break;
          case 'members':
            this.showMembers();
            break;
          case 'banned-users':
            this.showBannedUsers();
            break;
          case 'ip-bans':
            this.showIpBans();
            break;
          case 'chat-rules':
            this.showChatRules();
            break;
          case 'settings':
            this.showSettings();
            break;
          case 'close':
            this.closeDialog();
            break;
        }
      },

      // EXACT COPY from widget.js - handleImageUpload method
      handleImageUpload() {
        console.log('📷 [Widget] Image upload clicked');
        // Create hidden file input for images
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('📷 [Widget] Image selected:', file.name);
            await this.uploadAndSendFile(file, 'image');
          }
        };
        input.click();
      },

      // EXACT COPY from widget.js - handleFileUpload method
      handleFileUpload() {
        console.log('📎 [Widget] File upload clicked');
        // Create hidden file input for any file type
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log('📎 [Widget] File selected:', file.name);
            await this.uploadAndSendFile(file, 'file');
          }
        };
        input.click();
      },

      // EXACT COPY from widget.js - toggleEmojiPicker method
      toggleEmojiPicker() {
        console.log('😀 [Widget] Emoji button clicked');
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
          console.log('😀 [Widget] Emoji click ignored - too fast');
          return;
        }
        this.lastEmojiClickTime = now;

        const emoji = e.target.dataset.emoji;
        if (!emoji) {
          console.log('😀 [Widget] No emoji data found');
          return;
        }

        console.log('😀 [Widget] Emoji selected:', emoji);
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
        console.log('@ [Widget] Showing mention dropdown for:', searchTerm);

        // Get online users (mock data for now - in real app would come from socket)
        const onlineUsers = this.getOnlineUsers();
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
          console.log('👥 [Widget] Cannot request online users - missing socket, connection, or groupId');
          return;
        }

        // Prevent too frequent requests
        const now = Date.now();
        if (this.lastOnlineUsersRequest && (now - this.lastOnlineUsersRequest) < 2000) {
          console.log('👥 [Widget] Skipping online users request - too frequent');
          return;
        }
        this.lastOnlineUsersRequest = now;

        console.log('👥 [Widget] Requesting online users for group:', this.groupId, '(public endpoint)');
        // No token needed - endpoint is now public
        this.socket.emit('get group online users', { groupId: parseInt(this.groupId) });
      },

      // EXACT COPY from widget.js - getOnlineUsers method
      getOnlineUsers() {
        // Get real online users from socket data mapped to group members
        let onlineUsers = [];

        // First, try to map online user IDs to actual member names
        if (this.onlineUserIds && this.onlineUserIds.length > 0 && this.groupMembers && this.groupMembers.length > 0) {
          console.log('👥 [Widget] Mapping online user IDs to names:', this.onlineUserIds);
          console.log('👥 [Widget] Available group members:', this.groupMembers.length);

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
          console.log('👥 [Widget] Using all group members as fallback');
          onlineUsers = this.groupMembers.map(member => ({
            id: member.id,
            name: member.name
          }));
        }

        // Final fallback to mock data if no real data available
        if (onlineUsers.length === 0) {
          console.log('👥 [Widget] Using mock data as final fallback');
          onlineUsers = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Mike Johnson' },
            { id: 4, name: 'Sarah Wilson' },
            { id: 5, name: 'David Brown' }
          ];
        }

        console.log('👥 [Widget] Final online users list:', onlineUsers);
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

      // EXACT COPY from widget.js - banUser method
      banUser(userId) {
        if (!this.socket || !this.isConnected) return;

        console.log('🔍 [Widget] Banning user:', userId);
        this.socket.emit('ban group user', {
          groupId: this.groupId,
          userId: userId,
          token: `anonuser${this.config.groupName}${this.userId}`
        });
      },

      // EXACT COPY from widget.js - timeoutUser method
      timeoutUser(userId) {
        if (!this.socket || !this.isConnected) return;

        console.log('🔍 [Widget] Timing out user:', userId);
        this.socket.emit('timeout user', {
          groupId: this.groupId,
          userId: userId,
          token: `anonuser${this.config.groupName}${this.userId}`,
          timeoutMinutes: 15
        });
      },

      // NEW METHOD - Set up event listeners for body-attached group creation modal
      setupBodyModalEventListeners() {
        const modal = document.body.querySelector('.pingbash-group-creation-modal-body');
        if (!modal) {
          console.log('🏗️ [Widget] Body modal not found, skipping event listener setup');
          return;
        }

        console.log('🏗️ [Widget] Setting up body modal event listeners');

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

        console.log('🏗️ [Widget] Body modal event listeners set up successfully');
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

        console.log('🏗️ [Widget] Body modal form interactions set up (W Version)');
      },

      // NEW METHOD - Set up configuration panel interactions
      setupConfigurationInteractions(modal) {
        // Helper function to update preview immediately
        const updatePreviewImmediately = () => {
          const config = this.getCurrentConfiguration(modal);
          this.applySettingsToPreview(modal, config);
          console.log('🔄 [Widget] Preview updated immediately from form change');
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

        // Width and Height inputs - immediate preview update
        const widthInput = modal.querySelector('#width-input-body');
        const heightInput = modal.querySelector('#height-input-body');
        
        if (widthInput) {
          widthInput.addEventListener('input', updatePreviewImmediately);
          widthInput.addEventListener('change', updatePreviewImmediately);
        }
        
        if (heightInput) {
          heightInput.addEventListener('input', updatePreviewImmediately);
          heightInput.addEventListener('change', updatePreviewImmediately);
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
        
        console.log('🎯 [Widget] All form inputs configured for immediate preview updates');
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
          console.log('🎯 [Widget] Preview container found - using horizontal layout');
        }

        console.log('🏗️ [Widget] Preview interactions set up (horizontal layout)');
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
          
          console.log('🔄 [Widget] Preview synced with EXACT actual chat content');
        } else {
          // Show placeholder content when no messages
          this.showPreviewPlaceholder(previewMessagesContainer);
        }
      },

      // NEW METHOD - Sync preview header with actual chat (EXACT HTML)
      syncPreviewHeader(modal) {
        // The actual chat dialog doesn't have a group name in header initially
        // Group name is shown in the group creation form, not in the header
        console.log('🔄 [Widget] Header sync - no group name in header to sync');
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
        
        console.log('🔄 [Widget] Preview content sync set up');
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
        
        console.log('🎨 [Widget] Preview settings applied from form values:', settings);
      },

      // NEW METHOD - Apply saved group settings to actual chat dialog ONLY
      applyGroupSettingsToChatDialog(groupData) {
        const actualChatDialog = document.querySelector('.pingbash-chat-dialog');
        
        if (!actualChatDialog || !groupData) return;
        
        // Create CSS variables from SAVED group data
        const cssVars = {
          '--title-bg-color': groupData.bg_color || 'white',
          '--title-color': groupData.title_color || '#333',
          '--msg-bg-color': groupData.msg_bg_color || '#f8f9fa',
          '--msg-text-color': groupData.msg_txt_color || '#333',
          '--date-color': groupData.msg_date_color || '#999',
          '--owner-msg-bg-color': groupData.reply_msg_color || '#2596be',
          '--input-bg-color': groupData.input_bg_color || '#f8f9fa',
          '--input-text-color': '#333',
          '--font-size': (groupData.custom_font_size && groupData.font_size ? groupData.font_size : 14) + 'px',
          '--show-avatars': groupData.show_user_img ? 'block' : 'none',
          '--corner-radius': (groupData.round_corners && groupData.corner_radius ? groupData.corner_radius : 12) + 'px'
        };
        
        // Apply to actual chat dialog ONLY (using saved group settings)
        Object.entries(cssVars).forEach(([property, value]) => {
          if (value && value !== 'null') {
            actualChatDialog.style.setProperty(property, value);
          }
        });
        
        // Apply size settings from saved group data
        if (groupData.frame_width && groupData.frame_height) {
          actualChatDialog.style.width = groupData.frame_width + 'px';
          actualChatDialog.style.height = groupData.frame_height + 'px';
        }
        
        // Apply border radius from saved group data
        if (groupData.round_corners && groupData.corner_radius) {
          actualChatDialog.style.borderRadius = groupData.corner_radius + 'px';
        }
        
        console.log('🎨 [Widget] Actual chat settings applied from saved group data:', groupData);
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
          width: parseInt(modal.querySelector('#width-input-body')?.value) || 500,
          height: parseInt(modal.querySelector('#height-input-body')?.value) || 400,
          // Group name
          groupName: modal.querySelector('#group-name-body')?.value || 'Group Name'
        };
        
        // Debug log for troubleshooting
        console.log('🔍 [Widget] Current configuration extracted:', config);
        
        return config;
      },

    });
  }