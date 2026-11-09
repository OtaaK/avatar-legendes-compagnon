"""PDF de recette entièrement synthétique : aucune description du livre, aucune dépendance PDF."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]

def synthetic_pdf():
 layout=json.loads((ROOT/'packages/reference/src/pdf-layout.json').read_text())
 catalog={t['id']:t for t in json.loads((ROOT/'docs/reference/CONTROLE_TECHNIQUES_PDF.json').read_text())['techniques']}
 commands={}
 def add(page,x,top,text,size,font="F1"):
  # Les caractères sont ceux des métadonnées et d'un faux texte, jamais du PDF utilisateur.
  escaped=text.encode('cp1252').replace(b'\\',b'\\\\').replace(b'(',b'\\(').replace(b')',b'\\)')
  commands.setdefault(page,[]).append(f'BT /{font} {size} Tf 1 0 0 1 {x} {layout["height"]-top} Tm ('.encode()+escaped+b') Tj ET\n')
 for entry in layout['techniques']:
  t=catalog[entry['id']]
  for field,text,size,delta in [('title',t['nom'],11,8),('approach',t['approche'],7,5.5)]:
   r=entry[field];add(r['page'],r['x0']+3,r['top']+delta,text,size)
  for index,r in enumerate(entry['regions']):
   add(r['page'],r['x0']+3,r['top']+12,'Texte de recette entierement synthetique.',10,'F2')
   add(r['page'],r['x0']+3,r['top']+24,'Passage '+entry['id']+' segment '+str(index)+'.',10)
 objects=[b'<< /Type /Catalog /Pages 2 0 R >>',b'',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>']
 kids=[]
 for no in range(1,295):
  page_id=len(objects)+1;content_id=page_id+1;kids.append(f'{page_id} 0 R')
  stream=b''.join(commands.get(no,[]))
  objects.append(f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {layout["width"]} {layout["height"]}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_id} 0 R >>'.encode())
  objects.append(f'<< /Length {len(stream)} >>\nstream\n'.encode()+stream+b'endstream')
 objects[1]=f'<< /Type /Pages /Count 294 /Kids [{" ".join(kids)}] >>'.encode()
 out=bytearray(b'%PDF-1.4\n');offsets=[0]
 for index,obj in enumerate(objects,1):
  offsets.append(len(out));out+=f'{index} 0 obj\n'.encode()+obj+b'\nendobj\n'
 xref=len(out);out+=f'xref\n0 {len(offsets)}\n0000000000 65535 f \n'.encode()
 for offset in offsets[1:]:out+=f'{offset:010} 00000 n \n'.encode()
 out+=f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
 return bytes(out)
