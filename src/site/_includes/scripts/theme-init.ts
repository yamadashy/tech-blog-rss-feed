// Apply the stored theme before the stylesheet is parsed so that the page never
// flashes the wrong palette. With no stored preference the OS setting wins via
// `prefers-color-scheme` in CSS, so nothing is set here.
// NOTE: this file is inlined into <script> as-is (see components/scripts.ts),
// so it must stay plain JS — no TypeScript-only syntax.
try {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light' || storedTheme === 'dark') {
    document.documentElement.dataset.theme = storedTheme;
  }
} catch (_e) {
  // localStorage may be unavailable (private mode, blocked cookies)
}
