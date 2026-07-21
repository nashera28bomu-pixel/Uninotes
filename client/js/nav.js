// Wires up the header controls that are identical on every page: the theme
// toggle button and the search form (which always navigates to search.html).
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => window.CymorTheme.toggle());
  }

  const searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = searchForm.querySelector('input[type="search"]');
      const q = input.value.trim();
      if (!q) return;
      window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });
  }
});
