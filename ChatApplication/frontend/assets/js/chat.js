// Chat page specific scripts
// API_URL already declared in script.js

console.log('========== CHAT.JS LOADED ==========');

// Toast notification function
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  else if (type === 'error') icon = 'error';
  else if (type === 'warning') icon = 'warning';
  
  toast.innerHTML = `
    <span class="material-icons">${icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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

  // WebSocket connection
  let ws = null;
  
  function connectWebSocket() {
    if (!currentUser.id) {
      console.warn('No user ID found - cannot connect WebSocket');
      return;
    }
    
    ws = new WebSocket(`ws://localhost:8000/api/messages/ws/${currentUser.id}`);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message:', data);
      
      if (data.type === 'new_message') {
        handleNewMessage(data.message);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected - reconnecting in 3s...');
      setTimeout(connectWebSocket, 3000);
    };
  }
  
  function handleNewMessage(message) {
    // Update conversation list if needed
    loadConversations();
    
    // If this message is for the current open conversation, display it
    if (currentConversationId === message.conversation_id) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const isSent = message.sender_id === currentUser.id;
      addMessageToUI(message, isSent);
    }
  }
  
  // Connect WebSocket on load
  connectWebSocket();

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
    
    showMessage(`Bắt đầu chat với ${user.display_name}!`, 'success');
    
  } catch (error) {
    console.error('Error starting chat:', error);
    showMessage('Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại!', 'error');
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
  chatItem.setAttribute('data-conversation-id', conversation.id);
  
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
  
  // Add right-click context menu handler
  chatItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showChatItemContextMenu(e, conversation.id);
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
let currentConversation = null;
let currentConversationId = null;

// Open chat with a user
function openChat(user, conversation) {
  currentChatUser = user;
  currentConversation = conversation;
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
  
  // Update info panel if it's open
  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel && infoPanel.style.display === 'flex') {
    loadInfoPanelData();
  }
}

// Open group chat
function openGroupChat(conversation) {
  currentChatUser = null;
  currentConversation = conversation;
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
  
  // Update info panel if it's open
  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel && infoPanel.style.display === 'flex') {
    loadInfoPanelData();
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
      allMessages = messages; // Cache messages for search
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
    
    // Mark as read if message is received and not yet read
    if (!isSent && !msg.is_read) {
      markMessageAsRead(msg.id);
    }
  });
  
  // Auto scroll to bottom
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

// Load info panel data
function loadInfoPanelData() {
  if (!allMessages) return;
  
  const btnLeaveGroup = document.getElementById('btnLeaveGroup');
  const btnCreateGroupFromInfo = document.getElementById('btnCreateGroupFromInfo');
  const btnAddMembers = document.getElementById('btnAddMembers');
  
  // Update info based on conversation type
  if (currentConversation?.is_group) {
    // Group conversation
    document.getElementById('infoUserAvatar').textContent = (currentConversation.name || 'G').charAt(0).toUpperCase();
    document.getElementById('infoUserName').textContent = currentConversation.name || 'Nhóm chat';
    document.getElementById('infoUserStatus').textContent = `${currentConversation.participants?.length || 0} thành viên`;
    
    // Show leave group and add members buttons, hide create group button
    if (btnLeaveGroup) btnLeaveGroup.style.display = 'flex';
    if (btnAddMembers) btnAddMembers.style.display = 'flex';
    if (btnCreateGroupFromInfo) btnCreateGroupFromInfo.style.display = 'none';
  } else if (currentChatUser) {
    // 1-on-1 conversation
    document.getElementById('infoUserAvatar').textContent = currentChatUser.display_name?.charAt(0) || 'U';
    document.getElementById('infoUserName').textContent = currentChatUser.display_name || currentChatUser.username;
    document.getElementById('infoUserStatus').textContent = currentChatUser.is_online ? 'Online' : 'Offline';
    
    // Hide leave group and add members buttons, show create group button
    if (btnLeaveGroup) btnLeaveGroup.style.display = 'none';
    if (btnAddMembers) btnAddMembers.style.display = 'none';
    if (btnCreateGroupFromInfo) btnCreateGroupFromInfo.style.display = 'flex';
  } else {
    return;
  }
  
  // Filter media (images) and files
  const mediaMessages = allMessages.filter(msg => msg.message_type === 'image' && msg.file_url);
  const fileMessages = allMessages.filter(msg => msg.message_type === 'file' && msg.file_url);
  
  // Load media grid
  const mediaGrid = document.getElementById('mediaGrid');
  mediaGrid.innerHTML = '';
  
  if (mediaMessages.length === 0) {
    mediaGrid.innerHTML = '<div class="media-grid-empty">Chưa có ảnh/video nào</div>';
  } else {
    mediaMessages.slice(-9).reverse().forEach(msg => {
      const mediaItem = document.createElement('div');
      mediaItem.className = 'media-item';
      mediaItem.innerHTML = `<img src="http://localhost:8000${msg.file_url}" alt="Image" />`;
      mediaItem.onclick = () => window.open(`http://localhost:8000${msg.file_url}`, '_blank');
      mediaGrid.appendChild(mediaItem);
    });
  }
  
  // Load files list
  const filesList = document.getElementById('filesList');
  filesList.innerHTML = '';
  
  if (fileMessages.length === 0) {
    filesList.innerHTML = '<div class="files-list-empty">Chưa có file nào</div>';
  } else {
    fileMessages.slice(-10).reverse().forEach(msg => {
      const fileName = msg.content.replace('Sent a file: ', '');
      const fileExt = fileName.split('.').pop().toUpperCase();
      
      let iconBg = '#4285F4';
      let iconText = 'F';
      if (['DOC', 'DOCX'].includes(fileExt)) {
        iconBg = '#2B579A';
        iconText = 'W';
      } else if (['XLS', 'XLSX'].includes(fileExt)) {
        iconBg = '#217346';
        iconText = 'X';
      } else if (['PDF'].includes(fileExt)) {
        iconBg = '#D32F2F';
        iconText = 'P';
      }
      
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-icon" style="background: ${iconBg}">${iconText}</div>
        <div class="file-info">
          <div class="file-name">${fileName}</div>
          <div class="file-size">${fileExt}</div>
        </div>
      `;
      fileItem.onclick = () => window.open(`http://localhost:8000${msg.file_url}`, '_blank');
      filesList.appendChild(fileItem);
    });
  }
}

