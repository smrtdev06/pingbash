/**
 * Pingbash Chat Widget - Modals Module
 * Chat rules, group creation, emoji picker, and mention picker
 */

// Extend the PingbashChatWidget class with modal methods
Object.assign(PingbashChatWidget.prototype, {
  // Chat Rules Modal
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

  hideChatRules() {
    const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
    popup.style.display = 'none';
    
    // Mark rules as seen when closing
    if (this.groupId) {
      this.markRulesAsSeen(this.groupId);
    }
  },

  getChatRules() {
    if (!this.socket || !this.socket.connected || !this.groupId) {
      console.log('📋 [Widget] [Chat Rules] Cannot get chat rules - socket not ready');
      return;
    }

    console.log('📋 [Widget] [Chat Rules] Requesting chat rules for group:', this.groupId);
    this.socket.emit('get chat rules', {
      groupId: parseInt(this.groupId),
      token: this.userId
    });
  },

  handleGetChatRules(response) {
    console.log('📋 [Widget] [Chat Rules] handleGetChatRules response:', response);
    
    if (response && response.chatRules) {
      this.chatRules = response.chatRules || '';
      this.displayChatRules(this.chatRules);
    } else {
      console.log('📋 [Widget] [Chat Rules] No rules found or error:', response?.message);
      this.displayChatRules('');
    }
  },

  displayChatRules(rules) {
    const rulesText = this.dialog.querySelector('.pingbash-rules-text');
    const noRulesText = this.dialog.querySelector('.pingbash-no-rules-text');
    
    if (rules && rules.trim()) {
      rulesText.textContent = rules;
      rulesText.style.display = 'block';
      noRulesText.style.display = 'none';
    } else {
      rulesText.style.display = 'none';
      noRulesText.style.display = 'block';
    }
  },

  editChatRules() {
    console.log('📋 [Widget] [Chat Rules] Entering edit mode');
    
    const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
    const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
    const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
    const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');
    const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
    
    // Switch to edit mode
    rulesDisplay.style.display = 'none';
    rulesEdit.style.display = 'block';
    viewFooter.style.display = 'none';
    editFooter.style.display = 'flex';
    
    // Set current rules in textarea
    textarea.value = this.chatRules || '';
    textarea.focus();
  },

  cancelEditChatRules() {
    console.log('📋 [Widget] [Chat Rules] Canceling edit mode');
    
    const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
    const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
    const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
    const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');
    
    // Switch back to view mode
    rulesDisplay.style.display = 'block';
    rulesEdit.style.display = 'none';
    viewFooter.style.display = 'flex';
    editFooter.style.display = 'none';
  },

  saveChatRules() {
    const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
    const newRules = textarea.value.trim();
    
    console.log('📋 [Widget] [Chat Rules] Saving rules:', newRules);
    
    if (!this.socket || !this.socket.connected || !this.groupId) {
      this.showError('Cannot save rules - not connected');
      return;
    }
    
    this.socket.emit('update chat rules', {
      groupId: parseInt(this.groupId),
      rules: newRules,
      token: this.userId
    });
  },

  handleUpdateChatRules(response) {
    console.log('📋 [Widget] [Chat Rules] handleUpdateChatRules response:', response);
    
    if (response && response.success) {
      this.chatRules = response.rules || '';
      this.displayChatRules(this.chatRules);
      this.cancelEditChatRules();
      this.showSuccess('Chat rules updated successfully');
    } else {
      this.showError(response?.message || 'Failed to update chat rules');
    }
  },

  // Group Creation Modal
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

    const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
    console.log('🏗️ [Widget] Group creation modal element found:', !!modal);
    
    if (!modal) {
      console.error('❌ [Widget] Group creation modal not found in DOM!');
      return;
    }
    
    console.log('🏗️ [Widget] Showing group creation modal');
    modal.classList.add('show'); // Use CSS class to show modal
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'; // Normal dark overlay
    
    // Reset form
    this.resetGroupCreationForm();
  },

  hideGroupCreationModal() {
    console.log('🏗️ [Widget] Closing group creation modal');
    const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
    modal.classList.remove('show'); // Use CSS class to hide modal
  },

  resetGroupCreationForm() {
    // Reset all form fields to defaults
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    const charCounter = this.dialog.querySelector('.pingbash-char-counter');
    
    if (groupNameInput) {
      groupNameInput.value = '';
      if (charCounter) {
        charCounter.textContent = '0/50 characters';
      }
    }

    // Reset radio buttons
    const fixedSizeRadio = this.dialog.querySelector('input[name="size-mode"][value="fixed"]');
    if (fixedSizeRadio) fixedSizeRadio.checked = true;

    // Reset size inputs
    const widthInput = this.dialog.querySelector('#widget-width');
    const heightInput = this.dialog.querySelector('#widget-height');
    if (widthInput) widthInput.value = '500';
    if (heightInput) heightInput.value = '400';

    // Reset color inputs
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

    // Reset number inputs
    const numberInputs = {
      '#font-size': '14',
      '#corner-radius': '8'
    };

    Object.entries(numberInputs).forEach(([selector, value]) => {
      const input = this.dialog.querySelector(selector);
      if (input) input.value = value;
    });

    // Hide/show conditional groups
    const fontSizeGroup = this.dialog.querySelector('#font-size-group');
    if (fontSizeGroup) fontSizeGroup.style.display = 'none';

    // Update create button state
    this.updateCreateButtonState();
  },

  setupGroupCreationForm() {
    // Group name input and character counter
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    const charCounter = this.dialog.querySelector('.pingbash-char-counter');
    
    groupNameInput?.addEventListener('input', (e) => {
      const length = e.target.value.length;
      if (charCounter) {
        charCounter.textContent = `${length}/50 characters`;
      }
      this.updateCreateButtonState();
    });

    // Custom font size checkbox
    const customFontSizeCheckbox = this.dialog.querySelector('#custom-font-size');
    const fontSizeGroup = this.dialog.querySelector('#font-size-group');
    
    customFontSizeCheckbox?.addEventListener('change', (e) => {
      if (fontSizeGroup) {
        fontSizeGroup.style.display = e.target.checked ? 'block' : 'none';
      }
    });

    // Add event listeners to all form inputs to update create button state
    const formInputs = this.dialog.querySelectorAll('.pingbash-group-creation-modal input, .pingbash-group-creation-modal select');
    formInputs.forEach(input => {
      input.addEventListener('input', () => this.updateCreateButtonState());
      input.addEventListener('change', () => this.updateCreateButtonState());
    });
  },

  updateCreateButtonState() {
    const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    
    if (createBtn && groupNameInput) {
      const hasGroupName = groupNameInput.value.trim().length > 0;
      createBtn.disabled = !hasGroupName;
    }
  },

  getCurrentConfig() {
    const config = {};
    
    // Get group name
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    config.groupName = groupNameInput?.value?.trim() || '';
    
    // Get size settings
    const sizeMode = this.dialog.querySelector('input[name="size-mode"]:checked')?.value || 'fixed';
    config.sizeMode = sizeMode;
    
    const widthInput = this.dialog.querySelector('#widget-width');
    const heightInput = this.dialog.querySelector('#widget-height');
    config.width = parseInt(widthInput?.value) || 500;
    config.height = parseInt(heightInput?.value) || 400;
    
    // Get colors
    const colorInputs = ['bg-color', 'title-color', 'msg-bg-color', 'msg-text-color', 'owner-msg-color', 'input-bg-color'];
    config.colors = {};
    colorInputs.forEach(id => {
      const input = this.dialog.querySelector(`#${id}`);
      if (input) {
        config.colors[id.replace('-', '_')] = input.value;
      }
    });
    
    // Get settings
    const checkboxes = ['show-user-images', 'round-corners', 'show-chat-rules', 'custom-font-size'];
    config.settings = {};
    checkboxes.forEach(id => {
      const input = this.dialog.querySelector(`#${id}`);
      if (input) {
        config.settings[id.replace('-', '_')] = input.checked;
      }
    });
    
    // Get font size and corner radius
    const fontSizeInput = this.dialog.querySelector('#font-size');
    const cornerRadiusInput = this.dialog.querySelector('#corner-radius');
    config.fontSize = parseInt(fontSizeInput?.value) || 14;
    config.cornerRadius = parseInt(cornerRadiusInput?.value) || 8;
    
    return config;
  },

  async createNewGroup() {
    const config = this.getCurrentConfig();
    
    if (!config.groupName) {
      this.showError('Please enter a group name');
      return;
    }
    
    console.log('🏗️ [Widget] Creating new group with config:', config);
    
    const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    const originalText = createBtn.textContent;
    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';
    
    try {
      const response = await fetch(`${this.config.apiUrl}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authenticatedToken}`
        },
        body: JSON.stringify({
          name: config.groupName,
          settings: config
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ [Widget] Group created successfully:', result);
        this.showSuccess(`Group "${config.groupName}" created successfully!`);
        this.hideGroupCreationModal();
        
        // Optionally switch to the new group
        // this.config.groupName = config.groupName;
        // this.reconnectToGroup();
      } else {
        throw new Error(result.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('❌ [Widget] Group creation error:', error);
      this.showError('Failed to create group: ' + error.message);
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = originalText;
    }
  },

  // Emoji Picker Modal
  showEmojiPicker() {
    console.log('😀 [Widget] Showing emoji picker');
    const modal = this.dialog.querySelector('.pingbash-emoji-modal');
    modal.style.display = 'flex';
  },

  hideEmojiPicker() {
    console.log('😀 [Widget] Hiding emoji picker');
    const modal = this.dialog.querySelector('.pingbash-emoji-modal');
    modal.style.display = 'none';
  },

  addEmoji(emoji) {
    console.log('😀 [Widget] Adding emoji:', emoji);
    const input = this.dialog.querySelector('#pingbash-message-input');
    if (input) {
      const cursorPos = input.selectionStart;
      const textBefore = input.value.substring(0, cursorPos);
      const textAfter = input.value.substring(input.selectionEnd);
      
      input.value = textBefore + emoji + textAfter;
      input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
      input.focus();
    }
    
    this.hideEmojiPicker();
  },

  // Mention Picker Modal
  showMentionPicker() {
    console.log('@ [Widget] Showing mention picker');
    this.updateMentionList();
    const modal = this.dialog.querySelector('.pingbash-mention-modal');
    modal.style.display = 'flex';
  },

  hideMentionPicker() {
    console.log('@ [Widget] Hiding mention picker');
    const modal = this.dialog.querySelector('.pingbash-mention-modal');
    modal.style.display = 'none';
  },

  updateMentionList() {
    const mentionList = this.dialog.querySelector('.pingbash-mention-list');
    if (!mentionList) return;

    mentionList.innerHTML = '';

    if (!this.onlineUserIds || this.onlineUserIds.length === 0) {
      mentionList.innerHTML = '<div class="pingbash-mention-item">No users online</div>';
      return;
    }

    this.onlineUserIds.forEach(userId => {
      const userItem = document.createElement('div');
      userItem.className = 'pingbash-mention-item';
      
      // Generate user name based on user ID
      let userName;
      if (parseInt(userId) === parseInt(this.currentUserId)) {
        userName = 'You';
      } else if (parseInt(userId) > 100000000) {
        // Anonymous user
        const shortId = userId.toString().slice(-3);
        userName = `Anon${shortId}`;
      } else {
        // Authenticated user
        userName = `User ${userId}`;
      }
      
      userItem.textContent = userName;
      userItem.addEventListener('click', () => this.addMention(userName));
      
      mentionList.appendChild(userItem);
    });
  },

  addMention(userName) {
    console.log('@ [Widget] Adding mention:', userName);
    const input = this.dialog.querySelector('#pingbash-message-input');
    if (input) {
      const cursorPos = input.selectionStart;
      const textBefore = input.value.substring(0, cursorPos);
      const textAfter = input.value.substring(input.selectionEnd);
      
      // Remove the @ that triggered the mention picker
      const beforeWithoutAt = textBefore.endsWith('@') ? textBefore.slice(0, -1) : textBefore;
      
      input.value = beforeWithoutAt + '@' + userName + ' ' + textAfter;
      const newPos = beforeWithoutAt.length + userName.length + 2;
      input.setSelectionRange(newPos, newPos);
      input.focus();
    }
    
    this.hideMentionPicker();
  },

  // Sound Settings Modal
  showSoundSettings() {
    console.log('🔊 [Widget] Showing sound settings');
    const modal = this.dialog.querySelector('.pingbash-sound-popup');
    modal.style.display = 'flex';
  },

  hideSoundSettings() {
    console.log('🔊 [Widget] Hiding sound settings');
    const modal = this.dialog.querySelector('.pingbash-sound-popup');
    modal.style.display = 'none';
  },

  // Menu actions
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
        this.showIPBans();
        break;
      case 'chat-rules':
        this.showChatRules();
        break;
      case 'settings':
        this.showSoundSettings();
        break;
      case 'close':
        this.closeDialog();
        break;
      default:
        console.log('🍔 [Widget] Unknown menu action:', action);
    }

    // Hide hamburger dropdown
    const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  },

  showGroupInfo() {
    console.log('ℹ️ [Widget] Showing group info for:', this.config.groupName);
    // TODO: Implement group info modal
  },

  showMembers() {
    console.log('👥 [Widget] Showing group members');
    // TODO: Implement members modal
  },

  showBannedUsers() {
    console.log('🚫 [Widget] Showing banned users');
    if (!this.socket || !this.isConnected) return;

    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }

    // TODO: Implement banned users modal
    this.showError('Banned users feature not yet implemented');
  },

  showIPBans() {
    console.log('🚫 [Widget] Showing IP bans');
    if (!this.socket || !this.isConnected) return;

    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }

    // TODO: Implement IP bans modal
    this.showError('IP bans feature not yet implemented');
  }
}); 