/* ---------- theme toggle ---------- */
const body = document.body, themeBtn = document.getElementById('themeBtn');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function setThemeUI(d){themeBtn.querySelector('.theme-btn-label').textContent=d?'Day Sky':'Night Sky';themeBtn.querySelector('.theme-btn-icon').textContent=d?'☀':'✦'}
try{body.classList.toggle('dark-mode',localStorage.getItem('theme')!=='light')}catch(e){}
setThemeUI(body.classList.contains('dark-mode'));
themeBtn.addEventListener('click',()=>{
  const d=body.classList.toggle('dark-mode'); setThemeUI(d);
  try{localStorage.setItem('theme',d?'dark':'light')}catch(e){}
  readColors(); resize(); if(reduceMotion) draw(0);
});

/* ---------- skills constellation (programming only) ---------- */
(function(){
  const NS='http://www.w3.org/2000/svg';
  // [label, x, y, radius, labelDx, labelDy, anchor]
  const N=[['Python',70,260,5,0,24,'middle'],['JavaScript',170,250,6.5,0,26,'middle'],['C++',100,140,4.5,-12,4,'end'],['C#',200,80,4.5,0,-14,'middle'],
   ['React',270,200,7,0,-16,'middle'],['Next.js',340,115,5,0,-14,'middle'],['Supabase',410,190,4.5,12,4,'start'],['Firebase',350,290,5,12,4,'start'],
   ['MySQL',400,370,4.5,0,24,'middle'],['SQL',260,340,5,0,24,'middle'],['Java',110,350,5,0,24,'middle']];
  const E=[[0,1],[1,4],[1,2],[2,3],[4,5],[5,6],[4,7],[7,8],[8,9],[1,10],[1,9],[0,10]];
  const col=['--aqua','--gold','--blue','--violet','--pink'];
  const L=document.getElementById('cLines'),S=document.getElementById('cStars'),T=document.getElementById('cLabels');
  const el=(n,a,p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
  E.forEach(([a,b],i)=>{const p=el('path',{class:'const-path',d:`M${N[a][1]},${N[a][2]} L${N[b][1]},${N[b][2]}`},L);p.style.animationDelay=(.3+i*.15)+'s'});
  N.forEach((n,i)=>{
    const c=el('circle',{class:'const-star',cx:n[1],cy:n[2],r:n[3]},S);
    c.style.color=`var(${col[i%5]})`;c.style.animationDelay=(.2+i*.15)+'s';
    el('title',{},c).textContent=n[0];
    const t=el('text',{class:'const-label',x:n[1]+n[4],y:n[2]+n[5],'text-anchor':n[6]},T);
    t.textContent=n[0];t.style.animationDelay=(1.2+i*.08)+'s';
  });
})();

/* ---------- sky: twinkling stars + drifting constellations ---------- */
const canvas=document.getElementById('sky'),ctx=canvas.getContext('2d');
let stars=[],consts=[],shooter=null,nextShot=4000,W=0,H=0,palette=[];
const rnd=(a,b)=>a+Math.random()*(b-a);
const SHAPES=[
  [[0,.3],[.2,.45],[.4,.4],[.6,.55],[.8,.9],[1,.55],[.6,.55]],            // dipper-ish
  [[0,0],[.25,.7],[.5,.3],[.75,.7],[1,0]],                                 // cassiopeia W
  [[.2,0],[.5,.2],[.8,0],[.5,.5],[.35,1],[.65,1],[.5,.5]],                 // orion-ish
  [[0,.5],[.35,.2],[.7,.35],[1,.1],[.7,.35],[.55,.85]],                    // zig
  [[.5,0],[.9,.4],[.7,1],[.3,1],[.1,.4],[.5,0]]                            // kite
];
function readColors(){
  const cs=getComputedStyle(body),v=n=>cs.getPropertyValue(n).trim(),dark=body.classList.contains('dark-mode');
  palette=dark?[v('--star'),v('--star'),v('--star'),v('--pink'),v('--aqua'),v('--violet')]:[v('--pink'),v('--violet'),v('--gold'),v('--blue')];
  canvas.dataset.max=dark?.9:.6;
}
function resize(){
  const dpr=Math.min(devicePixelRatio||1,2);
  W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=W<600?3:6;
  consts=Array.from({length:n},(_,i)=>{
    const sc=rnd(130,230),sh=SHAPES[i%SHAPES.length];
    return{pts:sh.map(([a,b])=>[a*sc,b*sc]),x:rnd(0,W-sc),y:rnd(60,H-sc),p:rnd(0,6.28),sp:rnd(.25,.5),c:i%palette.length,vx:rnd(.01,.03)}
  });
  const count=Math.min(170,Math.round(W*H/9000));
  stars=Array.from({length:count},()=>{const big=Math.random()<.08;return{x:rnd(0,W),y:rnd(0,H),r:big?rnd(1.4,2):rnd(.4,1.2),p:rnd(0,6.28),s:rnd(.4,1.4),c:Math.floor(rnd(0,palette.length)),big}});
}
function draw(t){
  ctx.clearRect(0,0,W,H);const max=+canvas.dataset.max;
  for(const s of stars){
    ctx.globalAlpha=(reduceMotion?.6:.25+.75*(.5+.5*Math.sin(t/1000*s.s+s.p)))*max;
    ctx.fillStyle=palette[s.c%palette.length];ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();
    if(s.big){ctx.fillRect(s.x-s.r*4,s.y-.4,s.r*8,.8);ctx.fillRect(s.x-.4,s.y-s.r*4,.8,s.r*8)}
  }
  /* constellations: lines breathe in/out, nodes glow */
  for(const c of consts){
    const k=reduceMotion?.7:.5+.5*Math.sin(t/1000*c.sp+c.p);
    if(!reduceMotion){c.x+=c.vx;if(c.x>W+20)c.x=-260}
    const col=palette[c.c%palette.length];
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha=(.12+.38*k)*max;
    ctx.beginPath();c.pts.forEach(([a,b],i)=>ctx[i?'lineTo':'moveTo'](c.x+a,c.y+b));ctx.stroke();
    ctx.fillStyle=col;
    c.pts.forEach(([a,b],i)=>{
      const tw=reduceMotion?1:.6+.4*Math.sin(t/700+i*1.7+c.p);
      ctx.globalAlpha=(.5+.5*k)*tw*max;ctx.beginPath();ctx.arc(c.x+a,c.y+b,2.2,0,6.283);ctx.fill();
      ctx.globalAlpha=.18*k*max;ctx.beginPath();ctx.arc(c.x+a,c.y+b,6,0,6.283);ctx.fill();
    });
  }
  if(!reduceMotion){
    if(!shooter&&t>nextShot)shooter={x:rnd(W*.3,W),y:rnd(0,H*.35),t0:t};
    if(shooter){
      const k=(t-shooter.t0)/900;
      if(k>=1){shooter=null;nextShot=t+rnd(6000,12000)}
      else{
        const x=shooter.x-k*420,y=shooter.y+k*420,g=ctx.createLinearGradient(x,y,x+110,y-110);
        g.addColorStop(0,palette[0]);g.addColorStop(1,'transparent');
        ctx.globalAlpha=(1-k)*max;ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+110,y-110);ctx.stroke();
      }
    }
  }
  ctx.globalAlpha=1;
}
readColors();resize();addEventListener('resize',resize);
if(reduceMotion)draw(0);else(function loop(t){draw(t);requestAnimationFrame(loop)})(0);

/* ---------- project filters ---------- */
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.project-card').forEach(c=>c.classList.toggle('hide',b.dataset.f!=='all'&&!c.dataset.cat.split(' ').includes(b.dataset.f)));
}));

/* ---------- scroll reveal ---------- */
const revealEls=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.05,rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>io.observe(el));
}else revealEls.forEach(el=>el.classList.add('is-visible'));