// Pin conversation to top
function pinConversation() {
  if (!currentConversationId || !currentChatUser) {
    showMessage('Không có cuộc hội thoại nào để ghim!', 'warning');
    return;
  }
  
  const chatList = document.querySelector('.chat-list');
  const currentChatItem = chatList.querySelector(`[data-conversation-id="${currentConversationId}"]`);
  
  if (!currentChatItem) {
    showMessage('Không tìm thấy cuộc hội thoại!', 'error');
    return;
  }
  
  // Toggle pinned class
  const isPinned = currentChatItem.classList.contains('pinned');
  
  if (isPinned) {
    // Unpin
    currentChatItem.classList.remove('pinned');
    // Move back to original position (just after other pinned items)
    const firstUnpinned = chatList.querySelector('.chat-item:not(.pinned)');
    if (firstUnpinned && firstUnpinned !== currentChatItem) {
      chatList.insertBefore(currentChatItem, firstUnpinned);
    }
    showMessage('Đã bỏ ghim cuộc hội thoại!', 'info');
  } else {
    // Pin to top
    currentChatItem.classList.add('pinned');
    // Move to top of list (after all pinned items)
    const pinnedItems = chatList.querySelectorAll('.chat-item.pinned');
    if (pinnedItems.length > 1) {
      // Insert after last pinned item
      const lastPinned = pinnedItems[pinnedItems.length - 2];
      chatList.insertBefore(currentChatItem, lastPinned.nextSibling);
    } else {
      // First pinned item, move to very top
      chatList.insertBefore(currentChatItem, chatList.firstChild);
    }
    showMessage('Đã ghim cuộc hội thoại lên đầu!', 'success');
  }
  
  // Update button text
  const btnPinConversation = document.getElementById('btnPinConversation');
  if (btnPinConversation) {
    const btnText = btnPinConversation.querySelector('span:last-child');
    if (btnText) {
      btnText.textContent = isPinned ? 'Ghim hội thoại' : 'Bỏ ghim hội thoại';
    }
  }
}

