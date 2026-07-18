/* ============================================================
   P CHAK CONSULTING — Hero Instruments
   Per-page interactive canvas scenes. Pure canvas, no libraries.
   Usage: <canvas class="ph-viz" data-viz="radar"></canvas>
   ============================================================ */
(function(){
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const INK = a => 'rgba(11,15,23,'+a+')';
const RED = a => 'rgba(232,54,45,'+a+')';
const TAU = Math.PI*2;
// deterministic pseudo-random (stable frames across loads)
function rng(seed){ let s=seed>>>0; return ()=>((s=Math.imul(48271,s)%2147483647)&2147483647)/2147483647; }

const SCENES = {

/* ---- cybersecurity: intrusion radar ---- */
radar(ctx,w,h,t,m){
  const cx=w*.52, cy=h*.52, R=Math.min(w,h)*.36;
  ctx.lineWidth=1;
  [.35,.65,1].forEach(k=>{ctx.strokeStyle=INK(.14);ctx.beginPath();ctx.arc(cx,cy,R*k,0,TAU);ctx.stroke();});
  for(let d=0;d<360;d+=15){const a=d*Math.PI/180;
    ctx.strokeStyle=INK(d%45===0?.25:.1);
    ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*R*.97,cy+Math.sin(a)*R*.97);ctx.lineTo(cx+Math.cos(a)*R*1.04,cy+Math.sin(a)*R*1.04);ctx.stroke();}
  ctx.strokeStyle=INK(.1);ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
  const sweep=t*.9;
  const g=ctx.createConicGradient?ctx.createConicGradient(sweep,cx,cy):null;
  if(g){g.addColorStop(0,RED(.16));g.addColorStop(.1,RED(0));g.addColorStop(1,RED(0));
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,0,TAU);ctx.fill();}
  ctx.strokeStyle=RED(.6);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sweep)*R,cy+Math.sin(sweep)*R);ctx.stroke();
  const r=rng(7);
  for(let i=0;i<7;i++){
    const ba=r()*TAU, br=R*(.25+r()*.7);
    const diff=((sweep-ba)%TAU+TAU)%TAU, glow=Math.max(0,1-diff/1.2);
    if(glow>0){
      const x=cx+Math.cos(ba)*br, y=cy+Math.sin(ba)*br;
      ctx.fillStyle=RED(.85*glow);ctx.beginPath();ctx.arc(x,y,2.4,0,TAU);ctx.fill();
      ctx.strokeStyle=RED(.35*glow);ctx.beginPath();ctx.arc(x,y,7+6*(1-glow),0,TAU);ctx.stroke();
    }
  }
  ctx.strokeStyle=INK(.5);ctx.lineWidth=1.4;
  ctx.beginPath();ctx.arc(cx,cy,R*1.12,-.5+m.x*.2,.5+m.x*.2);ctx.stroke();ctx.lineWidth=1;
},

/* ---- it-solutions: live network topology ---- */
network(ctx,w,h,t,m){
  const r=rng(42), N=14, nodes=[];
  for(let i=0;i<N;i++)nodes.push({x:w*.1+r()*w*.8, y:h*.14+r()*h*.72});
  const edges=[];
  for(let i=0;i<N;i++){
    let best=-1,bd=1e9,b2=-1,d2=1e9;
    for(let j=0;j<N;j++){if(i===j)continue;
      const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=dx*dx+dy*dy;
      if(d<bd){b2=best;d2=bd;bd=d;best=j;}else if(d<d2){d2=d;b2=j;}}
    if(best>i)edges.push([i,best]); if(b2>i)edges.push([i,b2]);
  }
  ctx.strokeStyle=INK(.14);
  for(const [a,b] of edges){ctx.beginPath();ctx.moveTo(nodes[a].x,nodes[a].y);ctx.lineTo(nodes[b].x,nodes[b].y);ctx.stroke();}
  nodes.forEach((n,i)=>{
    const pulse=.5+.5*Math.sin(t*2+i);
    ctx.fillStyle=INK(.35+.2*pulse);
    ctx.fillRect(n.x-2,n.y-2,4,4);
    ctx.strokeStyle=INK(.18);ctx.strokeRect(n.x-5,n.y-5,10,10);
  });
  for(let k=0;k<6;k++){
    const e=edges[(k*3)%edges.length], u=((t*.25)+(k*.17))%1;
    const a=nodes[e[0]],b=nodes[e[1]];
    const x=a.x+(b.x-a.x)*u, y=a.y+(b.y-a.y)*u;
    ctx.fillStyle=RED(.9);ctx.beginPath();ctx.arc(x,y,2.2,0,TAU);ctx.fill();
    ctx.fillStyle=RED(.2);ctx.beginPath();ctx.arc(x,y,5.5,0,TAU);ctx.fill();
  }
},

