/**
 * CHAT functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add chat methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - setupAutoScroll method
    setupAutoScroll() {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (!messagesList) return;
  
      // Use ResizeObserver to monitor height changes
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            // Check if we should auto-scroll (user is at bottom)
            const element = entry.target;
            const isAtBottom = element.scrollTop >= (element.scrollHeight - element.clientHeight - 50);
            
            if (isAtBottom) {
              if( window.isDebugging ) console.log('📜 [Widget] Height changed, auto-scrolling to bottom');
              this.scrollToBottom();
            }
          }
        });
        
        this.resizeObserver.observe(messagesList);
        if( window.isDebugging ) console.log('📜 [Widget] Auto-scroll monitoring enabled');
      }
  
      // Also monitor for new child elements (MutationObserver)
      if (window.MutationObserver) {
        this.mutationObserver = new MutationObserver((mutations) => {
          let shouldScroll = false;
          
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              shouldScroll = true;
            }
          });
          
          if (shouldScroll) {
            if( window.isDebugging ) console.log('📜 [Widget] New messages added, scrolling to bottom');
            this.scrollToBottomAfterImages();
          }
        });
        
        this.mutationObserver.observe(messagesList, {
          childList: true,
          subtree: true
        });
        if( window.isDebugging ) console.log('📜 [Widget] Message monitoring enabled');
      }
    },

  // EXACT COPY from widget.js - handleNewMessages method
    handleNewMessages(data) {
      if( window.isDebugging ) console.log('🔍 [Widget] handleNewMessages called with:', data?.length, 'messages');
  
      if (!data || !Array.isArray(data) || data.length === 0) {
        if( window.isDebugging ) console.log('🔍 [Widget] No new messages to process - data:', data);
        return;
      }
  
      if( window.isDebugging ) console.log('🔍 [Widget] handleNewMessages received:', data.length, 'messages');
      if( window.isDebugging ) console.log('🔍 [Widget] Current messages count:', this.messages?.length || 0);
      if( window.isDebugging ) console.log('🔍 [Widget] New message details:', data.map(msg => ({
        id: msg.Id,
        content: msg.Content,
        sender: msg.sender_name,
        group_id: msg.group_id
      })));
  
      // Check if messages belong to current group (same as W version)
      const groupId = data.length && data[data.length - 1].group_id;
      if( window.isDebugging ) console.log('🔍 [Widget] Message group ID:', groupId, 'Current group ID:', this.groupId);
      if( window.isDebugging ) console.log('🔍 [Widget] Group ID match:', groupId === this.groupId);
  
      if (groupId === this.groupId) {
        if( window.isDebugging ) console.log('🔍 [Widget] ✅ Messages for current group');
        if( window.isDebugging ) console.log('🔍 [Widget] Page visible:', this.pageVisible);
  
        if (this.pageVisible) {
          if( window.isDebugging ) console.log('🔍 [Widget] Page visible - adding messages immediately');
          if( window.isDebugging ) console.log('🔍 [Widget] Before processing - existing:', this.messages?.length || 0, 'new:', data.length);
  
          // Don't merge here - let displayMessages handle the logic
          this.displayMessages(data);
  
          if( window.isDebugging ) console.log('🔍 [Widget] ✅ Messages updated and displayed immediately');
        } else {
          if( window.isDebugging ) console.log('🔍 [Widget] Page hidden - queuing messages for later');
          // Queue messages for when page becomes visible (same as W version)
          this.pendingMessages = this.mergeArrays(this.pendingMessages, data);
          if( window.isDebugging ) console.log('🔍 [Widget] Queued messages - pending count:', this.pendingMessages.length);
          if( window.isDebugging ) console.log('🔍 [Widget] Latest queued message ID:', this.pendingMessages[this.pendingMessages.length - 1]?.Id);
        }
      } else {
        if( window.isDebugging ) console.log('🔍 [Widget] ❌ Messages not for current group, ignoring');
      }
    },

  // EXACT COPY from widget.js - mergeArrays method
    mergeArrays(oldArray, newArray) {
      const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
      for (const newItem of newArray) {
        oldMap.set(newItem?.Id, newItem); // updates existing or adds new
      }
      return Array.from(oldMap.values());
    },

  // EXACT COPY from widget.js - displayMessages method
    displayMessages(messages) {
      const allMessages = messages || [];
      const messagesList = this.dialog.querySelector('#pingbash-messages');
  
      if( window.isDebugging ) console.log('🔍 [Widget] displayMessages called with', allMessages.length, 'messages');
      
      // First, filter out Mods mode messages for regular users (in ALL modes)
      let preFilteredMessages = allMessages;
      if (!this.isModeratorOrAdmin()) {
        // Regular users should NEVER see messages sent in Mods mode (receiver_id = specific moderator/admin)
        const beforeModsFilter = preFilteredMessages.length;
        preFilteredMessages = preFilteredMessages.filter(msg => {
          // Keep public messages (receiver_id = null) and messages sent to current user
          const currentUserId = this.getCurrentUserId();
          const isPublic = msg.Receiver_Id == null;
          const isToCurrentUser = msg.Receiver_Id == currentUserId;
          const isOwnMessage = msg.Sender_Id == currentUserId;
          
          // Hide messages that were sent in Mods mode (to specific moderators/admins) unless it's to current user
          return isPublic || isToCurrentUser || isOwnMessage;
        });
        if( window.isDebugging ) console.log('📋 [Widget] Filtered out Mods mode messages for regular user:', beforeModsFilter - preFilteredMessages.length, 'removed');
      }
      
      // Apply Chat Mode filter (same as F version)
      let filteredMessages = this.applyFilterMode(preFilteredMessages);
      if( window.isDebugging ) console.log('🔍 [Widget] After filter mode:', filteredMessages.length, 'messages (mode:', this.filterMode || 0, ')');
      
      // Filter out messages from blocked users
      if (this.blockedUsers && this.blockedUsers.size > 0) {
        const beforeBlockFilter = filteredMessages.length;
        filteredMessages = filteredMessages.filter(message => !this.isMessageFromBlockedUser(message));
        if( window.isDebugging ) console.log('🚫 [Widget] After blocked user filter:', filteredMessages.length, 'messages (filtered out:', beforeBlockFilter - filteredMessages.length, ')');
      }
      
      const newMessages = filteredMessages;
  
      if (!newMessages.length) {
        messagesList.innerHTML = `
          <div class="pingbash-loading">
            Welcome to ${this.config.groupName}!<br>
            Start the conversation...
          </div>
        `;
        this.messages = [];
        return;
      }
  
      // Check if this is initial load
      const isInitialLoad = !this.messages || this.messages.length === 0;
  
      if (isInitialLoad) {
        // Initial load - clear and render all messages
        if( window.isDebugging ) console.log('🔍 [Widget] Initial load - rendering', newMessages.length, 'messages');
        messagesList.innerHTML = '';
        this.messages = newMessages;
        newMessages.forEach(msg => this.addMessage(msg));
      } else {
        // Quick check: if we have the same number of messages and the last message ID matches, skip
        if (this.messages && this.messages.length === newMessages.length) {
          const lastExistingId = this.messages[this.messages.length - 1]?.Id;
          const lastNewId = newMessages[newMessages.length - 1]?.Id;
          if( window.isDebugging ) console.log('🔍 [Widget] Comparing message sets - existing:', this.messages.length, 'new:', newMessages.length);
          if( window.isDebugging ) console.log('🔍 [Widget] Last existing ID:', lastExistingId, 'Last new ID:', lastNewId);
  
          // Debug: Show last few message IDs from both sets
          const lastFewExisting = this.messages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
          const lastFewNew = newMessages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
          if( window.isDebugging ) console.log('🔍 [Widget] Last few existing messages:', lastFewExisting);
          if( window.isDebugging ) console.log('🔍 [Widget] Last few new messages:', lastFewNew);
  
          if (lastExistingId === lastNewId) {
            if( window.isDebugging ) console.log('🔍 [Widget] Same message set received, skipping processing');
            return;
          } else {
            if( window.isDebugging ) console.log('🔍 [Widget] Different last message ID, proceeding with update');
          }
        }
  
        // Smart append - only add messages that don't exist in DOM
        if( window.isDebugging ) console.log('🔍 [Widget] Smart append - checking for new messages');
  
        // Get existing message IDs from DOM (more reliable than stored array)
        const existingDomIds = new Set();
        messagesList.querySelectorAll('[data-message-id]').forEach(el => {
          existingDomIds.add(parseInt(el.getAttribute('data-message-id')));
        });
  
        // Find truly new messages
        const messagesToAdd = newMessages.filter(msg => !existingDomIds.has(msg.Id));
  
        if( window.isDebugging ) console.log('🔍 [Widget] DOM has', existingDomIds.size, 'messages, received', newMessages.length, 'messages');
        if( window.isDebugging ) console.log('🔍 [Widget] Found', messagesToAdd.length, 'new messages to append');
  
        if (messagesToAdd.length > 0) {
          // Append only new messages (no clearing!)
          messagesToAdd.forEach(msg => {
            if( window.isDebugging ) console.log('🔍 [Widget] Adding new message:', msg.Id, msg.Content?.substring(0, 20) + '...');
            this.addMessage(msg, true); // Pass true to indicate this is a new message
          });
  
          // Update stored messages
          this.messages = newMessages;
  
          if( window.isDebugging ) console.log('🔍 [Widget] ✅ Appended', messagesToAdd.length, 'new messages without blinking');
          this.scrollToBottomAfterImages();
        } else {
          if( window.isDebugging ) console.log('🔍 [Widget] No new messages to add');
        }
      }
  
      // Only scroll for initial load
      if (isInitialLoad) {
        this.scrollToBottomAfterImages();
      }
    },

  // EXACT COPY from widget.js - displayPendingMessages method
    displayPendingMessages(messages) {
      // Special method for displaying pending messages - bypasses optimization checks
      if( window.isDebugging ) console.log('🔍 [Widget] displayPendingMessages called with', messages.length, 'messages');
  
      const messagesList = this.dialog.querySelector('#pingbash-messages');
      const newMessages = messages || [];
  
      if (!newMessages.length) {
        return;
      }
  
      // Get existing message IDs from DOM
      const existingDomIds = new Set();
      messagesList.querySelectorAll('[data-message-id]').forEach(el => {
        existingDomIds.add(parseInt(el.getAttribute('data-message-id')));
      });
  
      // Find messages that aren't in DOM yet
      const messagesToAdd = newMessages.filter(msg => !existingDomIds.has(msg.Id));
  
      if( window.isDebugging ) console.log('🔍 [Widget] Pending messages - DOM has', existingDomIds.size, 'messages');
      if( window.isDebugging ) console.log('🔍 [Widget] Pending messages - found', messagesToAdd.length, 'new messages to add');
  
      if (messagesToAdd.length > 0) {
        // Add new messages with animation
        messagesToAdd.forEach(msg => {
          if( window.isDebugging ) console.log('🔍 [Widget] Adding pending message:', msg.Id, msg.Content?.substring(0, 20) + '...');
          this.addMessage(msg, true); // Mark as new for animation
        });
  
        if( window.isDebugging ) console.log('🔍 [Widget] ✅ Added', messagesToAdd.length, 'pending messages');
        this.scrollToBottomAfterImages();
      }
  
      // Update stored messages
      this.messages = newMessages;
    },

  // EXACT COPY from widget.js - addMessage method
    addMessage(message, isNewMessage = false) {
      if( window.isDebugging ) console.log('🔍 [Widget] addMessage called for message ID:', message.Id, 'Content:', message.Content, 'isNew:', isNewMessage);
      const messagesList = this.dialog.querySelector('#pingbash-messages');
  
      if (!messagesList) {
        console.error('🔍 [Widget] ERROR: Messages list element not found!');
        return;
      }
  
      // Check if message already exists to prevent duplicates
      const existingMessage = messagesList.querySelector(`[data-message-id="${message.Id}"]`);
      if (existingMessage) {
        if( window.isDebugging ) console.log('🔍 [Widget] Message', message.Id, 'already exists in DOM, skipping');
        return;
      }
  
      // Determine if this is our own message (same logic as W version)
      let isOwn = false;
      if (this.isAuthenticated) {
        // For authenticated users, compare with currentUserId (the actual user ID number)
        // Ensure both are numbers for proper comparison
        const senderId = parseInt(message.Sender_Id);
        const currentUserId = parseInt(this.currentUserId);
        isOwn = senderId === currentUserId;
      } else {
        // For anonymous users, compare with anonId
        // Ensure both are numbers for proper comparison
        const senderId = parseInt(message.Sender_Id);
        const anonId = parseInt(this.anonId);
        isOwn = senderId === anonId;
      }
  
      if( window.isDebugging ) console.log('🔍 [Widget] Message ownership check:', {
        rawSenderId: message.Sender_Id,
        parsedSenderId: parseInt(message.Sender_Id),
        rawCurrentUserId: this.currentUserId,
        parsedCurrentUserId: parseInt(this.currentUserId),
        rawAnonId: this.anonId,
        parsedAnonId: parseInt(this.anonId),
        isAuthenticated: this.isAuthenticated,
        isOwn: isOwn,
        senderName: message.sender_name
      });
  
      const messageEl = document.createElement('div');
      messageEl.className = `pingbash-message ${isOwn ? 'own' : ''} ${isNewMessage ? 'new-message' : ''}`;
      messageEl.setAttribute('data-message-id', message.Id);
  
      if( window.isDebugging ) console.log('🔍 [Widget] Creating message element with class:', messageEl.className, 'ID:', message.Id);
  
      const time = new Date(message.Send_Time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
  
      // Format sender name same as F version
      let senderName;
      if (message.Sender_Id && message.Sender_Id > 100000) {
        // Anonymous user - show as anon + last 3 digits (same as F version)
        senderName = "anon" + String(message.Sender_Id).slice(-3);
        if( window.isDebugging ) console.log(`🔍 [Widget] Anonymous user ${message.Sender_Id} displayed as: ${senderName}`);
      } else {
        // Regular user - use sender_name or fallback
        senderName = message.sender_name || 'Anonymous';
        if( window.isDebugging ) console.log(`🔍 [Widget] Regular user ${message.Sender_Id} displayed as: ${senderName}`);
      }
      if( window.isDebugging ) console.log('🔍 [Widget] Message content:', message.Content);
      const escapedContent = this.escapeForAttribute(message.Content);
      // Generate avatar HTML (same as W version)
      const avatarHtml = this.generateAvatarHtml(message, senderName);
      if( window.isDebugging ) console.log("******************************", message.Content);
      if( window.isDebugging ) console.log("******************************", escapedContent);
      if( window.isDebugging ) console.log("******************************", this.renderMessageContent(message.Content));
      messageEl.innerHTML = `
        <div class="pingbash-message-content">
          ${avatarHtml}
          <div class="pingbash-message-body">
            ${message.parent_id ? this.renderReplyIndicator(message.parent_id) : ''}
            <div class="pingbash-message-header">
              <span class="pingbash-message-sender">${senderName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              ${this.getFilterModeText(message)}
              <span class="pingbash-message-time">${time}</span>
              <div class="pingbash-message-buttons">
                ${this.getMessageActionButtons(message, isOwn)}
                ${this.canPinMessages() ? `
                  <button class="pingbash-message-action pin" onclick="window.pingbashWidget.${this.isPinnedMessage(message.Id) ? 'unpinMessage' : 'pinMessage'}(${message.Id})" title="${this.isPinnedMessage(message.Id) ? 'Unpin Message' : 'Pin Message'}">${this.isPinnedMessage(message.Id) ? '📌' : '📍'}</button>
                ` : ''}
                <button class="pingbash-message-reply" onclick="window.pingbashWidget.replyToMessage(${message.Id}, '${senderName.replace(/'/g, "\\'")}', '${escapedContent}')" title="Reply">↩️</button>
              </div>
            </div>
            <div class="pingbash-message-text">${this.renderMessageContent(message.Content)}</div>
          </div>
        </div>
      `;
  
  
            messagesList.appendChild(messageEl);
      if( window.isDebugging ) console.log('🔍 [Widget] ✅ Message element appended to DOM, total messages now:', messagesList.children.length);

      // Apply current group styling to the new message
      if (this.group) {
        this.applyStyleToMessage(messageEl, this.group, isOwn);
      }

      // Remove animation class after animation completes
      if (isNewMessage) {
        setTimeout(() => {
          messageEl.classList.remove('new-message');
        }, 300); // Match animation duration
      }
    },

    // NEW METHOD - Apply styling to individual message element
    applyStyleToMessage(messageEl, groupData, isOwn) {
      if (!messageEl || !groupData) return;
      
      // Apply message background color
      if (isOwn && groupData.reply_msg_color) {
        // User's own messages - use reply message color
        //messageEl.style.backgroundColor = groupData.reply_msg_color;
      } else if (!isOwn && groupData.msg_bg_color) {
        // Other users' messages - use message background color
        //messageEl.style.backgroundColor = groupData.msg_bg_color;
      }
      
      // Apply text color
      if (groupData.msg_txt_color) {
        messageEl.style.color = groupData.msg_txt_color;
        const messageContent = messageEl.querySelector('.pingbash-message-content, .pingbash-message-text');
        if (messageContent) messageContent.style.color = groupData.msg_txt_color;
      }
      
      // Apply font size
      if (groupData.custom_font_size && groupData.font_size) {
        messageEl.style.fontSize = groupData.font_size + 'px';
      }
      
      // Apply border radius
      if (groupData.round_corners && groupData.corner_radius) {
        messageEl.style.borderRadius = Math.min(groupData.corner_radius, 16) + 'px';
      }
      
      // Apply date/time color
      const timeElement = messageEl.querySelector('.pingbash-message-time');
      if (timeElement && groupData.msg_date_color) {
        timeElement.style.color = groupData.msg_date_color;
      }
      
      // Handle avatar visibility
      const avatar = messageEl.querySelector('.pingbash-message-avatar, .pingbash-avatar');
      if (avatar) {
        avatar.style.display = groupData.show_user_img !== false ? 'block' : 'none';
      }
      
      if( window.isDebugging ) console.log('🎨 [Widget] Applied styling to new message:', messageEl.getAttribute('data-message-id'));
    },

    // NEW METHOD - Generate avatar HTML (same as W version)
    generateAvatarHtml(message, senderName) {
      // Check if avatars should be shown (from group settings)
      const showAvatars = this.shouldShowAvatars();
      
      if (!showAvatars) {
        return '';
      }

      const avatarUrl = this.getAvatarUrl(message);
      const firstChar = this.getNameFirstChar(senderName);
      const avatarColor = this.getAvatarColor(senderName);

      if (avatarUrl) {
        // Show profile image
        return `
          <div class="pingbash-message-avatar">
            <img src="${avatarUrl}" 
                 alt="${senderName}" 
                 class="pingbash-avatar-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="pingbash-avatar-fallback" style="display: none; background-color: ${avatarColor};">
              ${firstChar}
            </div>
          </div>
        `;
      } else {
        // Show first character fallback
        return `
          <div class="pingbash-message-avatar">
            <div class="pingbash-avatar-fallback" style="background-color: ${avatarColor};">
              ${firstChar}
            </div>
          </div>
        `;
      }
    },

    // NEW METHOD - Check if avatars should be shown
    shouldShowAvatars() {
      // Check CSS variable or default to true
      const messagesArea = document.querySelector('.pingbash-messages-area');
      if (messagesArea) {
        const showAvatars = getComputedStyle(messagesArea).getPropertyValue('--show-avatars').trim();
        return showAvatars !== 'none';
      }
      return true; // Default to showing avatars
    },

    // NEW METHOD - Get avatar URL (same as W version)
    getAvatarUrl(message) {
      if (message.sender_avatar) {
        // Same format as W version: SERVER_URL/uploads/users/filename
        const apiUrl = this.config?.apiUrl || 'https://pingbash.com';
        return `${apiUrl}/uploads/users/${message.sender_avatar}`;
      }
      return null;
    },

    // NEW METHOD - Get first character of name
    getNameFirstChar(senderName) {
      if (!senderName) return 'A';
      
      // For anonymous users (anon123), use 'A'
      if (senderName.startsWith('anon')) {
        return 'A';
      }
      
      // For regular names, get first character
      return senderName.charAt(0).toUpperCase();
    },

    // NEW METHOD - Get avatar background color (same as W version)
    getAvatarColor(senderName) {
      const colors = [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#6366F1'  // indigo
      ];
      
      // Use name length to determine color (same as W version)
      const colorIndex = (senderName?.length || 0) % colors.length;
      return colors[colorIndex];
    },

  // EXACT COPY from widget.js - escapeHtml method
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // CENSORED CONTENT FILTERING - Same as F version
    getCensoredWordArray(censoredStr) {
      if (!censoredStr || typeof censoredStr !== 'string') {
        return [];
      }
      return censoredStr.split(',').map(item => item.trim()).filter(item => item.length > 0);
    },

    getCensoredMessage(message, unallowedWords) {
      if (!message || !unallowedWords || unallowedWords.length === 0) {
        return message;
      }

      // Create a regex pattern to match any of the unallowed words (case-insensitive, word-boundary-safe)
      const pattern = new RegExp(`\\b(${unallowedWords.join('|')})\\b`, 'gi');

      // Replace matched word with asterisks of same length
      return message.replace(pattern, (match) => '*'.repeat(match.length));
    },

    applyCensoringToMessage(message) {
      if (!message || !this.group?.censored_words) {
        return message;
      }

      if( window.isDebugging ) console.log('🔍 [Widget] Applying censoring to message');
      const censoredWords = this.getCensoredWordArray(this.group.censored_words);
      
      if (censoredWords.length === 0) {
        return message;
      }

      const censoredMessage = this.getCensoredMessage(message, censoredWords);
      
      if (censoredMessage !== message) {
        if( window.isDebugging ) console.log('🔍 [Widget] Message censored:', { 
          original: message, 
          censored: censoredMessage,
          censoredWords: censoredWords 
        });
      }

      return censoredMessage;
    },

    // MESSAGE ACTION BUTTONS - Based on F version permission logic (CORRECTED)
    getMessageActionButtons(message, isOwn) {
      if (isOwn) {
        return ''; // No action buttons for own messages
      }

      const currentUserId = this.getCurrentUserId();
      const senderInfo = this.group?.members?.find(user => user.id === message.Sender_Id);
      const myMemInfo = this.group?.members?.find(user => user.id === currentUserId);

      // Don't show actions for messages from admins/mods
      if (senderInfo?.role_id === 1 || senderInfo?.role_id === 2) {
        return '';
      }

      let actions = [];

      // ANONYMOUS USERS: No moderation actions at all
      if (!this.isAuthenticated) {
        if( window.isDebugging ) console.log('🔍 [Widget] Anonymous user - hiding all moderation actions');
        return '';
      }

      // AUTHENTICATED REGULAR USERS (not mods/admins)
      // Block button: Show for regular users against other regular users (F version line 191-194)
      if (myMemInfo?.role_id !== 1 && myMemInfo?.role_id !== 2 && senderInfo?.role_id !== 1 && senderInfo?.role_id !== 2 && senderInfo?.id !== currentUserId) {
        actions.push(`<button class="pingbash-message-action block" onclick="window.pingbashWidget.blockUser(${message.Sender_Id})" title="Block User">🚫</button>`);
      }

      // TIMEOUT PERMISSION: Only Group creator can timeout users (backend restriction)
      // But NOT against other mods/admins and NOT if target is already timed out
      if ((this.group?.creater_id === currentUserId) && senderInfo?.role_id !== 1 && senderInfo?.role_id !== 2 && !senderInfo?.is_timed_out) {
        actions.push(`<button class="pingbash-message-action timeout" onclick="window.pingbashWidget.timeoutUser(${message.Sender_Id})" title="Timeout User">⏰</button>`);
      }

      // BAN PERMISSION: Group creator OR moderators with ban_user permission - F version line 198 + ban_user flag
      if ((this.group?.creater_id === currentUserId || (myMemInfo?.role_id === 2 && myMemInfo?.ban_user === true)) && senderInfo?.role_id !== 1 && senderInfo?.role_id !== 2) {
        actions.push(`<button class="pingbash-message-action ban" onclick="window.pingbashWidget.banUser(${message.Sender_Id})" title="Ban User">⛔</button>`);
      }

      if( window.isDebugging ) console.log('🔍 [Widget] Message actions for user', message.Sender_Id, ':', {
        isAuth: this.isAuthenticated,
        myRole: myMemInfo?.role_id,
        isCreator: this.group?.creater_id === currentUserId,
        banPerm: myMemInfo?.ban_user,
        senderRole: senderInfo?.role_id,
        actions: actions.length
      });
      
      return actions.join('');
    },

  // EXACT COPY from widget.js - getReplyContentPreview method
    getReplyContentPreview(content) {
      if (!content) return '';
  
      // Handle images
      if (content.includes('<img')) {
        return `<div style="width:40px; height:40px;">${content.replaceAll('<img', '<img style="width:40px; height:40px;')}</div>`;
      }
  
      // Handle files
      if (content.includes('<a') && content.includes('File Name')) {
        return content;
      }
  
      // Handle regular text - strip HTML and limit length
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
    },

  // EXACT COPY from widget.js - makeTextSafe method
    makeTextSafe(str) {
      return str ? str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : "";
    },

  // EXACT COPY from widget.js - renderMessageContent method
    renderMessageContent(content) {
      if (!content) return '';
  
      if( window.isDebugging ) console.log('🖼️ [Widget] renderMessageContent called with:', {
        content: content,
        contentType: typeof content,
        contentLength: content.length,
        hasImg: content.includes('<img'),
        hasLink: content.includes('<a'),
        hasGif: content.includes('gif::'),
        hasSticker: content.includes('sticker::'),
        hasDirectGif: content.includes('.gif') && content.includes('https://') && !content.includes(' ')
      });
      if( window.isDebugging ) console.log("******************************", content, content.includes('<img'), content.includes('<a'), content.includes('gif::'), content.includes('sticker::'), content.includes('.gif') && content.includes('https://') && !content.includes(' '));
      // Check if content contains HTML tags (images, links, etc.)
      if (content.includes('<img') || content.includes('<a') || content.includes('gif::') || content.includes('sticker::')) {
        if( window.isDebugging ) console.log('🖼️ [Widget] Detected HTML/special content, processing...');
  
        // Handle different content types (same as W version)
        if (content.includes('<img')) {
          if( window.isDebugging ) console.log('🖼️ [Widget] Processing <img> tag content:', content);
          // Image content - render as HTML
          return content;
        } else if (content.includes('gif::https://')) {
          if( window.isDebugging ) console.log('🖼️ [Widget] Processing gif:: content');
          // GIF content
          const gifUrl = content.slice('gif::'.length);
          const result = `<img src="${gifUrl}" style="width: 160px;" />`;
          if( window.isDebugging ) console.log('🖼️ [Widget] Created gif HTML:', result);
          return result;
        } else if (content.includes('sticker::')) {
          if( window.isDebugging ) console.log('🖼️ [Widget] Processing sticker:: content');
          // Sticker content (would need Lottie implementation)
          const result = `<div>🎭 Sticker: ${content.slice('sticker::'.length)}</div>`;
          if( window.isDebugging ) console.log('🖼️ [Widget] Created sticker HTML:', result);
          return result;
        } else if (content.includes('.gif') && content.includes('https://') && !content.includes(' ')) {
          if( window.isDebugging ) console.log('🖼️ [Widget] Processing direct GIF URL');
          // Direct GIF URL
          const result = `<img src="${content}" style="width: 160px;" />`;
          if( window.isDebugging ) console.log('🖼️ [Widget] Created direct GIF HTML:', result);
          return result;
        } else {
          if( window.isDebugging ) console.log('🖼️ [Widget] Processing other HTML content');
          // Other HTML content
          return content;
        }
      } else {
        if( window.isDebugging ) console.log('🖼️ [Widget] Processing plain text content');
        // Plain text - escape HTML and convert URLs to links
        const escaped = this.escapeHtml(content);
        const result = escaped.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #000000; text-decoration: underline;">$1</a>'
        );
        if( window.isDebugging ) console.log('🖼️ [Widget] Plain text result:', result);
        return result;
      }
    },

  // EXACT COPY from widget.js - scrollToBottom method
    scrollToBottom() {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        const messagesList = this.dialog.querySelector('.pingbash-messages-list');
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight;
          if( window.isDebugging ) console.log('📜 [Widget] Scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
        }
      });
    },

  // EXACT COPY from widget.js - forceScrollToBottom method
    forceScrollToBottom() {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
        if( window.isDebugging ) console.log('📜 [Widget] Force scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
      }
    },

  // EXACT COPY from widget.js - scrollToBottomAfterImages method
    scrollToBottomAfterImages() {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (!messagesList) return;
  
      // FIRST: Scroll immediately to current height
      this.forceScrollToBottom();
  
      // THEN: Set up monitoring for image loading
      const images = messagesList.querySelectorAll('img');
      if( window.isDebugging ) console.log('📜 [Widget] Found', images.length, 'images to monitor');
  
      if (images.length === 0) {
        // No images, we're done
        return;
      }
  
      let loadedImages = 0;
      const totalImages = images.length;
  
      const checkAllLoaded = () => {
        loadedImages++;
        if( window.isDebugging ) console.log('📜 [Widget] Image loaded:', loadedImages, '/', totalImages);
        // Scroll after each image loads (not just when all are loaded)
        this.scrollToBottom();
        
        if (loadedImages >= totalImages) {
          if( window.isDebugging ) console.log('📜 [Widget] All images loaded, final scroll');
          // Final scroll after all images are loaded
          setTimeout(() => this.scrollToBottom(), 100);
        }
      };
  
      // Set up load listeners for each image
      images.forEach((img, index) => {
        if (img.complete) {
          // Image already loaded
          if( window.isDebugging ) console.log('📜 [Widget] Image', index, 'already loaded');
          checkAllLoaded();
        } else {
          // Wait for image to load
          img.addEventListener('load', checkAllLoaded, { once: true });
          img.addEventListener('error', checkAllLoaded, { once: true }); // Also scroll on error
        }
      });
  
      // Fallback: scroll after 2 seconds even if images haven't loaded
      setTimeout(() => {
        this.scrollToBottom();
      }, 2000);
    },

  // EXACT COPY from widget.js - showError method
    showError(message) {
      const messagesList = this.dialog.querySelector('#pingbash-messages');
      const errorEl = document.createElement('div');
      errorEl.className = 'pingbash-error';
      errorEl.textContent = message;

      // Check if the last child is an error with the same message
      const lastChild = messagesList.lastElementChild;
      if (
        lastChild &&
        lastChild.classList &&
        lastChild.classList.contains('pingbash-error') &&
        lastChild.textContent === message
      ) {
        // Don't append duplicate error
        this.scrollToBottom();
        return;
      }

      //messagesList.appendChild(errorEl);
      this.scrollToBottom();
    },

  // EXACT COPY from widget.js - escapeForAttribute method
    escapeForAttribute(text) {
      if (!text) return '';
      return text.replace(/'/g, "\\'").replace(/"/g, "\\'").replace(/\n/g, ' ').replace(/\r/g, '');
    },

  // EXACT COPY from widget.js - renderReplyIndicator method
    renderReplyIndicator(parentId) {
      // Find the parent message
      const parentMessage = this.messages?.find(msg => msg.Id === parentId);
      if (!parentMessage) return '';
  
      const parentSender = parentMessage.Sender_Id > 100000
        ? "anon" + String(parentMessage.Sender_Id).slice(-3)
        : (parentMessage.sender_name || 'Anonymous');
  
      const parentContent = this.getReplyContentPreview(parentMessage.Content);
      if (parentMessage.Content.includes('<img')) {
        return `
        <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
          <div class="pingbash-reply-line"></div>
          <div class="pingbash-reply-content">
            <div class="pingbash-reply-image" style="width:40px; height:40px;">${parentContent.replaceAll('<img', '<img style="width:40px; height:40px;')}</div>
            <div>
            <div class="pingbash-reply-sender">${parentSender}</div>
            <div class="pingbash-reply-text">Photo</div>
            </div>
          </div>
        </div>
      `;
      }
  
      if (parentMessage.Content.includes('<a')) {
        return `
        <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
          <div class="pingbash-reply-line"></div>
          <div class="pingbash-reply-content">
            <div class="pingbash-reply-image" style="width:0px; height:0px;"></div>
            <div> 
            <div class="pingbash-reply-sender">${parentSender}</div>
            <div class="pingbash-reply-text">${parentContent.replaceAll('<a', '<a style=\'color: #000; text-decoration: none;\'')}</div>
            </div>
          </div>
        </div>
      `;
      }
      return `
        <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
          <div class="pingbash-reply-line"></div>
          <div class="pingbash-reply-content">
            <div class="pingbash-reply-image" style="width:0px; height:0px;"></div>
            <div>
            <div class="pingbash-reply-sender">${parentSender}</div>
            <div class="pingbash-reply-text">${parentContent}</div>
            </div>
          </div>
        </div>
      `;
    },

  // EXACT COPY from widget.js - replyToMessage method
    replyToMessage(messageId, senderName, content) {
      if( window.isDebugging ) console.log('💬 [Widget] Reply to message:', messageId, 'from:', senderName);
  
      // Set reply state
      this.replyingTo = {
        id: messageId,
        sender: senderName,
        content: content
      };
  
      // Show reply preview
      this.showReplyPreview();
  
      // Focus message input
      const messageInput = this.dialog.querySelector('#pingbash-message-input');
      if (messageInput) {
        messageInput.focus();
      }
    },

  // EXACT COPY from widget.js - showReplyPreview method
    showReplyPreview() {
      if (!this.replyingTo) return;
  
      const replyPreview = this.dialog.querySelector('.pingbash-reply-preview');
      if (replyPreview) {
        replyPreview.style.display = 'flex';
  
        const senderEl = replyPreview.querySelector('.pingbash-reply-preview-sender');
        const contentEl = replyPreview.querySelector('.pingbash-reply-preview-content');
        const imageEl = replyPreview.querySelector('.pingbash-reply-preview-image');
        const content = this.getReplyContentPreview(this.replyingTo.content);
        if (senderEl) senderEl.textContent = this.replyingTo.sender;
        if (contentEl) contentEl.textContent = this.getReplyContentPreview(this.replyingTo.content);
  
        if( window.isDebugging ) console.log("Showing reply preview", this.replyingTo);
        if (content.includes('<img')) {
          imageEl.innerHTML = content.replaceAll('<img', '<img style="width:40px; height:40px;');
          imageEl.style.display = 'block';
          imageEl.style.width = '40px';
          imageEl.style.height = '40px';
          if (contentEl) contentEl.textContent = "Photo";
        } else {
          imageEl.style.display = 'none';
          if (content.includes('<a')) {
            contentEl.innerHTML = content.replaceAll('<a', '<a style=\'color: #000; text-decoration: none;\'');
          }
          imageEl.style.width = '1px';
        }
  
      }
    },

  // EXACT COPY from widget.js - hideReplyPreview method
    hideReplyPreview() {
      if( window.isDebugging ) console.log('💬 [Widget] Hiding reply preview');
      const replyPreview = this.dialog.querySelector('.pingbash-reply-preview');
      if (replyPreview) {
        replyPreview.style.display = 'none';
        if( window.isDebugging ) console.log('💬 [Widget] Reply preview hidden successfully');
      } else {
        console.error('💬 [Widget] Reply preview element not found');
      }
      this.replyingTo = null;
    },


    // EXACT COPY from widget.js - uploadAndSendFile method
      async uploadAndSendFile(file, type) {
        if (!this.socket || !this.isConnected) {
          console.error('❌ [Widget] Socket not connected');
          return;
        }
    
        try {
          // Show upload progress
          this.showUploadProgress(file.name);
    
          // Create FormData for file upload (W version format)
          const formData = new FormData();
          if (type === 'image') {
            formData.append('Image', file);
          } else {
            formData.append('File', file);
          }
    
          // Upload file to backend using W version endpoints
          const endpoint = type === 'image'
            ? `${this.config.apiUrl}/api/private/add/chats/images`
            : `${this.config.apiUrl}/api/private/add/chats/files`;
    
          // Use the correct token based on authentication state
          const authToken = this.isAuthenticated ? this.userId : '';
          if( window.isDebugging ) console.log('📤 [Widget] Upload auth token:', authToken ? authToken.substring(0, 20) + '...' : 'none');
          if( window.isDebugging ) console.log('📤 [Widget] Is authenticated:', this.isAuthenticated);
    
          const uploadResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': authToken
            },
            body: formData
          });
    
          if( window.isDebugging ) console.log('📤 [Widget] Upload response status:', uploadResponse.status);
          if( window.isDebugging ) console.log('📤 [Widget] Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
          // Get response text first to debug JSON parsing issues
          const responseText = await uploadResponse.text();
          if( window.isDebugging ) console.log('📤 [Widget] Raw response text:', responseText);
          if( window.isDebugging ) console.log('📤 [Widget] Response text length:', responseText.length);
    
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} - ${responseText}`);
          }
    
          // Try to parse JSON
          let uploadResult;
          try {
            uploadResult = responseText;
            if( window.isDebugging ) console.log('✅ [Widget] File uploaded:', uploadResult);
          } catch (jsonError) {
            console.error('❌ [Widget] JSON parse error:', jsonError);
            console.error('❌ [Widget] Response that failed to parse:', responseText);
            throw new Error(`Invalid JSON response: ${jsonError.message}`);
          }
    
          // Send message with file reference (exact same format as W version)
          const messageContent = type === 'image'
            ? `<img src="${this.config.apiUrl}/uploads/chats/images/${uploadResult}" alt="" />`
            : `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" href="${this.config.apiUrl}/uploads/chats/files/${uploadResult}">File Name : ${uploadResult}</a>`;
    
          if( window.isDebugging ) console.log('📤 [Widget] Sending file message:', messageContent);

          // Validate message against chat limitations
          const validation = this.validateMessageBeforeSending(messageContent);
          if (!validation.valid) {
            ////alert(validation.error);
            this.hideUploadProgress();
            return;
          }
    
          // Use the same socket event format as regular messages (exact same as F version)
          const safeMessage = this.makeTextSafe(messageContent);
          if( window.isDebugging ) console.log("=========================", safeMessage);
    
          if (this.isAuthenticated && this.authenticatedToken) {
            if( window.isDebugging ) console.log('📤 [Widget] Sending authenticated file message via socket');
            if( window.isDebugging ) console.log('📤 [Widget] Socket payload:', {
              groupId: parseInt(this.groupId),
              msg: safeMessage,
              token: this.authenticatedToken ? 'present' : 'missing',
              receiverId: null,
              parent_id: null
            });
            this.socket.emit('send group msg', {
              groupId: parseInt(this.groupId),
              msg: safeMessage,
              token: this.authenticatedToken,
              receiverId: this.getCurrentReceiverId(),
              parent_id: null
            });
    
            // Listen for any error responses
            this.socket.once('error', (error) => {
              console.error('❌ [Widget] Socket error after sending file message:', error);
            });
    
            this.socket.once('forbidden', (data) => {
              console.error('❌ [Widget] Forbidden response after sending file message:', data);
            });
          } else {
            if( window.isDebugging ) console.log('📤 [Widget] Sending anonymous file message via socket');
            if( window.isDebugging ) console.log('📤 [Widget] Socket payload:', {
              groupId: parseInt(this.groupId),
              msg: safeMessage,
              anonId: this.anonId,
              receiverId: null,
              parent_id: null
            });
            this.socket.emit('send group msg anon', {
              groupId: parseInt(this.groupId),
              msg: safeMessage,
              anonId: this.anonId,
              receiverId: this.getCurrentReceiverId(),
              parent_id: null
            });
          }
    
          this.hideUploadProgress();

          // Update last message time for slow mode tracking
          this.updateLastMessageTime();
    
          // Force refresh messages after file upload to ensure it appears
          setTimeout(() => {
            if( window.isDebugging ) console.log('📤 [Widget] Force refreshing messages after file upload');
            this.socket.emit('get group msg', {
              token: this.isAuthenticated ? this.authenticatedToken : this.userId,
              groupId: parseInt(this.groupId)
            });
          }, 1000);
    
        } catch (error) {
          console.error('❌ [Widget] File upload error:', error);
          this.hideUploadProgress();
          this.showError(`Failed to upload ${type}: ${error.message}`);
        }
      },

    // EXACT COPY from widget.js - scrollToMessage method
      scrollToMessage(messageId) {
        if( window.isDebugging ) console.log('📍 [Widget] Scrolling to message:', messageId);
        const messageEl = this.dialog.querySelector(`[data-message-id="${messageId}"]`);
        if (messageEl) {
          messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
          // Highlight the message briefly
          messageEl.style.backgroundColor = '#ffeb3b33';
          setTimeout(() => {
            messageEl.style.backgroundColor = '';
          }, 2000);
        }
      },

      // Chat Mode Filter Logic (same as F version)
      applyFilterMode(messages) {
        if (!messages || !Array.isArray(messages)) {
          return [];
        }

        const filterMode = this.filterMode || 0;
        const currentUserId = this.getCurrentUserId();
        
        if( window.isDebugging ) console.log('🔍 [Widget] Applying filter mode:', filterMode, 'for user:', currentUserId);

        switch (filterMode) {
          case 0: // Public Mode - show public messages (receiver_id = null) + private messages to current user
            return messages.filter(msg => {
              const isPublic = msg.Receiver_Id == null;
              const isOwnMessage = msg.Sender_Id == currentUserId;
              const isToCurrentUser = msg.Receiver_Id == currentUserId;
              
              // 🔒 IMPORTANT: Even admins/mods should NOT see 1:1 messages between other users
              // Only show: public messages, own messages, and private messages TO current user
              const shouldShow = isPublic || isOwnMessage || isToCurrentUser;
              
              // Debug: Log filtered out private messages between other users
              if (msg.Receiver_Id && msg.Receiver_Id !== currentUserId && msg.Sender_Id !== currentUserId) {
                if( window.isDebugging ) console.log('🔒 [Widget] Hiding private message between other users (admin cannot see):', {
                  msgId: msg.Id,
                  from: msg.Sender_Id,
                  to: msg.Receiver_Id,
                  currentUser: currentUserId
                });
              }
              
              if (isToCurrentUser) {
                if( window.isDebugging ) console.log('🔍 [Widget] Private message to current user in public mode:', {
                  msgId: msg.Id,
                  from: msg.Sender_Id,
                  to: msg.Receiver_Id,
                  content: msg.Content?.substring(0, 50) + '...'
                });
              }
              return shouldShow;
            });

          case 1: // 1 on 1 Mode - show private messages with selected user + public messages
            if (!this.filteredUser) {
              if( window.isDebugging ) console.log('🔍 [Widget] 1-on-1 mode but no user selected');
              return [];
            }
            
            const selectedUserId = this.filteredUser.id;
            if( window.isDebugging ) console.log('🔍 [Widget] 1-on-1 mode with user:', selectedUserId, 'current user:', currentUserId, '(includes public messages)');
            
            return messages.filter(msg => {
              const isToSelectedUser = msg.Receiver_Id == selectedUserId && msg.Sender_Id == currentUserId;
              const isFromSelectedUser = msg.Sender_Id == selectedUserId && msg.Receiver_Id == currentUserId;
              const isPublicMessage = msg.Receiver_Id == null; // Include public messages (anonymous users)
              const isOwnMessage = msg.Sender_Id == currentUserId;
              
              // Show direct messages between users + public messages + own messages (same as F version)
              const shouldShow = isToSelectedUser || isFromSelectedUser || isPublicMessage || isOwnMessage;
              if (isToSelectedUser || isFromSelectedUser) {
                if( window.isDebugging ) console.log('🔍 [Widget] 1-on-1 private message:', {
                  msgId: msg.Id,
                  from: msg.Sender_Id,
                  to: msg.Receiver_Id,
                  content: msg.Content?.substring(0, 50) + '...'
                });
              }
              return shouldShow;
            });

          case 2: // Mods Mode - show messages to moderators/admins and public messages
            // Only available for moderators/admins (same as F version)
            if (!this.isModeratorOrAdmin()) {
              if( window.isDebugging ) console.log('🔍 [Widget] Mods mode not available for regular user');
              return messages.filter(msg => {
                const isPublic = msg.Receiver_Id == null;
                const isOwnMessage = msg.Sender_Id == currentUserId;
                return isPublic || isOwnMessage;
              });
            }
            
            return messages.filter(msg => {
              const isToCurrentUser = msg.Receiver_Id == currentUserId; // Messages sent in mods mode to this moderator/admin
              const isOwnMessage = msg.Sender_Id == currentUserId;
              const isPublic = msg.Receiver_Id == null;
              
              // 🔒 IMPORTANT: In mods mode, show:
              // - Public messages (receiver_id = null)
              // - Own messages (sent by current user)  
              // - Messages sent to current user (including mods-mode messages)
              const shouldShow = isPublic || isOwnMessage || isToCurrentUser;
              
              // Debug: Log what we're showing/hiding
              if (isToCurrentUser) {
                if( window.isDebugging ) console.log('📋 [Widget] Showing mods-mode message to current user:', {
                  msgId: msg.Id,
                  from: msg.Sender_Id,
                  to: msg.Receiver_Id,
                  content: msg.Content?.substring(0, 50) + '...'
                });
              }
              
              return shouldShow;
            });

          default:
            return messages;
        }
      },

      isModeratorOrAdmin() {
        // Check if user is moderator or admin (role_id 1 or 2) or group creator
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId || !this.group) {
          if( window.isDebugging ) console.log('🔍 [Widget] isModeratorOrAdmin: No user ID or group data', { currentUserId, hasGroup: !!this.group });
          return false;
        }
        
        // Group creator can always access moderator features
        if (this.group.creater_id === currentUserId) {
          if( window.isDebugging ) console.log('🔍 [Widget] isModeratorOrAdmin: User is group creator');
          return true;
        }
        
        // Check if user is mod/admin in group members
        const userMember = this.group.members?.find(member => member.id === currentUserId);
        const isModAdmin = userMember && (userMember.role_id === 1 || userMember.role_id === 2);
        
        if( window.isDebugging ) console.log('🔍 [Widget] isModeratorOrAdmin check:', {
          currentUserId,
          groupCreatorId: this.group.creater_id,
          userMember: userMember ? { id: userMember.id, role_id: userMember.role_id } : null,
          isModAdmin,
          totalMembers: this.group.members?.length
        });
        
        return isModAdmin;
      },

      getCurrentUserId() {
        if (this.isAuthenticated && this.currentUserId) {
          return parseInt(this.currentUserId);
        } else if (this.anonId) {
          return parseInt(this.anonId);
        }
        return null;
      },

      getFilterModeText(message) {
        // Display filter mode text on messages
        if (!message.Receiver_Id) {
          return ''; // Public message - no text needed
        }

        const currentUserId = this.getCurrentUserId();

        // Check if this is a Mods mode message
        const modAdminIds = this.getModeratorAndAdminIds();
        const isReceiverModAdmin = modAdminIds.includes(message.Receiver_Id);
        const isCurrentUserModAdmin = this.isModeratorOrAdmin();
        
        if (isReceiverModAdmin && isCurrentUserModAdmin) {
          // Additional check: see if there are other similar messages to other mods/admins
          if (this.isModsMessage(message)) {
            return '<span class="pingbash-filter-mode-text">Mod</span>';
          } else {
            // Fallback: if receiver is mod/admin and we're viewing in Mods mode (filterMode = 2), assume it's a Mods message
            if (this.filterMode === 2) {
              return '<span class="pingbash-filter-mode-text">Mod</span>';
            }
          }
        }
        
        if (message.Receiver_Id > 0) {
          if (message.Receiver_Id == currentUserId) {
            return '<span class="pingbash-filter-mode-text">1 on 1</span>';
          } else {
            // Find receiver name from group members
            const receiverName = this.getReceiverName(message.Receiver_Id);
            return `<span class="pingbash-filter-mode-text">1 on 1: ${receiverName}</span>`;
          }
        }

        return '';
      },

      isModsMessage(message) {
        // Check if this message was sent in Mods mode by checking if it was sent to all moderators/admins
        if (!message.Receiver_Id || !this.group || !this.group.members) {
          return false;
        }

        // Get all moderator and admin IDs
        const modAdminIds = this.getModeratorAndAdminIds();
        if (modAdminIds.length === 0) {
          return false;
        }

        // Use the currently loaded messages instead of this.allMessages
        const messages = this.messages || this.allMessages || [];
        if (messages.length === 0) {
          return false;
        }

        // Check if there are messages with the same content, sender, and timestamp sent to all mods/admins
        const matchingMessages = messages.filter(msg => 
          msg.Content === message.Content &&
          msg.Sender_Id === message.Sender_Id &&
          msg.Send_Time === message.Send_Time &&
          msg.Receiver_Id && 
          modAdminIds.includes(msg.Receiver_Id)
        );

        // If the message was sent to all or most moderators/admins (excluding sender), it's a Mods mode message
        // Adjust threshold: for authenticated users, sender is excluded, so we need (total-1) mods/admins
        const currentUserId = this.getCurrentUserId();
        const isSenderModAdmin = modAdminIds.includes(message.Sender_Id);
        const expectedRecipients = isSenderModAdmin ? modAdminIds.length - 1 : modAdminIds.length;
        const threshold = Math.max(1, Math.floor(expectedRecipients * 0.8)); // At least 80% of expected recipients
        const isModsMsg = matchingMessages.length >= threshold;

        return isModsMsg;
      },

      getModeratorAndAdminIds() {
        // Get all moderator (role_id = 2) and admin (creater_id) IDs
        const modAdminIds = [];
        
        // Add group creator (admin)
        if (this.group.creater_id) {
          modAdminIds.push(this.group.creater_id);
        }
        
        // Add moderators
        if (this.group.members) {
          this.group.members.forEach(member => {
            if (member.role_id === 2 && !modAdminIds.includes(member.id)) {
              modAdminIds.push(member.id);
            }
          });
        }
        
        return modAdminIds;
      },

      getReceiverName(receiverId) {
        // Get receiver name from group members (same as F version)
        if (this.group && this.group.members) {
          const receiver = this.group.members.find(member => member.id == receiverId);
          return receiver ? receiver.name : `User ${receiverId}`;
        }
        return `User ${receiverId}`;
      },

      getCurrentReceiverId() {
        // Determine receiver ID based on current filter mode (same as F version)
        const filterMode = this.filterMode || 0;
        
        switch (filterMode) {
          case 0: // Public Mode
            return null;
            
          case 1: // 1 on 1 Mode  
            if (this.filteredUser && this.filteredUser.id) {
              const receiverId = parseInt(this.filteredUser.id);
              if( window.isDebugging ) console.log('🔍 [Widget] Sending 1-on-1 message to user:', receiverId, 'user name:', this.filteredUser.name);
              return receiverId;
            }
            if( window.isDebugging ) console.log('🔍 [Widget] 1-on-1 mode but no user selected, sending as public');
            return null;
            
          case 2: // Mods Mode
            // All authenticated users can send to mods (for reporting, questions, etc.)
            if( window.isDebugging ) console.log('🔍 [Widget] Sending message to moderators and admins');
            return -1; // receiver_id = -1 indicates mods-only message
            
          default:
            return null;
        }
      },

      // BAN and TIMEOUT functionality (same as W version)
      banUser(userId) {
        
        if( window.isDebugging ) console.log('🚫 [Widget] Ban user clicked:', userId);
        
        // RULE 1: User cannot ban himself
        const currentUserId = this.getCurrentUserId();
        if (userId === currentUserId) {
          ////alert("You cannot ban yourself");
          return;
        }
        
        // RULE 2: Only Group Master can ban users
        if( window.isDebugging ) console.log('🚫 [Widget] Permission check:', {
          groupCreatorId: this.group?.creater_id,
          currentUserId: currentUserId,
          isCreator: this.group?.creater_id === currentUserId,
          groupExists: !!this.group
        });
        
        // RULE 2: Group Master OR Moderators with ban_user permission can ban users
        const myMemInfo = this.group?.members?.find(user => user.id === currentUserId);
        const canBan = (this.group?.creater_id === currentUserId || (myMemInfo?.role_id === 2 && myMemInfo?.ban_user === true));
        
        if (!canBan) {
          ////alert("You don't have permission to ban users");
          return;
        }
        
        // 🆕 Show confirmation dialog with unified ban info
        const confirmed = confirm(`Are you sure you want to ban this user? This will ban both the user and their IP address.`);
        if (!confirmed) return;
        
        if (!this.socket || !this.socket.connected) {
          ("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          ////alert("Please log in to ban users");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`🚫 [Widget-UNIFIED-BAN] Group Master ${currentUserId} attempting unified ban (user + IP) for user ${userId}`);
        
        // Check if this is an anonymous user
        const isAnonymousUser = userId > 100000;
        if( window.isDebugging ) console.log('🚫 [Widget] Target user info:', {
          userId: userId,
          userIdType: typeof userId,
          isAnonymous: isAnonymousUser,
          userIdString: String(userId),
          userIdParsed: parseInt(userId)
        });
        
        // Clean and validate token
        const cleanToken = this.authenticatedToken?.trim();
        
        // Debug token information
        if( window.isDebugging ) console.log('🚫 [Widget] Token debug info:', {
          isAuthenticated: this.isAuthenticated,
          hasToken: !!this.authenticatedToken,
          tokenLength: this.authenticatedToken?.length,
          tokenStart: this.authenticatedToken?.substring(0, 20) + '...',
          tokenType: typeof this.authenticatedToken,
          cleanTokenLength: cleanToken?.length,
          tokenEquals: this.authenticatedToken === cleanToken
        });
        
        // Emit ban event (same as W version)
        // For anonymous users (large IDs), ensure we don't lose precision
        const parsedUserId = parseInt(userId);
        const banPayload = {
          token: cleanToken,
          groupId: parseInt(this.groupId),
          userId: parsedUserId
        };
        
        // Verify no precision loss for large anonymous user IDs
        if (String(parsedUserId) !== String(userId)) {
          console.warn('🚫 [Widget] Potential precision loss in user ID:', {
            original: userId,
            parsed: parsedUserId,
            originalStr: String(userId),
            parsedStr: String(parsedUserId)
          });
          ////alert(`Warning: User ID precision loss detected. Original: ${userId}, Parsed: ${parsedUserId}`);
        }
        
        if( window.isDebugging ) console.log('🚫 [Widget] Ban payload:', banPayload);
        if( window.isDebugging ) console.log('🚫 [Widget] Payload types:', {
          token: typeof banPayload.token,
          groupId: typeof banPayload.groupId,
          userId: typeof banPayload.userId,
          tokenLength: banPayload.token?.length
        });
        
        this.socket.emit('ban group user', banPayload);
        
        if( window.isDebugging ) console.log('🚫 [Widget] Ban request sent to server');
        
        // Add timeout for feedback
        setTimeout(() => {
          if( window.isDebugging ) console.log('🚫 [Widget] Ban request should have been processed by now');
        }, 3000);
      },

      timeoutUser(userId) {
        if( window.isDebugging ) console.log('⏰ [Widget] Timeout user clicked:', userId);
        
        // RULE 1: User cannot timeout himself
        const currentUserId = this.getCurrentUserId();
        if (userId === currentUserId) {
          ////alert("You cannot timeout yourself");
          return;
        }
        
        // RULE 2: Only Group Creator can timeout users (backend restriction)
        const canTimeout = (this.group?.creater_id === currentUserId);
        
        if( window.isDebugging ) console.log('⏰ [Widget] Permission check:', {
          groupCreatorId: this.group?.creater_id,
          currentUserId: currentUserId,
          isCreator: this.group?.creater_id === currentUserId,
          canTimeout: canTimeout,
          groupExists: !!this.group
        });
        
        if (!canTimeout) {
          ////alert("Only the group creator can timeout users");
          return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to timeout this user for 15 minutes?`);
        if (!confirmed) return;
        
        if (!this.socket || !this.socket.connected) {
          ////alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          ////alert("Please log in to timeout users");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`⏰ [Widget] Group Master ${currentUserId} attempting to timeout user ${userId}`);
        
        // Check if this is an anonymous user
        const isAnonymousUser = userId > 100000;
        if( window.isDebugging ) console.log('⏰ [Widget] Target user info:', {
          userId: userId,
          userIdType: typeof userId,
          isAnonymous: isAnonymousUser,
          userIdString: String(userId),
          userIdParsed: parseInt(userId)
        });
        
        // Clean and validate token
        const cleanToken = this.authenticatedToken?.trim();
        
        // Debug token information
        if( window.isDebugging ) console.log('⏰ [Widget] Token debug info:', {
          isAuthenticated: this.isAuthenticated,
          hasToken: !!this.authenticatedToken,
          tokenLength: this.authenticatedToken?.length,
          tokenStart: this.authenticatedToken?.substring(0, 20) + '...',
          tokenType: typeof this.authenticatedToken,
          cleanTokenLength: cleanToken?.length,
          tokenEquals: this.authenticatedToken === cleanToken
        });
        
        // Emit timeout event (backend expects 'timout user' - note the typo)
        // For anonymous users (large IDs), ensure we don't lose precision
        const parsedUserId = parseInt(userId);
        const timeoutPayload = {
          token: cleanToken,
          groupId: parseInt(this.groupId),
          userId: parsedUserId
        };
        
        // Verify no precision loss for large anonymous user IDs
        if (String(parsedUserId) !== String(userId)) {
          console.warn('⏰ [Widget] Potential precision loss in user ID:', {
            original: userId,
            parsed: parsedUserId,
            originalStr: String(userId),
            parsedStr: String(parsedUserId)
          });
          ////alert(`Warning: User ID precision loss detected. Original: ${userId}, Parsed: ${parsedUserId}`);
        }
        
        if( window.isDebugging ) console.log('⏰ [Widget] Timeout payload:', timeoutPayload);
        if( window.isDebugging ) console.log('⏰ [Widget] Payload types:', {
          token: typeof timeoutPayload.token,
          groupId: typeof timeoutPayload.groupId,
          userId: typeof timeoutPayload.userId,
          tokenLength: timeoutPayload.token?.length
        });
        
        this.socket.emit('timout user', timeoutPayload);
        
        if( window.isDebugging ) console.log('⏰ [Widget] Timeout request sent to server');
        
        // Add timeout for user feedback
        setTimeout(() => {
          if( window.isDebugging ) console.log('⏰ [Widget] Timeout request should have been processed by now');
        }, 3000);
      },

      getCurrentUserId() {
        if (this.isAuthenticated && this.currentUserId) {
          return parseInt(this.currentUserId);
        }
        if (this.anonId) {
          return parseInt(this.anonId);
        }
        return null;
      },

      // Unban user functionality (same as W version)
      unbanUser(userId) {
        if( window.isDebugging ) console.log('✅ [Widget] Unban user clicked:', userId);
        
        // Check permissions (only group creator can unban)
        const currentUserId = this.getCurrentUserId();
        if (this.group?.creater_id !== currentUserId) {
          ////alert("Only the group creator can unban users");
          return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to unban this user?`);
        if (!confirmed) return;
        
        if (!this.socket || !this.socket.connected) {
          ////alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          ////alert("Please log in to unban users");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`✅ [Widget] Group Master ${currentUserId} attempting to unban user ${userId}`);
        
        // Emit unban event (same as W version)
        this.socket.emit('unban group users', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          userIds: [parseInt(userId)]
        });
      },

      // BLOCK USER FEATURE - Corrected based on backend implementation
      blockUser(userId) {
        if( window.isDebugging ) console.log('🚫 [Widget] Blocking user:', userId);
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          ////alert('You must be signed in to block users');
          return;
        }

        // User cannot block themselves
        const currentUserId = this.getCurrentUserId();
        if (userId === currentUserId) {
          ////alert("You cannot block yourself");
          return;
        }
        
        if (confirm('Are you sure you want to block this user? You will not see their messages.')) {
          if( window.isDebugging ) console.log('📤 [Widget] Sending block user request');
          
          if (!this.socket || !this.socket.connected) {
            ////alert("Not connected to server");
            return;
          }

          // Backend expects: { token, userId } - personal blocking (not group-specific)
          if( window.isDebugging ) console.log('📤 [Widget] Block user payload:', {
            token: this.authenticatedToken.substring(0, 20) + '...',
            userId: userId
          });

          // Backend expects personal blocking (user-to-user), not group blocking
          // Based on controller.js line 1084-1094: blockUser(userId, blockId) - no groupId
          this.socket.emit('block user', {
            token: this.authenticatedToken,
            userId: userId
          });

          if( window.isDebugging ) console.log('🚫 [Widget] Block user request sent to server');
          
          // Add the user to blocked list immediately for better UX
          // (will be corrected by server response if needed)
          if (!this.blockedUsers || !(this.blockedUsers instanceof Set)) {
            this.blockedUsers = new Set();
          }
          this.blockedUsers.add(userId);
          if( window.isDebugging ) console.log('🚫 [Widget] Optimistically added user to blocked list:', this.blockedUsers);
          
          // Hide messages from this user immediately
          this.filterMessagesFromBlockedUsers();
          
          // Request updated blocked users list after blocking (backend should send it automatically, but let's be sure)
          setTimeout(() => {
            if (this.socket && this.socket.connected) {
              if( window.isDebugging ) console.log('🚫 [Widget] Requesting updated blocked users info after block');
              this.socket.emit('get blocked users info', {
                token: this.authenticatedToken
              });
            }
          }, 500);
        }
      },

      // Filter messages from all blocked users
      filterMessagesFromBlockedUsers() {
        if (!this.blockedUsers || this.blockedUsers.size === 0) return;
        
        const messagesList = this.dialog?.querySelector('.pingbash-messages-list');
        if (!messagesList) return;

        const messages = messagesList.querySelectorAll('.pingbash-message');
        messages.forEach(messageEl => {
          // Extract sender ID from message actions
          const actionButton = messageEl.querySelector('[onclick*="User("]');
          if (actionButton) {
            const onclick = actionButton.getAttribute('onclick');
            const userIdMatch = onclick.match(/User\((\d+)\)/);
            if (userIdMatch) {
              const senderId = parseInt(userIdMatch[1]);
              if (this.blockedUsers.has(senderId)) {
                messageEl.style.display = 'none';
                if( window.isDebugging ) console.log('🚫 [Widget] Hidden message from blocked user:', senderId);
              }
            }
          }
        });
      },

      // Also filter messages when displaying them (for new messages)
      isMessageFromBlockedUser(message) {
        return this.blockedUsers && this.blockedUsers.has(message.Sender_Id);
      },

      // Unban all users functionality
      unbanAllUsers() {
        if( window.isDebugging ) console.log('✅ [Widget] Unban all users clicked');
        
        // Check permissions (only group creator can unban)
        const currentUserId = this.getCurrentUserId();
        if (this.group?.creater_id !== currentUserId) {
          ////alert("Only the group creator can unban users");
          return;
        }
        
        // Get all banned user IDs
        const bannedUserIds = this.bannedUsers ? this.bannedUsers.map(user => user.id) : [];
        
        if (bannedUserIds.length === 0) {
          ////alert("No banned users to unban");
          return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to unban all ${bannedUserIds.length} users?`);
        if (!confirmed) return;
        
        if (!this.socket || !this.socket.connected) {
          //alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          //alert("Please log in to unban users");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`✅ [Widget] Group Master ${currentUserId} attempting to unban all users:`, bannedUserIds);
        
        // Emit unban event for all users
        this.socket.emit('unban group users', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          userIds: bannedUserIds
        });
      },

      // Toggle user selection for batch operations
      toggleUserSelection(userId, isSelected) {
        if (!this.selectedUsers) {
          this.selectedUsers = new Set();
        }
        
        if (isSelected) {
          this.selectedUsers.add(userId);
        } else {
          this.selectedUsers.delete(userId);
        }
        
        // Update unban selected button
        this.updateUnbanSelectedButton();
      },

      // Toggle all users selection
      toggleAllUsers(selectAll) {
        if (!this.selectedUsers) {
          this.selectedUsers = new Set();
        }
        
        const checkboxes = document.querySelectorAll('.pingbash-banned-users-modal input[type="checkbox"]:not(#select-all-users)');
        checkboxes.forEach(checkbox => {
          checkbox.checked = selectAll;
          const userId = parseInt(checkbox.id.replace('user-', ''));
          if (selectAll) {
            this.selectedUsers.add(userId);
          } else {
            this.selectedUsers.delete(userId);
          }
        });
        
        this.updateUnbanSelectedButton();
      },

      // Update unban selected button state
      updateUnbanSelectedButton() {
        const button = document.getElementById('unban-selected-btn');
        if (button && this.selectedUsers) {
          const count = this.selectedUsers.size;
          button.textContent = `Unban Selected (${count})`;
          button.disabled = count === 0;
          button.style.opacity = count === 0 ? '0.5' : '1';
        }
      },

      // Unban selected users
      unbanSelectedUsers() {
        if (!this.selectedUsers || this.selectedUsers.size === 0) {
          //alert("No users selected");
          return;
        }
        
        // Check permissions (only group creator can unban)
        const currentUserId = this.getCurrentUserId();
        if (this.group?.creater_id !== currentUserId) {
          //alert("Only the group creator can unban users");
          return;
        }
        
        const selectedUserIds = Array.from(this.selectedUsers);
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to unban ${selectedUserIds.length} selected users?`);
        if (!confirmed) return;
        
        if (!this.socket || !this.socket.connected) {
          //alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          //alert("Please log in to unban users");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`✅ [Widget] Group Master ${currentUserId} attempting to unban selected users:`, selectedUserIds);
        
        // Emit unban event for selected users
        this.socket.emit('unban group users', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          userIds: selectedUserIds
        });
        
        // Clear selection
        this.selectedUsers.clear();
      },

      // Refresh banned users list
      refreshBannedUsers() {
        if( window.isDebugging ) console.log('🔄 [Widget] Refreshing banned users list');
        
        if (!this.socket || !this.socket.connected) {
          //alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          //alert("Please log in to refresh banned users");
          this.showSigninModal();
          return;
        }
        
        // Re-emit the get banned users request
        this.socket.emit('get banned users', {
          groupId: parseInt(this.groupId),
          token: this.authenticatedToken
        });
      },

      // Pin/Unpin message functionality (same as W version)
      canPinMessages() {
        // Check if user is moderator or admin (role_id 1 or 2) or group creator
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId || !this.group) return false;
        
        // Group creator can always pin
        if (this.group.creater_id === currentUserId) return true;
        
        // Check if user is mod/admin in group members
        const userMember = this.group.members?.find(member => member.id === currentUserId);
        return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
      },

      isPinnedMessage(messageId) {
        return this.pinnedMessageIds && this.pinnedMessageIds.includes(messageId);
      },

      pinMessage(messageId) {
        if( window.isDebugging ) console.log('📌 [Widget] Pin message clicked:', messageId);
        
        if (!this.canPinMessages()) {
          //alert("Only moderators and admins can pin messages");
          return;
        }
        
        if (!this.socket || !this.socket.connected) {
          //alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          //alert("Please log in to pin messages");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`📌 [Widget] Pinning message ${messageId} in group ${this.groupId}`);
        
        // Emit pin message event (same as W version)
        this.socket.emit('pin message', {
          token: this.authenticatedToken?.trim(),
          groupId: parseInt(this.groupId),
          msgId: parseInt(messageId)
        });
      },

      unpinMessage(messageId) {
        if( window.isDebugging ) console.log('📌 [Widget] Unpin message clicked:', messageId);
        
        if (!this.canPinMessages()) {
          //alert("Only moderators and admins can unpin messages");
          return;
        }
        
        if (!this.socket || !this.socket.connected) {
          //alert("Not connected to server");
          return;
        }
        
        if (!this.isAuthenticated || !this.authenticatedToken) {
          //alert("Please log in to unpin messages");
          this.showSigninModal();
          return;
        }
        
        if( window.isDebugging ) console.log(`📌 [Widget] Unpinning message ${messageId} in group ${this.groupId}`);
        
        const payload = {
          token: this.authenticatedToken?.trim(),
          groupId: parseInt(this.groupId),
          msgId: parseInt(messageId)
        };
        
        if( window.isDebugging ) console.log('📌 [Widget] Unpin payload:', payload);
        if( window.isDebugging ) console.log('📌 [Widget] Token length:', payload.token?.length);
        if( window.isDebugging ) console.log('📌 [Widget] Socket connected:', this.socket.connected);
        if( window.isDebugging ) console.log('📌 [Widget] Current user ID:', this.getCurrentUserId());
        if( window.isDebugging ) console.log('📌 [Widget] Group creator ID:', this.group?.creater_id);
        if( window.isDebugging ) console.log('📌 [Widget] User role in group:', this.group?.members?.find(m => m.id === this.getCurrentUserId())?.role_id);
        
        // Add temporary error listeners
        this.socket.once('forbidden', (error) => {
          console.error('📌 [Widget] ❌ Forbidden error for unpin:', error);
          //alert('Access denied. You may not have permission for this action.');
        });
        
        this.socket.once('error', (error) => {
          console.error('📌 [Widget] ❌ Socket error for unpin:', error);
        });
        
        // Emit unpin message event (same as W version)
        this.socket.emit('unpin message', payload);
      },

      getPinnedMessages() {
        if (!this.socket || !this.socket.connected) return;
        if (!this.isAuthenticated || !this.authenticatedToken) return;
        
        if( window.isDebugging ) console.log('📌 [Widget] Requesting pinned messages for group:', this.groupId);
        
        // Request pinned messages (same as W version)
        this.socket.emit('get pinned messages', {
          token: this.authenticatedToken?.trim(),
          groupId: parseInt(this.groupId)
        });
      },

  });
}