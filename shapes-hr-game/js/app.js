/* =====================================================================
   Swipe game logic. All copy/tasks/hours come from window.GAME_CONFIG
   (js/config.js). No libraries: swipes use Pointer Events.
   ===================================================================== */

(function () {
  'use strict';

  var C = window.GAME_CONFIG;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- state ----
  var state = {
    size: null,          // size option object
    index: 0,            // current card
    answers: [],         // 'manual' | 'auto' per task index
    busy: false,
  };
  var els = {};

  // ---- helpers ----
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, C);
  }
  function fillCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (el) {
      var v = get(el.getAttribute('data-copy'));
      if (typeof v === 'string') el.textContent = v;
    });
  }
  function show(id) {
    ['intro', 'size', 'play', 'result', 'report'].forEach(function (s) {
      document.getElementById(s).hidden = s !== id;
    });
    window.scrollTo(0, 0);
  }
  function icon(name, cls) {
    var i = document.createElement('i');
    i.className = 'ti ti-' + name + (cls ? ' ' + cls : '');
    i.setAttribute('aria-hidden', 'true');
    return i;
  }
  // Per-task hours shown in the report: nearest half hour, at least 0.5
  function taskHours(task) {
    var h = task.hours * (state.size ? state.size.multiplier : 1);
    return Math.max(0.5, Math.round(h * 2) / 2);
  }
  function manualTasks() {
    return C.tasks.filter(function (t, i) { return state.answers[i] === 'manual'; });
  }
  function totalHours() {
    var sum = manualTasks().reduce(function (s, t) { return s + t.hours; }, 0);
    return Math.round(sum * state.size.multiplier);
  }
  function profile() {
    var n = manualTasks().length;
    return C.profiles.find(function (p) { return n >= p.min && n <= p.max; }) || C.profiles[C.profiles.length - 1];
  }

  // ---- cards ----
  function buildCard(i) {
    var task = C.tasks[i];
    var card = document.createElement('div');
    card.className = 'card';
    var art = document.createElement('div');
    art.className = 'card-art';
    art.appendChild(icon(task.icon));
    card.appendChild(art);
    var name = document.createElement('h3');
    name.className = 'card-name';
    name.textContent = task.name;
    card.appendChild(name);
    [['manual', C.play.manualLabel], ['auto', C.play.autoLabel]].forEach(function (pair) {
      var stamp = document.createElement('span');
      stamp.className = 'stamp stamp-' + pair[0];
      stamp.setAttribute('aria-hidden', 'true');
      stamp.textContent = pair[1];
      card.appendChild(stamp);
    });
    return card;
  }

  function currentCard() { return els.stack.querySelector('.card:not(.is-next):not(.is-gone)'); }

  function renderStack() {
    els.stack.innerHTML = '';
    if (state.index + 1 < C.tasks.length) {
      var next = buildCard(state.index + 1);
      next.classList.add('is-next');
      els.stack.appendChild(next);
    }
    var cur = buildCard(state.index);
    els.stack.appendChild(cur);
    attachDrag(cur);
    updateProgress();
  }

  function advance() {
    state.index++;
    if (state.index >= C.tasks.length) { showResult(); return; }
    var next = els.stack.querySelector('.card.is-next');
    if (next) next.classList.remove('is-next');
    else { next = buildCard(state.index); els.stack.appendChild(next); }
    if (state.index + 1 < C.tasks.length) {
      var queued = buildCard(state.index + 1);
      queued.classList.add('is-next');
      els.stack.insertBefore(queued, next);
    }
    attachDrag(next);
    updateProgress();
  }

  function updateProgress() {
    var n = Math.min(state.index + 1, C.tasks.length);
    els.progressCount.textContent = n + '/' + C.tasks.length;
    els.progressFill.style.width = (n / C.tasks.length * 100) + '%';
  }

  // answer: 'manual' (left) | 'auto' (right)
  function answer(kind) {
    if (state.busy || state.index >= C.tasks.length) return;
    var card = currentCard();
    if (!card) return;
    state.busy = true;
    state.answers[state.index] = kind;
    card.classList.add('is-gone');

    if (reduceMotion) {
      card.remove();
      state.busy = false;
      advance();
      return;
    }
    var dir = kind === 'auto' ? 1 : -1;
    var w = els.stack.offsetWidth || 320;
    card.style.transition = 'transform 0.32s ease-in, opacity 0.32s ease-in';
    card.style.transform = 'translate(' + (dir * w * 1.4) + 'px, -30px) rotate(' + (dir * 22) + 'deg)';
    card.style.opacity = '0';
    card.classList.add(kind === 'auto' ? 'show-auto' : 'show-manual');
    setTimeout(function () {
      card.remove();
      state.busy = false;
      advance();
    }, 300);
  }

  // Pointer-driven drag; touch-action: pan-y keeps vertical page scroll native.
  function attachDrag(card) {
    var startX = 0, startY = 0, dx = 0, dy = 0, startT = 0, dragging = false, pid = null;

    card.addEventListener('pointerdown', function (e) {
      if (state.busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragging = true; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY; dx = 0; dy = 0; startT = Date.now();
      card.setPointerCapture(pid);
      card.style.transition = 'none';
    });
    card.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      card.style.transform = 'translate(' + dx + 'px, ' + (dy * 0.15) + 'px) rotate(' + (dx / 18) + 'deg)';
      var strength = Math.min(Math.abs(dx) / 90, 1);
      card.style.setProperty('--auto', dx > 0 ? strength : 0);
      card.style.setProperty('--manual', dx < 0 ? strength : 0);
    });
    function release(e) {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      var w = els.stack.offsetWidth || 320;
      var velocity = Math.abs(dx) / Math.max(Date.now() - startT, 1);
      if (Math.abs(dx) > Math.min(110, w * 0.3) || (Math.abs(dx) > 40 && velocity > 0.6)) {
        answer(dx > 0 ? 'auto' : 'manual');
      } else {
        card.style.transition = reduceMotion ? 'none' : 'transform 0.25s ease';
        card.style.transform = '';
        card.style.setProperty('--auto', 0);
        card.style.setProperty('--manual', 0);
      }
    }
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
  }

  // ---- intro fan ----
  function buildFan() {
    [[1, 'fan-left'], [3, 'fan-right'], [0, 'fan-front']].forEach(function (pair) {
      var card = buildCard(pair[0]);
      card.classList.add('fan-card', pair[1]);
      card.querySelectorAll('.stamp').forEach(function (s) { s.remove(); });
      els.fan.appendChild(card);
    });
  }

  // ---- size question ----
  function buildSizeOptions() {
    C.size.options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-option';
      b.textContent = opt.label;
      b.addEventListener('click', function () {
        state.size = opt;
        startCards();
      });
      els.sizeOptions.appendChild(b);
    });
  }

  function startCards() {
    state.index = 0;
    state.answers = [];
    state.busy = false;
    renderStack();
    show('play');
  }

  // ---- result ----
  function showResult() {
    var p = profile();
    var hours = totalHours();
    els.profileName.textContent = p.name;
    els.profileDesc.textContent = p.description;

    els.hoursBox.hidden = hours === 0;
    els.zeroBox.hidden = hours !== 0;
    els.hoursNum.textContent = '~' + hours;

    // Locked teaser: their manual tasks, details blurred until they submit
    els.teaserList.innerHTML = '';
    manualTasks().forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'teaser-item';
      li.appendChild(icon(t.icon, 'teaser-icon'));
      var body = document.createElement('div');
      var name = document.createElement('p');
      name.className = 'teaser-name';
      name.textContent = t.name;
      var locked = document.createElement('p');
      locked.className = 'teaser-locked';
      locked.setAttribute('aria-hidden', 'true');
      locked.textContent = C.result.teaserLocked;
      body.appendChild(name);
      body.appendChild(locked);
      li.appendChild(body);
      li.appendChild(icon('lock', 'teaser-lock'));
      els.teaserList.appendChild(li);
    });
    els.teaserList.hidden = !els.teaserList.children.length;

    els.form.hidden = false;
    show('result');
  }

  // ---- lead form ----
  function buildHrSelect() {
    var ph = document.createElement('option');
    ph.value = '';
    ph.textContent = C.form.hrSystemPlaceholder;
    ph.disabled = true;
    ph.defaultSelected = true;   // so form.reset() returns to the placeholder
    els.hr.appendChild(ph);
    C.form.hrSystems.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      els.hr.appendChild(o);
    });
  }

  function setError(input, msg) {
    var p = els.form.querySelector('.field-error[data-for="' + input.id + '"]');
    p.textContent = msg || '';
    input.classList.toggle('is-invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    var ok = true;
    var E = C.form.errors;
    var name = els.form.firstName, email = els.form.email, company = els.form.company;

    setError(name, name.value.trim() ? '' : E.required);
    setError(company, company.value.trim() ? '' : E.required);
    setError(els.hr, els.hr.value ? '' : E.hrSystem);

    var v = email.value.trim().toLowerCase();
    var domain = v.split('@')[1] || '';
    if (!v) setError(email, E.required);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) setError(email, E.email);
    else if (C.freeEmailDomains.indexOf(domain) !== -1) setError(email, E.freeEmail);
    else setError(email, '');

    [name, email, company, els.hr].forEach(function (i) { if (i.classList.contains('is-invalid')) ok = false; });
    if (!ok) {
      var first = els.form.querySelector('.is-invalid');
      if (first) first.focus();
    }
    return ok;
  }

  // Ad attribution (utm_* / fbclid) from the landing URL, sent with the lead
  function attribution() {
    var out = {};
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(function (k) {
      if (q.get(k)) out[k] = q.get(k);
    });
    return out;
  }

  function buildPayload() {
    var f = els.form;
    var p = profile();
    return {
      firstName: f.firstName.value.trim(),
      email: f.email.value.trim(),
      company: f.company.value.trim(),
      hrSystem: els.hr.value,
      companySize: state.size.label,
      profile: p.name,
      profileId: p.id,
      hoursPerWeek: totalHours(),
      tasks: {
        manual: manualTasks().map(function (t) { return { id: t.id, name: t.name, hoursPerWeek: taskHours(t) }; }),
        automated: C.tasks.filter(function (t, i) { return state.answers[i] === 'auto'; })
          .map(function (t) { return { id: t.id, name: t.name }; }),
      },
      attribution: attribution(),
      submittedAt: new Date().toISOString(),
      page: location.href,
    };
  }

  // Sends the lead as JSON to WEBHOOK_URL. Empty URL → log only.
  // Never blocks the report: a failed request is logged and the visitor still gets it.
  function submitLead(data) {
    if (!C.WEBHOOK_URL) {
      console.log('[lead] WEBHOOK_URL is empty — payload:', data);
      return Promise.resolve();
    }
    return fetch(C.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(function (res) {
      if (!res.ok) console.error('[lead] webhook responded', res.status);
    }).catch(function (err) {
      console.error('[lead] webhook failed', err);
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    var btn = els.submit;
    btn.disabled = true;
    btn.textContent = C.form.sending;
    submitLead(buildPayload()).then(function () {
      btn.disabled = false;
      btn.textContent = C.form.button;
      showReport();
    });
  }

  // ---- report ----
  function showReport() {
    els.reportList.innerHTML = '';
    var tasks = manualTasks();
    tasks.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'report-item';
      li.appendChild(icon(t.icon, 'report-icon'));
      var body = document.createElement('div');
      body.className = 'report-body';
      var top = document.createElement('div');
      top.className = 'report-top';
      var name = document.createElement('p');
      name.className = 'report-name';
      name.textContent = t.name;
      var hrs = document.createElement('span');
      hrs.className = 'report-hours';
      hrs.textContent = '~' + taskHours(t) + ' ' + C.report.perWeek;
      top.appendChild(name);
      top.appendChild(hrs);
      var how = document.createElement('p');
      how.className = 'report-how';
      var prod = document.createElement('strong');
      prod.textContent = t.shapes.product + ': ';
      how.appendChild(prod);
      how.appendChild(document.createTextNode(t.shapes.line));
      body.appendChild(top);
      body.appendChild(how);
      li.appendChild(body);
      els.reportList.appendChild(li);
    });
    els.reportEmpty.hidden = tasks.length > 0;
    show('report');
  }

  // ---- init ----
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('DOMContentLoaded', function () {
    els = {
      fan: document.getElementById('fan'),
      sizeOptions: document.getElementById('sizeOptions'),
      stack: document.getElementById('stack'),
      progressCount: document.getElementById('progressCount'),
      progressFill: document.getElementById('progressFill'),
      profileName: document.getElementById('profileName'),
      profileDesc: document.getElementById('profileDesc'),
      hoursBox: document.getElementById('hoursBox'),
      zeroBox: document.getElementById('zeroBox'),
      hoursNum: document.getElementById('hoursNum'),
      teaserList: document.getElementById('teaserList'),
      form: document.getElementById('leadForm'),
      hr: document.getElementById('fHr'),
      submit: document.getElementById('submitBtn'),
      reportList: document.getElementById('reportList'),
      reportEmpty: document.getElementById('reportEmpty'),
    };

    document.title = C.meta.title;
    fillCopy();
    buildFan();
    buildSizeOptions();
    buildHrSelect();
    document.getElementById('demoBtn').href = C.DEMO_URL;

    function goSize() { show('size'); }
    document.getElementById('startBtn').addEventListener('click', goSize);
    els.fan.addEventListener('click', goSize);
    document.getElementById('manualBtn').addEventListener('click', function () { answer('manual'); });
    document.getElementById('autoBtn').addEventListener('click', function () { answer('auto'); });
    document.addEventListener('keydown', function (e) {
      if (document.getElementById('play').hidden) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); answer('manual'); }
      if (e.key === 'ArrowRight') { e.preventDefault(); answer('auto'); }
    });
    els.form.addEventListener('submit', onSubmit);
    // Clear a field's error as soon as it's edited
    els.form.addEventListener('input', function (e) { if (e.target.classList.contains('is-invalid')) setError(e.target, ''); });
    els.form.addEventListener('change', function (e) { if (e.target === els.hr) setError(els.hr, ''); });
    document.getElementById('againBtn').addEventListener('click', function () {
      els.form.reset();
      show('intro');
    });
  });
})();