// Create message element
function createMessageElement(msg, isSent) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  messageDiv.setAttribute('data-message-id', msg.id); // Add message ID for search scroll
  
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

    // Share button
    const shareBtn = document.createElement('div');
    shareBtn.innerHTML = '<span class="material-icons" style="font-size: 18px;">share</span>';
    shareBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 6px; border-radius: 50%; cursor: pointer; z-index: 2; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;';
    shareBtn.onmouseover = () => shareBtn.style.background = 'rgba(0,0,0,0.8)';
    shareBtn.onmouseout = () => shareBtn.style.background = 'rgba(0,0,0,0.6)';
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      openShareModal(msg);
    };
    imgContainer.appendChild(shareBtn);
    
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
    // Display file card - simple and clean design
    const fileCard = document.createElement('div');
    fileCard.style.cssText = 'cursor: pointer; user-select: none;';
    
    const fileName = msg.content.replace('Sent a file: ', '');
    const fileExt = fileName.split('.').pop().toUpperCase();
    
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
    } else if (['TXT', 'LOG'].includes(fileExt)) {
      iconBg = '#5F6368';
      iconText = 'T';
    } else {
      iconBg = '#4285F4';
      iconText = 'F';
    }
    
    fileCard.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: ${isSent ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; border-radius: 8px; max-width: 280px; transition: all 0.2s ease; border: 1px solid ${isSent ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};" onmouseover="this.style.background='${isSent ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}'" onmouseout="this.style.background='${isSent ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}'">
        <div style="width: 28px; height: 28px; background: ${iconBg}; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 700; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.15);">
          ${iconText}
        </div>
        <div style="flex: 1; min-width: 0; line-height: 1.2;">
          <div style="font-weight: 600; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${isSent ? 'white' : 'var(--text)'};">${fileName}</div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 1px; color: ${isSent ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'};">${fileExt}</div>
        </div>
        <div style="display: flex; gap: 4px; flex-shrink: 0;">
          <div class="share-file-btn" style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">
            <span class="material-icons" style="font-size: 14px;">share</span>
          </div>
          <a href="http://localhost:8000${fileUrl}" download="${fileName}" style="width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.25)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'">
            <span style="font-size: 13px;">📥</span>
          </a>
        </div>
      </div>
    `;
    
    // Add share button click handler
    setTimeout(() => {
      const shareFileBtn = fileCard.querySelector('.share-file-btn');
      if (shareFileBtn) {
        shareFileBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openShareModal(msg);
        };
      }
    }, 0);
    
    bubble.appendChild(fileCard);
    bubble.style.padding = '0';
    bubble.style.background = 'transparent';
  } else {
    // Regular text message
    bubble.textContent = msg.content || msg.message_text;
  }
  
  // Add reply preview if this message is replying to another
  if (msg.reply_to_id && msg.reply_to) {
    console.log('Reply message data:', msg.reply_to);
    const replyDiv = document.createElement('div');
    replyDiv.className = 'message-reply';
    replyDiv.onclick = () => scrollToMessage(msg.reply_to_id);
    
    const replySender = document.createElement('div');
    replySender.className = 'message-reply-sender';
    replySender.textContent = msg.reply_to.sender_id === msg.sender_id ? 'Chính mình' : (msg.reply_to.sender?.display_name || 'User');
    
    const replyText = document.createElement('div');
    replyText.className = 'message-reply-text';
    replyText.textContent = msg.reply_to.content || (msg.reply_to.message_type === 'image' ? '📷 Ảnh' : '📎 File');
    
    replyDiv.appendChild(replySender);
    replyDiv.appendChild(replyText);
    bubble.insertBefore(replyDiv, bubble.firstChild);
  }
  
  // Add message actions (reply button)
  const actions = document.createElement('div');
  actions.className = 'message-actions';
  
  const replyBtn = document.createElement('button');
  replyBtn.className = 'btn-icon';
  replyBtn.title = 'Trả lời';
  replyBtn.innerHTML = '<span class="material-icons">reply</span>';
  replyBtn.onclick = () => setReplyMessage(msg);
  
  actions.appendChild(replyBtn);
  messageDiv.appendChild(actions);
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = formatTime(msg.created_at || msg.timestamp);
  
  // Add read receipt for sent messages
  if (isSent) {
    const receipt = document.createElement('span');
    receipt.className = 'read-receipt';
    receipt.innerHTML = msg.is_read 
      ? '<span class="material-icons" style="font-size: 14px; color: #FFC107;">done_all</span>' 
      : '<span class="material-icons" style="font-size: 14px; color: rgba(255,255,255,0.6);">done</span>';
    receipt.title = msg.is_read ? 'Đã xem' : 'Đã gửi';
    time.appendChild(receipt);
  }
  
  content.appendChild(bubble);
  content.appendChild(time);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  // Add context menu on right click (only for sent messages)
  if (isSent) {
    messageDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showMessageContextMenu(e, msg);
    });
  }
  
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

// Message Context Menu
let currentContextMessage = null;

function showMessageContextMenu(event, message) {
  const contextMenu = document.getElementById('messageContextMenu');
  currentContextMessage = message;
  
  // Position the menu
  contextMenu.style.display = 'block';
  contextMenu.style.left = event.pageX + 'px';
  contextMenu.style.top = event.pageY + 'px';
  
  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
  }, 10);
}

function closeContextMenu() {
  const contextMenu = document.getElementById('messageContextMenu');
  contextMenu.style.display = 'none';
  currentContextMessage = null;
  document.removeEventListener('click', closeContextMenu);
}

// Delete message
async function deleteMessage(messageId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8000/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
    
    // Remove message from UI
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        messageElement.remove();
      }, 300);
    }
    
    // Reload messages to sync
    loadMessages(currentConversationId);
    
  } catch (error) {
    console.error('Error deleting message:', error);
    showMessage('Không thể thu hồi tin nhắn. Vui lòng thử lại.', 'error');
  }
}

// Show context menu for chat items
function showChatItemContextMenu(event, conversationId) {
  const menu = document.getElementById('chatItemContextMenu');
  menu.style.display = 'block';
  menu.style.left = event.pageX + 'px';
  menu.style.top = event.pageY + 'px';
  
  // Store conversation ID for deletion
  menu.dataset.conversationId = conversationId;
}

// Close chat item context menu
function closeChatItemContextMenu() {
  const menu = document.getElementById('chatItemContextMenu');
  menu.style.display = 'none';
}

// Delete conversation
async function deleteConversation(conversationId) {
  if (!confirm('Bạn có chắc chắn muốn xóa hội thoại này?')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
    
    // Remove from chat list
    const chatItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    if (chatItem) {
      chatItem.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        chatItem.remove();
      }, 300);
    }
    
    // If this was the active conversation, clear the chat view
    if (currentConversationId === conversationId) {
      const emptyState = document.querySelector('.empty-state');
      const normalChat = document.getElementById('normal-chat');
      if (emptyState) emptyState.style.display = 'flex';
      if (normalChat) normalChat.style.display = 'none';
      currentConversationId = null;
      currentChatUser = null;
    }
    
    showMessage('Đã xóa hội thoại thành công!', 'success');
    
  } catch (error) {
    console.error('Error deleting conversation:', error);
    showMessage('Không thể xóa hội thoại. Vui lòng thử lại.', 'error');
  }
}

// Leave group
async function leaveGroup() {
  if (!currentConversation?.is_group || !currentConversationId) {
    showMessage('Bạn không ở trong nhóm nào!', 'warning');
    return;
  }
  
  if (!confirm(`Bạn có chắc chắn muốn rời khỏi nhóm "${currentConversation.name}"?`)) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/conversations/${currentConversationId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to leave group');
    }
    
    // Remove from chat list
    const chatItem = document.querySelector(`[data-conversation-id="${currentConversationId}"]`);
    if (chatItem) {
      chatItem.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        chatItem.remove();
      }, 300);
    }
    
    // Clear chat view and close info panel
    const emptyState = document.querySelector('.empty-state');
    const normalChat = document.getElementById('normal-chat');
    const infoPanel = document.getElementById('infoPanel');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (normalChat) {
      normalChat.style.display = 'none';
      normalChat.classList.remove('info-open');
    }
    if (infoPanel) infoPanel.style.display = 'none';
    
    currentConversationId = null;
    currentChatUser = null;
    currentConversation = null;
    
    showMessage('Đã rời nhóm thành công!', 'success');
    
  } catch (error) {
    console.error('Error leaving group:', error);
    showMessage('Không thể rời nhóm. Vui lòng thử lại.', 'error');
  }
}

// Add members to group
async function addMembersToGroup() {
  if (!currentConversation?.is_group || !currentConversationId) {
    showMessage('Chức năng này chỉ dành cho nhóm!', 'warning');
    return;
  }
  
  if (selectedMembersToAdd.length === 0) {
    showMessage('Vui lòng chọn ít nhất một thành viên!', 'warning');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const userIds = selectedMembersToAdd.map(m => m.id);
    
    const response = await fetch(`${API_URL}/conversations/${currentConversationId}/add-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userIds)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add members');
    }
    
    const updatedConversation = await response.json();
    
    // Update current conversation
    currentConversation = updatedConversation;
    
    // Reload conversation list and info panel
    await loadConversations();
    loadInfoPanelData();
    
    showMessage(`Đã thêm ${selectedMembersToAdd.length} thành viên vào nhóm!`, 'success');
    closeAddMembersModal();
  } catch (error) {
    console.error('Error adding members:', error);
    showMessage(error.message || 'Không thể thêm thành viên. Vui lòng thử lại.', 'error');
  }
}