/* ---- industrial: meshing gears + signal ---- */
gears(ctx,w,h,t,m){
  function gear(cx,cy,R,teeth,ang,alpha){
    ctx.strokeStyle=INK(alpha);ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,R*.55,0,TAU);ctx.stroke();
    for(let i=0;i<teeth;i++){
      const a=ang+i*TAU/teeth;
      const x1=cx+Math.cos(a)*R, y1=cy+Math.sin(a)*R;
      const x2=cx+Math.cos(a)*(R+9), y2=cy+Math.sin(a)*(R+9);
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    }
    ctx.fillStyle=RED(.8);ctx.beginPath();ctx.arc(cx,cy,3,0,TAU);ctx.fill();
    ctx.lineWidth=1;
  }
  const spin=t*.5+m.x*.3;
  gear(w*.42,h*.4,Math.min(w,h)*.2,12,spin,.4);
  gear(w*.42+Math.min(w,h)*.2*1.75,h*.4+Math.min(w,h)*.1,Math.min(w,h)*.13,9,-spin*12/9+.25,.3);
  const by=h*.8;
  ctx.strokeStyle=RED(.5);ctx.beginPath();
  for(let x=0;x<w;x+=3){
    const y=by+Math.sin(x*.045-t*3)*7*Math.sin(x/w*Math.PI);
    x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.strokeStyle=INK(.15);ctx.beginPath();ctx.moveTo(0,by);ctx.lineTo(w,by);ctx.stroke();
},

/* ---- defense: targeting reticle ---- */
reticle(ctx,w,h,t,m){
  const cx=w*.5+m.x*14, cy=h*.5+m.y*10, R=Math.min(w,h)*.34;
  ctx.lineWidth=1;
  ctx.strokeStyle=INK(.3);ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
  ctx.setLineDash([10,7]);ctx.strokeStyle=INK(.2);
  ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.4);
  ctx.beginPath();ctx.arc(0,0,R*.78,0,TAU);ctx.stroke();ctx.restore();
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-t*.25);
  ctx.setLineDash([3,9]);ctx.strokeStyle=RED(.4);
  ctx.beginPath();ctx.arc(0,0,R*1.16,0,TAU);ctx.stroke();ctx.restore();
  ctx.setLineDash([]);
  for(let d=0;d<360;d+=10){const a=d*Math.PI/180;
    ctx.strokeStyle=INK(d%90===0?.4:.15);
    ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*R*.92,cy+Math.sin(a)*R*.92);ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);ctx.stroke();}
  ctx.strokeStyle=RED(.75);
  ctx.beginPath();ctx.moveTo(cx-R*.5,cy);ctx.lineTo(cx-R*.12,cy);ctx.moveTo(cx+R*.12,cy);ctx.lineTo(cx+R*.5,cy);
  ctx.moveTo(cx,cy-R*.5);ctx.lineTo(cx,cy-R*.12);ctx.moveTo(cx,cy+R*.12);ctx.lineTo(cx,cy+R*.5);ctx.stroke();
  ctx.fillStyle=RED(.9);ctx.beginPath();ctx.arc(cx,cy,2,0,TAU);ctx.fill();
  const bs=R*.62, pl=6+3*Math.sin(t*2.4);
  ctx.strokeStyle=INK(.55);ctx.lineWidth=1.6;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy])=>{
    ctx.beginPath();
    ctx.moveTo(cx+sx*bs, cy+sy*(bs-pl-14)); ctx.lineTo(cx+sx*bs, cy+sy*bs); ctx.lineTo(cx+sx*(bs-pl-14), cy+sy*bs);
    ctx.stroke();
  });
  ctx.lineWidth=1;
},

