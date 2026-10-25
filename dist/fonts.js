(function(root){
'use strict';
const files=root.CrosswordFontFiles||{};
const system=['Arial','Georgia','Verdana','Tahoma','Trebuchet MS','Times New Roman','Courier New'];const cache=new Map();
const variants={};
for(const [name,family,embedded,weight,style]of [
 ['Comic Sans MS','Comic Sans MS','Comic Relief','400','normal'],['Comic Sans MS Bold','Comic Sans MS','Comic Relief','700','normal'],['Comic Sans MS Italic','Comic Sans MS','Comic Relief','400','italic'],['Comic Sans MS Bold Italic','Comic Sans MS','Comic Relief','700','italic'],
 ['Comic Neue Light','Comic Neue','Comic Neue','300','normal'],['Comic Neue Bold','Comic Neue','Comic Neue','700','normal'],['Comic Neue Italic','Comic Neue','Comic Neue','400','italic'],['Comic Neue Light Italic','Comic Neue','Comic Neue','300','italic'],['Comic Neue Bold Italic','Comic Neue','Comic Neue','700','italic'],['Comic Relief Bold','Comic Relief','Comic Relief','700','normal']])variants[name]={family,embedded,weight,style,force:name!==family};
function resolve(name){return variants[name]||{family:name,embedded:name,weight:'400',style:'normal',force:false};}
function cssFamily(name){const meta=resolve(name);return JSON.stringify(meta.family)+(/^Comic /.test(meta.family)&&meta.family!=='Comic Relief'?','+JSON.stringify('Comic Relief'):'');}
function sampleStyle(name){const meta=resolve(name);return 'font-family:'+cssFamily(name)+';font-weight:'+meta.weight+';font-style:'+meta.style;}
function options(){return [...new Set([...system,...Object.keys(files),...Object.keys(variants)])];}
function families(p){const selected=[...new Set([p.gridFont,...Object.values(p.typography||{}).map(t=>t.family)].filter(Boolean))];if(selected.some(f=>resolve(f).family==='Comic Neue'))selected.push('Comic Relief');return [...new Set(selected)];}
function parts(family,p={}){return p.fontAssets?.[family]||files[resolve(family).embedded]||[];}
async function load(family,p={}){if(typeof FontFace==='undefined')return;const meta=resolve(family),name=meta.embedded;const list=family==='Мой шрифт'?(p.customFont?[{data:p.customFont}]:[]):parts(family,p);return Promise.all(list.map(part=>{const src=part.data||part.url,style=part.style||'normal',weight=part.weight||'400';const key=name+':'+style+':'+weight+':'+src;if(!cache.has(key)){const pending=(async()=>{const face=new FontFace(name,'url('+JSON.stringify(src)+')',{style,weight,unicodeRange:part.range||'U+0-10FFFF'});await face.load();document.fonts.add(face);})();cache.set(key,pending);pending.catch(()=>cache.delete(key));}return cache.get(key);}));}
async function loadProject(p){return Promise.all(families(p).map(f=>load(f,p)));}
root.CrosswordFonts={files,system,families,load,loadProject,resolve,cssFamily,sampleStyle,options,parts,variants};
})(typeof window!=='undefined'?window:globalThis);
