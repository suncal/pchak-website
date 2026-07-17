/* ============================================================
   P CHAK CONSULTING — Shared Interaction Engine v2
   ============================================================ */
(function(){
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

/* ---------- page transition wipe ---------- */
const wipe = document.createElement('div');
wipe.className = 'wipe in-start';
wipe.innerHTML = '<i></i><i></i>';
document.body.appendChild(wipe);
requestAnimationFrame(()=>requestAnimationFrame(()=>{
  wipe.classList.remove('in-start');
  wipe.classList.add('in');
}));
document.addEventListener('click', e=>{
  const a = e.target.closest('a');
  if(!a) return;
  const href = a.getAttribute('href') || '';
  if(a.target === '_blank' || a.hasAttribute('download') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
  if(reduce) return;
  e.preventDefault();
  wipe.classList.remove('in');
  wipe.classList.add('out');
  setTimeout(()=>{ location.href = href; }, 560);
});
window.addEventListener('pageshow', e=>{ if(e.persisted){ wipe.classList.remove('out'); wipe.classList.add('in'); } });

/* ---------- custom cursor ---------- */
if(fine && !reduce){
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  ring.innerHTML = '<span class="cursor-label"></span>';
  document.body.append(dot, ring);
  let mx = -100, my = -100, rx = -100, ry = -100, shown = false;
  addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    if(!shown){ document.body.classList.add('has-cursor'); shown = true; }
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  }, {passive:true});
  (function follow(){
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();
  const label = ring.querySelector('.cursor-label');
  document.addEventListener('mouseover', e=>{
    const t = e.target.closest('a,button,[data-cursor]');
    if(t){
      ring.classList.add('hovering');
      label.textContent = t.dataset.cursor || (t.hasAttribute('download') ? 'PDF' : 'OPEN');
    } else {
      ring.classList.remove('hovering');
    }
  });
  document.addEventListener('mouseleave', ()=>{ document.body.classList.remove('has-cursor'); shown = false; });
  document.addEventListener('mouseenter', ()=>{ document.body.classList.add('has-cursor'); shown = true; });
}

/* ---------- scroll progress ---------- */
const prog = document.createElement('div');
prog.className = 'progress'; prog.innerHTML = '<span></span>';
document.body.appendChild(prog);
const progBar = prog.firstChild;

/* ---------- nav ---------- */
const nav = document.querySelector('.nav');
let lastY = 0;
function onScroll(){
  const y = scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  progBar.style.transform = `scaleX(${h > 0 ? y/h : 0})`;
  if(nav){
    nav.classList.toggle('scrolled', y > 40);
    const menuOpen = document.querySelector('.mobile-menu.open');
    nav.classList.toggle('hidden', y > 500 && y > lastY && !menuOpen);
  }
  lastY = y;
}
addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* mark active nav link */
const here = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a=>{
  const href = a.getAttribute('href');
  if(href === here) a.classList.add('active');
});

/* ---------- mobile menu ---------- */
const burger = document.querySelector('.burger');
const mmenu = document.querySelector('.mobile-menu');
if(burger && mmenu){
  burger.addEventListener('click', ()=>{
    burger.classList.toggle('open');
    mmenu.classList.toggle('open');
    document.body.style.overflow = mmenu.classList.contains('open') ? 'hidden' : '';
  });
  mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    burger.classList.remove('open'); mmenu.classList.remove('open'); document.body.style.overflow = '';
  }));
}

/* ---------- split text ---------- */
document.querySelectorAll('[data-split]').forEach(el=>{
  const walk = node=>{
    [...node.childNodes].forEach(n=>{
      if(n.nodeType === 3){
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part=>{
          if(/^\s+$/.test(part) || part === ''){ frag.appendChild(document.createTextNode(part)); }
          else {
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = part;
            w.appendChild(i); frag.appendChild(w);
          }
        });
        node.replaceChild(frag, n);
      } else if(n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
  };
  walk(el);
  el.classList.add('split');
  el.querySelectorAll('.w>i').forEach((i,idx)=>{ i.style.transitionDelay = (idx*.045)+'s'; });
});

/* ---------- reveals ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.12, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv, .split, .big-word').forEach(el=>io.observe(el));

/* ---------- counters ---------- */
const ioC = new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return; ioC.unobserve(e.target);
  const el = e.target, target = +el.dataset.target, dur = 1400, t0 = performance.now();
  (function tick(now){
    const p = Math.min((now-t0)/dur, 1), ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(target*ease);
    if(p < 1) requestAnimationFrame(tick);
  })(t0);
}), {threshold:.6});
document.querySelectorAll('.count').forEach(el=>ioC.observe(el));