/* ---- aerospace: streamlines over airfoil ---- */
airflow(ctx,w,h,t,m){
  const cy=h*.52, chord=Math.min(w,h)*.62, x0=w*.5-chord/2;
  ctx.strokeStyle=INK(.5);ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(x0,cy);
  ctx.bezierCurveTo(x0+chord*.18,cy-chord*.12, x0+chord*.6,cy-chord*.1, x0+chord,cy);
  ctx.bezierCurveTo(x0+chord*.6,cy+chord*.035, x0+chord*.2,cy+chord*.045, x0,cy);
  ctx.stroke();ctx.lineWidth=1;
  for(let i=-3;i<=3;i++){
    if(i===0)continue;
    const off=i*h*.09, bend=(i<0? -1:1)*Math.max(0,(4-Math.abs(i)))*h*.035;
    ctx.strokeStyle=INK(.14);
    ctx.beginPath();
    for(let x=0;x<=w;x+=6){
      const p=(x-x0)/chord;
      const dy=(p>0&&p<1)? -Math.sin(Math.PI*Math.min(1,Math.max(0,p)))*bend : 0;
      const y=cy+off+dy;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.stroke();
    for(let k=0;k<3;k++){
      const u=((t*.16)+(k/3)+(i*.11))%1, x=u*w;
      const p=(x-x0)/chord;
      const dy=(p>0&&p<1)? -Math.sin(Math.PI*Math.min(1,Math.max(0,p)))*bend : 0;
      ctx.fillStyle=RED(.7);
      ctx.beginPath();ctx.arc(x,cy+off+dy,1.8,0,TAU);ctx.fill();
    }
  }
  ctx.strokeStyle=RED(.5);
  ctx.beginPath();ctx.moveTo(x0,cy+h*.3);ctx.lineTo(x0+chord,cy+h*.3);ctx.stroke();
  for(let k=0;k<=10;k++){
    const x=x0+chord*k/10;
    ctx.beginPath();ctx.moveTo(x,cy+h*.3-(k%5===0?7:4));ctx.lineTo(x,cy+h*.3);ctx.stroke();
  }
},

/* ---- space: orbital tracks ---- */
orbits(ctx,w,h,t,m){
  const cx=w*.5, cy=h*.52, R=Math.min(w,h)*.13;
  const r=rng(9);
  for(let i=0;i<26;i++){ctx.fillStyle=INK(.1+r()*.25);ctx.fillRect(r()*w,r()*h,1.6,1.6);}
  const g=ctx.createRadialGradient(cx-R*.4,cy-R*.4,R*.1,cx,cy,R);
  g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,INK(.12));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
  ctx.strokeStyle=INK(.4);ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
  const orbs=[[2.1,.55,.5,.35],[2.9,.32,-.35,.55],[3.7,.18,.15,.8]];
  orbs.forEach(([k,ecc,tilt,speed],idx)=>{
    const a=R*k, b=a*(1-ecc*.5);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt+m.x*.06);
    ctx.strokeStyle=INK(.16);ctx.beginPath();ctx.ellipse(0,0,a,b,0,0,TAU);ctx.stroke();
    const u=t*speed+idx*2;
    const sx=Math.cos(u)*a, sy=Math.sin(u)*b;
    ctx.fillStyle=RED(.9);ctx.beginPath();ctx.arc(sx,sy,2.6,0,TAU);ctx.fill();
    ctx.strokeStyle=RED(.25);
    ctx.beginPath();ctx.ellipse(0,0,a,b,0,u-.6,u);ctx.stroke();
    ctx.restore();
  });
},

