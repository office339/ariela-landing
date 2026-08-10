/* ============================================================
   המלצות הורים — נבנה מ-window.TESTIMONIALS.
   כל המלצה: {name, age, quote, audio}. audio = שם immutable (נגזר-folder)
   כדי שהוספת המלצה לא תמספר-מחדש קבצים קיימים.
   שער-כפול במקור (pub_approved=✓ של אמא + marketing_consent של ההורה);
   כאן רק רינדור. נגן אחד מתנגן בכל פעם. אין מאושרות → הסקשן מוסתר (לא ריק).
   ============================================================ */
window.TESTIMONIALS = [
  {
    name: "תמר ג׳",
    age: "בת 14 · כיתה ח׳",
    quote: "כשפנינו אל אריאלה, הבת שלנו הייתה במקום מאוד לא פשוט — מבחינה חברתית היה לה קשה למצוא את מקומה, ומבחינה לימודית היא לא ממש האמינה בעצמה. לאט לאט קרה משהו מאוד יפה: ראינו ילדה יותר רגועה, יותר שמחה ובטוחה בעצמה. לא הייתה תחושה שאריאלה מנסה לשנות אותה — היא באמת רואה אותה, מבינה אותה, ומצליחה להגיע אליה בדרך שמתאימה לה.",
    audio: "testimonials/t_8a4c138b0d3c.mp3"
  },
  {
    name: "ליאור ש׳",
    age: "בן 11 · כיתה ה׳",
    quote: "ברגע שהגענו לאריאלה המצב השתפר פלאים מכל הבחינות — ההבנה, הכתיבה, הבנת הנקרא, והיכולת שלו ללמוד. התרגילים והנשימות עזרו לו לקשב, וחיזקו את הביטחון. אנחנו מצליחים לסמן וי על כל המטרות, מרוצים מאוד, וממשיכים — במיוחד בחופש הגדול, פעם בשבוע לפחות להגיע ולתרגל.",
    audio: "testimonials/t_1b4ab27ce4bb.mp3"
  },
  {
    name: "אופיר",
    age: "בן 16 · כיתה י׳",
    quote: "הגענו לאריאלה מאחר שחווינו קושי, ורצינו אבחון. החלטנו להתחיל משיעור ולראות איך זה מתקדם. הבן שלי התחיל להבין מה בעצם שואלים אותו — איך להתייחס לטקסט, על מה לשים דגש ואיך לנסח תשובה. אחד על אחד, עם המון סבלנות — והוא ראה שינוי.",
    audio: "testimonials/t_ff5589c55e6f.mp3"
  }
];

(function () {
  /* E: פריט תקין = אובייקט עם name+quote מחרוזתיים. פריט פגום מסונן — לא מפיל את הסקשן. */
  function isValid(t) {
    return t && typeof t === "object" &&
           typeof t.name === "string" && typeof t.quote === "string";
  }

  function build() {
    var grid = document.getElementById("tst-grid");
    var sec = document.getElementById("testimonials");
    if (!grid || !sec) return;
    var data = (window.TESTIMONIALS || []).filter(isValid);   // E — פריטים פגומים מסוננים
    if (!data.length) { sec.hidden = true; return; }          // אין מאושרות → אין סקשן ריק
    sec.hidden = false;                                       // K — שחזור אם הוסתר בעבר
    grid.textContent = "";
    var audios = [];

    data.forEach(function (t, i) {
      try {
        var card = document.createElement("article");
        card.className = "tst-card reveal" + (i % 2 ? " d1" : "");

        var q = document.createElement("span");
        q.className = "tst-q"; q.setAttribute("aria-hidden", "true"); q.textContent = "”";

        var p = document.createElement("p");
        p.className = "tst-text"; p.textContent = t.quote;

        var foot = document.createElement("div");
        foot.className = "tst-foot";
        var av = document.createElement("span");
        av.className = "tst-av"; av.setAttribute("aria-hidden", "true");
        av.textContent = (t.name || "♥").trim().charAt(0) || "♥";
        var who = document.createElement("div");
        who.className = "tst-who";
        var nm = document.createElement("b");
        nm.className = "tst-name"; nm.textContent = t.name;
        var ag = document.createElement("span");
        ag.className = "tst-age"; ag.textContent = typeof t.age === "string" ? t.age : "";
        who.appendChild(nm); who.appendChild(ag);
        foot.appendChild(av); foot.appendChild(who);

        card.appendChild(q); card.appendChild(p); card.appendChild(foot);

        if (typeof t.audio === "string" && t.audio) {
          var lab = document.createElement("div");
          lab.className = "tst-listen";
          lab.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
            '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg><span>בקולם של ההורים</span>';
          var au = document.createElement("audio");
          au.controls = true; au.preload = "none";
          au.className = "tst-audio"; au.src = t.audio;
          au.setAttribute("aria-label", "הקלטת המלצה של " + t.name);
          audios.push(au);
          card.appendChild(lab); card.appendChild(au);
        }

        grid.appendChild(card);
      } catch (e) {
        if (window.console && console.warn) console.warn("testimonial skipped:", e);
      }
    });

    /* one-at-a-time: הפעלת נגן אחד עוצרת את השאר */
    audios.forEach(function (a) {
      a.addEventListener("play", function () {
        audios.forEach(function (o) { if (o !== a && !o.paused) o.pause(); });
      });
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();
