(()=>{
  'use strict';
  const ID='__igmi_panel_v2';
  if(document.getElementById(ID)){document.getElementById(ID).remove();return;}

  const state={
    items:new Map(),
    hideSmall:true,
    onlyLikely:false,
    query:'',
    perfObs:null,
    mutObs:null,
    fetchOriginal:null,
    xhrOpenOriginal:null,
    xhrSendOriginal:null,
    liveCapture:true,
    destroyed:false,
    targetId:'',
    targetUrl:location.href,
    scanTimer:null,
    captureCount:0
  };

  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));
  const decode=s=>String(s??'')
    .replace(/\\u0026/gi,'&')
    .replace(/\\u0025/gi,'%')
    .replace(/\\u003d/gi,'=')
    .replace(/\\u002f/gi,'/')
    .replace(/\\\//g,'/')
    .replace(/&amp;/g,'&');
  const norm=u=>{
    try{
      u=decode(u).trim().replace(/^['\"]|['\"]$/g,'');
      if(u.startsWith('//'))u='https:'+u;
      if(u.startsWith('blob:'))return u;
      return new URL(u,location.href).href;
    }catch{return'';}
  };
  const looksMedia=u=>{
    if(!u)return false;
    if(/^blob:/i.test(u))return true;
    if(!/^https?:\/\//i.test(u))return false;
    return /(?:scontent|cdninstagram|fbcdn|instagram)\./i.test(u) ||
      /\.(?:jpe?g|png|webp|avif|heic|mp4|m4v|mov)(?:[?#]|$)/i.test(u) ||
      /(?:stp=|dst-jpg|dst-png|video_versions|image_versions|image_url|display_url|thumbnail_url)/i.test(u);
  };
  const inferType=u=>{
    if(/^blob:/i.test(u))return 'unknown';
    if(/\.(?:mp4|m4v|mov)(?:[?#]|$)/i.test(u)||/[?&](?:mime_type|type)=video/i.test(u))return 'video';
    if(/\.(?:jpe?g|png|webp|avif|heic)(?:[?#]|$)/i.test(u)||/(?:dst-jpg|dst-png|stp=)/i.test(u))return 'image';
    return 'unknown';
  };
  const targetFromUrl=()=>{
    const u=location.href;
    let m=u.match(/[?&]story_media_id=(\d{8,})/i);
    if(m)return m[1].split('_')[0];
    m=u.match(/\/stories\/[^/]+\/(\d{8,})/i);
    if(m)return m[1];
    m=u.match(/\/reel\/([A-Za-z0-9_-]+)/i);
    return m?m[1]:'';
  };
  state.targetId=targetFromUrl();

  const scoreItem=x=>{
    let s=0;
    const area=(x.w||0)*(x.h||0);
    if(x.type==='image')s+=14;
    if(x.type==='video')s+=4;
    if(area>=900000)s+=28; else if(area>=400000)s+=18; else if(area>=120000)s+=8;
    if(x.h>x.w && x.w>=500 && x.h>=850)s+=16;
    const ratio=x.w&&x.h?x.w/x.h:0;
    if(ratio>0.52&&ratio<0.61)s+=10;
    if(/scontent|cdninstagram|fbcdn/i.test(x.url))s+=10;
    if(/dst-jpg|image_versions|display_url|image_url/i.test(x.url+' '+[...x.sources].join(' ')))s+=12;
    if([...x.sources].some(v=>/target/i.test(v)))s+=25;
    if([...x.sources].some(v=>/fetch response|xhr response/i.test(v)))s+=12;
    if([...x.sources].some(v=>/visible story/i.test(v)))s+=10;
    if(x.w&&x.h&&(x.w<220||x.h<220))s-=28;
    return s;
  };
  const add=(raw,source,meta={})=>{
    const url=norm(raw);
    if(!url||!looksMedia(url))return;
    let x=state.items.get(url);
    if(!x){
      x={url,type:inferType(url),w:0,h:0,sources:new Set(),notes:new Set(),probed:false,failed:false,firstSeen:Date.now()};
      state.items.set(url,x);
    }
    if(source)x.sources.add(source);
    if(meta.note)x.notes.add(meta.note);
    if(meta.type&&x.type==='unknown')x.type=meta.type;
    if(meta.width>x.w)x.w=meta.width;
    if(meta.height>x.h)x.h=meta.height;
    x.score=scoreItem(x);
  };

  const extractUrlsFromText=(text,source,max=900)=>{
    if(!text)return;
    text=String(text);
    const matches=text.match(/(?:https?:\\?\/\\?\/|https?:\/\/)[^\s\"'<>\\]{8,}|https?:\\\/\\\/[^\s\"'<>]{8,}/gi)||[];
    let n=0;
    for(const raw of matches){
      if(n>=max)break;
      const u=decode(raw.replace(/[),}\]]+$/,''));
      if(looksMedia(norm(u))){add(u,source);n++;}
    }
  };

  const extractJsonStrings=(obj,source,depth=0,seen=new WeakSet())=>{
    if(depth>14||obj==null)return;
    if(typeof obj==='string'){ if(looksMedia(norm(obj)))add(obj,source); return; }
    if(typeof obj!=='object')return;
    if(seen.has(obj))return; seen.add(obj);
    if(Array.isArray(obj)){ for(const v of obj.slice(0,1200))extractJsonStrings(v,source,depth+1,seen); return; }
    let isTarget=false;
    if(state.targetId){
      for(const k of ['id','pk','media_id','story_media_id']){
        const v=obj[k]; if(v!=null&&String(v).includes(state.targetId)){isTarget=true;break;}
      }
    }
    const src=isTarget?source+' • TARGET':source;
    let c=0;
    for(const [k,v] of Object.entries(obj)){
      if(c++>1200)break;
      if(typeof v==='string'&&(looksMedia(norm(v))||/url|src|image|video|display|thumbnail/i.test(k)))add(v,src,{note:k});
      else extractJsonStrings(v,src,depth+1,seen);
    }
  };

  const scanDOM=()=>{
    document.querySelectorAll('img').forEach(el=>{
      const r=el.getBoundingClientRect();
      const visible=r.width>180&&r.height>240&&r.bottom>0&&r.top<innerHeight;
      add(el.currentSrc||el.src,visible?'DOM img • visible story':'DOM img',{type:'image',width:el.naturalWidth,height:el.naturalHeight});
      (el.srcset||'').split(',').forEach(part=>add(part.trim().split(/\s+/)[0],'DOM srcset',{type:'image'}));
    });
    document.querySelectorAll('video').forEach(el=>{
      add(el.currentSrc||el.src,'DOM video',{type:'video',width:el.videoWidth,height:el.videoHeight});
      if(el.poster)add(el.poster,'Video poster',{type:'image'});
    });
    document.querySelectorAll('source').forEach(el=>add(el.src,'DOM source'));
    document.querySelectorAll('link[href]').forEach(el=>{if(/preload|prefetch/i.test(el.rel||''))add(el.href,'Preload / prefetch');});
    document.querySelectorAll('meta[content]').forEach(el=>{if(/image|video|thumbnail/i.test((el.property||'')+' '+(el.name||'')))add(el.content,'Meta tag');});
    document.querySelectorAll('[style*="url("]').forEach(el=>extractUrlsFromText(el.getAttribute('style'),'Inline CSS'));
  };

  const scanPerformance=()=>{
    try{performance.getEntriesByType('resource').forEach(e=>add(e.name,'Performance / network'));}catch{}
  };

  const scanEmbedded=()=>{
    let bytes=0;
    document.querySelectorAll('script').forEach(s=>{
      if(bytes>4200000)return;
      const t=s.textContent||''; bytes+=t.length;
      if(!t)return;
      const target=state.targetId&&t.includes(state.targetId);
      extractUrlsFromText(t,target?'Embedded data • TARGET':'Embedded data',target?1200:350);
      if((s.type||'').includes('json')||/^[\s]*[\[{]/.test(t)){
        try{extractJsonStrings(JSON.parse(t),target?'JSON script • TARGET':'JSON script');}catch{}
      }
    });
  };

  const scanPageHtml=()=>{
    try{
      const html=document.documentElement.innerHTML;
      const target=state.targetId&&html.includes(state.targetId);
      extractUrlsFromText(html,target?'Page HTML • TARGET':'Page HTML',target?1400:500);
    }catch{}
  };

  const probeOne=x=>{
    if(x.probed||x.failed)return;
    x.probed=true;
    const done=()=>{x.score=scoreItem(x);render();};
    const tryVideo=()=>{
      const v=document.createElement('video');
      v.preload='metadata'; v.muted=true;
      v.onloadedmetadata=()=>{x.type='video';x.w=v.videoWidth||x.w;x.h=v.videoHeight||x.h;done();};
      v.onerror=()=>{x.failed=true;done();};
      v.src=x.url;
    };
    if(x.type==='video'){tryVideo();return;}
    const im=new Image();
    im.onload=()=>{x.type='image';x.w=im.naturalWidth||x.w;x.h=im.naturalHeight||x.h;done();};
    im.onerror=()=>{if(x.type==='unknown')tryVideo();else{x.failed=true;done();}};
    im.src=x.url;
  };
  const probe=()=>{
    [...state.items.values()].sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,180).forEach(probeOne);
  };

  const scanAll=()=>{
    state.targetId=targetFromUrl()||state.targetId;
    scanDOM();scanPerformance();scanEmbedded();scanPageHtml();probe();render();
  };
  const scheduleScan=()=>{clearTimeout(state.scanTimer);state.scanTimer=setTimeout(scanAll,350);};

  const scanResponse=async(response,source)=>{
    try{
      const type=(response.headers?.get?.('content-type')||'').toLowerCase();
      if(!/json|text|javascript|graphql/.test(type))return;
      const clone=response.clone();
      const text=await clone.text();
      if(text.length>5000000)return;
      state.captureCount++;
      const target=state.targetId&&text.includes(state.targetId);
      extractUrlsFromText(text,target?source+' • TARGET':source,target?1800:650);
      if(/json/.test(type)||/^[\s]*[\[{]/.test(text)){
        try{extractJsonStrings(JSON.parse(text),target?source+' JSON • TARGET':source+' JSON');}catch{}
      }
      probe();render();
    }catch{}
  };

  const installLiveCapture=()=>{
    if(state.fetchOriginal)return;
    try{
      state.fetchOriginal=window.fetch;
      window.fetch=async function(...args){
        const res=await state.fetchOriginal.apply(this,args);
        scanResponse(res,'Fetch response');
        return res;
      };
    }catch{}
    try{
      state.xhrOpenOriginal=XMLHttpRequest.prototype.open;
      state.xhrSendOriginal=XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open=function(method,url,...rest){this.__igmi_url=url;return state.xhrOpenOriginal.call(this,method,url,...rest);};
      XMLHttpRequest.prototype.send=function(...args){
        this.addEventListener('load',()=>{
          try{
            const ct=(this.getResponseHeader('content-type')||'').toLowerCase();
            if(!/json|text|javascript|graphql/.test(ct))return;
            let text='';
            if(this.responseType===''||this.responseType==='text')text=this.responseText||'';
            else if(this.responseType==='json')text=JSON.stringify(this.response);
            if(!text||text.length>5000000)return;
            state.captureCount++;
            const target=state.targetId&&text.includes(state.targetId);
            extractUrlsFromText(text,target?'XHR response • TARGET':'XHR response',target?1800:650);
            try{extractJsonStrings(JSON.parse(text),target?'XHR JSON • TARGET':'XHR JSON');}catch{}
            probe();render();
          }catch{}
        },{once:true});
        return state.xhrSendOriginal.apply(this,args);
      };
    }catch{}
  };

  const restoreLiveCapture=()=>{
    try{if(state.fetchOriginal)window.fetch=state.fetchOriginal;}catch{}
    try{if(state.xhrOpenOriginal)XMLHttpRequest.prototype.open=state.xhrOpenOriginal;}catch{}
    try{if(state.xhrSendOriginal)XMLHttpRequest.prototype.send=state.xhrSendOriginal;}catch{}
    state.fetchOriginal=state.xhrOpenOriginal=state.xhrSendOriginal=null;
  };

  const copyText=t=>{
    if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(t).catch(()=>prompt('Copy URL',t));
    prompt('Copy URL',t);
  };
  const openUrl=u=>window.open(u,'_blank','noopener');
  const downloadUrl=async x=>{
    try{
      const r=await fetch(x.url,{credentials:'include'});if(!r.ok)throw new Error('HTTP '+r.status);
      const b=await r.blob();
      const ext=x.type==='video'?'mp4':(b.type.includes('png')?'png':b.type.includes('webp')?'webp':'jpg');
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`instagram-media-${Date.now()}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),15000);
    }catch{openUrl(x.url);}
  };
  const exportJson=()=>{
    const arr=[...state.items.values()].map(x=>({url:x.url,type:x.type,width:x.w,height:x.h,score:scoreItem(x),sources:[...x.sources],notes:[...x.notes]}));
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({page:location.href,targetId:state.targetId,created:new Date().toISOString(),items:arr},null,2)],{type:'application/json'}));a.download='ig-media-inspector-results.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),15000);
  };

  const label=x=>{
    const s=scoreItem(x);
    if(s>=62)return 'LIKELY ORIGINAL / BACKGROUND';
    if(s>=40)return 'HIGH-VALUE CANDIDATE';
    return x.type.toUpperCase();
  };

  const render=()=>{
    const box=document.getElementById(ID);if(!box)return;
    const list=box.querySelector('#igmi_list');
    const q=(box.querySelector('#igmi_q').value||'').toLowerCase().trim();
    let arr=[...state.items.values()].map(x=>{x.score=scoreItem(x);return x;});
    arr=arr.filter(x=>!q||x.url.toLowerCase().includes(q)||[...x.sources].join(' ').toLowerCase().includes(q)||[...x.notes].join(' ').toLowerCase().includes(q));
    if(state.hideSmall)arr=arr.filter(x=>!x.w||!x.h||x.w>=240||x.h>=320);
    if(state.onlyLikely)arr=arr.filter(x=>(x.score||0)>=40);
    arr.sort((a,b)=>(b.score||0)-(a.score||0)||((b.w*b.h)-(a.w*a.h)));
    box.querySelector('#igmi_count').textContent=`${arr.length} shown • ${state.items.size} found`;
    box.querySelector('#igmi_target').textContent=state.targetId?`Target ID: ${state.targetId}`:'Target ID: auto';
    box.querySelector('#igmi_capturecount').textContent=`Captured responses: ${state.captureCount}`;

    list.innerHTML=arr.slice(0,260).map((x,i)=>{
      const src=[...x.sources].slice(0,4).join(' • ');
      const dimensions=x.w&&x.h?`${x.w}×${x.h}`:'size checking…';
      const badge=label(x);
      const preview=x.type==='video'
        ?`<video src="${esc(x.url)}" muted playsinline preload="metadata" style="max-width:100%;max-height:100%;object-fit:contain"></video>`
        :`<img src="${esc(x.url)}" loading="lazy" style="max-width:100%;max-height:100%;object-fit:contain">`;
      return `<article style="border:1px solid #334155;border-radius:12px;padding:9px;margin:8px 0;background:#0f172a"><div style="display:flex;gap:9px"><div style="width:82px;height:116px;flex:0 0 82px;background:#020617;border-radius:9px;overflow:hidden;display:grid;place-items:center">${preview}</div><div style="min-width:0;flex:1"><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><b style="font-size:11px;background:${(x.score||0)>=62?'#14532d':(x.score||0)>=40?'#713f12':'#1e293b'};padding:3px 6px;border-radius:999px">${esc(badge)}</b><span style="font-size:11px;color:#cbd5e1">${dimensions}</span><span style="font-size:10px;color:#94a3b8">score ${x.score||0}</span></div><div style="font-size:10px;color:#94a3b8;margin-top:5px;line-height:1.3">${esc(src)}</div><div style="font-size:9px;color:#64748b;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(x.url)}</div><div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px"><button data-a="open" data-i="${i}">Open</button><button data-a="copy" data-i="${i}">Copy URL</button><button data-a="down" data-i="${i}">Download</button></div></div></div></article>`;
    }).join('')||'<div style="padding:18px 8px;color:#94a3b8;line-height:1.5">No useful media found yet.<br><br>Keep this panel open, move to the previous/next Story and back to the target, then tap <b>Rescan</b>. Live capture will inspect new Instagram responses.</div>';

    list.querySelectorAll('button[data-a]').forEach(btn=>btn.onclick=()=>{
      const x=arr[+btn.dataset.i];if(!x)return;
      if(btn.dataset.a==='open')openUrl(x.url);
      else if(btn.dataset.a==='copy')copyText(x.url);
      else if(btn.dataset.a==='down')downloadUrl(x);
    });
  };

  const makeButtonStyles=root=>root.querySelectorAll('button').forEach(b=>b.style.cssText='border:1px solid #475569;background:#1e293b;color:#fff;border-radius:8px;padding:6px 9px;font:600 11px system-ui;cursor:pointer');

  const box=document.createElement('div');
  box.id=ID;
  box.style.cssText='position:fixed;z-index:2147483647;right:7px;top:7px;width:min(96vw,410px);max-height:94vh;overflow:hidden;background:#111827;color:#f8fafc;border:1px solid #475569;border-radius:15px;box-shadow:0 24px 80px #000a;font:13px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-align:left';
  box.innerHTML=`
    <div style="padding:10px 11px;border-bottom:1px solid #334155;display:flex;align-items:center;gap:8px;background:#0b1220">
      <b style="flex:1;font-size:14px">IG Media Inspector</b>
      <span id="igmi_count" style="font-size:10px;color:#cbd5e1"></span>
      <button id="igmi_x">✕</button>
    </div>
    <div style="padding:9px;border-bottom:1px solid #334155">
      <div style="font-size:10px;color:#94a3b8;display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap"><span id="igmi_target"></span><span id="igmi_capturecount"></span></div>
      <input id="igmi_q" placeholder="Filter: jpg, image, TARGET, scontent…" style="box-sizing:border-box;width:100%;margin-top:7px;padding:8px 9px;border-radius:8px;border:1px solid #475569;background:#020617;color:white;outline:none">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:7px"><button id="igmi_scan">Rescan</button><button id="igmi_likely">Likely only: OFF</button><button id="igmi_small">Hide tiny: ON</button><button id="igmi_export">Export JSON</button></div>
      <div style="font-size:10px;color:#cbd5e1;margin-top:8px;line-height:1.35;background:#172033;border-radius:8px;padding:7px">Private content is inspected only through your existing Instagram session. No password or cookie is collected. For a target not shown yet, keep this panel open and move Story → previous/next → back.</div>
    </div>
    <div id="igmi_list" style="padding:7px;overflow:auto;max-height:70vh"></div>`;
  document.body.appendChild(box);makeButtonStyles(box);

  box.querySelector('#igmi_x').onclick=()=>{
    state.destroyed=true;
    try{state.perfObs?.disconnect();}catch{}
    try{state.mutObs?.disconnect();}catch{}
    restoreLiveCapture();
    box.remove();
  };
  box.querySelector('#igmi_scan').onclick=scanAll;
  box.querySelector('#igmi_q').oninput=render;
  box.querySelector('#igmi_likely').onclick=e=>{state.onlyLikely=!state.onlyLikely;e.target.textContent='Likely only: '+(state.onlyLikely?'ON':'OFF');render();};
  box.querySelector('#igmi_small').onclick=e=>{state.hideSmall=!state.hideSmall;e.target.textContent='Hide tiny: '+(state.hideSmall?'ON':'OFF');render();};
  box.querySelector('#igmi_export').onclick=exportJson;

  installLiveCapture();
  try{
    state.perfObs=new PerformanceObserver(list=>{for(const e of list.getEntries())add(e.name,'Live network');probe();render();});
    state.perfObs.observe({type:'resource',buffered:true});
  }catch{}
  try{
    state.mutObs=new MutationObserver(scheduleScan);
    state.mutObs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset','poster','style']});
  }catch{}

  scanAll();
})();