/* ---------- marquee ---------- */
document.querySelectorAll('.marquee-track').forEach(t=>{ t.innerHTML += t.innerHTML; });

/* ---------- magnetic ---------- */
if(fine && !reduce){
  document.querySelectorAll('.btn, .nav-cta, [data-magnetic]').forEach(el=>{
    let raf;
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * .22;
      const y = (e.clientY - r.top - r.height/2) * .3;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{ el.style.transform = `translate(${x}px,${y}px)`; });
    });
    el.addEventListener('mouseleave', ()=>{
      cancelAnimationFrame(raf);
      el.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
      setTimeout(()=>{ el.style.transition = ''; }, 500);
    });
  });
}

/* ---------- tilt cards ---------- */
if(fine && !reduce){
  document.querySelectorAll('[data-tilt]').forEach(el=>{
    let raf;
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - .5;
      const py = (e.clientY - r.top)/r.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        el.style.transform = `perspective(900px) rotateX(${-py*5}deg) rotateY(${px*6}deg) translateZ(0)`;
      });
    });
    el.addEventListener('mouseleave', ()=>{
      cancelAnimationFrame(raf);
      el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      el.style.transform = '';
      setTimeout(()=>{ el.style.transition = ''; }, 600);
    });
  });
}

/* ---------- parallax [data-parallax="0.2"] ---------- */
const plx = [...document.querySelectorAll('[data-parallax]')];
if(plx.length && !reduce){
  const loop = ()=>{
    plx.forEach(el=>{
      const sp = parseFloat(el.dataset.parallax) || .2;
      const r = el.getBoundingClientRect();
      const c = (r.top + r.height/2 - innerHeight/2);
      el.style.transform = `translateY(${c * -sp}px)`;
    });
  };
  addEventListener('scroll', ()=>requestAnimationFrame(loop), {passive:true});
  loop();
}

/* ---------- accordion ---------- */
document.querySelectorAll('.acc-item').forEach(item=>{
  const head = item.querySelector('.acc-head');
  const body = item.querySelector('.acc-body');
  head.addEventListener('click', ()=>{
    const open = item.classList.contains('open');
    item.closest('.acc').querySelectorAll('.acc-item.open').forEach(o=>{
      o.classList.remove('open');
      o.querySelector('.acc-body').style.maxHeight = '0px';
    });
    if(!open){
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

/* ---------- sticky rail highlight ---------- */
const rail = document.querySelector('.rail');
if(rail){
  const links = [...rail.querySelectorAll('a')];
  const secs = links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const ioR = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.toggle('on', l.getAttribute('href') === '#'+e.target.id));
      }
    });
  }, {rootMargin:'-30% 0px -55% 0px'});
  secs.forEach(s=>ioR.observe(s));
}

/* ---------- live clock ET ---------- */
const clock = document.getElementById('clock');
if(clock){
  const tick = ()=>{ clock.textContent = new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:'America/New_York'}).format(new Date())+' ET'; };
  tick(); setInterval(tick, 1000);
}

/* ---------- year ---------- */
document.querySelectorAll('#year').forEach(el=>{ el.textContent = new Date().getFullYear(); });

/* ---------- preloader (home only, once per session) ---------- */
const pre = document.querySelector('.preloader');
if(pre){
  if(sessionStorage.getItem('pchak-loaded') || reduce){
    pre.remove();
  } else {
    document.body.style.overflow = 'hidden';
    const count = pre.querySelector('.pre-count');
    const bar = pre.querySelector('.pre-bar span');
    let p = 0;
    const iv = setInterval(()=>{
      p = Math.min(100, p + Math.random()*14 + 4);
      count.textContent = Math.floor(p).toString().padStart(3,'0');
      bar.style.transform = `scaleX(${p/100})`;
      if(p >= 100){
        clearInterval(iv);
        setTimeout(()=>{
          pre.classList.add('done');
          document.body.style.overflow = '';
          sessionStorage.setItem('pchak-loaded','1');
          setTimeout(()=>pre.remove(), 1000);
        }, 250);
      }
    }, 90);
  }
}
})();
