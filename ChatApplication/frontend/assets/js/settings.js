// Settings page specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
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
