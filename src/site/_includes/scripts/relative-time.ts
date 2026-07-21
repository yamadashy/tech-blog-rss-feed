// Recompute "○分前" style relative dates against the viewer's current time.
// The build embeds a relative date computed at build time (the site rebuilds
// only hourly, so it drifts); elements carrying a `data-datetime` ISO date get
// their text replaced on load. Without JS the build-time text remains as-is.
// Thresholds and wording mirror dayjs's relativeTime plugin with the ja locale
// so that the replaced text matches the build-time output.
// NOTE: this file is inlined into <script> as-is (see components/scripts.ts),
// so it must stay plain JS — no TypeScript-only syntax (the `= 0` default is
// how the parameter gets its type without an annotation).
const formatRelativeTime = (diffMs = 0) => {
  const sec = Math.max(0, diffMs) / 1000;
  if (sec < 45) {
    return '数秒前';
  }
  const min = Math.round(sec / 60);
  if (min < 45) {
    return `${Math.max(1, min)}分前`;
  }
  const hour = Math.round(sec / 3600);
  if (hour < 22) {
    return `${Math.max(1, hour)}時間前`;
  }
  const day = Math.round(sec / 86400);
  if (day < 26) {
    return `${Math.max(1, day)}日前`;
  }
  const month = Math.round(day / 30.44);
  if (month < 11) {
    return `${Math.max(1, month)}ヶ月前`;
  }
  return `${Math.max(1, Math.round(month / 12))}年前`;
};

for (const elem of document.querySelectorAll('[data-datetime]')) {
  const parsed = Date.parse(elem.getAttribute('data-datetime') ?? '');
  if (!Number.isNaN(parsed)) {
    elem.textContent = formatRelativeTime(Date.now() - parsed);
  }
}
