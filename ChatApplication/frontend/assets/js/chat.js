// Chat page specific scripts
// API_URL already declared in script.js

console.log('========== CHAT.JS LOADED ==========');

document.addEventListener('DOMContentLoaded', () => {
  console.log('========== DOM CONTENT LOADED ==========');
  
  const emptyState = document.querySelector('.empty-state');
  const cloudChat = document.getElementById('cloud-chat');
  const chatMain = document.querySelector('.chat-main');
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No token found - user should login');
    // window.location.href = '../index.html';
    // return;
  }

  // Chat item click handler
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      chatItems.forEach(i => i.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');
      
      // Check if it's the cloud chat
      const chatName = item.querySelector('h4').textContent;
      if (chatName === 'Cloud của tôi') {
        // Hide empty state, show cloud chat
        if (emptyState) emptyState.style.display = 'none';
        if (cloudChat) cloudChat.style.display = 'block';
        if (chatMain) {
          chatMain.style.alignItems = 'stretch';
          chatMain.style.justifyContent = 'stretch';
        }
      }
      
      console.log('Chat selected:', chatName);
    });
  });

  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      chatItems.forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const message = item.querySelector('.last-message').textContent.toLowerCase();
        if (name.includes(searchTerm) || message.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Add friend button - Show search popup
  const addFriendBtn = document.querySelector('button[title="Add friend"]');
  if (addFriendBtn) {
    addFriendBtn.addEventListener('click', showAddFriendPopup);
  }

  // Edit icon click handler - navigate to settings
  const editBtn = document.querySelector('.sidebar-header .btn-icon');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.location.href = 'settings.html';
    });
  }
  
  // Load current user info - call after DOM is ready
  setTimeout(() => {
    loadUserProfile();
  }, 100);
});

// Function to load user profile
function loadUserProfile() {
  console.log('=== loadUserProfile called ===');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User from localStorage:', user);
  
  if (!user.username) {
    console.log('No user found in localStorage');
    return;
  }
  
  // Update avatar
  const avatarEl = document.getElementById('userAvatar');
  console.log('Avatar element:', avatarEl);
  if (avatarEl) {
    const initial = user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
    avatarEl.textContent = initial;
    console.log('Avatar set to:', initial);
  } else {
    console.error('Avatar element not found!');
  }
  
  // Update name
  const nameEl = document.getElementById('userName');
  console.log('Name element:', nameEl);
  if (nameEl) {
    const displayName = user.display_name || user.username;
    nameEl.textContent = displayName;
    console.log('Name set to:', displayName);
  } else {
    console.error('Name element not found!');
  }
  
  console.log('=== loadUserProfile completed ===');
}

// Function to show add friend popup
function showAddFriendPopup() {
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  popup.innerHTML = `
    <div class="popup-container">
      <div class="popup-header">
        <h3>🔍 Tìm kiếm bạn bè</h3>
        <button class="close-popup">✕</button>
      </div>
      
      <div class="popup-body">
        <div class="search-input-group">
          <input type="text" id="friend-search" placeholder="Nhập số điện thoại, email hoặc tên..." />
          <button id="search-btn">Tìm kiếm</button>
        </div>
        
        <div id="search-results" class="search-results"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Close popup handlers
  popup.querySelector('.close-popup').addEventListener('click', () => {
    popup.remove();
  });
  
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
  
  // Search handler
  const searchInput = popup.querySelector('#friend-search');
  const searchBtn = popup.querySelector('#search-btn');
  const resultsDiv = popup.querySelector('#search-results');
  
  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      resultsDiv.innerHTML = '<p class="no-results">Vui lòng nhập thông tin tìm kiếm</p>';
      return;
    }
    
    resultsDiv.innerHTML = '<p class="loading">Đang tìm kiếm...</p>';
    
    try {
      const token = localStorage.getItem('token');
      console.log('Searching for:', query);
      console.log('API URL:', `${API_URL}/users?query=${encodeURIComponent(query)}`);
      
      const response = await fetch(`${API_URL}/users?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('Found users:', users);
      
      if (users.length === 0) {
        resultsDiv.innerHTML = '<p class="no-results">Không tìm thấy người dùng nào</p>';
        return;
      }
      
      resultsDiv.innerHTML = users.map(user => `
        <div class="user-result" data-user-id="${user.id}">
          <div class="avatar">${user.display_name.charAt(0).toUpperCase()}</div>
          <div class="user-result-info">
            <h4>${user.display_name}</h4>
            <p>@${user.username}</p>
            ${user.phone ? `<p class="phone">📱 ${user.phone}</p>` : ''}
          </div>
          <button class="btn-chat" data-user='${JSON.stringify(user)}'>Nhắn tin</button>
        </div>
      `).join('');
      
      // Add click handlers for chat buttons
      resultsDiv.querySelectorAll('.btn-chat').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const user = JSON.parse(e.target.dataset.user);
          await startChatWithUser(user);
          popup.remove();
        });
      });
      
    } catch (error) {
      console.error('Search error:', error);
      resultsDiv.innerHTML = `<p class="error">Lỗi khi tìm kiếm: ${error.message}<br/>Vui lòng thử lại!</p>`;
    }
  }
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  
  // Focus on input
  searchInput.focus();
}

