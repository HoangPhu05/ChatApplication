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
});
