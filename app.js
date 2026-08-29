(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  let bookmarklet='';
  let deferredPrompt=null;

  const setStatus=(el,msg,ok=true)=>{el.textContent=msg;el.style.color=ok?'#86efac':'#fca5a5';};
  const validInstagramUrl=value=>{
    try{const u=new URL(value);return /(^|\.)instagram\.com$/i.test(u.hostname);}catch{return false;}
  };
  const copy=async text=>{
    try{await navigator.clipboard.writeText(text);return true;}catch{
      const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok;
    }
  };

  async function loadBookmarklet(){
    try{
      const r=await fetch('bookmarklet.txt',{cache:'no-store'});bookmarklet=(await r.text()).trim();
      $('#bookmarkletPreview').textContent=bookmarklet.slice(0,120)+'…';
      $('#bookmarkletLink').href=bookmarklet;
    }catch{
      $('#bookmarkletPreview').textContent='Could not load bookmarklet.txt';
      setStatus($('#bookmarkStatus'),'Reload this page and try again.',false);
    }
  }

  $('#openLogin').addEventListener('click',()=>window.open('https://www.instagram.com/accounts/login/','_blank','noopener'));
  $('#openStory').addEventListener('click',()=>{
    const v=$('#storyUrl').value.trim();
    if(!validInstagramUrl(v)){setStatus($('#urlStatus'),'Paste a valid instagram.com Story/Highlight link first.',false);return;}
    try{localStorage.setItem('igmi:lastStoryUrl',v);}catch{}
    setStatus($('#urlStatus'),'Opening the link on official Instagram…');
    window.open(v,'_blank','noopener');
  });
  $('#copyStory').addEventListener('click',async()=>{
    const v=$('#storyUrl').value.trim();
    if(!v){setStatus($('#urlStatus'),'Nothing to copy.',false);return;}
    setStatus($('#urlStatus'),await copy(v)?'Story link copied.':'Copy failed.',true);
  });
  $('#copyBookmarklet').addEventListener('click',async()=>{
    if(!bookmarklet){setStatus($('#bookmarkStatus'),'Inspector is still loading. Try again.',false);return;}
    const ok=await copy(bookmarklet);
    setStatus($('#bookmarkStatus'),ok?'Copied. Create a bookmark named “IG Media Inspector” and paste this into its URL field.':'Could not copy automatically. Long-press the code and copy it manually.',ok);
  });
  $('#bookmarkletLink').addEventListener('click',e=>{
    if(location.hostname.includes('github.io')||location.protocol.startsWith('http')){
      e.preventDefault();
      setStatus($('#bookmarkStatus'),'This button is mainly for dragging on desktop. On Android, use “Copy Inspector Bookmark” and save it as a bookmark URL.');
    }
  });

  try{const last=localStorage.getItem('igmi:lastStoryUrl');if(last)$('#storyUrl').value=last;}catch{}

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installPwa').classList.remove('hidden');});
  $('#installPwa').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installPwa').classList.add('hidden');});

  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  loadBookmarklet();
})();
