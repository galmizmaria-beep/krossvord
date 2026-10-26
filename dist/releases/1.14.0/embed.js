(function(root){
'use strict';
// Old srcdoc exports already contain relative script URLs. Keep their original runtime.
if(typeof document!=='undefined'&&document.currentScript){const source=new URL(document.currentScript.src,document.baseURI);if(source.pathname.endsWith('/dist/embed.js')&&source.searchParams.get('v')==='1.12.1'&&document.getElementById('crossword-payload')){const base=document.querySelector('base');if(base)base.href=new URL('releases/1.12.1/',source).href;}}

const version='1.14.0',maxProjectBytes=64*1024*1024,maxLinkChars=2000000,maxEmbeddedChars=90000000;
const playerURL='https://galmizmaria-beep.github.io/krossvord/dist/releases/'+version+'/player.html';
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function encode(project){
 const p=JSON.parse(JSON.stringify(project));delete p.fontAssets;delete p.description;delete p.hideStartScreenInEditor;
 const bytes=new TextEncoder().encode(JSON.stringify(p));
 if(bytes.length>maxProjectBytes){const error=Error('Общий объём данных игры превышает 64 МБ. Скачайте автономный HTML или удалите ненужные вложения.');error.code='EMBED_TOO_LARGE';throw error;}
 if(typeof CompressionStream==='function'){
  const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return 'z.'+base64(new Uint8Array(await new Response(stream).arrayBuffer()));
 }
 return 'j.'+base64(bytes);
}
async function decode(value,embedded=false){
 if(value.length>(embedded?maxEmbeddedChars:maxLinkChars))throw Error('Ссылка слишком большая. Используйте HTML-файл игры.');
 const [kind,data]=value.split('.');if(!['j','z'].includes(kind)||!data)throw Error('Некорректная ссылка на игру.');
 let bytes=Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 if(kind==='z'){
  if(typeof DecompressionStream!=='function')throw Error('Обновите браузер для запуска игры.');
  const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
  const chunks=[];let size=0;for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>maxProjectBytes){await reader.cancel();throw Error('Данные игры слишком большие.');}chunks.push(value);}
  bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 }
 if(bytes.length>maxProjectBytes)throw Error('Данные игры превышают 64 МБ.');
 return JSON.parse(new TextDecoder().decode(bytes));
}
async function create(project){
 const fragment=await encode(project);const url=playerURL+'#'+fragment;
 if(url.length>maxLinkChars){
  const runtimeBase=playerURL.slice(0,playerURL.lastIndexOf('/')+1),base=new URL('../../',runtimeBase).href;
  const scripts=['embed.js','i18n.js','font-files.js','comic-fonts.js','fonts.min.js','engine.min.js','companions.js','stage.min.js','keyboard-panel.min.js','math.js','game.min.js','player.js'];
  const html='<!doctype html><html><head><meta charset="utf-8"><base href="'+base+'"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#game{width:100vw;height:100vh;position:relative}</style></head><body><main id="game"></main><script type="application/json" id="crossword-payload">'+fragment+'</script>'+scripts.map(file=>'<script src="'+runtimeBase+file+'?v=1.14.0"></script>').join('')+'</body></html>';
  const escaped=html.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const code='<iframe srcdoc="'+escaped+'" width="1280" height="720" style="width:100%;height:100%;aspect-ratio:16/9;border:0;display:block;background:transparent" title="Crossword game" allow="fullscreen" allowfullscreen></iframe>';
  return {code,html,bytes:code.length};
 }
 return {url,code:iframe(url),bytes:url.length};
}
function iframe(url){const u=new URL(url);if(u.protocol!=='https:')throw Error('Нужна HTTPS-ссылка на игру.');const safe=u.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;');return '<iframe src="'+safe+'" width="1280" height="720" style="width:100%;height:100%;aspect-ratio:16/9;border:0;display:block;background:transparent" title="Crossword game" allow="fullscreen" allowfullscreen></iframe>';}
async function prepare(project){
 const p=JSON.parse(JSON.stringify(project));delete p.fontAssets;
 p.layout.words=p.layout.words.map(({id,answer,r,c,dir,num})=>({id,answer,r,c,dir,num}));
 return create(p);
}
root.CrosswordEmbed={encode,decode,create,prepare,iframe,playerURL,version,limits:{maxProjectBytes,maxLinkChars,maxEmbeddedChars}};
})(typeof window!=='undefined'?window:globalThis);
