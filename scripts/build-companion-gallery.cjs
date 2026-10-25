// Lossless library build. Original GIFs stay untouched outside dist.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process'),{PNG}=require('pngjs'),{parseGIF,decompressFrame}=require('gifuct-js');
const root=path.resolve(__dirname,'..'),source=path.resolve(process.argv[2]||path.join(root,'..')),out=path.join(root,'dist/assets/companions');fs.mkdirSync(out,{recursive:true});
const definitions=[['cat','Кот','кот'],['bear','Медведь','медведь'],['boy-dog','Мальчик с собакой','мкльчик'],['duck','Утка','утка'],['pirate','Пират','пират'],['cowboy','Ковбой','ковбой'],['viking','Викинг','викинг'],['detective','Детектив','детектив'],['witch','Ведьмочка','ведьмочка'],['scarecrow','Пугало','пугало']];
const originals=fs.readdirSync(source).filter(f=>/\.gif$/i.test(f));
const meta=bytes=>{const p=parseGIF(bytes),frames=p.frames.filter(f=>f.image),app=p.frames.find(f=>['NETSCAPE2.0','ANIMEXTS1.0'].includes(f.application?.id))?.application;return {width:p.lsd.width,height:p.lsd.height,frames:frames.length,delays:frames.map(f=>f.gce?.delay??0),loop:app?Array.from(app.blocks):null};};
function thumbnail(bytes){const p=parseGIF(bytes),frame=decompressFrame(p.frames.find(f=>f.image),p.gct,true),w=p.lsd.width,h=p.lsd.height,canvas=new Uint8Array(w*h*4);for(let y=0;y<frame.dims.height;y++)for(let x=0;x<frame.dims.width;x++){const from=(y*frame.dims.width+x)*4;if(frame.patch[from+3])canvas.set(frame.patch.subarray(from,from+4),((y+frame.dims.top)*w+x+frame.dims.left)*4);}const image=new PNG({width:96,height:96});for(let y=0;y<96;y++)for(let x=0;x<96;x++){const sx=(x+.5)*w/96-.5,sy=(y+.5)*h/96-.5,x0=Math.max(0,Math.floor(sx)),y0=Math.max(0,Math.floor(sy)),fx=sx-x0,fy=sy-y0;const rgb=[0,0,0];let alpha=0;for(const [dx,dy,weight]of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){const at=(Math.min(h-1,y0+dy)*w+Math.min(w-1,x0+dx))*4,a=canvas[at+3]*weight;alpha+=a;for(let c=0;c<3;c++)rgb[c]+=canvas[at+c]*a;}const at=(y*96+x)*4;for(let c=0;c<3;c++)image.data[at+c]=alpha?Math.round(rgb[c]/alpha):0;image.data[at+3]=Math.round(alpha);}return PNG.sync.write(image);}
(async()=>{const list=[];
for(const [id,name,prefix]of definitions){
 const filename=originals.find(f=>f.normalize('NFC').toLowerCase().startsWith(prefix));if(!filename)throw Error('Missing '+prefix);
 const original=path.join(source,filename),target=path.join(out,id+'.gif'),bytes=fs.readFileSync(original),before=meta(bytes);
 const result=spawnSync(process.env.GIFSICLE_BIN||'gifsicle',['--careful','-O3','-Okeep-empty','--output',target,original],{encoding:'utf8'});if(result.status!==0)throw Error(result.error?.message||result.stderr);
 if(fs.statSync(target).size>bytes.length)fs.copyFileSync(original,target);
 const compressed=fs.readFileSync(target),after=meta(compressed);if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Frame/timing mismatch: '+filename);
 const diff=spawnSync(process.env.GIFDIFF_BIN||'gifdiff',[original,target],{encoding:'utf8'});if(diff.status!==0)throw Error('Visible difference: '+filename+' '+diff.stdout+diff.stderr);
 fs.writeFileSync(path.join(out,id+'.png'),thumbnail(bytes));
 list.push({id,name,src:'assets/companions/'+id+'.gif?v=1.10.0',thumbnail:'assets/companions/'+id+'.png?v=1.10.0',source:filename,originalBytes:bytes.length,bytes:compressed.length,width:after.width,height:after.height,frames:after.frames,durationMs:after.delays.reduce((a,b)=>a+b,0)*10,originalSha256:crypto.createHash('sha256').update(bytes).digest('hex'),sha256:crypto.createHash('sha256').update(compressed).digest('hex'),visuallyIdentical:true});
 console.log(name+': '+bytes.length+' → '+compressed.length+' bytes; '+after.frames+' frames; gifdiff OK');
}
fs.writeFileSync(path.join(root,'COMPANION-ASSETS.json'),JSON.stringify(list,null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1;});
