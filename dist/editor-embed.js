// Select a lighter entry point for Genially without changing versioned game runtimes.
(function(embed){
 const prepare=embed.prepare;
 const systemFonts=new Set(['Arial','Georgia','Verdana','Tahoma','Trebuchet MS','Times New Roman','Courier New','Мой шрифт']);
 embed.prepare=async function(project){
  const families=[project.gridFont,...Object.values(project.typography||{}).map(style=>style?.family)];
  const result=await prepare(project);
  if(embed.version!=='1.14.0'||families.some(family=>family&&!systemFonts.has(family)))return result;
  if(result.url){
   const url=result.url.replace('/dist/releases/','/dist/quick/releases/');
   return {...result,url,code:embed.iframe(url),bytes:url.length};
  }
  const frame=document.createElement('template');
  frame.innerHTML=result.code;
  const iframe=frame.content.querySelector('iframe');
  const html=result.html.replace(/<script src="[^"]*\/(?:font-files|comic-fonts)\.js\?v=1\.14\.0"><\/script>/g,'');
  iframe.setAttribute('srcdoc',html);
  const code=iframe.outerHTML;
  return {...result,html,code,bytes:code.length};
 };
})(CrosswordEmbed);
