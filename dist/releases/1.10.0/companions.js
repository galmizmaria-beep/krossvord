(function(root){
'use strict';
const items=[['cat','Кот'],['bear','Медведь'],['boy-dog','Мальчик с собакой'],['duck','Утка'],['pirate','Пират'],['cowboy','Ковбой'],['viking','Викинг'],['detective','Детектив'],['witch','Ведьмочка'],['scarecrow','Пугало']].map(([id,name])=>({id,name,src:'assets/companions/'+id+'.gif?v=1.10.0',thumbnail:'assets/companions/'+id+'.png?v=1.10.0'}));
function find(id){return items.find(item=>item.id===id)||items[0];}
function source(project,state='idle'){return project.catStates?.[state]||project.catAsset||find(project.companionId).src;}
root.CrosswordCompanions={items,find,source};
})(window);
