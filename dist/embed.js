(function(root){
'use strict';
const playerURL='https://galmizmaria-beep.github.io/krossvord/dist/player.html';
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function encode(project){
 const p=JSON.parse(JSON.stringify(project));delete p.fontAssets;delete p.description;delete p.hideStartScreenInEditor;
 const bytes=new TextEncoder().encode(JSON.stringify(p));
 if(typeof CompressionStream==='function'){
  const stream=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return 'z.'+base64(new Uint8Array(await new Response(stream).arrayBuffer()));
 }
 return 'j.'+base64(bytes);
}
async function decode(value){
 if(value.length>2000000)throw Error('Ссылка слишком большая. Используйте HTML-файл игры.');
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
 const fragment=await encode(project);const url=playerURL+'?v=1.11.4#'+fragment;
 if(url.length>60000)throw Error('Медиа делают ссылку слишком длинной. Скачайте HTML, разместите его на своём хостинге и вставьте адрес ниже.');
 return {url,code:iframe(url),bytes:url.length};
}
function iframe(url){const u=new URL(url);if(u.protocol!=='https:')throw Error('Нужна HTTPS-ссылка на игру.');const safe=u.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;');return '<iframe src="'+safe+'" width="1280" height="720" style="width:100%;height:100%;aspect-ratio:16/9;border:0;display:block;background:transparent" title="Crossword game" allow="fullscreen" allowfullscreen></iframe>';}
root.CrosswordEmbed={encode,decode,create,iframe,playerURL};
})(typeof window!=='undefined'?window:globalThis);
