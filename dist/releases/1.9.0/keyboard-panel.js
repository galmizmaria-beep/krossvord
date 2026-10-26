(function(root){
'use strict';
const width=400,height=228;
function clamp(x,y){return {x:Math.round(Math.max(12,Math.min(1280-width-12,x))),y:Math.round(Math.max(12,Math.min(720-height-12,y)))};}
function mount(game,keyboard,{label,closeLabel,onClose}){
 const keys=document.createElement('div');keys.className='cw-keyboard-keys';keys.append(...keyboard.children);
 const header=document.createElement('div');header.className='cw-keyboard-header';
 const grip=document.createElement('div');grip.className='cw-keyboard-grip';grip.tabIndex=0;grip.setAttribute('role','button');grip.setAttribute('aria-label',label);grip.innerHTML='<span aria-hidden="true">⠿</span>';const title=document.createElement('span');title.textContent=label;grip.append(title);
 const close=document.createElement('button');close.className='cw-keyboard-close';close.type='button';close.textContent='×';close.setAttribute('aria-label',closeLabel);close.title=closeLabel;close.onpointerdown=e=>e.preventDefault();close.onclick=onClose;header.append(grip,close);keyboard.replaceChildren(header,keys);keyboard.setAttribute('role','group');keyboard.setAttribute('aria-label',label);
 let position={x:844,y:464},drag=null;
 function paint(){Object.assign(keyboard.style,{left:position.x+'px',top:position.y+'px',right:'auto',bottom:'auto'});}
 function down(e){if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();const bounds=game.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,start:{...position},scale:bounds.width/1280||1,pointerId:e.pointerId};try{grip.setPointerCapture?.(e.pointerId);}catch{}}
 function move(e){if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();position=clamp(drag.start.x+(e.clientX-drag.x)/drag.scale,drag.start.y+(e.clientY-drag.y)/drag.scale);paint();}
 function end(e){if(!drag||e.pointerId!==drag.pointerId)return;if(e.type==='pointercancel'){position=drag.start;paint();}drag=null;}
 function arrows(e){if(!e.key.startsWith('Arrow'))return;e.preventDefault();e.stopPropagation();const step=e.shiftKey?10:1;position=clamp(position.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),position.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));paint();}
 function escape(e){if(e.key==='Escape'&&!keyboard.hidden){e.preventDefault();e.stopPropagation();drag=null;onClose();}}
 grip.addEventListener('pointerdown',down);grip.addEventListener('keydown',arrows);game.addEventListener('keydown',escape);root.addEventListener('pointermove',move,{passive:false});root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);paint();
 return ()=>{grip.removeEventListener('pointerdown',down);grip.removeEventListener('keydown',arrows);game.removeEventListener('keydown',escape);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',end);root.removeEventListener('pointercancel',end);};
}
root.CrosswordKeyboard={mount,clamp,width,height};
})(typeof window!=='undefined'?window:globalThis);
