/* IGNYT 5 Blueprint: time-sensitive personal links (AJ 11/9). An invite link works for 1 hour from when it was sent.
   After that the video is replaced by an "expired" screen where the prospect can ask the sender to reactivate it.
   A video started before the hour ran out may still be finished (server-side grace). Fails open if the API is down. */
(function(){
  var c=null,acc=false;try{c=sessionStorage.getItem('ig5_b')||localStorage.getItem('ig5_b');acc=localStorage.getItem('ignyt_blueprint_access')==='1'}catch(e){}
  if(!c||!/^[a-z0-9]{6}$/.test(c))return;
  if(acc&&!window.__ig5FromUrl)return;   // a member browsing the hub normally, not via a personal link
  var API='https://ignyt-challenge.hireboris.workers.dev/api',timer=null,shown=false;
  function post(p,d){return fetch(API+p,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(j){return j.ok||j})}
  function css(){var s=document.createElement('style');s.textContent=
   '#ig5x{position:fixed;inset:0;z-index:2147483000;background:radial-gradient(ellipse at 50% 40%,#2a170d 0%,#0b0b0d 62%);color:#f6f4ef;display:flex;align-items:center;justify-content:center;padding:28px;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;text-align:center}'+
   '#ig5x .in{max-width:460px}#ig5x .ic{font-size:46px}#ig5x .kk{margin-top:18px;font-size:11px;letter-spacing:6px;text-transform:uppercase;color:#f05a1e;font-weight:700}'+
   '#ig5x h2{margin-top:14px;font-size:34px;font-weight:300;letter-spacing:-.8px;line-height:1.1}#ig5x h2 b{font-weight:700}'+
   '#ig5x p{margin-top:14px;font-size:16px;line-height:1.55;color:#b9b6ae;font-weight:300}'+
   '#ig5x button{margin-top:32px;background:linear-gradient(180deg,#ff7a3d 0%,#f05a1e 55%,#d9480f 100%);color:#fff;border:0;border-radius:999px;padding:22px 30px;font-size:19px;font-weight:800;letter-spacing:.2px;cursor:pointer;width:100%;max-width:360px;'+
   'box-shadow:0 0 0 0 rgba(240,90,30,.7),0 14px 40px rgba(240,90,30,.45),inset 0 1px 0 rgba(255,255,255,.35);animation:ig5p 1.8s ease-out infinite}'+
   '@keyframes ig5p{0%{box-shadow:0 0 0 0 rgba(240,90,30,.65),0 14px 40px rgba(240,90,30,.45),inset 0 1px 0 rgba(255,255,255,.35)}70%{box-shadow:0 0 0 18px rgba(240,90,30,0),0 14px 40px rgba(240,90,30,.45),inset 0 1px 0 rgba(255,255,255,.35)}100%{box-shadow:0 0 0 0 rgba(240,90,30,0),0 14px 40px rgba(240,90,30,.45),inset 0 1px 0 rgba(255,255,255,.35)}}'+
   '#ig5x button:active{transform:scale(.97)}'+
   '#ig5x button:disabled{opacity:.6}#ig5x .ok{margin-top:24px;font-size:16px;line-height:1.55;color:#f6f4ef}#ig5x .ok b{color:#f05a1e}';
   document.head.appendChild(s)}
  function stop(){try{document.querySelectorAll('video').forEach(function(v){v.pause()})}catch(e){}
    try{var y=document.getElementById('ytp');if(y&&y.parentNode)y.parentNode.removeChild(y)}catch(e){}}
  function esc(s){return String(s||'').replace(/[&<>"]/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]})}
  function show(d){if(shown)return;shown=true;stop();css();var who=esc(d.first||'the person who sent it');
    var el=document.createElement('div');el.id='ig5x';
    var done='<div class="ok">✅ Done! We let <b>'+who+'</b> know.<br>Watch for a text with your new link.</div>';
    el.innerHTML='<div class="in"><div class="ic">⏳</div><div class="kk">IGNYT 5 · The Blueprint</div><h2>This link has <b>expired.</b></h2>'+
      '<p>Your access to this video was only open for 1 hour.</p>'+
      (d.requested?done:'<button id="ig5xb" type="button">🔑 Ask '+who+' to reactivate it</button><div id="ig5xo"></div>')+'</div>';
    document.body.appendChild(el);document.documentElement.style.overflow='hidden';
    var b=document.getElementById('ig5xb');if(b)b.addEventListener('click',function(){b.disabled=true;b.style.animation='none';b.textContent='Sending…';
      post('/relink',{b:c}).then(function(){b.style.display='none';document.getElementById('ig5xo').innerHTML=done})
      .catch(function(){b.disabled=false;b.textContent='Try again'})})}
  function check(){post('/link',{b:c}).then(function(d){if(!d||d.error)return;
      if(!d.open)return show(d);
      if(d.exp){var wait=(d.grace?d.exp+45*60e3:d.exp)-(d.now||Date.now())+1500;clearTimeout(timer);timer=setTimeout(check,Math.max(5e3,Math.min(wait,2e9)))}
    }).catch(function(){})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check);else check();
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&!shown)check()});
})();
