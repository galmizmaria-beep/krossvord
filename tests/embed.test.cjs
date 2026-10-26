const {JSDOM}=require('jsdom');const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const dir=path.resolve(__dirname,'../dist');
const read=f=>fs.readFileSync(path.join(dir,f),'utf8');
(async()=>{
 const tools=new JSDOM('',{runScripts:'outside-only',url:'https://editor.test'});const w=tools.window;
 Object.assign(w,{TextEncoder,TextDecoder,Blob,Response,CompressionStream,DecompressionStream});w.eval(read('engine.js'));w.eval(read('embed.js'));
 const words=[{id:'a',answer:'КОТ',clue:'Кто говорит «мяу»?'},{id:'b',answer:'ТОК',clue:'Что течёт по проводам?'}];const layout=w.Crossword.generate(words,10,3);
 const p={schemaVersion:1,title:'Игра <с котом>',words,layout,language:'fr',size:10,cat:true,catBubble:true,gridFont:'Manrope',accent:'#426347',background:'#fbf3e3',buttonColor:'#123456',letterColor:'#654321',lives:5,timerMode:'none',hintLimit:3};
 const result=await w.CrosswordEmbed.create(p);assert(result.url.length<3000);assert(result.url.includes('#z.'));const decoded=await w.CrosswordEmbed.decode(result.url.split('#')[1]);assert.deepEqual(JSON.parse(JSON.stringify(decoded)),JSON.parse(JSON.stringify(p)));
 const markup=new JSDOM(result.code);assert.equal(markup.window.document.body.children.length,1);assert.equal(markup.window.document.body.firstElementChild.tagName,'IFRAME');assert(!markup.window.document.querySelector('style,script'));assert.equal(markup.window.document.querySelector('iframe').src,result.url);
 const game=new JSDOM(read('player.html'),{url:result.url,runScripts:'outside-only',pretendToBeVisual:true});const g=game.window;Object.assign(g,{TextEncoder,TextDecoder,Blob,Response,CompressionStream,DecompressionStream});
 for(const file of ['embed.js','i18n.js','fonts.js','engine.js','cat-assets.js','companions.js','stage.js','keyboard-panel.js','game.js','player.js'])g.eval(read(file));
 for(let i=0;i<30&&!g.document.querySelector('.cw-grid');i++)await new Promise(r=>setTimeout(r,10));
 assert(g.document.querySelector('.cw-grid'),'Shared link must boot the game');assert.equal(g.CrosswordStage.dimensions(1280,720).scale,1);assert.equal(g.CrosswordStage.dimensions(1920,1080).scale,1.5);assert.equal(g.CrosswordStage.dimensions(640,360).scale,.5);assert.equal(g.CrosswordStage.dimensions(1280,360).scale,.5);assert.equal(g.CrosswordStage.width/g.CrosswordStage.height,16/9);assert.equal(markup.window.document.querySelector('iframe').width,'1280');assert.equal(markup.window.document.querySelector('iframe').height,'720');assert.equal(g.document.querySelector('.cw-game').lang,'fr');assert.equal(g.document.querySelector('.cw-game').style.getPropertyValue('--button-bg'),'#123456');assert.equal(g.document.querySelector('.cw-start button').textContent,g.CrosswordI18n.get('fr').play+' →');assert.equal(g.document.title,p.title);
 // OS preference must not silently replace the explicitly enabled GIF.
 g.matchMedia=()=>({matches:true});g.CrosswordGame.mount(g.document.querySelector('#game'),p,{});assert(g.document.querySelector('.cw-cat-zone img').src.includes('/assets/companions/cat.gif'));
 g.document.querySelector('.cw-cat-image').click();assert.equal(g.document.querySelector('.cw-cat-zone').dataset.state,'correct');
 g.CrosswordGame.mount(g.document.querySelector('#game'),{...p,reduceMotion:true},{});assert(g.document.querySelector('.cw-cat-zone img').src.includes('/assets/companions/cat.gif'));assert(!g.document.querySelector('.cw-cat-name'));g.CrosswordGame.mount(g.document.querySelector('#game'),{...p,reduceMotion:true},{startScreen:true});assert.equal(g.document.querySelector('.cw-start img').src,g.document.querySelector('.cw-cat-zone img').src);
 await assert.rejects(()=>w.CrosswordEmbed.encode({...p,backgroundAsset:'data:image/png;base64,'+'A'.repeat(w.CrosswordEmbed.limits.maxProjectBytes)}),error=>error.code==='EMBED_TOO_LARGE');
 await assert.rejects(()=>w.CrosswordEmbed.decode('broken'));assert.throws(()=>w.CrosswordEmbed.iframe('javascript:alert(1)'));
 const photo='data:image/png;base64,'+require('node:crypto').randomBytes(180000).toString('base64');
 const fullQuality={...p,backgroundAsset:photo,words:p.words.map(word=>({...word,image:photo}))};
 const compressed=await w.CrosswordEmbed.prepare(fullQuality);assert(compressed.url.length>60000);assert(compressed.url.includes('#z.'));const restored=await w.CrosswordEmbed.decode(new URL(compressed.url).hash.slice(1));assert.equal(restored.backgroundAsset,photo);assert(restored.words.every(word=>word.image===photo));
 w.CompressionStream=undefined;const uncompressed=await w.CrosswordEmbed.prepare(fullQuality);assert(compressed.bytes<uncompressed.bytes,'Compress code losslessly');assert.equal((await w.CrosswordEmbed.decode(new URL(uncompressed.url).hash.slice(1))).backgroundAsset,photo);
 w.CompressionStream=undefined;const plain=await w.CrosswordEmbed.encode(p);assert(plain.startsWith('j.'));assert.equal((await w.CrosswordEmbed.decode(plain)).title,p.title);

 // Large compressed media must boot inside srcdoc instead of failing the URL limit.
 w.CompressionStream=CompressionStream;
 const bigProject={...p,backgroundAsset:'data:image/png;base64,'+require('node:crypto').randomBytes(1700000).toString('base64')};
 const big=await w.CrosswordEmbed.prepare(bigProject);assert(big.html);assert(big.code.startsWith('<iframe srcdoc='));
 const outer=new JSDOM(big.code),inner=outer.window.document.querySelector('iframe').srcdoc;
 const embeddedGame=new JSDOM(inner,{url:'about:srcdoc',runScripts:'outside-only',pretendToBeVisual:true}),eg=embeddedGame.window;
 Object.assign(eg,{TextEncoder,TextDecoder,Blob,Response,CompressionStream,DecompressionStream});
 for(const script of eg.document.querySelectorAll('script[src]')){const url=new URL(script.src);assert.equal(url.origin,'https://galmizmaria-beep.github.io');eg.eval(read(url.pathname.split('/').pop()));}
 for(let i=0;i<100&&!eg.document.querySelector('.cw-grid');i++)await new Promise(r=>setTimeout(r,10));
 assert(eg.document.querySelector('.cw-grid'),'Large srcdoc iframe must boot');assert.equal(eg.document.title,p.title);
 assert.equal((await eg.CrosswordEmbed.decode(eg.document.querySelector('#crossword-payload').textContent,true)).backgroundAsset,bigProject.backgroundAsset);
 embeddedGame.window.close();outer.window.close();
 game.window.close();tools.window.close();markup.window.close();console.log('PASS: compressed and plain links, isolated iframe, player boot, localized settings, explicit GIF playback/pause, interactive cat, invalid links.');
})().catch(e=>{console.error(e);process.exitCode=1;});
