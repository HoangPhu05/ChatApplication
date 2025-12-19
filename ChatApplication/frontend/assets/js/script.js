// API Configuration
const API_URL = 'https://chatapplication-ppv9.onrender.com';

// Helper function to show messages
function showMessage(message, type = 'info') {
  // Tạo toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon theo type
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  else if (type === 'error') icon = 'error';
  else if (type === 'warning') icon = 'warning';
  
  toast.innerHTML = `
    <span class="material-icons">${icon}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Hiện animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Common script for all auth pages
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.material-icons');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  if(themeIcon) {
    themeIcon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
  }
  
  // Toggle theme
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      if(themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
      }
    });
  }

  // Password visibility toggle (login page)
  const pwToggle = document.getElementById('pw-toggle');
  const pwInput = document.getElementById('password');
  if (pwToggle && pwInput) {
    pwToggle.addEventListener('click', () => {
      if (pwInput.type === 'password') {
        pwInput.type = 'text';
        pwToggle.textContent = 'visibility';
      } else {
        pwInput.type = 'password';
        pwToggle.textContent = 'visibility_off';
      }
    });
  }

  // Signup password toggle (register page)
  const signupPwToggle = document.getElementById('signup-pw-toggle');
  const signupPwInput = document.getElementById('signup-password');
  if(signupPwToggle && signupPwInput){
    signupPwToggle.addEventListener('click', () => {
      if (signupPwInput.type === 'password') {
        signupPwInput.type = 'text';
        signupPwToggle.textContent = 'visibility';
      } else {
        signupPwInput.type = 'password';
        signupPwToggle.textContent = 'visibility_off';
      }
    });
  }

  // Login form submission
  const loginForm = document.querySelector('.login-form');
  const loginBtn = loginForm?.querySelector('button[type="submit"]');
  
  if (loginForm && loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      console.log('Login attempt:', { username: email, password: '***' });
      
      if (!email || !password) {
        showMessage('Vui lòng nhập username/email và mật khẩu!', 'error');
        return;
      }

      // Disable button while processing
      loginBtn.disabled = true;
      loginBtn.textContent = 'Đang đăng nhập...';

      try {
        console.log('Sending request to:', `${API_URL}/auth/login`);
        
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password
          })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
          // Lưu token và thông tin user
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showMessage('Đăng nhập thành công!', 'success');
          
          // Chuyển đến trang chat
          setTimeout(() => {
            window.location.href = 'assets/chat.html';
          }, 500);
        } else {
          showMessage(data.detail || 'Đăng nhập thất bại!', 'error');
          loginBtn.disabled = false;
          loginBtn.textContent = 'Log In';
        }
      } catch (error) {
        console.error('Login error:', error);
        showMessage('Không thể kết nối đến server. Vui lòng kiểm tra server đang chạy!', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Log In';
      }
    });
  }

  // Register form submission
  const registerForm = document.querySelector('.signup-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const displayName = document.getElementById('display-name')?.value.trim();
      const username = document.getElementById('signup-username')?.value.trim();
      const email = document.getElementById('signup-email')?.value.trim();
      const phone = document.getElementById('signup-phone')?.value.trim();
      const password = document.getElementById('signup-password')?.value;
      const confirmPassword = document.getElementById('confirm-password')?.value;
      
      if (!displayName || !username || !email || !password) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
      
      if (password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }

      try {
        const requestBody = {
          username: username,
          email: email,
          password: password,
          display_name: displayName
        };
        
        if (phone) {
          requestBody.phone = phone;
        }
        
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
          alert('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
          
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          alert(data.detail || 'Đăng ký thất bại!');
        }
      } catch (error) {
        console.error('Register error:', error);
        alert('Không thể kết nối đến server. Vui lòng thử lại!');
      }
    });
  }
});