/* ---- commercial: logistics routes ---- */
routes(ctx,w,h,t,m){
  const g=48;
  ctx.strokeStyle=INK(.07);ctx.beginPath();
  for(let x=g/2;x<w;x+=g){ctx.moveTo(x,0);ctx.lineTo(x,h);}
  for(let y=g/2;y<h;y+=g){ctx.moveTo(0,y);ctx.lineTo(w,y);}
  ctx.stroke();
  const P=(gx,gy)=>[g/2+gx*g, g/2+gy*g];
  const GW=Math.floor((w-g)/g), GH=Math.floor((h-g)/g);
  const r=rng(21);
  const paths=[];
  for(let k=0;k<4;k++){
    const pts=[]; let x=Math.floor(r()*GW*.3), y=Math.floor(r()*GH);
    pts.push(P(x,y));
    for(let s=0;s<5;s++){
      if(r()>.5){x=Math.min(GW,x+1+Math.floor(r()*Math.max(1,GW*.25)));}
      else{y=Math.max(0,Math.min(GH,y+(r()>.5?1:-1)*(1+Math.floor(r()*2))));}
      pts.push(P(x,y));
    }
    paths.push(pts);
  }
  paths.forEach((pts,k)=>{
    ctx.strokeStyle=INK(.22);ctx.beginPath();
    pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
    ctx.stroke();
    const a=pts[0], z=pts[pts.length-1];
    ctx.fillStyle=INK(.5);ctx.fillRect(a[0]-3,a[1]-3,6,6);
    ctx.strokeStyle=RED(.7);ctx.strokeRect(z[0]-4,z[1]-4,8,8);
    let total=0; const segs=[];
    for(let i=1;i<pts.length;i++){const dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];const L=Math.hypot(dx,dy);segs.push(L);total+=L;}
    let d=((t*40)+(k*total/4))%total;
    let i=0; while(d>segs[i]){d-=segs[i];i++;}
    const p0=pts[i],p1=pts[i+1],u=d/segs[i];
    const x=p0[0]+(p1[0]-p0[0])*u, y=p0[1]+(p1[1]-p0[1])*u;
    ctx.fillStyle=RED(.95);ctx.beginPath();ctx.arc(x,y,3,0,TAU);ctx.fill();
  });
},

/* ---- fluid-control: pressure gauge with relief pop ---- */
gauge(ctx,w,h,t,m){
  const cx=w*.5, cy=h*.55, R=Math.min(w,h)*.36;
  const a0=Math.PI*.75, a1=Math.PI*2.25;
  ctx.strokeStyle=INK(.35);ctx.lineWidth=1.6;
  ctx.beginPath();ctx.arc(cx,cy,R,a0,a1);ctx.stroke();ctx.lineWidth=1;
  ctx.strokeStyle=RED(.55);ctx.lineWidth=5;
  ctx.beginPath();ctx.arc(cx,cy,R,a0+(a1-a0)*.82,a1);ctx.stroke();ctx.lineWidth=1;
  for(let k=0;k<=20;k++){
    const a=a0+(a1-a0)*k/20;
    ctx.strokeStyle=INK(k%5===0?.5:.2);
    const len=k%5===0?12:6;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*(R-len),cy+Math.sin(a)*(R-len));
    ctx.lineTo(cx+Math.cos(a)*(R-2),cy+Math.sin(a)*(R-2));
    ctx.stroke();
  }
  const cyc=(t*.35)%1;
  let p = cyc<.75 ? cyc/.75*.95 : .95*(1-(cyc-.75)/.25);
  p += .02*Math.sin(t*7);
  const na=a0+(a1-a0)*Math.max(0,Math.min(1,p));
  if(p>.82){
    const burst=(t*3)%1;
    ctx.strokeStyle=RED(.5*(1-burst));
    ctx.beginPath();ctx.arc(cx,cy,R*(1.05+burst*.25),a0+(a1-a0)*.82,a1);ctx.stroke();
  }
  ctx.strokeStyle=RED(.9);ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-Math.cos(na)*R*.15,cy-Math.sin(na)*R*.15);
  ctx.lineTo(cx+Math.cos(na)*R*.8,cy+Math.sin(na)*R*.8);ctx.stroke();ctx.lineWidth=1;
  ctx.fillStyle=INK(.8);ctx.beginPath();ctx.arc(cx,cy,5,0,TAU);ctx.fill();
  ctx.strokeStyle=INK(.3);ctx.beginPath();ctx.arc(cx,cy,9,0,TAU);ctx.stroke();
},

