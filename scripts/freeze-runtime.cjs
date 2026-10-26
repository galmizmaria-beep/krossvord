// Published runtimes are append-only: future editor releases get a new directory.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../dist'),version=require('../package.json').version;
if(!fs.readFileSync(path.join(root,'embed.js'),'utf8').includes("const version='"+version+"'"))throw Error('Embed and package versions must match');
const target=path.join(root,'releases',version);fs.mkdirSync(target,{recursive:true});
const names=['embed.js','i18n.js','font-files.js','comic-fonts.js','fonts.min.js','engine.min.js','companions.js','stage.min.js','keyboard-panel.min.js','math.js','game.min.js','player.js'];
function put(name,data){const file=path.join(target,name);if(fs.existsSync(file)&&!fs.readFileSync(file).equals(Buffer.from(data)))throw Error('Published runtime '+version+' cannot be overwritten: '+name);fs.writeFileSync(file,data);}
for(const name of names)put(name,fs.readFileSync(path.join(root,name)));
put('player.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../../"><title>Crossword game</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#game{width:100vw;height:100vh;position:relative}.player-message{padding:30px;font:16px/1.6 system-ui;color:#334155}</style></head><body><main id="game"><p class="player-message" role="status">Загружаем игру… / Loading…</p></main>'+names.map(name=>'<script src="releases/'+version+'/'+name+'"></script>').join('')+'</body></html>');
function assets(dir,prefix='assets'){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?assets(path.join(dir,entry.name),prefix+'/'+entry.name):[[prefix+'/'+entry.name,crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,entry.name))).digest('hex')]]);}
const hashes=Object.fromEntries(assets(path.join(root,'assets')));
for(const release of fs.readdirSync(path.join(root,'releases'))){const previous=path.join(root,'releases',release,'assets-manifest.json');if(fs.existsSync(previous))for(const [name,hash]of Object.entries(JSON.parse(fs.readFileSync(previous))))if(hashes[name]!==hash)throw Error('Asset used by published runtime '+release+' must keep its old name and bytes: '+name);}
put('assets-manifest.json',JSON.stringify(hashes,null,2)+'\n');
console.log('Frozen runtime '+version+'; existing snapshots and shared assets must remain unchanged.');
