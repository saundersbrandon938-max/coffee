/* ============ film controller: sequencer + player + sound ============ */
(function(){
const WC=window.WC,H=window.H,SCN=window.SCN;
const DURATION=20;window.DURATION=DURATION;
const SCENES=[
  {id:'bedroom',in:[0.3,1.3],end:4.0,rc:[0.4,0.5]},
  {id:'street', in:[4.0,4.9],end:8.0,rc:[0.55,0.55]},
  {id:'cafe',   in:[8.0,9.1],end:12.0,warm:true,rc:[0.55,0.45]},
  {id:'coffee', in:[12.0,12.7],end:16.5,rc:[0.5,0.45]},
  {id:'brighter',in:[16.5,17.4],end:20.0,rc:[0.4,0.5]},
];
const LETTERS={
  bedroom:[{str:"Some mornings just don't",x:0.5,y:0.14,size:40,col:'rgb(72,78,100)',t0:1.9,t1:2.9},
           {str:'go your way.',x:0.5,y:0.22,size:40,col:'rgb(72,78,100)',t0:2.6,t1:3.6}],
  brighter:[{str:'A Little Coffee.',x:0.64,y:0.3,size:52,col:'rgb(122,44,29)',t0:17.4,t1:18.0},
            {str:'A Brighter Day.',x:0.64,y:0.44,size:58,col:'rgb(169,70,45)',t0:17.7,t1:18.3}],
};

const overlay=document.getElementById('bmc-story');
const canvas=document.getElementById('bmc-canvas');
const splash=document.getElementById('bmc-splash'),splashbar=document.getElementById('bmc-splashbar'),splashmsg=document.getElementById('bmc-splashmsg');
const controls=document.getElementById('bmc-controls');
const btnPlay=document.getElementById('bmc-play'),playIcon=document.getElementById('bmc-playicon');
const scrub=document.getElementById('bmc-scrub'),timeEl=document.getElementById('bmc-time');
const btnSound=document.getElementById('bmc-sound'),soundIcon=document.getElementById('bmc-soundicon');
const btnSkip=document.getElementById('bmc-skip'),launcher=document.getElementById('bmc-launch');
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const W=1280,Hh=720;canvas.width=W;canvas.height=Hh;
const ctx=canvas.getContext('2d',{willReadFrequently:false});
let temp=WC.layer(W,Hh),tctx=temp.getContext('2d');
let built=false,currentT=0,playing=false,rafA=0,lastTS=0,soundOn=false,stopSound=null;

function fmt(s){s=Math.max(0,s|0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}

function buildPlates(cb){
  built=false;const msgs=['Wetting the paper…','Painting the bedroom…','Painting the street…','Painting the café…','Pulling the espresso…','Letting it dry…'];
  const paper=WC.makePaper(W,Hh,99);let i=0;
  function step(){
    const sc=SCENES[i];const plate=WC.layer(W,Hh),pc=plate.getContext('2d',{willReadFrequently:true});
    pc.drawImage(paper,0,0);const pt=WC.makePainter(pc,W,Hh),fx={};
    try{SCN.build[sc.id](pt,W,Hh,fx);}catch(e){console.error('build '+sc.id,e);}
    WC.granulate(pc,W,Hh,paper._HM,99);
    sc._plate=plate;sc._fx=fx;
    i++;if(splashbar)splashbar.style.width=Math.round(i/SCENES.length*100)+'%';if(splashmsg)splashmsg.textContent=msgs[i]||'Almost ready…';
    if(i<SCENES.length)setTimeout(step,0);else{built=true;cb&&cb();}
  }
  setTimeout(step,0);
}
function activeIndex(t){let idx=0;for(let i=0;i<SCENES.length;i++)if(t>=SCENES[i].in[0])idx=i;return idx;}
function drawReveal(plate,prog,cxr,cyr){
  if(prog>=1){ctx.drawImage(plate,0,0);return;}if(prog<=0)return;
  tctx.clearRect(0,0,W,Hh);tctx.globalCompositeOperation='source-over';tctx.drawImage(plate,0,0);
  tctx.globalCompositeOperation='destination-in';const r=Math.hypot(W,Hh)*0.62*H.ease.out(prog);
  const g=tctx.createRadialGradient(cxr,cyr,r*0.45,cxr,cyr,r+1);g.addColorStop(0,'#000');g.addColorStop(1,'rgba(0,0,0,0)');
  tctx.fillStyle=g;tctx.fillRect(0,0,W,Hh);tctx.globalCompositeOperation='source-over';
  ctx.save();ctx.globalAlpha=Math.min(1,prog*1.7);ctx.drawImage(temp,0,0);ctx.restore();
}
function letters(arr,t){if(!arr)return;arr.forEach(L=>{const rev=H.smooth(L.t0,L.t1,t);if(rev<=0)return;WC.wcText(ctx,L.str,W*L.x,Hh*L.y,L.size,L.col,{align:'center',reveal:rev});});}
function renderFrame(t){
  if(!built)return;
  ctx.clearRect(0,0,W,Hh);ctx.fillStyle='#f7f3ec';ctx.fillRect(0,0,W,Hh);
  const idx=activeIndex(t),sc=SCENES[idx],prev=SCENES[idx-1];
  const rp=H.smooth(sc.in[0],sc.in[1],t);
  if(rp<1&&prev)ctx.drawImage(prev._plate,0,0);
  const local=H.clamp((t-sc.in[0])/(sc.end-sc.in[0]));
  const cam=(sc._fx&&sc._fx.cam)||{z0:1,z1:1.04,px:0,py:0,cx:W/2,cy:Hh*0.45};
  const z=H.lerp(cam.z0,cam.z1,local),px=H.lerp(0,cam.px||0,local),py=H.lerp(0,cam.py||0,local);
  ctx.save();ctx.translate(cam.cx||W/2,cam.cy||Hh*0.45);ctx.scale(z,z);ctx.translate(-(cam.cx||W/2)+px,-(cam.cy||Hh*0.45)+py);
  const rc=sc.rc||[0.5,0.5];
  if(sc.warm&&rp<1){ctx.save();ctx.globalAlpha=(1-rp)*0.5+0.2;const g=ctx.createRadialGradient(W*rc[0],Hh*rc[1],10,W*rc[0],Hh*rc[1],Math.hypot(W,Hh)*0.6*H.ease.out(rp));g.addColorStop(0,'rgba(246,196,96,0.5)');g.addColorStop(1,'rgba(246,196,96,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,Hh);ctx.restore();}
  drawReveal(sc._plate,rp,W*rc[0],Hh*rc[1]);
  const tl=Math.max(0,t-sc.in[0]+0.0);
  const liveFn=sc.id==='brighter'?SCN.liveBrighter:SCN.live[sc.id];
  if(liveFn)liveFn(ctx,sc._fx,sc.id==='coffee'?tl:(sc.id==='brighter'?tl:tl),W,Hh);
  // scene-anchored note (coffee)
  if(sc.id==='coffee'&&sc._fx.note){const rev=H.smooth(15.2,16.2,t);if(rev>0){ctx.save();ctx.translate(sc._fx.note.x,sc._fx.note.y);ctx.rotate(-0.04);WC.wcText(ctx,"You've got this.",0,0,38,'rgb(169,70,45)',{align:'center',reveal:rev});ctx.restore();}}
  ctx.restore();
  // screen-space lettering
  letters(LETTERS[sc.id],t);
}
window.seek=function(t){currentT=H.clamp(t,0,DURATION);renderFrame(currentT);syncUI();};
window.scoreSound=scoreSound;
function syncUI(){if(scrub)scrub.value=String(Math.round(currentT/DURATION*1000));if(timeEl)timeEl.textContent=fmt(currentT)+' / '+fmt(DURATION);if(playIcon)playIcon.innerHTML=playing?'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>':'<path d="M7 4v16l13-8z"/>';}
function loop(ts){if(!playing)return;if(!lastTS)lastTS=ts;const dt=(ts-lastTS)/1000;lastTS=ts;currentT+=dt;if(currentT>=DURATION){currentT=DURATION;renderFrame(currentT);syncUI();finish();return;}renderFrame(currentT);syncUI();rafA=requestAnimationFrame(loop);}
function startSound(){if(stopSound){stopSound();stopSound=null;}if(soundOn)stopSound=window.SOUND.live(scoreSound,currentT,{voiceover:false});}
function stopSnd(){if(stopSound){stopSound();stopSound=null;}}
function play(){if(playing)return;if(currentT>=DURATION){currentT=0;}playing=true;lastTS=0;startSound();rafA=requestAnimationFrame(loop);syncUI();showUI();}
function pause(){playing=false;cancelAnimationFrame(rafA);stopSnd();syncUI();stopIdle();}
function finish(){playing=false;cancelAnimationFrame(rafA);stopSnd();syncUI();dissolveToSite();}
function dissolveToSite(){overlay.classList.add('bmc-hidden');setTimeout(()=>{overlay.style.display='none';},950);showLauncher();}
function openOverlay(){overlay.style.display='';overlay.classList.remove('bmc-hidden');hideLauncher();}
function showLauncher(){if(launcher)launcher.style.display='inline-flex';}
function hideLauncher(){if(launcher)launcher.style.display='none';}
let idleT=0;function showUI(){overlay.classList.remove('bmc-idle');clearTimeout(idleT);if(playing)idleT=setTimeout(()=>{if(playing)overlay.classList.add('bmc-idle');},2600);}
function stopIdle(){overlay.classList.remove('bmc-idle');clearTimeout(idleT);}
overlay&&overlay.addEventListener('mousemove',showUI);overlay&&overlay.addEventListener('touchstart',showUI,{passive:true});
document.addEventListener('keydown',e=>{if(!overlay||overlay.style.display==='none')return;if(e.key==='Escape'){pause();finish();}else if(e.key===' '||e.key==='k'){e.preventDefault();playing?pause():play();}});
btnPlay&&btnPlay.addEventListener('click',()=>{playing?pause():play();});
btnSkip&&btnSkip.addEventListener('click',()=>{pause();finish();});
scrub&&scrub.addEventListener('input',()=>{const t=Number(scrub.value)/1000*DURATION;pause();currentT=t;renderFrame(currentT);syncUI();});
btnSound&&btnSound.addEventListener('click',()=>{soundOn=!soundOn;btnSound.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');if(soundIcon)soundIcon.innerHTML=soundOn?'<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>':'<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".25"/>';if(playing){stopSnd();startSound();}});
launcher&&launcher.addEventListener('click',launch);
function launch(){openOverlay();if(!built){if(splash)splash.style.display='';if(controls)controls.hidden=true;if(splashbar)splashbar.style.width='0%';buildPlates(()=>{if(splash)splash.style.display='none';if(controls)controls.hidden=false;currentT=0;play();});}else{currentT=0;play();}}
let rzT=0;window.addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(built)renderFrame(currentT);},200);});
function bootAutoplay(){buildPlates(()=>{if(splash)splash.style.display='none';if(controls)controls.hidden=false;renderFrame(0);syncUI();markSeen();play();});}
window.BMC_build=function(cb){if(built){cb&&cb();return;}if(splash)splash.style.display='';if(controls)controls.hidden=true;if(splashbar)splashbar.style.width='0%';buildPlates(()=>{if(splash)splash.style.display='none';if(controls)controls.hidden=false;cb&&cb();});};
const SEEN='bmc_story_seen_rich_v1';
function seen(){try{return sessionStorage.getItem(SEEN)==='1';}catch(e){return false;}}
function markSeen(){try{sessionStorage.setItem(SEEN,'1');}catch(e){}}

/* ---- sound score ---- */
function scoreSound(k){
  const brush=(a,b,g=1,pan=0)=>{k.noise(a,{dur:0.05,color:'pink',filter:'lowpass',f:700,gain:0.16*g,a:0.008,pan,minor:true});k.play('stroke',a,{material:'brush',dur:Math.max(0.12,b-a),gain:1.4*g,pan,minor:true});};
  const letter=(s,a,b,g=0.8,pan=0)=>{const re=/\S+/g;let m;while((m=re.exec(s)))brush(a+(b-a)*m.index/s.length,a+(b-a)*(m.index+m[0].length)/s.length,g,pan);};
  const wash=(a,b,g=1,pan=0)=>{const d=b-a;k.noise(a,{dur:d,color:'pink',filter:'bandpass',f:[[0,260],[d*0.45,820],[d,420]],q:0.7,gain:0.09*g,a:d*0.4,pan,minor:true,verb:0.1});};
  k.bed('room',0,20,{gain:0.5});
  k.music('pad',0,20,{bpm:62,gain:0.34,chords:[['F3','A3','C4','E4'],['D3','F3','A3','C4'],['Bb2','D3','F3','A3'],['F3','C4','G4','A4'],['A3','C4','E4','G4']]});
  k.bed('rain',0,8,{gain:0.9});
  // S1 bad morning
  wash(0.3,1.6,1.0,-0.2);
  for(let i=0;i<6;i++){k.tone(0.5+i*0.42,{f:'A5',type:'square',dur:0.14,gain:0.06,a:0.002,hold:0.1,pan:0.3});k.tone(0.5+i*0.42+0.17,{f:'A5',type:'square',dur:0.14,gain:0.06,a:0.002,hold:0.1,pan:0.3});} // alarm buzz
  letter("Some mornings just don't go your way.",1.9,3.5,0.8);
  k.play('drop',2.6,{gain:1.0,pan:-0.2});k.play('thud',2.75,{f:120,gain:0.4,pan:-0.2});
  // S2 discovery
  wash(4.0,5.2,0.9,-0.3);
  k.noise(5.3,{dur:0.7,color:'pink',filter:'bandpass',f:[[0,300],[0.35,1400],[0.7,400]],q:0.8,gain:0.14,a:0.2,pan:0.3}); // car swish
  k.tone(6.5,{f:[[0,300],[0.9,700]],type:'triangle',dur:1.0,gain:0.08,a:0.5,pan:0.2}); // warm swell
  // S3 café
  k.play('bell',8.0,{f:'A5',gain:0.5});k.play('ding',8.12,{f:'E5',gain:0.35});
  wash(8.0,9.2,1.0,0.2);k.bed('machine',8.4,16.4,{gain:0.8});
  // S4 coffee
  k.noise(12.0,{dur:0.5,color:'brown',filter:'bandpass',f:380,q:1.3,gain:0.14,a:0.05,hold:0.3,pan:-0.2}); // grinder
  const pa=12.3,pb=13.4;k.noise(pa,{dur:pb-pa,color:'brown',filter:'bandpass',f:[[0,300],[0.3,520],[pb-pa,420]],q:1.2,gain:0.16,a:0.15,hold:(pb-pa)*0.6});
  k.noise(13.5,{dur:0.7,color:'white',filter:'bandpass',f:[[0,2200],[0.3,3200],[0.7,1600]],q:0.7,gain:0.12,a:0.1,pan:0.1}); // steam wand
  k.play('sparkle',14.8,{gain:0.4,n:5});
  k.play('tock',15.1,{f:300,gain:0.5});letter("You've got this.",15.3,16.2,0.85,0.1);k.play('ding',16.3,{f:'C5',gain:0.42});
  // S5 brighter
  k.play('drop',16.8,{gain:0.6});
  letter("A Little Coffee. A Brighter Day.",17.4,18.3,1.0);
  k.play('ding',18.4,{f:'F4',gain:0.45});['A4','C5','F5'].forEach((f,i)=>k.tone(18.5+i*0.07,{f,dur:1.4,gain:0.08-i*0.01,verb:0.3,pan:(i-1)*0.3}));
  k.play('sparkle',18.7,{gain:0.4,n:6});
}

// entry
if(window.BMC_NO_AUTOPLAY){/* render mode */}
else if(reduce||seen()){overlay.style.display='none';showLauncher();}
else{bootAutoplay();}
})();