/* ---- capabilities: interlocking octagon ---- */
octagon(ctx,w,h,t,m){
  const cx=w*.5, cy=h*.52, R=Math.min(w,h)*.34;
  const nodes=[];
  for(let i=0;i<8;i++){const a=-Math.PI/2+i*TAU/8+m.x*.05;nodes.push([cx+Math.cos(a)*R,cy+Math.sin(a)*R]);}
  ctx.strokeStyle=INK(.13);
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){
    ctx.beginPath();ctx.moveTo(nodes[i][0],nodes[i][1]);ctx.lineTo(nodes[j][0],nodes[j][1]);ctx.stroke();}
  ctx.strokeStyle=INK(.3);
  ctx.beginPath();nodes.forEach((n,i)=>i?ctx.lineTo(n[0],n[1]):ctx.moveTo(n[0],n[1]));ctx.closePath();ctx.stroke();
  const u=(t*.5)%8, seg=Math.floor(u), fr=u-seg;
  const A=nodes[seg%8], B=nodes[(seg+1)%8];
  const px=A[0]+(B[0]-A[0])*fr, py=A[1]+(B[1]-A[1])*fr;
  ctx.fillStyle=RED(.95);ctx.beginPath();ctx.arc(px,py,3,0,TAU);ctx.fill();
  ctx.fillStyle=RED(.2);ctx.beginPath();ctx.arc(px,py,8,0,TAU);ctx.fill();
  nodes.forEach((n,i)=>{
    const pulse=.5+.5*Math.sin(t*2-i*.8);
    ctx.fillStyle=INK(.4+.3*pulse);
    ctx.save();ctx.translate(n[0],n[1]);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore();
  });
  ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.6);
  ctx.strokeStyle=RED(.7);ctx.lineWidth=1.5;
  ctx.strokeRect(-8,-8,16,16);ctx.restore();ctx.lineWidth=1;
},

/* ---- about: growth rings ---- */
ringsGrow(ctx,w,h,t,m){
  const cx=w*.5, cy=h*.52, R=Math.min(w,h)*.42;
  for(let k=0;k<4;k++){
    const u=((t*.12)+(k/4))%1;
    ctx.strokeStyle=INK(.28*(1-u));
    ctx.beginPath();ctx.arc(cx,cy,R*u,0,TAU);ctx.stroke();
  }
  const marks=[[.3,-.6],[.5,.9],[.68,2.4],[.84,4.1],[1,5.4]];
  marks.forEach(([k,a],i)=>{
    ctx.strokeStyle=INK(.2);ctx.setLineDash([2,6]);
    ctx.beginPath();ctx.arc(cx,cy,R*k*.9,0,TAU);ctx.stroke();ctx.setLineDash([]);
    const x=cx+Math.cos(a)*R*k*.9, y=cy+Math.sin(a)*R*k*.9;
    const on=(Math.sin(t*1.6-i)+1)/2;
    ctx.fillStyle=RED(.5+.5*on);
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-3.4,-3.4,6.8,6.8);ctx.restore();
  });
  ctx.fillStyle=RED(.9);ctx.beginPath();ctx.arc(cx,cy,3,0,TAU);ctx.fill();
  ctx.strokeStyle=RED(.3);ctx.beginPath();ctx.arc(cx,cy,8+3*Math.sin(t*2),0,TAU);ctx.stroke();
},

