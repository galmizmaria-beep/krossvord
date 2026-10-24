(function(root){
'use strict';
const css=`.cw-overlay-frame{position:absolute;z-index:30;border:2px solid #32c35a;pointer-events:none;box-sizing:border-box}.cw-overlay-frame button{position:absolute!important;width:14px!important;height:14px!important;min-width:0!important;padding:0!important;border:2px solid white!important;border-radius:2px!important;background:#32c35a!important;color:#32c35a!important;pointer-events:auto;touch-action:none;box-shadow:0 0 0 1px #20a645}.cw-overlay-frame [data-corner=nw]{left:-8px;top:-8px;cursor:nwse-resize}.cw-overlay-frame [data-corner=ne]{right:-8px;top:-8px;cursor:nesw-resize}.cw-overlay-frame [data-corner=sw]{left:-8px;bottom:-8px;cursor:nesw-resize}.cw-overlay-frame [data-corner=se]{right:-8px;bottom:-8px;cursor:nwse-resize}.cw-game.edit-overlays .cw-cat-image,.cw-game.edit-overlays .cw-bubble{cursor:move;touch-action:none;user-select:none}.cw-overlay-frame[hidden]{display:none}`;
function constrain(rect,kind){return root.CrosswordStage.overlayRect(rect,kind);}
function move(rect,dx,dy,kind){return constrain({...rect,x:rect.x+dx,y:rect.y+dy},kind);}
function resize(rect,dx,dy,corner,kind){
 const west=corner.includes('w'),north=corner.includes('n');let width=rect.width+(west?-dx:dx),height=rect.height+(north?-dy:dy);
 if(kind==='cat'){const ratio=rect.width/rect.height;if(Math.abs(dx)>=Math.abs(dy*ratio))height=width/ratio;else width=height*ratio;const minimum=Math.max(48/width,48/height,1);if(width>0&&height>0){width*=minimum;height*=minimum;}else{width=48*Math.max(1,ratio);height=width/ratio;}}
 else{width=Math.max(120,width);height=Math.max(44,height);}
 const anchorX=west?rect.x+rect.width:rect.x,anchorY=north?rect.y+rect.height:rect.y;
 const maxWidth=west?anchorX:1280-anchorX,maxHeight=north?anchorY:720-anchorY;
 if(kind==='cat'){const scale=Math.min(1,maxWidth/width,maxHeight/height);width*=scale;height*=scale;}else{width=Math.min(width,maxWidth);height=Math.min(height,maxHeight);}
 return constrain({x:west?anchorX-width:anchorX,y:north?anchorY-height:anchorY,width,height},kind);
}
function mount(game,project,options){
 game.classList.add('edit-overlays');const style=document.createElement('style');style.textContent=css;game.append(style);
 const frame=document.createElement('div');frame.className='cw-overlay-frame';frame.hidden=true;
 for(const corner of ['nw','ne','sw','se']){const handle=document.createElement('button');handle.type='button';handle.dataset.corner=corner;handle.setAttribute('aria-label','Изменить размер');frame.append(handle);}game.append(frame);
 const targets={cat:game.querySelector('.cw-cat-image'),bubble:game.querySelector('.cw-bubble')};
 let selected=null,drag=null;const rects={cat:root.CrosswordStage.projectRect(project,'cat'),bubble:root.CrosswordStage.projectRect(project,'bubble')};
 function paint(){if(!selected)return;const r=rects[selected];Object.assign(frame.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});root.CrosswordStage.applyOverlayRect(game,selected,r);}
 function select(kind){if(kind&&(!project.cat||(kind==='bubble'&&!project.catBubble)))kind=null;selected=kind;frame.hidden=!kind;options.onOverlaySelect?.(kind);paint();}
 function down(e,kind,corner){if(e.button!==undefined&&e.button!==0)return;e.preventDefault();e.stopPropagation();select(kind);if(!selected)return;try{e.target.setPointerCapture?.(e.pointerId);}catch{}const bounds=game.getBoundingClientRect();drag={kind,corner,rect:{...rects[kind]},x:e.clientX,y:e.clientY,scale:bounds.width/1280||1,pointerId:e.pointerId};}
 function motion(e){if(!drag||e.pointerId!==drag.pointerId)return;e.preventDefault();const dx=(e.clientX-drag.x)/drag.scale,dy=(e.clientY-drag.y)/drag.scale;rects[drag.kind]=drag.corner?resize(drag.rect,dx,dy,drag.corner,drag.kind):move(drag.rect,dx,dy,drag.kind);paint();}
 function end(e){if(!drag||e.pointerId!==drag.pointerId)return;const session=drag;drag=null;if(e.type==='pointercancel'){rects[session.kind]=session.rect;paint();return;}if(JSON.stringify(session.rect)!==JSON.stringify(rects[session.kind]))options.onOverlayChange?.(session.kind,{...rects[session.kind]});}
 function outside(e){if(!Object.values(targets).some(t=>t?.contains(e.target))&&!frame.contains(e.target))select(null);}
 const handlers=[];for(const [kind,target]of Object.entries(targets)){const handler=e=>down(e,kind);target.addEventListener('pointerdown',handler);handlers.push([target,handler]);}
 const handleDown=e=>{const corner=e.target.dataset.corner;if(corner&&selected)down(e,selected,corner);};frame.addEventListener('pointerdown',handleDown);game.addEventListener('pointerdown',outside);root.addEventListener('pointermove',motion,{passive:false});root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);select(options.selectedOverlay||null);
 return ()=>{handlers.forEach(([target,handler])=>target.removeEventListener('pointerdown',handler));game.removeEventListener('pointerdown',outside);root.removeEventListener('pointermove',motion);root.removeEventListener('pointerup',end);root.removeEventListener('pointercancel',end);frame.remove();style.remove();};
}
root.CrosswordOverlayEditor={mount,move,resize};
})(window);
