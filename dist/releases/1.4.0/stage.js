(function(root){
'use strict';
const width=1280,height=720;
const css=`
.cw-stage{position:relative;overflow:hidden;aspect-ratio:16/9;background:transparent;isolation:isolate}
.game-frame.cw-stage{min-height:0!important;background-color:transparent;background-image:linear-gradient(45deg,#e1e5eb 25%,transparent 25%),linear-gradient(-45deg,#e1e5eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e1e5eb 75%),linear-gradient(-45deg,transparent 75%,#e1e5eb 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}
.cw-stage .cw-game{position:absolute;left:50%;top:50%;width:1280px!important;height:720px!important;min-height:0!important;margin:0;transform:translate(-50%,-50%) scale(var(--stage-scale,1));transform-origin:center;display:grid;grid-template-columns:minmax(0,1fr) 310px;grid-template-rows:42px minmax(0,1fr) auto auto auto;gap:14px 28px;padding:28px 36px!important;box-sizing:border-box;overflow:hidden;background-image:none}
.cw-stage .cw-game:before,.cw-stage .cw-game:after,.cw-stage .cw-foot{display:none}
.cw-stage .cw-game.transparent-bg{background:transparent!important}
.cw-stage .cw-game .cw-stats{grid-column:1/-1;grid-row:1;font-size:16px;gap:28px;padding:8px;border-top:0}
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
.cw-stage .cw-game .cw-clue{grid-column:1;grid-row:3;padding:14px 18px;min-height:68px;max-height:130px;overflow:auto;background:var(--question-bg)!important;color:var(--question-color)!important;border-color:color-mix(in srgb,var(--question-color) 18%,transparent);align-items:center}
.cw-stage .cw-game .cw-clue p{font-size:18px;line-height:1.4;color:var(--question-color)!important;margin:5px 0 0}
.cw-stage .cw-game .cw-clue small{font-size:11px;color:var(--question-color)!important;opacity:.65}
.cw-stage .cw-game .cw-clue-num{width:35px;height:35px;font-size:18px}
.cw-stage .cw-game .cw-question-media{grid-column:2;grid-row:4;max-height:130px;overflow:auto}
.cw-stage .cw-game .cw-question-media:empty{display:none}
.cw-stage .cw-game .cw-question-media img{max-height:120px}
.cw-stage .cw-game .cw-buttons{grid-column:2;grid-row:3;gap:8px;margin:0;align-self:center;flex-wrap:wrap}
.cw-stage .cw-game .cw-button{font-size:15px!important;padding:13px 14px;border-radius:10px}
.cw-stage .cw-game .cw-keyboard{grid-column:1;grid-row:4;margin:0;padding:10px;border-radius:12px;background:var(--keyboard-bg);gap:5px}
.cw-stage .cw-game .cw-keyboard button{background:var(--key-bg)!important;color:var(--key-text)!important;border-color:color-mix(in srgb,var(--key-text) 20%,transparent)!important;max-width:47px;height:30px;padding:3px;font-size:16px}
.cw-stage .cw-game .cw-keyboard .wide{max-width:170px;font-size:13px}
.cw-stage .cw-game .questions-target:empty{display:none}
.cw-stage .cw-game .cw-questions{grid-column:1/-1;grid-row:5;max-height:85px;overflow:auto;margin:0;padding:10px 14px;border-radius:10px;background:var(--question-bg);color:var(--question-color);gap:20px}
.cw-stage .cw-game .cw-questions strong{font-size:14px}
.cw-stage .cw-game .cw-questions button{background:transparent!important;color:var(--question-color)!important;font-size:13px;padding:5px 0}
.cw-stage .cw-game .cw-start,.cw-stage .cw-game .cw-final{background:var(--bg);border-radius:inherit;padding:36px}
.cw-stage .cw-game.transparent-bg .cw-start,.cw-stage .cw-game.transparent-bg .cw-final{background:transparent}
.cw-stage .cw-game:has(.cw-start)>.cw-stats,.cw-stage .cw-game:has(.cw-start)>.cw-content,.cw-stage .cw-game:has(.cw-start)>.cw-clue,.cw-stage .cw-game:has(.cw-start)>.cw-buttons,.cw-stage .cw-game:has(.cw-start)>.cw-keyboard,.cw-stage .cw-game:has(.cw-start)>.cw-question-media,.cw-stage .cw-game:has(.cw-start)>.cw-questions{visibility:hidden}
.cw-stage .cw-game:has(.cw-final)>.cw-stats,.cw-stage .cw-game:has(.cw-final)>.cw-content,.cw-stage .cw-game:has(.cw-final)>.cw-clue,.cw-stage .cw-game:has(.cw-final)>.cw-buttons,.cw-stage .cw-game:has(.cw-final)>.cw-keyboard,.cw-stage .cw-game:has(.cw-final)>.cw-question-media,.cw-stage .cw-game:has(.cw-final)>.cw-questions{visibility:hidden}
.cw-stage .cw-game .cw-start img,.cw-stage .cw-game .cw-final img{width:350px;height:330px;object-fit:contain}
.cw-stage .cw-game .cw-start p,.cw-stage .cw-game .cw-final p{font-size:20px;max-width:650px;line-height:1.6}
.cw-stage .cw-game .cw-final h2{font-size:36px}
`;
function dimensions(availableWidth,availableHeight){return {width,height,scale:Math.min(Math.max(0,availableWidth)/width,Math.max(0,availableHeight)/height)};}
function mount(host,game,grid){
 host.classList.add('cw-stage');const style=document.createElement('style');style.textContent=css;host.append(style);
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
root.CrosswordStage={mount,dimensions,css,width,height};
})(typeof window!=='undefined'?window:globalThis);