// Function to start chat with user
async function startChatWithUser(user) {
  console.log('Starting chat with:', user);
  
  try {
    const token = localStorage.getItem('token');
    
    // Create or get conversation
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        participant_ids: [user.id],
        is_group: false
      })
    });
    
    if (!response.ok) throw new Error('Failed to create conversation');
    
    const conversation = await response.json();
    
    // Add to chat list and open
    addChatToList(user, conversation);
    
    alert(`Bắt đầu chat với ${user.display_name}!`);
    
  } catch (error) {
    console.error('Error starting chat:', error);
    alert('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại!');
  }
}

// Function to add chat to list
function addChatToList(user, conversation) {
  const chatList = document.querySelector('.chat-list');
  
  // Check if already exists
  const existing = chatList.querySelector(`[data-user-id="${user.id}"]`);
  if (existing) {
    existing.click();
    return;
  }
  
  const chatItem = document.createElement('div');
  chatItem.className = 'chat-item';
  chatItem.dataset.userId = user.id;
  chatItem.dataset.conversationId = conversation.id;
  
  chatItem.innerHTML = `
    <div class="avatar ${user.is_online ? 'online' : ''}">
      ${user.display_name.charAt(0).toUpperCase()}
    </div>
    <div class="chat-info">
      <div class="chat-header">
        <h4>${user.display_name}</h4>
        <span class="time">Mới</span>
      </div>
      <p class="last-message">Bắt đầu cuộc trò chuyện...</p>
    </div>
  `;
  
  chatList.appendChild(chatItem);
  
  // Add click handler
  chatItem.addEventListener('click', () => {
    document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
    chatItem.classList.add('active');
    openChat(user, conversation);
  });
  
  chatItem.click();
}

// Toggle info panel in cloud view (outside DOMContentLoaded)
const toggleInfoBtn = document.getElementById('toggle-info-panel');
const infoPanel = document.querySelector('.cloud-info-panel');
const cloudTimeline = document.querySelector('.cloud-timeline');
if (toggleInfoBtn && infoPanel && cloudTimeline) {
  toggleInfoBtn.addEventListener('click', () => {
    if (infoPanel.style.display === 'none') {
      infoPanel.style.display = 'block';
      cloudTimeline.classList.remove('full-width');
    } else {
      infoPanel.style.display = 'none';
      cloudTimeline.classList.add('full-width');
    }
  });
}

// Chat functionality
let currentChatUser = null;
let currentConversationId = null;
let messageRefreshInterval = null;

// Open chat with a user
function openChat(user, conversation) {
  currentChatUser = user;
  currentConversationId = conversation?.id || null;
  
  const normalChat = document.getElementById('normal-chat');
  const cloudChat = document.getElementById('cloud-chat');
  const emptyState = document.querySelector('.empty-state');
  
  if (emptyState) emptyState.style.display = 'none';
  if (cloudChat) cloudChat.style.display = 'none';
  if (normalChat) normalChat.style.display = 'flex';
  
  // Update chat header
  document.getElementById('chatName').textContent = user.display_name || user.username;
  document.getElementById('chatAvatar').textContent = user.display_name ? user.display_name.charAt(0).toUpperCase() : 'U';
  document.getElementById('chatStatus').textContent = 'Online';
  
  // Load messages
  loadMessages(conversation?.id);
  
  // Start auto-refresh for new messages (every 3 seconds)
  if (messageRefreshInterval) {
    clearInterval(messageRefreshInterval);
  }
  
  if (conversation?.id) {
    messageRefreshInterval = setInterval(() => {
      refreshMessages(conversation.id);
    }, 3000);
  }
}

