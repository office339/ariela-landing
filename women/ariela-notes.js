/* ariela-notes.js — אריאלה's in-page review layer.
 * - Mom enters "edit mode" → per-section colored notes + ✓approve + inline text edits + a general note.
 * - Everything auto-saves to localStorage (survives reload; marks stay ON the page, color-coded).
 * - "שלח לשקד" compiles a human-readable summary + a machine block (‹ARIELA-NOTES›{json}‹/ARIELA-NOTES›)
 *   and opens WhatsApp → mom picks Shaked → sends. Claude pulls that block (READER) and applies the changes.
 * - DORMANT for normal visitors: the layer only shows for mom (her device has saved notes) or via ?edit=1.
 * Self-contained: injects its own CSS. Add  <script src="<path>/ariela-notes.js" defer></script>  before </body>.
 */
(function () {
  'use strict';
  if (window.__arielaNotes) return;
  window.__arielaNotes = true;

  var PAGE = (document.body.getAttribute('data-anote-page') || document.title || 'page').slice(0, 60);
  var KEY = 'arielaNotes::' + PAGE;
  var SHAKED_NUMBER = ''; // '' = WhatsApp share-sheet (mom chooses Shaked). Set "9725........" to target directly.

  /* ---------------- state ---------------- */
  function fresh() { return { v: 1, page: PAGE, general: '', sections: {}, edits: {}, ts: 0 }; }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return s; } catch (e) {}
    return fresh();
  }
  var state = load();
  function persist() { state.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} updateBadges(); }
  function hasContent() {
    if (state.general && state.general.trim()) return true;
    for (var k in state.sections) { var s = state.sections[k]; if (s && (s.note || s.approved)) return true; }
    for (var e in state.edits) return true;
    return false;
  }

  /* ---------------- discover sections + editable text ---------------- */
  var SECS = [];   // {el, id, label}
  var EDS = [];    // {el, id, sec}
  function labelOf(sec) {
    var h = sec.querySelector('h1,h2,h3');
    if (h && h.textContent.trim()) return h.textContent.trim().replace(/\s+/g, ' ').slice(0, 48);
    if (sec.id) return sec.id;
    return null;
  }
  function discover() {
    var secEls = document.querySelectorAll('section');
    for (var i = 0; i < secEls.length; i++) {
      var id = 's' + i;
      SECS.push({ el: secEls[i], id: id, label: labelOf(secEls[i]) || ('מקטע ' + (i + 1)) });
      secEls[i].setAttribute('data-anote-sec', id);
      secEls[i].style.position = secEls[i].style.position || 'relative';
    }
    var edEls = document.querySelectorAll('section h1, section h2, section h3, section h4, section p, section li, section q, section cite');
    for (var j = 0; j < edEls.length; j++) {
      var el = edEls[j];
      var parentSec = el.closest('section');
      EDS.push({ el: el, id: 'e' + j, sec: parentSec ? parentSec.getAttribute('data-anote-sec') : null });
      el.setAttribute('data-anote-el', 'e' + j);
      if (!el.hasAttribute('data-anote-orig')) el.setAttribute('data-anote-orig', el.textContent.trim().replace(/\s+/g, ' '));
    }
  }

  /* ---------------- styles ---------------- */
  function injectCSS() {
    var css = ''
    + '.anote-fab{position:fixed;inset-inline-start:18px;bottom:18px;z-index:99990;width:52px;height:52px;border-radius:50%;'
    + 'border:0;cursor:pointer;background:#7E6E9C;color:#fff;box-shadow:0 10px 30px -8px rgba(70,56,98,.6);'
    + 'display:grid;place-items:center;font-size:22px;transition:transform .25s,opacity .25s;opacity:.92}'
    + '.anote-fab:hover{transform:scale(1.08);opacity:1}'
    + 'body.anote-on{--anote:1}'
    + 'body.anote-on .anote-pin{position:absolute;top:10px;inset-inline-start:10px;z-index:40;width:34px;height:34px;border-radius:50%;'
    + 'border:0;cursor:pointer;background:#fff;box-shadow:0 6px 16px -6px rgba(0,0,0,.4);display:grid;place-items:center;font-size:16px;'
    + 'border:2px solid #C9BCDE;transition:transform .2s}'
    + 'body.anote-on .anote-pin:hover{transform:scale(1.12)}'
    + '.anote-pin.has-note{border-color:#E6A23C;background:#FFF6E9}'
    + '.anote-pin.approved{border-color:#46B450;background:#EAF7EC}'
    + 'body.anote-on section[data-anote-has="note"]{outline:2px dashed #E6A23C;outline-offset:4px;border-radius:8px}'
    + 'body.anote-on section[data-anote-has="approved"]{outline:2px solid #46B450;outline-offset:4px;border-radius:8px}'
    + 'body.anote-on [data-anote-el]{transition:background .2s,box-shadow .2s}'
    + 'body.anote-on [contenteditable="true"]:hover{background:rgba(126,110,156,.07);border-radius:4px}'
    + 'body.anote-on [contenteditable="true"]:focus{outline:2px solid #7E6E9C;outline-offset:2px;border-radius:4px;background:#fff}'
    + 'body.anote-on [data-anote-edited="1"]{background:rgba(59,130,246,.12);box-shadow:inset 0 -2px 0 #3B82F6;border-radius:3px}'
    + '.anote-pop{position:fixed;z-index:99995;width:min(330px,90vw);background:#fff;border-radius:16px;'
    + 'box-shadow:0 30px 70px -20px rgba(40,30,60,.55);padding:16px;border:1px solid #ECE5DC;font-family:inherit;direction:rtl}'
    + '.anote-pop h4{font-size:15px;margin:0 0 10px;color:#39323F;padding-inline-end:44px}'
    + '.anote-pop textarea{width:100%;min-height:90px;border:1.5px solid #E5DCEF;border-radius:10px;padding:10px;font-family:inherit;font-size:15px;resize:vertical;color:#39323F}'
    + '.anote-pop textarea:focus{outline:none;border-color:#7E6E9C}'
    + '.anote-row{display:flex;align-items:center;gap:9px;margin-top:11px;font-size:14px;color:#39323F;cursor:pointer;user-select:none}'
    + '.anote-row input{width:18px;height:18px;accent-color:#46B450}'
    + '.anote-pop .x{display:flex;gap:8px;margin-top:13px}'
    + '.anote-pop button{flex:1;border:0;border-radius:10px;padding:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}'
    + '.anote-pop .ok{background:#7E6E9C;color:#fff}.anote-pop .clr{background:#F3EFF8;color:#7E6E9C}'
    + '.anote-bar{position:fixed;inset-inline:0;bottom:0;z-index:99991;background:#39323F;color:#fff;'
    + 'padding:12px clamp(14px,4vw,30px);display:flex;align-items:center;gap:12px;flex-wrap:wrap;'
    + 'box-shadow:0 -10px 40px -16px rgba(0,0,0,.5);direction:rtl;font-family:inherit}'
    + '.anote-bar .t{font-size:13.5px;line-height:1.4;flex:1 1 240px;min-width:0}'
    + '.anote-bar .t b{color:#E8B964}'
    + '.anote-bar input.gen{flex:2 1 280px;border:0;border-radius:10px;padding:11px 13px;font-family:inherit;font-size:14px;color:#39323F}'
    + '.anote-bar button{border:0;border-radius:24px;padding:11px 20px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap}'
    + '.anote-bar .send{background:#46B450;color:#fff}.anote-bar .exit{background:rgba(255,255,255,.14);color:#fff}'
    + '.anote-toast{position:fixed;inset-inline:0;top:0;z-index:99999;background:#46B450;color:#fff;text-align:center;'
    + 'padding:13px;font-family:inherit;font-size:14.5px;transform:translateY(-100%);transition:transform .35s;direction:rtl}'
    + '.anote-toast.show{transform:none}'
    + '.anote-revert{position:absolute;z-index:46;border:0;cursor:pointer;background:#3B82F6;color:#fff;'
    + 'font-family:inherit;font-size:11.5px;font-weight:700;border-radius:20px;padding:3px 10px;'
    + 'box-shadow:0 5px 14px -4px rgba(59,130,246,.8);display:inline-flex;align-items:center;gap:3px;'
    + 'white-space:nowrap;line-height:1.25;transition:transform .15s,background .2s}'
    + '.anote-revert:hover{background:#2563EB;transform:scale(1.07)}'
    + '.anote-mic{border:0;cursor:pointer;border-radius:50%;width:42px;height:42px;flex:none;'
    + 'background:#fff;color:#7E6E9C;font-size:18px;display:grid;place-items:center;box-shadow:0 6px 16px -6px rgba(0,0,0,.35)}'
    + '.anote-mic.rec{background:#E5484D;color:#fff;animation:anotePulse 1.1s infinite}'
    + '@keyframes anotePulse{0%{box-shadow:0 0 0 0 rgba(229,72,77,.55)}100%{box-shadow:0 0 0 13px rgba(229,72,77,0)}}'
    + '.anote-pop .anote-mic{width:36px;height:36px;font-size:15px;position:absolute;top:12px;inset-inline-end:12px}'
    + '.anote-bar .anote-hint{flex-basis:100%;font-size:12.5px;color:#E8B964;order:5;margin-top:-2px;line-height:1.4}'
    + '@media(max-width:560px){.anote-bar input.gen{flex-basis:100%;order:3}}';
    var st = document.createElement('style'); st.id = 'anote-css'; st.textContent = css; document.head.appendChild(st);
  }

  /* ---------------- badges / colored marks ---------------- */
  function updateBadges() {
    SECS.forEach(function (s) {
      var d = state.sections[s.id] || {};
      var pin = s.el.querySelector(':scope > .anote-pin');
      var has = d.approved ? 'approved' : (d.note && d.note.trim() ? 'note' : '');
      if (has) s.el.setAttribute('data-anote-has', has); else s.el.removeAttribute('data-anote-has');
      if (pin) {
        pin.className = 'anote-pin' + (d.approved ? ' approved' : (d.note && d.note.trim() ? ' has-note' : ''));
        pin.textContent = d.approved ? '✓' : (d.note && d.note.trim() ? '💬' : '✎');
      }
    });
  }

  /* ---------------- popover ---------------- */
  var pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(sec, anchor) {
    closePop();
    var d = state.sections[sec.id] || (state.sections[sec.id] = { note: '', approved: false });
    pop = document.createElement('div'); pop.className = 'anote-pop';
    pop.innerHTML =
      '<h4>הערה על: ' + esc(sec.label) + '</h4>' +
      '<button class="anote-mic" type="button" title="להקליט בעברית במקום לכתוב">🎤</button>' +
      '<textarea placeholder="מה תרצי לשנות כאן? כתבי — או הקליטי 🎤 בעברית…"></textarea>' +
      '<label class="anote-row"><input type="checkbox"> הסקשן הזה מצוין — להשאיר ✓</label>' +
      '<div class="x"><button class="ok">שמירה</button><button class="clr">ניקוי</button></div>';
    document.body.appendChild(pop);
    var ta = pop.querySelector('textarea'), cb = pop.querySelector('input[type="checkbox"]');
    ta.value = d.note || ''; cb.checked = !!d.approved;
    var r = anchor.getBoundingClientRect();
    var top = Math.min(r.bottom + 8, window.innerHeight - 280);
    pop.style.top = Math.max(12, top) + 'px';
    pop.style.insetInlineStart = Math.max(12, Math.min(r.left, window.innerWidth - 350)) + 'px';
    ta.focus();
    var commit = function () { d.note = ta.value; d.approved = cb.checked; persist(); };
    ta.addEventListener('input', commit);
    cb.addEventListener('change', commit);
    attachVoice(ta, commit, pop.querySelector('.anote-mic'));
    pop.querySelector('.ok').addEventListener('click', function () { commit(); closePop(); });
    pop.querySelector('.clr').addEventListener('click', function () { d.note = ''; d.approved = false; delete state.sections[sec.id]; persist(); closePop(); });
  }
  document.addEventListener('click', function (e) {
    if (pop && !pop.contains(e.target) && !e.target.classList.contains('anote-pin')) closePop();
  });

  /* ---------------- inline edit tracking ---------------- */
  function wireEdits() {
    EDS.forEach(function (ed) {
      ed.el.setAttribute('contenteditable', 'true');
      ed.el.addEventListener('input', function () {
        var orig = ed.el.getAttribute('data-anote-orig') || '';
        var now = ed.el.textContent.trim().replace(/\s+/g, ' ');
        if (now !== orig && now.length) {
          ed.el.setAttribute('data-anote-edited', '1');
          state.edits[ed.id] = { sec: ed.sec, before: orig, after: now };
        } else {
          ed.el.removeAttribute('data-anote-edited');
          delete state.edits[ed.id];
        }
        persist();
        renderReverts();
      });
    });
  }
  function unwireEdits() { EDS.forEach(function (ed) { ed.el.removeAttribute('contenteditable'); }); }
  function restoreEdits() {
    for (var id in state.edits) {
      var e = state.edits[id], el = document.querySelector('[data-anote-el="' + id + '"]');
      if (el) { el.textContent = e.after; el.setAttribute('data-anote-edited', '1'); }
    }
  }

  /* ---------------- per-change revert (undo to original, still re-editable) ---------------- */
  var revertChips = [];
  function clearReverts() { revertChips.forEach(function (c) { c.remove(); }); revertChips = []; }
  function renderReverts() {
    clearReverts();
    if (!ON) return;
    Object.keys(state.edits).forEach(function (id) {
      var el = document.querySelector('[data-anote-el="' + id + '"]');
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      var chip = document.createElement('button');
      chip.type = 'button'; chip.className = 'anote-revert';
      chip.innerHTML = '↺ ביטול'; chip.title = 'לבטל את השינוי ולחזור למקור';
      chip.style.left = (r.left + window.scrollX) + 'px';
      chip.style.top = (r.top + window.scrollY - 12) + 'px';
      chip.addEventListener('click', function (e) { e.stopPropagation(); revertEdit(id); });
      document.body.appendChild(chip); revertChips.push(chip);
    });
  }
  function revertEdit(id) {
    var el = document.querySelector('[data-anote-el="' + id + '"]');
    if (el) { el.textContent = el.getAttribute('data-anote-orig') || ''; el.removeAttribute('data-anote-edited'); }
    delete state.edits[id]; persist(); renderReverts();
    toast('הוחזר למקור ✓ — אפשר לערוך שוב');
  }

  /* ---------------- edit mode ---------------- */
  var ON = false, bar = null;
  function enter() {
    if (ON) return; ON = true; document.body.classList.add('anote-on');
    SECS.forEach(function (s) {
      if (s.el.querySelector(':scope > .anote-pin')) return;
      var pin = document.createElement('button'); pin.className = 'anote-pin'; pin.type = 'button'; pin.title = 'הערה על ' + s.label;
      pin.addEventListener('click', function (ev) { ev.stopPropagation(); openPop(s, pin); });
      s.el.appendChild(pin);
    });
    wireEdits(); restoreEdits(); updateBadges(); buildBar(); renderReverts();
  }
  function exit() {
    if (!ON) return; ON = false; document.body.classList.remove('anote-on');
    closePop(); unwireEdits(); clearReverts();
    document.querySelectorAll('.anote-pin').forEach(function (p) { p.remove(); });
    if (bar) { bar.remove(); bar = null; }
  }
  function buildBar() {
    if (bar) bar.remove();
    bar = document.createElement('div'); bar.className = 'anote-bar';
    bar.innerHTML =
      '<div class="t">✏️ <b>מצב עריכה</b> · כתבי או 🎤 הקליטי בעברית · נשמר אוטומטית</div>' +
      '<input class="gen" placeholder="הערה כללית — כתבי כאן…">' +
      '<button class="anote-mic" type="button" title="להקליט הערה בעברית במקום לכתוב">🎤</button>' +
      '<button class="send">📨 שליחה לשקד</button>' +
      '<button class="exit">סיום</button>' +
      '<div class="anote-hint">🎤 רוצה פשוט לדבר? לחצי על המיקרופון והקליטי בעברית כל מה שתרצי לשנות — וזה ייכתב לבד.</div>';
    document.body.appendChild(bar);
    var gen = bar.querySelector('.gen'); gen.value = state.general || '';
    gen.addEventListener('input', function () { state.general = gen.value; persist(); });
    attachVoice(gen, function (v) { state.general = v; persist(); }, bar.querySelector('.anote-mic'));
    bar.querySelector('.send').addEventListener('click', sendToShaked);
    bar.querySelector('.exit').addEventListener('click', exit);
  }

  /* ---------------- compile + send ---------------- */
  function buildPayload() {
    var lines = ['📝 הערות של אריאלה — דף "' + PAGE + '"', ''];
    SECS.forEach(function (s) {
      var d = state.sections[s.id] || {};
      var eds = Object.keys(state.edits).map(function (k) { return state.edits[k]; }).filter(function (e) { return e.sec === s.id; });
      if (!(d.note && d.note.trim()) && !d.approved && !eds.length) return;
      lines.push('▸ ' + s.label + ':');
      if (d.approved) lines.push('   ✓ מצוין — להשאיר');
      if (d.note && d.note.trim()) lines.push('   💬 ' + d.note.trim());
      eds.forEach(function (e) { lines.push('   ✎ שינוי טקסט: "' + e.before + '"  →  "' + e.after + '"'); });
      lines.push('');
    });
    if (state.general && state.general.trim()) { lines.push('📌 הערה כללית: ' + state.general.trim()); lines.push(''); }
    var machine = { v: 1, page: PAGE, general: state.general || '', sections: {}, edits: state.edits, ts: Date.now() };
    SECS.forEach(function (s) { var d = state.sections[s.id]; if (d && (d.note || d.approved)) machine.sections[s.id] = { label: s.label, note: d.note || '', approved: !!d.approved }; });
    lines.push('‹ARIELA-NOTES›' + JSON.stringify(machine) + '‹/ARIELA-NOTES›');
    return lines.join('\n');
  }
  function sendToShaked() {
    if (!hasContent()) { toast('עוד לא כתבת הערות 🙂'); return; }
    var text = buildPayload();
    var url = 'https://wa.me/' + (SHAKED_NUMBER || '') + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
    toast('נפתח וואטסאפ — בחרי את שקד ושלחי 💜');
  }

  /* ---------------- misc ---------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  var toastEl = null;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'anote-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* ---------------- Hebrew voice dictation (speech→text; falls back to typing) ---------------- */
  function attachVoice(targetEl, onCommit, btn) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { btn.style.display = 'none'; return; }   // not supported → hide mic, keep typing
    var rec = new SR(); rec.lang = 'he-IL'; rec.continuous = true; rec.interimResults = true;
    var base = '', listening = false;
    function stopUI() { listening = false; btn.classList.remove('rec'); btn.textContent = '🎤'; }
    rec.onresult = function (e) {
      var txt = '';
      for (var i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      targetEl.value = (base ? base + ' ' : '') + txt;
      onCommit(targetEl.value);
    };
    rec.onend = stopUI;
    rec.onerror = function () { stopUI(); toast('לא הצלחתי להקליט — אפשר פשוט לכתוב 🙂'); };
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (listening) { rec.stop(); return; }
      base = (targetEl.value || '').trim(); listening = true;
      btn.classList.add('rec'); btn.textContent = '⏹';
      try { rec.start(); toast('מקליטה… דברי בעברית ואני אכתוב 🎤'); } catch (_e) { stopUI(); }
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    discover(); injectCSS();
    window.addEventListener('resize', function () { if (ON) renderReverts(); });
    var wantEdit = /[?&#](edit|ערוך)/.test(location.href);
    var fab = document.createElement('button'); fab.className = 'anote-fab'; fab.type = 'button';
    fab.title = 'מצב עריכה — להוסיף הערות לדף'; fab.textContent = '✏️';
    fab.addEventListener('click', function () { ON ? exit() : enter(); });
    // FAB shows for mom (device already has notes) or when ?edit; hidden for clean visitors.
    if (wantEdit || hasContent()) document.body.appendChild(fab);
    if (wantEdit) enter();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
