const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {Worker:Thread}=require('node:worker_threads');
const {JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'../dist');

(async()=>{
 const dom=new JSDOM(fs.readFileSync(dir+'/index.html','utf8'),{url:'https://editor.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,errors=[];
 Object.assign(w,{structuredClone,TextEncoder,TextDecoder});
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.addEventListener('error',e=>errors.push(e.message));
 for(const file of ['i18n.js','fonts.js','engine.js','companions.js','stage.js','keyboard-panel.js','game.js','embed.js','app.js'])w.eval(fs.readFileSync(dir+'/'+file,'utf8')+(file==='app.js'?'\nwindow.editorTest={state:()=>state,variants:()=>variants,render:()=>{renderPanel();renderGame();},generate:generateVariants,change:changed,edit:editWord,updateWords,validate:validateProject};':''));
 const $=s=>w.document.querySelector(s),api=w.editorTest,p=api.state();
 const positions=()=>JSON.stringify(p.layout.words.map(({id,r,c,dir})=>({id,r,c,dir})).sort((a,b)=>a.id.localeCompare(b.id)));

 $('#helpBtn').click();assert.equal($('#modal h2').textContent,'Инструкция по работе');$('.modal-close').click();
 // The fallback yields to the event loop, and exposes progress while generating.
 let settled=false;const generating=api.generate().then(()=>{settled=true;});assert(!settled);assert($('#generate').disabled);assert(!$('#generationStatus').hidden);await generating;assert(api.variants().length>=3);assert(!$('#generate').disabled);$('#settingsContent [data-key="size"]').value='23';$('#settingsContent [data-key="size"]').dispatchEvent(new w.Event('change'));assert.equal(api.variants().length,0);assert(!$('#layoutVariants'));await api.generate();
 p.mode='manual';p.layout.words=p.layout.words.map(word=>({...word,r:word.r+1,c:word.c+1}));p.layout.rows++;p.layout.cols++;
 const before=positions();api.render();api.edit(p.words[0].id);assert($('#modalContent').textContent.includes('Подсказка от героя'));$('#wordClue').value='Новый вопрос без изменения ответа';$('#wordHint').value='Новая подсказка';$('#wordPoints').value='17';await $('#confirmWord').onclick();
 assert.equal(positions(),before,'Editing metadata must preserve manual positions');assert.equal(p.layout.words.find(word=>word.id===p.words[0].id).clue,p.words[0].clue);assert.equal(p.layout.words.find(word=>word.id===p.words[0].id).points,17);
 // Previously generated layouts use current metadata when chosen.
 $('[data-variant]').click();assert.equal(p.layout.words.find(word=>word.id===p.words[0].id).hint,'Новая подсказка');
 const others=new Map(p.layout.words.filter(word=>word.id!==p.words[0].id).map(word=>[word.id,[word.r,word.c,word.dir]]));
 api.edit(p.words[0].id);$('#wordAnswer').value='ЛИСТОПАДЫ';await $('#confirmWord').onclick();assert.equal(api.variants().length,0);assert.equal(w.document.querySelectorAll('[data-variant]').length,0);
 for(const word of p.layout.words.filter(word=>others.has(word.id)))assert.deepEqual([word.r,word.c,word.dir],others.get(word.id));
 assert.doesNotThrow(()=>api.validate(JSON.parse(JSON.stringify(p))));
 // New manual words remain available for placement instead of moving existing words.
 const beforeAdd=positions();api.edit();$('#wordAnswer').value='ЯЩЕРИЦА';$('#wordClue').value='Пресмыкающееся';await $('#confirmWord').onclick();assert.equal(positions(),beforeAdd);assert(p.layout.missing.includes(p.words.at(-1).id));
 $('[data-section="questions"]').click();const stateBeforeSearch=JSON.stringify(p);$('#wordSearch').value='пресмыкающееся';$('#wordSearch').dispatchEvent(new w.Event('input'));assert.equal([...w.document.querySelectorAll('#wordRows [data-edit]')].filter(row=>!row.hidden).length,1);assert.equal(JSON.stringify(p),stateBeforeSearch);
 $('#wordSearch').value='';$('#wordSearch').dispatchEvent(new w.Event('input'));$('#wordFilter').value='missing';$('#wordFilter').dispatchEvent(new w.Event('change'));assert([...w.document.querySelectorAll('#wordRows [data-edit]')].filter(row=>!row.hidden).every(row=>row.dataset.missing==='true'));
 const image='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',audio='data:audio/ogg;base64,T2dnUw==';p.words[0].image=image;p.words[0].audio=audio;api.render();$('#wordFilter').value='media';$('#wordFilter').dispatchEvent(new w.Event('change'));assert.equal([...w.document.querySelectorAll('#wordRows [data-edit]')].filter(row=>!row.hidden).length,1);assert($('.word-thumbnail'));api.edit(p.words[0].id);assert.equal($('#wordMediaPreview img').getAttribute('src'),image);assert.equal($('#wordMediaPreview audio').getAttribute('src'),audio);$('#clearWordMedia').click();assert(!$('#wordMediaPreview img'));assert(!$('#wordMediaPreview audio'));await $('#confirmWord').onclick();assert(!p.words[0].image);assert(!p.words[0].audio);
 // Exercise the actual browser worker source in an isolated Node worker thread.
 class BrowserWorker{
  constructor(){this.thread=new Thread(`const {parentPort}=require('node:worker_threads');global.self=globalThis;global.postMessage=data=>parentPort.postMessage(data);global.importScripts=file=>require(${JSON.stringify(dir)}+'/'+file);require(${JSON.stringify(dir+'/generation-worker.js')});parentPort.on('message',data=>self.onmessage({data}));`,{eval:true});this.thread.on('message',data=>this.onmessage?.({data}));this.thread.on('error',error=>this.onerror?.(error));}
  postMessage(data){assert(data.words.every(word=>Object.keys(word).sort().join(',')==='answer,id'),'Workers receive no media or question text');this.thread.postMessage(data);}
  terminate(){this.thread.terminate();}
 }
 w.Worker=BrowserWorker;$('[data-section="crossword"]').click();const threaded=api.generate();api.edit(p.words[0].id);$('#wordClue').value='Актуальный вопрос во время расчёта';await $('#confirmWord').onclick();await threaded;assert(api.variants().length);assert(p.layout.words.every(word=>p.words.some(source=>source.id===word.id&&source.clue===word.clue)));assert.doesNotThrow(()=>api.validate(JSON.parse(JSON.stringify(p))));
 const beforeCancel=positions(),cancelled=api.generate();$('#cancelGeneration').click();await cancelled;assert.equal(positions(),beforeCancel);assert(!$('#generate').disabled);
 const obsolete=api.generate();api.updateWords(p.words.filter(word=>word.id!==p.words[0].id));api.change(true);await obsolete;assert.equal(api.variants().length,0);assert(!$('#generate').disabled);
 // Failed workers fall back to asynchronous generation, including after undo.
 w.Worker=class{constructor(){throw Error('Worker blocked');}};await api.generate();assert(api.variants().length);$('#undoBtn').click();$('#undoBtn').click();assert.equal(api.variants().length,0);assert.equal(w.document.querySelectorAll('[data-variant]').length,0);
 assert.equal(errors.length,0,errors.join('\n'));w.close();
 console.log('PASS: manual positions and metadata, stale variants and undo, search/filter, attachment previews, actual worker, progress, cancellation, stale results and fallback.');
})().catch(error=>{console.error(error);process.exitCode=1;});
