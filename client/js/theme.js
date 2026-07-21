// Defaults to dark (the primary, designed-for experience) and remembers the
// person's choice. Runs before paint (loaded in <head>-adjacent inline call)
// to avoid a flash of the wrong theme.
(function () {
  const STORAGE_KEY = 'cymor-theme';
  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  window.CymorTheme = {
    toggle() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent('cymor-theme-change', { detail: next }));
    },
    current() {
      return document.documentElement.getAttribute('data-theme');
    },
  };
})();
