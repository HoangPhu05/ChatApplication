// Settings page specific JavaScript
// API_URL is already declared in script.js

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../index.html';
    return;
  }

  // Load user data from API
  loadUserDataFromAPI();
  
  // Navigation items
  const navItems = document.querySelectorAll('.settings-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!item.classList.contains('logout')) {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });

  // Form submission
  const accountForm = document.querySelector('.account-form');
  if (accountForm) {
    accountForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await updateUserProfile();
    });
  }

  // Edit Profile button - scroll to form
  const btnEditProfile = document.getElementById('btnEditProfile');
  if (btnEditProfile) {
    btnEditProfile.addEventListener('click', () => {
      document.querySelector('.account-form').scrollIntoView({ behavior: 'smooth' });
      document.getElementById('inputDisplayName').focus();
    });
  }

  // Logout button
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../index.html';
    });
  }
});

// Load user data from API
async function loadUserDataFromAPI() {
  try {
    const token = localStorage.getItem('token');
    console.log('Loading user data with token:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        console.error('Token expired or invalid');
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
        return;
      }
      throw new Error('Failed to load user data');
    }

    const user = await response.json();
    console.log('User data loaded:', user);
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update UI
    updateUIWithUserData(user);
    
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Không thể tải thông tin người dùng. Vui lòng thử lại.');
  }
}

// Update UI with user data
function updateUIWithUserData(user) {
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

  const profileBio = document.getElementById('profileBio');
  if (profileBio) {
    profileBio.textContent = user.bio || '"Welcome to ChatApp"';
  }
  
  // Update form fields
  const displayNameInput = document.getElementById('inputDisplayName');
  if (displayNameInput) {
    displayNameInput.value = user.display_name || '';
  }
  
  const userHandleInput = document.getElementById('inputUsername');
  if (userHandleInput) {
    userHandleInput.value = user.username;
  }
  
  const emailInput = document.getElementById('inputEmail');
  if (emailInput) {
    emailInput.value = user.email || '';
  }

  const phoneInput = document.getElementById('inputPhone');
  if (phoneInput) {
    phoneInput.value = user.phone || '';
  }

  const bioInput = document.getElementById('inputBio');
  if (bioInput) {
    bioInput.value = user.bio || '';
  }
}

// Update user profile
async function updateUserProfile() {
  const displayName = document.getElementById('inputDisplayName').value.trim();
  const bio = document.getElementById('inputBio').value.trim();

  if (!displayName) {
    alert('Display name không được để trống!');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const btnSave = document.getElementById('btnSaveChanges');
    
    // Disable button and show loading
    btnSave.disabled = true;
    btnSave.textContent = 'Saving...';

    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        display_name: displayName,
        bio: bio || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    const updatedUser = await response.json();
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update UI
    updateUIWithUserData(updatedUser);
    
    // Show success message
    alert('Cập nhật thông tin thành công! ✅');
    
    // Re-enable button
    btnSave.disabled = false;
    btnSave.textContent = 'Save Changes';

  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Không thể cập nhật thông tin: ' + error.message);
    
    // Re-enable button
    const btnSave = document.getElementById('btnSaveChanges');
    btnSave.disabled = false;
    btnSave.textContent = 'Save Changes';
  }
}
