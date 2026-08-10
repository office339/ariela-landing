/* ============================================================
   המלצות הורים — נבנה מ-window.TESTIMONIALS.
   כל המלצה: {name, age, quote, audio}. audio = שם immutable (נגזר-folder)
   כדי שהוספת המלצה לא תמספר-מחדש קבצים קיימים.
   שער-כפול במקור (pub_approved=✓ של אמא + marketing_consent של ההורה);
   כאן רק רינדור. נגן אחד מתנגן בכל פעם (רכז-אודיו עמודי — כולל הפודקאסט).
   אין מאושרות → הסקשן מוסתר (לא ריק).

   קרוסלה נגללת (scroll-snap + חיצים + נקודות). בכוונה בלי class="reveal"
   על אלמנטים דינמיים: ה-observer של app2.js נרשם לפני DOMContentLoaded,
   וכרטיס שנולד אחריו לעולם לא נצפה → נשאר opacity:0 (הבאג של 10/08).
   כניסת-הכרטיסים חיה ב-CSS עצמאי (tstIn) שלא תלוי באף observer.
   ============================================================ */
window.TESTIMONIALS = [
  {
    name: "תמר ג׳",
    age: "בת 14 · כיתה ח׳",
    quote: "כשפנינו אל אריאלה, הבת שלנו הייתה במקום מאוד לא פשוט — מבחינה חברתית היה לה קשה למצוא את מקומה, ומבחינה לימודית היא לא ממש האמינה בעצמה. לאט לאט קרה משהו מאוד יפה: ראינו ילדה יותר רגועה, יותר שמחה ובטוחה בעצמה. לא הייתה תחושה שאריאלה מנסה לשנות אותה — היא באמת רואה אותה, מבינה אותה, ומצליחה להגיע אליה בדרך שמתאימה לה.",
    audio: "testimonials/t_8a4c138b0d3c.mp3"
  },
  {
    name: "עדי",
    age: "סיימה י״ב",
    quote: "אריאלה הובילה לשינוי משמעותי אצל עדי הן רגשית וחברתית והן לימודית. שינוי לטובה שהוא הרבה מעבר לציפיות שלנו כהורים, ובעבור עדי — אריאלה היא המורה הכי משמעותית בחייה. תודה רבה."
  },
  {
    name: "ליאור ש׳",
    age: "בן 11 · כיתה ה׳",
    quote: "ברגע שהגענו לאריאלה המצב השתפר פלאים מכל הבחינות — ההבנה, הכתיבה, הבנת הנקרא, והיכולת שלו ללמוד. התרגילים והנשימות עזרו לו לקשב, וחיזקו את הביטחון. אנחנו מצליחים לסמן וי על כל המטרות, מרוצים מאוד, וממשיכים — במיוחד בחופש הגדול, פעם בשבוע לפחות להגיע ולתרגל.",
    audio: "testimonials/t_1b4ab27ce4bb.mp3"
  },
  {
    name: "אלרואי מ׳",
    age: "בן 10 · כיתה ד׳",
    quote: "אריאלה מקסימה ומדהימה וכמובן מקצועית, בחיוך ובמאור פנים תמיד, עם גישה מכבדת לתלמיד בגובה העיניים. ברגישות ובנחישות ידעה לגרום לאלרואי לשתף פעולה ולבצע תרגול ומשימות למידה מבלי שירגיש שהוא 'לומד' — כי מזה הוא התחמק. ידעה לצ'פר אותו בסוף כל שיעור וזה דרבן אותו. תודה רבה."
  },
  {
    name: "אופיר",
    age: "בן 16 · כיתה י׳",
    quote: "הגענו לאריאלה מאחר שחווינו קושי, ורצינו אבחון. החלטנו להתחיל משיעור ולראות איך זה מתקדם. הבן שלי התחיל להבין מה בעצם שואלים אותו — איך להתייחס לטקסט, על מה לשים דגש ואיך לנסח תשובה. אחד על אחד, עם המון סבלנות — והוא ראה שינוי.",
    audio: "testimonials/t_ff5589c55e6f.mp3"
  },
  {
    name: "דני ק׳",
    age: "בן 11 · כיתה ו׳",
    quote: "אריאלה אלופה, אנושית, מקצועית, אוהבת ילדים ואת המקצוע. רציתי להגיד לך תודה ענקית — על זה שליווית את דני שנתיים, ובעזרת השם נמשיך גם אחרי חופשת הקיץ. הילד עבר שינוי משמעותי, גם בכל מה שקשור לשפה, הבנת הנקרא, קריאה ודיבור. תודה רבה, תודה רבה, תודה רבה."
  }
];

