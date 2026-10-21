/* ===================== SCENES (static plate + fx spec) ===================== */
(function(){
const WC=window.WC,H=WC.H,P=WC.P,deform=WC.deform,circlePts=WC.circlePts,rpoly=WC.rpoly;
const COOL={coat:[74,88,116],skin:[182,184,198],sky:[120,138,162],deep:[46,56,86],slate:[96,110,134],pud:[120,138,160],hair:[70,70,86],pant:[54,64,92],ink:[40,48,90]};
const WARM={coat:[118,74,64],skin:[228,184,152],brick:[169,70,45],brickDeep:[122,44,29],gold:[227,169,43],sage:[92,105,83],cream:[250,240,222],wood:[150,96,60],deepwood:[104,64,40],hair:[96,62,44],pant:[96,60,52],ink:[96,50,34]};
const SCARF=[219,164,52];
function qp(a){return a.map(p=>P(p[0],p[1],p[2]==null?1:p[2]));}
function ring(cx,cy,rx,ry,n=26){const o=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2;o.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return o;}
function ink(pt,pts,w,col,o={}){const alpha=o.alpha==null?0.55:o.alpha,close=o.close,r=H.rng(o.seed||7),c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.lineJoin='round';c.lineCap='round';for(let p=0;p<2;p++){c.strokeStyle=H.rgba(col,alpha*(p?0.5:1));c.lineWidth=w*(p?0.55:1);c.beginPath();pts.forEach((q,i)=>{const x=q[0]+r.gauss()*(w*0.35+0.5),y=q[1]+r.gauss()*(w*0.35+0.5);i?c.lineTo(x,y):c.moveTo(x,y);});if(close)c.closePath();c.stroke();}c.restore();}
function dab(pt,x,y,rx,ry,col,seed,a=0.08){pt.wash(deform(circlePts(x,y,rx,ry,10,H.rng(seed),1),H.rng(seed+1),2,0.12),col,{layers:12,alpha:a,amt:0.1,seed:seed+2});}
function bgBand(pt,x0,y0,x1,y1,col,seed,amt=0.14){pt.wash(deform(qp([[x0,y0+(y1-y0)*0.16,1.3],[(x0+x1)/2,y0-6,1.0],[x1,y0+(y1-y0)*0.12,1.3],[x1,y1,1.2],[(x0+x1)/2,y1+6,1.0],[x0,y1,1.3]]),H.rng(seed),3,amt),col,{layers:20,alpha:0.05,amt:0.14,seed:seed+1});}
function glow(pt,x,y,r0,col,a){const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.filter='blur(20px)';c.fillStyle=H.rgba(col,a);c.beginPath();c.arc(x,y,r0,0,7);c.fill();c.restore();}
function lightSpill(pt,x,y,w,h,col,a){const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.filter='blur(10px)';c.fillStyle=H.rgba(col,a);c.beginPath();c.moveTo(x-w*0.3,y);c.lineTo(x+w*0.3,y);c.lineTo(x+w,y+h);c.lineTo(x-w,y+h);c.closePath();c.fill();c.restore();}
function splat(pt,x,y,seed,cols){const r=H.rng(seed),c=pt.ctx;c.save();c.globalCompositeOperation='multiply';for(let i=0;i<20;i++){const col=r.pick(cols),d=Math.abs(r.gauss())*58,ang=r.range(0,7);const px=x+Math.cos(ang)*d+r.gauss()*10,py=y+Math.sin(ang)*d*0.7+r.gauss()*8,rr=Math.pow(r(),3)*4+0.6;c.fillStyle=H.rgba(col,0.2+r()*0.3);c.beginPath();c.arc(px,py,rr,0,7);c.fill();}c.restore();}

/* ---- illustrated face (expressive) ---- */
function face(pt,hx,hy,s,lit,mood){
  const ikc=lit==='warm'?WARM.ink:COOL.ink;const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';
  const ey=hy+3*s,ex=10*s,happy=mood==='happy',sad=mood==='sad';
  // cheeks
  if(happy||lit==='warm'){c.fillStyle=H.rgba([226,138,110],0.26);c.beginPath();c.ellipse(hx-ex-3*s,ey+11*s,6.5*s,4*s,0,0,7);c.ellipse(hx+ex+3*s,ey+11*s,6.5*s,4*s,0,0,7);c.fill();}
  c.lineCap='round';
  if(happy){c.strokeStyle=H.rgba(ikc,0.8);c.lineWidth=2.4*s;c.beginPath();c.arc(hx-ex,ey+3*s,5.2*s,Math.PI*1.12,Math.PI*1.95);c.moveTo(hx+ex+5*s*Math.cos(Math.PI*1.05),ey+3*s+5.2*s*Math.sin(Math.PI*1.05));c.arc(hx+ex,ey+3*s,5.2*s,Math.PI*1.05,Math.PI*1.88);c.stroke();}
  else{c.fillStyle='rgba(250,248,244,0.92)';c.beginPath();c.ellipse(hx-ex,ey,4.4*s,5*s,0,0,7);c.ellipse(hx+ex,ey,4.4*s,5*s,0,0,7);c.fill();
    c.fillStyle=H.rgba(ikc,0.86);c.beginPath();c.arc(hx-ex,ey+(sad?1.4*s:0),2.5*s,0,7);c.arc(hx+ex,ey+(sad?1.4*s:0),2.5*s,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,0.92)';c.beginPath();c.arc(hx-ex-1.2*s,ey-1.4*s,1*s,0,7);c.arc(hx+ex-1.2*s,ey-1.4*s,1*s,0,7);c.fill();}
  // brows
  c.strokeStyle=H.rgba(ikc,0.62);c.lineWidth=1.9*s;c.beginPath();
  if(sad){c.moveTo(hx-ex-6*s,ey-9*s);c.lineTo(hx-ex+3*s,ey-5*s);c.moveTo(hx+ex+6*s,ey-9*s);c.lineTo(hx+ex-3*s,ey-5*s);}
  else if(happy){c.moveTo(hx-ex-5*s,ey-8*s);c.quadraticCurveTo(hx-ex,ey-11*s,hx-ex+5*s,ey-7*s);c.moveTo(hx+ex-5*s,ey-7*s);c.quadraticCurveTo(hx+ex,ey-11*s,hx+ex+5*s,ey-8*s);}
  else{c.moveTo(hx-ex-5*s,ey-8*s);c.lineTo(hx-ex+4*s,ey-8*s);c.moveTo(hx+ex-4*s,ey-8*s);c.lineTo(hx+ex+5*s,ey-8*s);}
  c.stroke();
  // nose
  c.strokeStyle=H.rgba(ikc,0.38);c.lineWidth=1.5*s;c.beginPath();c.moveTo(hx+1*s,ey+5*s);c.lineTo(hx-2*s,ey+11*s);c.lineTo(hx+1.6*s,ey+12*s);c.stroke();
  // mouth
  c.strokeStyle=H.rgba(happy?[150,70,60]:ikc,0.62);c.lineWidth=2.3*s;c.beginPath();
  if(happy){c.moveTo(hx-9*s,ey+18*s);c.quadraticCurveTo(hx,ey+27*s,hx+9*s,ey+18*s);}
  else if(sad){c.moveTo(hx-8*s,ey+23*s);c.quadraticCurveTo(hx,ey+18*s,hx+8*s,ey+23*s);}
  else{c.moveTo(hx-7*s,ey+20*s);c.quadraticCurveTo(hx,ey+22*s,hx+7*s,ey+20*s);}
  c.stroke();c.restore();
}

/* ---- character ---- */
function figure(pt,x,y,s,lit,opts){
  opts=opts||{};const C=lit==='warm'?WARM:COOL,coat=C.coat,skin=C.skin,pant=C.pant,ikc=C.ink,dark=C.deep||coat,hair=opts.hood?coat:C.hair;
  const lean=(opts.lean||0)*s,seated=!!opts.seated;
  const hipY=seated?y-6*s:y-152*s,shoY=hipY-98*s,hcx=x+lean+(opts.hx||0)*s;
  const headR=33*s,headCY=shoY-50*s,headCX=hcx+(opts.sad?5*s:0);
  const sed=((x*7+y*11+(opts.walk?3:0)+(seated?5:0))|0)>>>0||1;
  if(!seated){const sp=opts.walk?30*s:15*s,fb=opts.walk?24*s:0;[[-1,-fb],[1,fb]].forEach(([d,off],k)=>{pt.wash(deform(qp([[x+d*sp+off-11*s,hipY,0.9],[x+d*sp+off+11*s,hipY,0.9],[x+d*14*s+off+9*s,y,1],[x+d*14*s+off-9*s,y,1]]),H.rng(sed+k),3,0.1),pant,{layers:14,alpha:0.06,amt:0.1,seed:sed+20+k});pt.wash(deform(qp([[x+d*14*s+off-12*s,y-7*s,0.9],[x+d*14*s+off+17*s,y-7*s,0.9],[x+d*14*s+off+17*s,y+6*s,1],[x+d*14*s+off-12*s,y+6*s,1]]),H.rng(sed+40+k),2,0.1),[52,48,58],{layers:10,alpha:0.08,amt:0.1,seed:sed+45+k});});}
  const hem=seated?y:hipY+34*s;
  const body=qp([[hcx-45*s,shoY-4*s,0.9],[hcx+45*s,shoY-4*s,0.9],[x+52*s+lean*0.6,hipY,1],[x+41*s,hem,1.1],[x-41*s,hem,1.1],[x-52*s+lean*0.6,hipY,1]]);
  pt.wash(deform(body,H.rng(sed+3),3,0.1),coat,{layers:24,alpha:0.055,amt:0.09,seed:sed+4});
  const arm=(p0,p1,p2,sd)=>pt.wash(deform(qp([[p0[0]-10*s,p0[1],0.8],[p0[0]+10*s,p0[1],0.8],[p1[0]+9*s,p1[1],0.8],[p2[0]+8*s,p2[1],0.9],[p2[0]-8*s,p2[1],0.9],[p1[0]-9*s,p1[1],0.8]]),H.rng(sd),3,0.1),coat,{layers:16,alpha:0.06,amt:0.1,seed:sd+1});
  if(opts.armRaise)arm([hcx+32*s,shoY+4*s],[hcx+66*s,shoY-30*s],[hcx+84*s,shoY-74*s],sed+10);
  else if(opts.holdCup)arm([hcx+28*s,shoY+10*s],[hcx+54*s,shoY+36*s],[headCX+20*s,headCY+30*s],sed+10);
  else if(opts.walk)arm([hcx+28*s,shoY+8*s],[hcx+62*s,shoY+30*s],[hcx+76*s,shoY+64*s],sed+10);
  else arm([hcx+30*s,shoY+6*s],[hcx+40*s,shoY+54*s],[hcx+34*s,hem-18*s],sed+10);
  pt.wash(deform(qp([[headCX-9*s,headCY+22*s,0.8],[headCX+9*s,headCY+22*s,0.8],[headCX+11*s,shoY+2*s,0.9],[headCX-11*s,shoY+2*s,0.9]]),H.rng(sed+5),2,0.1),skin,{layers:12,alpha:0.06,amt:0.08,seed:sed+6});
  pt.wash(deform(circlePts(headCX,headCY,headR,headR*1.08,14,H.rng(sed+7),1),H.rng(sed+8),2,0.07),skin,{layers:18,alpha:0.06,amt:0.07,seed:sed+9});
  pt.wash(deform(circlePts(headCX,headCY-7*s,headR*1.04,headR*0.95,12,H.rng(sed+11),1,Math.PI*0.92,Math.PI*2.28),H.rng(sed+12),2,0.1),hair,{layers:14,alpha:0.07,amt:0.09,seed:sed+13});
  pt.wash(deform(qp([[headCX-29*s,shoY-2*s,0.8],[headCX+29*s,shoY-2*s,0.8],[headCX+25*s,shoY+22*s,0.9],[headCX-25*s,shoY+22*s,0.9]]),H.rng(sed+14),2,0.1),SCARF,{layers:14,alpha:0.075,amt:0.1,seed:sed+15});
  pt.wet((c,rgba)=>{c.fillStyle=rgba(dark,0.4);c.beginPath();c.ellipse(x+(lit==='warm'?-20:20)*s,(shoY+hem)/2,38*s,(hem-shoY)*0.52,0,0,7);c.fill();c.fillStyle=rgba(lit==='warm'?[236,170,130]:[150,160,182],0.3);c.beginPath();c.ellipse(headCX+(lit==='warm'?9:-9)*s,headCY+9*s,14*s,17*s,0,0,7);c.fill();});
  pt.finish([x-95*s,headCY-headR-18*s,x+100*s,y+12*s],2.0,6,1);
  ink(pt,ring(headCX,headCY,headR,headR*1.08),2.1*s,ikc,{alpha:0.5,close:true,seed:sed+30});
  ink(pt,[[hcx-45*s,shoY-2*s],[x-52*s+lean*0.6,hipY],[x-41*s,hem]],2.3*s,ikc,{alpha:0.5,seed:sed+31});
  ink(pt,[[hcx+45*s,shoY-2*s],[x+52*s+lean*0.6,hipY],[x+41*s,hem]],2.3*s,ikc,{alpha:0.5,seed:sed+32});
  ink(pt,[[headCX-29*s,shoY+2*s],[headCX+29*s,shoY+2*s]],2.1*s,SCARF,{alpha:0.5,seed:sed+33});
  face(pt,headCX,headCY,s,lit,opts.happy?'happy':opts.sad?'sad':'neutral');
  return{headCX,headCY,shoY,hem,hcx,headR};
}

/* ---- refined hero cup (side view) ---- */
function cup(pt,x,y,s,warm,o={}){
  const C=warm?WARM:COOL,body=warm?[252,248,241]:[242,243,248],ikc=warm?[120,78,56]:[70,80,110];
  const topW=58*s,botW=44*s,h=60*s;
  // cast shadow
  pt.wet((c,rgba)=>{c.fillStyle=rgba(warm?[150,110,80]:[90,98,120],0.22);c.beginPath();c.ellipse(x+10*s,y+h+16*s,topW*1.5,12*s,0,0,7);c.fill();});
  if(o.saucer){pt.wash(deform(qp([[x-topW*1.8,y+h+4*s,1],[x+topW*1.8,y+h+4*s,1],[x+topW*1.2,y+h+22*s,1],[x-topW*1.2,y+h+22*s,1]]),H.rng(901),2,0.07),warm?[246,238,226]:[226,230,238],{layers:12,alpha:0.055,amt:0.08,seed:902});}
  pt.wash(deform(qp([[x-topW,y,0.9],[x+topW,y,0.9],[x+botW,y+h,1],[x-botW,y+h,1]]),H.rng(903),2,0.06),body,{layers:16,alpha:0.06,amt:0.06,seed:904});
  // ceramic shading — right side slightly darker, soft
  pt.wet((c,rgba)=>{c.fillStyle=rgba(warm?[182,120,86]:[140,150,172],0.3);c.beginPath();c.ellipse(x+topW*0.52,y+h*0.52,topW*0.5,h*0.62,0,0,7);c.fill();});
  pt.wash(deform(circlePts(x,y,topW*0.9,topW*0.3,12,H.rng(905),1),H.rng(906),2,0.1),warm?[150,96,56]:[120,96,80],{layers:12,alpha:0.06,amt:0.1,seed:907});
  pt.wet((c,rgba)=>{c.fillStyle=rgba(warm?[120,70,40]:[90,96,120],0.5);c.beginPath();c.ellipse(x,y+4*s,topW*0.52,topW*0.14,0,0,7);c.fill();if(warm){c.fillStyle=rgba([214,152,92],0.5);c.beginPath();c.ellipse(x-10*s,y-3*s,topW*0.32,topW*0.1,0,0,7);c.fill();}});
  pt.finish([x-topW*1.9,y-14*s,x+topW*1.9,y+h+30*s],2.0,5,1);
  ink(pt,ring(x,y,topW*0.9,topW*0.3),1.9*s,ikc,{alpha:0.42,close:true,seed:908});
  ink(pt,[[x-topW,y],[x-botW,y+h],[x+botW,y+h],[x+topW,y]],2.3*s,ikc,{alpha:0.46,seed:909});
  // handle
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba(ikc,0.44);c.lineWidth=5*s;c.lineCap='round';c.beginPath();c.arc(x+topW+4*s,y+h*0.42,19*s,-1,1);c.stroke();c.restore();
  // rim highlight (source-over, soft)
  c.save();c.globalCompositeOperation='source-over';c.strokeStyle='rgba(255,252,246,0.5)';c.lineWidth=2.2*s;c.lineCap='round';c.beginPath();c.ellipse(x-topW*0.2,y,topW*0.55,topW*0.2,0,Math.PI*1.05,Math.PI*1.75);c.stroke();
  // body highlight streak (left)
  c.strokeStyle='rgba(255,252,246,0.3)';c.lineWidth=5*s;c.beginPath();c.moveTo(x-topW*0.55,y+h*0.2);c.lineTo(x-botW*0.55,y+h*0.85);c.stroke();c.restore();
}
function espressoMachine(pt,x,y,s){
  const body=[200,152,120],chrome=[216,180,122],ikc=[96,52,34];const W=168*s,Hh=116*s;
  pt.wash(deform(rpoly(x-W/2,y-Hh,x+W/2,y,0.9),H.rng(921),2,0.05),body,{layers:18,alpha:0.05,amt:0.05,seed:922});
  pt.wash(deform(rpoly(x-W/2-7*s,y-Hh-18*s,x+W/2+7*s,y-Hh+8*s,0.8),H.rng(923),2,0.06),chrome,{layers:14,alpha:0.06,amt:0.06,seed:924});
  [-42,42].forEach((dx,k)=>pt.wash(deform(rpoly(x+dx*s-26*s,y-50*s,x+dx*s+26*s,y-20*s,0.8),H.rng(925+k),2,0.06),chrome,{layers:12,alpha:0.06,amt:0.06,seed:926+k}));
  pt.finish([x-W/2-20*s,y-Hh-26*s,x+W/2+20*s,y+8*s],1.8,5,1);
  [-42,42].forEach((dx,k)=>pt.wash(deform(rpoly(x+dx*s-7*s,y-22*s,x+dx*s+7*s,y+2*s,0.9),H.rng(931+k),2,0.08),[58,48,48],{layers:10,alpha:0.08,amt:0.08,seed:932+k}));
  pt.finish([x-70*s,y-26*s,x+70*s,y+6*s],1.8,4,1);
  ink(pt,[[x-W/2,y],[x-W/2,y-Hh],[x+W/2,y-Hh],[x+W/2,y]],2.3*s,ikc,{alpha:0.45,seed:940});
  ink(pt,[[x-W/2-7*s,y-Hh+8*s],[x-W/2-7*s,y-Hh-18*s],[x+W/2+7*s,y-Hh-18*s],[x+W/2+7*s,y-Hh+8*s]],2*s,ikc,{alpha:0.4,seed:941});
  [-42,42].forEach((dx,k)=>ink(pt,[[x+dx*s-26*s,y-20*s],[x+dx*s-26*s,y-50*s],[x+dx*s+26*s,y-50*s],[x+dx*s+26*s,y-20*s]],1.8*s,ikc,{alpha:0.42,seed:942+k}));
  ink(pt,[[x+W/2+2*s,y-Hh+26*s],[x+W/2+20*s,y-Hh+54*s],[x+W/2+16*s,y-16*s]],3*s,ikc,{alpha:0.4,seed:945});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.fillStyle=H.rgba([250,244,232],0.7);c.beginPath();c.arc(x,y-Hh+32*s,9*s,0,7);c.fill();c.strokeStyle=H.rgba(ikc,0.5);c.lineWidth=1.8*s;c.stroke();c.beginPath();c.moveTo(x,y-Hh+32*s);c.lineTo(x+5*s,y-Hh+27*s);c.stroke();c.fillStyle=H.rgba([169,70,45],0.5);[-14,0,14].forEach(dx=>{c.beginPath();c.arc(x+dx*s-60*s,y-Hh+30*s,3.4*s,0,7);c.fill();});c.restore();
}
function umbrella(pt,x,y,s,col){
  pt.wash(deform(qp([[x-72*s,y,0.9],[x-36*s,y-34*s,0.8],[x,y-46*s,0.8],[x+36*s,y-34*s,0.8],[x+72*s,y,0.9],[x+48*s,y+8*s,1],[x,y-2*s,1],[x-48*s,y+8*s,1]]),H.rng(941),2,0.08),col,{layers:16,alpha:0.07,amt:0.1,seed:942});
  pt.finish([x-82*s,y-56*s,x+82*s,y+16*s],1.8,5,1);
  ink(pt,[[x-72*s,y],[x-36*s,y-34*s],[x,y-46*s],[x+36*s,y-34*s],[x+72*s,y]],2.4*s,[58,60,82],{alpha:0.5,seed:943});
  ink(pt,[[x-72*s,y],[x-48*s,y+8*s],[x,y-2*s],[x+48*s,y+8*s],[x+72*s,y]],2*s,[58,60,82],{alpha:0.4,seed:944});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba([58,60,82],0.4);c.lineWidth=1.5*s;[-48,-20,20,48].forEach(dx=>{c.beginPath();c.moveTo(x,y-46*s);c.lineTo(x+dx*s,y+2*s);c.stroke();});c.strokeStyle=H.rgba([58,60,82],0.5);c.lineWidth=3*s;c.beginPath();c.moveTo(x,y-46*s);c.lineTo(x,y+96*s);c.stroke();c.restore();}
function storefront(pt,bx0,by0,bx1,by1){
  const w=bx1-bx0,h=by1-by0;
  glow(pt,(bx0+bx1)/2,by0+h*0.62,Math.max(w,h)*0.62,[248,196,92],0.72);
  pt.wash(deform(rpoly(bx0,by0,bx1,by1,0.9),H.rng(212),2,0.05),[118,90,84],{layers:20,alpha:0.05,amt:0.06,seed:213});
  pt.finish([bx0-10,by0-10,bx1+10,by1+10],1.8,6,0.92);
  const ay=by0+h*0.2,ah=36;
  for(let i=0;i<7;i++){const sx0=bx0+6+i*(w-12)/7,sx1=bx0+6+(i+1)*(w-12)/7;pt.wash(deform(qp([[sx0,ay,0.8],[sx1,ay,0.8],[sx1-4,ay+ah,0.9],[sx0-4,ay+ah,0.9]]),H.rng(220+i),2,0.08),i%2?WARM.cream:WARM.brickDeep,{layers:14,alpha:0.08,amt:0.08,seed:230+i});}
  pt.finish([bx0,ay-6,bx1,ay+ah+8],1.8,5,1);
  ink(pt,[[bx0+4,ay],[bx1-4,ay]],2.2,[90,32,20],{alpha:0.4,seed:238});ink(pt,[[bx0+4,ay+ah],[bx1-4,ay+ah]],2.4,[90,32,20],{alpha:0.45,seed:239});
  const nbY=ay+ah+16;
  pt.wash(deform(rpoly(bx0+w*0.1,nbY,bx1-w*0.1,nbY+30,0.7),H.rng(240),2,0.05),WARM.cream,{layers:12,alpha:0.07,amt:0.05,seed:241});
  pt.finish([bx0+w*0.08,nbY-6,bx1-w*0.08,nbY+38],1.8,4,1);
  WC.wcText(pt.ctx,"The Brick & Mortar",(bx0+bx1)/2,nbY+24,26,'rgb(122,44,29)',{align:'center'});
  const wtop=nbY+40,wbot=by1-h*0.05,ww=(w*0.6-16)/2;
  [0,1].forEach(k=>{const x0=bx0+w*0.06+k*(ww+16),x1=x0+ww;
    glow(pt,(x0+x1)/2,(wtop+wbot)/2,ww*0.7,[255,214,120],0.6);
    pt.wash(deform(rpoly(x0,wtop,x1,wbot,0.7),H.rng(250+k),2,0.05),[244,184,78],{layers:18,alpha:0.08,amt:0.05,seed:252+k});
    pt.wet((c,rgba)=>{c.fillStyle=rgba([255,240,196],0.72);c.beginPath();c.ellipse((x0+x1)/2,(wtop+wbot)/2,ww*0.38,(wbot-wtop)*0.4,0,0,7);c.fill();});
    dab(pt,(x0+x1)/2-ww*0.18,wbot-26,16,28,[150,96,60],260+k,0.07);dab(pt,(x0+x1)/2+ww*0.2,wbot-20,13,24,[120,70,50],264+k,0.07);
    pt.finish([x0-8,wtop-8,x1+8,wbot+8],2.0,5,1);
    ink(pt,[[x0,wtop],[x0,wbot],[x1,wbot],[x1,wtop],[x0,wtop]],2.4,[122,44,29],{alpha:0.5,seed:268+k});
    const mc=pt.ctx;mc.save();mc.globalCompositeOperation='multiply';mc.strokeStyle=H.rgba([122,44,29],0.38);mc.lineWidth=2;mc.beginPath();mc.moveTo((x0+x1)/2,wtop);mc.lineTo((x0+x1)/2,wbot);mc.moveTo(x0,(wtop+wbot)/2);mc.lineTo(x1,(wtop+wbot)/2);mc.stroke();mc.restore();});
  const dx0=bx0+w*0.72,dx1=bx1-w*0.06,dy0=nbY+40,dy1=by1;
  pt.wash(deform(rpoly(dx0,dy0,dx1,dy1,0.8),H.rng(270),2,0.05),WARM.deepwood,{layers:16,alpha:0.05,amt:0.05,seed:271});
  pt.wash(deform(rpoly(dx0+8,dy0+10,dx1-8,dy0+(dy1-dy0)*0.45,0.7),H.rng(272),2,0.05),WARM.gold,{layers:12,alpha:0.06,amt:0.05,seed:273});
  pt.finish([dx0-6,dy0-6,dx1+6,dy1+6],1.8,4,1);
  ink(pt,[[dx0,dy1],[dx0,dy0],[dx1,dy0],[dx1,dy1]],2.4,[80,46,30],{alpha:0.5,seed:276});
  const hc=pt.ctx;hc.save();hc.globalCompositeOperation='multiply';hc.fillStyle=H.rgba([227,169,43],0.6);hc.beginPath();hc.arc(dx0+10,(dy0+dy1)/2,3.4,0,7);hc.fill();hc.restore();
  const gx=bx0+w*0.3,gy=by0+h*0.08;
  ink(pt,[[gx,by0],[gx,gy+8]],2.2,[80,46,30],{alpha:0.5,seed:280});
  pt.wash(deform(circlePts(gx,gy+22,20,16,10,H.rng(281),1),H.rng(282),2,0.1),WARM.cream,{layers:12,alpha:0.07,amt:0.08,seed:283});
  pt.finish([gx-26,gy+4,gx+26,gy+42],1.8,3,1);
  ink(pt,ring(gx,gy+22,20,16),1.8,[122,44,29],{alpha:0.5,close:true,seed:284});
  const sc=pt.ctx;sc.save();sc.globalCompositeOperation='multiply';sc.strokeStyle=H.rgba([122,44,29],0.5);sc.lineWidth=2;sc.beginPath();sc.ellipse(gx,gy+24,9,5,0,0,Math.PI);sc.stroke();sc.beginPath();sc.arc(gx+9,gy+22,4,-1,1);sc.stroke();sc.restore();
}

/* ======= scene plates (static) — each sets fx for the animated layer ======= */
function s1a(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2*0.62,[142,154,176],11,0.12);pt.finish([0,0,W,H2*0.66],2.0,8,0.9);
  const wx=portrait?W*0.5:W*0.36,wy=H2*0.40,ww=portrait?W*0.46:W*0.40,wh=H2*0.5;
  pt.wash(deform(rpoly(wx-ww/2,wy-wh/2,wx+ww/2,wy+wh/2,0.6),H.rng(21),2,0.04),[132,150,176],{layers:16,alpha:0.055,amt:0.04,seed:22});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([160,178,202],0.55);c.beginPath();c.ellipse(wx,wy-wh*0.12,ww*0.4,wh*0.3,0,0,7);c.fill();});
  pt.finish([wx-ww,wy-wh,wx+ww,wy+wh],2.2,6,0.95);
  ink(pt,[[wx-ww/2,wy-wh/2],[wx+ww/2,wy-wh/2],[wx+ww/2,wy+wh/2],[wx-ww/2,wy+wh/2],[wx-ww/2,wy-wh/2]],2.6,COOL.deep,{alpha:0.5,seed:24});
  const mc=pt.ctx;mc.save();mc.globalCompositeOperation='multiply';mc.strokeStyle=H.rgba(COOL.deep,0.45);mc.lineWidth=3;mc.beginPath();mc.moveTo(wx,wy-wh/2);mc.lineTo(wx,wy+wh/2);mc.moveTo(wx-ww/2,wy);mc.lineTo(wx+ww/2,wy);mc.stroke();mc.restore();
  const by=portrait?H2*0.78:H2*0.74,fx2=portrait?W*0.5:W*0.70;
  pt.wash(deform(qp([[fx2-180,by,1.1],[fx2+190,by-16,1],[fx2+200,H2+10,1.2],[fx2-200,H2+10,1.2]]),H.rng(31),3,0.1),[150,150,172],{layers:18,alpha:0.05,amt:0.12,seed:32});
  pt.finish([fx2-210,by-30,fx2+210,H2],1.9,6,0.9);
  figure(pt,fx2,by-2,portrait?0.56:0.52,'cool',{seated:true,sad:true,hood:false});
  const cx=portrait?W*0.2:W*0.12,cy=H2*0.3,cr=portrait?26:30;
  pt.wash(deform(circlePts(cx,cy,cr,cr,14,H.rng(41),1),H.rng(42),2,0.1),[206,200,190],{layers:14,alpha:0.06,amt:0.08,seed:43});
  pt.finish([cx-cr-8,cy-cr-8,cx+cr+8,cy+cr+8],2,4,1);
  ink(pt,ring(cx,cy,cr,cr),2,[90,86,96],{alpha:0.5,close:true,seed:44});
  const c=pt.ctx;c.save();c.globalCompositeOperation='multiply';c.strokeStyle=H.rgba(COOL.deep,0.7);c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy-cr*0.6);c.moveTo(cx,cy);c.lineTo(cx+cr*0.42,cy+cr*0.1);c.stroke();c.restore();
  fx.rain={x0:wx-ww/2+3,y0:wy-wh/2+3,x1:wx+ww/2-3,y1:wy+wh/2-3,n:portrait?70:95,seed:23,strong:false,clip:true};
}
function s1b(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2*0.55,[146,156,176],51,0.12);pt.finish([0,0,W,H2*0.6],2.0,8,0.9);
  const ty=portrait?H2*0.62:H2*0.58;
  pt.wash(deform(rpoly(0,ty,W,H2,1.1),H.rng(52),3,0.09),[150,150,170],{layers:16,alpha:0.05,amt:0.09,seed:53});
  pt.finish([0,ty-10,W,H2],1.8,6,0.9);ink(pt,[[0,ty+6],[W,ty+2]],2.2,COOL.deep,{alpha:0.35,seed:54});
  const fxp=portrait?W*0.3:W*0.28,fyp=H2+10,s2=portrait?0.6:0.6;
  figure(pt,fxp,fyp,s2,'cool',{seated:true,sad:true});
  const mx=portrait?W*0.56:W*0.6,my=ty-4;
  pt.wash(deform(qp([[mx-24,my-30,0.9],[mx+24,my-30,0.9],[mx+18,my,1],[mx-18,my,1]]),H.rng(61),2,0.1),[205,200,192],{layers:14,alpha:0.07,amt:0.08,seed:62});
  pt.finish([mx-40,my-46,mx+46,my+8],2,4,1);
  ink(pt,[[mx-24,my-30],[mx-18,my],[mx+18,my],[mx+24,my-30]],2.2,[110,100,110],{alpha:0.5,seed:63});
  const hc=pt.ctx;hc.save();hc.globalCompositeOperation='multiply';hc.strokeStyle=H.rgba([110,100,110],0.5);hc.lineWidth=4;hc.beginPath();hc.arc(mx+26,my-18,11,-1,1.1);hc.stroke();hc.restore();
  pt.wash(deform(circlePts(mx+18,my+26,portrait?78:100,32,11,H.rng(64),1.3),H.rng(65),3,0.3),[120,78,58],{layers:20,alpha:0.055,amt:0.18,seed:66});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([88,54,38],0.5);c.beginPath();c.ellipse(mx+18,my+28,44,16,0,0,7);c.fill();});
  pt.bloom(mx-2,my+24,16,67,0.5);pt.finish([mx-84,my,mx+160,my+74],2.4,6,1);
  pt.stroke([[mx+72,my+44],[mx+68,my+82],[mx+72,my+100]],6,[120,78,58],{alpha:0.6,taper:false});
  pt.stroke([[fxp+60*s2,fyp-6*s2-152*s2-10*s2],[fxp+82*s2,fyp-6*s2-152*s2-30*s2]],5,[190,50,60],{alpha:0.7,taper:false});
  pt.stroke([[fxp+72*s2,fyp-6*s2-152*s2-6*s2],[fxp+96*s2,fyp-6*s2-152*s2-16*s2]],5,[190,50,60],{alpha:0.7,taper:false});
  fx.letters=[{str:"Some mornings just don't",x:portrait?W*0.5:W*0.56,y:portrait?H2*0.15:H2*0.17,size:portrait?36:42,col:'rgb(72,78,100)',align:'center',t0:1.9,t1:2.9},
              {str:"go your way.",x:portrait?W*0.5:W*0.56,y:portrait?H2*0.24:H2*0.28,size:portrait?36:42,col:'rgb(72,78,100)',align:'center',t0:2.6,t1:3.5}];
}
function s2a(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2*0.64,[116,134,160],111,0.14);pt.finish([0,0,W,H2*0.68],2.0,8,0.88);
  pt.wash(deform(circlePts(W*0.3,H2*0.15,120,38,10,H.rng(112),1),H.rng(113),3,0.3),'#000',{layers:8,alpha:0.035,amt:0.3,depth:2,comp:'destination-out',seed:114});
  pt.finish([0,0,W,H2*0.4],2,8,0.8);
  [[0,W*0.24],[W*0.78,W]].forEach((bb,bi)=>{pt.wash(deform(rpoly(bb[0],H2*0.2,bb[1],H2*0.68,1),H.rng(121+bi),2,0.05),COOL.slate,{layers:18,alpha:0.05,amt:0.05,seed:122+bi});pt.finish([bb[0],H2*0.14,bb[1],H2*0.7],1.8,6,0.9);const wc=pt.ctx;wc.save();wc.globalCompositeOperation='multiply';wc.fillStyle=H.rgba([70,84,110],0.35);for(let r=0;r<3;r++)for(let col=0;col<2;col++){const wx=bb[0]+(bb[1]-bb[0])*(0.25+col*0.4),wy=H2*0.28+r*H2*0.12;wc.fillRect(wx,wy,(bb[1]-bb[0])*0.18,H2*0.07);}wc.restore();});
  const lx=portrait?W*0.82:W*0.8,ly=H2*0.26;
  ink(pt,[[lx,H2*0.68],[lx,ly]],3,COOL.deep,{alpha:0.5,seed:130});glow(pt,lx,ly,34,[180,196,220],0.4);
  pt.wash(deform(circlePts(lx,ly,14,18,8,H.rng(131),1),H.rng(132),2,0.1),[200,214,232],{layers:10,alpha:0.07,amt:0.1,seed:133});pt.finish([lx-24,ly-26,lx+24,ly+26],1.8,4,1);
  const sy=H2*0.66;
  pt.wash(deform(rpoly(0,sy,W,H2,1.2),H.rng(125),3,0.12),COOL.pud,{layers:18,alpha:0.05,amt:0.14,seed:126});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([150,166,188],0.4);c.beginPath();c.ellipse(W*0.5,sy+(H2-sy)*0.5,W*0.42,(H2-sy)*0.4,0,0,7);c.fill();});
  pt.finish([0,sy-6,W,H2],2.0,6,0.95);
  const fxp=portrait?W*0.46:W*0.42,fyp=sy+(portrait?8:6),fs=portrait?0.6:0.52;
  const fr=figure(pt,fxp,fyp,fs,'cool',{walk:true,hood:true,lean:14});
  umbrella(pt,fr.headCX+6,fr.headCY-70*fs,fs*0.95,COOL.deep);
  pt.ctx.save();pt.ctx.globalAlpha=0.26;pt.ctx.translate(0,fyp*2+70*fs);pt.ctx.scale(1,-1);figure(pt,fxp,fyp,fs*0.98,'cool',{walk:true,hood:true,lean:14});pt.ctx.restore();
  fx.rain={x0:0,y0:0,x1:W,y1:H2,n:portrait?110:150,seed:131,strong:true};
}
function s2b(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2*0.64,[108,126,150],211,0.14);pt.finish([0,0,W,H2*0.66],2.0,8,0.84);
  const sy=H2*0.72;const bx0=portrait?W*0.1:W*0.36,bx1=portrait?W*0.9:W*0.98,by0=portrait?H2*0.14:H2*0.1,by1=sy;
  storefront(pt,bx0,by0,bx1,by1);
  pt.wash(deform(rpoly(0,sy,W,H2,1.2),H.rng(222),3,0.12),COOL.pud,{layers:16,alpha:0.05,amt:0.14,seed:223});pt.finish([0,sy-6,W,H2],2.0,6,0.95);
  lightSpill(pt,(bx0+bx1)/2,sy,(bx1-bx0)*0.4,(H2-sy),[235,180,110],0.4);
  const fxp=portrait?W*0.5:W*0.17,fyp=sy+(portrait?4:2),fs=portrait?0.46:0.46;
  const fr=figure(pt,fxp,fyp,fs,'cool',{hood:true});
  umbrella(pt,fr.headCX+4,fr.headCY-66*fs,fs*0.9,COOL.deep);
  fx.rain={x0:0,y0:0,x1:W,y1:H2,n:portrait?80:120,seed:231,strong:true,fade:true};
}
function s3(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2,WARM.cream,311,0.12);pt.finish([0,0,W,H2],2.0,8,0.95);
  glow(pt,W*(portrait?0.5:0.62),H2*0.36,W*0.42,[246,200,110],0.4);
  pt.wash(deform(rpoly(0,H2*0.08,W,H2*0.5,1),H.rng(312),2,0.06),[198,152,122],{layers:16,alpha:0.045,amt:0.07,seed:313});pt.finish([0,0,W,H2*0.56],1.8,7,0.85);
  const shc=pt.ctx;shc.save();shc.globalCompositeOperation='multiply';shc.strokeStyle=H.rgba(WARM.deepwood,0.4);shc.lineWidth=3;[H2*0.2,H2*0.33].forEach(sy=>{shc.beginPath();shc.moveTo(W*0.06,sy);shc.lineTo(W*0.5,sy);shc.stroke();});shc.restore();
  for(let i=0;i<5;i++)dab(pt,W*0.1+i*W*0.08,H2*0.18,9,12,i%2?WARM.brick:WARM.sage,340+i,0.06);
  pt.finish([0,H2*0.1,W*0.55,H2*0.36],1.8,4,1);
  const mbx=portrait?W*0.5:W*0.8;
  pt.wash(deform(rpoly(mbx-70,H2*0.12,mbx+70,H2*0.34,0.7),H.rng(350),2,0.05),[60,54,50],{layers:14,alpha:0.06,amt:0.05,seed:351});pt.finish([mbx-80,H2*0.1,mbx+80,H2*0.36],1.8,4,1);
  const mc=pt.ctx;mc.save();mc.globalCompositeOperation='screen';mc.strokeStyle='rgba(250,240,222,0.4)';mc.lineWidth=2;for(let i=0;i<4;i++){mc.beginPath();mc.moveTo(mbx-54,H2*0.17+i*H2*0.04);mc.lineTo(mbx+(i%2?30:50),H2*0.17+i*H2*0.04);mc.stroke();}mc.restore();
  [W*0.3,W*0.66].forEach((px,i)=>{ink(pt,[[px,0],[px,H2*0.1]],2,WARM.deepwood,{alpha:0.5,seed:360+i});glow(pt,px,H2*0.12,26,[246,196,96],0.5);pt.wash(deform(circlePts(px,H2*0.12,16,12,8,H.rng(362+i),1,0,Math.PI),H.rng(364+i),2,0.1),WARM.gold,{layers:10,alpha:0.07,amt:0.08,seed:366+i});pt.finish([px-22,H2*0.08,px+22,H2*0.2],1.8,3,1);});
  const cy=portrait?H2*0.68:H2*0.64;
  pt.wash(deform(rpoly(0,cy,W,H2,1.1),H.rng(314),3,0.09),WARM.wood,{layers:20,alpha:0.055,amt:0.09,seed:315});
  pt.wet((c,rgba)=>{c.fillStyle=rgba(WARM.deepwood,0.45);c.beginPath();c.ellipse(W*0.5,H2,W*0.5,(H2-cy)*0.7,0,0,7);c.fill();});
  pt.finish([0,cy-8,W,H2],2.0,6,0.95);ink(pt,[[0,cy+4],[W,cy+2]],2.4,WARM.deepwood,{alpha:0.45,seed:316});
  const emx=portrait?W*0.3:W*0.28;espressoMachine(pt,emx,cy-2,portrait?0.62:0.62);
  const bx=portrait?W*0.66:W*0.6,bs=portrait?0.5:0.5;
  figure(pt,bx,cy+6,bs,'warm',{armRaise:true,happy:true});
  pt.ctx.save();pt.ctx.globalCompositeOperation='multiply';pt.ctx.fillStyle=H.rgba(WARM.sage,0.18);pt.ctx.fillRect(bx-40*bs,cy-70*bs,80*bs,70*bs);pt.ctx.restore();
  pt.bloom(W*0.5,H2*0.3,40,330,0.4);
  fx.steam=[{x:emx,y:cy-130*0.62,h:120,warm:true,seed:320}];
}
function s4a(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2,[228,192,144],411,0.1);pt.finish([0,0,W,H2],2.0,8,0.9);
  glow(pt,W*0.5,H2*0.4,W*0.42,[248,208,120],0.5);
  const cx=W*0.5,cy=H2*0.92;
  pt.wash(deform(rpoly(0,cy,W,H2,1.1),H.rng(430),2,0.08),WARM.wood,{layers:14,alpha:0.05,amt:0.08,seed:431});pt.finish([0,cy-6,W,H2],1.8,5,0.9);ink(pt,[[0,cy+3],[W,cy+1]],2.2,WARM.deepwood,{alpha:0.4,seed:432});
  const gw=portrait?W*0.5:W*0.4,gTop=H2*0.1,gH=H2*0.26;
  pt.wash(deform(rpoly(cx-gw/2,gTop,cx+gw/2,gTop+gH,0.85),H.rng(433),2,0.05),[206,168,114],{layers:16,alpha:0.055,amt:0.05,seed:434});
  pt.wash(deform(rpoly(cx-gw*0.3,gTop+gH-8,cx+gw*0.3,gTop+gH+44,0.8),H.rng(435),2,0.05),[218,184,126],{layers:14,alpha:0.06,amt:0.05,seed:436});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([250,240,210],0.5);c.beginPath();c.ellipse(cx-gw*0.18,gTop+gH*0.4,gw*0.12,gH*0.3,0,0,7);c.fill();});
  pt.finish([cx-gw/2-10,gTop-10,cx+gw/2+10,gTop+gH+64],1.8,5,1);
  ink(pt,[[cx-gw/2,gTop+gH],[cx-gw/2,gTop],[cx+gw/2,gTop],[cx+gw/2,gTop+gH]],2.6,[120,78,54],{alpha:0.42,seed:450});
  ink(pt,[[cx-gw*0.3,gTop+gH+44],[cx-gw*0.3,gTop+gH-8],[cx+gw*0.3,gTop+gH-8],[cx+gw*0.3,gTop+gH+44]],2.2,[120,78,54],{alpha:0.42,seed:451});
  const pfY=gTop+gH+52;
  pt.wash(deform(circlePts(cx,pfY,gw*0.2,16,10,H.rng(437),1),H.rng(438),2,0.06),[150,120,96],{layers:12,alpha:0.06,amt:0.06,seed:439});
  pt.wash(deform(rpoly(cx+gw*0.18,pfY-9,cx+gw*0.56,pfY+9,0.85),H.rng(440),2,0.06),[66,52,48],{layers:12,alpha:0.07,amt:0.06,seed:441});
  pt.finish([cx-gw*0.26,pfY-24,cx+gw*0.6,pfY+26],1.8,4,1);
  ink(pt,ring(cx,pfY,gw*0.2,16),2,[110,86,70],{alpha:0.45,close:true,seed:452});
  ink(pt,[[cx+gw*0.18,pfY-9],[cx+gw*0.56,pfY-9],[cx+gw*0.56,pfY+9],[cx+gw*0.18,pfY+9]],2.2,[60,48,46],{alpha:0.5,seed:453});
  const cupTopW=portrait?96:112,cupY=cy-104;
  pt.wash(deform(qp([[cx-cupTopW,cupY,0.9],[cx+cupTopW,cupY,0.9],[cx+cupTopW*0.74,cupY+100,1],[cx-cupTopW*0.74,cupY+100,1]]),H.rng(442),2,0.06),[252,248,241],{layers:16,alpha:0.06,amt:0.06,seed:443});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([182,120,86],0.28);c.beginPath();c.ellipse(cx+cupTopW*0.45,cupY+56,cupTopW*0.5,66,0,0,7);c.fill();});
  pt.finish([cx-cupTopW*1.35,cupY-18,cx+cupTopW*1.35,cupY+112],2.0,5,1);
  ink(pt,ring(cx,cupY,cupTopW*0.9,cupTopW*0.3),2,[120,78,56],{alpha:0.42,close:true,seed:448});
  ink(pt,[[cx-cupTopW,cupY],[cx-cupTopW*0.74,cupY+100],[cx+cupTopW*0.74,cupY+100],[cx+cupTopW,cupY]],2.4,[120,78,56],{alpha:0.46,seed:449});
  const hc=pt.ctx;hc.save();hc.globalCompositeOperation='multiply';hc.strokeStyle=H.rgba([120,78,56],0.44);hc.lineWidth=7;hc.lineCap='round';hc.beginPath();hc.arc(cx+cupTopW+4,cupY+48,24,-1,1);hc.stroke();hc.restore();
  // rim highlight
  hc.save();hc.globalCompositeOperation='source-over';hc.strokeStyle='rgba(255,252,246,0.5)';hc.lineWidth=2.4;hc.beginPath();hc.ellipse(cx-cupTopW*0.2,cupY,cupTopW*0.55,cupTopW*0.2,0,Math.PI*1.05,Math.PI*1.75);hc.stroke();hc.restore();
  fx.pour={cx,spoutY:pfY+12,cupY,cupTopW};
  fx.steam=[{x:cx,y:cupY-cupTopW*0.3,h:86,warm:true,seed:454}];
}
function s4b(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2,[228,192,146],451,0.1);pt.finish([0,0,W,H2],2.0,8,0.9);
  glow(pt,W*0.5,H2*0.46,W*0.32,[246,206,120],0.4);
  const cx=W*0.5,cy=H2*0.5,cr=portrait?W*0.33:H2*0.4;
  pt.wash(deform(circlePts(cx,cy,cr+16,cr+16,16,H.rng(452),1),H.rng(453),2,0.05),[238,226,212],{layers:14,alpha:0.05,amt:0.05,seed:454});
  pt.wash(deform(circlePts(cx,cy,cr,cr,16,H.rng(455),1),H.rng(456),2,0.06),[164,104,62],{layers:18,alpha:0.06,amt:0.06,seed:457});
  pt.wet((c,rgba)=>{c.fillStyle=rgba([120,74,44],0.45);c.beginPath();c.ellipse(cx+cr*0.12,cy+cr*0.12,cr*0.8,cr*0.8,0,0,7);c.fill();});
  pt.finish([cx-cr-20,cy-cr-20,cx+cr+20,cy+cr+20],2.0,6,1);
  ink(pt,ring(cx,cy,cr,cr),2.4,[120,78,54],{alpha:0.45,close:true,seed:458});
  ink(pt,ring(cx,cy,cr+15,cr+15),2.0,[150,96,60],{alpha:0.3,close:true,seed:459});
  // rim highlight
  const hc=pt.ctx;hc.save();hc.globalCompositeOperation='source-over';hc.strokeStyle='rgba(255,252,246,0.45)';hc.lineWidth=3;hc.beginPath();hc.arc(cx,cy,cr-3,Math.PI*1.1,Math.PI*1.6);hc.stroke();hc.restore();
  fx.rosetta={cx,cy,cr:cr*0.96,t0:13.6,t1:14.8};
  fx.steam=[{x:cx,y:cy-cr,h:90,warm:true,seed:461}];
}
function s4c(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2,WARM.cream,462,0.11);pt.finish([0,0,W,H2],2.0,8,0.95);
  glow(pt,W*0.42,H2*0.42,W*0.34,[246,204,116],0.42);
  const cupX=portrait?W*0.42:W*0.4,cupY=portrait?H2*0.46:H2*0.44,cs=portrait?1.0:1.15;
  cup(pt,cupX,cupY,cs,true,{saucer:true});
  const c=pt.ctx;c.save();c.globalCompositeOperation='source-over';c.filter='blur(0.6px)';c.fillStyle='rgba(250,246,238,0.9)';const hy=cupY-1*cs,hs=16*cs;c.beginPath();c.moveTo(cupX,hy+hs*0.85);c.bezierCurveTo(cupX-hs*1.1,hy+hs*0.05,cupX-hs*0.55,hy-hs*0.6,cupX,hy-hs*0.08);c.bezierCurveTo(cupX+hs*0.55,hy-hs*0.6,cupX+hs*1.1,hy+hs*0.05,cupX,hy+hs*0.85);c.fill();c.restore();
  pt.wash(deform(qp([[cupX+70*cs,cupY-6*cs,0.9],[W*0.99,cupY-70*cs,0.8],[W*0.99,cupY-6*cs,0.9],[cupX+74*cs,cupY+28*cs,1]]),H.rng(471),3,0.1),WARM.skin,{layers:16,alpha:0.06,amt:0.1,seed:472});
  pt.finish([cupX+50*cs,cupY-80*cs,W,cupY+40*cs],2.0,6,1);
  ink(pt,[[cupX+74*cs,cupY+26*cs],[cupX+70*cs,cupY-4*cs],[W*0.9,cupY-50*cs]],2.2*cs,[150,90,60],{alpha:0.4,seed:473});
  const nx=portrait?W*0.5:W*0.64,ny=portrait?H2*0.8:H2*0.76,nw=portrait?W*0.5:W*0.34,nh=portrait?H2*0.17:H2*0.22;
  pt.wash(deform(rpoly(nx-nw/2,ny-nh/2,nx+nw/2,ny+nh/2,0.6),H.rng(474),2,0.05),[252,248,238],{layers:14,alpha:0.06,amt:0.05,seed:475});
  pt.finish([nx-nw/2-10,ny-nh/2-10,nx+nw/2+10,ny+nh/2+10],2.2,5,1);
  ink(pt,[[nx-nw/2,ny-nh/2],[nx+nw/2,ny-nh/2],[nx+nw/2,ny+nh/2],[nx-nw/2,ny+nh/2],[nx-nw/2,ny-nh/2]],2.2,[198,150,100],{alpha:0.4,seed:476});
  fx.letters=[{str:"You've got this.",x:nx,y:ny+10,size:portrait?32:38,col:'rgb(169,70,45)',align:'center',t0:15.4,t1:16.2,rot:-0.04}];
  fx.steam=[{x:cupX,y:cupY-18*cs,h:80,warm:true,seed:470}];
}
function s5(pt,W,H2,portrait,fx){
  bgBand(pt,0,0,W,H2,WARM.cream,511,0.11);pt.finish([0,0,W,H2],2.0,8,0.95);
  glow(pt,W*0.5,H2*0.4,W*0.44,[248,210,120],0.45);
  pt.wash(deform(rpoly(0,H2*0.08,W,H2*0.48,1),H.rng(512),2,0.07),[202,158,126],{layers:14,alpha:0.04,amt:0.07,seed:513});pt.finish([0,0,W,H2*0.54],1.8,7,0.8);
  const cy=portrait?H2*0.7:H2*0.64;
  pt.wash(deform(rpoly(0,cy,W,H2,1.1),H.rng(514),3,0.09),WARM.wood,{layers:16,alpha:0.05,amt:0.09,seed:515});pt.finish([0,cy-6,W,H2],2.0,6,0.9);ink(pt,[[0,cy+4],[W,cy+2]],2.2,WARM.deepwood,{alpha:0.4,seed:516});
  const fxp=portrait?W*0.3:W*0.27,fyp=cy+8,fs=portrait?0.58:0.56;
  const fr=figure(pt,fxp,fyp,fs,'warm',{seated:true,holdCup:true,happy:true});
  cup(pt,fr.headCX+22*fs,fr.headCY+20*fs,fs*0.7,true,{});
  splat(pt,W*0.5,H2*0.3,521,[[227,169,43],[169,70,45],[92,105,83],[246,196,96]]);
  pt.bloom(W*0.55,H2*0.32,46,522,0.5);
  const motifX=portrait?W*0.72:W*0.86,motifY=portrait?H2*0.56:H2*0.6;
  cup(pt,motifX,motifY,portrait?0.4:0.5,true,{saucer:true});
  fx.steam=[{x:fr.headCX+22*fs,y:fr.headCY+4*fs,h:52,warm:true,seed:520},{x:motifX,y:motifY-50*(portrait?0.4:0.5),h:40,warm:true,seed:524}];
  fx.bright={t0:16.8,t1:17.9};
  fx.letters=[{str:"A Little Coffee.",x:portrait?W*0.52:W*0.62,y:portrait?H2*0.2:H2*0.32,size:portrait?42:52,col:'rgb(122,44,29)',align:'center',t0:17.2,t1:17.9},
              {str:"A Brighter Day.",x:portrait?W*0.52:W*0.62,y:portrait?H2*0.33:H2*0.48,size:portrait?46:58,col:'rgb(169,70,45)',align:'center',t0:17.5,t1:18.2}];
  fx.underline={x0:portrait?W*0.3:W*0.46,x1:portrait?W*0.74:W*0.78,y:portrait?H2*0.37:H2*0.53,t0:18.1,t1:18.6};
}

