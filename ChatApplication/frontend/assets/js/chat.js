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
  bubble.textContent = msg.content || msg.message_text;
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = formatTime(msg.created_at || msg.timestamp);
  
  content.appendChild(bubble);
  content.appendChild(time);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  return messageDiv;
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// Send message
async function sendMessage(content, type = 'text', fileUrl = null) {
  if (!currentConversationId) {
    // Create new conversation first
    await createConversation();
  }
  
  if (!content && !fileUrl) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        conversation_id: currentConversationId,
        content: content,
        message_type: type
      })
    });
    
    if (response.ok) {
      const newMessage = await response.json();
      addMessageToUI(newMessage, true);
      document.getElementById('messageInput').value = '';
    } else {
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
      await sendMessage(`Sent a ${type}: ${file.name}`, type, result.file_url);
    } else {
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
      
      conversations.forEach(conv => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        
        const otherUser = conv.participants?.find(p => p.id !== JSON.parse(localStorage.getItem('user')).id) || {};
        
        chatItem.innerHTML = `
          <div class="avatar online">${(otherUser.display_name || otherUser.username || 'U').charAt(0).toUpperCase()}</div>
          <div class="chat-info">
            <div class="chat-header">
              <h4>${otherUser.display_name || otherUser.username || 'User'}</h4>
              <span class="time">Mới</span>
            </div>
            <p class="last-message">Bắt đầu cuộc trò chuyện...</p>
          </div>
        `;
        
        chatItem.addEventListener('click', () => {
          document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
          chatItem.classList.add('active');
          openChat(otherUser, conv);
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
