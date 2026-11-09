"""Contrôle local du PDF utilisateur. Ne produit que des métadonnées et empreintes.
Le PDF et les passages de règles ne sont jamais copiés dans la sortie.
Prérequis local : pdfplumber ; ce script n'est pas exécuté en CI avec le livre.
"""
import argparse,csv,hashlib,json,re,subprocess,unicodedata
from pathlib import Path

def fold(text):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',text).encode('ascii','ignore').decode().lower())
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('pdf',type=Path);parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
 import pdfplumber
 root=Path(__file__).resolve().parents[2]
 data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {TECH_CATALOG} from './packages/domain/src/catalog.js';console.log(JSON.stringify(TECH_CATALOG.map(({id,nom,famille,approche,page})=>({id,nom,famille,approche,page}))));"],cwd=root,text=True))
 family_headers={'universelle':'Techniques universelles','groupe_pnj':'Techniques de groupe','eau':'Techniques de maîtrise de l’Eau','terre':'Techniques de maîtrise de la Terre','feu':'Techniques de maîtrise du Feu','air':'Techniques de maîtrise de l’Air','armes':'Techniques d’armes','technologie':'Techniques technologiques'}
 rows=[]
 with pdfplumber.open(args.pdf) as pdf:
  for page_no in sorted({t['page'] for t in data}):
   page=pdf.pages[page_no] # Vérifié sur cette édition : page PDF = page imprimée + 1.
   words=page.extract_words(extra_attrs=['fontname','size']);width=page.width
   col=lambda w:0 if w['x0']<width/2 else 1
   words=sorted([w for w in words if w['top']<page.height-55],key=lambda w:(col(w),round(w['top'],1),w['x0']))
   heads=[w for w in words if 'Bold' in w['fontname'] and abs(w['size']-11)<.1]
   normalized='';indexes=[]
   for i,w in enumerate(heads):part=fold(w['text']);normalized+=part;indexes.extend([i]*len(part))
   positions=[]
   for t in [t for t in data if t['page']==page_no]:
    needle=fold(t['nom']);at=normalized.find(needle)
    if at<0:raise ValueError('Titre absent : '+t['id'])
    title_words=heads[indexes[at]:indexes[at+len(needle)-1]+1];tail=indexes[at+len(needle)-1]+1
    if tail<len(heads) and heads[tail]['text'] in ['!','?'] and abs(heads[tail]['top']-title_words[-1]['top'])<1:title_words.append(heads[tail])
    actual=' '.join(w['text'] for w in title_words if w['text']!='*')
    if fold(actual)!=needle:raise ValueError('Titre ambigu : '+t['id'])
    first,last=title_words[0],title_words[-1];positions.append((t,first,last,actual))
   for t,first,last,actual in positions:
    later=[w for w in words if (col(w),w['top'])>(col(last),last['top']+3) and abs(w['size']-7)<.1 and 'Bold' in w['fontname']]
    label=later[0] if later else None
    if not label:raise ValueError('Approche absente : '+t['id'])
    approach=' '.join(w['text'] for w in later if col(w)==col(label) and abs(w['top']-label['top'])<1)
    approach_ok=fold(t['approche']) in fold(approach)
    next_titles=[f for _,f,_,_ in positions if (col(f),f['top'])>(col(first),first['top'])]
    end=min(next_titles,key=lambda w:(col(w),w['top'])) if next_titles else None
    body=[w['text'] for w in words if (col(w),w['top'])>(col(label),label['top']+5) and (end is None or (col(w),w['top'])<(col(end),end['top']))]
    source=' '.join(body)
    header=' '.join(w['text'] for w in words if w['size']>13)
    family_ok=(page_no in [158,159,160]) if t['famille']=='base' else fold(family_headers[t['famille']]) in fold(header)
    rows.append({**t,'pdf_page':page_no+1,'nom_source':actual,'nom_verifie':True,'nom_typographie_verifiee':re.sub(r'\s+','',unicodedata.normalize('NFC',actual).replace('’',"'").casefold())==re.sub(r'\s+','',unicodedata.normalize('NFC',t['nom']).replace('’',"'").casefold()),'famille_verifiee':family_ok,'approche_source':approach,'approche_verifiee':approach_ok,'passage_source_present':bool(source),'passage_sha256':hashlib.sha256(source.encode()).hexdigest(),'description_distribuee':False,'controle_description':'Passage identifié ; transcription et conditions intégrales non certifiées ni distribuées.'})
 result={'pdf_sha256':hashlib.sha256(args.pdf.read_bytes()).hexdigest(),'printedToPdfOffset':1,'method':'Titres AlbertusNova Bold 11 (casse, espaces et apostrophes normalisés, marque rare exclue), approches Bold 7, en-têtes de famille ; passages bornés aux titres, sans reproduction. Aucune validation automatique des règles ou certification éditoriale du texte privé importé.','techniques':sorted(rows,key=lambda r:next(i for i,t in enumerate(data) if t['id']==r['id']))}
 args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'techniques':len(rows),'noms':sum(r['nom_verifie'] for r in rows),'familles':sum(r['famille_verifiee'] for r in rows),'approches':sum(r['approche_verifiee'] for r in rows),'passages':sum(r['passage_source_present'] for r in rows)}))
 for r in rows:
  if not r['approche_verifiee'] or not r['famille_verifiee']:print('À vérifier :',r['id'],r['approche_source'])
if __name__=='__main__':main()