// Open group chat
function openGroupChat(conversation) {
  currentChatUser = null;
  currentConversationId = conversation?.id || null;
  
  const normalChat = document.getElementById('normal-chat');
  const cloudChat = document.getElementById('cloud-chat');
  const emptyState = document.querySelector('.empty-state');
  
  if (emptyState) emptyState.style.display = 'none';
  if (cloudChat) cloudChat.style.display = 'none';
  if (normalChat) normalChat.style.display = 'flex';
  
  // Update chat header for group
  document.getElementById('chatName').textContent = conversation.name || 'Nhóm chat';
  document.getElementById('chatAvatar').textContent = (conversation.name || 'G').charAt(0).toUpperCase();
  document.getElementById('chatStatus').textContent = `${conversation.participants?.length || 0} thành viên`;
  
  // Load messages
  loadMessages(conversation?.id);
  
  // Start auto-refresh for new messages (every 3 seconds)
  if (messageRefreshInterval) {
    clearInterval(messageRefreshInterval);
  }
  
  if (conversation?.id) {
    messageRefreshInterval = setInterval(() => {
      refreshMessages(conversation.id);
    }, 3000);
  }
}

// Load messages for a conversation
async function loadMessages(conversationId) {
  const container = document.getElementById('messagesContainer');
  container.innerHTML = '<div class="loading">Loading messages...</div>';
  
  if (!conversationId) {
    container.innerHTML = '<div class="date-divider"><span>Start chatting!</span></div>';
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const messages = await response.json();
      displayMessages(messages);
    } else {
      container.innerHTML = '<div class="error">Failed to load messages</div>';
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    container.innerHTML = '<div class="error">Error loading messages</div>';
  }
}

