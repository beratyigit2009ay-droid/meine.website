/* Maison Glow – Beauty Atelier (Demo-Website) */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var supportsTimeline = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ladebildschirm entfernen ---------- */
  var loader = document.querySelector('.ld');
  if (loader) {
    setTimeout(function () { loader.remove(); }, reduceMotion ? 0 : 2700);
  }

  /* ---------- Fallbacks für Browser ohne Scroll-Timeline ---------- */
  if (!supportsTimeline) {
    var bar = document.querySelector('.prog');
    var updateBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    };
    if (bar) {
      window.addEventListener('scroll', updateBar, { passive: true });
      updateBar();
    }
    var revealEls = document.querySelectorAll('.rv, .rvl, .rvr, .rvz, .rvc');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- Hero: Maus-Parallaxe und Lichtschein ---------- */
  var hero = document.querySelector('.hero');
  if (hero && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var raf = 0;
    var pos = null;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      pos = {
        mx: (e.clientX - r.left) / r.width - 0.5,
        my: (e.clientY - r.top) / r.height - 0.5,
        gx: e.clientX - r.left,
        gy: e.clientY - r.top
      };
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        hero.style.setProperty('--mx', pos.mx.toFixed(3));
        hero.style.setProperty('--my', pos.my.toFixed(3));
        hero.style.setProperty('--gx', pos.gx + 'px');
        hero.style.setProperty('--gy', pos.gy + 'px');
        hero.style.setProperty('--go', '0.55');
      });
    });
    hero.addEventListener('mouseleave', function () {
      hero.style.setProperty('--mx', '0');
      hero.style.setProperty('--my', '0');
      hero.style.setProperty('--go', '0.25');
    });
  }

  /* ---------- Behandlungen: Reiter ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var selectTab = function (index, focus) {
    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) tabs[index].focus();
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i, false); });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectTab((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab((i - 1 + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- Terminbuchung ---------- */
  var body = document.getElementById('bkBody');
  if (!body) return;
  var fill = document.getElementById('bkFill');
  var stepList = document.getElementById('bkSteps');
  var nav = document.getElementById('bkNav');
  var backBtn = document.getElementById('bkBack');
  var nextBtn = document.getElementById('bkNext');

  var services = Array.prototype.slice.call(document.querySelectorAll('.row[data-id]')).map(function (row) {
    return { id: row.dataset.id, cat: row.dataset.cat, name: row.dataset.name, price: row.dataset.price };
  });

  // Beispiel-Öffnungszeiten in Minuten: Di–Fr 9–19 Uhr, Sa 9–14 Uhr
  var HOURS = { 2: [540, 1140], 3: [540, 1140], 4: [540, 1140], 5: [540, 1140], 6: [540, 840] };
  var WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var MON = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var LABELS = ['Behandlung', 'Datum', 'Uhrzeit', 'Ihre Daten'];

  var state = { step: 0, svc: null, day: null, time: null, name: '', phone: '', note: '', done: false };

  var pad = function (n) { return String(n).padStart(2, '0'); };

  var openDays = function () {
    var list = [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    for (var i = 1; i < 40 && list.length < 10; i++) {
      var d = new Date(today);
      d.setDate(today.getDate() + i);
      var w = d.getDay();
      if (!HOURS[w]) continue;
      list.push({ key: d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), w: w, n: d.getDate(), wd: WD[w], mon: MON[d.getMonth()] });
    }
    return list;
  };

  var dayLabel = function (d) { return d.wd + ', ' + d.n + '. ' + d.mon; };
  var findSvc = function () { return services.find(function (s) { return s.id === state.svc; }); };
  var findDay = function () { return openDays().find(function (d) { return d.key === state.day; }); };

  var canNext = function () {
    if (state.step === 0) return !!state.svc;
    if (state.step === 1) return !!state.day;
    if (state.step === 2) return !!state.time;
    return state.name.trim() !== '' && state.phone.trim() !== '';
  };

  var updateNav = function () {
    backBtn.disabled = state.step === 0;
    nextBtn.disabled = !canNext();
    nextBtn.textContent = state.step === 3 ? 'Anfrage senden' : 'Weiter →';
  };

  var renderSide = function () {
    var svc = findSvc();
    var day = findDay();
    var vals = [svc ? svc.name : 'Noch offen', day ? dayLabel(day) : 'Noch offen', state.time ? state.time + ' Uhr' : 'Noch offen', state.name.trim() || 'Noch offen'];
    stepList.innerHTML = '';
    LABELS.forEach(function (label, i) {
      var li = document.createElement('li');
      var isDone = state.done || i < state.step;
      var isActive = !state.done && i === state.step;
      if (isDone) li.className = 'is-done';
      if (isActive) li.className = 'is-active';
      var dot = document.createElement('span');
      dot.className = 'bk-dot';
      dot.textContent = isDone ? '✓' : String(i + 1);
      var txt = document.createElement('div');
      var l = document.createElement('div');
      l.className = 'bk-label';
      l.textContent = label;
      var v = document.createElement('div');
      v.className = 'bk-val';
      v.textContent = vals[i];
      txt.appendChild(l);
      txt.appendChild(v);
      li.appendChild(dot);
      li.appendChild(txt);
      stepList.appendChild(li);
    });
    fill.style.width = (state.done ? 100 : state.step * 25) + '%';
  };

  var makeTitle = function (text) {
    var h = document.createElement('div');
    h.className = 'bk-title';
    h.textContent = text;
    return h;
  };

  var makeHint = function (text) {
    var p = document.createElement('div');
    p.className = 'bk-hint';
    p.textContent = text;
    return p;
  };

  var renderBody = function () {
    body.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'slide';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '22px';

    if (state.done) {
      renderDone();
      return;
    }

    if (state.step === 0) {
      wrap.appendChild(makeTitle('Welche Behandlung?'));
      var g0 = document.createElement('div');
      g0.className = 'bk-grid cols-2';
      services.forEach(function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt opt-svc' + (state.svc === s.id ? ' is-on' : '');
        b.setAttribute('aria-pressed', state.svc === s.id ? 'true' : 'false');
        var left = document.createElement('span');
        var cat = document.createElement('span');
        cat.className = 'opt-cat';
        cat.textContent = s.cat;
        left.appendChild(cat);
        left.appendChild(document.createTextNode(s.name));
        var price = document.createElement('span');
        price.className = 'opt-price';
        price.textContent = s.price;
        b.appendChild(left);
        b.appendChild(price);
        b.addEventListener('click', function () { state.svc = s.id; render(); });
        g0.appendChild(b);
      });
      wrap.appendChild(g0);
    }

    if (state.step === 1) {
      wrap.appendChild(makeTitle('Welcher Tag?'));
      var g1 = document.createElement('div');
      g1.className = 'bk-grid cols-5';
      openDays().forEach(function (d) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt opt-day' + (state.day === d.key ? ' is-on' : '');
        b.setAttribute('aria-pressed', state.day === d.key ? 'true' : 'false');
        b.setAttribute('aria-label', dayLabel(d));
        b.innerHTML = '<span class="wd"></span><span class="dd"></span><span class="mm"></span>';
        b.querySelector('.wd').textContent = d.wd;
        b.querySelector('.dd').textContent = d.n;
        b.querySelector('.mm').textContent = d.mon;
        b.addEventListener('click', function () { state.day = d.key; state.time = null; render(); });
        g1.appendChild(b);
      });
      wrap.appendChild(g1);
      wrap.appendChild(makeHint('Öffnungszeiten (Beispiel): Di–Fr 9–19 Uhr, Sa 9–14 Uhr'));
    }

    if (state.step === 2) {
      wrap.appendChild(makeTitle('Welche Uhrzeit?'));
      var g2 = document.createElement('div');
      g2.className = 'bk-grid cols-5';
      var day = findDay();
      if (day) {
        var h = HOURS[day.w];
        var idx = 0;
        for (var m = h[0]; m + 30 <= h[1]; m += 30) {
          (function (t, taken) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'opt opt-time' + (state.time === t ? ' is-on' : '');
            b.textContent = t;
            b.disabled = taken;
            if (taken) b.setAttribute('aria-label', t + ' – bereits vergeben');
            b.addEventListener('click', function () { state.time = t; render(); });
            g2.appendChild(b);
          })(pad(Math.floor(m / 60)) + ':' + pad(m % 60), ((day.n * 7 + idx * 13) % 5) === 0);
          idx++;
        }
      }
      wrap.appendChild(g2);
      wrap.appendChild(makeHint('Durchgestrichene Zeiten sind bereits vergeben (Beispiel).'));
    }

    if (state.step === 3) {
      wrap.appendChild(makeTitle('Fast geschafft.'));
      var fields = [
        { key: 'name', label: 'Name *', type: 'text', ph: 'Vor- und Nachname', ac: 'name' },
        { key: 'phone', label: 'Telefon *', type: 'tel', ph: 'Für die Bestätigung', ac: 'tel' },
        { key: 'note', label: 'Wünsche (optional)', type: 'textarea', ph: 'z. B. Allergien oder Designwunsch' }
      ];
      fields.forEach(function (f) {
        var label = document.createElement('label');
        label.className = 'field';
        label.appendChild(document.createTextNode(f.label));
        var input = document.createElement(f.type === 'textarea' ? 'textarea' : 'input');
        if (f.type !== 'textarea') input.type = f.type; else input.rows = 3;
        if (f.ac) input.autocomplete = f.ac;
        input.placeholder = f.ph;
        input.value = state[f.key];
        input.addEventListener('input', function () {
          state[f.key] = input.value;
          updateNav();
          renderSide();
        });
        label.appendChild(input);
        wrap.appendChild(label);
      });
    }

    body.appendChild(wrap);
  };

  var renderDone = function () {
    var svc = findSvc();
    var day = findDay();
    var box = document.createElement('div');
    box.className = 'bk-done';

    var burst = document.createElement('div');
    burst.setAttribute('aria-hidden', 'true');
    burst.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    var colors = ['#9c4f5a', '#c8a46b', '#e9c2c0', '#1c1320'];
    for (var i = 0; i < 14; i++) {
      var c = document.createElement('span');
      c.className = 'cf';
      var angle = (i / 14) * Math.PI * 2;
      var dist = 220 + (i % 3) * 60;
      c.style.setProperty('--x', Math.round(Math.cos(angle) * dist) + 'px');
      c.style.setProperty('--y', Math.round(Math.sin(angle) * dist) + 'px');
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (i % 5) * 0.03 + 's';
      burst.appendChild(c);
    }
    box.appendChild(burst);

    var check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    check.setAttribute('class', 'pop');
    check.setAttribute('width', '96');
    check.setAttribute('height', '96');
    check.setAttribute('viewBox', '0 0 24 24');
    check.setAttribute('fill', 'none');
    check.setAttribute('stroke', '#9c4f5a');
    check.setAttribute('stroke-width', '1.4');
    check.setAttribute('stroke-linecap', 'round');
    check.setAttribute('stroke-linejoin', 'round');
    check.setAttribute('aria-hidden', 'true');
    check.innerHTML = '<circle cx="12" cy="12" r="10.5"></circle><path class="draw-i" pathLength="100" d="M7 12.5l3.2 3.2L17 9"></path>';
    box.appendChild(check);

    var h = document.createElement('h3');
    h.className = 'pop';
    h.style.animationDelay = '.15s';
    h.textContent = 'Danke, ' + state.name.trim() + '!';
    box.appendChild(h);

    var p = document.createElement('p');
    p.className = 'pop';
    p.style.animationDelay = '.25s';
    p.textContent = 'Ihre Anfrage für ' + (svc ? svc.name : '') + ' am ' + (day ? dayLabel(day) : '') + ' um ' + state.time + ' Uhr ist vorbereitet. Wir melden uns unter ' + state.phone.trim() + ' zur Bestätigung.';
    box.appendChild(p);

    var small = document.createElement('small');
    small.textContent = 'Demo: Es wurde nichts versendet.';
    box.appendChild(small);

    var again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn btn-dark';
    again.textContent = 'Neue Anfrage';
    again.addEventListener('click', function () {
      state = { step: 0, svc: null, day: null, time: null, name: '', phone: '', note: '', done: false };
      render();
    });
    box.appendChild(again);

    body.appendChild(box);
  };

  var render = function () {
    renderSide();
    renderBody();
    nav.hidden = state.done;
    updateNav();
  };

  backBtn.addEventListener('click', function () {
    if (state.step > 0) { state.step--; render(); }
  });
  nextBtn.addEventListener('click', function () {
    if (!canNext()) return;
    if (state.step === 3) state.done = true; else state.step++;
    render();
  });

  document.querySelectorAll('[data-book]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state = { step: 1, svc: btn.getAttribute('data-book'), day: null, time: null, name: state.name, phone: state.phone, note: state.note, done: false };
      render();
      document.getElementById('termin').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  render();
})();