/* ---- quality: verification gates ---- */
gates(ctx,w,h,t,m){
  const y=h*.5, x0=w*.12, x1=w*.88, N=5;
  ctx.strokeStyle=INK(.2);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  const u=(t*.3)%1.2;
  const px=x0+(x1-x0)*Math.min(1,u);
  for(let i=0;i<N;i++){
    const gx=x0+(x1-x0)*(i+.5)/N;
    const passed=px>gx;
    ctx.save();ctx.translate(gx,y);ctx.rotate(Math.PI/4);
    ctx.strokeStyle=passed?RED(.8):INK(.35);
    ctx.lineWidth=passed?1.8:1.2;
    ctx.strokeRect(-9,-9,18,18);ctx.restore();ctx.lineWidth=1;
    if(passed){
      ctx.strokeStyle=RED(.9);ctx.lineWidth=1.8;
      ctx.beginPath();ctx.moveTo(gx-4,y+.5);ctx.lineTo(gx-1,y+4);ctx.lineTo(gx+5,y-4);ctx.stroke();ctx.lineWidth=1;
    }
    ctx.fillStyle=INK(.45);
    ctx.font='600 9px "IBM Plex Mono", monospace';ctx.textAlign='center';
    ctx.fillText('G'+(i+1), gx, y+30);
  }
  if(u<=1){
    ctx.fillStyle=RED(.95);ctx.beginPath();ctx.arc(px,y,3.4,0,TAU);ctx.fill();
    ctx.fillStyle=RED(.2);ctx.beginPath();ctx.arc(px,y,8,0,TAU);ctx.fill();
  }
  ctx.textAlign='left';
},

/* ---- contracting: audit scan ---- */
audit(ctx,w,h,t,m){
  const r=rng(5), cols=4, rows=8;
  const x0=w*.14, y0=h*.16, cw=(w*.72)/cols, rh=(h*.68)/rows;
  const scan=(t*.25)%1.3, sy=y0+(h*.68)*Math.min(1,scan);
  for(let c=0;c<cols;c++)for(let ro=0;ro<rows;ro++){
    const x=x0+c*cw, y=y0+ro*rh, bw=cw*(.3+r()*.5);
    const done=y<sy;
    ctx.strokeStyle=done?INK(.35):INK(.15);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+bw,y);ctx.stroke();
    if(done&&(c+ro)%3===0){
      ctx.strokeStyle=RED(.75);ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(x+bw+6,y-2);ctx.lineTo(x+bw+9,y+2);ctx.lineTo(x+bw+14,y-4);ctx.stroke();ctx.lineWidth=1;
    }
  }
  if(scan<=1){
    ctx.strokeStyle=RED(.6);
    ctx.beginPath();ctx.moveTo(w*.08,sy);ctx.lineTo(w*.92,sy);ctx.stroke();
    ctx.fillStyle=RED(.9);
    ctx.save();ctx.translate(w*.08,sy);ctx.rotate(Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore();
    const g=ctx.createLinearGradient(0,sy-26,0,sy);
    g.addColorStop(0,RED(0));g.addColorStop(1,RED(.08));
    ctx.fillStyle=g;ctx.fillRect(w*.08,sy-26,w*.84,26);
  }
},

