'use strict';
importScripts('engine.js');
self.onmessage=({data:{words,size,seed,attempts}})=>{
 try{
  for(let i=0;i<attempts;i++)self.postMessage({layout:Crossword.generate(words,size,seed+i+1),completed:i+1,total:attempts});
  self.postMessage({done:true});
 }catch(error){self.postMessage({error:error.message});}
};
