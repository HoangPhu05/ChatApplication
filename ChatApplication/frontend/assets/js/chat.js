// Chat page specific scripts
document.addEventListener('DOMContentLoaded', () => {
  const emptyState = document.querySelector('.empty-state');
  const cloudChat = document.getElementById('cloud-chat');
  const chatMain = document.querySelector('.chat-main');

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

  // Edit icon click handler - navigate to settings
  const editBtn = document.querySelector('.sidebar-header .btn-icon');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.location.href = 'settings.html';
    });
  }

  // Toggle info panel in cloud view
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
});
