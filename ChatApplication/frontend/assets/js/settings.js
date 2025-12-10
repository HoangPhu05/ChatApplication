// Settings page specific JavaScript
const API_URL = 'http://localhost:8000/api';

document.addEventListener('DOMContentLoaded', () => {
  // Load user data
  loadUserData();
  
  // Navigation items
  const navItems = document.querySelectorAll('.settings-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Form submission
  const accountForm = document.querySelector('.account-form');
  if (accountForm) {
    accountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Changes saved successfully!');
    });
  }
});

// Load user data from localStorage
function loadUserData() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user.username) {
    window.location.href = '../login-simple.html';
    return;
  }
  
  // Update profile card
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar) {
    const initial = user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
    profileAvatar.innerHTML = `<div style="width:80px;height:80px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;color:white;font-weight:700;">${initial}</div><span class="online-indicator"></span>`;
  }
  
  const profileName = document.getElementById('profileName');
  if (profileName) {
    profileName.textContent = user.display_name || user.username;
  }
  
  const profileHandle = document.getElementById('profileHandle');
  if (profileHandle) {
    profileHandle.textContent = '@' + user.username;
  }
  
  // Update form fields by name attribute
  const displayNameInput = document.getElementById('inputDisplayName');
  if (displayNameInput) {
    displayNameInput.value = user.display_name || '';
  }
  
  const userHandleInput = document.getElementById('inputUsername');
  if (userHandleInput) {
    userHandleInput.value = '@' + user.username;
  }
  
  const emailInput = document.getElementById('inputEmail');
  if (emailInput) {
    emailInput.value = user.email || '';
  }
}
