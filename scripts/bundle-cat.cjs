// Keep the editor/player GIF inline: no separate image request or external CDN.
const fs=require('node:fs');const path=require('node:path');const dist=path.resolve(__dirname,'../dist');
const gif=fs.readFileSync(path.join(dist,'assets/black-cat.gif'));const still=fs.readFileSync(path.join(dist,'assets/black-cat-still.png'));
if(!gif.subarray(0,6).toString().startsWith('GIF8'))throw Error('Expected a GIF file');
fs.writeFileSync(path.join(dist,'cat-assets.js'),'window.CrosswordCatAssets='+JSON.stringify({gif:'data:image/gif;base64,'+gif.toString('base64'),still:'data:image/png;base64,'+still.toString('base64')})+';\n');
console.log('Bundled cat assets: '+gif.length+' GIF bytes, '+still.length+' still bytes.');
