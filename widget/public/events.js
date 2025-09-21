/**
 * Pingbash Chat Widget - Events Module
 * Event listeners and user interactions
 */

// Extend the PingbashChatWidget class with event handling methods
Object.assign(PingbashChatWidget.prototype, {
  attachEventListeners() {
    console.log('🎯 [Widget] Attaching event listeners...');

    // Chat button toggle
    this.button.addEventListener('click', () => {
      console.log('🎯 [Widget] Chat button clicked');
      this.toggleDialog();
    });

    // Close dialog when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.dialog.contains(e.target) && !this.button.contains(e.target)) {
        this.closeDialog();
      }
    });

    // Message input and send button
    const input = this.dialog.querySelector('#pingbash-message-input');
    const sendBtn = this.dialog.querySelector('.pingbash-send-btn');

    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    input?.addEventListener('input', (e) => {
      const hasText = e.target.value.trim().length > 0;
      sendBtn.disabled = !hasText;

      // Check for @ mention
      const text = e.target.value;
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1 && lastAtIndex === cursorPos - 1) {
        // User just typed @
        this.showMentionPicker();
      }
    });

    sendBtn?.addEventListener('click', () => {
      this.handleSendMessage();
    });

    // Logo click to create group
    const logo = this.dialog.querySelector('.pingbash-logo');
    console.log('🔍 [Widget] Logo element found:', !!logo, logo);
    
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.style.transition = 'opacity 0.2s';
      
      logo.addEventListener('click', (e) => {
        console.log('🔍 [Widget] Logo clicked - opening create new group modal');
        console.log('🔍 [Widget] Event details:', e);
        e.preventDefault();
        e.stopPropagation();
        this.showGroupCreationModal();
      });
      
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

    // Online users icon click
    const onlineUsersContainer = this.dialog.querySelector('.pingbash-online-users-container');
    onlineUsersContainer?.addEventListener('click', () => {
      console.log('👥 [Widget] Online users icon clicked');
      this.showOnlineUsers();
    });

    // Hamburger menu
    const hamburgerBtn = this.dialog.querySelector('.pingbash-hamburger-btn');
    const hamburgerDropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');

    hamburgerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = hamburgerDropdown.style.display === 'block';
      hamburgerDropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Menu items
    const menuItems = this.dialog.querySelectorAll('.pingbash-menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        this.handleMenuAction(action);
      });
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn?.contains(e.target) && !hamburgerDropdown?.contains(e.target)) {
        hamburgerDropdown.style.display = 'none';
      }
    });

    // Event delegation for Reply buttons (handles dynamically added messages)
    this.dialog.querySelector('#pingbash-messages')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('pingbash-message-reply')) {
        const messageId = e.target.getAttribute('data-message-id');
        const senderName = e.target.getAttribute('data-sender-name');
        
        // Find the message content from the messages array instead of data attribute
        const message = this.messages?.find(msg => msg.Id == messageId);
        const messageContent = message ? message.Content : '';
        
        console.log('💬 [Widget] Reply button clicked for message:', messageId);
        this.replyToMessage(messageId, senderName, messageContent);
      }
    });

    // Reply preview close button event listener
    const replyCloseBtn = this.dialog.querySelector('.pingbash-reply-preview-close');
    replyCloseBtn?.addEventListener('click', () => {
      console.log('💬 [Widget] Reply preview close button clicked');
      this.hideReplyPreview();
    });

    // Media buttons
    const imageBtn = this.dialog.querySelector('.pingbash-image-btn');
    const fileBtn = this.dialog.querySelector('.pingbash-file-btn');
    const emojiBtn = this.dialog.querySelector('.pingbash-emoji-btn');
    const soundBtn = this.dialog.querySelector('.pingbash-sound-btn');

    imageBtn?.addEventListener('click', () => {
      console.log('📷 [Widget] Image upload clicked');
      this.handleImageUpload();
    });

    fileBtn?.addEventListener('click', () => {
      console.log('📎 [Widget] File upload clicked');
      this.handleFileUpload();
    });

    emojiBtn?.addEventListener('click', () => {
      console.log('😀 [Widget] Emoji button clicked');
      this.showEmojiPicker();
    });

    soundBtn?.addEventListener('click', () => {
      console.log('🔊 [Widget] Sound button clicked');
      this.showSoundSettings();
    });

    // Sign-in modal events
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

    signinCloseBtn?.addEventListener('click', () => this.hideSigninModal());
    signinSubmitBtn?.addEventListener('click', () => this.handleSignin());
    signinOverlay?.addEventListener('click', () => this.hideSigninModal());

    // Handle Continue as Anonymous buttons
    continueAnonBtns.forEach((btn, index) => {
      console.log('🔍 [Widget] Button', index + 1, 'properties:', {
        tagName: btn.tagName,
        className: btn.className,
        disabled: btn.disabled,
        style: btn.style.cssText,
        offsetWidth: btn.offsetWidth,
        offsetHeight: btn.offsetHeight,
        clientWidth: btn.clientWidth,
        clientHeight: btn.clientHeight
      });

      btn.addEventListener('click', (e) => {
        console.log('🔍 [Widget] Click event details:', {
          target: e.target,
          currentTarget: e.currentTarget,
          type: e.type
        });
        this.handleContinueAsAnonymous();
      });
    });

    // Sign-in form Enter key
    const emailInput = this.dialog.querySelector('#signin-email');
    const passwordInput = this.dialog.querySelector('#signin-password');

    emailInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        passwordInput?.focus();
      }
    });

    passwordInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSignin();
      }
    });

    // Sound settings modal
    const soundPopup = this.dialog.querySelector('.pingbash-sound-popup');
    const soundCloseBtn = soundPopup?.querySelector('.pingbash-popup-close');
    const soundOkBtn = this.dialog.querySelector('.pingbash-sound-ok-btn');
    const soundOverlay = soundPopup?.querySelector('.pingbash-popup-overlay');

    soundCloseBtn?.addEventListener('click', () => this.hideSoundSettings());
    soundOkBtn?.addEventListener('click', () => this.hideSoundSettings());
    soundOverlay?.addEventListener('click', () => this.hideSoundSettings());

    // Chat rules modal
    const chatRulesPopup = this.dialog.querySelector('.pingbash-chat-rules-popup');
    const chatRulesCloseBtn = chatRulesPopup?.querySelector('.pingbash-popup-close');
    const rulesCloseBtn = this.dialog.querySelector('.pingbash-rules-close-btn');
    const rulesEditBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
    const rulesCancelBtn = this.dialog.querySelector('.pingbash-rules-cancel-btn');
    const rulesSaveBtn = this.dialog.querySelector('.pingbash-rules-save-btn');
    const chatRulesOverlay = chatRulesPopup?.querySelector('.pingbash-popup-overlay');

    chatRulesCloseBtn?.addEventListener('click', () => this.hideChatRules());
    rulesCloseBtn?.addEventListener('click', () => this.hideChatRules());
    rulesEditBtn?.addEventListener('click', () => this.editChatRules());
    rulesCancelBtn?.addEventListener('click', () => this.cancelEditChatRules());
    rulesSaveBtn?.addEventListener('click', () => this.saveChatRules());
    chatRulesOverlay?.addEventListener('click', () => this.hideChatRules());

    // Group creation modal
    const groupCreationModal = this.dialog.querySelector('.pingbash-group-creation-modal');
    const groupCreationCloseBtn = groupCreationModal?.querySelector('.pingbash-popup-close');
    const groupCancelBtn = this.dialog.querySelector('.pingbash-group-cancel-btn');
    const groupCreateBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    const groupCreationOverlay = groupCreationModal?.querySelector('.pingbash-popup-overlay');
    
    groupCreationCloseBtn?.addEventListener('click', () => this.hideGroupCreationModal());
    groupCancelBtn?.addEventListener('click', () => this.hideGroupCreationModal());
    groupCreateBtn?.addEventListener('click', () => this.createNewGroup());
    groupCreationOverlay?.addEventListener('click', () => this.hideGroupCreationModal());
    
    // Group creation form interactions
    this.setupGroupCreationForm();

    // Emoji picker
    const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
    const emojiOverlay = emojiModal?.querySelector('.pingbash-popup-overlay');
    
    emojiOverlay?.addEventListener('click', () => this.hideEmojiPicker());

    // Emoji click handling with protection against multiple clicks
    let emojiClickCooldown = false;
    const emojiClickCooldownTime = 300; // 300ms cooldown

    this.dialog.querySelector('.pingbash-emoji-grid')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('pingbash-emoji')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (emojiClickCooldown) {
          console.log('😀 [Widget] Emoji click ignored due to cooldown');
          return;
        }
        
        emojiClickCooldown = true;
        setTimeout(() => {
          emojiClickCooldown = false;
        }, emojiClickCooldownTime);
        
        const emoji = e.target.getAttribute('data-emoji');
        console.log('😀 [Widget] Emoji clicked:', emoji);
        
        // Clone the element to remove all existing event listeners
        const newElement = e.target.cloneNode(true);
        e.target.parentNode.replaceChild(newElement, e.target);
        
        this.addEmoji(emoji);
      }
    });

    // Mention picker
    const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
    const mentionOverlay = mentionModal?.querySelector('.pingbash-popup-overlay');
    
    mentionOverlay?.addEventListener('click', () => this.hideMentionPicker());

    console.log('✅ [Widget] Event listeners attached successfully');
  },

  handleSendMessage() {
    const input = this.dialog.querySelector('#pingbash-message-input');
    const message = input.value.trim();
    
    if (!message) {
      console.log('📤 [Widget] Empty message, not sending');
      return;
    }
    
    console.log('📤 [Widget] Sending message:', message);
    
    // Send message with reply ID if replying
    this.sendMessage(message, this.replyingTo?.id || null);
    
    // Clear input
    input.value = '';
    
    // Clear reply state after sending
    if (this.replyingTo) {
      this.hideReplyPreview();
    }
    
    // Disable send button
    const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
    sendBtn.disabled = true;
  },

  handleImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('📷 [Widget] Image selected:', file.name);
        this.uploadAndSendFile(file);
      }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  },

  handleFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('📎 [Widget] File selected:', file.name);
        this.uploadAndSendFile(file);
      }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
}); 