// Display messages
function displayMessages(messages) {
  const container = document.getElementById('messagesContainer');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  container.innerHTML = '';
  
  if (messages.length === 0) {
    container.innerHTML = '<div class="date-divider"><span>No messages yet. Start the conversation!</span></div>';
    return;
  }
  
  messages.forEach(msg => {
    const isSent = msg.sender_id === currentUser.id;
    const messageDiv = createMessageElement(msg, isSent);
    container.appendChild(messageDiv);
  });
  
  // Auto scroll to bottom
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// Create message element
function createMessageElement(msg, isSent) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = isSent ? 'Me' : (currentChatUser?.display_name?.charAt(0) || 'U');
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  // Check if message has file/image
  const messageType = msg.message_type || 'text';
  const fileUrl = msg.file_url;
  
  if (messageType === 'image' && fileUrl) {
    // Display image with Zalo-style preview
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = 'position: relative; max-width: 400px; border-radius: 16px; overflow: hidden; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);';
    
    // HD badge
    const hdBadge = document.createElement('div');
    hdBadge.textContent = 'HD';
    hdBadge.style.cssText = 'position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; z-index: 1;';
    imgContainer.appendChild(hdBadge);
    
    const img = document.createElement('img');
    img.src = `http://localhost:8000${fileUrl}`;
    img.alt = msg.content || 'Image';
    img.style.cssText = 'width: 100%; height: auto; display: block;';
    img.onerror = function() {
      this.style.display = 'none';
      imgContainer.innerHTML = `<div style="padding: 20px; text-align: center; background: rgba(255,0,0,0.1);">❌ Không thể tải ảnh</div>`;
    };
    img.onclick = () => window.open(img.src, '_blank');
    
    imgContainer.appendChild(img);
    bubble.appendChild(imgContainer);
    bubble.style.padding = '0';
    bubble.style.background = 'transparent';
  } else if (messageType === 'file' && fileUrl) {
    // Display file card like Zalo
    const fileCard = document.createElement('div');
    fileCard.style.cssText = 'cursor: pointer; user-select: none;';
    
    const fileName = msg.content.replace('Sent a file: ', '');
    const fileExt = fileName.split('.').pop().toUpperCase();
    const fileSizeText = msg.file_size ? formatFileSize(msg.file_size) : '0 KB';
    
    // Determine icon and color based on file type
    let iconBg = '#4285F4';
    let iconText = 'W';
    if (['DOC', 'DOCX'].includes(fileExt)) {
      iconBg = '#2B579A';
      iconText = 'W';
    } else if (['XLS', 'XLSX'].includes(fileExt)) {
      iconBg = '#217346';
      iconText = 'X';
    } else if (['PDF'].includes(fileExt)) {
      iconBg = '#D32F2F';
      iconText = 'P';
    } else if (['PPT', 'PPTX'].includes(fileExt)) {
      iconBg = '#D24726';
      iconText = 'P';
    }
    
    fileCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${isSent ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'}; border-radius: 12px; min-width: 280px; max-width: 350px;">
        <div style="width: 48px; height: 48px; background: ${iconBg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700; flex-shrink: 0;">
          ${iconText}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 4px;">${fileName}</div>
          <div style="font-size: 12px; opacity: 0.7; display: flex; align-items: center; gap: 6px;">
            <span>${fileSizeText}</span>
            <span>☁️</span>
            <span>Đã có trên Cloud</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 16px;">💬</div>
          <a href="http://localhost:8000${fileUrl}" download="${fileName}" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 16px;">📥</a>
        </div>
      </div>
    `;
    
    bubble.appendChild(fileCard);
    bubble.style.padding = '0';
    bubble.style.background = 'transparent';
  } else {
    // Regular text message
    bubble.textContent = msg.content || msg.message_text;
  }
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = formatTime(msg.created_at || msg.timestamp);
  
  content.appendChild(bubble);
  content.appendChild(time);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  return messageDiv;
}

// Format file size helper
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// Send message
async function sendMessage(content, type = 'text', fileUrl = null) {
  console.log('sendMessage called:', { content, type, fileUrl });
  
  if (!currentConversationId) {
    // Create new conversation first
    await createConversation();
  }
  
  if (!content && !fileUrl) return;
  
  try {
    const token = localStorage.getItem('token');
    const messageData = {
      conversation_id: currentConversationId,
      content: content,
      message_type: type,
      file_url: fileUrl
    };
    console.log('Sending message data:', messageData);
    
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conversation_id: currentConversationId,
        content: content,
        message_type: type,
        file_url: fileUrl
      })
    });
    
    if (response.ok) {
      const newMessage = await response.json();
      console.log('Message sent successfully:', newMessage);
      addMessageToUI(newMessage, true);
      document.getElementById('messageInput').value = '';
    } else {
      const errorText = await response.text();
      console.error('Failed to send message:', errorText);
      alert('Failed to send message');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message');
  }
}

// Add message to UI
function addMessageToUI(msg, isSent) {
  const container = document.getElementById('messagesContainer');
  const messageEl = createMessageElement(msg, isSent);
  container.appendChild(messageEl);
  
  // Auto scroll to bottom
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// Create conversation
async function createConversation() {
  if (!currentChatUser) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        participant_ids: [currentChatUser.id],
        name: currentChatUser.display_name || currentChatUser.username
      })
    });
    
    if (response.ok) {
      const conversation = await response.json();
      currentConversationId = conversation.id;
      return conversation;
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
  }
}

// Event listeners for chat
document.addEventListener('DOMContentLoaded', () => {
  // Send button
  const btnSend = document.getElementById('btnSend');
  const messageInput = document.getElementById('messageInput');
  
  if (btnSend) {
    btnSend.addEventListener('click', () => {
      const content = messageInput.value.trim();
      if (content) {
        sendMessage(content);
      }
    });
  }
  
  // Enter key to send
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (content) {
          sendMessage(content);
        }
      }
    });
  }
  
  // Emoji picker toggle
  const btnEmoji = document.getElementById('btnEmoji');
  const emojiPicker = document.getElementById('emojiPicker');
  
  if (btnEmoji && emojiPicker) {
    btnEmoji.addEventListener('click', () => {
      emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });
    
    // Emoji click
    emojiPicker.querySelectorAll('.emoji').forEach(emoji => {
      emoji.addEventListener('click', () => {
        messageInput.value += emoji.textContent;
        messageInput.focus();
      });
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!btnEmoji.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.style.display = 'none';
      }
    });
  }
  
  // Attach image
  const btnAttachImage = document.getElementById('btnAttachImage');
  const imageInput = document.getElementById('imageInput');
  
  if (btnAttachImage && imageInput) {
    btnAttachImage.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await uploadAndSendFile(file, 'image');
      }
    });
  }
  
  // Attach file
  const btnAttachFile = document.getElementById('btnAttachFile');
  const fileInput = document.getElementById('fileInput');
  
  if (btnAttachFile && fileInput) {
    btnAttachFile.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await uploadAndSendFile(file, 'file');
      }
    });
  }
});

// Upload and send file
async function uploadAndSendFile(file, type) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/cloud/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Upload result:', result);
      const content = type === 'image' ? file.name : `Sent a file: ${file.name}`;
      console.log('Sending message with file_url:', result.file_url);
      await sendMessage(content, type, result.file_url);
      
      // Reset file input
      const fileInput = type === 'image' ? document.getElementById('imageInput') : document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
    } else {
      const errorText = await response.text();
      console.error('Upload failed:', errorText);
      alert('Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file');
  }
}

// Refresh messages without clearing UI (smooth update)
async function refreshMessages(conversationId) {
  if (!conversationId) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const messages = await response.json();
      const container = document.getElementById('messagesContainer');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get current message count
      const currentMessageCount = container.querySelectorAll('.message').length;
      
      // If new messages arrived, append them
      if (messages.length > currentMessageCount) {
        const newMessages = messages.slice(currentMessageCount);
        newMessages.forEach(msg => {
          const isSent = msg.sender_id === currentUser.id;
          const messageEl = createMessageElement(msg, isSent);
          container.appendChild(messageEl);
        });
        
        // Auto scroll to bottom to show new messages
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    }
  } catch (error) {
    console.error('Error refreshing messages:', error);
  }
}

// Load conversations list
async function loadConversationsList() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const conversations = await response.json();
      const chatList = document.querySelector('.chat-list');
      if (!chatList) return;
      
      chatList.innerHTML = ''; // Clear existing
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      conversations.forEach(conv => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        
        let displayName = '';
        let avatarText = 'G';
        let statusText = 'Online';
        
        if (conv.is_group) {
          // Group conversation
          displayName = conv.name || 'Nhóm chat';
          avatarText = displayName.charAt(0).toUpperCase();
          statusText = `${conv.participants?.length || 0} thành viên`;
        } else {
          // 1-on-1 conversation
          const otherUser = conv.participants?.find(p => p.id !== currentUser.id) || {};
          displayName = otherUser.display_name || otherUser.username || 'User';
          avatarText = displayName.charAt(0).toUpperCase();
          statusText = 'Online';
        }
        
        chatItem.innerHTML = `
          <div class="avatar ${conv.is_group ? '' : 'online'}">${avatarText}</div>
          <div class="chat-info">
            <div class="chat-header">
              <h4>${displayName}</h4>
              <span class="time">Mới</span>
            </div>
            <p class="last-message">${conv.is_group ? statusText : 'Bắt đầu cuộc trò chuyện...'}</p>
          </div>
        `;
        
        chatItem.addEventListener('click', () => {
          document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
          chatItem.classList.add('active');
          
          if (conv.is_group) {
            openGroupChat(conv);
          } else {
            const otherUser = conv.participants?.find(p => p.id !== currentUser.id) || {};
            openChat(otherUser, conv);
          }
        });
        
        chatList.appendChild(chatItem);
      });
    }
  } catch (error) {
    console.error('Error loading conversations:', error);
  }
}

// Auto-reload conversations every 5 seconds
let conversationsInterval;

function startConversationsAutoReload() {
  // Clear any existing interval
  if (conversationsInterval) {
    clearInterval(conversationsInterval);
  }
  
  // Load immediately
  loadConversationsList();
  
  // Then reload every 5 seconds
  conversationsInterval = setInterval(() => {
    loadConversationsList();
  }, 5000);
}

// Start auto-reload when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startConversationsAutoReload);
} else {
  startConversationsAutoReload();
}

// ============= CREATE GROUP FUNCTIONALITY =============

let selectedGroupMembers = [];

// Open create group modal
function openCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  selectedGroupMembers = [];
  updateSelectedMembersDisplay();
  document.getElementById('groupNameInput').value = '';
  document.getElementById('groupMemberSearch').value = '';
  document.getElementById('groupSearchResults').innerHTML = '';
}

// Close create group modal
function closeCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  selectedGroupMembers = [];
}

// Update selected members display
function updateSelectedMembersDisplay() {
  const container = document.getElementById('selectedMembers');
  
  if (selectedGroupMembers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">Chưa chọn thành viên nào</p>';
  } else {
    container.innerHTML = selectedGroupMembers.map(member => `
      <div class="member-tag">
        <span>${member.display_name}</span>
        <button class="remove-member" onclick="removeMember(${member.id})">
          <span class="material-icons" style="font-size: 16px;">close</span>
        </button>
      </div>
    `).join('');
  }
  
  // Update button state
  const createBtn = document.getElementById('btnCreateGroupSubmit');
  if (selectedGroupMembers.length < 2) {
    createBtn.disabled = true;
    createBtn.title = 'Cần ít nhất 3 người (bạn + 2 người khác)';
  } else {
    createBtn.disabled = false;
    createBtn.title = '';
  }
}

// Remove member from selection
function removeMember(userId) {
  selectedGroupMembers = selectedGroupMembers.filter(m => m.id !== userId);
  updateSelectedMembersDisplay();
  
  // Update search results to reflect deselection
  const resultItem = document.querySelector(`.search-result-item[data-user-id="${userId}"]`);
  if (resultItem) {
    resultItem.classList.remove('selected');
  }
}

// Toggle member selection
function toggleMemberSelection(user) {
  const index = selectedGroupMembers.findIndex(m => m.id === user.id);
  
  if (index === -1) {
    // Add member
    selectedGroupMembers.push(user);
  } else {
    // Remove member
    selectedGroupMembers.splice(index, 1);
  }
  
  updateSelectedMembersDisplay();
}

// Handle member click from search results
function handleMemberClick(element) {
  const userData = element.getAttribute('data-user');
  const user = JSON.parse(userData);
  toggleMemberSelection(user);
  element.classList.toggle('selected');
}

// Search for group members
async function searchGroupMembers(query) {
  const resultsDiv = document.getElementById('groupSearchResults');
  
  if (!query.trim()) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Search failed');
    
    const users = await response.json();
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Filter out current user
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    
    if (filteredUsers.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Không tìm thấy người dùng</p>';
      return;
    }
    
    resultsDiv.innerHTML = filteredUsers.map(user => {
      const isSelected = selectedGroupMembers.some(m => m.id === user.id);
      const userJson = JSON.stringify(user);
      return `
        <div class="search-result-item ${isSelected ? 'selected' : ''}" data-user-id="${user.id}" data-user='${userJson.replace(/'/g, "&apos;")}' onclick="handleMemberClick(this)">
          <div class="avatar">${user.display_name.charAt(0).toUpperCase()}</div>
          <div class="search-result-info">
            <div class="name">${user.display_name}</div>
            <div class="phone">${user.phone || user.email}</div>
          </div>
          ${isSelected ? '<span class="material-icons" style="color: var(--accent);">check_circle</span>' : ''}
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error searching members:', error);
    resultsDiv.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Lỗi tìm kiếm</p>';
  }
}

