(function(root){
'use strict';
const dataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Не удалось прочитать файл.'));r.readAsDataURL(blob);});
async function gif(buffer,maxEdge,onProgress){
 if(typeof Worker==='undefined')return CrosswordMediaCodec.optimizeGif(buffer,maxEdge,onProgress);
 return new Promise((resolve,reject)=>{
  let worker;try{worker=new Worker(new URL('media-worker.js?v=1.6.0',document.baseURI));}catch{resolve(CrosswordMediaCodec.optimizeGif(buffer,maxEdge,onProgress));return;}
  const timeout=setTimeout(()=>{worker.terminate();reject(Error('Сжатие заняло слишком много времени. Уменьшите исходный GIF.'));},120000);
  const finish=()=>{clearTimeout(timeout);worker.terminate();};
  worker.onmessage=e=>{if(e.data.progress!==undefined)onProgress(e.data.progress);if(e.data.error){finish();reject(Error(e.data.error));}else if(e.data.result){finish();resolve(e.data.result);}};
  worker.onerror=()=>{finish();try{resolve(CrosswordMediaCodec.optimizeGif(buffer,maxEdge,onProgress));}catch(e){reject(e);}};
  worker.postMessage({buffer,maxEdge});
 });
}
async function optimize(file,{maxEdge=1200,onProgress=()=>{}}={}){
 const buffer=await file.arrayBuffer(),bytes=new Uint8Array(buffer),isGIF=String.fromCharCode(...bytes.subarray(0,3))==='GIF';
 if(isGIF){const result=await gif(buffer,Math.min(maxEdge,800),onProgress);const blob=new Blob([result.bytes],{type:'image/gif'});return {...result,data:await dataURL(blob),size:blob.size,type:'image/gif'};}
 const source=await dataURL(file),img=new Image();img.src=source;await img.decode();
 const scale=Math.min(1,maxEdge/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));if(!blob)throw Error('Не удалось сжать изображение.');
 const smaller=blob.size<file.size;onProgress(1);return {data:smaller?await dataURL(blob):source,size:smaller?blob.size:file.size,originalBytes:file.size,optimized:smaller,type:smaller?blob.type:file.type,frames:1};
}
root.CrosswordMedia={optimize};
})(window);
