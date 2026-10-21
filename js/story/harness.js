/* ===================== H helper library ===================== */
(function () {
  const H=(window.H={});
  H.rng=function(seed=1){let a=typeof seed==='string'?hash(seed):(seed>>>0)||1;const r=function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};r.range=(lo,hi)=>lo+r()*(hi-lo);r.int=(lo,hi)=>Math.floor(lo+r()*(hi-lo+1));r.pick=a=>a[Math.floor(r()*a.length)];r.chance=p=>r()<p;r.gauss=()=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};return r;};
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
  H.lerp=(a,b,t)=>a+(b-a)*t;H.clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
  H.smooth=(e0,e1,x)=>{const t=H.clamp((x-e0)/(e1-e0));return t*t*(3-2*t);};
  H.ease={inOut:t=>(t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2),out:t=>1-Math.pow(1-t,3),in:t=>t*t*t};
  H.hex=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];};
  H.rgba=(x,a=1)=>{const[r,g,b]=Array.isArray(x)?x:H.hex(x);return`rgba(${r|0},${g|0},${b|0},${a})`;};
  H.layer=(W,Hh)=>{const c=document.createElement('canvas');c.width=W;c.height=Hh;return c;};
})();