/* ---- contact: transmission beacon ---- */
beacon(ctx,w,h,t,m){
  const cx=w*.72, cy=h*.5;
  for(let k=0;k<4;k++){
    const u=((t*.35)+(k/4))%1;
    ctx.strokeStyle=RED(.4*(1-u));
    ctx.beginPath();ctx.arc(cx,cy,6+u*Math.min(w,h)*.42,-.9,.9,false);ctx.stroke();
    ctx.beginPath();ctx.arc(cx,cy,6+u*Math.min(w,h)*.42,Math.PI-.9,Math.PI+.9,false);ctx.stroke();
  }
  ctx.fillStyle=RED(.95);
  ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore();
  ctx.strokeStyle=INK(.35);
  ctx.beginPath();ctx.moveTo(cx,cy+9);ctx.lineTo(cx,cy+34);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-16,cy+34);ctx.lineTo(cx+16,cy+34);ctx.stroke();
  const r=rng(3), y=cy;
  let x=cx-40;
  ctx.strokeStyle=INK(.5);ctx.lineWidth=2;
  const phase=Math.floor(t*8)%20;
  for(let i=0;i<14&&x>w*.06;i++){
    const dash=r()>.4, L=dash?14:4;
    if((i+phase)%20<14){
      ctx.beginPath();ctx.moveTo(x-L,y);ctx.lineTo(x,y);ctx.stroke();
    }
    x-=L+9;
  }
  ctx.lineWidth=1;
},

/* ---- products: pipe flow with valve ---- */
flow(ctx,w,h,t,m){
  const y=h*.5, gap=16, x0=w*.06, x1=w*.94, vx=w*.52;
  ctx.strokeStyle=INK(.35);ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(x0,y-gap);ctx.lineTo(x1,y-gap);ctx.moveTo(x0,y+gap);ctx.lineTo(x1,y+gap);ctx.stroke();ctx.lineWidth=1;
  const open=(Math.sin(t*.9)+1)/2;
  const gateH=(1-open)*gap*1.7;
  ctx.strokeStyle=RED(.8);ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(vx,y-gap);ctx.lineTo(vx,y-gap+gateH);ctx.stroke();ctx.lineWidth=1;
  ctx.strokeStyle=INK(.5);
  ctx.strokeRect(vx-10,y-gap-22,20,14);
  ctx.beginPath();ctx.moveTo(vx,y-gap-8);ctx.lineTo(vx,y-gap);ctx.stroke();
  const N=16, r=rng(11);
  for(let i=0;i<N;i++){
    const speed=.14*(0.4+open*.6);
    let u=((t*speed)+(i/N))%1;
    let x=x0+(x1-x0)*u;
    if(open<.45 && x>vx-8 && x<vx+8) continue;
    const jitter=(r()-.5)*gap*1.1;
    ctx.fillStyle=x<vx?RED(.75):RED(.5+open*.3);
    ctx.beginPath();ctx.arc(x,y+jitter*.6,2,0,TAU);ctx.fill();
  }
  ctx.font='600 9px "IBM Plex Mono", monospace';
  ctx.fillStyle=INK(.45);
  ctx.fillText(open>.5?'FLOW: OPEN':'FLOW: THROTTLED', x0, y-gap-14);
},
};

/* ---------- engine ---------- */
function boot(){
  document.querySelectorAll('canvas.ph-viz').forEach(cv=>{
    const scene=SCENES[cv.dataset.viz];
    if(!scene)return;
    const ctx=cv.getContext('2d');
    const dpr=Math.min(window.devicePixelRatio||1,2);
    let W=0,H=0;
    const mouse={x:0,y:0};
    function size(){
      W=cv.clientWidth;H=cv.clientHeight;
      if(!W||!H)return;
      cv.width=W*dpr;cv.height=H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    size();addEventListener('resize',size);
    if(matchMedia('(pointer: fine)').matches){
      addEventListener('mousemove',e=>{
        mouse.x=(e.clientX/innerWidth-.5)*2;
        mouse.y=(e.clientY/innerHeight-.5)*2;
      },{passive:true});
    }
    let raf;
    function frame(now){
      if(W&&H){ctx.clearRect(0,0,W,H);scene(ctx,W,H,now*.001,mouse);}
      if(!reduce)raf=requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
})();
