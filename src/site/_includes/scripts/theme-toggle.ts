// Dark mode toggle. The effective theme is the explicit choice stored in
// localStorage (reflected as `data-theme` on <html> by scripts/theme-init.ts)
// and falls back to the OS setting.
// NOTE: this file is inlined into <script> as-is (see components/scripts.ts),
// so it must stay plain JS — no TypeScript-only syntax.
const themeToggleButton = document.querySelector('.ui-theme-toggle');

if (themeToggleButton) {
  const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const isDarkTheme = () => {
    const explicitTheme = document.documentElement.dataset.theme;
    if (explicitTheme === 'dark' || explicitTheme === 'light') {
      return explicitTheme === 'dark';
    }
    return darkMediaQuery.matches;
  };

  const syncPressedState = () => {
    themeToggleButton.setAttribute('aria-pressed', String(isDarkTheme()));
  };

  syncPressedState();

  themeToggleButton.addEventListener('click', () => {
    const nextTheme = isDarkTheme() ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (_e) {
      // localStorage may be unavailable (private mode, blocked cookies)
    }
    syncPressedState();
  });

  darkMediaQuery.addEventListener('change', syncPressedState);
}