window.BMC_SCENES=[
  {id:'s1a',fn:s1a,in:[0.3,1.3],end:1.8,cam:{z0:1.0,z1:1.03,px:6,py:-4}},
  {id:'s1b',fn:s1b,in:[1.8,2.6],end:4.0,cam:{z0:1.0,z1:1.04,px:-8,py:6},revealC:[0.5,0.62]},
  {id:'s2a',fn:s2a,in:[4.0,4.9],end:6.0,cam:{z0:1.04,z1:1.0,px:-14,py:0},revealC:[0.44,0.6]},
  {id:'s2b',fn:s2b,in:[6.0,6.9],end:8.0,cam:{z0:1.0,z1:1.05,px:10,py:4},revealC:[0.66,0.45]},
  {id:'s3', fn:s3, in:[8.0,9.1],end:12.0,cam:{z0:1.06,z1:1.0,px:0,py:0},warm:true,revealC:[0.55,0.45]},
  {id:'s4a',fn:s4a,in:[12.0,12.7],end:13.4,cam:{z0:1.0,z1:1.08,px:0,py:-6},revealC:[0.5,0.55]},
  {id:'s4b',fn:s4b,in:[13.4,14.1],end:15.0,cam:{z0:1.02,z1:1.08,px:0,py:0},revealC:[0.5,0.5]},
  {id:'s4c',fn:s4c,in:[15.0,15.7],end:16.5,cam:{z0:1.0,z1:1.05,px:6,py:4},revealC:[0.44,0.46]},
  {id:'s5', fn:s5, in:[16.5,17.4],end:20.0,cam:{z0:1.05,z1:1.0,px:0,py:0},revealC:[0.4,0.5]},
];

