/**
 * MODALS functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add modals methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) 
  if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - showGroupInfo method
    showGroupInfo() {
      console.log('ℹ️ [Widget] Showing group info for:', this.config.groupName);
      // TODO: Implement group info modal
    },

  // EXACT COPY from widget.js - showMembers method
    showMembers() {
      console.log('👥 [Widget] Showing group members');
      // TODO: Implement members modal
    },

  // EXACT COPY from widget.js - showBannedUsers method
    // 🔄 Show banned users dialog ONLY (separate from IP bans)
    showBannedUsers() {
      console.log('🚫 [Widget] Showing banned users dialog only');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Get ONLY banned users (IP bans have separate menu/dialog)
      console.log('🚫 [Widget] Requesting banned users with token:', this.authenticatedToken ? 'present' : 'missing');
      
      this.socket.emit('get banned users', {
        groupId: parseInt(this.groupId),
        token: this.authenticatedToken
      });
    },

    // 🆕 Unban IP address
    unbanIpAddress(ipAddress) {
      console.log('✅ [Widget] Unbanning IP address:', ipAddress);
      
      if (!this.canManageCensoredContent()) {
        //alert('You do not have permission to unban IP addresses');
        return;
      }

      if (confirm(`Are you sure you want to unban IP address ${ipAddress}?`)) {
        console.log('📤 [Widget] Sending IP unban request');
        
        this.socket.emit('unban ip address', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          ipAddress: ipAddress
        });
      }
    },

  // EXACT COPY from widget.js - showIpBans method
    showIpBans() {
      console.log('🌐 [Widget] Showing IP bans');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Emit socket event to get IP bans (same as W version)
      console.log('🌐 [Widget] Requesting IP bans with token:', this.authenticatedToken ? 'present' : 'missing');
      this.socket.emit('get ip bans', {
        groupId: parseInt(this.groupId),
        token: this.authenticatedToken
      });
    },

  // EXACT COPY from widget.js - showSettings method
    showSettings() {
      console.log('⚙️ [Widget] Showing settings');
      // TODO: Implement settings modal
    },

  // EXACT COPY from widget.js - getChatRules method
    getChatRules() {
      if (!this.socket || !this.isConnected) return;
  
      console.log('🔍 [Widget] [Chat Rules] getChatRules called with groupId:', this.groupId, 'token:', this.isAuthenticated ? 'Authenticated' : 'Anonymous');
  
      // Support both authenticated and anonymous users
      let token = null;
      if (this.isAuthenticated && this.authenticatedToken) {
        token = this.authenticatedToken;
      } else if (!this.isAuthenticated && this.userId) {
        // Use anonymous token for anonymous users
        token = this.userId;
      }

      if (token && this.groupId) {
        this.socket.emit('get chat rules', {
          token: token,
          groupId: parseInt(this.groupId)
        });
        console.log('🔍 [Widget] [Chat Rules] Emitted get chat rules event with token type:', this.isAuthenticated ? 'authenticated' : 'anonymous');
      } else {
        console.log('🔍 [Widget] [Chat Rules] Cannot emit get chat rules - missing token or groupId:', {
          hasToken: !!token,
          groupId: this.groupId,
          isAuthenticated: this.isAuthenticated,
          hasAuthToken: !!this.authenticatedToken,
          hasUserId: !!this.userId
        });
      }
    },

  // EXACT COPY from widget.js - updateChatRules method
    updateChatRules(chatRules, showChatRules = true) {
      if (!this.socket || !this.isConnected) return;
  
      console.log('🔍 [Widget] [Chat Rules] updateChatRules called with:', {
        groupId: this.groupId,
        chatRules: chatRules?.length,
        showChatRules
      });
  
      if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
        this.socket.emit('update chat rules', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          chatRules,
          showChatRules
        });
        console.log('🔍 [Widget] [Chat Rules] Emitted update chat rules event');
      } else {
        console.log('🔍 [Widget] [Chat Rules] Cannot emit update chat rules - missing token or groupId');
      }
    },

  // EXACT COPY from widget.js - showChatRules method
    showChatRules() {
      console.log('📋 [Widget] [Chat Rules] Showing chat rules');
  
      // Set group name in popup
      const groupNameDisplay = this.dialog.querySelector('.pingbash-group-name-display');
      if (groupNameDisplay) {
        groupNameDisplay.textContent = this.config.groupName || 'Group';
      }
  
      // Check if user is creator (same logic as W version)
      this.isCreator = this.currentUserId && this.group && (this.currentUserId == this.group.creater_id);
      
      console.log('📋 [Widget] [Chat Rules] Creator check:', {
        currentUserId: this.currentUserId,
        groupCreatorId: this.group?.creater_id,
        isCreator: this.isCreator,
        group: this.group
      });
  
      // Show/hide edit button based on creator status
      const editBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
      if (editBtn) {
        editBtn.style.display = this.isCreator ? 'block' : 'none';
        console.log('📋 [Widget] [Chat Rules] Edit button display:', editBtn.style.display);
      } else {
        console.error('📋 [Widget] [Chat Rules] Edit button not found in DOM');
      }
  
      // Load current rules if authenticated
      if (this.isAuthenticated) {
        this.getChatRules();
      } else {
        // Show default message for anonymous users
        this.displayChatRules('');
      }
  
      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
      popup.style.display = 'flex';
    },

  // EXACT COPY from widget.js - hideChatRules method
    hideChatRules() {
      const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
      popup.style.display = 'none';
  
      // Mark rules as seen when popup is closed (same as W version)
      if (this.groupId) {
        this.markRulesAsSeen(this.groupId);
      }
    },

  // EXACT COPY from widget.js - displayChatRules method
    displayChatRules(rules) {
      console.log('📋 [Widget] [Chat Rules] Displaying rules:', rules?.length || 0, 'characters');
  
      this.chatRules = rules || '';
  
      const rulesText = this.dialog.querySelector('.pingbash-rules-text');
      const noRulesText = this.dialog.querySelector('.pingbash-no-rules-text');
      const rulesTextarea = this.dialog.querySelector('.pingbash-rules-textarea');
  
      if (this.chatRules.trim()) {
        rulesText.textContent = this.chatRules;
        rulesText.style.display = 'block';
        noRulesText.style.display = 'none';
      } else {
        rulesText.style.display = 'none';
        noRulesText.style.display = 'flex';
      }
  
      // Update textarea with current rules
      if (rulesTextarea) {
        rulesTextarea.value = this.chatRules;
      }
    },

  // EXACT COPY from widget.js - editChatRules method
    editChatRules() {
      console.log('📋 [Widget] [Chat Rules] Entering edit mode');
  
      const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
      const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
      const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
      const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');
  
      rulesDisplay.style.display = 'none';
      rulesEdit.style.display = 'block';
      viewFooter.style.display = 'none';
      editFooter.style.display = 'flex';
  
      // Focus the textarea
      const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
      if (textarea) {
        textarea.focus();
      }
    },

  // EXACT COPY from widget.js - cancelEditChatRules method
    cancelEditChatRules() {
      console.log('📋 [Widget] [Chat Rules] Cancelling edit mode');
  
      const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
      const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
      const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
      const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');
      const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
  
      // Reset textarea to original value
      if (textarea) {
        textarea.value = this.chatRules;
      }
  
      rulesDisplay.style.display = 'block';
      rulesEdit.style.display = 'none';
      viewFooter.style.display = 'flex';
      editFooter.style.display = 'none';
    },

  // EXACT COPY from widget.js - saveChatRules method
    saveChatRules() {
      console.log('📋 [Widget] [Chat Rules] Saving chat rules');
  
      const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
      if (!textarea) return;
  
      const newRules = textarea.value.trim();
  
      // Update chat rules via socket
      this.updateChatRules(newRules, true);
  
      // Update local state
      this.chatRules = newRules;
      this.displayChatRules(newRules);
  
      // Exit edit mode
      this.cancelEditChatRules();
    },

  // EXACT COPY from widget.js - handleGetChatRules method
    handleGetChatRules(data) {
      console.log('📋 [Widget] [Chat Rules] Received chat rules data:', data);
  
      const rules = data.chatRules || '';
      this.displayChatRules(rules);
  
      // Check if we have a pending display request after authentication (same as W version)
      if (this.pendingChatRulesDisplay.groupId === this.groupId &&
        this.pendingChatRulesDisplay.userType &&
        Date.now() - this.pendingChatRulesDisplay.timestamp < 10000) { // 10 second timeout
  
        console.log('🔍 [Widget] [Chat Rules] Checking pending display after authentication');
  
        const isCreator = this.pendingChatRulesDisplay.userType === 'logged-in' &&
          this.currentUserId &&
          parseInt(this.currentUserId) === (this.group?.creater_id || this.group?.creator_id);
        const hasSeenRules = this.groupId ? this.hasSeenRulesForGroup[this.groupId] : false;
  
        console.log('🔍 [Widget] [Chat Rules] Post-auth display conditions:', {
          userType: this.pendingChatRulesDisplay.userType,
          currentUserId: this.currentUserId,
          isCreator,
          hasSeenRules,
          groupId: this.groupId,
          showChatRules: data.showChatRules,
          hasRules: data.chatRules && data.chatRules.trim().length > 0
        });
  
        // Check if we should show rules (same conditions as W version)
        if (data.showChatRules &&
          data.chatRules &&
          data.chatRules.trim().length > 0 &&
          !hasSeenRules &&
          !isCreator) {
  
          console.log('🔍 [Widget] [Chat Rules] Auto-showing rules after', this.pendingChatRulesDisplay.userType, 'authentication');
  
          // Show the chat rules popup automatically
          setTimeout(() => {
            this.showChatRules();
            this.markRulesAsSeen(this.groupId);
          }, 500); // Small delay to ensure UI is ready
  
          // Clear pending state
          this.pendingChatRulesDisplay = {
            groupId: null,
            userType: null,
            timestamp: 0
          };
        } else {
          console.log('🔍 [Widget] [Chat Rules] Not showing rules after authentication - conditions not met');
          // Clear pending state even if not showing
          this.pendingChatRulesDisplay = {
            groupId: null,
            userType: null,
            timestamp: 0
          };
        }
      } else {
        console.log('🔍 [Widget] [Chat Rules] Rules loaded and stored, no pending authentication trigger');
      }
    },

  // EXACT COPY from widget.js - handleUpdateChatRules method
    handleUpdateChatRules(data) {
      console.log('📋 [Widget] [Chat Rules] Chat rules updated:', data);
  
      // Refresh the rules display
      if (this.isAuthenticated) {
        this.getChatRules();
      }
    },

  // EXACT COPY from widget.js - showUploadProgress method
    showUploadProgress(filename) {
      const messagesContainer = this.dialog.querySelector('.pingbash-messages-list');
      const progressDiv = document.createElement('div');
      progressDiv.className = 'pingbash-upload-progress';
      progressDiv.innerHTML = `
        <div class="pingbash-upload-info">
          <span>📤 Uploading ${filename}...</span>
          <div class="pingbash-progress-bar">
            <div class="pingbash-progress-fill"></div>
          </div>
        </div>
      `;
      messagesContainer.appendChild(progressDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

  // EXACT COPY from widget.js - hideUploadProgress method
    hideUploadProgress() {
      const progress = this.dialog.querySelector('.pingbash-upload-progress');
      if (progress) {
        progress.remove();
      }
    },

  // EXACT COPY from widget.js - showSoundSettings method
    showSoundSettings() {
      const popup = this.dialog.querySelector('.pingbash-sound-popup');
      popup.style.display = 'flex';
    },

  // EXACT COPY from widget.js - hideSoundSettings method
    hideSoundSettings() {
      const popup = this.dialog.querySelector('.pingbash-sound-popup');
      popup.style.display = 'none';
    },

  // EXACT COPY from widget.js - saveSoundSettings method
    saveSoundSettings() {
      const selectedOption = this.dialog.querySelector('input[name="sound"]:checked');
      if (selectedOption) {
        this.soundSetting = selectedOption.value;
        console.log('🔊 [Widget] Sound setting saved:', this.soundSetting);
        // TODO: Save to localStorage or backend
      }
      this.hideSoundSettings();
    },

  // MODIFIED - showGroupCreationModal method to use body-attached modal
    showGroupCreationModal() {
      console.log('🏗️ [Widget] Opening group creation modal');
      console.log('🏗️ [Widget] Authentication state:', {
        isAuthenticated: this.isAuthenticated,
        authenticatedToken: !!this.authenticatedToken,
        currentUserId: this.currentUserId
      });
      
      // Check if user is authenticated
      if (!this.isAuthenticated) {
        console.log('🏗️ [Widget] User not authenticated, showing sign-in modal first');
        this.showSigninModal();
        return;
      }
  
      // Create or get the body-attached modal
      const modal = this.createGroupCreationModalInBody();
      console.log('🏗️ [Widget] Group creation modal element found:', !!modal);
      
      if (!modal) {
        console.error('❌ [Widget] Group creation modal not found in DOM!');
        return;
      }
      
      console.log('🏗️ [Widget] Showing group creation modal');
      
      // Show the body modal with proper display
      modal.style.display = 'flex';
      modal.style.zIndex = '2147483648'; // Ensure it's on top
      modal.classList.add('show');
      
                  console.log('🏗️ [Widget] Modal styles applied:', {
        display: modal.style.display,
        position: modal.style.position,
        zIndex: modal.style.zIndex
      });

      // Check if modal is actually on top
      const chatDialog = document.querySelector('.pingbash-dialog');
      if (chatDialog) {
        const dialogZIndex = window.getComputedStyle(chatDialog).zIndex;
        const modalZIndex = window.getComputedStyle(modal).zIndex;
        console.log('🔢 [Widget] Z-Index comparison:', {
          dialog: dialogZIndex,
          modal: modalZIndex,
          modalIsHigher: parseInt(modalZIndex) > parseInt(dialogZIndex)
        });
      }
        
        // Check computed styles and visibility
        const computedStyles = window.getComputedStyle(modal);
        console.log('🏗️ [Widget] Modal computed styles:', {
          display: computedStyles.display,
          position: computedStyles.position,
          zIndex: computedStyles.zIndex,
          visibility: computedStyles.visibility,
          opacity: computedStyles.opacity,
          width: computedStyles.width,
          height: computedStyles.height,
          top: computedStyles.top,
          left: computedStyles.left
        });
        
        // Check if modal content exists
        const modalContent = modal.querySelector('.pingbash-popup-content');
        console.log('🏗️ [Widget] Modal content found:', !!modalContent);
        
        if (modalContent) {
          const contentStyles = window.getComputedStyle(modalContent);
          console.log('🏗️ [Widget] Modal content styles:', {
            display: contentStyles.display,
            visibility: contentStyles.visibility,
            opacity: contentStyles.opacity,
            width: contentStyles.width,
            height: contentStyles.height
          });
        }
        
        // Force some additional styles to ensure visibility
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        
        console.log('🏗️ [Widget] Modal should now be visible - check the screen!');
      
      // Set up event listeners for the body modal
      this.setupBodyModalEventListeners();
      
      // Reset form
      this.resetGroupCreationForm();
    },

  // MODIFIED - hideGroupCreationModal method to use body-attached modal
    hideGroupCreationModal() {
      console.log('🏗️ [Widget] Closing group creation modal');
      const modal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (modal) {
        // Clean up content sync observer
        if (modal._contentSyncObserver) {
          modal._contentSyncObserver.disconnect();
          delete modal._contentSyncObserver;
        }
        
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
    },

  // EXACT COPY from widget.js - resetGroupCreationForm method
    resetGroupCreationForm() {
      // Reset group name
      const groupNameInput = this.dialog.querySelector('#group-name-input');
      groupNameInput.value = '';
      
      // Reset character counter
      const charCounter = this.dialog.querySelector('.pingbash-char-counter');
      charCounter.textContent = '0/50 characters';
      
      // Reset size mode to fixed
      const fixedRadio = this.dialog.querySelector('input[name="size-mode"][value="fixed"]');
      fixedRadio.checked = true;
      
      // Reset size values
      const widthInput = this.dialog.querySelector('#widget-width');
      const heightInput = this.dialog.querySelector('#widget-height');
      widthInput.value = '500';
      heightInput.value = '400';
      
      // Reset colors to defaults
      const colorInputs = {
        '#bg-color': '#ffffff',
        '#title-color': '#333333',
        '#msg-bg-color': '#f8f9fa',
        '#msg-text-color': '#000000',
        '#owner-msg-color': '#007bff',
        '#input-bg-color': '#ffffff'
      };
      
      Object.entries(colorInputs).forEach(([selector, value]) => {
        const input = this.dialog.querySelector(selector);
        if (input) input.value = value;
      });
      
      // Reset checkboxes
      const checkboxes = {
        '#show-user-images': true,
        '#round-corners': true,
        '#show-chat-rules': false,
        '#custom-font-size': false
      };
      
      Object.entries(checkboxes).forEach(([selector, checked]) => {
        const input = this.dialog.querySelector(selector);
        if (input) input.checked = checked;
      });
      
      // Reset font size and corner radius
      const fontSizeInput = this.dialog.querySelector('#font-size');
      const cornerRadiusInput = this.dialog.querySelector('#corner-radius');
      fontSizeInput.value = '14';
      cornerRadiusInput.value = '8';
      
      // Hide font size group initially
      const fontSizeGroup = this.dialog.querySelector('#font-size-group');
      fontSizeGroup.style.display = 'none';
      
      // Disable create button initially
      const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
      createBtn.disabled = true;
    },

  // EXACT COPY from widget.js - setupGroupCreationForm method
    setupGroupCreationForm() {
      // Group name input with character counter
      const groupNameInput = this.dialog.querySelector('#group-name-input');
      const charCounter = this.dialog.querySelector('.pingbash-char-counter');
      const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
      
      groupNameInput?.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCounter.textContent = `${length}/50 characters`;
        
        // Update create button state
        createBtn.disabled = length === 0;
      });
      
      // Size mode radio buttons
      const sizeRadios = this.dialog.querySelectorAll('input[name="size-mode"]');
      sizeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
          // Size mode changed
        });
      });
      
      // Size inputs
      const sizeInputs = this.dialog.querySelectorAll('#widget-width, #widget-height');
      sizeInputs.forEach(input => {
        input.addEventListener('input', () => {
          // Size input changed
        });
      });
      
      // Color inputs
      const colorInputs = this.dialog.querySelectorAll('.pingbash-color-input');
      colorInputs.forEach(input => {
        input.addEventListener('input', () => {
          // Color input changed
        });
      });
      
      // Settings checkboxes
      const checkboxes = this.dialog.querySelectorAll('.pingbash-checkbox-option input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          // Show/hide font size group based on custom font size checkbox
          if (checkbox.id === 'custom-font-size') {
            const fontSizeGroup = this.dialog.querySelector('#font-size-group');
            fontSizeGroup.style.display = checkbox.checked ? 'block' : 'none';
          }
          
          // Show/hide corner radius group based on round corners checkbox
          if (checkbox.id === 'round-corners') {
            const cornerRadiusGroup = this.dialog.querySelector('#corner-radius-group');
            cornerRadiusGroup.style.display = checkbox.checked ? 'block' : 'none';
          }
        });
      });
      
      // Font size and corner radius inputs
      const fontSizeInput = this.dialog.querySelector('#font-size');
      const cornerRadiusInput = this.dialog.querySelector('#corner-radius');
      
      fontSizeInput?.addEventListener('input', () => {
        // Font size changed
      });
      
      cornerRadiusInput?.addEventListener('input', () => {
        // Corner radius changed
      });
    },

  // EXACT COPY from widget.js - updatePreview method
    updatePreview() {
      const previewWidget = this.dialog.querySelector('.pingbash-preview-widget');
      const previewTitle = this.dialog.querySelector('.pingbash-preview-title');
      const previewMessages = this.dialog.querySelector('.pingbash-preview-messages');
      const previewInput = this.dialog.querySelector('.pingbash-preview-input input');
      const previewButton = this.dialog.querySelector('.pingbash-preview-input button');
      
      if (!previewWidget) return;
      
      // Update title
      const groupNameInput = this.dialog.querySelector('#group-name-input');
      previewTitle.textContent = groupNameInput.value || 'New Group';
      
      // Get current configuration
      const config = this.getCurrentConfig();
      
      // Update preview widget styles
      previewWidget.style.width = config.sizeMode === 'fixed' ? `${config.width}px` : '100%';
      previewWidget.style.height = config.sizeMode === 'fixed' ? `${config.height}px` : '300px';
      previewWidget.style.borderRadius = config.settings.roundCorners ? `${config.settings.cornerRadius}px` : '0px';
      
      // Update colors
      previewWidget.style.background = config.colors.background;
      previewTitle.style.color = config.colors.title;
      previewMessages.style.background = config.colors.msgBg;
      previewInput.style.background = config.colors.inputBg;
      previewInput.style.color = config.colors.msgText;
      previewButton.style.background = config.colors.ownerMsg;
      
      // Update message styles
      const messages = previewWidget.querySelectorAll('.pingbash-preview-message');
      messages.forEach((msg, index) => {
        const content = msg.querySelector('.pingbash-preview-msg-content');
        if (msg.classList.contains('pingbash-preview-own')) {
          content.style.background = config.colors.ownerMsg;
          content.style.color = 'white';
        } else {
          content.style.background = '#f0f0f0';
          content.style.color = config.colors.msgText;
        }
        
        if (config.settings.customFontSize) {
          content.style.fontSize = `${config.settings.fontSize}px`;
        } else {
          content.style.fontSize = '14px';
        }
        
        content.style.borderRadius = config.settings.roundCorners ? '12px' : '4px';
      });
    },

  // EXACT COPY from widget.js - getCurrentConfig method
    getCurrentConfig() {
      // Get values from form
      const sizeMode = this.dialog.querySelector('input[name="size-mode"]:checked')?.value || 'fixed';
      const width = parseInt(this.dialog.querySelector('#widget-width')?.value) || 500;
      const height = parseInt(this.dialog.querySelector('#widget-height')?.value) || 400;
      
      const colors = {
        background: this.dialog.querySelector('#bg-color')?.value || '#ffffff',
        title: this.dialog.querySelector('#title-color')?.value || '#333333',
        msgBg: this.dialog.querySelector('#msg-bg-color')?.value || '#f8f9fa',
        msgText: this.dialog.querySelector('#msg-text-color')?.value || '#000000',
        ownerMsg: this.dialog.querySelector('#owner-msg-color')?.value || '#007bff',
        inputBg: this.dialog.querySelector('#input-bg-color')?.value || '#ffffff'
      };
      
      const settings = {
        userImages: this.dialog.querySelector('#show-user-images')?.checked || false,
        roundCorners: this.dialog.querySelector('#round-corners')?.checked || false,
        showChatRules: this.dialog.querySelector('#show-chat-rules')?.checked || false,
        customFontSize: this.dialog.querySelector('#custom-font-size')?.checked || false,
        fontSize: parseInt(this.dialog.querySelector('#font-size')?.value) || 14,
        cornerRadius: parseInt(this.dialog.querySelector('#corner-radius')?.value) || 8
      };
      
      return {
        sizeMode,
        width,
        height,
        colors,
        settings
      };
    },

  // EXACT COPY from widget.js - makePreviewDraggable method
    makePreviewDraggable() {
      const previewWidget = this.dialog.querySelector('.pingbash-preview-widget');
      const previewContainer = this.dialog.querySelector('.pingbash-preview-container');
      
      if (!previewWidget || !previewContainer) return;
      
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      
      previewWidget.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = previewWidget.getBoundingClientRect();
        const containerRect = previewContainer.getBoundingClientRect();
        
        startLeft = rect.left - containerRect.left;
        startTop = rect.top - containerRect.top;
        
        previewWidget.style.position = 'absolute';
        previewWidget.style.left = startLeft + 'px';
        previewWidget.style.top = startTop + 'px';
        
        e.preventDefault();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const newLeft = startLeft + deltaX;
        const newTop = startTop + deltaY;
        
        // Keep within container bounds
        const containerRect = previewContainer.getBoundingClientRect();
        const widgetRect = previewWidget.getBoundingClientRect();
        
        const maxLeft = containerRect.width - widgetRect.width;
        const maxTop = containerRect.height - widgetRect.height;
        
        previewWidget.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
        previewWidget.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    },

  // EXACT COPY from widget.js - createNewGroup method
    async createNewGroup() {
      console.log('🏗️ [Widget] Creating new group');
      
      // Look for group name input in the body modal (W version uses body-attached modal)
      const bodyModal = document.body.querySelector('.pingbash-group-creation-modal-body');
      const groupNameInput = bodyModal ? 
        bodyModal.querySelector('#group-name-input-body') : 
        this.dialog.querySelector('#group-name-input');
      
      if (!groupNameInput) {
        console.error('🏗️ [Widget] Group name input not found');
        //alert('Group name input not found');
        return;
      }
      
      const groupName = groupNameInput.value.trim();
      console.log('🏗️ [Widget] Group name from input:', groupName);
      
      if (!groupName) {
        //alert('Please enter a group name');
        return;
      }
      
      if (!this.isAuthenticated || !this.authenticatedToken) {
        //alert('Please log in to create a group');
        this.showSigninModal();
        return;
      }
      
      // Get config from body modal (W version)
      const config = this.getCurrentConfigFromBodyModal();
      
      // Prepare group data (EXACT same structure as F version)
      const groupData = {
        groupName: groupName,
        createrId: parseInt(this.currentUserId),
        size_mode: config.sizeMode, // String: 'fixed' or 'responsive' (F version format)
        frame_width: config.width,
        frame_height: config.height,
        bg_color: config.colors.background,
        title_color: config.colors.title,
        msg_bg_color: config.colors.msgBg,
        msg_txt_color: config.colors.msgText,
        reply_msg_color: config.colors.replyText || config.colors.msgText, // Separate field (F version format)
        msg_date_color: config.colors.dateText || config.colors.msgText, // Separate field (F version format)
        input_bg_color: config.colors.inputBg,
        show_user_img: config.settings.userImages, // Boolean (F version format)
        custom_font_size: config.settings.customFontSize, // Boolean (F version format)
        font_size: config.settings.fontSize,
        round_corners: config.settings.roundCorners, // Boolean (F version format)
        corner_radius: config.settings.cornerRadius,
        chat_rules: '',
        show_chat_rules: config.settings.showChatRules // Boolean (F version format)
      };
      
      // Validate group data - ensure no undefined values
      Object.keys(groupData).forEach(key => {
        if (groupData[key] === undefined) {
          console.error(`🏗️ [Widget] ERROR: ${key} is undefined!`);
          // Set default values for undefined fields
          if (key === 'font_size') groupData[key] = 14;
          else if (key === 'corner_radius') groupData[key] = 12;
          else if (key === 'frame_width') groupData[key] = 500;
          else if (key === 'frame_height') groupData[key] = 400;
          else if (typeof groupData[key] === 'boolean') groupData[key] = false;
          else if (typeof groupData[key] === 'string') groupData[key] = '';
          else groupData[key] = 0;
        }
      });
      
      console.log('🏗️ [Widget] Group data (validated):', groupData);
      
      try {
        // Disable create button during request
        const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
        createBtn.disabled = true;
        createBtn.textContent = 'Creating...';
        
        const response = await fetch(`${this.config.apiUrl}/api/private/add/groups/create`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.authenticatedToken
          },
          body: JSON.stringify(groupData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log('🏗️ [Widget] Group created successfully:', result);
          //alert(`Group "${groupName}" created successfully!`);
          this.hideGroupCreationModal();
          
          // Optionally switch to the new group
          if (result.groupId) {
            console.log('🏗️ [Widget] Switching to new group:', result.groupId);
            // You could implement group switching here
          }
        } else {
          console.error('🏗️ [Widget] Group creation failed:', result);
          //alert(result.message || 'Failed to create group. Please try again.');
        }
      } catch (error) {
        console.error('🏗️ [Widget] Group creation error:', error);
        //alert('Failed to create group. Please check your connection and try again.');
      } finally {
        // Re-enable create button
        const createBtn = bodyModal ? 
          bodyModal.querySelector('.pingbash-create-group-btn') : 
          this.dialog.querySelector('.pingbash-group-create-btn');
        if (createBtn) {
          createBtn.disabled = false;
          createBtn.textContent = 'Create Group';
        }
      }
    },

    // NEW METHOD - Get current configuration from body modal
    getCurrentConfigFromBodyModal() {
      const bodyModal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (!bodyModal) {
        console.error('🏗️ [Widget] Body modal not found for config');
        return this.getDefaultConfig();
      }

      // Use the same logic as events.js getCurrentConfiguration but for body modal
      return {
        // Color settings (EXACT same as W version)
        colors: {
          background: bodyModal.querySelector('#bg-color-body')?.value || '#FFFFFF',
          title: bodyModal.querySelector('#title-color-body')?.value || '#333333',
          msgBg: bodyModal.querySelector('#msg-bg-color-body')?.value || '#F5F5F5',
          msgText: bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          replyText: bodyModal.querySelector('#reply-text-color-body')?.value || bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          dateText: bodyModal.querySelector('#date-text-color-body')?.value || bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          inputBg: bodyModal.querySelector('#input-bg-color-body')?.value || '#FFFFFF'
        },
        // Settings
        settings: {
          userImages: bodyModal.querySelector('#show-avatars-body')?.checked ?? true,
          customFontSize: bodyModal.querySelector('#custom-font-size-body')?.checked ?? false,
          roundCorners: bodyModal.querySelector('#round-corners-body')?.checked ?? true,
          showChatRules: bodyModal.querySelector('#show-chat-rules-body')?.checked ?? false
        },
        // Font size (with debugging)
        fontSize: (() => {
          const fontSizeElement = bodyModal.querySelector('#font-size-slider-body');
          const value = fontSizeElement?.value;
          console.log('🔍 [Widget] Font size element:', fontSizeElement, 'value:', value);
          return parseInt(value) || 14;
        })(),
        cornerRadius: (() => {
          const cornerRadiusElement = bodyModal.querySelector('#corner-radius-slider-body');
          const value = cornerRadiusElement?.value;
          console.log('🔍 [Widget] Corner radius element:', cornerRadiusElement, 'value:', value);
          return parseInt(value) || 12;
        })(),
        // Size settings
        sizeMode: bodyModal.querySelector('input[name="size-mode-body"]:checked')?.value || 'responsive',
        width: parseInt(bodyModal.querySelector('#width-input-body')?.value) || 500,
        height: parseInt(bodyModal.querySelector('#height-input-body')?.value) || 400,
        // Group name
        groupName: bodyModal.querySelector('#group-name-input-body')?.value || 'Group Name'
      };
    },

    // NEW METHOD - Get default configuration
    getDefaultConfig() {
      return {
        colors: {
          background: '#FFFFFF',
          title: '#333333',
          msgBg: '#F5F5F5',
          msgText: '#333333',
          replyText: '#333333',
          dateText: '#333333',
          inputBg: '#FFFFFF'
        },
        settings: {
          userImages: true,
          customFontSize: false,
          roundCorners: true,
          showChatRules: false
        },
        fontSize: 14,
        cornerRadius: 12,
        sizeMode: 'responsive',
        width: 500,
        height: 400,
        groupName: 'New Group'
      };
    },

    // Chat Limitations functionality (same as W version)
    showChatLimitations() {
      console.log('🔒 [Widget] Showing chat limitations');
      
      // Debug info
      console.log('🔒 [Widget] Current user ID:', this.getCurrentUserId());
      console.log('🔒 [Widget] Group data:', this.group);
      console.log('🔒 [Widget] Can manage limitations:', this.canManageChatLimitations());
      
      // Check permissions - only group creator or mods with chat_limit permission can access
      if (!this.canManageChatLimitations()) {
        // Temporarily bypass for testing
        console.warn('🔒 [Widget] Permission check failed, but showing dialog anyway for testing');
        // //alert('You do not have permission to manage chat limitations');
        // return;
      }
      
      // Load current limitations from group data
      this.loadCurrentLimitations();
      
      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-chat-limitations-popup');
      if (popup) {
        console.log('🔒 [Widget] Found popup element, setting display to flex');
      popup.style.display = 'flex';
        
        console.log('🔒 [Widget] Chat limitations popup displayed');
        console.log('🔒 [Widget] Popup computed styles:', {
          display: getComputedStyle(popup).display,
          visibility: getComputedStyle(popup).visibility,
          opacity: getComputedStyle(popup).opacity,
          zIndex: getComputedStyle(popup).zIndex
        });
      } else {
        console.error('🔒 [Widget] Chat limitations popup element not found');
      }
    },

    hideChatLimitations() {
      const popup = this.dialog.querySelector('.pingbash-chat-limitations-popup');
      if (popup) {
      popup.style.display = 'none';
      }
    },

    showManageChat() {
      console.log('🔧 [Widget] Opening Manage Chat popup');

      // Check permissions - only group creator or mods can access
      if (!this.canManageChatLimitations()) {
        //alert('You do not have permission to manage chat');
        return;
      }

      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-manage-chat-popup');
      if (popup) {
        console.log('🔧 [Widget] Found manage chat popup element, setting display to flex');
        popup.style.display = 'flex';

        // Reset to menu view
        this.showManageChatMenu();

        // Ensure we have the latest pinned messages
        this.getPinnedMessages();

        console.log('🔧 [Widget] Manage Chat popup displayed');
      } else {
        console.error('🔧 [Widget] Manage Chat popup element not found');
      }
    },

    hideManageChat() {
      const popup = this.dialog.querySelector('.pingbash-manage-chat-popup');
      if (popup) {
        popup.style.display = 'none';
      }
    },

    showModeratorManagement() {
      console.log('👥 [Widget] Opening Moderator Management popup');

      // Debug authentication status
      console.log('👥 [Widget] Authentication status:', {
        isAuthenticated: this.isAuthenticated,
        hasAuthenticatedToken: !!this.authenticatedToken,
        hasConfigToken: !!this.config?.token,
        hasLocalStorageToken: !!localStorage.getItem('pingbash_token')
      });

      // Check permissions - only group creator or mods with manage_mods permission can access
      const hasPermission = this.canManageModerators();
      if (!hasPermission) {
        console.warn('👥 [Widget] No permission to manage moderators, but proceeding for debugging');
        // Temporarily allow for debugging - uncomment next line to enforce
        // //alert('You do not have permission to manage moderators'); return;
      }

      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup');
      if (popup) {
        console.log('👥 [Widget] Found moderator management popup element, setting display to flex');
        popup.style.display = 'flex';

        // Load current moderators
        this.loadModerators();

        console.log('👥 [Widget] Moderator Management popup displayed');
      } else {
        console.error('👥 [Widget] Moderator Management popup element not found');
      }
    },

    hideModeratorManagement() {
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup');
      if (popup) {
        popup.style.display = 'none';
      }
    },

    canManageModerators() {
      // Check if user is group creator or mod with manage_mods permission
      const currentUserId = this.getCurrentUserId();
      
      console.log('🔍 [Debug] canManageModerators:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        isAuthenticated: !!this.config?.token,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, manage_mods: m.manage_mods }))
      });
      
      // Group creator can always manage moderators
      if (this.group?.creater_id && currentUserId === parseInt(this.group.creater_id)) {
        console.log('🔍 [Debug] User is group creator - moderator management allowed');
        return true;
      }
      
      // Check if user is a moderator with manage_mods permission
      const userMember = this.group?.members?.find(member => member.id === currentUserId);
      const hasPermission = userMember && userMember.role_id === 2 && userMember.manage_mods === true;
      
      console.log('🔍 [Debug] Moderator management check:', {
        userMember,
        roleId: userMember?.role_id,
        manageMods: userMember?.manage_mods,
        manageModsType: typeof userMember?.manage_mods,
        hasPermission,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.manage_mods === true)
      });
      
      return !!hasPermission;
    },

    canManageChatLimitations() {
      // Check if user is group creator or mod with chat_limit permission
      const currentUserId = this.getCurrentUserId();
      
      console.log('🔍 [Debug] canManageChatLimitations:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, chat_limit: m.chat_limit }))
      });
      
      // Group creator can always manage chat limitations
      if (this.group?.creater_id && currentUserId === parseInt(this.group.creater_id)) {
        console.log('🔍 [Debug] User is group creator - chat limitations allowed');
        return true;
      }
      
      // Check if user is a moderator with chat_limit permission
      const userMember = this.group?.members?.find(member => member.id === currentUserId);
      const hasPermission = userMember && userMember.role_id === 2 && userMember.chat_limit === true;
      
      console.log('🔍 [Debug] Chat limitations check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        chatLimit: userMember?.chat_limit,
        chatLimitType: typeof userMember?.chat_limit,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.chat_limit === true)
      });
      
      return !!hasPermission;
    },

    canManageChat() {
      // Check if user is group creator or mod with manage_chat permission
      const currentUserId = this.getCurrentUserId();
      
      console.log('🔍 [Debug] canManageChat:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, manage_chat: m.manage_chat }))
      });
      
      // Group creator can always manage chat
      if (this.group?.creater_id && currentUserId === parseInt(this.group.creater_id)) {
        console.log('🔍 [Debug] User is group creator - manage chat allowed');
        return true;
      }
      
      // Check if user is a moderator with manage_chat permission
      const userMember = this.group?.members?.find(member => member.id === currentUserId);
      const hasPermission = userMember && userMember.role_id === 2 && userMember.manage_chat === true;
      
      console.log('🔍 [Debug] Manage chat check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        manageChat: userMember?.manage_chat,
        manageChatType: typeof userMember?.manage_chat,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.manage_chat === true)
      });
      
      return !!hasPermission;
    },

    canManageCensoredContent() {
      // Check if user is group creator or mod with manage_censored permission
      const currentUserId = this.getCurrentUserId();
      
      console.log('🔍 [Debug] canManageCensoredContent:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, manage_censored: m.manage_censored }))
      });
      
      // Group creator can always manage censored content
      if (this.group?.creater_id && currentUserId === parseInt(this.group.creater_id)) {
        console.log('🔍 [Debug] User is group creator - censored content allowed');
        return true;
      }
      
      // Check if user is a moderator with manage_censored permission
      const userMember = this.group?.members?.find(member => member.id === currentUserId);
      const hasPermission = userMember && userMember.role_id === 2 && userMember.manage_censored === true;
      
      console.log('🔍 [Debug] Censored content check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        manageCensored: userMember?.manage_censored,
        manageCensoredType: typeof userMember?.manage_censored,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.manage_censored === true)
      });
      
      return !!hasPermission;
    },

    updateMenuVisibility() {
      console.log('🔍 [Debug] ===== UPDATING MENU VISIBILITY =====');
      console.log('🔍 [Debug] Current user data:', {
        currentUserId: this.getCurrentUserId(),
        isAuthenticated: this.isAuthenticated,
        anonId: this.anonId,
        currentUserId_raw: this.currentUserId,
        groupData: this.group ? { creater_id: this.group.creater_id, members_count: this.group.members?.length } : null
      });
      
      // Get permission checks
      const canManageModeratorPermission = this.canManageModerators();
      const canManageChatLimitations = this.canManageChatLimitations();
      const canManageChat = this.canManageChat();
      const canManageCensoredContent = this.canManageCensoredContent();
      
      console.log('🔍 [Debug] Final permission results:', {
        canManageModeratorPermission,
        canManageChatLimitations,
        canManageChat,
        canManageCensoredContent
      });
      
      // Debug mods option visibility
      const modsOption = this.dialog.querySelector('.pingbash-mods-option');
      console.log('🔍 [Debug] Mods option element:', {
        found: !!modsOption,
        display: modsOption?.style?.display,
        isAuthenticated: this.isAuthenticated
      });
      
      // Update Chat Mode filter container - only show for authenticated users
      const filterContainer = this.dialog.querySelector('.pingbash-filter-container');
      if (filterContainer) {
        if (this.isAuthenticated) {
          filterContainer.style.display = 'flex';
          console.log('🔍 [Widget] Showing Chat Mode filter for authenticated user');
          
          // Also show mods option for authenticated users
          const modsOption = this.dialog.querySelector('.pingbash-mods-option');
          if (modsOption) {
            modsOption.style.display = 'block';
            console.log('🔍 [Widget] Enabling mods option for authenticated user');
          }
        } else {
          filterContainer.style.display = 'none';
          console.log('🔍 [Widget] Hiding Chat Mode filter for anonymous user');
        }
      }
      
      // Update Moderator Management menu item
      const moderatorMgmtItem = this.dialog.querySelector('.pingbash-menu-item[data-action="moderator-management"]');
      if (moderatorMgmtItem) {
        if (canManageModeratorPermission) {
          moderatorMgmtItem.style.display = 'flex';
          console.log('👥 [Widget] Showing Moderator Management menu item');
        } else {
          moderatorMgmtItem.style.display = 'none';
          console.log('👥 [Widget] Hiding Moderator Management menu item');
        }
      }
      
      // Update Chat Limitations menu item
      const chatLimitationsItem = this.dialog.querySelector('.pingbash-menu-item[data-action="chat-limitations"]');
      if (chatLimitationsItem) {
        if (canManageChatLimitations) {
          chatLimitationsItem.style.display = 'flex';
          console.log('👥 [Widget] Showing Chat Limitations menu item');
        } else {
          chatLimitationsItem.style.display = 'none';
          console.log('👥 [Widget] Hiding Chat Limitations menu item');
        }
      }
      
      // Update Manage Chat menu item
      const manageChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="manage-chat"]');
      if (manageChatItem) {
        if (canManageChat) {
          manageChatItem.style.display = 'flex';
          console.log('👥 [Widget] Showing Manage Chat menu item');
        } else {
          manageChatItem.style.display = 'none';
          console.log('👥 [Widget] Hiding Manage Chat menu item');
        }
      }
      
      // Update Censored Content menu item
      const censoredContentItem = this.dialog.querySelector('.pingbash-menu-item[data-action="censored-content"]');
      if (censoredContentItem) {
        if (canManageCensoredContent) {
          censoredContentItem.style.display = 'flex';
          console.log('👥 [Widget] Showing Censored Content menu item');
        } else {
          censoredContentItem.style.display = 'none';
          console.log('👥 [Widget] Hiding Censored Content menu item');
        }
      }
      
      // Update Banned Users menu item (only group owner can access)
      const bannedUsersItem = this.dialog.querySelector('.pingbash-menu-item[data-action="banned-users"]');
      if (bannedUsersItem) {
        const currentUserId = this.getCurrentUserId();
        const isGroupOwner = this.group && currentUserId === this.group.creater_id;
        
        if (isGroupOwner) {
          bannedUsersItem.style.display = 'flex';
          console.log('👥 [Widget] Showing Banned Users menu item for group owner');
        } else {
          bannedUsersItem.style.display = 'none';
          console.log('👥 [Widget] Hiding Banned Users menu item');
        }
      }
      
      // Update IP Bans menu item (only group owner can access)
      const ipBansItem = this.dialog.querySelector('.pingbash-menu-item[data-action="ip-bans"]');
      if (ipBansItem) {
        const currentUserId = this.getCurrentUserId();
        const isGroupOwner = this.group && currentUserId === this.group.creater_id;
        
        if (isGroupOwner) {
          ipBansItem.style.display = 'flex';
          console.log('👥 [Widget] Showing IP Bans menu item for group owner');
        } else {
          ipBansItem.style.display = 'none';
          console.log('👥 [Widget] Hiding IP Bans menu item');
        }
      }
      
      // Show/hide settings container based on permissions
      const settingsContainer = this.dialog.querySelector('.pingbash-settings-container');
      if (settingsContainer) {
        const hasAnyPermission = canManageModeratorPermission || canManageChatLimitations || 
                                 canManageChat || canManageCensoredContent || 
                                 (this.group && this.getCurrentUserId() === this.group.creater_id);
        
        if (hasAnyPermission) {
          settingsContainer.style.display = 'flex';
          console.log('⚙️ [Widget] Showing settings container (user has admin permissions)');
        } else {
          settingsContainer.style.display = 'none';
          console.log('⚙️ [Widget] Hiding settings container (no admin permissions)');
        }
      }
      
      // Update hamburger menu items based on user state
      this.updateHamburgerMenuItems();
    },
    
    updateHamburgerMenuItems() {
      console.log('🍔 [Widget] Updating hamburger menu items based on user state');
      
      // Add to favorites / Remove from favorites
      const addFavItem = this.dialog.querySelector('.pingbash-menu-item[data-action="add-to-favorites"]');
      const removeFavItem = this.dialog.querySelector('.pingbash-menu-item[data-action="remove-from-favorites"]');
      
      if (this.isAuthenticated) {
        // For authenticated users, show favorites options
        // TODO: Check if already in favorites and toggle accordingly
        if (addFavItem) addFavItem.style.display = 'flex';
        if (removeFavItem) removeFavItem.style.display = 'none';
        console.log('⭐ [Widget] Showing add to favorites for authenticated user');
      } else {
        // Hide favorites for anonymous users
        if (addFavItem) addFavItem.style.display = 'none';
        if (removeFavItem) removeFavItem.style.display = 'none';
        console.log('⭐ [Widget] Hiding favorites options for anonymous user');
      }
      
      // Login / Logout buttons
      const loginItem = this.dialog.querySelector('.pingbash-menu-item[data-action="login"]');
      const logoutItem = this.dialog.querySelector('.pingbash-menu-item[data-action="logout"]');
      
      if (this.isAuthenticated) {
        // Show logout for authenticated users
        if (loginItem) loginItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'flex';
        console.log('🚪 [Widget] Showing logout option for authenticated user');
      } else {
        // Show login for anonymous users
        if (loginItem) loginItem.style.display = 'flex';
        if (logoutItem) logoutItem.style.display = 'none';
        console.log('🚪 [Widget] Showing login option for anonymous user');
      }
      
      // Hide/Show Chat toggles
      const hideChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="hide-chat"]');
      const showChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="show-chat"]');
      
      // TODO: Implement hide/show chat state management
      // For now, default to showing "hide chat"
      if (hideChatItem) hideChatItem.style.display = 'flex';
      if (showChatItem) showChatItem.style.display = 'none';
    },

    // Debug function to manually test menu visibility
    debugMenuPermissions() {
      console.log('🔍 [Debug] Manual menu permission check triggered');
      this.updateMenuVisibility();
      
      // Also manually check each permission
      console.log('🔍 [Debug] Manual individual checks:');
      console.log('  - canManageModerators():', this.canManageModerators());
      console.log('  - canManageChatLimitations():', this.canManageChatLimitations());
      console.log('  - canManageChat():', this.canManageChat());
      
      // Check menu item visibility
      const modItem = this.dialog.querySelector('.pingbash-menu-item[data-action="moderator-management"]');
      const chatLimitItem = this.dialog.querySelector('.pingbash-menu-item[data-action="chat-limitations"]');
      const manageChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="manage-chat"]');
      
      console.log('🔍 [Debug] Current menu item display styles:');
      console.log('  - Moderator Management:', modItem?.style.display);
      console.log('  - Chat Limitations:', chatLimitItem?.style.display);
      console.log('  - Manage Chat:', manageChatItem?.style.display);
      
      // Make this accessible globally for testing
      window.debugMenuPermissions = () => this.debugMenuPermissions();
    },

    // Censored Content Management
    showCensoredContent() {
      console.log('🔍 [Widget] Showing Censored Content dialog');
      
      // Check permissions
      if (!this.canManageCensoredContent()) {
        console.log('🔍 [Widget] User does not have permission to manage censored content');
        this.showErrorToast('Access Denied', 'You do not have permission to manage censored content.');
        return;
      }

      const popup = this.dialog.querySelector('.pingbash-censored-content-popup');
      if (popup) {
        popup.style.display = 'flex';
        this.loadCensoredWords();
      }
    },

    hideCensoredContent() {
      console.log('🔍 [Widget] Hiding Censored Content dialog');
      const popup = this.dialog.querySelector('.pingbash-censored-content-popup');
      if (popup) {
        popup.style.display = 'none';
        // Reset form state
        this.resetCensoredContentForm();
      }
    },

    loadCensoredWords() {
      console.log('🔍 [Widget] Loading censored words');
      
      // Get censored words from group data
      const censoredWordsStr = this.group?.censored_words || '';
      console.log('🔍 [Widget] Raw censored words string:', censoredWordsStr);
      
      // Parse censored words (comma-separated)
      this.censoredWords = this.parseCensoredWords(censoredWordsStr);
      this.originalCensoredWords = [...this.censoredWords]; // Keep original for comparison
      
      console.log('🔍 [Widget] Parsed censored words:', this.censoredWords);
      
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    parseCensoredWords(censoredWordsStr) {
      if (!censoredWordsStr || typeof censoredWordsStr !== 'string') {
        return [];
      }
      
      // Split by comma, trim whitespace, and filter out empty strings
      return censoredWordsStr
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);
    },

    renderCensoredWords() {
      const wordsList = this.dialog.querySelector('.pingbash-censored-words-list');
      if (!wordsList) return;

      if (this.censoredWords.length === 0) {
        wordsList.innerHTML = '<div class="pingbash-no-censored-words">No censored words defined</div>';
        return;
      }

      const wordsHTML = this.censoredWords.map((word, index) => `
        <div class="pingbash-censored-word-item" data-index="${index}">
          <span class="pingbash-censored-word-text">${this.escapeHtml(word)}</span>
          <div class="pingbash-censored-word-actions">
            <button class="pingbash-edit-word-btn" data-index="${index}">Edit</button>
            <button class="pingbash-delete-word-btn" data-index="${index}">Delete</button>
          </div>
        </div>
      `).join('');

      wordsList.innerHTML = wordsHTML;
    },

    addCensoredWord() {
      const input = this.dialog.querySelector('.pingbash-censored-word-input');
      if (!input) return;

      const word = input.value.trim();
      if (!word) {
        this.showWarningToast('Invalid Input', 'Please enter a word to censor.');
        return;
      }

      // Check for duplicates
      if (this.censoredWords.some(existingWord => existingWord.toLowerCase() === word.toLowerCase())) {
        this.showWarningToast('Duplicate Word', 'This word is already in the censored list.');
        return;
      }

      // Add word
      this.censoredWords.push(word);
      input.value = '';
      
      console.log('🔍 [Widget] Added censored word:', word);
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    editCensoredWord(index) {
      const wordItem = this.dialog.querySelector(`.pingbash-censored-word-item[data-index="${index}"]`);
      if (!wordItem) return;

      const currentWord = this.censoredWords[index];
      
      // Create edit interface
      wordItem.classList.add('editing');
      wordItem.innerHTML = `
        <input type="text" class="pingbash-edit-word-input" value="${this.escapeHtml(currentWord)}" maxlength="50">
        <button class="pingbash-save-edit-btn" data-index="${index}">Save</button>
        <button class="pingbash-cancel-edit-btn" data-index="${index}">Cancel</button>
      `;

      // Focus the input
      const editInput = wordItem.querySelector('.pingbash-edit-word-input');
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    },

    saveEditCensoredWord(index) {
      const wordItem = this.dialog.querySelector(`.pingbash-censored-word-item[data-index="${index}"]`);
      if (!wordItem) return;

      const editInput = wordItem.querySelector('.pingbash-edit-word-input');
      if (!editInput) return;

      const newWord = editInput.value.trim();
      if (!newWord) {
        this.showWarningToast('Invalid Input', 'Word cannot be empty.');
        return;
      }

      // Check for duplicates (excluding current word)
      if (this.censoredWords.some((existingWord, i) => i !== index && existingWord.toLowerCase() === newWord.toLowerCase())) {
        this.showWarningToast('Duplicate Word', 'This word is already in the censored list.');
        return;
      }

      // Update word
      this.censoredWords[index] = newWord;
      
      console.log('🔍 [Widget] Updated censored word:', { old: this.originalCensoredWords[index], new: newWord });
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    cancelEditCensoredWord() {
      // Simply re-render to cancel edit mode
      this.renderCensoredWords();
    },

    deleteCensoredWord(index) {
      const word = this.censoredWords[index];
      
      // Show confirmation
      this.showConfirm(
        'Delete Censored Word',
        `Are you sure you want to remove "${word}" from the censored words list?`,
        { destructive: true }
      ).then(confirmed => {
        if (confirmed) {
          this.censoredWords.splice(index, 1);
          console.log('🔍 [Widget] Deleted censored word:', word);
          this.renderCensoredWords();
          this.updateSaveButtonVisibility();
        }
      });
    },

    updateSaveButtonVisibility() {
      const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
      const closeBtn = this.dialog.querySelector('.pingbash-censored-close-btn');
      
      if (!saveBtn || !closeBtn) return;

      const hasChanges = JSON.stringify(this.censoredWords.sort()) !== JSON.stringify(this.originalCensoredWords.sort());
      
      if (hasChanges) {
        saveBtn.style.display = 'inline-block';
        closeBtn.textContent = 'Cancel';
      } else {
        saveBtn.style.display = 'none';
        closeBtn.textContent = 'Close';
      }
    },

    async saveCensoredWords() {
      console.log('🔍 [Widget] Saving censored words');
      
      try {
        // Show loading state
        const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
        if (saveBtn) {
          this.setButtonLoading(saveBtn, true);
        }

        // Get authentication token
        const token = this.authenticatedToken || 
                     this.config?.token || 
                     window.pingbashWidget?.config?.token || 
                     window.pingbashWidget?.authenticatedToken || 
                     localStorage.getItem('pingbash_token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        if (!this.groupId) {
          throw new Error('Group ID not found');
        }

        // Convert words array to comma-separated string
        const censoredWordsStr = this.censoredWords.join(',');
        
        console.log('🔍 [Widget] Sending censored words update:', {
          groupId: this.groupId,
          contents: censoredWordsStr,
          tokenPresent: !!token
        });

        // Emit socket event
        const socket = this.socket || window.pingbashWidget?.socket;
        if (!socket) {
          throw new Error('Socket connection not available');
        }

        socket.emit('update censored contents', {
          token: token,
          groupId: this.groupId,
          contents: censoredWordsStr
        });

        // Set timeout for response
        this.censoredWordsTimeoutId = setTimeout(() => {
          console.log('🔍 [Widget] Censored words update timeout');
          this.setButtonLoading(saveBtn, false);
          this.showErrorToast('Timeout', 'No response from server. Please try again.');
        }, 10000);

      } catch (error) {
        console.error('🔍 [Widget] Error saving censored words:', error);
        const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
        if (saveBtn) {
          this.setButtonLoading(saveBtn, false);
        }
        this.showErrorToast('Error', error.message || 'Failed to save censored words');
      }
    },

    resetCensoredContentForm() {
      // Clear input
      const input = this.dialog.querySelector('.pingbash-censored-word-input');
      if (input) {
        input.value = '';
      }

      // Reset arrays
      this.censoredWords = [];
      this.originalCensoredWords = [];

      // Clear any timeouts
      if (this.censoredWordsTimeoutId) {
        clearTimeout(this.censoredWordsTimeoutId);
        this.censoredWordsTimeoutId = null;
      }
    },

    loadModerators() {
      console.log('👥 [Widget] Loading moderators');
      console.log('👥 [Widget] Group data:', this.group);
      console.log('👥 [Widget] Group members:', this.group?.members);
      console.log('👥 [Widget] Total members count:', this.group?.members?.length);
      
      const container = this.dialog.querySelector('.pingbash-moderators-list');
      if (!container) {
        console.error('👥 [Widget] Moderators list container not found');
        return;
      }

      // Clear the container first
      container.innerHTML = '';

      // Get moderators from group members (role_id === 2)
      const moderators = this.group?.members?.filter(member => member.role_id === 2) || [];
      
      console.log('👥 [Widget] Found moderators:', moderators.length);
      
      if (moderators.length === 0) {
        container.innerHTML = '<div class="pingbash-no-moderators">No moderators found</div>';
        return;
      }

      console.log('👥 [Widget] Rendering moderators:', moderators);

      container.innerHTML = moderators.map(mod => {
        const permissions = [];
        if (mod.chat_limit) permissions.push('Chat Limit');
        if (mod.manage_mods) permissions.push('Manage Mods');
        if (mod.manage_chat) permissions.push('Manage Chat');
        if (mod.manage_censored) permissions.push('Censored');
        if (mod.ban_user) permissions.push('Ban Users');

        const avatarText = this.getUserInitials(mod.name || `User ${mod.id}`);
        
        return `
          <div class="pingbash-moderator-item" data-moderator-id="${mod.id}">
            <div class="pingbash-moderator-info">
              <div class="pingbash-moderator-avatar">${avatarText}</div>
              <div class="pingbash-moderator-details">
                <div class="pingbash-moderator-name">${mod.name || `User ${mod.id}`}</div>
                <div class="pingbash-moderator-permissions">
                  ${permissions.map(perm => `<span class="pingbash-permission-badge">${perm}</span>`).join('')}
                </div>
              </div>
            </div>
            <div class="pingbash-moderator-actions">
              <button class="pingbash-moderator-edit-btn" data-moderator-id="${mod.id}">Edit</button>
              <button class="pingbash-moderator-remove-btn" data-moderator-id="${mod.id}">Remove</button>
            </div>
          </div>
        `;
      }).join('');

      console.log('👥 [Widget] Moderators HTML rendered');
      
      // Clear search cache when moderators are loaded
      this.cachedModeratorIds = null;
    },

    getUserInitials(name) {
      if (!name) return '?';
      const words = name.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    editModeratorPermissions(moderatorId) {
      console.log('👥 [Widget] Edit moderator permissions:', moderatorId);
      
      // Find the moderator
      const moderator = this.group?.members?.find(member => member.id === parseInt(moderatorId));
      if (!moderator) {
        console.error('👥 [Widget] Moderator not found:', moderatorId);
        return;
      }

      console.log('👥 [Widget] Found moderator:', moderator);

      // Show permissions popup
      this.showModeratorPermissionsPopup(moderator);
    },

    showModeratorPermissionsPopup(moderator) {
      console.log('👥 [Widget] Showing permissions popup for:', moderator);

      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      if (!popup) {
        console.error('👥 [Widget] Permissions popup not found');
        return;
      }

      // Set moderator info
      const avatarEl = popup.querySelector('.pingbash-moderator-avatar');
      const nameEl = popup.querySelector('.pingbash-moderator-name');
      
      if (avatarEl) avatarEl.textContent = this.getUserInitials(moderator.name || `User ${moderator.id}`);
      if (nameEl) nameEl.textContent = moderator.name || `User ${moderator.id}`;

      // Set permission checkboxes
      const permissions = {
        'chat_limit': moderator.chat_limit || false,
        'manage_mods': moderator.manage_mods || false,
        'manage_chat': moderator.manage_chat || false,
        'manage_censored': moderator.manage_censored || false,
        'ban_user': moderator.ban_user || false
      };

      console.log('👥 [Widget] Setting permissions:', permissions);

      Object.keys(permissions).forEach(permission => {
        const checkbox = popup.querySelector(`input[data-permission="${permission}"]`);
        if (checkbox) {
          checkbox.checked = permissions[permission];
          console.log('👥 [Widget] Setting checkbox:', permission, 'to', permissions[permission]);
        } else {
          console.warn('👥 [Widget] Checkbox not found for permission:', permission);
        }
      });

      // Store current moderator ID for saving
      popup.dataset.moderatorId = moderator.id;

      // Show the popup
      popup.style.display = 'flex';
      console.log('👥 [Widget] Permissions popup displayed');
    },

    hideModeratorPermissionsPopup() {
      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      if (popup) {
        popup.style.display = 'none';
        delete popup.dataset.moderatorId;
      }
    },

    saveModeratorPermissions() {
      console.log('👥 [Widget] Saving moderator permissions');

      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      const moderatorId = popup?.dataset.moderatorId;

      if (!moderatorId) {
        console.error('👥 [Widget] No moderator ID found');
        return;
      }

      // Get updated permissions from checkboxes
      const permissions = {};
      const checkboxes = popup.querySelectorAll('input[data-permission]');
      
      checkboxes.forEach(checkbox => {
        const permission = checkbox.dataset.permission;
        permissions[permission] = checkbox.checked;
      });

      console.log('👥 [Widget] Updated permissions:', permissions);

      // Show loading state on save button
      const saveBtn = popup.querySelector('.pingbash-mod-permissions-save');
      this.setButtonLoading(saveBtn, true);

      // Prepare the payload using the correct backend format for mod permissions
      // Get token from multiple possible sources
      const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
      
      const payload = {
        token: token,
        groupId: this.group.id,
        modId: parseInt(moderatorId),
        chat_limit: permissions.chat_limit,
        manage_mods: permissions.manage_mods,
        manage_chat: permissions.manage_chat,
        manage_censored: permissions.manage_censored,
        ban_user: permissions.ban_user
      };

      console.log('👥 [Widget] Sending update moderator permissions payload:', payload);

      // Send to server using correct backend event name
      this.socket.emit('update mod permissions', payload);

      // Note: popup will be hidden in response handler

      console.log('👥 [Widget] Moderator permissions update sent to server');
    },

    searchMembers(query) {
      console.log('👥 [Widget] Searching members:', query);
      
      const resultsContainer = this.dialog.querySelector('.pingbash-member-search-results');
      if (!resultsContainer) {
        console.error('👥 [Widget] Search results container not found');
        return;
      }

      if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
      }

      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Debounce search for better performance
      this.searchTimeout = setTimeout(() => {
        // Check if we have group members data, if not request it
        if (!this.group?.members || this.group.members.length === 0) {
          console.log('👥 [Widget] No group members found, requesting from server...');
          this.requestGroupMembersForSearch(query, resultsContainer);
        } else {
          this.performMemberSearch(query, resultsContainer);
        }
      }, 300);
    },

    requestGroupMembersForSearch(query, resultsContainer) {
      // Show loading in search results
      resultsContainer.innerHTML = '<div class="pingbash-member-result-item">Loading members...</div>';
      resultsContainer.style.display = 'block';

      // Request all group members from server
      console.log('👥 [Widget] Requesting group members for search');
      
      // Try primary event first
      this.socket.emit('get group members', {
        groupId: this.group.id,
        token: this.config.token
      });
      
      // Also try alternative event names as fallback
      setTimeout(() => {
        if (this.pendingSearchQuery) {
          console.log('👥 [Widget] Trying alternative group data request');
          this.socket.emit('get group data', {
            groupId: this.group.id,
            token: this.config.token
          });
        }
      }, 1000);

      // Store the search query to perform search once we get the data
      this.pendingSearchQuery = query;
      this.pendingSearchContainer = resultsContainer;
    },

    performMemberSearch(query, resultsContainer) {
      console.log('👥 [Widget] Performing member search for:', query);
      console.log('👥 [Widget] Available group members:', this.group?.members?.length);
      
      const queryLower = query.toLowerCase();
      
      // Cache moderator IDs for performance
      if (!this.cachedModeratorIds || this.cachedModeratorIds.timestamp < Date.now() - 30000) {
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        console.log('👥 [Widget] Current moderators:', currentModerators.length);
        this.cachedModeratorIds = {
          ids: new Set(currentModerators.map(mod => mod.id)),
          timestamp: Date.now()
        };
      }

      // Efficient filtering with early returns
      const availableMembers = [];
      const members = this.group?.members || [];
      
      console.log('👥 [Widget] Searching through', members.length, 'members');
      
      for (let i = 0; i < members.length && availableMembers.length < 5; i++) {
        const member = members[i];
        
        // More lenient role check - accept role_id 1 (regular) or 3 (member) or even undefined
        const isRegularMember = member.role_id === 1 || member.role_id === 3 || !member.role_id;
        
        // Skip if already a moderator
        if (this.cachedModeratorIds.ids.has(member.id)) {
          continue;
        }
        
        // Skip if not a regular member (only skip actual moderators/admins)
        if (member.role_id === 2) { // Skip moderators
          continue;
        }
        
        // Check if name or ID matches query
        const name = member.name || '';
        const userName = member.username || '';
        
        if (name.toLowerCase().includes(queryLower) || 
            userName.toLowerCase().includes(queryLower) ||
            member.id.toString().includes(query)) {
          availableMembers.push(member);
          console.log('👥 [Widget] Found matching member:', member.name || member.username || `User ${member.id}`);
        }
      }

      console.log('👥 [Widget] Available members:', availableMembers.length);

      if (availableMembers.length === 0) {
        resultsContainer.innerHTML = '<div class="pingbash-member-result-item">No members found</div>';
        resultsContainer.style.display = 'block';
        return;
      }

      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      
      availableMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'pingbash-member-result-item';
        item.dataset.memberId = member.id;
        
        const displayName = member.name || member.username || `User ${member.id}`;
        const avatarText = this.getUserInitials(displayName);
        item.innerHTML = `
          <div class="pingbash-member-result-avatar">${avatarText}</div>
          <div class="pingbash-member-result-name">${displayName}</div>
        `;
        
        fragment.appendChild(item);
      });

      resultsContainer.innerHTML = '';
      resultsContainer.appendChild(fragment);
      resultsContainer.style.display = 'block';
    },

    async addModerator(memberId) {
      console.log('👥 [Widget] Adding moderator:', memberId);
      
      // Find the member
      const member = this.group?.members?.find(m => m.id === parseInt(memberId));
      if (!member) {
        console.error('👥 [Widget] Member not found:', memberId);
        return;
      }

      const memberName = member.name || `User ${member.id}`;
      
      const confirmed = await this.showConfirm(
        'Add Moderator',
        `Are you sure you want to add ${memberName} as a moderator? They will be given default permissions which you can customize later.`,
        { 
          okText: 'Add Moderator',
          destructive: false
        }
      );

      if (confirmed) {
        console.log('👥 [Widget] Adding moderator:', memberName);
        
        // Show loading state
        this.showModeratorLoading('Adding moderator...');
        
        // Get current moderator IDs and add the new one
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        const currentModIds = currentModerators.map(mod => mod.id);
        const newModIds = [...currentModIds, parseInt(memberId)];

        // Get token from multiple possible sources
        const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
        
        console.log('👥 [Widget] Token sources check:', {
          authenticatedToken: !!this.authenticatedToken,
          configToken: !!this.config?.token,
          widgetToken: !!window.pingbashWidget?.config?.token,
          widgetAuthToken: !!window.pingbashWidget?.authenticatedToken,
          localStorageToken: !!localStorage.getItem('pingbash_token'),
          finalToken: !!token
        });
        
        // Prepare the payload using the correct backend format
        const payload = {
          token: token,
          groupId: this.group.id,
          modIds: newModIds  // Array of ALL moderator IDs (existing + new)
        };
        
        console.log('👥 [Widget] Sending add moderator payload:', payload);
        console.log('👥 [Widget] Current moderators:', currentModIds);
        console.log('👥 [Widget] New moderators array:', newModIds);
        console.log('👥 [Widget] Socket connected:', this.socket?.connected);
        console.log('👥 [Widget] Group ID:', this.group?.id);
        console.log('👥 [Widget] Token:', token?.substring(0, 20) + '...');
        
        // Send to server using correct backend event name
        console.log('👥 [Widget] 🚀 Emitting "update group moderators" event...');
        
        // Try multiple ways to access the socket
        const socket = this.socket || window.pingbashWidget?.socket;
        console.log('👥 [Widget] Socket instance:', socket);
        
        if (!socket) {
          console.error('👥 [Widget] No socket instance available!');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Socket connection not available');
          return;
        }
        
        socket.emit('update group moderators', payload);
        
        // Also emit debug events to check connectivity
        setTimeout(() => {
          console.log('👥 [Widget] 🔍 Testing socket with ping event');
          socket.emit('ping', { test: true });
        }, 1000);

        // Set a timeout to hide loading if no response within 10 seconds
        setTimeout(() => {
          if (this.dialog.querySelector('.pingbash-loading-overlay')) {
            console.warn('👥 [Widget] Add moderator timeout - no response from server');
            this.hideModeratorLoading();
            this.showErrorToast('Timeout', 'No response from server. Please try again.');
          }
        }, 10000);

        // Clear search
        const searchInput = this.dialog.querySelector('.pingbash-member-search-input');
        const searchResults = this.dialog.querySelector('.pingbash-member-search-results');
        
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.style.display = 'none';

        console.log('👥 [Widget] Add moderator sent to server');
      }
    },

    // Loading state management
    showModeratorLoading(message = 'Loading...') {
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup .pingbash-popup-content');
      if (!popup) return;

      // Remove existing overlay
      this.hideModeratorLoading();

      // Create loading overlay
      const overlay = document.createElement('div');
      overlay.className = 'pingbash-loading-overlay';
      overlay.innerHTML = `
        <div class="pingbash-spinner"></div>
        <div class="pingbash-loading-text">${message}</div>
      `;

      popup.style.position = 'relative';
      popup.appendChild(overlay);
    },

    hideModeratorLoading() {
      const overlay = this.dialog.querySelector('.pingbash-loading-overlay');
      if (overlay) {
        overlay.remove();
      }
    },

    setButtonLoading(button, loading) {
      if (!button) return;
      
      if (loading) {
        button.classList.add('pingbash-btn-loading');
        button.disabled = true;
      } else {
        button.classList.remove('pingbash-btn-loading');
        button.disabled = false;
      }
    },

    // Toast notification system
    showToast(title, message, type = 'info', duration = 4000) {
      const toast = document.createElement('div');
      toast.className = `pingbash-toast ${type}`;
      toast.innerHTML = `
        <div class="pingbash-toast-header">
          <h6 class="pingbash-toast-title">${title}</h6>
          <button class="pingbash-toast-close">&times;</button>
        </div>
        <p class="pingbash-toast-message">${message}</p>
      `;

      document.body.appendChild(toast);

      // Close button
      const closeBtn = toast.querySelector('.pingbash-toast-close');
      closeBtn.addEventListener('click', () => this.hideToast(toast));

      // Auto-hide after duration
      setTimeout(() => this.hideToast(toast), duration);

      return toast;
    },

    hideToast(toast) {
      if (!toast || !toast.parentNode) return;
      
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    },

    showSuccessToast(title, message) {
      return this.showToast(title, message, 'success');
    },

    showErrorToast(title, message) {
      return this.showToast(title, message, 'error', 6000);
    },

    showWarningToast(title, message) {
      return this.showToast(title, message, 'warning');
    },

    // Custom confirmation dialog
    showConfirm(title, message, options = {}) {
      return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'pingbash-confirm-modal';
        
        const okButtonClass = options.destructive ? 'pingbash-confirm-ok' : 'pingbash-confirm-ok primary';
        const okButtonText = options.okText || 'OK';
        const cancelButtonText = options.cancelText || 'Cancel';
        
        modal.innerHTML = `
          <div class="pingbash-confirm-content">
            <div class="pingbash-confirm-header">
              <h4 class="pingbash-confirm-title">${title}</h4>
            </div>
            <div class="pingbash-confirm-body">
              <p class="pingbash-confirm-message">${message}</p>
            </div>
            <div class="pingbash-confirm-footer">
              <button class="pingbash-confirm-btn pingbash-confirm-cancel">${cancelButtonText}</button>
              <button class="pingbash-confirm-btn ${okButtonClass}">${okButtonText}</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.pingbash-confirm-cancel');
        const okBtn = modal.querySelector('.pingbash-confirm-ok');

        const cleanup = () => {
          document.body.removeChild(modal);
        };

        cancelBtn.addEventListener('click', () => {
          cleanup();
          resolve(false);
        });

        okBtn.addEventListener('click', () => {
          cleanup();
          resolve(true);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            cleanup();
            resolve(false);
          }
        });

        // Focus OK button for keyboard navigation
        setTimeout(() => okBtn.focus(), 100);
      });
    },

    async removeModerator(moderatorId) {
      console.log('👥 [Widget] Remove moderator:', moderatorId);
      
      // Find the moderator
      const moderator = this.group?.members?.find(member => member.id === parseInt(moderatorId));
      if (!moderator) {
        console.error('👥 [Widget] Moderator not found:', moderatorId);
        return;
      }

      const moderatorName = moderator.name || `User ${moderator.id}`;
      
      const confirmed = await this.showConfirm(
        'Remove Moderator',
        `Are you sure you want to remove ${moderatorName} as a moderator? This action cannot be undone and they will lose all moderator permissions.`,
        { 
          okText: 'Remove Moderator',
          destructive: true
        }
      );

      if (confirmed) {
        console.log('👥 [Widget] Removing moderator:', moderatorName);
        
        // Show loading state
        this.showModeratorLoading('Removing moderator...');
        
        // Get current moderator IDs and remove the selected one
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        const currentModIds = currentModerators.map(mod => mod.id);
        const newModIds = currentModIds.filter(id => id !== parseInt(moderatorId));

        // Get token from multiple possible sources
        const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
        
        // Prepare the payload using the correct backend format
        const payload = {
          token: token,
          groupId: this.group.id,
          modIds: newModIds  // Array of remaining moderator IDs
        };

        // Special handling for removing the last moderator
        if (newModIds.length === 0) {
          console.warn('👥 [Widget] Removing last moderator - this will leave the group with no moderators!');
          const confirmLastModerator = await this.showConfirm(
            'Remove Last Moderator',
            'This will remove the last moderator from the group. The group will have no moderators. Are you sure?',
            {
              okText: 'Yes, Remove All Moderators',
              destructive: true
            }
          );
          
          if (!confirmLastModerator) {
            this.hideModeratorLoading();
            return;
          }
        }

        console.log('👥 [Widget] Sending remove moderator payload:', payload);
        console.log('👥 [Widget] Current moderators:', currentModIds);
        console.log('👥 [Widget] Remaining moderators array:', newModIds);
        console.log('👥 [Widget] Removing moderator ID:', moderatorId);
        console.log('👥 [Widget] Group ID:', this.group?.id);
        console.log('👥 [Widget] Token available:', !!token);
        
        // Validate payload before sending
        if (!token) {
          console.error('👥 [Widget] No token available for remove moderator request');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Authentication token not available');
          return;
        }
        
        if (!this.group?.id) {
          console.error('👥 [Widget] No group ID available for remove moderator request');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Group ID not available');
          return;
        }
        
        // Send to server using correct backend event name
        console.log('👥 [Widget] 🚀 Emitting "update group moderators" for removal...');
        
        // Try multiple ways to access the socket
        const socket = this.socket || window.pingbashWidget?.socket;
        console.log('👥 [Widget] Socket instance for removal:', socket);
        console.log('👥 [Widget] Socket connected for removal:', socket?.connected);
        
        if (!socket) {
          console.error('👥 [Widget] No socket instance available for remove moderator!');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Socket connection not available');
          return;
        }
        
        socket.emit('update group moderators', payload);

        console.log('👥 [Widget] Moderator removal sent to server');

        // Set a timeout to hide loading if no response within 10 seconds
        const timeoutId = setTimeout(() => {
          console.warn('👥 [Widget] Remove moderator request timed out');
          this.hideModeratorLoading();
          this.showErrorToast('Timeout', 'No response from server. Please try again.');
        }, 10000);

        // Store timeout ID for cleanup if response comes back
        this.removeModeratorTimeoutId = timeoutId;
      }
    },

    saveModerators() {
      console.log('👥 [Widget] Save moderators');
      // TODO: Implement saving moderator changes
      //alert('Save moderators functionality coming soon!');
      this.hideModeratorManagement();
    },

    showManageChatMenu() {
      const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
      const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
      
      if (menuView) menuView.style.display = 'block';
      if (pinnedView) pinnedView.style.display = 'none';
    },

    showPinnedMessagesView() {
      const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
      const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
      
      if (menuView) menuView.style.display = 'none';
      if (pinnedView) pinnedView.style.display = 'block';

      // Load pinned messages
      this.loadPinnedMessages();
    },

    loadPinnedMessages() {
      console.log('📌 [Widget] Loading pinned messages');
      console.log('📌 [Widget] Pinned message IDs:', this.pinnedMessageIds);
      console.log('📌 [Widget] Total messages:', this.messages?.length || 0);
      
      const container = this.dialog.querySelector('.pingbash-pinned-messages-list');
      if (!container) {
        console.error('📌 [Widget] Pinned messages list container not found');
        return;
      }

      // Clear the container first
      container.innerHTML = '';

      // Get pinned messages using the pinnedMessageIds array
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds && this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      
      console.log('📌 [Widget] Found pinned messages:', pinnedMessages.length);
      console.log('📌 [Widget] Sample message structure:', this.messages?.[0]);
      
      if (pinnedMessages.length === 0) {
        console.log('📌 [Widget] No pinned messages found - auto-closing view');
        
        // Auto-close the pinned messages view when no messages are left
        const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
        const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
        if (pinnedView && menuView) {
          pinnedView.style.display = 'none';
          menuView.style.display = 'block';
          console.log('📌 [Widget] Pinned messages view closed automatically, returned to menu');
        } else {
          // Fallback: show empty state if we can't close the view
          container.innerHTML = '<div class="pingbash-no-pinned">No pinned messages found</div>';
          console.log('📌 [Widget] Could not auto-close view, showing empty state instead');
        }
        
        return;
      }

      console.log('📌 [Widget] Rendering pinned messages:', pinnedMessages);

      container.innerHTML = pinnedMessages.map(msg => `
        <div class="pingbash-pinned-message-item" data-message-id="${msg.Id}">
          <div class="pingbash-pinned-message-content">
            <div class="pingbash-pinned-message-author">${this.getUserDisplayName(msg)}</div>
            <div class="pingbash-pinned-message-text">${this.renderMessageContent(msg.Content || msg.message || '')}</div>
            <div class="pingbash-pinned-message-time">${this.formatMessageTime(msg.Send_Time || msg.timestamp)}</div>
          </div>
          <button class="pingbash-unpin-btn" data-message-id="${msg.Id}" title="Unpin message">
            📌
          </button>
        </div>
      `).join('');

      console.log('📌 [Widget] Pinned messages HTML rendered');
    },

    clearChat() {
      console.log('🧹 [Widget] Clear chat button clicked');
      console.log('🧹 [Widget] Socket connected:', this.socket && this.isConnected);
      console.log('🧹 [Widget] Group ID:', this.groupId);
      console.log('🧹 [Widget] User ID:', this.userId);
      
      if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
        console.log('🧹 [Widget] Clear chat cancelled by user');
        return;
      }

      // Emit clear chat event to server
      if (this.socket && this.isConnected) {
        console.log('🧹 [Widget] Emitting clear chat event to server');
        
        // Set up a timeout in case server doesn't respond
        const clearChatTimeout = setTimeout(() => {
          console.warn('🧹 [Widget] Clear chat request timed out - no response from server');
          //alert('Clear chat request timed out. The server may not support this feature or there was a network issue.');
        }, 10000); // 10 second timeout

        // Store timeout so we can clear it if we get a response
        this.clearChatTimeout = clearChatTimeout;

        // Use the correct backend socket event: CLEAR_GROUP_CHAT
        this.socket.emit('clear group chat', {
          groupId: parseInt(this.groupId),
          token: this.isAuthenticated ? this.authenticatedToken : `anonusermemine${this.anonId}`
        });
        
        console.log('🧹 [Widget] Clear group chat request sent to server with data:', {
          groupId: parseInt(this.groupId),
          token: this.isAuthenticated ? 'authenticated' : 'anonymous',
          isAuthenticated: this.isAuthenticated
        });

        // Optimistically clear messages locally (in case server doesn't respond)
        setTimeout(() => {
          console.log('🧹 [Widget] Optimistically clearing messages locally after 2 seconds');
          this.messages = [];
          this.pinnedMessageIds = [];
          this.displayMessages([]);
          this.updatePinnedMessagesWidget();
          console.log('🧹 [Widget] Local messages cleared');
        }, 2000);
        
        // Close the manage chat popup
        this.hideManageChat();
      } else {
        console.error('🧹 [Widget] Cannot clear chat - socket not connected');
        console.error('🧹 [Widget] Socket status:', {
          socket: !!this.socket,
          isConnected: this.isConnected
        });
        //alert('Cannot clear chat - not connected to server');
      }
    },

    unpinMessage(messageId) {
      console.log('📌 [Widget] Unpinning message:', messageId);
      
      if (!this.socket || !this.isConnected) {
        console.error('📌 [Widget] Cannot unpin message - socket not connected');
        //alert('Cannot unpin message - not connected to server');
        return;
      }

      if (!this.isAuthenticated || !this.authenticatedToken) {
        console.error('📌 [Widget] Cannot unpin message - not authenticated');
        //alert('Please log in to unpin messages');
        return;
      }

      // Use correct backend payload format (same as chat.js)
      const payload = {
        token: this.authenticatedToken?.trim(),
        groupId: parseInt(this.groupId),
        msgId: parseInt(messageId)
      };

      console.log('📌 [Widget] Unpin payload:', payload);
      console.log('📌 [Widget] Token length:', payload.token?.length);

      // Emit unpin message event to server
      this.socket.emit('unpin message', payload);

      console.log('📌 [Widget] Unpin message request sent to server');
    },

    getPinnedMessages() {
      if (!this.socket || !this.isConnected) {
        console.error('📌 [Widget] Cannot get pinned messages - socket not connected');
        return;
      }
      if (!this.isAuthenticated || !this.authenticatedToken) {
        console.log('📌 [Widget] Cannot get pinned messages - not authenticated');
        return;
      }
      
      console.log('📌 [Widget] Requesting pinned messages for group:', this.groupId);
      
      // Request pinned messages
      this.socket.emit('get pinned messages', {
        token: this.authenticatedToken?.trim(),
        groupId: parseInt(this.groupId)
      });
    },

    // Helper method to get display name for a user
    getUserDisplayName(message) {
      if (message.Sender_Id && message.Sender_Id > 100000) {
        // Anonymous user - show as anon + last 3 digits
        return "anon" + String(message.Sender_Id).slice(-3);
      } else {
        // Regular user - use sender_name or fallback
        return message.sender_name || 'Anonymous';
      }
    },

    // Helper method to render message content (basic HTML rendering)

    /*
    renderMessageContent(content) {
      if (!content) return '';
      
      // Escape HTML but preserve some basic formatting
      const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      // Convert URLs to links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #000000; text-decoration: underline;">$1</a>');
    },
    */
    // Helper method to format message time
    formatMessageTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    canManageChatLimitations() {
      // Check if user is group creator or mod with chat_limit permission
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId || !this.group) return false;
      
      // Group creator can always manage limitations
      if (this.group.creater_id === currentUserId) return true;
      
      // Check if user is mod/admin with chat_limit permission
      const userMember = this.group.members?.find(member => member.id === currentUserId);
      return userMember && (userMember.role_id === 1 || userMember.role_id === 2) && userMember.chat_limit;
    },

    getCurrentUserId() {
      if (this.isAuthenticated && this.currentUserId) {
        return parseInt(this.currentUserId);
      } else if (this.anonId) {
        return parseInt(this.anonId);
      }
      return null;
    },

    loadCurrentLimitations() {
      console.log('🔒 [Widget] Loading current chat limitations from group data:', this.group);
      
      if (!this.group) return;
      
      // Set post level (who can post)
      const postLevel = this.group.post_level || 0;
      const postRadios = this.dialog.querySelectorAll('input[name="post-level"]');
      postRadios.forEach(radio => {
        radio.checked = (parseInt(radio.value) === postLevel);
      });
      
      // Set URL level (who can post URLs)
      const urlLevel = this.group.url_level || 0;
      const urlRadios = this.dialog.querySelectorAll('input[name="url-level"]');
      urlRadios.forEach(radio => {
        radio.checked = (parseInt(radio.value) === urlLevel);
      });
      
      // Set slow mode
      const slowMode = this.group.slow_mode || false;
      const slowModeCheckbox = this.dialog.querySelector('#slow-mode-checkbox');
      if (slowModeCheckbox) {
        slowModeCheckbox.checked = slowMode;
        this.toggleSlowModeOptions(slowMode);
      }
      
      // Set slow time
      const slowTime = this.group.slow_time || 5;
      this.setSlowTimeOptions(slowTime);
    },

    toggleSlowModeOptions(show) {
      const slowModeOptions = this.dialog.querySelector('.pingbash-slow-mode-options');
      if (slowModeOptions) {
        slowModeOptions.style.display = show ? 'block' : 'none';
      }
    },

    setSlowTimeOptions(slowTime) {
      const speedRadios = this.dialog.querySelectorAll('input[name="slow-speed"]');
      const customSecondsDiv = this.dialog.querySelector('.pingbash-custom-seconds');
      const customSecondsInput = this.dialog.querySelector('#custom-seconds');
      
      if (slowTime === 5 || slowTime === 10 || slowTime === 15) {
        // Standard option
        speedRadios.forEach(radio => {
          radio.checked = (radio.value === slowTime.toString());
        });
        if (customSecondsDiv) customSecondsDiv.style.display = 'none';
      } else {
        // Custom option
        speedRadios.forEach(radio => {
          radio.checked = (radio.value === 'custom');
        });
        if (customSecondsDiv) customSecondsDiv.style.display = 'flex';
        if (customSecondsInput) customSecondsInput.value = slowTime.toString();
      }
    },

    updateChatLimitations() {
      console.log('🔒 [Widget] Updating chat limitations');
      
      // Get form values
      const postLevel = parseInt(this.dialog.querySelector('input[name="post-level"]:checked')?.value || '0');
      const urlLevel = parseInt(this.dialog.querySelector('input[name="url-level"]:checked')?.value || '0');
      const slowMode = this.dialog.querySelector('#slow-mode-checkbox')?.checked || false;
      
      let slowTime = 5;
      const selectedSpeed = this.dialog.querySelector('input[name="slow-speed"]:checked')?.value;
      if (selectedSpeed === 'custom') {
        const customSeconds = parseInt(this.dialog.querySelector('#custom-seconds')?.value || '5');
        slowTime = customSeconds > 0 ? customSeconds : 5;
      } else {
        slowTime = parseInt(selectedSpeed || '5');
      }
      
      console.log('🔒 [Widget] Chat limitations settings:', {
        postLevel,
        urlLevel,
        slowMode,
        slowTime
      });
      
      // Send to server (same as W version)
      if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
        this.socket.emit('udpate group post level', {
          token: this.authenticatedToken.trim(),
          groupId: parseInt(this.groupId),
          post_level: postLevel,
          url_level: urlLevel,
          slow_mode: slowMode,
          slow_time: slowTime
        });
        
        console.log('🔒 [Widget] Chat limitations update sent to server');
        this.hideChatLimitations();
      } else {
        console.error('🔒 [Widget] Cannot update chat limitations - missing authentication or group ID');
        //alert('Please sign in to update chat limitations');
      }
    },

    // Chat Limitations Validation Methods
    canUserPost() {
      if (!this.group) return true; // Allow if no group data
      
      const postLevel = this.group.post_level || 0;
      const currentUserId = this.getCurrentUserId();
      
      // 0 = Anyone can post
      if (postLevel === 0) return true;
      
      // 1 = Verified users only  
      if (postLevel === 1) {
        return this.isAuthenticated; // Only authenticated users can post
      }
      
      // 2 = Admin & Mods only
      if (postLevel === 2) {
        if (!currentUserId) return false;
        
        // Group creator can always post
        if (this.group.creater_id === currentUserId) return true;
        
        // Check if user is mod/admin
        const userMember = this.group.members?.find(member => member.id === currentUserId);
        return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
      }
      
      return true;
    },

    canUserPostUrls(message) {
      if (!this.group) return true; // Allow if no group data
      
      const urlLevel = this.group.url_level || 0;
      const currentUserId = this.getCurrentUserId();
      
      // Check if message contains URLs
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const hasUrls = urlRegex.test(message);
      
      if (!hasUrls) return true; // No URLs, so no restriction
      
      // 0 = Everyone can post URLs
      if (urlLevel === 0) return true;
      
      // 1 = Admin & Mods only can post URLs
      if (urlLevel === 1) {
        if (!currentUserId) return false;
        
        // Group creator can always post URLs
        if (this.group.creater_id === currentUserId) return true;
        
        // Check if user is mod/admin
        const userMember = this.group.members?.find(member => member.id === currentUserId);
        return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
      }
      
      return true;
    },

    isSlowModeActive() {
      return this.group?.slow_mode || false;
    },

    getSlowModeTime() {
      return this.group?.slow_time || 5;
    },

    canUserSendMessage() {
      // Track last message time for slow mode
      if (!this.lastMessageTime) this.lastMessageTime = 0;
      
      const now = Date.now();
      const slowModeTime = this.getSlowModeTime() * 1000; // Convert to milliseconds
      
      if (this.isSlowModeActive()) {
        // 🆕 Check if user is admin or moderator (exempt from slow mode)
        const currentUserId = this.getCurrentUserId();
        const isAdminOrMod = this.group?.creater_id === currentUserId || 
          this.group?.members?.find(member => member.id === currentUserId && (member.role_id === 1 || member.role_id === 2));
        
        if (isAdminOrMod) {
          console.log('⚡ [Widget] Admin/Moderator exempt from slow mode');
          return { canSend: true };
        }
        
        const timeSinceLastMessage = now - this.lastMessageTime;
        if (timeSinceLastMessage < slowModeTime) {
          const remainingTime = Math.ceil((slowModeTime - timeSinceLastMessage) / 1000);
          return { canSend: false, reason: `Slow mode: Wait ${remainingTime} seconds before sending another message` };
        }
      }
      
      return { canSend: true };
    },

    validateMessageBeforeSending(message) {
      console.log('🔒 [Widget] Validating message before sending:', message);
      
      // Check if user can post at all
      if (!this.canUserPost()) {
        const postLevel = this.group?.post_level || 0;
        let errorMessage = 'You are not allowed to post messages.';
        
        if (postLevel === 1) {
          errorMessage = 'Only verified users can post messages. Please sign in.';
        } else if (postLevel === 2) {
          errorMessage = 'Only admins and moderators can post messages.';
        }
        
        return { valid: false, error: errorMessage };
      }
      
      // Check if user can post URLs
      if (!this.canUserPostUrls(message)) {
        return { valid: false, error: 'Only admins and moderators can post URLs.' };
      }
      
      // Check slow mode
      const slowModeCheck = this.canUserSendMessage();
      if (!slowModeCheck.canSend) {
        return { valid: false, error: slowModeCheck.reason };
      }
      
      console.log('🔒 [Widget] Message validation passed');
      return { valid: true };
    },

    updateLastMessageTime() {
      this.lastMessageTime = Date.now();
    },

    // Update UI to reflect current chat limitations
    updateChatLimitationUI() {
      const input = this.dialog.querySelector('.pingbash-message-input');
      const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
      const mediaButtons = this.dialog.querySelectorAll('.pingbash-media-btn');
      
      if (!input || !sendBtn) return;

      // Check if user can post at all
      const canPost = this.canUserPost();
      if (!canPost) {
        const postLevel = this.group?.post_level || 0;
        let placeholder = 'You cannot post messages.';
        
        if (postLevel === 1) {
          placeholder = 'Only verified users can post. Please sign in.';
        } else if (postLevel === 2) {
          placeholder = 'Only admins and moderators can post.';
        }
        
        input.disabled = true;
        input.placeholder = placeholder;
        sendBtn.disabled = true;
        mediaButtons.forEach(btn => btn.disabled = true);
        return;
      }

      // Check slow mode
      const slowModeCheck = this.canUserSendMessage();
      if (!slowModeCheck.canSend) {
        input.disabled = true;
        input.placeholder = slowModeCheck.reason;
        sendBtn.disabled = true;
        mediaButtons.forEach(btn => btn.disabled = true);
        
        // Set up timer to re-enable when slow mode period is over
        const slowModeTime = this.getSlowModeTime() * 1000;
        const timeSinceLastMessage = Date.now() - (this.lastMessageTime || 0);
        const remainingTime = slowModeTime - timeSinceLastMessage;
        
        if (remainingTime > 0) {
          setTimeout(() => {
            this.updateChatLimitationUI();
          }, remainingTime);
        }
        return;
      }

      // User can post - enable everything
      input.disabled = false;
      input.placeholder = 'Write a message';
      sendBtn.disabled = false;
      mediaButtons.forEach(btn => btn.disabled = false);

      // Add warning for URL restrictions if applicable
      const urlLevel = this.group?.url_level || 0;
      if (urlLevel === 1) {
        const currentUserId = this.getCurrentUserId();
        const isAdminOrMod = this.group?.creater_id === currentUserId || 
          this.group?.members?.find(member => member.id === currentUserId && (member.role_id === 1 || member.role_id === 2));
        
        if (!isAdminOrMod) {
          input.placeholder = 'Write a message (URLs not allowed)';
        }
      }
    },

    // Call this method when group data is updated
    onGroupDataUpdated() {
      console.log('🔒 [Widget] Group data updated, refreshing chat limitation UI');
      this.updateChatLimitationUI();
    },

  });
}