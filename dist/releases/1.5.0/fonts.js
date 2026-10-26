(function(root){
'use strict';
const files=root.CrosswordFontFiles||{};
const system=['Arial','Georgia','Verdana','Tahoma','Trebuchet MS','Times New Roman','Courier New'];const cache=new Map();
function families(p){return [...new Set([p.gridFont,...Object.values(p.typography||{}).map(t=>t.family)].filter(Boolean))];}
async function load(family,p={}){if(typeof FontFace==='undefined')return;let parts=family==='Мой шрифт'?(p.customFont?[{data:p.customFont}]:[]):p.fontAssets?.[family]||files[family]||[];return Promise.all(parts.map(part=>{const src=part.data||part.url;const key=family+':'+src;if(!cache.has(key)){const pending=(async()=>{const face=new FontFace(family,'url('+JSON.stringify(src)+')',{style:'normal',weight:'400',unicodeRange:part.range||'U+0-10FFFF'});await face.load();document.fonts.add(face);})();cache.set(key,pending);pending.catch(()=>cache.delete(key));}return cache.get(key);}));}
async function loadProject(p){return Promise.all(families(p).map(f=>load(f,p)));}
root.CrosswordFonts={files,system,families,load,loadProject};
})(typeof window!=='undefined'?window:globalThis);
