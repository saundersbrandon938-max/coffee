/* ===================== Animation controller + player ===================== */
(function(){
const WC=window.WC,H=window.H,SCENES=window.BMC_SCENES,FX=window.BMC_FX;
const DURATION=20;window.DURATION=DURATION;
const overlay=document.getElementById('bmc-story');
const canvas=document.getElementById('bmc-canvas');
const splash=document.getElementById('bmc-splash'),splashbar=document.getElementById('bmc-splashbar'),splashmsg=document.getElementById('bmc-splashmsg');
const controls=document.getElementById('bmc-controls');
const btnPlay=document.getElementById('bmc-play'),playIcon=document.getElementById('bmc-playicon');
const scrub=document.getElementById('bmc-scrub'),timeEl=document.getElementById('bmc-time');
const btnSound=document.getElementById('bmc-sound'),soundIcon=document.getElementById('bmc-soundicon');
const btnSkip=document.getElementById('bmc-skip');
const launcher=document.getElementById('bmc-launch');
const replayDemo=document.getElementById('bmc-replay-demo');
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let W=1280,Hh=720,ctx=canvas.getContext('2d',{willReadFrequently:false});
let temp,tctx,plates=[],paper,built=false,portrait=false;
let currentT=0,playing=false,rafA=0,lastTS=0,ended=false;
let soundOn=false,stopSound=null;

function isPortrait(){return window.innerHeight>window.innerWidth*1.05;}
function fmt(s){s=Math.max(0,s|0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}

function sizeCanvas(){
  portrait=isPortrait();
  W=portrait?800:1280;Hh=portrait?1000:720;
  canvas.width=W;canvas.height=Hh;
  // fit into stage with letterbox (CSS handles max-width/height)
}

function buildPlates(cb){
  built=false;plates=[];
  WC.wcTextCacheClear&&WC.wcTextCacheClear();
  paper=WC.makePaper(W,Hh,99);
  let i=0;
  function step(){
    const sc=SCENES[i];
    const plate=WC.layer(W,Hh);const pctx=plate.getContext('2d',{willReadFrequently:true});
    pctx.drawImage(paper,0,0);
    const pt=WC.makePainter(pctx,W,Hh);
    const fx={};
    try{sc.fn(pt,W,Hh,portrait,fx);}catch(e){console.error('plate '+sc.id,e);}
    WC.granulate(pctx,W,Hh,paper._HM,99);
    sc._plate=plate;sc._fx=fx;plates.push(plate);
    i++;const p=Math.round(i/SCENES.length*100);
    splashbar.style.width=p+'%';
    splashmsg.textContent=['Mixing the pigments…','Wetting the paper…','Laying the first washes…','Letting the blooms creep…','Loading the brush…','Pulling the espresso…','Pouring the milk…','Lettering the title…','Almost dry…'][i-1]||'Almost dry…';
    if(i<SCENES.length)requestAnimationFrame(step);
    else{temp=WC.layer(W,Hh);tctx=temp.getContext('2d');built=true;cb&&cb();}
  }
  requestAnimationFrame(step);
}

function activeIndex(t){let idx=0;for(let i=0;i<SCENES.length;i++){if(t>=SCENES[i].in[0])idx=i;}return idx;}

function drawReveal(plate,prog,cxr,cyr){
  if(prog>=1){ctx.drawImage(plate,0,0);return;}
  if(prog<=0)return;
  tctx.clearRect(0,0,W,Hh);tctx.globalCompositeOperation='source-over';tctx.drawImage(plate,0,0);
  tctx.globalCompositeOperation='destination-in';
  const r=Math.hypot(W,Hh)*0.62*H.ease.out(prog);
  const g=tctx.createRadialGradient(cxr,cyr,r*0.45,cxr,cyr,r+1);
  g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
  tctx.fillStyle=g;tctx.fillRect(0,0,W,Hh);
  tctx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=Math.min(1,prog*1.7);ctx.drawImage(temp,0,0);ctx.restore();
}

function renderFrame(t){
  if(!built)return;
  ctx.clearRect(0,0,W,Hh);
  ctx.fillStyle='#f7f3ec';ctx.fillRect(0,0,W,Hh);
  const idx=activeIndex(t),sc=SCENES[idx],prev=SCENES[idx-1];
  const rp=H.smooth(sc.in[0],sc.in[1],t);
  // background: previous scene still visible while current floods in
  if(rp<1&&prev)ctx.drawImage(prev._plate,0,0);
  // camera for current scene
  const local=H.clamp((t-sc.in[0])/(sc.end-sc.in[0]));
  const cam=sc.cam||{z0:1,z1:1.03,px:0,py:0};
  const z=H.lerp(cam.z0,cam.z1,local),px=H.lerp(0,cam.px||0,local),py=H.lerp(0,cam.py||0,local);
  ctx.save();
  ctx.translate(W/2+px,Hh/2+py);ctx.scale(z,z);ctx.translate(-W/2,-Hh/2);
  const rc=sc.revealC||[0.5,0.5];
  // warm pivot: a warm glaze under the reveal
  if(sc.warm&&rp<1){ctx.save();ctx.globalAlpha=(1-rp)*0.5+0.2;const g=ctx.createRadialGradient(W*rc[0],Hh*rc[1],10,W*rc[0],Hh*rc[1],Math.hypot(W,Hh)*0.6*H.ease.out(rp));g.addColorStop(0,'rgba(246,196,96,0.5)');g.addColorStop(1,'rgba(246,196,96,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,Hh);ctx.restore();}
  drawReveal(sc._plate,rp,W*rc[0],Hh*rc[1]);
  // live fx for the current scene
  const fx=sc._fx;
  if(fx.rain)FX.rain(ctx,fx.rain,t);
  if(fx.pour)FX.pour(ctx,fx.pour,t,local);
  if(fx.steam)fx.steam.forEach(em=>FX.steam(ctx,em,t));
  if(fx.rosetta)FX.rosetta(ctx,fx.rosetta,t);
  if(fx.bright)FX.bright(ctx,W,Hh,fx.bright,t);
  if(fx.letters)FX.letters(ctx,fx.letters,t);
  if(fx.underline)FX.underline(ctx,fx.underline,t);
  ctx.restore();
}
window.seek=function(t){currentT=H.clamp(t,0,DURATION);renderFrame(currentT);syncUI();};
window.scoreSound=scoreSound;

function syncUI(){scrub.value=String(Math.round(currentT/DURATION*1000));timeEl.textContent=fmt(currentT)+' / '+fmt(DURATION);playIcon.innerHTML=playing?'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>':'<path d="M7 4v16l13-8z"/>';}

function loop(ts){
  if(!playing)return;
  if(!lastTS)lastTS=ts;const dt=(ts-lastTS)/1000;lastTS=ts;
  currentT+=dt;
  if(currentT>=DURATION){currentT=DURATION;renderFrame(currentT);syncUI();finish();return;}
  renderFrame(currentT);syncUI();
  rafA=requestAnimationFrame(loop);
}
function startSound(){if(stopSound){stopSound();stopSound=null;}if(soundOn)stopSound=window.SOUND.live(scoreSound,currentT,{voiceover:false});}
function stopSnd(){if(stopSound){stopSound();stopSound=null;}}
function play(){if(playing)return;if(currentT>=DURATION){currentT=0;ended=false;}playing=true;lastTS=0;startSound();rafA=requestAnimationFrame(loop);syncUI();showUI();}
function pause(){playing=false;cancelAnimationFrame(rafA);stopSnd();syncUI();stopIdle();}
function finish(){playing=false;cancelAnimationFrame(rafA);stopSnd();ended=true;syncUI();dissolveToSite();}

function showLauncher(){if(launcher)launcher.style.display='inline-flex';}
function hideLauncher(){if(launcher)launcher.style.display='none';}
function dissolveToSite(){overlay.classList.add('bmc-hidden');setTimeout(()=>{overlay.style.display='none';},950);showLauncher();}
function openOverlay(){overlay.style.display='';overlay.classList.remove('bmc-hidden');hideLauncher();}
function launch(){openOverlay();if(!built){sizeCanvas();splash.style.display='';controls.hidden=true;splashbar.style.width='0%';buildPlates(()=>{splash.style.display='none';controls.hidden=false;currentT=0;ended=false;play();});}else{currentT=0;ended=false;play();}}
let idleT=0;
function showUI(){overlay.classList.remove('bmc-idle');clearTimeout(idleT);if(playing)idleT=setTimeout(()=>{if(playing)overlay.classList.add('bmc-idle');},2600);}
function stopIdle(){overlay.classList.remove('bmc-idle');clearTimeout(idleT);}
overlay.addEventListener('mousemove',showUI);overlay.addEventListener('touchstart',showUI,{passive:true});
document.addEventListener('keydown',e=>{if(overlay.style.display==='none')return;if(e.key==='Escape'){pause();finish();}else if(e.key===' '||e.key==='k'){e.preventDefault();playing?pause():play();}});

btnPlay.addEventListener('click',()=>{playing?pause():play();});
btnSkip.addEventListener('click',()=>{pause();finish();});
scrub.addEventListener('input',()=>{const t=Number(scrub.value)/1000*DURATION;const wasPlaying=playing;pause();currentT=t;renderFrame(currentT);syncUI();if(wasPlaying){/* keep paused on scrub; user presses play */}});
btnSound.addEventListener('click',()=>{soundOn=!soundOn;btnSound.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');soundIcon.innerHTML=soundOn?'<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>':'<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".25"/>';if(playing){stopSnd();startSound();}});
launcher&&launcher.addEventListener('click',launch);
replayDemo&&replayDemo.addEventListener('click',launch);

// resize → rebuild plates for the new orientation (debounced)
let rzT=0;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{const wasP=portrait;if(isPortrait()!==wasP){const keepT=currentT;pause();sizeCanvas();splash.style.display='';splashbar.style.width='0%';buildPlates(()=>{splash.style.display='none';currentT=Math.min(keepT,DURATION);renderFrame(currentT);syncUI();});}},350);});

/* ---------- sound score ---------- */
function scoreSound(k){
  const D=20;
  const brush=(a,b,g=1,pan=0)=>{k.noise(a,{dur:0.05,color:'pink',filter:'lowpass',f:700,gain:0.16*g,a:0.008,pan,minor:true});k.play('stroke',a,{material:'brush',dur:Math.max(0.12,b-a),gain:1.4*g,pan,minor:true});};
  const letter=(s,a,b,g=0.8,pan=0)=>{const re=/\S+/g;let m;while((m=re.exec(s)))brush(a+(b-a)*m.index/s.length,a+(b-a)*(m.index+m[0].length)/s.length,g,pan);};
  const wash=(a,b,g=1,pan=0)=>{const d=b-a;k.noise(a,{dur:d,color:'pink',filter:'bandpass',f:[[0,260],[d*0.45,820],[d,420]],q:0.7,gain:0.09*g,a:d*0.4,pan,minor:true,verb:0.1});k.noise(a+0.03,{dur:d*0.7,color:'brown',filter:'lowpass',f:380,gain:0.08*g,a:d*0.3,pan,minor:true});};
  // beds + pad
  k.bed('room',0,D,{gain:0.5});
  k.music('pad',0,D,{bpm:62,gain:0.34,chords:[['F3','A3','C4','E4'],['D3','F3','A3','C4'],['Bb2','D3','F3','A3'],['F3','C4','G4','A4'],['A3','C4','E4','G4']]});
  k.bed('rain',0,8,{gain:0.9});
  // S1
  wash(0.3,1.6,1.0,-0.2);
  letter("Some mornings just don't go your way.",1.9,3.4,0.8);
  k.play('drop',2.2,{gain:1.0,pan:0.3});k.play('thud',2.35,{f:120,gain:0.4,pan:0.3});
  // S2
  wash(4.0,5.2,0.9,-0.3);
  k.play('drop',4.8,{gain:0.5,pan:-0.2});k.play('drop',5.6,{gain:0.5,pan:0.3});
  // arrive at café
  wash(6.0,7.2,1.0,0.3);
  k.tone(6.6,{f:[[0,300],[0.8,680]],type:'triangle',dur:0.9,gain:0.08,a:0.4,pan:0.2}); // warm swell
  // S3 door chime + warm
  k.play('bell',8.0,{f:'A5',gain:0.5});k.play('ding',8.1,{f:'E5',gain:0.35});
  wash(8.0,9.2,1.0,0.2);
  k.bed('machine',8.4,16.5,{gain:0.8});
  // S4a pour
  const pourA=12.1,pourB=13.4;
  k.noise(pourA,{dur:pourB-pourA,color:'brown',filter:'bandpass',f:[[0,300],[0.3,520],[pourB-pourA,420]],q:1.2,gain:0.16,a:0.15,hold:(pourB-pourA)*0.6,pan:0});
  k.noise(pourA+0.05,{dur:pourB-pourA-0.1,color:'pink',filter:'highpass',f:5200,gain:0.03,a:0.2,pan:0});
  // S4b steam wand
  k.noise(13.4,{dur:0.7,color:'white',filter:'bandpass',f:[[0,2200],[0.3,3200],[0.7,1600]],q:0.7,gain:0.12,a:0.1,pan:0.1});
  k.play('sparkle',14.6,{gain:0.4,n:5});
  // S4c cup down + note
  k.play('tock',15.1,{f:300,gain:0.5});
  letter("You've got this.",15.4,16.2,0.85,0.1);
  k.play('ding',16.2,{f:'C5',gain:0.42});
  // S5 brighten + title + resolve
  k.play('drop',16.7,{gain:0.6});
  letter("A Little Coffee. A Brighter Day.",17.2,18.2,1.0);
  k.play('ding',18.3,{f:'F4',gain:0.45});
  ['A4','C5','F5'].forEach((f,i)=>k.tone(18.4+i*0.07,{f,dur:1.4,gain:0.08-i*0.01,verb:0.3,pan:(i-1)*0.3}));
  k.play('sparkle',18.6,{gain:0.4,n:6});
}

/* ---------- entry logic ---------- */
const SEEN_KEY='bmc_story_seen_v1';
function seenThisSession(){try{return sessionStorage.getItem(SEEN_KEY)==='1';}catch(e){return false;}}
function markSeen(){try{sessionStorage.setItem(SEEN_KEY,'1');}catch(e){}}

function bootAutoplay(){
  sizeCanvas();
  buildPlates(()=>{
    splash.style.display='none';controls.hidden=false;
    renderFrame(0);syncUI();
    markSeen();
    play(); // muted autoplay
  });
}
// Headless render / embed hook: build the plates on demand and expose window.seek,
// without the overlay's autoplay. Used by video/anim-render.html.
window.BMC_build=function(cb){sizeCanvas();if(built){cb&&cb();return;}if(splash)splash.style.display='';controls.hidden=true;splashbar.style.width='0%';buildPlates(function(){if(splash)splash.style.display='none';controls.hidden=false;cb&&cb();});};

// Entry: first visit (motion ok) autoplays once, then dissolves into the site.
// Reduced-motion or returning visitors get the site immediately with an unobtrusive
// "Our story" launcher that lazy-builds and plays on demand. The site is never blocked.
if(window.BMC_NO_AUTOPLAY){
  // render/embed mode: no autoplay; caller drives it via window.BMC_build() + window.seek()
}else if(reduce||seenThisSession()){
  overlay.style.display='none';
  showLauncher();
}else{
  bootAutoplay();
}
})();