// Mark message as read
async function markMessageAsRead(messageId) {
  try {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:8000/api/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
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
      file_url: fileUrl,
      reply_to_id: currentReplyMessage ? currentReplyMessage.id : null
    };
    console.log('Sending message data:', messageData);
    
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messageData)
    });
    
    if (response.ok) {
      const newMessage = await response.json();
      console.log('Message sent successfully:', newMessage);
      // Don't add to UI here - WebSocket will handle it
      document.getElementById('messageInput').value = '';
      
      // Clear reply after sending
      if (currentReplyMessage) {
        cancelReply();
      }
    } else {
      const errorText = await response.text();
      console.error('Failed to send message:', errorText);
      showMessage('Không thể gửi tin nhắn', 'error');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showMessage('Lỗi khi gửi tin nhắn', 'error');
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
  
  // Search messages panel toggle
  const btnSearchMessages = document.getElementById('btnSearchMessages');
  const btnCloseSearch = document.getElementById('btnCloseSearch');
  const searchPanel = document.getElementById('searchPanel');
  const chatView = document.getElementById('normal-chat');
  const searchInputPanel = document.getElementById('searchInput');
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  
  if (btnSearchMessages && searchPanel) {
    btnSearchMessages.addEventListener('click', () => {
      searchPanel.style.display = 'flex';
      chatView.classList.add('with-search');
      if (searchInputPanel) searchInputPanel.focus();
    });
  }
  
  if (btnCloseSearch && searchPanel) {
    btnCloseSearch.addEventListener('click', () => {
      searchPanel.style.display = 'none';
      chatView.classList.remove('with-search');
      if (searchInputPanel) searchInputPanel.value = '';
      showEmptySearchState();
    });
  }
  
  // Search input handler
  if (searchInputPanel) {
    let searchTimeout;
    searchInputPanel.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();
      
      if (!query) {
        showEmptySearchState();
        return;
      }
      
      // Debounce search
      searchTimeout = setTimeout(() => {
        searchMessages(query);
      }, 300);
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
      
      // Deduplicate conversations - keep only the most recent conversation for each unique user/group
      const seenUsers = new Map();
      const uniqueConversations = [];
      
      conversations.forEach(conv => {
        if (conv.is_group) {
          // Keep all group conversations
          uniqueConversations.push(conv);
        } else {
          // For 1-on-1, keep only the first occurrence (most recent)
          const otherUser = conv.participants?.find(p => p.id !== currentUser.id);
          if (otherUser && !seenUsers.has(otherUser.id)) {
            seenUsers.set(otherUser.id, true);
            uniqueConversations.push(conv);
          }
        }
      });
      
      uniqueConversations.forEach(conv => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.setAttribute('data-conversation-id', conv.id);
        
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
        
        // Add right-click context menu
        chatItem.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showChatItemContextMenu(e, conv.id);
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

// Add Members Modal functions
let selectedMembersToAdd = [];

// Open add members modal
function openAddMembersModal() {
  const modal = document.getElementById('addMembersModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  selectedMembersToAdd = [];
  updateSelectedMembersToAddDisplay();
  document.getElementById('addMemberSearch').value = '';
  document.getElementById('addMemberSearchResults').innerHTML = '';
}

// Close add members modal
function closeAddMembersModal() {
  const modal = document.getElementById('addMembersModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  selectedMembersToAdd = [];
}

// Update selected members to add display
function updateSelectedMembersToAddDisplay() {
  const container = document.getElementById('selectedMembersToAdd');
  
  if (selectedMembersToAdd.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">Chưa chọn thành viên nào</p>';
  } else {
    container.innerHTML = selectedMembersToAdd.map(member => `
      <div class="member-tag">
        <span>${member.display_name}</span>
        <button class="remove-member" onclick="removeMemberToAdd(${member.id})">
          <span class="material-icons" style="font-size: 16px;">close</span>
        </button>
      </div>
    `).join('');
  }
  
  // Update button state
  const addBtn = document.getElementById('btnAddMembersSubmit');
  if (selectedMembersToAdd.length === 0) {
    addBtn.disabled = true;
  } else {
    addBtn.disabled = false;
  }
}

// Remove member from add selection
function removeMemberToAdd(userId) {
  selectedMembersToAdd = selectedMembersToAdd.filter(m => m.id !== userId);
  updateSelectedMembersToAddDisplay();
  
  // Update search results to reflect deselection
  const resultItem = document.querySelector(`#addMemberSearchResults .search-result-item[data-user-id="${userId}"]`);
  if (resultItem) {
    resultItem.classList.remove('selected');
  }
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

// Toggle member selection for add members
function toggleMemberToAddSelection(user) {
  const index = selectedMembersToAdd.findIndex(m => m.id === user.id);
  
  if (index === -1) {
    // Check if user is already in the group
    const currentParticipantIds = currentConversation?.participants?.map(p => p.id) || [];
    if (currentParticipantIds.includes(user.id)) {
      showMessage('Người này đã có trong nhóm', 'warning');
      return;
    }
    // Add member
    selectedMembersToAdd.push(user);
  } else {
    // Remove member
    selectedMembersToAdd.splice(index, 1);
  }
  
  updateSelectedMembersToAddDisplay();
}

// Handle member click from add members search results
function handleMemberToAddClick(element) {
  const userData = element.getAttribute('data-user');
  const user = JSON.parse(userData);
  toggleMemberToAddSelection(user);
  element.classList.toggle('selected');
}

// Search for members to add
async function searchMembersToAdd(query) {
  const resultsDiv = document.getElementById('addMemberSearchResults');
  
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
    const currentParticipantIds = currentConversation?.participants?.map(p => p.id) || [];
    
    // Filter out current user and existing participants
    const filteredUsers = users.filter(u => 
      u.id !== currentUser.id && !currentParticipantIds.includes(u.id)
    );
    
    if (filteredUsers.length === 0) {
      resultsDiv.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Không tìm thấy người dùng mới</p>';
      return;
    }
    
    resultsDiv.innerHTML = filteredUsers.map(user => {
      const isSelected = selectedMembersToAdd.some(m => m.id === user.id);
      const userJson = JSON.stringify(user);
      return `
        <div class="search-result-item ${isSelected ? 'selected' : ''}" data-user-id="${user.id}" data-user='${userJson.replace(/'/g, "&apos;")}' onclick="handleMemberToAddClick(this)">
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
    console.error('Search error:', error);
    resultsDiv.innerHTML = '<p style="text-align: center; color: var(--error); padding: 20px;">Lỗi tìm kiếm</p>';
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
    showMessage('Vui lòng nhập tên nhóm!', 'warning');
    return;
  }
  
  if (selectedGroupMembers.length < 2) {
    showMessage('Vui lòng chọn ít nhất 2 thành viên khác (tổng cộng tối thiểu 3 người)!', 'warning');
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
    
    showMessage(`Đã tạo nhóm "${groupName}" thành công!`, 'success');
    
  } catch (error) {
    console.error('Error creating group:', error);
    showMessage('Không thể tạo nhóm: ' + error.message, 'error');
  }
}

// ============= SHARE FILE/IMAGE FUNCTIONALITY =============

let currentShareMessage = null;
let selectedRecipients = [];

// Open share modal
function openShareModal(message) {
  currentShareMessage = message;
  selectedRecipients = [];
  
  const modal = document.getElementById('shareModal');
  modal.classList.add('active');
  modal.style.display = 'flex';
  
  updateSelectedRecipientsDisplay();
  document.getElementById('shareSearchInput').value = '';
  document.getElementById('shareSearchResults').innerHTML = '';
}

// Close share modal
function closeShareModal() {
  const modal = document.getElementById('shareModal');
  modal.classList.remove('active');
  modal.style.display = 'none';
  currentShareMessage = null;
  selectedRecipients = [];
}

// Update selected recipients display
function updateSelectedRecipientsDisplay() {
  const container = document.getElementById('selectedRecipients');
  
  if (selectedRecipients.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">Chưa chọn người nhận</p>';
  } else {
    container.innerHTML = selectedRecipients.map(recipient => `
      <div class="member-tag">
        <span>${recipient.display_name}</span>
        <button class="remove-member" onclick="removeRecipient(${recipient.id})">
          <span class="material-icons" style="font-size: 16px;">close</span>
        </button>
      </div>
    `).join('');
  }
  
  // Update button state
  const shareBtn = document.getElementById('btnShareSubmit');
  if (selectedRecipients.length === 0) {
    shareBtn.disabled = true;
  } else {
    shareBtn.disabled = false;
  }
}

// Remove recipient from selection
function removeRecipient(userId) {
  selectedRecipients = selectedRecipients.filter(r => r.id !== userId);
  updateSelectedRecipientsDisplay();
  
  // Update search results to reflect deselection
  const resultItem = document.querySelector(`.share-result-item[data-user-id="${userId}"]`);
  if (resultItem) {
    resultItem.classList.remove('selected');
  }
}

// Toggle recipient selection
function toggleRecipientSelection(user) {
  const index = selectedRecipients.findIndex(r => r.id === user.id);
  
  if (index === -1) {
    selectedRecipients.push(user);
  } else {
    selectedRecipients.splice(index, 1);
  }
  
  updateSelectedRecipientsDisplay();
}

// Handle recipient click from search results
function handleRecipientClick(element) {
  const userData = element.getAttribute('data-user');
  const user = JSON.parse(userData);
  toggleRecipientSelection(user);
  element.classList.toggle('selected');
}

// Search for recipients
async function searchShareRecipients(query) {
  const resultsDiv = document.getElementById('shareSearchResults');
  
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
      const isSelected = selectedRecipients.some(r => r.id === user.id);
      const userJson = JSON.stringify(user);
      return `
        <div class="search-result-item share-result-item ${isSelected ? 'selected' : ''}" data-user-id="${user.id}" data-user='${userJson.replace(/'/g, "&apos;")}' onclick="handleRecipientClick(this)">
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
    console.error('Error searching recipients:', error);
    resultsDiv.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Lỗi tìm kiếm</p>';
  }
}

// Share file/image
async function shareFile() {
  if (selectedRecipients.length === 0) {
    showMessage('Vui lòng chọn ít nhất 1 người nhận!', 'warning');
    return;
  }
  
  if (!currentShareMessage) {
    showMessage('Không tìm thấy file để chia sẻ!', 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // Share to each recipient
    for (const recipient of selectedRecipients) {
      // First, get all existing conversations to find if one already exists
      const allConvResponse = await fetch(`${API_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!allConvResponse.ok) continue;
      
      const allConversations = await allConvResponse.json();
      
      // Find existing 1-on-1 conversation with this recipient
      let conversation = allConversations.find(conv => 
        !conv.is_group && 
        conv.participants.some(p => p.id === recipient.id)
      );
      
      // If no existing conversation, create new one
      if (!conversation) {
        const convResponse = await fetch(`${API_URL}/conversations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            participant_ids: [currentUser.id, recipient.id],
            is_group: false,
            name: null
          })
        });
        
        if (!convResponse.ok) continue;
        conversation = await convResponse.json();
      }
      
      // Send the shared file/image to the existing or new conversation
      const msgResponse = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: conversation.id,
          content: currentShareMessage.content,
          message_type: currentShareMessage.message_type,
          file_url: currentShareMessage.file_url,
          file_name: currentShareMessage.file_name,
          file_size: currentShareMessage.file_size
        })
      });
      
      if (!msgResponse.ok) {
        console.error('Failed to share to', recipient.display_name);
      }
    }
    
    // Save count before closing modal
    const recipientCount = selectedRecipients.length;
    
    // Close modal
    closeShareModal();
    
    // Reload conversations to refresh the list
    await loadConversationsList();
    
    showMessage(`Đã chia sẻ thành công cho ${recipientCount} người!`, 'success');
    
  } catch (error) {
    console.error('Error sharing file:', error);
    showMessage('Không thể chia sẻ file: ' + error.message, 'error');
  }
}

