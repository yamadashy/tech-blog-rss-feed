const elemCopyButtons = document.querySelectorAll('.feed-url-copy-button');

elemCopyButtons.forEach((elemCopyButton) => {
  elemCopyButton.addEventListener('click', () => {
    const elemInput = elemCopyButton.parentElement.querySelector('input');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(elemInput.value);
    } else {
      elemInput.select();
      document.execCommand('copy');
    }

    elemCopyButton.classList.add('active');

    elemCopyButton.innerHTML = 'コピーしました！';
    window.setTimeout(() => {
      elemCopyButton.innerHTML = 'コピー';
      elemCopyButton.classList.remove('active');
    }, 1000);
  });
});
