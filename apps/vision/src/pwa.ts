export function registerVisionPwa() {
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;

  window.addEventListener('load', () => {
    const url = new URL('./service-worker.js', window.location.href);
    void navigator.serviceWorker.register(url, { scope: './' }).catch((error) => {
      console.warn('[Abrxs Vision] Service worker registration failed', error);
    });
  });
}
