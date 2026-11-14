"""Comparaison visuelle ponctuelle ; nécessite la base Git et Playwright installés."""
import sys,subprocess,base64
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tests/browser'))
from _paths import CHROMIUM_EXECUTABLE
from playwright.sync_api import sync_playwright
old=subprocess.check_output(['git','show','ae4c86a:app/simulateur.html'],cwd=ROOT).decode()
new=(ROOT/'app/simulateur.html').read_text()
count=0
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox'])
 for width,height in [(390,844),(768,1024),(1280,900),(1920,1080)]:
  results=[]
  for name,html in [('base',old),('3D',new)]:
   c=b.new_context(viewport={'width':width,'height':height});page=c.new_page()
   page.route('http://companion.test/**',lambda route,request,content=html:route.fulfill(body=content,content_type='text/html'))
   page.goto('http://companion.test/simulateur.html')
   # Données synthétiques identiques ; aucune donnée personnelle ni description privée.
   page.evaluate("commitLibraryMutation(()=>Roster.createCharacter(lib,'Recette visuelle','PNJ'));renderSheets();renderCharacterCards();renderNpcDirectory()")
   captures=[]
   for view in ['home','characters','combat','catalog']:
    page.evaluate("v=>{setView(v,false);if(v==='characters')setCharacterKind('PNJ')}",view)
    captures.append(base64.b64encode(page.screenshot(animations='disabled')).decode())
   results.append(captures);c.close()
  # Chromium peut arrondir différemment quelques pixels de bordure antialiasée.
  compare=b.new_page()
  for view,left,right in zip(['home','characters','combat','catalog'],*results):
   stats=compare.evaluate("""async ([a,b])=>{
    const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='data:image/png;base64,'+src});
    const [x,y]=await Promise.all([load(a),load(b)]);
    if(x.width!==y.width||x.height!==y.height)throw Error('Dimensions différentes');
    const canvas=document.createElement('canvas');canvas.width=x.width;canvas.height=x.height;const ctx=canvas.getContext('2d');
    ctx.drawImage(x,0,0);const first=ctx.getImageData(0,0,x.width,x.height).data;ctx.clearRect(0,0,x.width,x.height);ctx.drawImage(y,0,0);const second=ctx.getImageData(0,0,x.width,x.height).data;
    let changed=0,max=0;for(let i=0;i<first.length;i+=4){let delta=0;for(let k=0;k<4;k++)delta=Math.max(delta,Math.abs(first[i+k]-second[i+k]));if(delta)changed++;max=Math.max(max,delta)}
    return {changed,max,pixels:x.width*x.height};
   }""",[left,right])
   assert stats['max']<=1 and stats['changed']<=max(100,stats['pixels']*0.001),(width,view,stats)
   print(width,view,stats)
   count+=1
  compare.close()
 b.close()
print(count,'comparaisons visuelles réussies : écart maximal 1/255 par composante sur au plus 0,1 % des pixels (plancher 100)')
