/* ============ per-scene live overlays (shared by storyboard + film) ============ */
(function(){
const SCN=window.SCN,FX=SCN.FX,H=window.H;
function cafe(ctx,fx,t,W,H2){
  if(fx.lightSource)FX.rays(ctx,fx.lightSource,W,H2,t);
  if(fx.lightSource)FX.dust(ctx,fx.lightSource,W,H2,t,777);
  if(fx.lamps)FX.lampPulse(ctx,fx.lamps,t);
  if(fx.hangPlant)FX.sway(ctx,fx.hangPlant,t,false,9,70,SCN.WARM.plant,11);
  if(fx.floorPlant)FX.sway(ctx,fx.floorPlant,t,true,11,96,SCN.WARM.plant,22);
  if(fx.sill)FX.sway(ctx,fx.sill,t,true,7,30,SCN.WARM.plant,33);
  if(fx.counterPlant)FX.sway(ctx,fx.counterPlant,t,true,6,20,SCN.WARM.plant,44);
  if(fx.machineSteam)FX.steam(ctx,fx.machineSteam.x,fx.machineSteam.y,120,t,1,0.3);
  if(fx.pitcherSteam)FX.steam(ctx,fx.pitcherSteam.x,fx.pitcherSteam.y,80,t,2,0.34);
  if(fx.cup1)FX.steam(ctx,fx.cup1.x,fx.cup1.y-10,56,t,3,0.26);
  if(fx.cup2)FX.steam(ctx,fx.cup2.x,fx.cup2.y-10,52,t,4,0.26);
  if(fx.eyes)FX.blinks(ctx,fx.eyes,t);
}
function bedroom(ctx,fx,t,W,H2){
  if(fx.rainGlass)FX.rainGlass(ctx,fx.rainGlass,t,5);
  // nightstand lamp flicker
  ctx.save();ctx.globalCompositeOperation='screen';const a=0.12+0.04*Math.sin(t*2.2);ctx.globalAlpha=a;const lx=fx.clock?fx.clock.x0-18:0,ly=fx.clock?fx.clock.y0-14:0;if(fx.clock){const g=ctx.createRadialGradient(lx,ly,2,lx,ly,60);g.addColorStop(0,'rgba(240,204,140,1)');g.addColorStop(1,'rgba(240,204,140,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(lx,ly,60,0,7);ctx.fill();}ctx.restore();
  // alarm clock vibration
  if(fx.clock){const c=fx.clock,buzz=(t*12)%1<0.5;ctx.save();if(buzz){ctx.globalCompositeOperation='multiply';ctx.strokeStyle='rgba(60,64,78,0.5)';ctx.lineWidth=2;const jx=Math.sin(t*60)*2;[-1,1].forEach(s=>{ctx.beginPath();ctx.arc(c.x+s*((c.x1-c.x0)/2+8)+jx,c.y,7,s>0?-0.8:2.3,s>0?0.8:3.9);ctx.stroke();ctx.beginPath();ctx.arc(c.x+s*((c.x1-c.x0)/2+14)+jx,c.y,12,s>0?-0.8:2.3,s>0?0.8:3.9);ctx.stroke();});}
    // flickering red time
    ctx.globalCompositeOperation='screen';ctx.globalAlpha=buzz?0.9:0.5;ctx.fillStyle='rgba(230,120,90,1)';ctx.font='bold 13px monospace';ctx.fillText('8:10',c.x0+4+Math.sin(t*60)*1.5,c.y+5);ctx.restore();}
  if(fx.eyes)FX.blinks(ctx,fx.eyes,t);
}
function street(ctx,fx,t,W,H2){
  if(fx.clouds)FX.clouds(ctx,fx.clouds,W,t);
  if(fx.cafeWin)FX.winGlow(ctx,fx.cafeWin,t);
  if(fx.car)FX.car(ctx,W,fx.car,t);
  if(fx.walkers)FX.walkers(ctx,fx.walkers,t);
  if(fx.tree)FX.sway(ctx,fx.tree,t,true,14,70,SCN.COOL.slate,831);
  if(fx.puddles)FX.ripples(ctx,fx.puddles,t);
  FX.rainFall(ctx,W,H2,t,170,9,true);
}
function coffee(ctx,fx,t,W,H2){
  if(fx.pour)FX.pour(ctx,fx.pour,t,0.2);
  if(fx.coffeeSteam)fx.coffeeSteam.forEach(e=>FX.steam(ctx,e.x,e.y,e.h,t,7,0.3));
  if(fx.pitcherSteam2)FX.steam(ctx,fx.pitcherSteam2.x,fx.pitcherSteam2.y,70,t,8,0.3);
  if(fx.pour){const p=fx.pour;const prog=H.clamp((t-1.2)/1.6);FX.rosetta(ctx,p.cx,p.cupY,p.cupTopW*0.5,prog);}
}
window.SCN.live={cafe,bedroom,street,coffee};
window.SCN.liveBrighter=function(ctx,fx,t,W,H2){cafe(ctx,fx,t,W,H2);if(fx.foreSteam)FX.steam(ctx,fx.foreSteam.x,fx.foreSteam.y,60,t,9,0.3);FX.brighten(ctx,W,H2,H.clamp((t-0.4)/1.2));};
})();
