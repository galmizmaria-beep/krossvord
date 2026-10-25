const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../dist');
(async()=>{
 const dom=new JSDOM(fs.readFileSync(dir+'/index.html','utf8'),{url:'https://editor.test/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 Object.assign(w,{structuredClone,TextEncoder,TextDecoder});w.fetch=async url=>({ok:true,text:async()=>fs.readFileSync(path.join(dir,url.split('?')[0]),'utf8')});
 for(const file of ['i18n.js','fonts.js','engine.js','companions.js','stage.js','keyboard-panel.js','game.js','embed.js','app.js'])w.eval(fs.readFileSync(path.join(dir,file),'utf8')+(file==='app.js'?'\nwindow.__state=()=>state;window.__build=buildHTML;':''));
 const $=s=>w.document.querySelector(s);$('[data-section="fonts"]').click();
 const roles={grid:'.cw-cell input',numbers:'.cw-cell small',clue:'.cw-clue p',buttons:'.cw-button',bubble:'.cw-bubble',keyboard:'.cw-keyboard-keys button'};
 let size=21;
 for(const [role,selector] of Object.entries(roles)){
  $('#fontRole').value=role;$('#fontRole').dispatchEvent(new w.Event('change'));
  const input=$('[data-type-prop="size"]');input.value=String(size);input.dispatchEvent(new w.Event('input'));
  assert.equal(w.__state().typography[role].size,size,'Size applies before blur: '+role);
  assert.equal(w.getComputedStyle($(selector)).fontSize,size+'px','Rendered size: '+role);
  input.dispatchEvent(new w.Event('change'));size++;
 }
 $('#undoBtn').click();assert.equal(w.__state().typography.keyboard?.size,undefined);$('#redoBtn').click();assert.equal(w.__state().typography.keyboard.size,26);
 $('#fontRole').value='grid';$('#fontRole').dispatchEvent(new w.Event('change'));let input=$('[data-type-prop="size"]');input.value='100';input.dispatchEvent(new w.Event('input'));assert.equal(w.__state().typography.grid.size,21);input.value='';input.dispatchEvent(new w.Event('input'));assert.equal(w.__state().typography.grid.size,undefined);
 // A companion-size setting and the typography panel must not fight each other.
 $('[data-section="cat"]').click();input=$('[data-key="bubbleFontSize"]');input.value='32';input.dispatchEvent(new w.Event('change'));assert.equal(w.__state().typography.bubble.size,undefined);assert.equal($('.cw-game').style.getPropertyValue('--bubble-size'),'32px');
 $('.keyboard-toggle').click();const controls=$('.cw-keyboard-controls');assert.equal(w.getComputedStyle(controls).display,'grid');for(const button of controls.children){const style=w.getComputedStyle(button);assert.equal(style.height,'auto');assert.equal(style.whiteSpace,'normal');assert.equal(style.lineHeight,'1.2');}
 // Apply one size to every text role, then override one area without affecting others.
 $('[data-section="fonts"]').click();$('#fontRole').value='grid';$('#fontRole').dispatchEvent(new w.Event('change'));input=$('[data-type-prop="size"]');input.value='19';input.dispatchEvent(new w.Event('input'));input.dispatchEvent(new w.Event('change'));$('#applySizeToAll').click();
 for(const option of $('#fontRole').options)assert.equal(w.__state().typography[option.value].size,19,'Global size covers '+option.value);
 for(const selector of ['.cw-cell input','.cw-cell small','.cw-stats','.cw-stats .score','.cw-stats .hearts','.cw-clue p','.cw-clue small','.cw-clue-num','.cw-button','.cw-bubble','.cw-keyboard-keys button','.cw-keyboard-grip span'])assert.equal(w.getComputedStyle($(selector)).fontSize,'19px','Global rendered size '+selector);
 $('#undoBtn').click();assert.equal(w.__state().typography.grid.size,19);assert.equal(w.__state().typography.buttons.size,24);$('#redoBtn').click();assert.equal(w.__state().typography.buttons.size,19);
 $('#fontRole').value='stats';$('#fontRole').dispatchEvent(new w.Event('change'));input=$('[data-type-prop="size"]');assert.equal(input.value,'19');input.value='22';input.dispatchEvent(new w.Event('input'));input.dispatchEvent(new w.Event('change'));assert.equal(w.getComputedStyle($('.cw-stats .score')).fontSize,'22px');assert.equal(w.getComputedStyle($('.cw-cell input')).fontSize,'19px');
 $('#testMode').click();assert.equal(w.getComputedStyle($('.cw-start p')).fontSize,'19px');
 const testHost=w.document.createElement('div');w.document.body.append(testHost);let tick;const realInterval=w.setInterval;w.setInterval=fn=>{tick=fn;return 0;};const runtime=w.CrosswordGame.mount(testHost,{...w.__state(),cat:false,timerMode:'countdown',seconds:1},{startScreen:true});testHost.querySelector('.cw-start button').click();tick();assert(testHost.querySelector('.cw-final'));assert.equal(w.getComputedStyle(testHost.querySelector('.cw-final h2')).fontSize,'19px');assert.equal(w.getComputedStyle(testHost.querySelector('.cw-final p')).fontSize,'19px');runtime.destroy();testHost.remove();w.setInterval=realInterval;
 const project=w.__state();project.cat=false;const html=await w.__build(),offline=new JSDOM(html,{runScripts:'dangerously',url:'https://offline.test/',pretendToBeVisual:true});
 for(const role of ['numbers','clue','buttons','keyboard'])assert.equal(offline.window.getComputedStyle(offline.window.document.querySelector(roles[role])).fontSize,project.typography[role].size+'px','Offline size: '+role);
 offline.window.close();w.close();console.log('PASS: immediate text sizes across grid, numbers, questions, buttons, speech and keyboard; undo/redo, validation, automatic sizing, companion setting and offline export.');
})().catch(e=>{console.error(e);process.exitCode=1;});
