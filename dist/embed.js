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
 const fragment=await encode(project);const url=playerURL+'?v=1.11.9#'+fragment;
 if(url.length>60000){const error=Error('Медиа делают ссылку слишком длинной. Скачайте HTML, разместите его на своём хостинге и вставьте адрес ниже.');error.code='EMBED_TOO_LARGE';throw error;}
 return {url,code:iframe(url),bytes:url.length};
}
function iframe(url){const u=new URL(url);if(u.protocol!=='https:')throw Error('Нужна HTTPS-ссылка на игру.');const safe=u.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;');return '<iframe src="'+safe+'" width="1280" height="720" style="width:100%;height:100%;aspect-ratio:16/9;border:0;display:block;background:transparent" title="Crossword game" allow="fullscreen" allowfullscreen></iframe>';}
async function prepare(project,{optimizeImage,onProgress=()=>{}}={}){
 const p=JSON.parse(JSON.stringify(project));delete p.fontAssets;
 p.layout.words=p.layout.words.map(({id,answer,r,c,dir,num})=>({id,answer,r,c,dir,num}));
 let sizeError;try{return {...await create(p),optimizedImages:0};}catch(error){if(error.code!=='EMBED_TOO_LARGE')throw error;sizeError=error;}
 if(!optimizeImage)throw sizeError;
 const images=[];
 const remember=(object,key)=>{const source=object?.[key];if(typeof source==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(source))images.push({object,key,source});};
 remember(p,'backgroundAsset');remember(p,'catAsset');for(const key of Object.keys(p.catStates||{}))remember(p.catStates,key);for(const word of p.words)remember(word,'image');
 if(!images.length)throw sizeError;
 for(const [maxEdge,quality] of [[960,.72],[800,.6],[640,.5],[480,.45],[360,.4]]){
  onProgress('Подготавливаем картинки для вставки: '+maxEdge+' px…');
  const results=new Map();
  for(const image of images){
   if(!results.has(image.source)){try{results.set(image.source,await optimizeImage(image.source,maxEdge,quality));}catch(error){sizeError.message='Не удалось подготовить картинку для короткой ссылки. Скачайте HTML игры ниже, разместите его на хостинге и укажите HTTPS-адрес.';throw sizeError;}}
   const result=results.get(image.source);if(typeof result==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(result)&&result.length<image.object[image.key].length)image.object[image.key]=result;
  }
  try{return {...await create(p),optimizedImages:new Set(images.filter(image=>image.object[image.key]!==image.source).map(image=>image.source)).size};}catch(error){if(error.code!=='EMBED_TOO_LARGE')throw error;sizeError=error;}
 }
 throw sizeError;
}
root.CrosswordEmbed={encode,decode,create,prepare,iframe,playerURL};
})(typeof window!=='undefined'?window:globalThis);
