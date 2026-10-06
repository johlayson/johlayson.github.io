/* johlayson.com About page: text floats like it's drifting in space.
   Each block fades in as it nears the middle of the screen and drifts away as it leaves,
   headings gather from scattered letters like stardust, and everything bobs gently and
   follows the pointer a little, at its own depth. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('js-float');

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Split headings into letters (words kept together so lines still wrap normally)
  var spread = Math.min(1, innerWidth / 900);   // smaller scatter on phones
  function split(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.classList.add('split');
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (word) {
          if (!word) return;
          if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          Array.prototype.forEach.call(word, function (ch) {
            var c = document.createElement('span');
            c.className = 'c';
            c.textContent = ch;
            c.style.setProperty('--dx', (rand(-160, 160) * spread).toFixed(0) + 'px');
            c.style.setProperty('--dy', (rand(-110, 110) * spread).toFixed(0) + 'px');
            c.style.setProperty('--r', rand(-50, 50).toFixed(0) + 'deg');
            c.style.setProperty('--s', rand(0, 0.45).toFixed(2));
            w.appendChild(c);
          });
          frag.appendChild(w);
        });
        n.parentNode.replaceChild(frag, n);
      });
    })(el);
  }

  var sel = '.slide h1, .slide h2, .slide .label, .slide .lead, .slide p.muted, .stats > div, ' +
    '.list > li, .tools > dt, .tools > dd, .dot, .quote, .signature, .icons > li, .foot';
  var items = Array.prototype.map.call(document.querySelectorAll(sel), function (el) {
    var heading = /^H[12]$/.test(el.tagName);
    if (heading) split(el);
    el.setAttribute('data-f', '');
    return { el: el, heading: heading, sign: el.classList.contains('signature'), depth: rand(0.6, 1.4), phase: rand(0, Math.PI * 2), top: 0, h: 0, last: '' };
  });
  if (!items.length) return;

  // Page positions, measured without transforms so the motion never feeds back into itself
  function measure() {
    items.forEach(function (it) {
      var y = 0, n = it.el;
      while (n) { y += n.offsetTop; n = n.offsetParent; }
      it.top = y; it.h = it.el.offsetHeight;
    });
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // Pointer, eased
  var px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;   // touch taps shouldn't shove the text sideways
    tx = e.clientX / innerWidth * 2 - 1;
    ty = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  function ease(x) { return x * x * (3 - 2 * x); }

  function frame(t) {
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    var sy = window.scrollY, vh = innerHeight, half = vh / 2;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var d = (it.top + it.h / 2 - sy - half) / half;   // -1 top edge, 0 middle, 1 bottom edge
      var a = Math.abs(d);
      if (a > 1.8) {
        if (it.last !== 'off') { it.el.style.opacity = it.heading ? '' : 0; if (it.heading) it.el.style.setProperty('--k', 1); it.last = 'off'; }
        continue;
      }
      var v = 1 - ease(Math.min(1, Math.max(0, (a - 0.5) / 0.5)));  // visible in the middle, gone at the edges
      var k = it.depth;
      var x = Math.cos(t / 2300 + it.phase) * 3 * k + px * 12 * k;
      var y = d * 46 * k + Math.sin(t / 1700 + it.phase) * 5 * k + py * 10 * k;
      it.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (it.heading) {
        it.el.style.setProperty('--k', (1 - v).toFixed(3));
      } else {
        it.el.style.opacity = v.toFixed(3);
        it.el.style.filter = v > 0.97 ? 'none' : 'blur(' + ((1 - v) * 6).toFixed(1) + 'px)';
      }
      if (it.sign && v > 0.8) it.el.classList.add('signed');   // the signature writes itself once
      it.last = 'on';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
