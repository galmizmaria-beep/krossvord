from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import quote
from concurrent.futures import ThreadPoolExecutor
import re,json,time,base64
out=Path(__file__).resolve().parents[1]/'dist/assets/fonts';out.mkdir(parents=True,exist_ok=True)
fonts=['Roboto','Open Sans','Montserrat','Nunito','Rubik','Manrope','PT Sans','PT Serif','Noto Sans','Noto Serif','Merriweather','Lora','Playfair Display','Raleway','Comfortaa','Caveat','Pacifico','Lobster','Neucha']
chars=''.join(chr(i) for i in range(32,591))+''.join(chr(i) for i in range(880,1328))
ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def get(url):
 for attempt in range(4):
  try: return urlopen(Request(url,headers={'User-Agent':ua}),timeout=20).read()
  except Exception:
   if attempt==3: raise
   time.sleep(1)
def download(name):
 slug=name.lower().replace(' ','-');css=(out/(slug+'.css')).read_text() if (out/(slug+'.css')).exists() else get('https://fonts.googleapis.com/css2?family='+quote(name)+':wght@400&text='+quote(chars)).decode()
 (out/(slug+'.css')).write_text(css)
 parts=[];total=0
 for i,block in enumerate(re.findall(r'@font-face\s*{([^}]+)}',css)):
  url=re.search(r'src:\s*url\(([^)]+)\)',block).group(1);match=re.search(r'unicode-range:\s*([^;]+)',block);cached=out/(slug+'-'+str(i)+'.woff2');data=cached.read_bytes() if cached.exists() else get(url)
  filename=slug+'-'+str(i)+'.woff2';(out/filename).write_bytes(data);parts.append({'url':'assets/fonts/'+filename,'range':match.group(1) if match else 'U+0-10FFFF'});total+=len(data)
 try: (out/(slug+'-LICENSE.txt')).write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug.replace('-','')+'/OFL.txt'))
 except Exception: pass
 return name,parts,total
results=list(ThreadPoolExecutor(max_workers=5).map(download,fonts))
embedded={name:[{'range':part['range'],'data':'data:font/woff2;base64,'+base64.b64encode((out.parents[1]/part['url']).read_bytes()).decode()} for part in parts] for name,parts,size in results}
(out.parents[1]/'font-files.js').write_text('window.CrosswordFontFiles='+json.dumps(embedded,separators=(',',':'))+';\n')
for p in out.iterdir():
 if p.suffix in ('.css','.woff2') or p.name=='manifest.json':p.unlink()
print(json.dumps({n:size for n,p,size in results}))
