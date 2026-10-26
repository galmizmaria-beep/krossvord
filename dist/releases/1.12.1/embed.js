(function(root){
'use strict';
const playerURL='https://galmizmaria-beep.github.io/krossvord/dist/player.html';
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function encode(project){
 const p=JSON.parse(JSON.stringify(project));delete p.fontAssets;delete p.description;delete p.hideStartScreenInEditor;
 const bytes=new TextEncoder().encode(JSON.stringify(p));
 if(bytes.length>16000000){const error=Error('Игра превышает размер данных для вставки по ссылке. Скачайте автономный HTML: качество всех изображений сохранится.');error.code='EMBED_TOO_LARGE';throw error;}
 if(typeof CompressionStream==='function'){
  const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return 'z.'+base64(new Uint8Array(await new Response(stream).arrayBuffer()));
 }
 return 'j.'+base64(bytes);
}
async function decode(value,embedded=false){
 if(value.length>(embedded?24000000:2000000))throw Error('Ссылка слишком большая. Используйте HTML-файл игры.');
 const [kind,data]=value.split('.');if(!['j','z'].includes(kind)||!data)throw Error('Некорректная ссылка на игру.');
 let bytes=Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 if(kind==='z'){
  if(typeof DecompressionStream!=='function')throw Error('Обновите браузер для запуска игры.');
  const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
  const chunks=[];let size=0;for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>16000000){await reader.cancel();throw Error('Данные игры слишком большие.');}chunks.push(value);}
  bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 }
 return JSON.parse(new TextDecoder().decode(bytes));
}
async function create(project){
 const fragment=await encode(project);const url=playerURL+'?v=1.12.1#'+fragment;
 if(fragment.length>2000000){
  const base=playerURL.slice(0,playerURL.lastIndexOf('/')+1);
  const scripts=['embed.js','i18n.js','font-files.js','comic-fonts.js','fonts.min.js','engine.min.js','companions.js','stage.min.js','keyboard-panel.min.js','game.min.js','player.js'];
  const html='<!doctype html><html><head><meta charset="utf-8"><base href="'+base+'"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#game{width:100vw;height:100vh;position:relative}</style></head><body><main id="game"></main><script type="application/json" id="crossword-payload">'+fragment+'</script>'+scripts.map(file=>'<script src="'+file+'?v=1.12.1"></script>').join('')+'</body></html>';
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
root.CrosswordEmbed={encode,decode,create,prepare,iframe,playerURL};
})(typeof window!=='undefined'?window:globalThis);
