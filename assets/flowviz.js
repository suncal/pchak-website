/* P CHAK Finance Data Flow — animated pipeline visual.
   Renders into any element with [data-flowviz]. No dependencies. */
(function () {
  const SOURCES = ["NetSuite", "SAP", "QuickBooks", "Xero", "Business Central", "Salesforce", "Workday", "Banks"];
  const STAGES = [
    { k: "CONNECT", s: "Source feeds" },
    { k: "MAP", s: "Chart of accounts" },
    { k: "CONSOLIDATE", s: "FX & intercompany" },
    { k: "RECONCILE", s: "Tie-out to GL" },
  ];
  const OUTPUTS = ["P&L", "Budget vs Actual", "Cash Flow", "KPIs", "Board Pack"];

  function css(el, name, fb) {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v || fb;
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function bez(p0, p1, p2, p3, t) {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  }
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function init(host) {
    const cv = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", "Animated diagram: data from ERP, CRM, HR and bank systems flows through connect, map, consolidate and reconcile stages into P&L, budget vs actual, cash, KPI and board pack dashboards.");
    cv.style.width = "100%";
    cv.style.display = "block";
    host.appendChild(cv);
    const ctx = cv.getContext("2d");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, dpr = 1, vertical = false, L = null, K = 1;
    const F = (w, px, fam) => w + ' ' + Math.round(px * K) + 'px ' + fam;
    const parts = [];
    const pulses = STAGES.map(() => 0);
    const outGlow = OUTPUTS.map(() => 0);
    const series = OUTPUTS.map(() => Array.from({ length: 14 }, () => 0.35 + Math.random() * 0.5));
    let records = 1284000 + Math.floor(Math.random() * 9000);
    let exceptions = 0, resolved = 0, last = 0, spawnAcc = 0, running = true, t0 = performance.now();

    function layout() {
      const r = host.getBoundingClientRect();
      W = Math.max(300, r.width);
      vertical = W < 760;
      K = vertical ? 1 : Math.max(1, Math.min(1.6, W / 1300));
      H = host.dataset.height ? +host.dataset.height : vertical ? 940 : Math.max(460, Math.min(560, W * 0.42));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const src = [], stg = [], out = [];
      if (!vertical) {
        const sx = W * 0.02, sw = Math.min(150 * K, W * 0.13), sh = 30 * K;
        const gap = (H - 40) / SOURCES.length;
        SOURCES.forEach((n, i) => src.push({ n, x: sx, y: 20 + gap * i + (gap - sh) / 2, w: sw, h: sh }));
        const x0 = W * 0.3, x1 = W * 0.7;
        STAGES.forEach((s, i) => stg.push({ ...s, x: x0 + ((x1 - x0) * i) / (STAGES.length - 1), y: H * 0.47, r: Math.min(34 * K, W * 0.028) }));
        const ow = Math.min(190 * K, W * 0.17), oh = (H - 40) / OUTPUTS.length - 12;
        OUTPUTS.forEach((n, i) => out.push({ n, x: W - ow - W * 0.02, y: 20 + i * (oh + 12) + 6, w: ow, h: oh }));
      } else {
        const cols = 2, sw = (W - 48) / cols, sh = 30;
        SOURCES.forEach((n, i) => src.push({ n, x: 16 + (i % cols) * (sw + 16), y: 16 + Math.floor(i / cols) * 40, w: sw, h: sh }));
        const y0 = 220, y1 = 520;
        STAGES.forEach((s, i) => stg.push({ ...s, x: W / 2, y: y0 + ((y1 - y0) * i) / (STAGES.length - 1), r: 26 }));
        const ow = (W - 48) / 2, oh = 70;
        OUTPUTS.forEach((n, i) => {
          const full = i === OUTPUTS.length - 1;
          out.push({ n, x: full ? 16 : 16 + (i % 2) * (ow + 16), y: 680 + Math.floor(i / 2) * (oh + 12), w: full ? W - 32 : ow, h: oh });
        });
      }
      L = { src, stg, out };
    }

    function srcAnchor(s) { return vertical ? { x: s.x + s.w / 2, y: s.y + s.h } : { x: s.x + s.w, y: s.y + s.h / 2 }; }
    function outAnchor(o) { return vertical ? { x: o.x + o.w / 2, y: o.y } : { x: o.x, y: o.y + o.h / 2 }; }
    function curve(a, b) {
      if (vertical) { const my = (a.y + b.y) / 2; return [a, { x: a.x, y: my }, { x: b.x, y: my }, b]; }
      const mx = (a.x + b.x) / 2; return [a, { x: mx, y: a.y }, { x: mx, y: b.y }, b];
    }

    function spawn() {
      const si = Math.floor(Math.random() * SOURCES.length);
      const oi = Math.floor(Math.random() * OUTPUTS.length);
      parts.push({ si, oi, leg: 0, t: 0, sp: 0.55 + Math.random() * 0.7, exc: Math.random() < 0.07, excDone: false, orbit: 0, jitter: (Math.random() - 0.5) * 6 });
    }

    function pos(p) {
      const st = L.stg;
      if (p.leg === 0) { const c = curve(srcAnchor(L.src[p.si]), st[0]); return bez(c[0], c[1], c[2], c[3], ease(p.t)); }
      if (p.leg >= 1 && p.leg <= 3) {
        const a = st[p.leg - 1], b = st[p.leg];
        if (p.orbit > 0) {
          const ang = p.orbit * Math.PI * 2, R = a.r + 22;
          return vertical ? { x: a.x + Math.cos(ang) * R - 46, y: a.y + Math.sin(ang) * R } : { x: a.x + Math.cos(ang) * R, y: a.y - 46 + Math.sin(ang) * 18 };
        }
        const t = ease(p.t);
        return { x: a.x + (b.x - a.x) * t + (vertical ? p.jitter : 0), y: a.y + (b.y - a.y) * t + (vertical ? 0 : p.jitter) };
      }
      const c = curve(st[3], outAnchor(L.out[p.oi])); return bez(c[0], c[1], c[2], c[3], ease(p.t));
    }

    function step(dt) {
      spawnAcc += dt;
      const rate = 0.045;
      while (spawnAcc > rate) { spawnAcc -= rate; if (parts.length < 260) spawn(); }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (p.orbit > 0) {
          p.orbit += dt * 0.9;
          if (p.orbit >= 1.999) { p.orbit = 0; p.excDone = true; resolved++; }
          continue;
        }
        p.t += dt * p.sp * (p.leg === 0 || p.leg === 4 ? 0.55 : 1.1);
        if (p.t >= 1) {
          p.t = 0; p.leg++;
          if (p.leg >= 1 && p.leg <= 4) pulses[p.leg - 1] = 1;
          if (p.leg === 2 && p.exc && !p.excDone) { p.leg = 2; p.orbit = 0.001; exceptions++; }
          if (p.leg === 5) {
            outGlow[p.oi] = 1;
            const s = series[p.oi]; const lv0 = s[s.length - 1]; s.push(Math.max(0.15, Math.min(0.95, lv0 + (0.58 - lv0) * 0.2 + (Math.random() - 0.5) * 0.26))); s.shift();
            records += 37 + Math.floor(Math.random() * 90);
            parts.splice(i, 1);
          }
        }
      }
      for (let i = 0; i < pulses.length; i++) pulses[i] = Math.max(0, pulses[i] - dt * 2.4);
      for (let i = 0; i < outGlow.length; i++) outGlow[i] = Math.max(0, outGlow[i] - dt * 1.6);
    }

    function draw(now) {
      const C = {
        fg: css(host, "--paper", "#F5F3EE"),
        mut: css(host, "--mut", "rgba(245,243,238,.55)"),
        line: css(host, "--line", "rgba(245,243,238,.09)"),
        red: css(host, "--red", "#E8362D"),
        blue: css(host, "--blue", "#3D63C9"),
        card: css(host, "--ink-3", "#101827"),
      };
      const amber = "#E8A13A";
      ctx.clearRect(0, 0, W, H);
      const time = (now - t0) / 1000;

      // connector paths
      ctx.lineWidth = 1;
      ctx.strokeStyle = C.line;
      L.src.forEach((s) => { const c = curve(srcAnchor(s), L.stg[0]); ctx.beginPath(); ctx.moveTo(c[0].x, c[0].y); ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y); ctx.stroke(); });
      L.out.forEach((o) => { const c = curve(L.stg[3], outAnchor(o)); ctx.beginPath(); ctx.moveTo(c[0].x, c[0].y); ctx.bezierCurveTo(c[1].x, c[1].y, c[2].x, c[2].y, c[3].x, c[3].y); ctx.stroke(); });
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = -time * 30;
      for (let i = 0; i < 3; i++) { const a = L.stg[i], b = L.stg[i + 1]; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.setLineDash([]);

      // sources
      ctx.font = F("500", 12, "'IBM Plex Mono', monospace"); ctx.textBaseline = "middle";
      L.src.forEach((s, i) => {
        rr(ctx, s.x, s.y, s.w, s.h, 3); ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
        const blink = 0.5 + 0.5 * Math.sin(time * 3 + i * 1.7);
        ctx.fillStyle = blink > 0.5 ? C.red : C.mut; ctx.beginPath(); ctx.arc(s.x + 12 * K, s.y + s.h / 2, 3 * K, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.fg; ctx.textAlign = "left"; ctx.fillText(s.n, s.x + 22 * K, s.y + s.h / 2 + 1);
      });

      // particles
      parts.forEach((p) => {
        const q = pos(p);
        let col = p.leg >= 4 ? C.red : C.blue;
        if (p.orbit > 0) col = amber;
        ctx.globalAlpha = 0.22; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, 5.5 * K, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 * K, 0, Math.PI * 2); ctx.fill();
      });

      // stages
      L.stg.forEach((s, i) => {
        const pr = pulses[i];
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(time * (i % 2 ? -0.6 : 0.6));
        ctx.setLineDash([3, 5]); ctx.strokeStyle = i === 3 ? C.red : C.mut; ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(0, 0, s.r + 9, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); ctx.setLineDash([]); ctx.globalAlpha = 1;
        if (pr > 0) { ctx.strokeStyle = C.red; ctx.globalAlpha = pr * 0.6; ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 9 + (1 - pr) * 16, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
        ctx.fillStyle = C.card; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = i === 3 ? C.red : C.fg; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = i === 3 ? C.red : C.fg; ctx.textAlign = "center";
        ctx.font = F("600", 13, "'Space Grotesk', sans-serif"); ctx.fillText(String(i + 1).padStart(2, "0"), s.x, s.y + 1);
        const lx = vertical ? s.x + s.r + 22 : s.x, ly = vertical ? s.y - 7 : s.y + s.r + 26 * K;
        ctx.textAlign = vertical ? "left" : "center";
        ctx.fillStyle = C.fg; ctx.font = F("500", 11, "'IBM Plex Mono', monospace"); ctx.fillText(s.k, lx, ly);
        ctx.fillStyle = C.mut; ctx.font = F("400", 11, "'Inter', sans-serif"); ctx.fillText(s.s, lx, ly + 15 * K);
      });
      // check mark on reconcile
      const rc = L.stg[3]; ctx.strokeStyle = C.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rc.x + rc.r * 0.55, rc.y - rc.r * 0.95); ctx.lineTo(rc.x + rc.r * 0.75, rc.y - rc.r * 0.75); ctx.lineTo(rc.x + rc.r * 1.1, rc.y - rc.r * 1.15); ctx.stroke(); ctx.lineWidth = 1;

      // outputs
      L.out.forEach((o, i) => {
        rr(ctx, o.x, o.y, o.w, o.h, 4); ctx.fillStyle = C.card; ctx.fill();
        ctx.strokeStyle = outGlow[i] > 0.05 ? C.red : C.line; ctx.globalAlpha = outGlow[i] > 0.05 ? 0.4 + outGlow[i] * 0.6 : 1; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.textAlign = "left"; ctx.fillStyle = C.fg; ctx.font = F("600", 12, "'Space Grotesk', sans-serif"); ctx.fillText(o.n, o.x + 12, o.y + 15 * K);
        const s = series[i], cx = o.x + 12, cw = o.w - 24, cy = o.y + 26 * K, ch = o.h - 34 * K;
        if (ch > 10) {
          if (i % 2 === 0) {
            const bw = cw / s.length;
            s.forEach((v, j) => { ctx.fillStyle = j === s.length - 1 ? C.red : C.mut; ctx.globalAlpha = j === s.length - 1 ? 1 : 0.45; ctx.fillRect(cx + j * bw + 1, cy + ch - v * ch, bw - 3, v * ch); });
            ctx.globalAlpha = 1;
          } else {
            ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; ctx.beginPath();
            s.forEach((v, j) => { const x = cx + (cw * j) / (s.length - 1), y = cy + ch - v * ch; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
            ctx.stroke(); ctx.lineWidth = 1;
            const lv = s[s.length - 1]; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx + cw, cy + ch - lv * ch, 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      });

      // live counters
      ctx.textAlign = vertical ? "left" : "center";
      const stats = [[vertical ? "RECORDS" : "RECORDS SYNCED", records.toLocaleString("en-US")], [vertical ? "EXCEPTIONS" : "EXCEPTIONS RESOLVED", resolved + " / " + exceptions], [vertical ? "GL VARIANCE" : "VARIANCE TO GL", "$0.00"]];
      const by = vertical ? 612 : H - 34 * K;
      stats.forEach((st, i) => {
        const x = vertical ? 16 + i * ((W - 32) / 3) : W * 0.32 + i * W * 0.18;
        ctx.fillStyle = C.mut; ctx.font = F("400", 10, "'IBM Plex Mono', monospace"); ctx.fillText(st[0], x, by);
        ctx.fillStyle = i === 2 ? C.red : C.fg; ctx.font = F("600", 15, "'Space Grotesk', sans-serif"); ctx.fillText(st[1], x, by + 17 * K);
      });
    }

    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      step(dt); draw(now);
      requestAnimationFrame(frame);
    }

    layout();
    if (reduce) { for (let i = 0; i < 400; i++) step(0.03); draw(performance.now()); }
    else {
      for (let i = 0; i < 160; i++) step(0.03);
      const io = new IntersectionObserver((es) => es.forEach((e) => { running = e.isIntersecting; if (running) { last = 0; requestAnimationFrame(frame); } }), { threshold: 0.05 });
      io.observe(host);
    }
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduce) draw(performance.now()); }, 150); });
  }

  function boot() { document.querySelectorAll("[data-flowviz]").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
