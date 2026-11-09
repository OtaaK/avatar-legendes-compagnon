import pdfplumber,json,subprocess,sys
from pathlib import Path
sys.path.insert(0,str(Path('scripts/reference').resolve()))
from importlib.machinery import SourceFileLoader
mod=SourceFileLoader('audit','scripts/reference/verify-techniques-pdf.py').load_module();fold=mod.fold
import argparse
parser=argparse.ArgumentParser(description="Reconstruit le plan géométrique de lecture privée ; aucun texte du livre en sortie.")
parser.add_argument('pdf',type=Path);parser.add_argument('--output',type=Path,default=Path('packages/reference/src/pdf-layout.json'));args=parser.parse_args()
pdf_path=args.pdf
data=json.loads(Path('docs/reference/CONTROLE_TECHNIQUES_PDF.json').read_text())['techniques'];rows=[]
with pdfplumber.open(pdf_path) as pdf:
 for page_no in sorted({t['page'] for t in data}):
  p=pdf.pages[page_no];words=p.extract_words(extra_attrs=['fontname','size']);col=lambda w:0 if w['x0']<p.width/2-10 else 1
  words=sorted([w for w in words if w['top']<p.height-55],key=lambda w:(col(w),round(w['top'],1),w['x0']))
  heads=[w for w in words if 'Bold' in w['fontname'] and abs(w['size']-11)<.1];norm='';indexes=[]
  for i,w in enumerate(heads):part=fold(w['text']);norm+=part;indexes.extend([i]*len(part))
  positions=[]
  for t in [t for t in data if t['page']==page_no]:
   at=norm.index(fold(t['nom']));title=heads[indexes[at]:indexes[at+len(fold(t['nom']))-1]+1];first,last=title[0],title[-1]
   label=next(w for w in words if (col(w),w['top'])>(col(last),last['top']+3) and abs(w['size']-7)<.1 and 'Bold' in w['fontname'])
   positions.append((t,first,last,label))
  for t,first,last,label in positions:
   c=col(first);nexts=[f for _,f,_,_ in positions if col(f)==c and f['top']>first['top']];end=min([f['top'] for f in nexts],default=p.height-55)
   left=min(f['x0'] for _,f,_,_ in positions if col(f)==0)
   right=min(f['x0'] for _,f,_,_ in positions if col(f)==1)
   x0,x1=(left-6,left+258) if c==0 else (right-6,right+258)
   regions=[{'page':page_no+1,'x0':round(x0,2),'x1':round(x1,2),'top':round(label['bottom']+1,2),'bottom':round(end-2,2)}]
   # Riposter se poursuit au début de la colonne droite avant Changer de position.
   if t['id']=='base-riposter':regions.append({'page':159,'x0':300,'x1':564,'top':40,'bottom':183})
   # Se recueillir se poursuit page imprimée 161, avant L'entraînement au combat.
   if t['id']=='base-se-recueillir':regions.append({'page':162,'x0':48,'x1':312,'top':40,'bottom':125})
   rows.append({'id':t['id'],'title':{'page':page_no+1,'x0':round(x0,2),'x1':round(x1,2),'top':round(first['top']-2,2),'bottom':round(last['bottom']+1,2)},'approach':{'page':page_no+1,'x0':round(x0,2),'x1':round(x1,2),'top':round(label['top']-1,2),'bottom':round(label['bottom']+1,2)},'regions':regions})
rows.sort(key=lambda r:next(i for i,t in enumerate(data) if t['id']==r['id']))
args.output.write_text(json.dumps({'edition':'Édition française fournie, pages imprimées 158–161 et 286–293','width':612.283,'height':790.866,'techniques':rows},ensure_ascii=False,indent=2)+'\n')
print('Plan de lecture sans textes :',len(rows),'techniques')
