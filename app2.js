/* ===================================================================
   אריאלה · Premium interactions
   =================================================================== */
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header pill ---- */
  var header = document.querySelector('.header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- scroll progress bar ---- */
  var progress = document.getElementById('progress');
  function updateProgress(){
    if(!progress) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    progress.style.transform = 'scaleX(' + Math.min(p,1) + ')';
  }
  window.addEventListener('scroll', updateProgress, {passive:true}); updateProgress();

  /* ---- mobile nav ---- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  var mClose = document.getElementById('mClose');
  function closeNav(){ if(mobileNav) mobileNav.classList.remove('open'); document.body.style.overflow=''; }
  if(navToggle && mobileNav){
    navToggle.addEventListener('click', function(){ mobileNav.classList.add('open'); document.body.style.overflow='hidden'; });
    if(mClose) mClose.addEventListener('click', closeNav);
    mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  }

  /* ---- active nav link on scroll ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sectionsForNav = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  if(navLinks.length){
    var navIo = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          var idx = sectionsForNav.indexOf(e.target);
          navLinks.forEach(function(l,i){ l.classList.toggle('active', i===idx); });
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    sectionsForNav.forEach(function(s){ if(s) navIo.observe(s); });
  }

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.14, rootMargin:'0px 0px -7% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- animated counters ---- */
  var counted = false;
  var proof = document.querySelector('.proof');
  function animateCounts(){
    if(counted) return; counted = true;
    document.querySelectorAll('[data-count]').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, t0 = null;
      function tick(t){
        if(!t0) t0 = t;
        var p = Math.min((t - t0)/dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if(proof){
    var pio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ animateCounts(); pio.disconnect(); } });
    },{threshold:.4});
    pio.observe(proof);
  }

  /* ---- hero 3D parallax (mouse) ---- */
  var stage = document.querySelector('.stage-3d');
  var chips = document.querySelectorAll('.chip');
  var heroSection = document.querySelector('.hero');
  if(stage && heroSection && !reduce && window.matchMedia('(pointer:fine)').matches){
    var tx = 0, ty = 0, cx = 0, cy = 0;
    heroSection.addEventListener('mousemove', function(e){
      var r = heroSection.getBoundingClientRect();
      tx = ((e.clientX - r.left)/r.width - .5);
      ty = ((e.clientY - r.top)/r.height - .5);
    });
    heroSection.addEventListener('mouseleave', function(){ tx = 0; ty = 0; });
    (function loop(){
      cx += (tx - cx)*.08; cy += (ty - cy)*.08;
      stage.style.transform = 'rotateY(' + (cx*10) + 'deg) rotateX(' + (-cy*8) + 'deg)';
      chips.forEach(function(c,i){
        var d = (i+1)*7;
        c.style.transform = 'translate(' + (cx*d) + 'px,' + (cy*d) + 'px)';
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---- subtle orb parallax on scroll ---- */
  var orbs = document.querySelectorAll('.orb');
  if(orbs.length && !reduce){
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      orbs.forEach(function(o,i){ o.style.transform = 'translateY(' + (y * (0.06 + i*0.03)) + 'px)'; });
    }, {passive:true});
  }

  /* ---- generic 3D tilt on cards ---- */
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - .5;
        var py = (e.clientY - r.top)/r.height - .5;
        card.style.transform = 'translateY(-7px) perspective(700px) rotateY(' + (px*6) + 'deg) rotateX(' + (-py*6) + 'deg)';
      });
      card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
    });
  }

  /* ---- magnetic buttons ---- */
  if(!reduce && window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('[data-magnet]').forEach(function(b){
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * .22;
        var y = (e.clientY - r.top - r.height/2) * .35;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.qa-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var qa = btn.closest('.qa'), ans = qa.querySelector('.qa-a'), open = qa.classList.contains('open');
      document.querySelectorAll('.qa.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('.qa-a').style.maxHeight = null; });
      if(!open){ qa.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });

  /* ---- smooth anchors ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var id = a.getAttribute('href');
      if(id.length>1){ var t = document.querySelector(id);
        if(t){ ev.preventDefault(); window.scrollTo({top:t.getBoundingClientRect().top + window.scrollY - 72, behavior:'smooth'}); }
      }
    });
  });

  /* ---- form ---- */
  var form = document.getElementById('leadForm');
  if(form){
    var phoneRe = /^0\d{1,2}[-\s]?\d{7}$|^0\d{9}$|^\+?\d[\d\-\s]{7,}$/;
    function setInvalid(f, bad){ f.classList.toggle('invalid', bad); }
    form.addEventListener('submit', function(ev){
      ev.preventDefault(); var ok = true;
      var nameF = form.querySelector('[data-f="name"]'), nameV = nameF.querySelector('input').value.trim();
      var badName = nameV.length < 2; setInvalid(nameF, badName); if(badName) ok=false;
      var phoneF = form.querySelector('[data-f="phone"]'), phoneV = phoneF.querySelector('input').value.trim();
      var badPhone = !phoneRe.test(phoneV); setInvalid(phoneF, badPhone); if(badPhone) ok=false;
      if(!ok){ var first = form.querySelector('.invalid input'); if(first) first.focus(); return; }
      var btn = form.querySelector('button[type="submit"]'); btn.textContent = 'שולח…'; btn.disabled = true;
      setTimeout(function(){
        form.style.display = 'none';
        var s = document.getElementById('formSuccess');
        if(s){ s.classList.add('show'); var u = s.querySelector('.uname'); if(u) u.textContent = nameV.split(' ')[0]; }
      }, 700);
    });
    form.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('input', function(){ inp.closest('.field').classList.remove('invalid'); });
    });
  }
})();