// Create group
async function createGroup() {
  const groupName = document.getElementById('groupNameInput').value.trim();
  
  if (!groupName) {
    alert('Vui lòng nhập tên nhóm!');
    return;
  }
  
  if (selectedGroupMembers.length < 2) {
    alert('Vui lòng chọn ít nhất 2 thành viên khác (tổng cộng tối thiểu 3 người)!');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Include current user + selected members
    const participantIds = [currentUser.id, ...selectedGroupMembers.map(m => m.id)];
    
    const response = await fetch(`${API_URL}/conversations/group`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: groupName,
        participant_ids: participantIds,
        is_group: true
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create group');
    }
    
    const group = await response.json();
    console.log('Group created:', group);
    
    // Close modal
    closeCreateGroupModal();
    
    // Reload conversations
    await loadConversationsList();
    
    alert(`Đã tạo nhóm "${groupName}" thành công!`);
    
  } catch (error) {
    console.error('Error creating group:', error);
    alert('Không thể tạo nhóm: ' + error.message);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Create group button
  const btnCreateGroup = document.getElementById('btnCreateGroup');
  if (btnCreateGroup) {
    btnCreateGroup.addEventListener('click', openCreateGroupModal);
  }
  
  // Create group submit button
  const btnCreateGroupSubmit = document.getElementById('btnCreateGroupSubmit');
  if (btnCreateGroupSubmit) {
    btnCreateGroupSubmit.addEventListener('click', createGroup);
  }
  
  // Group member search
  const groupMemberSearch = document.getElementById('groupMemberSearch');
  if (groupMemberSearch) {
    let searchTimeout;
    groupMemberSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchGroupMembers(e.target.value);
      }, 300);
    });
  }
  
  // Close modal on background click
  const modal = document.getElementById('createGroupModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeCreateGroupModal();
      }
    });
  }
});
