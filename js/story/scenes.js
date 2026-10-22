/* ============ Enriched scenes: subjects, 5 builders, live FX ============ */
(function(){
const WC=window.WC,H=window.H,P=WC.P,deform=WC.deform,circlePts=WC.circlePts,rpoly=WC.rpoly,wcText=WC.wcText;
function qp(a){return a.map(p=>P(p[0],p[1],p[2]==null?1:p[2]));}
function ring(cx,cy,rx,ry,n=24){const o=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;o.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return o;}
function ink(pt,pts,w,col,o={}){const al=o.alpha==null?0.5:o.alpha,close=o.close,r=H.rng(o.seed||7),c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.lineJoin='round';c.lineCap='round';for(let p=0;p<2;p++){c.strokeStyle=H.rgba(col,al*(p?0.5:1));c.lineWidth=w*(p?0.55:1);c.beginPath();pts.forEach((q,i)=>{const x=q[0]+r.gauss()*(w*0.3+0.4),y=q[1]+r.gauss()*(w*0.3+0.4);i?c.lineTo(x,y):c.moveTo(x,y);});if(close)c.closePath();c.stroke();}c.restore();}
function glow(pt,x,y,r0,col,a){const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.filter='blur(22px)';c.fillStyle=H.rgba(col,a);c.beginPath();c.arc(x,y,r0,0,7);c.fill();c.restore();}
function dab(pt,x,y,rx,ry,col,seed,a=0.08){pt.wash(deform(circlePts(x,y,rx,ry,10,H.rng(seed),1),H.rng(seed+1),2,0.14),col,{layers:12,alpha:a,amt:0.1,seed:seed+2});}
function box(pt,x0,y0,x1,y1,col,seed,amt=0.05,a=0.055){pt.wash(deform(rpoly(x0,y0,x1,y1,0.85),H.rng(seed),2,amt),col,{layers:16,alpha:a,amt:0.05,seed:seed+1});}
function fillPoly(pt,pts,col,seed,amt=0.08,a=0.055,layers=16){pt.wash(deform(qp(pts),H.rng(seed),3,amt),col,{layers:layers,alpha:a,amt:0.06,seed:seed+1});}

const WARM={paper:[247,243,236],cream:[250,240,222],wall:[224,186,150],wallHi:[236,206,168],wood:[150,96,60],woodDk:[104,64,42],
  brick:[169,70,45],brickDk:[122,44,29],gold:[227,169,43],sage:[92,116,86],sageDk:[64,86,62],chrome:[210,178,130],ink:[92,54,34],
  glass:[196,206,206],skinA:[228,186,150],skinB:[208,158,120],skinC:[236,198,166],shirtA:[78,104,120],shirtB:[150,80,70],
  apron:[70,86,78],hairA:[70,52,42],hairB:[40,36,40],hairC:[120,86,56],plant:[86,120,74],plantDk:[58,92,54],daylight:[255,238,196],crema:[150,96,56]};
const COOL={wall:[150,160,180],wallHi:[178,188,206],slate:[96,110,134],slateDk:[64,76,100],blue:[90,110,150],deep:[46,56,86],
  pud:[120,138,160],sky:[150,166,188],ink:[40,48,90],skin:[182,184,198],skin2:[196,196,206],hair:[70,70,86],hair2:[96,86,70],
  sheet:[198,202,216],sheetDk:[150,158,180],wood:[110,96,96],coat:[74,88,116],coat2:[96,86,110],lampWarm:[236,200,140],rug:[120,96,110]};

/* ---------- people ---------- */
// upper-body person (head+torso+arms+hands+face). o: pose, lit('warm'|'cool'), skin,hair,shirt,apron,hairStyle,act
function person(pt,x,y,s,o){
  const cool=o.lit==='cool';const skin=o.skin||(cool?COOL.skin:WARM.skinA),hair=o.hair||(cool?COOL.hair:WARM.hairA),shirt=o.shirt||(cool?COOL.coat:WARM.shirtA),ikc=cool?COOL.ink:WARM.ink;
  const seed=((x*7+y*5+(o.pose||'').length*11)|0)>>>0||1;
  const shoY=y-118*s, hipY=y, headR=30*s, headCY=shoY-46*s, hcx=x;
  fillPoly(pt,[[hcx-40*s,shoY-2*s,0.9],[hcx+40*s,shoY-2*s,0.9],[hcx+46*s,hipY,1],[hcx-46*s,hipY,1]],shirt,seed+1,0.09,0.055,22);
  if(o.apron)fillPoly(pt,[[hcx-30*s,shoY+14*s,0.8],[hcx+30*s,shoY+14*s,0.8],[hcx+34*s,hipY+2*s,1],[hcx-34*s,hipY+2*s,1]],WARM.apron,seed+3,0.08,0.06,16);
  const arm=(p0,p1,p2,sd)=>{fillPoly(pt,[[p0[0]-9*s,p0[1],0.8],[p0[0]+9*s,p0[1],0.8],[p1[0]+8*s,p1[1],0.8],[p2[0]+7*s,p2[1],0.9],[p2[0]-7*s,p2[1],0.9],[p1[0]-8*s,p1[1],0.8]],shirt,sd,0.1,0.06,14);
    pt.wash(deform(circlePts(p2[0],p2[1],9*s,9*s,8,H.rng(sd+5),1),H.rng(sd+6),2,0.1),skin,{layers:12,alpha:0.07,amt:0.08,seed:sd+7});};
  let hands=[];
  if(o.pose==='barista'){arm([hcx-30*s,shoY+6*s],[hcx-50*s,shoY+34*s],[hcx-54*s,shoY+66*s],seed+10);arm([hcx+28*s,shoY+6*s],[hcx+52*s,shoY+28*s],[hcx+72*s,shoY+54*s],seed+20);hands=[[hcx+72*s,shoY+54*s],[hcx-54*s,shoY+66*s]];}
  else if(o.pose==='read'){arm([hcx-30*s,shoY+8*s],[hcx-30*s,shoY+48*s],[hcx-12*s,shoY+70*s],seed+10);arm([hcx+30*s,shoY+8*s],[hcx+30*s,shoY+48*s],[hcx+12*s,shoY+70*s],seed+20);hands=[[hcx-12*s,shoY+70*s],[hcx+12*s,shoY+70*s]];}
  else if(o.pose==='sip'){arm([hcx-30*s,shoY+8*s],[hcx-40*s,shoY+46*s],[hcx-30*s,shoY+74*s],seed+10);arm([hcx+28*s,shoY+8*s],[hcx+44*s,shoY+34*s],[hcx+22*s,headCY+28*s],seed+20);hands=[[hcx+22*s,headCY+28*s]];}
  else if(o.pose==='slump'){arm([hcx-30*s,shoY+8*s],[hcx-46*s,shoY+40*s],[hcx-34*s,shoY+72*s],seed+10);arm([hcx+28*s,shoY+8*s],[hcx+40*s,shoY+10*s],[hcx+18*s,headCY+20*s],seed+20);hands=[[hcx+18*s,headCY+20*s]];}
  else {arm([hcx-30*s,shoY+8*s],[hcx-40*s,shoY+46*s],[hcx-30*s,shoY+74*s],seed+10);arm([hcx+28*s,shoY+8*s],[hcx+40*s,shoY+40*s],[hcx+30*s,shoY+62*s],seed+20);hands=[[hcx+30*s,shoY+62*s]];}
  fillPoly(pt,[[hcx-8*s,headCY+20*s,0.8],[hcx+8*s,headCY+20*s,0.8],[hcx+10*s,shoY+2*s,0.9],[hcx-10*s,shoY+2*s,0.9]],skin,seed+30,0.08,0.06,10);
  pt.wash(deform(circlePts(hcx,headCY,headR,headR*1.1,14,H.rng(seed+32),1),H.rng(seed+33),2,0.07),skin,{layers:18,alpha:0.06,amt:0.07,seed:seed+34});
  if(o.hairStyle==='bun'){pt.wash(deform(circlePts(hcx,headCY-8*s,headR*1.02,headR*0.8,12,H.rng(seed+35),1,Math.PI*0.95,Math.PI*2.25),H.rng(seed+36),2,0.1),hair,{layers:14,alpha:0.07,amt:0.09,seed:seed+37});pt.wash(deform(circlePts(hcx,headCY-headR*1.05,13*s,12*s,8,H.rng(seed+38),1),H.rng(seed+39),2,0.1),hair,{layers:12,alpha:0.08,amt:0.1,seed:seed+40});}
  else if(o.hairStyle==='short'){pt.wash(deform(circlePts(hcx,headCY-6*s,headR*1.04,headR*0.78,12,H.rng(seed+35),1,Math.PI*0.9,Math.PI*2.3),H.rng(seed+36),2,0.1),hair,{layers:14,alpha:0.07,amt:0.09,seed:seed+37});}
  else if(o.hairStyle==='mess'){pt.wash(deform(circlePts(hcx,headCY-7*s,headR*1.08,headR*0.86,13,H.rng(seed+35),1,Math.PI*0.84,Math.PI*2.36),H.rng(seed+36),3,0.14),hair,{layers:14,alpha:0.07,amt:0.12,seed:seed+37});}
  else {pt.wash(deform(qp([[hcx-headR,headCY-6*s,0.9],[hcx-headR*1.05,headCY+40*s,1],[hcx-headR*0.6,headCY+46*s,1],[hcx+headR*0.6,headCY+46*s,1],[hcx+headR*1.05,headCY+40*s,1],[hcx+headR,headCY-6*s,0.9],[hcx,headCY-headR,0.8]]),H.rng(seed+35),3,0.1),hair,{layers:16,alpha:0.07,amt:0.09,seed:seed+37});}
  pt.wet((c,rgba)=>{c.fillStyle=rgba(cool?[150,160,182]:[236,170,130],0.26);c.beginPath();c.ellipse(hcx+(cool?-8:8)*s,headCY+8*s,13*s,16*s,0,0,7);c.fill();c.fillStyle=rgba(cool?[80,90,120]:[80,52,40],0.3);c.beginPath();c.ellipse(hcx-14*s,shoY+40*s,20*s,46*s,0,0,7);c.fill();});
  pt.finish([hcx-90*s,headCY-headR*1.35-6*s,hcx+100*s,hipY+8*s],2.0,6,1);
  ink(pt,ring(hcx,headCY,headR,headR*1.1),2*s,ikc,{alpha:0.45,close:true,seed:seed+50});
  ink(pt,[[hcx-40*s,shoY-2*s],[hcx-46*s,hipY]],2.1*s,ikc,{alpha:0.42,seed:seed+51});
  ink(pt,[[hcx+40*s,shoY-2*s],[hcx+46*s,hipY]],2.1*s,ikc,{alpha:0.42,seed:seed+52});
  // face
  const ex=9*s,ey=headCY+2*s,c=pt.ctx,mood=o.mood||'neutral';c.save();c.globalCompositeOperation='multiply';
  if(mood==='happy'||!cool){c.fillStyle=H.rgba([226,138,110],0.22);c.beginPath();c.ellipse(hcx-ex-2*s,ey+10*s,6*s,4*s,0,0,7);c.ellipse(hcx+ex+2*s,ey+10*s,6*s,4*s,0,0,7);c.fill();}
  c.fillStyle='rgba(250,248,244,0.9)';c.beginPath();c.ellipse(hcx-ex,ey,4*s,4.6*s,0,0,7);c.ellipse(hcx+ex,ey,4*s,4.6*s,0,0,7);c.fill();
  c.fillStyle=H.rgba(ikc,0.85);c.beginPath();c.arc(hcx-ex,ey+(mood==='sad'?1.2*s:0),2.3*s,0,7);c.arc(hcx+ex,ey+(mood==='sad'?1.2*s:0),2.3*s,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,0.9)';c.beginPath();c.arc(hcx-ex-1*s,ey-1.2*s,0.9*s,0,7);c.arc(hcx+ex-1*s,ey-1.2*s,0.9*s,0,7);c.fill();
  c.strokeStyle=H.rgba(ikc,0.6);c.lineWidth=1.7*s;c.lineCap='round';c.beginPath();
  if(mood==='sad'){c.moveTo(hcx-ex-6*s,ey-9*s);c.lineTo(hcx-ex+3*s,ey-5*s);c.moveTo(hcx+ex+6*s,ey-9*s);c.lineTo(hcx+ex-3*s,ey-5*s);}
  else{c.moveTo(hcx-ex-5*s,ey-8*s);c.quadraticCurveTo(hcx-ex,ey-10*s,hcx-ex+5*s,ey-7.5*s);c.moveTo(hcx+ex-5*s,ey-7.5*s);c.quadraticCurveTo(hcx+ex,ey-10*s,hcx+ex+5*s,ey-8*s);}
  c.stroke();
  c.strokeStyle=H.rgba(ikc,0.38);c.lineWidth=1.4*s;c.beginPath();c.moveTo(hcx+1*s,ey+4*s);c.lineTo(hcx-2*s,ey+10*s);c.lineTo(hcx+1.4*s,ey+11*s);c.stroke();
  c.strokeStyle=H.rgba([150,70,60],0.6);c.lineWidth=2.1*s;c.beginPath();
  if(mood==='happy'){c.moveTo(hcx-8*s,ey+17*s);c.quadraticCurveTo(hcx,ey+25*s,hcx+8*s,ey+17*s);}
  else if(mood==='sad'){c.moveTo(hcx-8*s,ey+22*s);c.quadraticCurveTo(hcx,ey+17*s,hcx+8*s,ey+22*s);}
  else{c.moveTo(hcx-7*s,ey+18*s);c.lineTo(hcx+7*s,ey+18*s);}
  c.stroke();c.restore();
  return {eyes:[[hcx-ex,ey,4*s],[hcx+ex,ey,4*s]],hands,headCY,hcx,s,skin,shoY};
}
// full-body walker with umbrella (street). o: lit, dir(+1 right), coat, skin
function walker(pt,x,y,s,o){
  const coat=o.coat||COOL.coat,skin=o.skin||COOL.skin,ikc=COOL.ink,seed=((x*9+y*3)|0)>>>0||1,dir=o.dir||1,lean=8*s*dir;
  const hipY=y-120*s,shoY=hipY-70*s,headCY=shoY-40*s,headR=22*s,hcx=x+lean;
  // legs
  [[-1,o.step?-16*s:-8*s],[1,o.step?16*s:8*s]].forEach(([d,off],k)=>{fillPoly(pt,[[x+off-8*s,hipY,0.9],[x+off+8*s,hipY,0.9],[x+off+d*10*s+6*s,y,1],[x+off+d*10*s-6*s,y,1]],[54,60,78],seed+k,0.1,0.06,12);fillPoly(pt,[[x+off+d*10*s-9*s,y-5*s,0.9],[x+off+d*10*s+12*s,y-5*s,0.9],[x+off+d*10*s+12*s,y+5*s,1],[x+off+d*10*s-9*s,y+5*s,1]],[44,44,54],seed+20+k,0.1,0.07,10);});
  // coat body
  fillPoly(pt,[[hcx-28*s,shoY-2*s,0.9],[hcx+28*s,shoY-2*s,0.9],[x+34*s,hipY+26*s,1],[x-34*s,hipY+26*s,1]],coat,seed+2,0.1,0.055,20);
  // arm holding umbrella up
  fillPoly(pt,[[hcx+6*s,shoY+4*s,0.8],[hcx+26*s,shoY-26*s,0.8],[hcx+30*s,shoY-54*s,0.9],[hcx+18*s,shoY-52*s,0.9],[hcx+0*s,shoY-20*s,0.9]],coat,seed+5,0.1,0.06,14);
  // head
  fillPoly(pt,[[hcx-6*s,headCY+16*s,0.8],[hcx+6*s,headCY+16*s,0.8],[hcx+8*s,shoY+2*s,0.9],[hcx-8*s,shoY+2*s,0.9]],skin,seed+8,0.08,0.06,10);
  pt.wash(deform(circlePts(hcx,headCY,headR,headR*1.1,12,H.rng(seed+9),1),H.rng(seed+10),2,0.08),skin,{layers:14,alpha:0.06,amt:0.08,seed:seed+11});
  pt.wash(deform(circlePts(hcx,headCY-5*s,headR*1.05,headR*0.8,10,H.rng(seed+12),1,Math.PI*0.9,Math.PI*2.3),H.rng(seed+13),2,0.1),o.hair||COOL.hair,{layers:12,alpha:0.07,amt:0.1,seed:seed+14});
  pt.finish([x-54*s,headCY-headR-6*s,x+58*s,y+10*s],1.9,5,1);
  ink(pt,ring(hcx,headCY,headR,headR*1.1),1.8*s,ikc,{alpha:0.4,close:true,seed:seed+30});
  ink(pt,[[hcx-28*s,shoY],[x-34*s,hipY+26*s]],1.9*s,ikc,{alpha:0.38,seed:seed+31});ink(pt,[[hcx+28*s,shoY],[x+34*s,hipY+26*s]],1.9*s,ikc,{alpha:0.38,seed:seed+32});
  // umbrella canopy
  const ux=hcx+30*s,uy=shoY-62*s;
  fillPoly(pt,[[ux-54*s,uy,0.9],[ux-28*s,uy-26*s,0.8],[ux,uy-34*s,0.8],[ux+28*s,uy-26*s,0.8],[ux+54*s,uy,0.9],[ux+36*s,uy+6*s,1],[ux,uy-2*s,1],[ux-36*s,uy+6*s,1]],o.umbrella||COOL.deep,seed+40,0.08,0.06,16);
  pt.finish([ux-62*s,uy-40*s,ux+62*s,uy+14*s],1.8,4,1);
  ink(pt,[[ux-54*s,uy],[ux-28*s,uy-26*s],[ux,uy-34*s],[ux+28*s,uy-26*s],[ux+54*s,uy]],2.2*s,[50,54,78],{alpha:0.5,seed:seed+41});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba([50,54,78],0.4);c.lineWidth=1.4*s;[-36,-12,12,36].forEach(dx=>{c.beginPath();c.moveTo(ux,uy-34*s);c.lineTo(ux+dx*s,uy+2*s);c.stroke();});c.strokeStyle=H.rgba([50,54,78],0.5);c.lineWidth=2.4*s;c.beginPath();c.moveTo(ux,uy-34*s);c.lineTo(ux,shoY+6*s);c.stroke();c.restore();
  return {hcx,headCY,headR,umbrella:{x:ux,y:uy}};
}
function cup(pt,x,y,s,warm){const body=[250,246,239],ikc=[120,80,58];const tw=20*s,bw=15*s,h=20*s;
  fillPoly(pt,[[x-tw,y,0.9],[x+tw,y,0.9],[x+bw,y+h,1],[x-bw,y+h,1]],body,(x*3+y)|0,0.07,0.06,12);
  pt.wash(deform(circlePts(x,y,tw*0.86,tw*0.3,10,H.rng(x+y+2),1),H.rng(x+y+3),2,0.1),[150,96,56],{layers:10,alpha:0.06,amt:0.1,seed:x+y+4});
  pt.finish([x-tw*1.8,y-6*s,x+tw*1.8,y+h+8*s],2,4,1);
  ink(pt,[[x-tw,y],[x-bw,y+h],[x+bw,y+h],[x+tw,y]],1.8*s,ikc,{alpha:0.42,seed:x+y+5});
  ink(pt,ring(x,y,tw*0.86,tw*0.3),1.5*s,ikc,{alpha:0.38,close:true,seed:x+y+6});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba(ikc,0.4);c.lineWidth=3.4*s;c.lineCap='round';c.beginPath();c.arc(x+tw+2*s,y+h*0.45,8*s,-1,1);c.stroke();c.restore();}
function espressoMachine(pt,x,y,s){const body=[200,150,118],chrome=WARM.chrome,ikc=WARM.ink;const W=150*s,Hh=96*s;
  box(pt,x-W/2,y-Hh,x+W/2,y,body,9201,0.05,0.055);box(pt,x-W/2-6*s,y-Hh-15*s,x+W/2+6*s,y-Hh+6*s,chrome,9203,0.05,0.06);
  for(let i=0;i<4;i++)dab(pt,x-W/2+16*s+i*28*s,y-Hh-8*s,8*s,6*s,[246,240,230],9210+i,0.06);
  [-40,40].forEach((dx,k)=>box(pt,x+dx*s-22*s,y-44*s,x+dx*s+22*s,y-18*s,chrome,9220+k,0.05,0.06));
  pt.finish([x-W/2-18*s,y-Hh-22*s,x+W/2+18*s,y+6*s],1.8,5,1);
  [-40,40].forEach((dx,k)=>box(pt,x+dx*s-6*s,y-20*s,x+dx*s+6*s,y+3*s,[58,48,48],9230+k,0.06,0.08));
  pt.finish([x-66*s,y-24*s,x+66*s,y+6*s],1.8,4,1);
  ink(pt,[[x-W/2,y],[x-W/2,y-Hh],[x+W/2,y-Hh],[x+W/2,y]],2.1*s,ikc,{alpha:0.42,seed:9240});
  [-40,40].forEach((dx,k)=>ink(pt,[[x+dx*s-22*s,y-18*s],[x+dx*s-22*s,y-44*s],[x+dx*s+22*s,y-44*s],[x+dx*s+22*s,y-18*s]],1.7*s,ikc,{alpha:0.4,seed:9242+k}));
  ink(pt,[[x+W/2+2*s,y-Hh+22*s],[x+W/2+18*s,y-Hh+46*s],[x+W/2+14*s,y-14*s]],2.6*s,ikc,{alpha:0.4,seed:9245});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.fillStyle=H.rgba([250,244,232],0.7);c.beginPath();c.arc(x,y-Hh+28*s,8*s,0,7);c.fill();c.strokeStyle=H.rgba(ikc,0.5);c.lineWidth=1.6*s;c.stroke();c.fillStyle=H.rgba(WARM.brick,0.5);[-12,0,12].forEach(dx=>{c.beginPath();c.arc(x+dx*s-54*s,y-Hh+26*s,3*s,0,7);c.fill();});c.restore();}
function leafCluster(pt,cx,cy,n,len,col,seed,up){const r=H.rng(seed);for(let i=0;i<n;i++){const a=(up?-Math.PI/2:Math.PI/2)+r.range(-1.1,1.1);const l=len*(0.6+r()*0.6);const ex=cx+Math.cos(a)*l,ey=cy+Math.sin(a)*l;const w=len*0.18;fillPoly(pt,[[cx,cy,0.8],[(cx+ex)/2-Math.sin(a)*w,(cy+ey)/2+Math.cos(a)*w,0.7],[ex,ey,0.6],[(cx+ex)/2+Math.sin(a)*w,(cy+ey)/2-Math.cos(a)*w,0.7]],i%2?col:WARM.plantDk,seed+i*7,0.12,0.06,12);}pt.finish([cx-len*1.3,cy-len*1.3,cx+len*1.3,cy+len*1.3],1.8,4,1);}

/* ---------- SCENE 1: furnished bedroom ---------- */
function buildBedroom(pt,W,H2,fx){
  // cool wall + floor
  fillPoly(pt,[[-20,-20],[W+20,-20],[W+20,H2*0.72],[-20,H2*0.72]],COOL.wall,601,0.08,0.05,22);
  pt.wet((c,rgba)=>{c.fillStyle=rgba(COOL.wallHi,0.5);c.beginPath();c.ellipse(W*0.3,H2*0.3,W*0.34,H2*0.4,0,0,7);c.fill();c.fillStyle=rgba(COOL.deep,0.3);c.beginPath();c.ellipse(W*0.85,H2*0.5,W*0.25,H2*0.5,0,0,7);c.fill();});
  pt.finish([0,0,W,H2*0.76],1.8,9,0.92);
  fillPoly(pt,[[-20,H2*0.68],[W+20,H2*0.68],[W+20,H2+20],[-20,H2+20]],COOL.wood,610,0.08,0.05,18);
  pt.finish([0,H2*0.66,W,H2],2,7,0.9);
  ink(pt,[[0,H2*0.705],[W,H2*0.705]],2,COOL.deep,{alpha:0.3,seed:611});
  // rug
  pt.wash(deform(circlePts(W*0.42,H2*0.88,W*0.28,H2*0.1,16,H.rng(612),1),H.rng(613),2,0.1),COOL.rug,{layers:16,alpha:0.045,amt:0.08,seed:614});pt.finish([W*0.1,H2*0.76,W*0.75,H2],1.9,6,0.88);
  // window (center-left) with rainy daylight + curtains
  const wx0=W*0.22,wy0=H2*0.1,wx1=W*0.46,wy1=H2*0.52;
  glow(pt,(wx0+wx1)/2,(wy0+wy1)/2,W*0.2,[196,210,228],0.5);
  box(pt,wx0,wy0,wx1,wy1,[176,192,210],620,0.04,0.05);
  pt.wet((c,rgba)=>{c.fillStyle=rgba([210,222,232],0.7);c.beginPath();c.ellipse((wx0+wx1)/2,(wy0+wy1)/2,(wx1-wx0)*0.42,(wy1-wy0)*0.42,0,0,7);c.fill();});
  pt.finish([wx0-10,wy0-10,wx1+10,wy1+10],2,5,1);
  ink(pt,[[wx0,wy0],[wx0,wy1],[wx1,wy1],[wx1,wy0],[wx0,wy0]],2.6,COOL.deep,{alpha:0.5,seed:621});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba(COOL.deep,0.42);c.lineWidth=2.4;c.beginPath();c.moveTo((wx0+wx1)/2,wy0);c.lineTo((wx0+wx1)/2,wy1);c.moveTo(wx0,(wy0+wy1)/2);c.lineTo(wx1,(wy0+wy1)/2);c.stroke();c.restore();
  // curtains
  fx.curtains=[];[[wx0-8,-1],[wx1+8,1]].forEach((cu,i)=>{fillPoly(pt,[[cu[0]-24,wy0-10,0.8],[cu[0]+10,wy0-10,0.8],[cu[0]+6,wy1,1],[cu[0]-28,wy1,1]],COOL.slate,630+i,0.12,0.055,14);pt.finish([cu[0]-40,wy0-14,cu[0]+20,wy1+4],1.9,5,1);fx.curtains.push({x:cu[0],y0:wy0,y1:wy1,dir:cu[1]});});
  fx.window={x0:wx0+3,y0:wy0+3,x1:wx1-3,y1:wy1-3};
  // framed picture on wall (right of window)
  box(pt,W*0.52,H2*0.14,W*0.63,H2*0.3,[210,214,224],640,0.04,0.05);pt.finish([W*0.51,H2*0.13,W*0.64,H2*0.31],1.8,4,1);
  ink(pt,[[W*0.52,H2*0.14],[W*0.63,H2*0.14],[W*0.63,H2*0.3],[W*0.52,H2*0.3],[W*0.52,H2*0.14]],2,COOL.deep,{alpha:0.42,seed:641});
  pt.wash(deform(circlePts(W*0.575,H2*0.22,W*0.03,H2*0.04,10,H.rng(642),1),H.rng(643),2,0.2),COOL.blue,{layers:10,alpha:0.05,amt:0.14,seed:644});pt.finish([W*0.52,H2*0.15,W*0.63,H2*0.3],1.7,4,1);
  // dresser (far left) with mirror + plant
  box(pt,W*0.03,H2*0.5,W*0.17,H2*0.72,COOL.wood,650,0.05,0.06);pt.finish([W*0.02,H2*0.49,W*0.18,H2*0.73],1.9,5,1);
  ink(pt,[[W*0.03,H2*0.5],[W*0.17,H2*0.5],[W*0.17,H2*0.72],[W*0.03,H2*0.72]],2,COOL.deep,{alpha:0.4,seed:651});
  box(pt,W*0.06,H2*0.34,W*0.14,H2*0.5,[206,214,222],652,0.04,0.05);pt.finish([W*0.05,H2*0.33,W*0.15,H2*0.51],1.7,4,0.8);// mirror
  ink(pt,[[W*0.06,H2*0.34],[W*0.14,H2*0.34],[W*0.14,H2*0.5],[W*0.06,H2*0.5],[W*0.06,H2*0.34]],1.8,COOL.deep,{alpha:0.4,seed:653});
  // bed (right half): headboard, mattress, blanket, pillow, character sitting up
  const bx0=W*0.5,bx1=W*1.02,by=H2*0.62;
  box(pt,bx0+10,by-120,bx1,by-70,COOL.wood,660,0.05,0.06);// headboard
  pt.finish([bx0,by-130,W,by-60],1.9,5,1);
  fillPoly(pt,[[bx0-6,by-30,1],[bx1,by-50,1],[bx1,by+120,1.1],[bx0-10,by+120,1.1]],COOL.sheet,662,0.08,0.05,20);// bed/blanket
  pt.wet((c,rgba)=>{c.fillStyle=rgba(COOL.sheetDk,0.4);c.beginPath();c.ellipse(W*0.78,by+80,W*0.22,40,0,0,7);c.fill();for(let i=0;i<4;i++){c.beginPath();c.ellipse(bx0+60+i*120,by+40+ (i%2)*20,70,14,0.1,0,7);c.fill();}});
  pt.finish([bx0-16,by-54,W,by+124],2,6,0.95);
  ink(pt,[[bx0-6,by-30],[bx1,by-50]],2.2,COOL.slateDk,{alpha:0.35,seed:663});
  // pillow
  pt.wash(deform(qp([[bx0+30,by-54,0.9],[bx0+150,by-60,0.9],[bx0+156,by-20,1],[bx0+24,by-14,1]]),H.rng(664),2,0.1),[216,220,230],{layers:14,alpha:0.055,amt:0.07,seed:665});pt.finish([bx0+14,by-66,bx0+170,by-6],1.9,5,1);
  // character sitting up in bed, groggy/sad, cool-lit
  const figb=person(pt,W*0.72,by-6,0.96,{pose:'slump',lit:'cool',skin:COOL.skin,hair:COOL.hair2,shirt:[120,130,150],hairStyle:'mess',mood:'sad'});
  fx.hero=figb;
  // nightstand (left of bed) with alarm clock, lamp, tipped mug + spill, book
  const nsx=W*0.45;box(pt,nsx-46,by-20,nsx+46,by+90,COOL.wood,670,0.05,0.06);pt.finish([nsx-56,by-26,nsx+56,by+96],1.9,5,1);
  ink(pt,[[nsx-46,by-20],[nsx+46,by-20],[nsx+46,by+90],[nsx-46,by+90]],2,COOL.deep,{alpha:0.4,seed:671});
  // lamp (warm pool of light — a touch of warmth)
  glow(pt,nsx-26,by-58,40,COOL.lampWarm,0.5);
  box(pt,nsx-34,by-54,nsx-18,by-24,[180,150,110],672,0.05,0.06);fillPoly(pt,[[nsx-40,by-54,0.8],[nsx-12,by-54,0.8],[nsx-18,by-78,0.9],[nsx-34,by-78,0.9]],[214,180,120],673,0.08,0.06,12);pt.finish([nsx-46,by-82,nsx-4,by-20],1.8,4,1);
  // alarm clock (vibrating)
  box(pt,nsx+6,by-44,nsx+42,by-18,[60,64,78],674,0.05,0.07);pt.finish([nsx+2,by-48,nsx+46,by-14],1.8,3,1);
  const ac=pt.ctx;ac.save();ac.globalCompositeOperation='screen';ac.fillStyle='rgba(230,120,90,0.8)';ac.font='bold 13px monospace';ac.fillText('8:10',nsx+10,by-26);ac.restore();
  fx.clock={x:nsx+24,y:by-31,x0:nsx+6,y0:by-44,x1:nsx+42,y1:by-18};
  // tipped mug + small spill on nightstand
  fillPoly(pt,[[nsx-6,by-18,0.9],[nsx+14,by-20,0.9],[nsx+12,by-2,1],[nsx-8,by-2,1]],[150,90,80],675,0.1,0.07,12);pt.wash(deform(circlePts(nsx+18,by+2,30,8,10,H.rng(676),1.2),H.rng(677),3,0.3),[120,78,58],{layers:16,alpha:0.05,amt:0.16,seed:678});pt.finish([nsx-16,by-24,nsx+56,by+14],2.2,4,1);
  // scattered papers on floor
  const pr=H.rng(690);for(let i=0;i<5;i++){const px=W*0.3+pr.range(-60,260),py=H2*0.84+pr.range(-20,40);pt.wash(deform(rpoly(px-26,py-18,px+26,py+18,0.7),H.rng(690+i),2,0.1),[236,232,222],{layers:10,alpha:0.055,amt:0.06,seed:692+i});pt.finish([px-32,py-24,px+32,py+24],1.7,3,1);ink(pt,[[px-26,py-18],[px+26,py-18],[px+26,py+18],[px-26,py+18],[px-26,py-18]],1.3,[140,140,150],{alpha:0.3,seed:695+i});}
  fx.eyes=[];if(figb.eyes)figb.eyes.forEach(e=>fx.eyes.push({x:e[0],y:e[1],r:e[2],skin:figb.skin,phase:Math.random()*3}));
  fx.rainGlass=fx.window; fx.cool=true;
  fx.cam={z0:1.0,z1:1.05,px:12,py:-6,cx:W*0.5,cy:H2*0.45};
}

/* ---------- SCENE 2: rainy street ---------- */
function building(pt,x0,x1,y0,y1,col,seed,litRows){
  box(pt,x0,y0,x1,y1,col,seed,0.05,0.055);pt.finish([x0-6,y0-6,x1+6,y1+6],1.9,6,0.92);
  ink(pt,[[x0,y1],[x0,y0],[x1,y0],[x1,y1]],2.2,COOL.deep,{alpha:0.42,seed:seed+1});
  // cornice
  box(pt,x0-6,y0-10,x1+6,y0+4,[col[0]*0.8,col[1]*0.8,col[2]*0.8],seed+2,0.05,0.06);pt.finish([x0-10,y0-14,x1+10,y0+8],1.8,4,1);
  // windows grid
  const cols=3,rows=4,gw=(x1-x0)/(cols+1),gh=(y1-y0)/(rows+1);
  const c=pt.ctx;
  for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const wx=x0+gw*(k+1)-gw*0.35,wy=y0+gh*(r+1)-gh*0.35,ww=gw*0.7,wh=gh*0.7;const lit=litRows&&litRows[(r*cols+k)%litRows.length];
    if(lit)glow(pt,wx+ww/2,wy+wh/2,ww*0.7,WARM.gold,0.4);
    box(pt,wx,wy,wx+ww,wy+wh,lit?[244,206,120]:[120,134,156],seed+10+r*cols+k,0.04,0.055);pt.finish([wx-3,wy-3,wx+ww+3,wy+wh+3],1.7,3,1);
    ink(pt,[[wx,wy],[wx,wy+wh],[wx+ww,wy+wh],[wx+ww,wy],[wx,wy]],1.4,COOL.deep,{alpha:0.38,seed:seed+40+r*cols+k});}
}
function buildStreet(pt,W,H2,fx){
  // sky
  fillPoly(pt,[[-20,-20],[W+20,-20],[W+20,H2*0.5],[-20,H2*0.5]],COOL.sky,701,0.08,0.05,20);
  pt.wet((c,rgba)=>{c.fillStyle=rgba([120,134,160],0.4);c.beginPath();c.ellipse(W*0.3,H2*0.1,W*0.4,H2*0.2,0,0,7);c.fill();});
  pt.finish([0,0,W,H2*0.54],1.8,9,0.9);
  fx.clouds=[{x:W*0.25,y:H2*0.12,r:120,v:6},{x:W*0.6,y:H2*0.08,r:150,v:8},{x:W*0.85,y:H2*0.16,r:110,v:5}];
  // buildings left
  building(pt,-20,W*0.2,H2*0.14,H2*0.7,COOL.slate,710,[1,0,1,0,0,1,0,1,0,1,0,0]);
  building(pt,W*0.2,W*0.37,H2*0.2,H2*0.7,[108,118,138],740,[0,1,0,0,1,0,1,0,0,0,1,0]);
  // café storefront (center-right) — warm, glowing
  const bx0=W*0.52,bx1=W*0.82,by0=H2*0.24,by1=H2*0.72;
  glow(pt,(bx0+bx1)/2,by0+ (by1-by0)*0.6,W*0.22,[246,196,96],0.7);
  box(pt,bx0,by0,bx1,by1,[120,90,84],770,0.05,0.05);pt.finish([bx0-8,by0-8,bx1+8,by1+8],1.9,6,0.92);
  // awning stripes
  const ay=by0+ (by1-by0)*0.16,ah=34,w=bx1-bx0;for(let i=0;i<7;i++){const sx0=bx0+6+i*(w-12)/7,sx1=bx0+6+(i+1)*(w-12)/7;fillPoly(pt,[[sx0,ay,0.8],[sx1,ay,0.8],[sx1-4,ay+ah,0.9],[sx0-4,ay+ah,0.9]],i%2?WARM.cream:WARM.brickDk,775+i,0.08,0.07,14);}pt.finish([bx0,ay-6,bx1,ay+ah+8],1.8,5,1);
  ink(pt,[[bx0+4,ay+ah],[bx1-4,ay+ah]],2.2,[90,32,20],{alpha:0.45,seed:785});
  const nbY=ay+ah+14;box(pt,bx0+w*0.12,nbY,bx1-w*0.12,nbY+26,WARM.cream,786,0.05,0.05);pt.finish([bx0+w*0.1,nbY-4,bx1-w*0.1,nbY+32],1.7,4,1);
  wcText(pt.ctx,'The Brick & Mortar',(bx0+bx1)/2,nbY+20,22,'rgb(122,44,29)',{align:'center'});
  // two glowing windows + door
  const wtop=nbY+34,wbot=by1-16,ww=(w*0.56-14)/2;fx.cafeWin=[];
  [0,1].forEach(k=>{const x0=bx0+w*0.08+k*(ww+14),x1=x0+ww;glow(pt,(x0+x1)/2,(wtop+wbot)/2,ww*0.7,[255,214,120],0.6);box(pt,x0,wtop,x1,wbot,[244,184,78],787+k,0.05,0.07);pt.wet((c,rgba)=>{c.fillStyle=rgba([255,240,196],0.72);c.beginPath();c.ellipse((x0+x1)/2,(wtop+wbot)/2,ww*0.38,(wbot-wtop)*0.4,0,0,7);c.fill();});dab(pt,(x0+x1)/2-ww*0.18,wbot-24,15,26,[150,96,60],790+k,0.07);pt.finish([x0-6,wtop-6,x1+6,wbot+6],2,5,1);ink(pt,[[x0,wtop],[x0,wbot],[x1,wbot],[x1,wtop],[x0,wtop]],2.2,[122,44,29],{alpha:0.5,seed:792+k});fx.cafeWin.push({x:(x0+x1)/2,y:(wtop+wbot)/2,r:ww*0.7});});
  const dx0=bx0+w*0.72,dx1=bx1-w*0.06;box(pt,dx0,wtop,dx1,by1,WARM.woodDk,795,0.05,0.05);box(pt,dx0+6,wtop+8,dx1-6,wtop+(by1-wtop)*0.45,WARM.gold,796,0.05,0.05);pt.finish([dx0-4,wtop-4,dx1+4,by1+4],1.8,4,1);ink(pt,[[dx0,by1],[dx0,wtop],[dx1,wtop],[dx1,by1]],2.2,[80,46,30],{alpha:0.5,seed:797});
  // hanging cup sign
  const gx=bx0+w*0.32,gy=by0+ (by1-by0)*0.06;ink(pt,[[gx,by0],[gx,gy+8]],2,[80,46,30],{alpha:0.5,seed:798});pt.wash(deform(circlePts(gx,gy+20,18,15,10,H.rng(799),1),H.rng(800),2,0.1),WARM.cream,{layers:12,alpha:0.07,amt:0.08,seed:801});pt.finish([gx-24,gy+2,gx+24,gy+40],1.8,3,1);ink(pt,ring(gx,gy+20,18,15),1.6,[122,44,29],{alpha:0.5,close:true,seed:802});
  // building right (beyond café)
  building(pt,bx1,W+20,H2*0.26,H2*0.72,[100,112,132],810,[0,0,1,0,1,0,0,1,0,0,1,0]);
  // streetlamp
  const lx=W*0.46,ly=H2*0.3;ink(pt,[[lx,H2*0.72],[lx,ly]],3,COOL.deep,{alpha:0.5,seed:820});glow(pt,lx,ly,32,[210,220,236],0.4);pt.wash(deform(circlePts(lx,ly,13,16,8,H.rng(821),1),H.rng(822),2,0.1),[216,226,238],{layers:10,alpha:0.07,amt:0.1,seed:823});pt.finish([lx-22,ly-24,lx+22,ly+24],1.8,4,1);
  // tree (left foreground)
  ink(pt,[[W*0.1,H2*0.72],[W*0.1,H2*0.5]],5,[80,70,64],{alpha:0.5,seed:830});
  fx.tree={x:W*0.1,y:H2*0.5};
  leafCluster(pt,W*0.1,H2*0.5,14,70,COOL.slate,831,true);
  // wet street (foreground) + reflections
  const sy=H2*0.7;fillPoly(pt,[[-20,sy],[W+20,sy-6],[W+20,H2+20],[-20,H2+20]],COOL.pud,840,0.1,0.05,18);
  pt.wet((c,rgba)=>{c.fillStyle=rgba([150,166,190],0.4);c.beginPath();c.ellipse(W*0.5,H2*0.9,W*0.5,H2*0.14,0,0,7);c.fill();
    // warm reflection of café
    c.fillStyle=rgba([230,178,110],0.4);c.beginPath();c.ellipse((bx0+bx1)/2,sy+ (H2-sy)*0.5,(bx1-bx0)*0.3,(H2-sy)*0.4,0,0,7);c.fill();});
  pt.finish([0,sy-8,W,H2],2,6,0.95);
  ink(pt,[[0,sy],[W,sy-6]],2.4,COOL.slateDk,{alpha:0.4,seed:841});
  fx.puddles=[{x:W*0.3,y:H2*0.86},{x:W*0.62,y:H2*0.92},{x:W*0.84,y:H2*0.82}];
  // a passing car (mid-ground) moving L->R
  fx.car={y:sy+ (H2-sy)*0.28};
  // background walkers (2) with umbrellas
  const w1=walker(pt,W*0.33,sy+ (H2-sy)*0.5,0.7,{lit:'cool',dir:1,coat:[90,100,126],umbrella:[70,80,110],step:true});
  const w2=walker(pt,W*0.86,sy+ (H2-sy)*0.42,0.64,{lit:'cool',dir:-1,coat:[110,96,110],umbrella:[96,86,110]});
  fx.walkers=[{base:W*0.33,y:sy+(H2-sy)*0.5,s:0.7,dir:1,amp:60,coat:[90,100,126],umb:[70,80,110]},{base:W*0.86,y:sy+(H2-sy)*0.42,s:0.64,dir:-1,amp:50,coat:[110,96,110],umb:[96,86,110]}];
  // hero (foreground) walking toward café with umbrella
  const hero=walker(pt,W*0.2,H2*0.96,1.06,{lit:'cool',dir:1,coat:COOL.coat,umbrella:COOL.deep,step:true});
  fx.hero=hero;
  fx.cool=true;
  fx.cam={z0:1.02,z1:1.0,px:-18,py:0,cx:W*0.55,cy:H2*0.5};
}

/* ---------- SCENE 3: café interior (rich) ---------- */
function buildCafe(pt,W,H2,fx){
  const C=WARM;
  fillPoly(pt,[[-20,-20],[W+20,-20],[W+20,H2*0.78],[-20,H2*0.78]],C.wall,301,0.1,0.05,22);
  pt.wet((c,rgba)=>{c.fillStyle=rgba(C.wallHi,0.5);c.beginPath();c.ellipse(W*0.64,H2*0.3,W*0.4,H2*0.4,0,0,7);c.fill();c.fillStyle=rgba([150,96,70],0.25);c.beginPath();c.ellipse(W*0.1,H2*0.5,W*0.25,H2*0.4,0,0,7);c.fill();});
  pt.finish([0,0,W,H2*0.82],1.8,9,0.92);
  ink(pt,[[0,H2*0.52],[W,H2*0.5]],2,C.woodDk,{alpha:0.22,seed:303});
  const wx0=W*0.62,wy0=H2*0.06,wx1=W*0.98,wy1=H2*0.46;
  glow(pt,(wx0+wx1)/2,(wy0+wy1)/2,W*0.26,C.daylight,0.6);
  box(pt,wx0,wy0,wx1,wy1,[224,232,226],305,0.04,0.05);
  pt.wet((c,rgba)=>{c.fillStyle=rgba([255,246,214],0.7);c.beginPath();c.ellipse((wx0+wx1)/2,(wy0+wy1)/2,(wx1-wx0)*0.42,(wy1-wy0)*0.42,0,0,7);c.fill();c.fillStyle=rgba([170,196,188],0.4);c.beginPath();c.ellipse(wx0+(wx1-wx0)*0.3,wy1-20,60,24,0,0,7);c.fill();});
  pt.finish([wx0-10,wy0-10,wx1+10,wy1+10],2,5,1);
  ink(pt,[[wx0,wy0],[wx0,wy1],[wx1,wy1],[wx1,wy0],[wx0,wy0]],2.6,C.woodDk,{alpha:0.5,seed:306});
  let c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba(C.woodDk,0.42);c.lineWidth=2.4;c.beginPath();c.moveTo((wx0+wx1)/2,wy0);c.lineTo((wx0+wx1)/2,wy1);c.moveTo(wx0,(wy0+wy1)/2);c.lineTo(wx1,(wy0+wy1)/2);c.stroke();c.restore();
  box(pt,wx0+(wx1-wx0)*0.62,wy1-6,wx0+(wx1-wx0)*0.82,wy1+16,C.brick,308,0.05,0.06);pt.finish([wx0+(wx1-wx0)*0.55,wy1-10,wx1,wy1+22],1.8,4,1);
  leafCluster(pt,wx0+(wx1-wx0)*0.72,wy1-6,9,34,C.plant,309,true);
  fx.sill={x:wx0+(wx1-wx0)*0.72,y:wy1-6};fx.lightSource={x:(wx0+wx1)/2,y:(wy0+wy1)/2};
  box(pt,W*0.05,H2*0.1,W*0.2,H2*0.28,[236,226,206],315,0.04,0.05);pt.finish([W*0.04,H2*0.09,W*0.21,H2*0.3],1.8,4,1);ink(pt,[[W*0.05,H2*0.1],[W*0.2,H2*0.1],[W*0.2,H2*0.28],[W*0.05,H2*0.28],[W*0.05,H2*0.1]],2,C.woodDk,{alpha:0.45,seed:316});pt.wash(deform(circlePts(W*0.125,H2*0.19,W*0.04,H2*0.05,10,H.rng(317),1),H.rng(318),2,0.2),C.sage,{layers:12,alpha:0.05,amt:0.14,seed:319});pt.finish([W*0.06,H2*0.11,W*0.19,H2*0.27],1.8,4,1);
  ink(pt,[[W*0.03,H2*0.36],[W*0.26,H2*0.355]],3,C.woodDk,{alpha:0.5,seed:320});for(let i=0;i<3;i++){const jx=W*0.06+i*W*0.06;box(pt,jx-16,H2*0.3,jx+16,H2*0.355,i%2?C.sage:C.brick,321+i,0.05,0.06);}pt.finish([W*0.03,H2*0.28,W*0.27,H2*0.37],1.8,4,1);box(pt,W*0.2,H2*0.3,W*0.245,H2*0.355,C.woodDk,330,0.05,0.07);pt.finish([W*0.19,H2*0.29,W*0.25,H2*0.37],1.8,3,1);
  const mbx=W*0.42;box(pt,mbx-90,H2*0.1,mbx+90,H2*0.34,[54,58,54],340,0.04,0.06);pt.finish([mbx-100,H2*0.08,mbx+100,H2*0.36],1.9,5,1);ink(pt,[[mbx-90,H2*0.1],[mbx+90,H2*0.1],[mbx+90,H2*0.34],[mbx-90,H2*0.34],[mbx-90,H2*0.1]],2.4,C.woodDk,{alpha:0.5,seed:341});const mc=pt.ctx;mc.save();mc.globalCompositeOperation='screen';mc.strokeStyle='rgba(250,240,222,0.5)';mc.lineWidth=2;for(let i=0;i<4;i++){mc.beginPath();mc.moveTo(mbx-70,H2*0.16+i*H2*0.04);mc.lineTo(mbx+(i%2?30:56),H2*0.16+i*H2*0.04);mc.stroke();}mc.restore();wcText(pt.ctx,'Menu',mbx,H2*0.145,30,'rgb(250,240,222)',{align:'center'});
  fx.lamps=[];[W*0.3,W*0.52,W*0.72].forEach((px,i)=>{ink(pt,[[px,0],[px,H2*0.1]],2.2,C.woodDk,{alpha:0.5,seed:350+i});glow(pt,px,H2*0.13,30,[248,200,110],0.5);pt.wash(deform(circlePts(px,H2*0.13,18,14,10,H.rng(352+i),1,0,Math.PI),H.rng(354+i),2,0.1),[196,120,60],{layers:12,alpha:0.07,amt:0.08,seed:356+i});pt.finish([px-26,H2*0.08,px+26,H2*0.2],1.8,3,1);fx.lamps.push({x:px,y:H2*0.13});});
  ink(pt,[[W*0.16,0],[W*0.16,H2*0.12]],2,C.woodDk,{alpha:0.45,seed:360});box(pt,W*0.14,H2*0.11,W*0.185,H2*0.15,C.woodDk,361,0.05,0.07);pt.finish([W*0.13,H2*0.1,W*0.19,H2*0.16],1.8,3,1);fx.hangPlant={x:W*0.163,y:H2*0.15};
  fillPoly(pt,[[-20,H2*0.76],[W+20,H2*0.76],[W+20,H2+20],[-20,H2+20]],[158,118,82],370,0.1,0.05,18);pt.wet((c,rgba)=>{c.fillStyle=rgba(C.woodDk,0.4);c.beginPath();c.ellipse(W*0.5,H2,W*0.6,H2*0.2,0,0,7);c.fill();});pt.finish([0,H2*0.74,W,H2],2,7,0.92);
  const cy=H2*0.62;fillPoly(pt,[[W*0.2,cy],[W+20,cy-8],[W+20,H2*0.82],[W*0.2,H2*0.82]],C.wood,375,0.06,0.055,20);pt.wet((c,rgba)=>{c.fillStyle=rgba(C.woodDk,0.4);c.beginPath();c.ellipse(W*0.6,H2*0.82,W*0.4,H2*0.08,0,0,7);c.fill();c.fillStyle=rgba([210,160,110],0.4);c.beginPath();c.ellipse(W*0.45,cy+8,W*0.3,10,0,0,7);c.fill();});pt.finish([W*0.18,cy-6,W,H2*0.84],2,6,0.95);ink(pt,[[W*0.2,cy+2],[W,cy-2]],2.6,C.woodDk,{alpha:0.5,seed:377});
  box(pt,W*0.24,cy-70,W*0.285,cy-6,[120,70,58],380,0.05,0.07);box(pt,W*0.248,cy-96,W*0.277,cy-66,[90,52,44],382,0.05,0.08);pt.finish([W*0.23,cy-100,W*0.29,cy],1.8,4,1);ink(pt,[[W*0.24,cy-6],[W*0.24,cy-70],[W*0.285,cy-70],[W*0.285,cy-6]],1.8,C.ink,{alpha:0.4,seed:383});
  espressoMachine(pt,W*0.37,cy-6,0.92);fx.machineSteam={x:W*0.37+48,y:cy-96};
  const px0=W*0.55,px1=W*0.72,py0=cy-54,py1=cy-4;pt.wash(deform(rpoly(px0,py0,px1,py1,0.8),H.rng(390),2,0.04),C.glass,{layers:10,alpha:0.04,amt:0.04,seed:391});pt.finish([px0-6,py0-6,px1+6,py1+6],1.6,4,0.8);dab(pt,px0+26,py1-10,16,9,[214,160,96],392,0.08);dab(pt,px0+60,py1-11,12,11,[196,130,80],394,0.08);dab(pt,px0+92,py1-9,13,8,[220,176,120],396,0.08);dab(pt,px0+122,py1-10,12,9,[200,120,90],398,0.08);pt.finish([px0,py1-26,px1,py1],1.8,3,1);ink(pt,[[px0,py1],[px0,py0],[px1,py0],[px1,py1],[px0,py1]],1.8,C.woodDk,{alpha:0.42,seed:399});const gc=pt.ctx;gc.save();gc.globalCompositeOperation='screen';gc.strokeStyle='rgba(255,255,255,0.22)';gc.lineWidth=2;gc.beginPath();gc.moveTo(px0+8,py0+6);gc.lineTo(px0+8,py1-6);gc.stroke();gc.restore();
  for(let i=0;i<3;i++)dab(pt,W*0.76,cy-18-i*7,14,6,[246,240,230],401+i,0.06);pt.finish([W*0.73,cy-44,W*0.79,cy],1.7,3,1);box(pt,W*0.8,cy-30,W*0.83,cy-4,[214,224,224],405,0.04,0.045);pt.finish([W*0.79,cy-34,W*0.84,cy],1.6,3,0.85);box(pt,W*0.86,cy-26,W*0.9,cy-4,C.sage,408,0.05,0.06);pt.finish([W*0.85,cy-44,W*0.91,cy],1.7,3,1);leafCluster(pt,W*0.88,cy-26,6,22,C.plant,409,true);fx.counterPlant={x:W*0.88,y:cy-26};
  const bar=person(pt,W*0.46,cy-18,0.92,{pose:'barista',lit:'warm',skin:C.skinB,hair:C.hairB,shirt:C.shirtA,apron:true,hairStyle:'bun',mood:'happy'});fx.barista=bar;fx.pitcherSteam={x:bar.hands&&bar.hands[0]?bar.hands[0][0]+4:W*0.5,y:bar.hands&&bar.hands[0]?bar.hands[0][1]-6:cy-70};
  const t1x=W*0.17,t1y=H2*0.8;pt.wash(deform(circlePts(t1x,t1y,86,22,14,H.rng(420),1),H.rng(421),2,0.08),C.woodDk,{layers:16,alpha:0.055,amt:0.06,seed:422});pt.finish([t1x-100,t1y-26,t1x+100,t1y+30],2,5,1);ink(pt,ring(t1x,t1y,86,22),2.2,[70,44,30],{alpha:0.4,close:true,seed:423});ink(pt,[[t1x-30,t1y+14],[t1x-34,t1y+70]],2.2,[70,44,30],{alpha:0.4,seed:424});ink(pt,[[t1x+30,t1y+14],[t1x+34,t1y+70]],2.2,[70,44,30],{alpha:0.4,seed:425});
  const c1=person(pt,t1x,H2*0.74,1.02,{pose:'read',lit:'warm',skin:C.skinA,hair:C.hairC,shirt:C.shirtB,hairStyle:'long',mood:'neutral'});box(pt,t1x-26,H2*0.68,t1x+26,H2*0.72,[236,228,214],430,0.06,0.06);pt.finish([t1x-32,H2*0.67,t1x+32,H2*0.73],1.7,3,1);ink(pt,[[t1x-26,H2*0.68],[t1x+26,H2*0.68],[t1x+26,H2*0.72],[t1x-26,H2*0.72],[t1x-26,H2*0.68]],1.6,C.woodDk,{alpha:0.4,seed:432});ink(pt,[[t1x,H2*0.68],[t1x,H2*0.72]],1.4,C.woodDk,{alpha:0.35,seed:433});cup(pt,t1x+54,t1y-8,1.0,true);fx.cup1={x:t1x+54,y:t1y-8};fx.c1=c1;
  const t2x=W*0.82,t2y=H2*0.74;pt.wash(deform(circlePts(t2x,t2y,70,18,14,H.rng(440),1),H.rng(441),2,0.08),C.woodDk,{layers:14,alpha:0.055,amt:0.06,seed:442});pt.finish([t2x-84,t2y-22,t2x+84,t2y+26],2,5,1);ink(pt,ring(t2x,t2y,70,18),2,[70,44,30],{alpha:0.38,close:true,seed:443});const c2=person(pt,t2x,H2*0.69,0.9,{pose:'relax',lit:'warm',skin:C.skinC,hair:C.hairA,shirt:C.sage,hairStyle:'short',mood:'neutral'});cup(pt,t2x-30,t2y-6,0.9,true);fx.cup2={x:t2x-30,y:t2y-6};fx.c2=c2;
  box(pt,W*0.95,H2*0.84,W*0.995,H2*0.95,C.brick,450,0.05,0.07);pt.finish([W*0.93,H2*0.82,W,H2*0.97],1.9,5,1);fx.floorPlant={x:W*0.972,y:H2*0.84};
  fx.eyes=[];[c1,c2,bar].forEach((pp,i)=>{if(pp&&pp.eyes)pp.eyes.forEach(e=>fx.eyes.push({x:e[0],y:e[1],r:e[2],skin:pp.skin,phase:i*2.1+Math.random()*3}));});
  fx.lightSourceRays=fx.lightSource;fx.warm=true;
  fx.cam={z0:1.0,z1:1.07,px:-18,py:8,cx:W*0.5,cy:H2*0.44};
}

/* ---------- SCENE 4: coffee close-up ---------- */
function buildCoffee(pt,W,H2,fx){
  const C=WARM;
  fillPoly(pt,[[-20,-20],[W+20,-20],[W+20,H2+20],[-20,H2+20]],[228,192,144],401,0.08,0.045,20);
  glow(pt,W*0.5,H2*0.36,W*0.42,[248,208,120],0.5);
  const cy=H2*0.92;fillPoly(pt,[[-20,cy],[W+20,cy-6],[W+20,H2+20],[-20,H2+20]],C.wood,430,0.06,0.05,16);pt.finish([0,cy-6,W,H2],1.8,5,0.9);ink(pt,[[0,cy+3],[W,cy+1]],2.2,C.woodDk,{alpha:0.4,seed:432});
  // grinder with beans (left)
  const gx=W*0.16;box(pt,gx-40,cy-150,gx+40,cy-6,[120,70,58],434,0.05,0.06);box(pt,gx-26,cy-196,gx+26,cy-150,[150,96,70],436,0.05,0.06);// hopper
  pt.wet((c,rgba)=>{c.fillStyle=rgba([70,44,36],0.5);for(let i=0;i<12;i++){c.beginPath();c.ellipse(gx-18+((i*37)%40),cy-188+((i*53)%26),5,3.5,i,0,7);c.fill();}});// beans in hopper
  pt.finish([gx-48,cy-204,gx+48,cy],1.9,5,1);ink(pt,[[gx-40,cy-6],[gx-40,cy-150],[gx+40,cy-150],[gx+40,cy-6]],2,C.ink,{alpha:0.42,seed:437});
  // scattered beans on counter
  const br=H.rng(440);const beanC=pt.ctx;beanC.save();beanC.globalCompositeOperation='multiply';for(let i=0;i<10;i++){beanC.fillStyle=H.rgba([84,52,40],0.5);beanC.beginPath();beanC.ellipse(gx+ br.range(20,120),cy-6+br.range(-6,8),6,4,br.range(0,3),0,7);beanC.fill();}beanC.restore();
  // big group head (center)
  const cx=W*0.52,gTop=H2*0.08,gH=H2*0.26,gw=W*0.34;
  box(pt,cx-gw/2,gTop,cx+gw/2,gTop+gH,[206,168,114],441,0.05,0.055);box(pt,cx-gw*0.3,gTop+gH-8,cx+gw*0.3,gTop+gH+44,[218,184,126],443,0.05,0.06);pt.wet((c,rgba)=>{c.fillStyle=rgba([250,240,210],0.5);c.beginPath();c.ellipse(cx-gw*0.18,gTop+gH*0.4,gw*0.12,gH*0.3,0,0,7);c.fill();});pt.finish([cx-gw/2-10,gTop-10,cx+gw/2+10,gTop+gH+64],1.8,5,1);
  ink(pt,[[cx-gw/2,gTop+gH],[cx-gw/2,gTop],[cx+gw/2,gTop],[cx+gw/2,gTop+gH]],2.6,[120,78,54],{alpha:0.42,seed:450});
  const pfY=gTop+gH+52;pt.wash(deform(circlePts(cx,pfY,gw*0.2,16,10,H.rng(451),1),H.rng(452),2,0.06),[150,120,96],{layers:12,alpha:0.06,amt:0.06,seed:453});box(pt,cx+gw*0.18,pfY-9,cx+gw*0.56,pfY+9,[66,52,48],454,0.06,0.07);pt.finish([cx-gw*0.26,pfY-24,cx+gw*0.6,pfY+26],1.8,4,1);ink(pt,ring(cx,pfY,gw*0.2,16),2,[110,86,70],{alpha:0.45,close:true,seed:455});ink(pt,[[cx+gw*0.18,pfY-9],[cx+gw*0.56,pfY-9],[cx+gw*0.56,pfY+9],[cx+gw*0.18,pfY+9]],2.2,[60,48,46],{alpha:0.5,seed:456});
  // cup catching the shot
  const cupTopW=W*0.09,cupY=cy-104;fillPoly(pt,[[cx-cupTopW,cupY,0.9],[cx+cupTopW,cupY,0.9],[cx+cupTopW*0.74,cupY+100,1],[cx-cupTopW*0.74,cupY+100,1]],[252,248,241],457,0.06,0.06,16);pt.wet((c,rgba)=>{c.fillStyle=rgba([182,120,86],0.28);c.beginPath();c.ellipse(cx+cupTopW*0.45,cupY+56,cupTopW*0.5,66,0,0,7);c.fill();});pt.finish([cx-cupTopW*1.35,cupY-18,cx+cupTopW*1.35,cupY+112],2,5,1);ink(pt,ring(cx,cupY,cupTopW*0.9,cupTopW*0.3),2,[120,78,56],{alpha:0.42,close:true,seed:458});ink(pt,[[cx-cupTopW,cupY],[cx-cupTopW*0.74,cupY+100],[cx+cupTopW*0.74,cupY+100],[cx+cupTopW,cupY]],2.4,[120,78,56],{alpha:0.46,seed:459});const hc=pt.ctx;hc.save();hc.globalCompositeOperation='multiply';hc.strokeStyle=H.rgba([120,78,56],0.44);hc.lineWidth=7;hc.lineCap='round';hc.beginPath();hc.arc(cx+cupTopW+4,cupY+48,24,-1,1);hc.stroke();hc.restore();hc.save();hc.globalCompositeOperation='source-over';hc.strokeStyle='rgba(255,252,246,0.5)';hc.lineWidth=2.4;hc.beginPath();hc.ellipse(cx-cupTopW*0.2,cupY,cupTopW*0.55,cupTopW*0.2,0,Math.PI*1.05,Math.PI*1.75);hc.stroke();hc.restore();
  fx.pour={cx,spoutY:pfY+12,cupY,cupTopW};fx.coffeeSteam=[{x:cx,y:cupY-cupTopW*0.3,h:90}];
  // milk pitcher (right) near steam wand
  const mpx=W*0.82,mpy=cy-70;fillPoly(pt,[[mpx-34,mpy,0.9],[mpx+30,mpy,0.9],[mpx+24,mpy+70,1],[mpx-28,mpy+70,1]],[236,236,240],460,0.06,0.05,14);fillPoly(pt,[[mpx-34,mpy,0.9],[mpx-12,mpy-18,0.8],[mpx+2,mpy-14,0.8],[mpx-10,mpy+4,0.9]],[236,236,240],462,0.06,0.05,10);// spout
  pt.finish([mpx-44,mpy-24,mpx+44,mpy+78],1.9,5,1);ink(pt,[[mpx-34,mpy],[mpx-28,mpy+70],[mpx+24,mpy+70],[mpx+30,mpy]],2.2,[120,120,130],{alpha:0.45,seed:461});ink(pt,[[mpx-34,mpy],[mpx-12,mpy-18],[mpx+2,mpy-14]],2,[120,120,130],{alpha:0.4,seed:463});
  const mc=pt.ctx;mc.save();mc.globalCompositeOperation='multiply';mc.strokeStyle=H.rgba([120,120,130],0.42);mc.lineWidth=5;mc.lineCap='round';mc.beginPath();mc.arc(mpx+30+6,mpy+34,10,-1,1);mc.stroke();mc.restore();
  fx.pitcherSteam2={x:mpx-6,y:mpy-14};
  // note card (lower) — text revealed live
  const nx=W*0.75,ny=H2*0.84,nw=W*0.3,nh=H2*0.17;box(pt,nx-nw/2,ny-nh/2,nx+nw/2,ny+nh/2,[252,248,238],470,0.05,0.06);pt.finish([nx-nw/2-10,ny-nh/2-10,nx+nw/2+10,ny+nh/2+10],2.2,5,1);ink(pt,[[nx-nw/2,ny-nh/2],[nx+nw/2,ny-nh/2],[nx+nw/2,ny+nh/2],[nx-nw/2,ny+nh/2],[nx-nw/2,ny-nh/2]],2.2,[198,150,100],{alpha:0.4,seed:471});fx.note={x:nx,y:ny+8};
  fx.warm=true;fx.cam={z0:1.0,z1:1.06,px:0,py:-10,cx:W*0.5,cy:H2*0.5};
}

/* ---------- live FX library ---------- */
const FX={
  steam(ctx,x,y,h,t,seed,strength){const r=H.rng(seed);ctx.save();ctx.globalCompositeOperation='source-over';for(let i=0;i<5;i++){const prog=((t*0.4+i*0.2+r()*0.3)%1);const yy=y-prog*h;const sway=Math.sin(t*1.5+i*1.2+seed)*12;const w=(9+i*4+prog*10);const a=(strength||0.3)*(1-prog)*Math.min(1,prog*4);ctx.fillStyle='rgba(255,250,243,'+a+')';ctx.beginPath();ctx.ellipse(x+sway,yy,w,h*0.12,Math.sin(t+i)*0.3,0,7);ctx.fill();}ctx.restore();},
  sway(ctx,anchor,t,up,n,len,col,seed){const r=H.rng(seed);ctx.save();ctx.globalCompositeOperation='multiply';for(let i=0;i<n;i++){const base=(up?-Math.PI/2:Math.PI/2);const a=base+(i/(n-1)-0.5)*2.0+Math.sin(t*0.9+i*0.6+seed)*0.12;const l=len*(0.6+((i*37)%10)/10*0.5);const ex=anchor.x+Math.cos(a)*l,ey=anchor.y+Math.sin(a)*l;const w=len*0.14;ctx.fillStyle='rgba('+col[0]+','+col[1]+','+col[2]+',0.5)';ctx.beginPath();ctx.moveTo(anchor.x,anchor.y);ctx.quadraticCurveTo((anchor.x+ex)/2-Math.sin(a)*w,(anchor.y+ey)/2+Math.cos(a)*w,ex,ey);ctx.quadraticCurveTo((anchor.x+ex)/2+Math.sin(a)*w,(anchor.y+ey)/2-Math.cos(a)*w,anchor.x,anchor.y);ctx.fill();}ctx.restore();},
  rays(ctx,src,W,Hh,t){ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<5;i++){const a=0.9+i*0.12,sh=Math.sin(t*0.6+i)*0.04,op=(0.05+0.03*Math.sin(t*0.8+i*1.3));ctx.globalAlpha=op;const g=ctx.createLinearGradient(src.x,src.y,src.x+Math.cos(a+sh)*W,src.y+Math.sin(a+sh)*Hh);g.addColorStop(0,'rgba(255,244,206,0.9)');g.addColorStop(1,'rgba(255,244,206,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(src.x-30,src.y);ctx.lineTo(src.x+30,src.y);ctx.lineTo(src.x+Math.cos(a+sh)*W+120,src.y+Math.sin(a+sh)*Hh);ctx.lineTo(src.x+Math.cos(a+sh)*W-120,src.y+Math.sin(a+sh)*Hh);ctx.closePath();ctx.fill();}ctx.restore();},
  dust(ctx,src,W,Hh,t,seed){const r=H.rng(seed||7);ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<40;i++){const bx=src.x+(r()-0.2)*W*0.5,by=r()*Hh*0.5;const drift=Math.sin(t*0.5+i)*14;const yy=((t*8+i*20)%(Hh*0.5));const x=bx+drift,a=0.12*(0.4+0.6*Math.abs(Math.sin(t+i)));ctx.fillStyle='rgba(255,248,224,'+a+')';ctx.beginPath();ctx.arc(x,src.y+ (by+yy)%(Hh*0.5)-Hh*0.2,1.1+(i%3)*0.5,0,7);ctx.fill();}ctx.restore();},
  blinks(ctx,eyes,t){ctx.save();ctx.globalCompositeOperation='source-over';eyes.forEach(e=>{const cyc=(t+e.phase)%4.0;if(cyc<0.14){const k=1-Math.abs(cyc-0.07)/0.07;ctx.fillStyle='rgba('+e.skin[0]+','+e.skin[1]+','+e.skin[2]+',0.98)';ctx.beginPath();ctx.ellipse(e.x,e.y,e.r*1.25,e.r*1.25*k,0,0,7);ctx.fill();}});ctx.restore();},
  lampPulse(ctx,lamps,t){ctx.save();ctx.globalCompositeOperation='screen';lamps.forEach((l,i)=>{const a=0.1+0.05*Math.sin(t*1.1+i);ctx.globalAlpha=a;const g=ctx.createRadialGradient(l.x,l.y,2,l.x,l.y,70);g.addColorStop(0,'rgba(255,216,140,1)');g.addColorStop(1,'rgba(255,216,140,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(l.x,l.y,70,0,7);ctx.fill();});ctx.restore();},
  winGlow(ctx,wins,t){ctx.save();ctx.globalCompositeOperation='screen';wins.forEach((wgn,i)=>{const a=0.08+0.05*Math.sin(t*0.9+i*1.7);ctx.globalAlpha=a;const g=ctx.createRadialGradient(wgn.x,wgn.y,4,wgn.x,wgn.y,wgn.r);g.addColorStop(0,'rgba(255,214,130,1)');g.addColorStop(1,'rgba(255,214,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(wgn.x,wgn.y,wgn.r,0,7);ctx.fill();});ctx.restore();},
  rainFall(ctx,W,Hh,t,n,seed,strong,fade){const r=H.rng(seed||9);const a=fade==null?1:fade;ctx.save();ctx.globalCompositeOperation='multiply';ctx.lineCap='round';for(let i=0;i<n;i++){const bx=r.range(0,W),speed=r.range(520,920),len=r.range(10,22)*(strong?1.4:1),ph=r()*(Hh+40);let y=((ph+t*speed)%(Hh+40))-20;const x=bx-(y*0.3);ctx.strokeStyle='rgba(150,168,190,'+((0.1+r()*0.14)*a)+')';ctx.lineWidth=0.8+r()*1.0;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-len*0.35,y+len);ctx.stroke();}ctx.restore();},
  rainGlass(ctx,rect,t,seed){const r=H.rng(seed||5);const w=rect.x1-rect.x0,h=rect.y1-rect.y0;ctx.save();ctx.beginPath();ctx.rect(rect.x0,rect.y0,w,h);ctx.clip();ctx.globalCompositeOperation='multiply';ctx.lineCap='round';for(let i=0;i<40;i++){const bx=rect.x0+r()*w,speed=r.range(30,90)+ (i%5)*20,ph=r()*h;let y=rect.y0+((ph+t*speed)%h);const wob=Math.sin(y*0.1+i)*2;ctx.strokeStyle='rgba(150,170,196,'+(0.14+r()*0.12)+')';ctx.lineWidth=1+r()*1.4;ctx.beginPath();ctx.moveTo(bx+wob,y);ctx.lineTo(bx+wob+Math.sin(i)*1.5,y+ r.range(8,20));ctx.stroke();}
    // a few beading droplets
    for(let i=0;i<10;i++){const bx=rect.x0+ ((i*83)%w),y=rect.y0+ ((t*(20+i*6)+i*47)%h);ctx.fillStyle='rgba(180,198,220,0.3)';ctx.beginPath();ctx.arc(bx,y,1.6+ (i%3),0,7);ctx.fill();}ctx.restore();},
  ripples(ctx,pts,t){ctx.save();ctx.globalCompositeOperation='screen';pts.forEach((p,i)=>{for(let k=0;k<2;k++){const ph=((t*0.8+i*0.37+k*0.5)%1);const rr=6+ph*26;ctx.globalAlpha=0.18*(1-ph);ctx.strokeStyle='rgba(200,214,232,1)';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(p.x,p.y,rr,rr*0.32,0,0,7);ctx.stroke();}});ctx.restore();},
  clouds(ctx,clouds,W,t){ctx.save();ctx.globalCompositeOperation='screen';clouds.forEach((cl,i)=>{const x=((cl.x+t*cl.v)% (W+400))-200;ctx.globalAlpha=0.06;const g=ctx.createRadialGradient(x,cl.y,10,x,cl.y,cl.r);g.addColorStop(0,'rgba(220,228,240,1)');g.addColorStop(1,'rgba(220,228,240,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,cl.y,cl.r,cl.r*0.5,0,0,7);ctx.fill();});ctx.restore();},
  walkers(ctx,walkers,t){ctx.save();walkers.forEach((wk,i)=>{const cyc=((t*0.06*wk.dir + i*0.3)%1);const x=wk.base + wk.dir*(cyc-0.5)*wk.amp*2;const bob=Math.sin(t*4+i)*2;drawMiniWalker(ctx,x,wk.y+bob,wk.s,wk.dir,wk.coat,wk.umb);});ctx.restore();},
  car(ctx,W,info,t){const cyc=((t*0.1)%1.6)/1.6;const x=-200+cyc*(W+400);const y=info.y;ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgba(70,80,104,0.55)';
    ctx.beginPath();ctx.moveTo(x-70,y);ctx.lineTo(x-50,y-28);ctx.lineTo(x+20,y-32);ctx.lineTo(x+40,y-12);ctx.lineTo(x+70,y-10);ctx.lineTo(x+70,y);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(40,44,60,0.6)';ctx.beginPath();ctx.arc(x-40,y,11,0,7);ctx.arc(x+44,y,11,0,7);ctx.fill();ctx.restore();
    // headlight glow + reflection
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=0.5;const g=ctx.createRadialGradient(x+70,y-8,2,x+70,y-8,60);g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x+70,y-8,60,0,7);ctx.fill();ctx.globalAlpha=0.25;ctx.beginPath();ctx.ellipse(x+70,y+40,50,16,0,0,7);ctx.fill();ctx.restore();},
  pour(ctx,p,t,t0){const grow=H.clamp((t-t0)/0.5),flick=0.85+0.15*Math.sin(t*40);const endY=p.cupY-p.cupTopW*0.24,curY=p.spoutY+(endY-p.spoutY)*grow;ctx.save();ctx.globalCompositeOperation='multiply';[-15,15].forEach(dx=>{ctx.strokeStyle='rgba(84,48,30,'+(0.82*flick)+')';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.cx+dx,p.spoutY);ctx.lineTo(p.cx+dx*0.8,curY);ctx.stroke();});const fill=H.clamp((t-t0-0.3)/1.2);ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(150,96,56,'+(0.55*fill)+')';ctx.beginPath();ctx.ellipse(p.cx,p.cupY,p.cupTopW*0.86*Math.max(0.3,fill),p.cupTopW*0.26*Math.max(0.3,fill),0,0,7);ctx.fill();ctx.fillStyle='rgba(214,152,92,'+(0.4*fill)+')';ctx.beginPath();ctx.ellipse(p.cx-10,p.cupY-3,p.cupTopW*0.3*fill,p.cupTopW*0.08*fill,0,0,7);ctx.fill();ctx.restore();},
  rosetta(ctx,cx,cy,rr,prog){if(prog<=0)return;ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='blur(0.6px)';ctx.lineCap='round';ctx.lineJoin='round';const col=a=>'rgba(250,246,238,'+a+')';const stemP=H.clamp(prog/0.4);ctx.strokeStyle=col(0.9);ctx.lineWidth=rr*0.1;ctx.beginPath();ctx.moveTo(cx,cy-rr*0.82);ctx.lineTo(cx,cy-rr*0.82+rr*1.68*stemP);ctx.stroke();const leafP=H.clamp((prog-0.3)/0.7),nLeaf=6;for(let i=0;i<nLeaf;i++){const vis=H.clamp(leafP*nLeaf-i);if(vis<=0)break;for(let side=-1;side<=1;side+=2){const yy=cy-rr*0.58+i*rr*0.26,span=rr*(0.46-i*0.055)*vis;ctx.strokeStyle=col(0.85);ctx.lineWidth=rr*0.085;ctx.beginPath();ctx.moveTo(cx+side*rr*0.04,yy-rr*0.06);ctx.quadraticCurveTo(cx+side*span*0.7,yy-rr*0.02,cx+side*span,yy+rr*0.14);ctx.stroke();}}ctx.restore();},
  brighten(ctx,W,Hh,k){if(k<=0)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=0.26*k;const g=ctx.createRadialGradient(W*0.5,Hh*0.46,10,W*0.5,Hh*0.5,Math.hypot(W,Hh)*0.6);g.addColorStop(0,'rgba(255,244,214,1)');g.addColorStop(1,'rgba(255,244,214,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,Hh);ctx.restore();ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=0.1*k;ctx.fillStyle='rgba(227,169,43,1)';ctx.fillRect(0,0,W,Hh);ctx.restore();},
  grade(ctx,W,Hh,col,a){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=a;ctx.fillStyle='rgba('+col[0]+','+col[1]+','+col[2]+',1)';ctx.fillRect(0,0,W,Hh);ctx.restore();},
  clockShake(ctx,plate,clock,t){/* handled by camera-independent redraw not available; placeholder */}
};
function drawMiniWalker(ctx,x,y,s,dir,coat,umb){ctx.save();ctx.globalCompositeOperation='multiply';
  ctx.fillStyle='rgba('+coat[0]+','+coat[1]+','+coat[2]+',0.6)';
  ctx.beginPath();ctx.moveTo(x-16*s,y-44*s);ctx.lineTo(x+16*s,y-44*s);ctx.lineTo(x+20*s,y,x-20*s,y);ctx.lineTo(x-20*s,y);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x,y-58*s,11*s,0,7);ctx.fill();
  ctx.fillStyle='rgba('+umb[0]+','+umb[1]+','+umb[2]+',0.6)';ctx.beginPath();ctx.moveTo(x-34*s,y-70*s);ctx.quadraticCurveTo(x,y-94*s,x+34*s,y-70*s);ctx.quadraticCurveTo(x,y-78*s,x-34*s,y-70*s);ctx.fill();
  ctx.strokeStyle='rgba(60,64,84,0.5)';ctx.lineWidth=1.6*s;ctx.beginPath();ctx.moveTo(x,y-74*s);ctx.lineTo(x,y-40*s);ctx.stroke();ctx.restore();}

/* ---------- SCENE 5: brighter day = café + foreground sipping customer ---------- */
function buildBrighter(pt,W,H2,fx){
  buildCafe(pt,W,H2,fx);
  // prominent, clearly-posed foreground customer lifting the cup, warm & smiling
  const f=person(pt,W*0.3,H2*1.0,1.16,{pose:'sip',lit:'warm',skin:WARM.skinA,hair:WARM.hairC,shirt:WARM.gold,hairStyle:'long',mood:'happy'});
  const hx=f.hands&&f.hands[0]?f.hands[0][0]:W*0.33,hy=f.hands&&f.hands[0]?f.hands[0][1]:H2*0.66;
  cup(pt,hx,hy,1.05,true);
  fx.foreSteam={x:hx,y:hy-14};
  if(fx.eyes&&f.eyes)f.eyes.forEach(e=>fx.eyes.push({x:e[0],y:e[1],r:e[2],skin:f.skin,phase:Math.random()*3}));
  fx.cam={z0:1.04,z1:1.0,px:10,py:0,cx:W*0.45,cy:H2*0.5};
}
window.SCN={WARM,COOL,FX,person,cup,
  build:{bedroom:buildBedroom,street:buildStreet,cafe:buildCafe,coffee:buildCoffee,brighter:buildBrighter}};
})();
