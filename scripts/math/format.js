(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map();
const plain=s=>esc(s).replace(/\\\$/g,'$').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
const delimiters=[['$$','$$',true],['\\[','\\]',true],['\\(','\\)',false],['$','$',false]];
const escaped=(s,i)=>{let count=0;while(i>0&&s[--i]==='\\')count++;return count%2===1;};
function formula(source,display){const key=display+':'+source;if(cache.has(key))return cache.get(key);let html;
 try{if(source.length>4096)throw Error('Формула слишком длинная');html=root.katex.renderToString(source,{displayMode:display,throwOnError:true,trust:false,strict:'ignore',maxExpand:100,maxSize:20,output:'htmlAndMathml'});}
 catch(e){html='<span class="cw-math-error" title="'+esc('Проверьте запись формулы: '+e.message)+'">'+esc(source)+'</span>';}
 if(cache.size>=200)cache.delete(cache.keys().next().value);cache.set(key,html);return html;}
function bare(source){const value=source.trim();if(!value||value.length>4096)return false;const noText=value.replace(/\\text\{[^}]*\}/g,'');if(/[А-Яа-яЁё]/.test(noText))return false;return /\\(?:frac|dfrac|sqrt|left|right|sum|lim|begin|text|angle|triangle|parallel|perp|overline|times|cdot|div|pm|neq|leq|geq|infty|pi|approx|circ|to|%)(?![A-Za-z])/.test(value)||/^[\da-zA-Z{}()[\].,+\-*/=<>^_\s|%:]+$/.test(value)&&/[=^_]/.test(value);}
function html(text){const s=String(text??'');let cursor=0,result='',found=false;
 for(let i=0;i<s.length;i++){
  if(escaped(s,i))continue;const pair=delimiters.find(([open])=>s.startsWith(open,i));if(!pair)continue;const [open,close,display]=pair;let end=i+open.length;
  for(;;){end=s.indexOf(close,end);if(end<0||!escaped(s,end))break;end+=close.length;}
  if(end<0)continue;result+=plain(s.slice(cursor,i))+formula(s.slice(i+open.length,end),display);found=true;i=end+close.length-1;cursor=i+1;
 }
 return found?result+plain(s.slice(cursor)):bare(s)?formula(s.trim(),/\\begin\{cases\}/.test(s)):plain(s);
}
function render(element,text){element.innerHTML=html(text);}
const templates=[
 ['Дробь',String.raw`\frac{a}{b}`],['Дробь с выражениями',String.raw`\frac{x+1}{y-2}`],['Степень','x^{10}'],['Индекс','a_{n+1}'],['Квадратный корень',String.raw`\sqrt{x}`],['Корень n-й степени',String.raw`\sqrt[n]{a}`],['Большие скобки',String.raw`\left(\frac{a}{b}\right)`],['Модуль',String.raw`\left|x\right|`],['Умножение',String.raw`a\times b`],['Деление',String.raw`a\div b`],['Плюс-минус',String.raw`a\pm b`],['Не равно',String.raw`a\neq b`],['Меньше или равно',String.raw`a\leq b`],['Больше или равно',String.raw`a\geq b`],['Приблизительно',String.raw`a\approx b`],['Бесконечность',String.raw`\infty`],['Число пи',String.raw`\pi`],['Сумма',String.raw`\sum_{i=1}^{n} i`],['Предел',String.raw`\lim_{x\to 0} f(x)`],['Проценты',String.raw`25\%`],['Угол',String.raw`\angle ABC`],['Градусы',String.raw`90^\circ`],['Треугольник',String.raw`\triangle ABC`],['Параллельность',String.raw`a\parallel b`],['Перпендикулярность',String.raw`a\perp b`],['Отрезок',String.raw`\overline{AB}`],['Единицы измерения',String.raw`S=24\text{ см}^2`],['Квадратное уравнение','ax^2+bx+c=0'],['Корни квадратного уравнения',String.raw`\frac{-b\pm\sqrt{b^2-4ac}}{2a}`],['Площадь прямоугольника','S=ab'],['Периметр прямоугольника','P=2(a+b)'],['Объём','V=abc'],['Система уравнений',String.raw`\begin{cases}x+y=5\\x-y=1\end{cases}`,true]
].map(([label,tex,block=false])=>({label,tex,block}));
function records(text){const s=String(text).replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');let close=null,start=0;const rows=[];for(let i=0;i<s.length;i++){if(!escaped(s,i)){if(close&&s.startsWith(close,i)){i+=close.length-1;close=null;continue;}if(!close){const pair=delimiters.find(([open])=>s.startsWith(open,i));if(pair){close=pair[1];i+=pair[0].length-1;continue;}if(s.startsWith('\\begin{cases}',i)){close='\\end{cases}';i+='\\begin{cases}'.length-1;continue;}}}if(s[i]==='\n'&&!close){rows.push(s.slice(start,i));start=i+1;}}rows.push(s.slice(start));return rows;}
root.CrosswordMath={html,render,templates,records};
})(window);