(function () {
  var reduce = !!(window.matchMedia &&
                  window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* E: פריט תקין = אובייקט עם name+quote מחרוזתיים. פריט פגום מסונן — לא מפיל את הסקשן. */
  function isValid(t) {
    return t && typeof t === "object" &&
           typeof t.name === "string" && typeof t.quote === "string";
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  var CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  var CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>';

  function buildCard(t) {
    var card = el("article", "tst-card");

    var q = el("span", "tst-q");
    q.setAttribute("aria-hidden", "true"); q.textContent = "”";

    var p = el("p", "tst-text");
    p.textContent = t.quote;

    var foot = el("div", "tst-foot");
    var av = el("span", "tst-av");
    av.setAttribute("aria-hidden", "true");
    av.textContent = (t.name || "♥").trim().charAt(0) || "♥";
    var who = el("div", "tst-who");
    var nm = el("b", "tst-name"); nm.textContent = t.name;
    var ag = el("span", "tst-age"); ag.textContent = typeof t.age === "string" ? t.age : "";
    who.appendChild(nm); who.appendChild(ag);
    foot.appendChild(av); foot.appendChild(who);

    card.appendChild(q); card.appendChild(p);

    if (typeof t.audio === "string" && t.audio) {
      var lab = el("div", "tst-listen");
      lab.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg><span>בקולם של ההורים</span>';
      var au = document.createElement("audio");
      au.controls = true; au.preload = "none";
      au.className = "tst-audio"; au.src = t.audio;
      au.setAttribute("aria-label", "הקלטת המלצה של " + t.name);
      card.appendChild(lab); card.appendChild(au);
    } else {
      /* המלצה כתובה (בלי הקלטה) — תווית משלה, לאיזון חזותי מול "בקולם של ההורים" */
      var wlab = el("div", "tst-listen tst-written");
      wlab.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>' +
        '<span>מתוך מכתב של ההורים</span>';
      card.appendChild(wlab);
    }

    card.appendChild(foot);
    return card;
  }

  function build() {
    var host = document.getElementById("tst-grid");
    var sec = document.getElementById("testimonials");
    if (!host || !sec) return;
    var data = (window.TESTIMONIALS || []).filter(isValid);   // E — פריטים פגומים מסוננים
    if (!data.length) { sec.hidden = true; return; }          // אין מאושרות → אין סקשן ריק

    /* שלב 1: בונים קודם את כל הכרטיסים שמצליחים — הניווט נגזר רק מהמוצלחים,
       כך שאינדקסי הנקודות/החיצים תמיד רציפים ותואמים (ממצא-עין 10/08). */
    var cards = [];
    data.forEach(function (t) {
      try { cards.push(buildCard(t)); }
      catch (e) { if (window.console && console.warn) console.warn("testimonial skipped:", e); }
    });
    if (!cards.length) { sec.hidden = true; return; }         // כולם נפלו → אין סקשן ריק
    sec.hidden = false;                                       // K — שחזור אם הוסתר בעבר
    host.textContent = "";

    var car = el("div", "tst-carousel");
    var track = el("div", "tst-track");
    track.setAttribute("tabindex", "0");
    track.setAttribute("role", "region");
    track.setAttribute("aria-label", "המלצות הורים — אפשר לגלול בין ההמלצות");
    var dots = el("div", "tst-dots");
    /* RTL: הכרטיס הראשון מימין; "הקודמת" חוזרת ימינה, "הבאה" ממשיכה שמאלה */
    var btnPrev = el("button", "tst-nav prev");
    btnPrev.type = "button"; btnPrev.innerHTML = CHEV_R;
    btnPrev.setAttribute("aria-label", "ההמלצה הקודמת");
    var btnNext = el("button", "tst-nav next");
    btnNext.type = "button"; btnNext.innerHTML = CHEV_L;
    btnNext.setAttribute("aria-label", "ההמלצה הבאה");

    cards.forEach(function (card, i) {
      card.style.animationDelay = reduce ? "0s" : (Math.min(i, 5) * 0.09) + "s";
      track.appendChild(card);
      var dot = el("button", "tst-dot");
      dot.type = "button";
      dot.setAttribute("aria-label", "המלצה " + (i + 1) + " מתוך " + cards.length);
      dot.addEventListener("click", function () { go(i); });
      dots.appendChild(dot);
    });

    car.appendChild(btnPrev); car.appendChild(track); car.appendChild(btnNext);
    host.appendChild(car); host.appendChild(dots);
    /* כרטיס יחיד — אין מה לנווט: מסתירים חיצים ונקודות */
    if (cards.length < 2) { btnPrev.hidden = true; btnNext.hidden = true; dots.hidden = true; }

    var cur = 0;
    function go(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      /* scrollIntoView צירי — עמיד-RTL (בלי חשבונות scrollLeft שליליים);
         block:'nearest' כדי שהעמוד לא יקפוץ אנכית; reduced-motion → בלי smooth */
      try { cards[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" }); }
      catch (e) { cards[i].scrollIntoView(); }
      setCur(i);
    }
    function setCur(i) {
      cur = i;
      for (var k = 0; k < dots.children.length; k++) {
        var on = (k === cur);
        dots.children[k].classList.toggle("on", on);
        if (on) dots.children[k].setAttribute("aria-current", "true");
        else dots.children[k].removeAttribute("aria-current");
      }
      btnPrev.disabled = (cur === 0);
      btnNext.disabled = (cur === cards.length - 1);
    }
    /* הקרוב-למרכז קובע את הנקודה הפעילה; בקצוות הגלילה מהדקים לקצה —
       כרטיס-קצה לא תמיד מסוגל להתמרכז, והמרכז-הקרוב היה "גונב" לו את הנקודה
       (ממצא-עין 10/08). |scrollLeft| עובד זהה ב-RTL (כרום: 0 → שלילי). */
    var raf = 0;
    function sync() {
      raf = 0;
      var best = 0;
      var sl = Math.abs(track.scrollLeft);
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 1) best = 0;
      else if (sl <= 2) best = 0;
      else if (sl >= max - 2) best = cards.length - 1;
      else {
        var tr = track.getBoundingClientRect();
        var mid = tr.left + tr.width / 2, bestD = Infinity;
        for (var k = 0; k < cards.length; k++) {
          var r = cards[k].getBoundingClientRect();
          var d = Math.abs((r.left + r.width / 2) - mid);
          if (d < bestD) { bestD = d; best = k; }
        }
      }
      setCur(best);
    }
    track.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(sync);
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!raf) raf = requestAnimationFrame(sync);
    });
    /* מקלדת: רק כשה-track עצמו בפוקוס — חיצים בתוך נגן-אודיו ממוקד שייכים לנגן
       (ממצא-עין 10/08: בלי המגן, seek בנגן היה מזיז את הקרוסלה). */
    track.addEventListener("keydown", function (ev) {
      if (ev.target !== track) return;
      if (ev.key === "ArrowLeft") { ev.preventDefault(); go(cur + 1); }
      else if (ev.key === "ArrowRight") { ev.preventDefault(); go(cur - 1); }
    });
    btnPrev.addEventListener("click", function () { go(cur - 1); });
    btnNext.addEventListener("click", function () { go(cur + 1); });
    setCur(0);
  }

  /* רכז-אודיו עמודי (once): נגן אחד בכל רגע — כולל הפודקאסט והנגנים בכרטיסים.
     capture=true תופס את אירוע ה-play של כל <audio> בדף, גם עתידי. */
  if (!window.__tstAudioCoord) {
    window.__tstAudioCoord = true;
    document.addEventListener("play", function (e) {
      var t = e.target;
      if (!t || String(t.tagName).toUpperCase() !== "AUDIO") return;
      var all = document.querySelectorAll("audio");
      for (var k = 0; k < all.length; k++)
        if (all[k] !== t && !all[k].paused) all[k].pause();
    }, true);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();
