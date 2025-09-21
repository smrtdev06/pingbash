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
    showBannedUsers() {
      console.log('🚫 [Widget] Showing banned users');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Emit socket event to get banned users
      this.socket.emit('get banned users', {
        group_id: this.groupId,
        token: this.userId
      });
    },

  // EXACT COPY from widget.js - showIpBans method
    showIpBans() {
      console.log('🌐 [Widget] Showing IP bans');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Emit socket event to get IP bans
      this.socket.emit('get ip bans', {
        group_id: this.groupId,
        token: this.userId
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
  
      console.log('🔍 [Widget] [Chat Rules] getChatRules called with groupId:', this.groupId, 'token:', this.isAuthenticated ? 'Available' : 'Missing');
  
      if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
        this.socket.emit('get chat rules', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId)
        });
        console.log('🔍 [Widget] [Chat Rules] Emitted get chat rules event');
      } else {
        console.log('🔍 [Widget] [Chat Rules] Cannot emit get chat rules - missing token or groupId');
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
        alert('Group name input not found');
        return;
      }
      
      const groupName = groupNameInput.value.trim();
      console.log('🏗️ [Widget] Group name from input:', groupName);
      
      if (!groupName) {
        alert('Please enter a group name');
        return;
      }
      
      if (!this.isAuthenticated || !this.authenticatedToken) {
        alert('Please log in to create a group');
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
          alert(`Group "${groupName}" created successfully!`);
          this.hideGroupCreationModal();
          
          // Optionally switch to the new group
          if (result.groupId) {
            console.log('🏗️ [Widget] Switching to new group:', result.groupId);
            // You could implement group switching here
          }
        } else {
          console.error('🏗️ [Widget] Group creation failed:', result);
          alert(result.message || 'Failed to create group. Please try again.');
        }
      } catch (error) {
        console.error('🏗️ [Widget] Group creation error:', error);
        alert('Failed to create group. Please check your connection and try again.');
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

  });
}