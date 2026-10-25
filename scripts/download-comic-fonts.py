# coding: utf-8
from pathlib import Path
from urllib.request import Request,urlopen
import re,json,base64,time
out=Path(__file__).resolve().parents[1]/'dist'
(out/'assets/fonts').mkdir(parents=True,exist_ok=True)
ua='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def get(url):
 for n in range(4):
  try:return urlopen(Request(url,headers={'User-Agent':ua}),timeout=30).read()
  except Exception:
   if n==3:raise
   time.sleep(1)
result={}
for name,query in [('Comic Neue','Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700'),('Comic Relief','Comic+Relief:wght@400;700')]:
 css=get('https://fonts.googleapis.com/css2?family='+query).decode();parts=[]
 for block in re.findall(r'@font-face\s*{([^}]+)}',css):
  url=re.search(r'src:\s*url\(([^)]+)\)',block).group(1);match=re.search(r'unicode-range:\s*([^;]+)',block);weight=re.search(r'font-weight:\s*([^;]+)',block).group(1);style=re.search(r'font-style:\s*([^;]+)',block).group(1)
  data=get(url);assert data[:4]==b'wOF2'
  parts.append({'range':match.group(1) if match else 'U+0-10FFFF','weight':weight,'style':style,'data':'data:font/woff2;base64,'+base64.b64encode(data).decode()})
 result[name]=parts
 slug=name.lower().replace(' ','');(out/'assets/fonts'/('comic-'+slug+'-LICENSE.txt')).write_bytes(get('https://raw.githubusercontent.com/google/fonts/main/ofl/'+slug+'/OFL.txt'))
 print(name,len(parts),sum(len(p['data']) for p in parts))
(out/'comic-fonts.js').write_text('Object.assign(window.CrosswordFontFiles||(window.CrosswordFontFiles={}),'+json.dumps(result,separators=(',',':'))+');\n')
