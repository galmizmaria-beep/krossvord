importScripts('media-codec.js?v=1.5.0');
self.onmessage=e=>{try{const result=CrosswordMediaCodec.optimizeGif(e.data.buffer,e.data.maxEdge,progress=>self.postMessage({progress}));self.postMessage({result},[result.bytes.buffer]);}catch(error){self.postMessage({error:error.message});}};
