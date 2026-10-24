const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');const dir=path.resolve(__dirname,'../dist');
(async()=>{
 const dom=new JSDOM(fs.readFileSync(dir+'/index.html','utf8'),{url:'https://editor.test/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 Object.assign(w,{structuredClone,TextEncoder,TextDecoder});w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.fetch=async url=>({ok:true,text:async()=>fs.readFileSync(path.join(dir,url.split('?')[0]),'utf8')});
 for(const file of ['i18n.js','fonts.js','engine.js','companions.js','stage.js','game.js','embed.js','overlay-editor.js','app.js'])w.eval(fs.readFileSync(path.join(dir,file),'utf8')+(file==='app.js'?'\nwindow.__state=()=>state;window.__build=buildHTML;window.__genially=geniallyModal;window.__withAssets=withAssets;':''));
 const $=s=>w.document.querySelector(s),state=()=>w.__state();state().cat=false;$('[data-section="project"]').click();
 const change=(key,value)=>{const input=$('[data-key="'+key+'"]');assert(input);input.checked=value;input.dispatchEvent(new w.Event('change'));};
 for(const show of [true,false])for(const hide of [true,false]){
  $('#previewMode').click();change('showStartScreen',show);change('hideStartScreenInEditor',hide);assert.equal(!!$('.cw-start'),show&&!hide);$('#testMode').click();assert.equal(!!$('.cw-start'),show);$('#previewMode').click();assert.equal(!!$('.cw-start'),show&&!hide);
 }
 change('showStartScreen',true);change('hideStartScreenInEditor',true);assert(!$('.cw-start'));const project=await w.__withAssets();assert.equal(project.showStartScreen,true);assert.equal(project.hideStartScreenInEditor,true);
 let html=await w.__build(),exported=new JSDOM(html,{runScripts:'dangerously',url:'https://offline.test/',pretendToBeVisual:true});assert(exported.window.document.querySelector('.cw-start'));assert(!html.includes('hideStartScreenInEditor'));exported.window.close();
 await w.__genially();const embed=new JSDOM($('#geniallyHTML').value);const p=await w.CrosswordEmbed.decode(new URL(embed.window.document.querySelector('iframe').src).hash.slice(1));assert.equal(p.showStartScreen,true);assert.equal(p.hideStartScreenInEditor,undefined);embed.window.close();
 change('showStartScreen',false);html=await w.__build();exported=new JSDOM(html,{runScripts:'dangerously',url:'https://offline.test/',pretendToBeVisual:true});assert(!exported.window.document.querySelector('.cw-start'));assert(exported.window.document.querySelector('.cw-grid'));exported.window.close();
 $('#undoBtn').click();assert.equal(state().showStartScreen,true);$('#redoBtn').click();assert.equal(state().showStartScreen,false);w.close();console.log('PASS: independent title-screen checkboxes, all four combinations, actual-game test mode, project persistence, exports and undo/redo.');
})().catch(e=>{console.error(e);process.exitCode=1;});
