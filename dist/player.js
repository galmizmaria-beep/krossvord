(async function(){
 const host=document.getElementById('game');
 try{
  if(!location.hash)throw Error('Ссылка не содержит кроссворд. Создайте код через кнопку Genially в редакторе.');
  const p=await CrosswordEmbed.decode(location.hash.slice(1));
  if(!p||!Array.isArray(p.words)||p.words.length<2||p.words.length>100||!p.layout||!Array.isArray(p.layout.words)||p.layout.words.length>100)throw Error('Неверный формат игры.');
  if(!Number.isInteger(p.layout.cols)||!Number.isInteger(p.layout.rows)||p.layout.cols<1||p.layout.cols>40||p.layout.rows<1||p.layout.rows>40)throw Error('Неверный размер сетки.');
  if(Crossword.validate(p.words,p.layout,40).length)throw Error('В кроссворде есть ошибки размещения.');
  document.documentElement.lang=p.language||'ru';document.title=p.title||'Crossword';
  CrosswordGame.mount(host,p,{startScreen:true});

 }catch(e){host.replaceChildren();const message=document.createElement('p');message.className='player-message';message.setAttribute('role','alert');message.textContent=e.message||'Не удалось открыть игру.';host.append(message);}
})();
