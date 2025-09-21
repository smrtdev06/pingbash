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
              console.log('📜 [Widget] Height changed, auto-scrolling to bottom');
              this.scrollToBottom();
            }
          }
        });
        
        this.resizeObserver.observe(messagesList);
        console.log('📜 [Widget] Auto-scroll monitoring enabled');
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
            console.log('📜 [Widget] New messages added, scrolling to bottom');
            this.scrollToBottomAfterImages();
          }
        });
        
        this.mutationObserver.observe(messagesList, {
          childList: true,
          subtree: true
        });
        console.log('📜 [Widget] Message monitoring enabled');
      }
    },

  // EXACT COPY from widget.js - handleNewMessages method
    handleNewMessages(data) {
      console.log('🔍 [Widget] handleNewMessages called with:', data?.length, 'messages');
  
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('🔍 [Widget] No new messages to process - data:', data);
        return;
      }
  
      console.log('🔍 [Widget] handleNewMessages received:', data.length, 'messages');
      console.log('🔍 [Widget] Current messages count:', this.messages?.length || 0);
      console.log('🔍 [Widget] New message details:', data.map(msg => ({
        id: msg.Id,
        content: msg.Content,
        sender: msg.sender_name,
        group_id: msg.group_id
      })));
  
      // Check if messages belong to current group (same as W version)
      const groupId = data.length && data[data.length - 1].group_id;
      console.log('🔍 [Widget] Message group ID:', groupId, 'Current group ID:', this.groupId);
      console.log('🔍 [Widget] Group ID match:', groupId === this.groupId);
  
      if (groupId === this.groupId) {
        console.log('🔍 [Widget] ✅ Messages for current group');
        console.log('🔍 [Widget] Page visible:', this.pageVisible);
  
        if (this.pageVisible) {
          console.log('🔍 [Widget] Page visible - adding messages immediately');
          console.log('🔍 [Widget] Before processing - existing:', this.messages?.length || 0, 'new:', data.length);
  
          // Don't merge here - let displayMessages handle the logic
          this.displayMessages(data);
  
          console.log('🔍 [Widget] ✅ Messages updated and displayed immediately');
        } else {
          console.log('🔍 [Widget] Page hidden - queuing messages for later');
          // Queue messages for when page becomes visible (same as W version)
          this.pendingMessages = this.mergeArrays(this.pendingMessages, data);
          console.log('🔍 [Widget] Queued messages - pending count:', this.pendingMessages.length);
          console.log('🔍 [Widget] Latest queued message ID:', this.pendingMessages[this.pendingMessages.length - 1]?.Id);
        }
      } else {
        console.log('🔍 [Widget] ❌ Messages not for current group, ignoring');
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
      const newMessages = messages || [];
      const messagesList = this.dialog.querySelector('#pingbash-messages');
  
      console.log('🔍 [Widget] displayMessages called with', newMessages.length, 'messages');
  
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
        console.log('🔍 [Widget] Initial load - rendering', newMessages.length, 'messages');
        messagesList.innerHTML = '';
        this.messages = newMessages;
        newMessages.forEach(msg => this.addMessage(msg));
      } else {
        // Quick check: if we have the same number of messages and the last message ID matches, skip
        if (this.messages && this.messages.length === newMessages.length) {
          const lastExistingId = this.messages[this.messages.length - 1]?.Id;
          const lastNewId = newMessages[newMessages.length - 1]?.Id;
          console.log('🔍 [Widget] Comparing message sets - existing:', this.messages.length, 'new:', newMessages.length);
          console.log('🔍 [Widget] Last existing ID:', lastExistingId, 'Last new ID:', lastNewId);
  
          // Debug: Show last few message IDs from both sets
          const lastFewExisting = this.messages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
          const lastFewNew = newMessages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
          console.log('🔍 [Widget] Last few existing messages:', lastFewExisting);
          console.log('🔍 [Widget] Last few new messages:', lastFewNew);
  
          if (lastExistingId === lastNewId) {
            console.log('🔍 [Widget] Same message set received, skipping processing');
            return;
          } else {
            console.log('🔍 [Widget] Different last message ID, proceeding with update');
          }
        }
  
        // Smart append - only add messages that don't exist in DOM
        console.log('🔍 [Widget] Smart append - checking for new messages');
  
        // Get existing message IDs from DOM (more reliable than stored array)
        const existingDomIds = new Set();
        messagesList.querySelectorAll('[data-message-id]').forEach(el => {
          existingDomIds.add(parseInt(el.getAttribute('data-message-id')));
        });
  
        // Find truly new messages
        const messagesToAdd = newMessages.filter(msg => !existingDomIds.has(msg.Id));
  
        console.log('🔍 [Widget] DOM has', existingDomIds.size, 'messages, received', newMessages.length, 'messages');
        console.log('🔍 [Widget] Found', messagesToAdd.length, 'new messages to append');
  
        if (messagesToAdd.length > 0) {
          // Append only new messages (no clearing!)
          messagesToAdd.forEach(msg => {
            console.log('🔍 [Widget] Adding new message:', msg.Id, msg.Content?.substring(0, 20) + '...');
            this.addMessage(msg, true); // Pass true to indicate this is a new message
          });
  
          // Update stored messages
          this.messages = newMessages;
  
          console.log('🔍 [Widget] ✅ Appended', messagesToAdd.length, 'new messages without blinking');
          this.scrollToBottomAfterImages();
        } else {
          console.log('🔍 [Widget] No new messages to add');
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
      console.log('🔍 [Widget] displayPendingMessages called with', messages.length, 'messages');
  
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
  
      console.log('🔍 [Widget] Pending messages - DOM has', existingDomIds.size, 'messages');
      console.log('🔍 [Widget] Pending messages - found', messagesToAdd.length, 'new messages to add');
  
      if (messagesToAdd.length > 0) {
        // Add new messages with animation
        messagesToAdd.forEach(msg => {
          console.log('🔍 [Widget] Adding pending message:', msg.Id, msg.Content?.substring(0, 20) + '...');
          this.addMessage(msg, true); // Mark as new for animation
        });
  
        console.log('🔍 [Widget] ✅ Added', messagesToAdd.length, 'pending messages');
        this.scrollToBottomAfterImages();
      }
  
      // Update stored messages
      this.messages = newMessages;
    },

  // EXACT COPY from widget.js - addMessage method
    addMessage(message, isNewMessage = false) {
      console.log('🔍 [Widget] addMessage called for message ID:', message.Id, 'Content:', message.Content, 'isNew:', isNewMessage);
      const messagesList = this.dialog.querySelector('#pingbash-messages');
  
      if (!messagesList) {
        console.error('🔍 [Widget] ERROR: Messages list element not found!');
        return;
      }
  
      // Check if message already exists to prevent duplicates
      const existingMessage = messagesList.querySelector(`[data-message-id="${message.Id}"]`);
      if (existingMessage) {
        console.log('🔍 [Widget] Message', message.Id, 'already exists in DOM, skipping');
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
  
      console.log('🔍 [Widget] Message ownership check:', {
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
  
      console.log('🔍 [Widget] Creating message element with class:', messageEl.className, 'ID:', message.Id);
  
      const time = new Date(message.Send_Time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
  
      // Format sender name same as F version
      let senderName;
      if (message.Sender_Id && message.Sender_Id > 100000) {
        // Anonymous user - show as anon + last 3 digits (same as F version)
        senderName = "anon" + String(message.Sender_Id).slice(-3);
        console.log(`🔍 [Widget] Anonymous user ${message.Sender_Id} displayed as: ${senderName}`);
      } else {
        // Regular user - use sender_name or fallback
        senderName = message.sender_name || 'Anonymous';
        console.log(`🔍 [Widget] Regular user ${message.Sender_Id} displayed as: ${senderName}`);
      }
      console.log('🔍 [Widget] Message content:', message.Content);
      const escapedContent = this.escapeForAttribute(message.Content);
      // Generate avatar HTML (same as W version)
      const avatarHtml = this.generateAvatarHtml(message, senderName);
      
      messageEl.innerHTML = `
        <div class="pingbash-message-content">
          ${avatarHtml}
          <div class="pingbash-message-body">
            ${message.parent_id ? this.renderReplyIndicator(message.parent_id) : ''}
            <div class="pingbash-message-header">
              <span class="pingbash-message-sender">${senderName}</span>
              <span class="pingbash-message-time">${time}</span>
              <div class="pingbash-message-buttons">
                ${!isOwn ? `
                  <button class="pingbash-message-action ban" onclick="window.pingbashWidget.banUser(${message.Sender_Id})" title="Ban User">🚫</button>
                  <button class="pingbash-message-action timeout" onclick="window.pingbashWidget.timeoutUser(${message.Sender_Id})" title="Timeout User">⏰</button>
                ` : ''}
                <button class="pingbash-message-reply" onclick="window.pingbashWidget.replyToMessage(${message.Id}, '${senderName.replace(/'/g, "\\'")}', '${escapedContent}')" title="Reply">↩️</button>
              </div>
            </div>
            <div class="pingbash-message-text">${this.renderMessageContent(message.Content)}</div>
          </div>
        </div>
      `;
  
  
      messagesList.appendChild(messageEl);
      console.log('🔍 [Widget] ✅ Message element appended to DOM, total messages now:', messagesList.children.length);
  
      // Remove animation class after animation completes
      if (isNewMessage) {
        setTimeout(() => {
          messageEl.classList.remove('new-message');
        }, 300); // Match animation duration
      }
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
      return str ? str.replace(/\\/g, '\\\\').replace(/'/g, "''") : "";
    },

  // EXACT COPY from widget.js - renderMessageContent method
    renderMessageContent(content) {
      if (!content) return '';
  
      // Check if content contains HTML tags (images, links, etc.)
      if (content.includes('<img') || content.includes('<a') || content.includes('gif::') || content.includes('sticker::')) {
        console.log('🖼️ [Widget] Rendering HTML content:', content.substring(0, 50) + '...');
  
        // Handle different content types (same as W version)
        if (content.includes('<img')) {
          // Image content - render as HTML
          return content;
        } else if (content.includes('gif::https://')) {
          // GIF content
          const gifUrl = content.slice('gif::'.length);
          return `<img src="${gifUrl}" style="width: 160px;" />`;
        } else if (content.includes('sticker::')) {
          // Sticker content (would need Lottie implementation)
          return `<div>🎭 Sticker: ${content.slice('sticker::'.length)}</div>`;
        } else if (content.includes('.gif') && content.includes('https://') && !content.includes(' ')) {
          // Direct GIF URL
          return `<img src="${content}" style="width: 160px;" />`;
        } else {
          // Other HTML content
          return content;
        }
      } else {
        // Plain text - escape HTML and convert URLs to links
        const escaped = this.escapeHtml(content);
        return escaped.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
      }
    },

  // EXACT COPY from widget.js - scrollToBottom method
    scrollToBottom() {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        const messagesList = this.dialog.querySelector('.pingbash-messages-list');
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight;
          console.log('📜 [Widget] Scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
        }
      });
    },

  // EXACT COPY from widget.js - forceScrollToBottom method
    forceScrollToBottom() {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
        console.log('📜 [Widget] Force scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
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
      console.log('📜 [Widget] Found', images.length, 'images to monitor');
  
      if (images.length === 0) {
        // No images, we're done
        return;
      }
  
      let loadedImages = 0;
      const totalImages = images.length;
  
      const checkAllLoaded = () => {
        loadedImages++;
        console.log('📜 [Widget] Image loaded:', loadedImages, '/', totalImages);
        // Scroll after each image loads (not just when all are loaded)
        this.scrollToBottom();
        
        if (loadedImages >= totalImages) {
          console.log('📜 [Widget] All images loaded, final scroll');
          // Final scroll after all images are loaded
          setTimeout(() => this.scrollToBottom(), 100);
        }
      };
  
      // Set up load listeners for each image
      images.forEach((img, index) => {
        if (img.complete) {
          // Image already loaded
          console.log('📜 [Widget] Image', index, 'already loaded');
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
      messagesList.appendChild(errorEl);
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
      console.log('💬 [Widget] Reply to message:', messageId, 'from:', senderName);
  
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
  
        console.log("Showing reply preview", this.replyingTo);
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
      console.log('💬 [Widget] Hiding reply preview');
      const replyPreview = this.dialog.querySelector('.pingbash-reply-preview');
      if (replyPreview) {
        replyPreview.style.display = 'none';
        console.log('💬 [Widget] Reply preview hidden successfully');
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
          console.log('📤 [Widget] Upload auth token:', authToken ? authToken.substring(0, 20) + '...' : 'none');
          console.log('📤 [Widget] Is authenticated:', this.isAuthenticated);
    
          const uploadResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': authToken
            },
            body: formData
          });
    
          console.log('📤 [Widget] Upload response status:', uploadResponse.status);
          console.log('📤 [Widget] Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));
    
          // Get response text first to debug JSON parsing issues
          const responseText = await uploadResponse.text();
          console.log('📤 [Widget] Raw response text:', responseText);
          console.log('📤 [Widget] Response text length:', responseText.length);
    
          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status} - ${responseText}`);
          }
    
          // Try to parse JSON
          let uploadResult;
          try {
            uploadResult = responseText;
            console.log('✅ [Widget] File uploaded:', uploadResult);
          } catch (jsonError) {
            console.error('❌ [Widget] JSON parse error:', jsonError);
            console.error('❌ [Widget] Response that failed to parse:', responseText);
            throw new Error(`Invalid JSON response: ${jsonError.message}`);
          }
    
          // Send message with file reference (exact same format as W version)
          const messageContent = type === 'image'
            ? `<img src='${this.config.apiUrl}/uploads/chats/images/${uploadResult}' alt="" />`
            : `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" href=${this.config.apiUrl}/uploads/chats/files/${uploadResult}>File Name : ${uploadResult}</a>`;
    
          console.log('📤 [Widget] Sending file message:', messageContent);
    
          // Use the same socket event format as regular messages (exact same as F version)
          const safeMessage = this.makeTextSafe(messageContent);
    
          if (this.isAuthenticated && this.authenticatedToken) {
            console.log('📤 [Widget] Sending authenticated file message via socket');
            console.log('📤 [Widget] Socket payload:', {
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
              receiverId: null,
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
            console.log('📤 [Widget] Sending anonymous file message via socket');
            console.log('📤 [Widget] Socket payload:', {
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
              receiverId: null,
              parent_id: null
            });
          }
    
          this.hideUploadProgress();
    
          // Force refresh messages after file upload to ensure it appears
          setTimeout(() => {
            console.log('📤 [Widget] Force refreshing messages after file upload');
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
        console.log('📍 [Widget] Scrolling to message:', messageId);
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

  });
}