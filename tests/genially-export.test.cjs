const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const dir=path.resolve(__dirname,'../dist');
(async()=>{
 const dom=new JSDOM(fs.readFileSync(dir+'/index.html','utf8'),{url:'https://editor.test/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 Object.assign(w,{structuredClone,TextEncoder,TextDecoder});w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 const fetched=[];w.fetch=async url=>{fetched.push(url);return {ok:true,text:async()=>fs.readFileSync(path.join(dir,url.split('?')[0]),'utf8')};};
 for(const file of ['i18n.js','fonts.js','engine.js','companions.js','stage.js','keyboard-panel.js','game.js','embed.js','app.js'])w.eval(fs.readFileSync(path.join(dir,file),'utf8')+(file==='app.js'?'\nwindow.__state=()=>state;':''));
 const $=s=>w.document.querySelector(s),p=w.__state();
 const pixels=crypto.randomBytes(320*240*4),png=PNG.sync.write({width:320,height:240,data:pixels}),original='data:image/png;base64,'+png.toString('base64');
 const gif='data:image/gif;base64,'+fs.readFileSync(path.join(dir,'assets/black-cat.gif')).toString('base64');
 w.Image=class{constructor(){throw Error('Export must never decode or resample media');}};
 w.HTMLCanvasElement.prototype.getContext=()=>{throw Error('Export must never rasterize media');};
 p.backgroundAsset=original;p.companionId='duck';p.catAsset=gif;
 await $('#geniallyBtn').onclick();assert($('#modal').open);assert($('#geniallyHTML').value.startsWith('<iframe '));assert(!$('#copyGeniallyCode').disabled);assert.equal(fetched.length,0,'Built-in companion shares without fetching GIF');
 let code=$('#geniallyHTML').value,frame=new JSDOM(code).window.document.querySelector('iframe'),decoded=await w.CrosswordEmbed.decode(new URL(frame.src).hash.slice(1));
 assert(code.length>60000,'Full-quality images must not be forced below the old arbitrary limit');assert.equal(decoded.backgroundAsset,original);assert.equal(decoded.catAsset,undefined);assert.equal(decoded.companionId,'duck');assert.equal(p.backgroundAsset,original);assert.equal(p.catAsset,gif);
 const exportedPixels=PNG.sync.read(Buffer.from(decoded.backgroundAsset.split(',')[1],'base64'));assert.equal(exportedPixels.width,320);assert.equal(exportedPixels.height,240);assert.deepEqual(exportedPixels.data,pixels,'Every pixel and alpha channel survives export');
 let copied;Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async value=>{copied=value;}}});await $('#copyGeniallyCode').onclick();assert.equal(copied,code);
 const probe=structuredClone(p);probe.cat=false;delete probe.catAsset;probe.words[0].image=original;probe.layout.words[0].image=original;
 const packed=await w.CrosswordEmbed.prepare(probe),packedProject=await w.CrosswordEmbed.decode(new URL(packed.url).hash.slice(1));assert.equal(packedProject.words[0].image,original);assert.equal(packedProject.backgroundAsset,original);assert.equal(packedProject.layout.words[0].image,undefined);assert.equal(probe.words[0].image,original);assert(packed.bytes<(await w.CrosswordEmbed.create(probe)).bytes,'Remove duplicate layout data without touching media');
 // Custom animated GIFs must remain byte-identical, too.
 delete p.backgroundAsset;p.companionId='custom';p.catAsset=gif;await $('#lightenCode').onclick();assert($('#geniallyHTML').value.startsWith('<iframe '));frame=new JSDOM($('#geniallyHTML').value).window.document.querySelector('iframe');decoded=await w.CrosswordEmbed.decode(new URL(frame.src).hash.slice(1));assert.equal(decoded.catAsset,gif);
 // Only payloads above the player's own supported limit need hosting; never silently degrade them.
 p.catAsset='data:image/gif;base64,'+crypto.randomBytes(1600000).toString('base64');const huge=p.catAsset;
 await $('#lightenCode').onclick();assert.equal($('#geniallyHTML').value,'');assert($('#copyGeniallyCode').disabled);assert.equal($('#geniallyStatus').getAttribute('role'),'alert');assert($('.export-details').open);assert(!$('#lightenCode').disabled);assert.equal(p.catAsset,huge);
 $('#gameURL').value='https://school.example/crossword.html';$('#gameURL').dispatchEvent(new w.Event('input'));assert($('#geniallyHTML').value.includes('https://school.example/crossword.html'));assert(!$('#copyGeniallyCode').disabled);$('#gameURL').value='javascript:alert(1)';$('#gameURL').dispatchEvent(new w.Event('input'));assert.equal($('#geniallyHTML').value,'');assert($('#copyGeniallyCode').disabled);
 p.cat=false;await $('#lightenCode').onclick();assert($('#geniallyHTML').value.startsWith('<iframe '));assert(!$('#copyGeniallyCode').disabled);
 // Finishing preparation after a dialog is replaced must not overwrite its new code.
 const realPrepare=w.CrosswordEmbed.prepare;let release;w.CrosswordEmbed.prepare=()=>new Promise(resolve=>{release=resolve;});const pending=$('#geniallyBtn').onclick();const oldOutput=$('#geniallyHTML');assert($('#lightenCode').disabled);w.CrosswordEmbed.prepare=realPrepare;await $('#geniallyBtn').onclick();const current=$('#geniallyHTML').value;release({code:'obsolete',url:'https://old.example/'});await pending;assert(!oldOutput.isConnected);assert.equal($('#geniallyHTML').value,current);
 w.close();console.log('PASS: Genially preserves exact PNG pixels and GIF bytes, exports beyond 60 KB, removes duplicate code, copies iframe, handles oversize payloads, retries and replaced dialogs.');
})().catch(e=>{console.error(e);process.exitCode=1;});