// ========== REPLY MESSAGE FUNCTIONS ==========

let currentReplyMessage = null;

// Set reply message
function setReplyMessage(message) {
  currentReplyMessage = message;
  
  const replyPreview = document.getElementById('replyPreview');
  const replySender = replyPreview.querySelector('.reply-sender');
  const replyText = replyPreview.querySelector('.reply-text');
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const senderName = message.sender_id === currentUser.id ? 'Chính mình' : (currentChatUser?.display_name || 'User');
  
  replySender.textContent = senderName;
  
  // Set reply text based on message type
  if (message.message_type === 'image') {
    replyText.textContent = '📷 Ảnh';
  } else if (message.message_type === 'file') {
    replyText.textContent = `📎 ${message.file_name || 'File'}`;
  } else {
    replyText.textContent = message.content || '';
  }
  
  replyPreview.style.display = 'flex';
  
  // Focus on input
  document.getElementById('messageInput').focus();
}

// Cancel reply
function cancelReply() {
  currentReplyMessage = null;
  const replyPreview = document.getElementById('replyPreview');
  replyPreview.style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Cancel reply button
  const btnCancelReply = document.getElementById('btnCancelReply');
  if (btnCancelReply) {
    btnCancelReply.addEventListener('click', cancelReply);
  }
  
  // Context menu items
  const contextReply = document.getElementById('contextReply');
  const contextDelete = document.getElementById('contextDelete');
  
  if (contextReply) {
    contextReply.addEventListener('click', () => {
      if (currentContextMessage) {
        setReplyMessage(currentContextMessage);
        closeContextMenu();
      }
    });
  }
  
  if (contextDelete) {
    contextDelete.addEventListener('click', () => {
      if (currentContextMessage) {
        if (confirm('Bạn có chắc muốn thu hồi tin nhắn này?')) {
          deleteMessage(currentContextMessage.id);
          closeContextMenu();
        }
      }
    });
  }
  
  // Info panel toggle
  const btnToggleInfo = document.getElementById('btnToggleInfo');
  const btnCloseInfo = document.getElementById('btnCloseInfo');
  const infoPanel = document.getElementById('infoPanel');
  const normalChat = document.getElementById('normal-chat');
  
  if (btnToggleInfo) {
    btnToggleInfo.addEventListener('click', () => {
      if (infoPanel.style.display === 'none' || !infoPanel.style.display) {
        infoPanel.style.display = 'flex';
        if (normalChat) normalChat.classList.add('info-open');
        loadInfoPanelData();
      } else {
        infoPanel.style.display = 'none';
        if (normalChat) normalChat.classList.remove('info-open');
      }
    });
  }
  
  if (btnCloseInfo) {
    btnCloseInfo.addEventListener('click', () => {
      infoPanel.style.display = 'none';
      if (normalChat) normalChat.classList.remove('info-open');
    });
  }
  
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
  
  // Pin conversation button
  const btnPinConversation = document.getElementById('btnPinConversation');
  if (btnPinConversation) {
    btnPinConversation.addEventListener('click', () => {
      pinConversation();
    });
  }
  
  // Leave group button
  const btnLeaveGroup = document.getElementById('btnLeaveGroup');
  if (btnLeaveGroup) {
    btnLeaveGroup.addEventListener('click', () => {
      leaveGroup();
    });
  }
  
  // Add members button
  const btnAddMembers = document.getElementById('btnAddMembers');
  if (btnAddMembers) {
    btnAddMembers.addEventListener('click', () => {
      openAddMembersModal();
    });
  }
  
  // Add members submit button
  const btnAddMembersSubmit = document.getElementById('btnAddMembersSubmit');
  if (btnAddMembersSubmit) {
    btnAddMembersSubmit.addEventListener('click', addMembersToGroup);
  }
  
  // Add member search input
  const addMemberSearch = document.getElementById('addMemberSearch');
  if (addMemberSearch) {
    addMemberSearch.addEventListener('input', (e) => {
      searchMembersToAdd(e.target.value);
    });
  }
  
  // Create group from info panel
  const btnCreateGroupFromInfo = document.getElementById('btnCreateGroupFromInfo');
  if (btnCreateGroupFromInfo) {
    btnCreateGroupFromInfo.addEventListener('click', () => {
      // Close info panel
      const infoPanel = document.getElementById('infoPanel');
      const normalChat = document.getElementById('normal-chat');
      if (infoPanel) infoPanel.style.display = 'none';
      if (normalChat) normalChat.classList.remove('info-open');
      
      // Open create group modal
      openCreateGroupModal();
    });
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
  
  // Chat item context menu listeners
  const chatItemContextMenu = document.getElementById('chatItemContextMenu');
  if (chatItemContextMenu) {
    const contextDeleteConversation = document.getElementById('contextDeleteConversation');
    if (contextDeleteConversation) {
      contextDeleteConversation.addEventListener('click', () => {
        const conversationId = parseInt(chatItemContextMenu.dataset.conversationId);
        deleteConversation(conversationId);
        closeChatItemContextMenu();
      });
    }
  }
  
  // Close chat item context menu on click outside
  document.addEventListener('click', (e) => {
    const chatItemMenu = document.getElementById('chatItemContextMenu');
    if (chatItemMenu && !chatItemMenu.contains(e.target)) {
      closeChatItemContextMenu();
    }
  });
  
  // Close modal on background click
  const modal = document.getElementById('createGroupModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeCreateGroupModal();
      }
    });
  }
  
  // Share modal event listeners
  const btnShareSubmit = document.getElementById('btnShareSubmit');
  if (btnShareSubmit) {
    btnShareSubmit.addEventListener('click', shareFile);
  }
  
  const shareSearchInput = document.getElementById('shareSearchInput');
  if (shareSearchInput) {
    let shareSearchTimeout;
    shareSearchInput.addEventListener('input', (e) => {
      clearTimeout(shareSearchTimeout);
      shareSearchTimeout = setTimeout(() => {
        searchShareRecipients(e.target.value);
      }, 300);
    });
  }
  
  const shareModal = document.getElementById('shareModal');
  if (shareModal) {
    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        closeShareModal();
      }
    });
  }
});

