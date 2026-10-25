(function(root){
'use strict';
const width=1280,height=720;
const css=`
.cw-stage{position:relative;overflow:hidden;aspect-ratio:16/9;background:transparent;isolation:isolate}
.game-frame.cw-stage{min-height:0!important;background-color:transparent;background-image:linear-gradient(45deg,#e1e5eb 25%,transparent 25%),linear-gradient(-45deg,#e1e5eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e1e5eb 75%),linear-gradient(-45deg,transparent 75%,#e1e5eb 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}
.cw-stage .cw-game{position:absolute;left:50%;top:50%;width:1280px!important;height:720px!important;min-height:0!important;margin:0;transform:translate(-50%,-50%) scale(var(--stage-scale,1));transform-origin:center;display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:42px minmax(0,1fr) auto auto;gap:14px 28px;padding:28px 36px!important;box-sizing:border-box;overflow:hidden;background-image:none}
.cw-stage .cw-game:before,.cw-stage .cw-game:after,.cw-stage .cw-foot{display:none}
.cw-stage .cw-game.transparent-bg{background:transparent!important}
.cw-stage .cw-game .cw-stats{grid-column:1;grid-row:1;font-size:16px;gap:28px;padding:8px;border-top:0}
.cw-stage .cw-game .hearts{font-size:21px}
.cw-stage .cw-game .cw-content{display:contents}
.cw-stage .cw-game .cw-grid-wrap{grid-column:1;grid-row:2;min-width:0;min-height:0;padding:0;overflow:hidden}
.cw-stage .cw-game .cw-grid{width:var(--board-width,480px)!important;max-width:100%;height:var(--board-height,480px)!important;aspect-ratio:auto;gap:3px}
.cw-stage .cw-game .cw-cell{aspect-ratio:auto;min-height:0}
.cw-stage .cw-game .cw-cell input{font-size:var(--cell-letter-size,24px);padding:4px 0 0}
.cw-stage .cw-game .cw-cell small{font-size:var(--cell-number-size,10px);top:2px;left:3px}
.cw-stage .cw-game .cw-cat-zone{grid-column:2;grid-row:2;align-self:center;padding:0;height:100%;min-height:0;max-height:100%;display:flex;flex-direction:column;align-items:center;overflow:hidden}
.cw-stage .cw-game.no-cat .cw-cat-zone{display:none}
.cw-stage .cw-game .cw-cat-image{width:285px;max-height:310px;cursor:pointer;flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
.cw-stage .cw-game .cw-cat-zone img{width:100%;height:100%;max-height:100%;object-fit:contain;animation:none;filter:drop-shadow(0 8px 8px #20263818)}
.cw-stage .cw-game .cw-bubble{font-size:17px;line-height:1.45;padding:14px 18px;max-height:110px;overflow:auto;width:100%;flex-shrink:0}
.cw-stage .cw-game .cw-cat-name{font-size:10px;padding-top:4px}
.cw-stage .cw-game .cw-clue{grid-column:1;grid-row:3;padding:14px 18px;min-height:68px;max-height:260px;overflow:auto;background:var(--question-bg)!important;color:var(--question-color)!important;border-color:color-mix(in srgb,var(--question-color) 18%,transparent);align-items:flex-start}
.cw-stage .cw-game .cw-clue p{font-size:18px;line-height:1.4;color:var(--question-color)!important;margin:5px 0 0}
.cw-stage .cw-game .cw-clue small{font-size:11px;color:var(--question-color)!important;opacity:.65}
.cw-stage .cw-game .cw-clue-num{width:35px;height:35px;font-size:18px}
.cw-stage .cw-game .cw-clue-body{flex:1;min-width:0}
.cw-stage .cw-game .cw-question-media{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:10px;margin-top:10px;max-width:100%}
.cw-stage .cw-game .cw-question-media:empty{display:none}
.cw-stage .cw-game .cw-question-media img{display:block;max-width:100%;max-height:130px;object-fit:contain;margin:0;border-radius:8px}
.cw-stage .cw-game .cw-question-media audio{display:block;width:280px;max-width:100%;height:36px;margin:0}
.cw-stage .cw-game .cw-buttons{grid-column:2;grid-row:1;gap:8px;margin:0;align-self:center;flex-wrap:nowrap}
.cw-stage .cw-game .cw-button{font-size:15px!important;padding:13px 14px;border-radius:10px}
.cw-stage .cw-game .cw-keyboard{position:absolute;left:844px;top:464px;width:400px;height:228px;z-index:7;margin:0;padding:12px;border:1px solid color-mix(in srgb,var(--key-text) 20%,transparent);border-radius:16px;background:var(--keyboard-bg);gap:8px;box-shadow:0 12px 36px #1c294534;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box;isolation:isolate}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-header{display:flex;flex:none;align-items:center;justify-content:space-between;width:100%;height:24px;gap:8px}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-grip{display:flex;align-items:center;gap:8px;min-width:0;flex:1;color:var(--key-text);font-size:13px;line-height:20px;cursor:grab;touch-action:none;user-select:none}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-grip:active{cursor:grabbing}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-grip>span:first-child{opacity:.5;font-size:21px}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-close{flex:none;width:27px;height:27px;max-width:none;background:transparent!important;color:var(--key-text)!important;border:0!important;font-size:23px;line-height:24px;padding:0;border-radius:7px}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-keys{display:flex;flex:1;min-height:0;width:100%;flex-direction:column;align-items:center;justify-content:flex-start;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;gap:5px}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-keys>div{display:flex;flex:none;gap:4px;justify-content:center;width:100%}
.cw-stage .cw-game .cw-keyboard .cw-keyboard-keys button{background:var(--key-bg)!important;color:var(--key-text)!important;border-color:color-mix(in srgb,var(--key-text) 20%,transparent)!important;max-width:none;min-width:0;flex:1;height:34px;padding:3px;font-size:16px;border-radius:6px}
.cw-stage .cw-game .cw-keyboard .wide{max-width:170px;font-size:13px}
.cw-stage .cw-game .questions-target:empty{display:none}
.cw-stage .cw-game .cw-questions{position:absolute;left:50px;top:90px;width:740px;height:470px;z-index:7;margin:0;padding:18px 22px;border:1px solid var(--question-color);border-radius:16px;background:var(--question-bg);color:var(--question-color);box-shadow:0 16px 50px #0003;display:flex;flex-direction:column;gap:16px;backdrop-filter:blur(18px)}
.cw-stage .cw-game .cw-questions[hidden]{display:none!important}
.cw-stage .cw-game .cw-questions-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none}
.cw-stage .cw-game .cw-questions-header strong{font-size:22px}
.cw-stage .cw-game .cw-questions-body{overflow:auto;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.cw-stage .cw-game .cw-questions strong{font-size:16px}
.cw-stage .cw-game .cw-questions button{background:transparent!important;color:var(--question-color)!important;font:inherit;padding:9px 8px;border:0;text-align:start}
.cw-stage .cw-game .cw-questions .cw-question-item{display:flex;width:100%;gap:4px;font-size:16px;line-height:1.5;border-radius:8px}
.cw-stage .cw-game .cw-question-item:hover,.cw-stage .cw-game .cw-question-item[aria-current=true]{box-shadow:inset 0 0 0 1px currentColor}
.cw-stage .cw-game .cw-question-item.is-solved .cw-question-text{text-decoration:line-through;text-decoration-thickness:2px;opacity:.65}
.cw-stage .cw-game .cw-questions .cw-questions-close{font-size:28px;line-height:1;padding:6px 10px}
.cw-stage .cw-game .questions-toggle{flex:none;align-self:flex-start;width:36px;height:36px;padding:0;border:1px solid currentColor;border-radius:50%;font-size:22px;margin:0;color:var(--question-color)}
.cw-stage .cw-game .cw-clue .questions-toggle,.cw-stage .cw-game .cw-clue .next-word{align-self:flex-start;display:inline-flex;align-items:center;justify-content:center;flex:none;height:36px;min-width:36px;margin:0;line-height:1;padding:0 8px}
.cw-stage .cw-game .cw-start,.cw-stage .cw-game .cw-final{background:var(--bg);border-radius:inherit;padding:36px}
.cw-stage .cw-game.transparent-bg .cw-start,.cw-stage .cw-game.transparent-bg .cw-final,.cw-stage .cw-game.has-background .cw-start,.cw-stage .cw-game.has-background .cw-final{background:transparent}
.cw-stage .cw-game:has(.cw-start)>.cw-stats,.cw-stage .cw-game:has(.cw-start)>.cw-content,.cw-stage .cw-game:has(.cw-start)>.cw-clue,.cw-stage .cw-game:has(.cw-start)>.cw-buttons,.cw-stage .cw-game:has(.cw-start)>.cw-keyboard,.cw-stage .cw-game:has(.cw-start)>.cw-question-media,.cw-stage .cw-game:has(.cw-start)>.cw-questions{visibility:hidden}
.cw-stage .cw-game:has(.cw-final)>.cw-stats,.cw-stage .cw-game:has(.cw-final)>.cw-content,.cw-stage .cw-game:has(.cw-final)>.cw-clue,.cw-stage .cw-game:has(.cw-final)>.cw-buttons,.cw-stage .cw-game:has(.cw-final)>.cw-keyboard,.cw-stage .cw-game:has(.cw-final)>.cw-question-media,.cw-stage .cw-game:has(.cw-final)>.cw-questions{visibility:hidden}
.cw-stage .cw-game .cw-start img,.cw-stage .cw-game .cw-final img{width:350px;height:330px;object-fit:contain}
.cw-stage .cw-game .cw-start p,.cw-stage .cw-game .cw-final p{font-size:20px;max-width:650px;line-height:1.6}
.cw-stage .cw-game .cw-final h2{font-size:36px}
.cw-stage .cw-game .cw-cat-zone{display:contents!important}
.cw-stage .cw-game.no-cat .cw-cat-zone{display:none!important}
.cw-stage .cw-game .cw-cat-image{position:absolute;left:var(--cat-x);top:var(--cat-y);width:var(--cat-width);height:var(--cat-height);max-height:none;min-height:0;z-index:3;display:block;transform:none!important}
.cw-stage .cw-game .cw-cat-image img{width:100%;height:100%;object-fit:contain;display:block}
.cw-stage .cw-game .cw-bubble{position:absolute;left:var(--bubble-x);top:var(--bubble-y);width:var(--bubble-width);height:var(--bubble-height);max-height:none;min-height:0;z-index:4;padding:14px 18px;background:var(--bubble-bg)!important;color:var(--bubble-color)!important;font-size:var(--bubble-size)!important;font-style:normal;overflow:auto;box-sizing:border-box}
.cw-stage .cw-game .cw-bubble:after{display:none}
.cw-stage .cw-game .cw-start img,.cw-stage .cw-game .cw-final img{position:absolute;left:var(--cat-x);top:var(--cat-y);width:var(--cat-width);height:var(--cat-height);max-width:none;object-fit:contain}
.cw-stage .cw-game{direction:ltr}
.cw-stage .cw-game[dir=rtl] .cw-clue,.cw-stage .cw-game[dir=rtl] .cw-bubble,.cw-stage .cw-game[dir=rtl] .cw-start,.cw-stage .cw-game[dir=rtl] .cw-final,.cw-stage .cw-game[dir=rtl] .cw-questions,.cw-stage .cw-game[dir=rtl] .cw-keyboard-header{direction:rtl}
`;
function overlayRect(value,kind){
 const defaults=kind==='cat'?{x:960,y:215,width:240,height:240}:{x:900,y:100,width:330,height:105};
 const number=(key)=>Number.isFinite(Number(value?.[key]))?Number(value[key]):defaults[key];
 const width=Math.max(kind==='cat'?48:120,Math.min(1280,number('width'))),height=Math.max(kind==='cat'?48:44,Math.min(720,number('height')));
 return {x:Math.round(Math.max(0,Math.min(1280-width,number('x')))),y:Math.round(Math.max(0,Math.min(720-height,number('y')))),width:Math.round(width),height:Math.round(height)};
}
function projectRect(project,kind){const value=project[kind+'Rect'];if(value)return overlayRect(value,kind);if(kind==='cat'&&project.catScale){const size=240*Math.max(.5,Math.min(2,Number(project.catScale)||1));return overlayRect({x:1080-size/2,y:335-size/2,width:size,height:size},kind);}return overlayRect(null,kind);}
function applyOverlayRect(game,kind,rect){for(const key of ['x','y','width','height'])game.style.setProperty('--'+kind+'-'+key,rect[key]+'px');}
function dimensions(availableWidth,availableHeight){return {width,height,scale:Math.min(Math.max(0,availableWidth)/width,Math.max(0,availableHeight)/height)};}
function mount(host,game,grid,project={}){
 host.classList.add('cw-stage');const style=document.createElement('style');style.textContent=css;host.append(style);
 for(const kind of ['cat','bubble'])applyOverlayRect(game,kind,projectRect(project,kind));
 const color=(value,fallback)=>/^#[a-f0-9]{6}$/i.test(value||'')?value:fallback;
 game.style.setProperty('--bubble-bg',project.bubbleTransparent?'transparent':color(project.bubbleBackground,'#fffdf5'));game.style.setProperty('--bubble-color',color(project.bubbleColor,project.typography?.bubble?.color||'#263e35'));game.style.setProperty('--bubble-size',Math.max(10,Math.min(72,Number(project.bubbleFontSize||project.typography?.bubble?.size)||18))+'px');
 const wrap=game.querySelector('.cw-grid-wrap');
 function fit(){
  const w=host.clientWidth||width,h=host.clientHeight||w*9/16;
  game.style.setProperty('--stage-scale',dimensions(w,h).scale);
  const cols=Number(grid.style.getPropertyValue('--cols'))||1,ratio=grid.style.getPropertyValue('--ratio').split('/').map(Number),rows=ratio[1]||cols;
  const cell=Math.min((wrap.clientWidth||800)/cols,(wrap.clientHeight||480)/rows);
  grid.style.setProperty('--board-width',cell*cols+'px');grid.style.setProperty('--board-height',cell*rows+'px');
  game.style.setProperty('--cell-letter-size',Math.max(9,Math.min(30,cell*.56))+'px');game.style.setProperty('--cell-number-size',Math.max(5,Math.min(11,cell*.22))+'px');
 }
 let observer;if(typeof ResizeObserver!=='undefined'){observer=new ResizeObserver(fit);observer.observe(host);observer.observe(wrap);}root.addEventListener('resize',fit);fit();
 return ()=>{observer?.disconnect();root.removeEventListener('resize',fit);};
}
root.CrosswordStage={mount,dimensions,css,width,height,overlayRect,projectRect,applyOverlayRect};
})(typeof window!=='undefined'?window:globalThis);
