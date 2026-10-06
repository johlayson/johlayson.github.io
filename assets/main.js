/* johlayson.com: plays the universe video and carries its position from page to page */
(function () {
  var v = document.querySelector('.universe video');
  if (!v) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var small = Math.max(screen.width, screen.height) * (window.devicePixelRatio || 1) < 1600 ||
    (navigator.connection && navigator.connection.saveData);
  v.src = '/assets/universe-' + (small ? '720' : '1080') + '.mp4?v=1';

  var KEY = 'jl-universe-t';
  v.addEventListener('loadedmetadata', function () {
    var t = 0;
    try { t = parseFloat(sessionStorage.getItem(KEY)) || 0; } catch (e) {}
    if (t > 0 && t < v.duration) v.currentTime = t;
  });
  v.addEventListener('playing', function () { v.classList.add('is-playing'); });
  function save() { try { sessionStorage.setItem(KEY, String(v.currentTime)); } catch (e) {} }
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', function () { if (document.hidden) save(); });

  var p = v.play();
  if (p && p.catch) p.catch(function () {});
})();