// ========== MESSAGE SEARCH FUNCTIONS ==========

let allMessages = []; // Cache all messages for search

// Show empty search state
function showEmptySearchState() {
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  if (!searchResultsContainer) return;
  
  searchResultsContainer.innerHTML = `
    <div class="search-empty">
      <span class="material-icons">search</span>
      <p>Nhập từ khóa để tìm kiếm tin nhắn</p>
    </div>
  `;
}

// Search messages function
function searchMessages(query) {
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  if (!searchResultsContainer) return;
  
  // Filter messages that contain the search query
  const results = allMessages.filter(msg => {
    if (!msg.content) return false;
    return msg.content.toLowerCase().includes(query.toLowerCase());
  });
  
  if (results.length === 0) {
    searchResultsContainer.innerHTML = `
      <div class="no-results">
        <span class="material-icons">search_off</span>
        <p>Không tìm thấy tin nhắn nào</p>
      </div>
    `;
    return;
  }
  
  // Display results
  searchResultsContainer.innerHTML = results.map(msg => {
    const content = highlightText(msg.content, query);
    const date = formatMessageDate(msg.created_at);
    const senderName = msg.sender_username || 'Unknown';
    
    return `
      <div class="search-result-item" onclick="scrollToMessage(${msg.id})">
        <div class="search-result-sender">${senderName}</div>
        <div class="search-result-date">${date}</div>
        <div class="search-result-content">${content}</div>
      </div>
    `;
  }).join('');
}

// Highlight search text
function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Format message date for search results
function formatMessageDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // If today, show time
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // If within a week, show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  }
  
  // Otherwise, show date
  return date.toLocaleDateString('vi-VN');
}

// Scroll to specific message
function scrollToMessage(messageId) {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Highlight the message briefly
    messageElement.style.background = 'rgba(26, 115, 232, 0.1)';
    setTimeout(() => {
      messageElement.style.background = '';
    }, 2000);
  }
}
