/**
 * Pingbash Chat Widget - Chat Module
 * Message handling, replies, file uploads, and scrolling
 */

// Extend the PingbashChatWidget class with chat methods
Object.assign(PingbashChatWidget.prototype, {
  displayMessages(messages) {
    console.log('🔍 [Widget] displayMessages called with', messages?.length, 'messages');
    
    if (!messages || !Array.isArray(messages)) {
      console.log('🔍 [Widget] No messages to display');
      return;
    }

    // Check if this is the same set of messages (optimization)
    const existingCount = this.messages?.length || 0;
    const newCount = messages.length;
    console.log('🔍 [Widget] Comparing message sets - existing:', existingCount, 'new:', newCount);
    
    if (existingCount > 0 && newCount > 0) {
      const lastExistingId = this.messages[this.messages.length - 1]?.Id;
      const lastNewId = messages[messages.length - 1]?.Id;
      console.log('🔍 [Widget] Last existing ID:', lastExistingId, 'Last new ID:', lastNewId);
      
      if (existingCount === newCount && lastExistingId === lastNewId) {
        console.log('🔍 [Widget] Same message set received, skipping processing');
        return;
      }
    }

    this.messages = messages;
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    
    if (!messagesList) {
      console.error('❌ [Widget] Messages list element not found');
      return;
    }

    // Clear existing messages
    messagesList.innerHTML = '';

    // Add each message
    messages.forEach(message => {
      this.addMessage(message);
    });

    // Scroll to bottom after adding messages
    this.scrollToBottomAfterImages();
  },

  handleNewMessages(messages) {
    console.log('🔍 [Widget] handleNewMessages called with:', messages?.length, 'messages');
    
    if (!messages || !Array.isArray(messages)) {
      console.log('🔍 [Widget] handleNewMessages received:', messages?.length, 'messages');
      console.log('🔍 [Widget] Current messages count:', this.messages?.length);
      console.log('🔍 [Widget] New message details:', messages);
      return;
    }

    // Check if messages are for current group
    if (messages.length > 0) {
      const messageGroupId = messages[0].Group_Id;
      console.log('🔍 [Widget] Message group ID:', messageGroupId, 'Current group ID:', this.groupId);
      console.log('🔍 [Widget] Group ID match:', messageGroupId == this.groupId);
      
      if (messageGroupId != this.groupId) {
        console.log('🔍 [Widget] ❌ Messages not for current group');
        return;
      }
      
      console.log('🔍 [Widget] ✅ Messages for current group');
    }

    console.log('🔍 [Widget] Page visible:', this.pageVisible);
    
    if (this.pageVisible) {
      console.log('🔍 [Widget] Page visible - adding messages immediately');
      console.log('🔍 [Widget] Before processing - existing:', this.messages?.length, 'new:', messages.length);
      this.displayMessages(messages);
      console.log('🔍 [Widget] ✅ Messages updated and displayed immediately');
    } else {
      console.log('🔍 [Widget] Page not visible - storing messages for later');
      this.pendingMessages = messages;
      this.unreadCount += messages.length - (this.messages?.length || 0);
      this.updateUnreadBadge();
    }
  },

  addMessage(message) {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (!messagesList) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'pingbash-message';
    messageEl.setAttribute('data-message-id', message.Id);

    // Check if this is the current user's message
    const isOwn = this.isMessageFromCurrentUser(message);
    console.log('🔍 [Widget] Message ownership check:', {
      rawSenderId: message.Sender_Id,
      parsedSenderId: parseInt(message.Sender_Id),
      rawCurrentUserId: this.currentUserId,
      parsedCurrentUserId: parseInt(this.currentUserId),
      rawAnonId: this.anonId,
      parsedAnonId: parseInt(this.anonId),
      isOwn: isOwn,
      isAuthenticated: this.isAuthenticated
    });

    if (isOwn) {
      messageEl.classList.add('own');
    }

    // Format timestamp
    const timestamp = new Date(message.Created_At);
    const time = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Get sender name
    const senderName = this.getSenderName(message);

    messageEl.innerHTML = `
      <div class="pingbash-message-content">
        ${message.parent_id ? this.renderReplyIndicator(message.parent_id) : ''}
        <div class="pingbash-message-header">
          ${!isOwn ? `<span class="pingbash-message-sender">${senderName}</span>` : ''}
          <span class="pingbash-message-time">${time}</span>
          <button class="pingbash-message-reply" data-message-id="${message.Id}" data-sender-name="${senderName}">Reply</button>
        </div>
        <div class="pingbash-message-text">${this.renderMessageContent(message.Content)}</div>
        ${!isOwn ? `
          <div class="pingbash-message-actions">
            <button class="pingbash-message-action ban" onclick="window.pingbashWidget.banUser(${message.Sender_Id})">BAN</button>
            <button class="pingbash-message-action timeout" onclick="window.pingbashWidget.timeoutUser(${message.Sender_Id})">TO</button>
          </div>
        ` : ''}
      </div>
    `;

    messagesList.appendChild(messageEl);
  },

  isMessageFromCurrentUser(message) {
    const senderId = parseInt(message.Sender_Id);
    const currentUserId = parseInt(this.currentUserId);
    
    if (this.isAuthenticated) {
      // For authenticated users, compare user IDs directly
      return senderId === currentUserId;
    } else {
      // For anonymous users, compare with anonId
      const anonId = parseInt(this.anonId);
      return senderId === anonId;
    }
  },

  getSenderName(message) {
    if (this.isMessageFromCurrentUser(message)) {
      return 'You';
    }

    // Format sender name same as original widget.js
    let senderName;
    if (message.Sender_Id && message.Sender_Id > 100000) {
      // Anonymous user - show as anon + last 3 digits (same as original widget.js)
      senderName = "anon" + String(message.Sender_Id).slice(-3);
      console.log(`🔍 [Widget] Anonymous user ${message.Sender_Id} displayed as: ${senderName}`);
    } else {
      // Regular user - use sender_name (lowercase!) or fallback (same as original widget.js)
      senderName = message.sender_name || 'Anonymous';
      console.log(`🔍 [Widget] Regular user ${message.Sender_Id} displayed as: ${senderName}`);
    }
    
    return senderName;
  },

  renderMessageContent(content) {
    if (!content) return '';
    
    // Handle image messages
    if (content.includes('<img')) {
      return content;
    }
    
    // Handle file messages
    if (content.includes('<a') && content.includes('href')) {
      return content;
    }
    
    // Regular text message - escape HTML and convert newlines
    return this.escapeHtml(content).replace(/\n/g, '<br>');
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Reply functionality
  escapeForAttribute(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  renderReplyIndicator(parentId) {
    const parentMessage = this.messages?.find(msg => msg.Id == parentId);
    if (!parentMessage) {
      return `<div class="pingbash-reply-indicator">
        <div class="pingbash-reply-line"></div>
        <div class="pingbash-reply-content">
          <div class="pingbash-reply-sender">Unknown</div>
          <div class="pingbash-reply-text">Message not found</div>
        </div>
      </div>`;
    }

    const senderName = this.getSenderName(parentMessage);
    const contentPreview = this.getReplyContentPreview(parentMessage.Content);

    return `<div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
      <div class="pingbash-reply-line"></div>
      <div class="pingbash-reply-content">
        <div class="pingbash-reply-sender">${this.escapeHtml(senderName)}</div>
        <div class="pingbash-reply-text">${this.escapeHtml(contentPreview)}</div>
      </div>
    </div>`;
  },

  getReplyContentPreview(content) {
    if (!content) return 'Empty message';
    
    // Handle image messages
    if (content.includes('<img')) {
      return '📷 Image';
    }
    
    // Handle file messages
    if (content.includes('<a') && content.includes('href')) {
      return '📎 File';
    }
    
    // Regular text - truncate if too long
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  },

  replyToMessage(messageId, senderName, content) {
    console.log('💬 [Widget] Setting up reply to message:', messageId, 'from:', senderName);
    
    this.replyingTo = {
      id: messageId,
      senderName: senderName,
      content: content
    };
    
    this.showReplyPreview();
    
    // Focus on input field
    const input = this.dialog.querySelector('#pingbash-message-input');
    if (input) {
      input.focus();
    }
  },

  showReplyPreview() {
    if (!this.replyingTo) return;
    
    const preview = this.dialog.querySelector('.pingbash-reply-preview');
    const senderEl = preview.querySelector('.pingbash-reply-preview-sender');
    const contentEl = preview.querySelector('.pingbash-reply-preview-content');
    
    if (senderEl && contentEl) {
      senderEl.textContent = this.replyingTo.senderName;
      contentEl.textContent = this.getReplyContentPreview(this.replyingTo.content);
      preview.style.display = 'flex';
      
      console.log('💬 [Widget] Reply preview shown for:', this.replyingTo.senderName);
    }
  },

  hideReplyPreview() {
    const preview = this.dialog.querySelector('.pingbash-reply-preview');
    if (preview) {
      preview.style.display = 'none';
    }
    
    this.replyingTo = null;
    console.log('💬 [Widget] Reply preview hidden');
  },

  scrollToMessage(messageId) {
    const messageEl = this.dialog.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the message briefly
      messageEl.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
      setTimeout(() => {
        messageEl.style.backgroundColor = '';
      }, 2000);
    }
  },

  // Scrolling functionality
  scrollToBottom() {
    requestAnimationFrame(() => {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
        console.log('📜 [Widget] Scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
      }
    });
  },

  forceScrollToBottom() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
      console.log('📜 [Widget] Force scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
    }
  },

  scrollToBottomAfterImages() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (!messagesList) return;

    // FIRST: Scroll immediately to current height
    this.forceScrollToBottom();

    // THEN: Set up monitoring for image loading
    const images = messagesList.querySelectorAll('img');
    console.log('📜 [Widget] Found', images.length, 'images to monitor');

    if (images.length === 0) {
      return; // No images, we're done
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

    images.forEach((img, index) => {
      if (img.complete) {
        console.log('📜 [Widget] Image', index, 'already loaded');
        checkAllLoaded();
      } else {
        img.addEventListener('load', checkAllLoaded, { once: true });
        img.addEventListener('error', checkAllLoaded, { once: true });
      }
    });

    // Fallback: scroll after 2 seconds even if images haven't loaded
    setTimeout(() => {
      this.scrollToBottom();
    }, 2000);
  },

  setupAutoScroll() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (!messagesList) return;

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
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

  // File upload functionality
  async uploadAndSendFile(file) {
    console.log('📷 [Widget] Starting file upload:', file.name);
    
    if (!this.isAuthenticated) {
      this.showError('Please sign in to upload files');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log('📤 [Widget] Upload auth token:', this.authenticatedToken?.substring(0, 20) + '...');
      console.log('📤 [Widget] Is authenticated:', this.isAuthenticated);

      const response = await fetch(`${this.config.apiUrl}/api/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authenticatedToken}`
        },
        body: formData
      });

      console.log('📤 [Widget] Upload response status:', response.status);
      console.log('📤 [Widget] Upload response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📤 [Widget] Raw response text:', responseText);
      console.log('📤 [Widget] Response text length:', responseText.length);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      // The server returns just the filename as plain text
      const filename = responseText.trim();
      console.log('✅ [Widget] File uploaded:', filename);

      // Send the image message
      const imageUrl = `${this.config.apiUrl}/uploads/chats/images/${filename}`;
      const imageMessage = `<img src='${imageUrl}' alt="" />`;
      
      console.log('📤 [Widget] Sending file message:', imageMessage);
      this.sendMessage(imageMessage, this.replyingTo?.id || null);

      // Clear reply state after sending
      if (this.replyingTo) {
        this.hideReplyPreview();
      }

      // Force refresh messages after a short delay to ensure the new message appears
      setTimeout(() => {
        console.log('🔄 [Widget] Refreshing messages after file upload');
        this.pollForNewMessages();
      }, 1000);

    } catch (error) {
      console.error('❌ [Widget] File upload error:', error);
      this.showError('File upload failed: ' + error.message);
    }
  },

  // Utility functions
  showError(message) {
    console.error('❌ [Widget] Error:', message);
    // You can implement a toast notification here
    alert('Error: ' + message);
  },

  showSuccess(message) {
    console.log('✅ [Widget] Success:', message);
    // You can implement a toast notification here
    alert('Success: ' + message);
  }
}); 