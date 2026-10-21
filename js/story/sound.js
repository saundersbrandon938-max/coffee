/* ===================== SOUND kit (synth, no files) ===================== */
(function () {
  'use strict';const SOUND=(window.SOUND={});const TINY=1e-4;
  function rand(key){let h=2166136261;for(let i=0;i<key.length;i++){h^=key.charCodeAt(i);h=Math.imul(h,16777619);}let a=h>>>0||1;return()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
  const STEP={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function hz(n){if(typeof n==='number')return n;const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);const semis=STEP[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(Number(m[3])-4)*12-9;return 440*Math.pow(2,semis/12);}
  SOUND.hz=hz;
  SOUND.kit=function(ctx,opts){
    const o=opts||{};const VO=!!o.voiceover;const MINOR=0.6;let inMinor=false;
    const gainOf=(p,d)=>(p.gain==null?d:p.gain)*(VO&&(p.minor||inMinor)?MINOR:1);
    const T0=(o.start||0)-0;const base=ctx.currentTime+(o.delay||0);const SR=ctx.sampleRate;const at=t=>(Math.round((base+(t-T0))*SR)+0.25)/SR;
    const master=ctx.createGain();master.gain.value=o.master==null?0.9:o.master;
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=8;comp.ratio.value=3;comp.attack.value=0.004;comp.release.value=0.18;comp.connect(master);master.connect(o.dest||ctx.destination);
    const bus={};for(const[name,g]of Object.entries({sfx:VO?0.7:0.85,amb:0.5,music:0.45})){bus[name]=ctx.createGain();bus[name].gain.value=g;bus[name].connect(comp);}
    const verb=ctx.createConvolver();{const secs=1.6,n=Math.floor(secs*ctx.sampleRate),ir=ctx.createBuffer(2,n,ctx.sampleRate);for(let c=0;c<2;c++){const r=rand('verb'+c),d=ir.getChannelData(c);let lp=0;for(let i=0;i<n;i++){const u=i/n;lp+=(0.6-0.45*u)*((r()*2-1)-lp);d[i]=lp*Math.pow(1-u,3);}}verb.buffer=ir;}
    const verbIn=ctx.createGain();verbIn.gain.value=0.9;verbIn.connect(verb);verb.connect(comp);
    const noiseBuf={};{const n=Math.floor(2.5*ctx.sampleRate);for(const kind of['white','pink','brown']){const b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0),r=rand('noise-'+kind);let p0=0,p1=0,p2=0,br=0;for(let i=0;i<n;i++){const w=r()*2-1;if(kind==='white')d[i]=w;else if(kind==='pink'){p0=0.997*p0+0.029*w;p1=0.985*p1+0.032*w;p2=0.95*p2+0.048*w;d[i]=(p0+p1+p2+w*0.05)*2.2;}else{br=(br+0.02*w)/1.02;d[i]=br*3.2;}}noiseBuf[kind]=b;}}
    function sweep(param,v,t){if(!Array.isArray(v)){param.setValueAtTime(v,t);return;}param.setValueAtTime(v[0][1],t+v[0][0]);for(let i=1;i<v.length;i++)param.exponentialRampToValueAtTime(Math.max(v[i][1],1),t+v[i][0]);}
    function shape(param,t,gain,dur,a,hold){a=Math.min(a==null?0.004:a,dur*0.9);hold=Math.min(hold||0,dur-a);param.setValueAtTime(0,t);param.linearRampToValueAtTime(gain,t+a);if(hold>0)param.setValueAtTime(gain,t+a+hold);param.exponentialRampToValueAtTime(TINY,t+dur);param.setValueAtTime(0,t+dur+0.001);}
    function out(node,p){const pan=ctx.createStereoPanner();pan.pan.value=Math.max(-1,Math.min(1,p.pan||0));node.connect(pan);pan.connect(bus[p.bus||'sfx']);if(p.verb){const s=ctx.createGain();s.gain.value=p.verb;pan.connect(s);s.connect(verbIn);}}
    function tone(time,p){const t=at(time),dur=p.dur||0.2;if(t+dur<ctx.currentTime||(time<T0-0.001&&dur<1.5))return;const osc=ctx.createOscillator();osc.type=p.type||'sine';sweep(osc.frequency,Array.isArray(p.f)?p.f.map(([d,v])=>[d,hz(v)]):hz(p.f||440),t);if(p.detune)osc.detune.value=p.detune;const g=ctx.createGain();shape(g.gain,t,gainOf(p,0.3),dur,p.a,p.hold);let node=osc;if(p.filter){const f=ctx.createBiquadFilter();f.type=p.filter;f.Q.value=p.q==null?0.8:p.q;sweep(f.frequency,p.f2||2000,t);osc.connect(f);node=f;}node.connect(g);out(g,p);osc.start(t);osc.stop(t+dur+0.02);}
    function noise(time,p){const t=at(time),dur=p.dur||0.2;if(t+dur<ctx.currentTime||(time<T0-0.001&&dur<1.5))return;const src=ctx.createBufferSource();src.buffer=noiseBuf[p.color||'white'];src.loop=true;if(p.rate)src.playbackRate.value=p.rate;const g=ctx.createGain();shape(g.gain,t,gainOf(p,0.3),dur,p.a,p.hold);let f=null;if(p.filter){f=ctx.createBiquadFilter();f.type=p.filter;f.Q.value=p.q==null?1:p.q;sweep(f.frequency,p.f==null?1000:p.f,t);}if(f){src.connect(f);f.connect(g);}else src.connect(g);out(g,p);const off=rand('off'+time+(p.f||''))()*2;src.start(t,off);src.stop(t+dur+0.02);}
    const S={
      pop:(t,o)=>{tone(t,{f:[[0,o.f||620],[0.07,(o.f||620)*0.45]],dur:0.1,gain:0.32*o.g,pan:o.pan});noise(t,{dur:0.012,filter:'highpass',f:3000,gain:0.12*o.g,pan:o.pan});},
      tick:(t,o)=>noise(t,{dur:0.018,filter:'bandpass',f:o.f||4200,q:2.5,gain:0.3*o.g,pan:o.pan}),
      tock:(t,o)=>{tone(t,{f:o.f||820,dur:0.07,gain:0.25*o.g,pan:o.pan});noise(t,{dur:0.05,filter:'bandpass',f:o.f||820,q:9,gain:0.35*o.g,pan:o.pan});},
      thud:(t,o)=>{tone(t,{f:[[0,o.f||130],[0.16,42]],dur:0.26,gain:0.55*o.g,pan:o.pan});noise(t,{dur:0.09,color:'brown',filter:'lowpass',f:500,gain:0.35*o.g,pan:o.pan});},
      impact:(t,o)=>{S.thud(t,o);noise(t,{dur:0.7,color:'pink',filter:'lowpass',f:[[0,2400],[0.6,300]],gain:0.3*o.g,verb:0.35,pan:o.pan});},
      ding:(t,o)=>{const f=hz(o.f||'E6');tone(t,{f,dur:1.3,gain:0.2*o.g,verb:0.3,pan:o.pan});tone(t,{f:f*2.76,dur:0.5,gain:0.05*o.g,verb:0.3,pan:o.pan});},
      success:(t,o)=>{S.ding(t,{...o,f:o.f||'C6'});S.ding(t+0.09,{...o,f:hz(o.f||'C6')*1.5,g:o.g*0.9});},
      bell:(t,o)=>S.ding(t,{...o,f:o.f||'A6'}),
      sparkle:(t,o)=>{const r=rand('sp'+t),notes=['C6','D6','E6','G6','A6','C7'];for(let i=0;i<(o.n||6);i++){const ti=t+i*0.04+r()*0.01,f=hz(notes[Math.floor(r()*notes.length)]),pan=r()*1.2-0.6;tone(ti,{f,dur:0.6,gain:0.04*o.g,a:0.002,verb:0.35,pan});}},
      drop:(t,o)=>tone(t,{f:[[0,330],[0.05,560]],dur:0.08,gain:0.07*o.g,a:0.003,pan:o.pan,verb:0.2}),
      stroke:(t,o)=>{const d=o.dur||0.4,m=o.material||'brush',r=rand('st'+m+t);const M={brush:{f:900,q:0.5,g:0.1,grain:0.09,color:'pink'},pencil:{f:4600,q:0.8,g:0.16,grain:0.04,filter:'highpass'}}[m];for(let x=0;x<d;x+=M.grain*(0.7+r()*0.6)){const gd=M.grain*(0.8+r()*0.9);noise(t+x,{dur:gd,color:M.color,filter:M.filter||'bandpass',f:M.f*(0.8+r()*0.4),q:M.q,gain:M.g*o.g*(0.6+r()*0.5),a:gd*0.3,pan:(o.pan||0)+(r()-0.5)*0.2});}},
    };
    function play(name,t,opts){const fn=S[name];if(!fn)return;const o2=Object.assign({},opts);o2.g=o2.gain==null?1:o2.gain;if(opts&&opts.minor)withMinor(()=>fn(t,o2));else fn(t,o2);}
    function withMinor(fn){const was=inMinor;inMinor=true;try{fn();}finally{inMinor=was;}}
    function bed(name,t0,t1,p){if(VO)return;p=p||{};const g=p.gain==null?1:p.gain,d=t1-t0,fade=Math.min(0.4,d/4);const long=q=>Object.assign({dur:d,a:fade,hold:d-fade*2,bus:'amb'},q);
      if(name==='room')noise(t0,long({color:'brown',filter:'lowpass',f:320,gain:0.12*g}));
      else if(name==='hum'){tone(t0,long({f:60,gain:0.05*g}));tone(t0,long({f:120,gain:0.025*g}));}
      else if(name==='rain'){noise(t0,long({color:'pink',filter:'bandpass',f:2500,q:0.4,gain:0.08*g}));const r=rand('rain');for(let x=0;x<d;x+=0.04+r()*0.08)noise(t0+x,{dur:0.01,filter:'highpass',f:4000,gain:0.04*g*r(),bus:'amb',pan:r()*1.6-0.8});}
      else if(name==='machine')noise(t0,long({color:'pink',filter:'bandpass',f:1200,q:0.6,gain:0.05*g}));
    }
    function music(name,t0,t1,p){if(VO)return;p=p||{};const g=p.gain==null?1:p.gain,bpm=p.bpm||64,bar=60/bpm*4;const chords=p.chords||[['F3','A3','C4','E4']];let i=0;for(let t=t0;t<t1-0.05;t+=bar,i++){const ch=chords[i%chords.length],len=Math.min(bar,t1-t);ch.forEach((n,k)=>{tone(t,{f:n,type:'triangle',dur:len+0.3,gain:0.03*g,a:0.3,hold:len-0.3,bus:'music',filter:'lowpass',f2:1400,pan:(k-1.5)*0.25,verb:0.25});});}}
    return{play,bed,music,tone,noise,withMinor,hz,vo:VO};
  };
  SOUND.live=function(fn,fromT,opts){const ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();fn(SOUND.kit(ctx,Object.assign({},opts,{start:fromT||0,delay:0.04})));return()=>{try{ctx.close();}catch(e){}};};
  SOUND.renderOffline=async function(fn,duration,sampleRate,kitOpts){const sr=sampleRate||48000,len=Math.ceil(duration*sr);const ctx=new OfflineAudioContext(2,len,sr);fn(SOUND.kit(ctx,kitOpts||{}));const buf=await ctx.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),inter=new Float32Array(len*2);let peak=0;for(let i=0;i<len;i++){inter[2*i]=L[i];inter[2*i+1]=R[i];peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));}return{inter,peak,frames:len,sr};};
})();
