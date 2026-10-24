const {parseGIF,decompressFrame}=require('gifuct-js');
const {GIFEncoder,quantize,applyPalette}=require('gifenc');
function optimizeGif(input,maxEdge=640,onProgress=()=>{}){
 const bytes=new Uint8Array(input);if(String.fromCharCode(...bytes.subarray(0,6))!=='GIF89a'&&String.fromCharCode(...bytes.subarray(0,6))!=='GIF87a')throw Error('Invalid GIF');
 const parsed=parseGIF(bytes),sources=parsed.frames.filter(f=>f.image),w=parsed.lsd.width,h=parsed.lsd.height;
 if(!w||!h||w*h>16000000||sources.length>1000||sources.length*w*h>250000000)throw Error('GIF слишком большой для обработки. Максимум 1000 кадров и 250 млн пикселей.');
 const ratio=Math.min(1,maxEdge/Math.max(w,h)),width=Math.max(1,Math.round(w*ratio)),height=Math.max(1,Math.round(h*ratio));
 const screen=new Uint8Array(w*h*4),small=new Uint8Array(width*height*4),encoder=GIFEncoder();
 const transparent=sources.some(f=>f.gce?.extras.transparentColorGiven);const bg=transparent?[0,0,0,0]:[...(parsed.gct?.[parsed.lsd.backgroundColorIndex]||[0,0,0]),255];
 function clear(d){for(let y=d.top;y<Math.min(h,d.top+d.height);y++)for(let x=d.left;x<Math.min(w,d.left+d.width);x++)screen.set(bg,(y*w+x)*4);}
 clear({left:0,top:0,width:w,height:h});
 const app=parsed.frames.find(f=>['NETSCAPE2.0','ANIMEXTS1.0'].includes(f.application?.id))?.application;
 const repeat=app&&app.blocks.length>=3?app.blocks[1]|app.blocks[2]<<8:-1;
 let duration=0;
 for(let n=0;n<sources.length;n++){
  const source=sources[n],frame=decompressFrame(source,parsed.gct,true),d=frame.dims;
  const previous=frame.disposalType===3?screen.slice():null;
  for(let y=0;y<d.height;y++)for(let x=0;x<d.width;x++){
   if(x+d.left>=w||y+d.top>=h)continue;const from=(y*d.width+x)*4;
   if(frame.patch[from+3])screen.set(frame.patch.subarray(from,from+4),((y+d.top)*w+x+d.left)*4);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const from=(Math.min(h-1,Math.floor((y+.5)*h/height))*w+Math.min(w-1,Math.floor((x+.5)*w/width)))*4;
   small.set(screen.subarray(from,from+4),(y*width+x)*4);
  }
  const palette=quantize(small,192,{format:'rgba4444',oneBitAlpha:true}),transparentIndex=palette.findIndex(c=>c[3]===0),indexed=applyPalette(small,palette,'rgba4444');
  const delay=source.gce?source.gce.delay*10:100;duration+=delay;
  encoder.writeFrame(indexed,width,height,{palette,transparent:transparentIndex>=0,transparentIndex:Math.max(0,transparentIndex),dispose:2,repeat,delay});
  if(frame.disposalType===2)clear(d);else if(previous)screen.set(previous);
  onProgress((n+1)/sources.length);
 }
 encoder.finish();const encoded=encoder.bytes();const smaller=encoded.length<bytes.length;
 return {bytes:smaller?encoded:bytes,width:smaller?width:w,height:smaller?height:h,frames:sources.length,duration,repeat,originalBytes:bytes.length,optimized:smaller};
}
module.exports={optimizeGif};
