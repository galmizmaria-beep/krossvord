(function(root){
'use strict';
const items=[['cat','Кот'],['bear','Медведь'],['boy-dog','Мальчик с собакой'],['duck','Утка'],['pirate','Пират'],['cowboy','Ковбой'],['viking','Викинг'],['detective','Детектив'],['witch','Ведьмочка'],['scarecrow','Пугало']].map(([id,name])=>({id,name,src:'assets/companions/'+id+'.gif?v=1.11.0',thumbnail:'assets/companions/'+id+'.png?v=1.11.0'}));
function find(id){return items.find(item=>item.id===id)||items[0];}
function source(project,state='idle'){return project.catStates?.[state]||project.catAsset||find(project.companionId).src;}
const warming=new Map();
function warm(id){const item=find(id);if(!warming.has(item.id)){const image=new Image();image.src=item.src;warming.set(item.id,image);if(warming.size>2)warming.delete(warming.keys().next().value);}return warming.get(item.id);}
function decorate(image,project,state='idle'){
 if(!image)return;const item=find(project.companionId),src=source(project,state);
 image.style.backgroundImage='';image.onload=null;
 if(!project.cat||src!==item.src)return;
 image.style.backgroundImage='url("'+item.thumbnail+'")';image.style.backgroundSize='contain';image.style.backgroundPosition='center';image.style.backgroundRepeat='no-repeat';
 image.onload=()=>{if(image.getAttribute('src')===src)image.style.backgroundImage='';};
 if(image.complete&&image.naturalWidth)image.style.backgroundImage='';
}
root.CrosswordCompanions={items,find,source,warm,decorate};
})(window);