/* ---- live FX drawers (deterministic in t) ---- */
const FX={
  rain(ctx,cfg,t){const r=H.rng(cfg.seed),span=cfg.y1-cfg.y0+40;let a=1;if(cfg.fade)a=H.clamp(1-(t-6.9)/1.0,0.2,1);ctx.save();if(cfg.clip){ctx.beginPath();ctx.rect(cfg.x0,cfg.y0,cfg.x1-cfg.x0,cfg.y1-cfg.y0);ctx.clip();}ctx.globalCompositeOperation='multiply';ctx.lineCap='round';for(let i=0;i<cfg.n;i++){const bx=r.range(cfg.x0,cfg.x1),speed=r.range(520,920),len=r.range(10,22)*(cfg.strong?1.4:1),ph=r()*span;let y=((ph+t*speed)%span)+cfg.y0-20;const x=bx-((y-cfg.y0)*0.32);ctx.strokeStyle=H.rgba([150,168,190],(0.1+r()*0.14)*a);ctx.lineWidth=0.8+r()*1.0;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-len*0.35,y+len);ctx.stroke();}ctx.restore();},
  steam(ctx,em,t){ctx.save();ctx.globalCompositeOperation='source-over';for(let i=0;i<4;i++){const prog=((t*0.5+i*0.25)%1);const yy=em.y-prog*em.h;const sway=Math.sin(t*1.6+i*1.3)*14;const w=12+i*5+prog*10;const a=(em.warm?0.32:0.28)*(1-prog)*Math.min(1,prog*4);ctx.fillStyle=H.rgba(em.warm?[255,250,242]:[220,228,236],a);ctx.beginPath();ctx.ellipse(em.x+sway,yy,w,em.h*0.14,Math.sin(t+i)*0.3,0,7);ctx.fill();}ctx.restore();},
  pour(ctx,p,t,local){const grow=H.clamp((t-12.1)/0.6),flick=0.85+0.15*Math.sin(t*40);const endY=p.cupY-p.cupTopW*0.24;const curY=p.spoutY+(endY-p.spoutY)*grow;ctx.save();ctx.globalCompositeOperation='multiply';[-15,15].forEach(dx=>{ctx.strokeStyle=H.rgba([84,48,30],0.82*flick);ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.cx+dx,p.spoutY);ctx.lineTo(p.cx+dx*0.8,curY);ctx.stroke();});
    // crema fills
    const fill=H.clamp((t-12.4)/1.0);ctx.globalCompositeOperation='source-over';ctx.fillStyle=H.rgba([150,96,56],0.55*fill);ctx.beginPath();ctx.ellipse(p.cx,p.cupY,p.cupTopW*0.86*Math.max(0.3,fill),p.cupTopW*0.26*Math.max(0.3,fill),0,0,7);ctx.fill();ctx.fillStyle=H.rgba([214,152,92],0.4*fill);ctx.beginPath();ctx.ellipse(p.cx-10,p.cupY-3,p.cupTopW*0.3*fill,p.cupTopW*0.08*fill,0,0,7);ctx.fill();ctx.restore();},
  rosetta(ctx,ro,t){const prog=H.clamp((t-ro.t0)/(ro.t1-ro.t0));if(prog<=0)return;const cx=ro.cx,cy=ro.cy,rr=ro.cr;ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='blur(0.6px)';ctx.lineCap='round';ctx.lineJoin='round';const col=a=>`rgba(250,246,238,${a})`;
    // stem grows top->bottom
    const stemP=H.clamp(prog/0.4);ctx.strokeStyle=col(0.9);ctx.lineWidth=rr*0.1;ctx.beginPath();ctx.moveTo(cx,cy-rr*0.82);ctx.lineTo(cx,cy-rr*0.82+(rr*1.68)*stemP);ctx.stroke();
    const leafP=H.clamp((prog-0.3)/0.7);const nLeaf=6;const shown=Math.floor(leafP*nLeaf+0.001);
    for(let i=0;i<nLeaf;i++){const vis=H.clamp(leafP*nLeaf-i);if(vis<=0)break;for(let side=-1;side<=1;side+=2){const yy=cy-rr*0.58+i*rr*0.26,span=rr*(0.46-i*0.055)*vis;ctx.strokeStyle=col(0.85);ctx.lineWidth=rr*0.085;ctx.beginPath();ctx.moveTo(cx+side*rr*0.04,yy-rr*0.06);ctx.quadraticCurveTo(cx+side*span*0.7,yy-rr*0.02,cx+side*span,yy+rr*0.14);ctx.stroke();}}
    if(prog>0.95){ctx.fillStyle=col(0.9);ctx.beginPath();ctx.arc(cx,cy-rr*0.74,rr*0.08,0,7);ctx.fill();ctx.strokeStyle=col(0.9);ctx.lineWidth=rr*0.12;ctx.beginPath();ctx.moveTo(cx,cy+rr*0.6);ctx.lineTo(cx,cy+rr*0.9);ctx.stroke();}
    ctx.restore();},
  letters(ctx,arr,t){arr.forEach(L=>{const rev=H.smooth(L.t0,L.t1,t);if(rev<=0)return;ctx.save();if(L.rot){ctx.translate(L.x,L.y);ctx.rotate(L.rot);WC.wcText(ctx,L.str,0,0,L.size,L.col,{align:L.align,reveal:rev});}else{WC.wcText(ctx,L.str,L.x,L.y,L.size,L.col,{align:L.align,reveal:rev});}ctx.restore();});},
  underline(ctx,u,t){const rev=H.smooth(u.t0,u.t1,t);if(rev<=0)return;ctx.save();ctx.globalCompositeOperation='multiply';ctx.strokeStyle=H.rgba([227,169,43],0.75);ctx.lineWidth=7;ctx.lineCap='round';const x1=u.x0+(u.x1-u.x0)*rev;ctx.beginPath();ctx.moveTo(u.x0,u.y);ctx.quadraticCurveTo((u.x0+x1)/2,u.y-6,x1,u.y);ctx.stroke();ctx.restore();},
  bright(ctx,W,Hh,b,t){const k=H.smooth(b.t0,b.t1,t);if(k<=0)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=0.26*k;const g=ctx.createRadialGradient(W*0.5,Hh*0.46,10,W*0.5,Hh*0.5,Math.hypot(W,Hh)*0.6);g.addColorStop(0,'rgba(255,244,214,1)');g.addColorStop(1,'rgba(255,244,214,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,Hh);ctx.restore();ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=0.1*k;ctx.fillStyle='rgba(227,169,43,1)';ctx.fillRect(0,0,W,Hh);ctx.restore();}
};
window.BMC_FX=FX;
})();
