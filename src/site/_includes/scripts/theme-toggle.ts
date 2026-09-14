// Dark mode toggle. The effective theme is the explicit choice stored in
// localStorage ('light' | 'dark', reflected as `data-theme` on <html> by
// scripts/theme-init.ts) and falls back to the OS setting ('auto' or unset).
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

  // Same behaviour as VitePress (VueUse `useDark`): switching to the side that
  // matches the OS setting goes back to following the OS ('auto') instead of
  // pinning the choice, so the site keeps tracking the system afterwards.
  themeToggleButton.addEventListener('click', () => {
    const nextTheme = isDarkTheme() ? 'light' : 'dark';
    const systemTheme = darkMediaQuery.matches ? 'dark' : 'light';
    const storedTheme = nextTheme === systemTheme ? 'auto' : nextTheme;
    if (storedTheme === 'auto') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = storedTheme;
    }
    try {
      localStorage.setItem('theme', storedTheme);
    } catch (_e) {
      // localStorage may be unavailable (private mode, blocked cookies)
    }
    syncPressedState();
  });

  darkMediaQuery.addEventListener('change', syncPressedState);
}
