#!/usr/bin/env python3
"""Inventaire de propositions à partir d’une référence Git ; aucune suppression/déplacement."""
import argparse
from collections import Counter, defaultdict
import csv
import json
from pathlib import Path
import posixpath
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE_REPORTS = {'docs/RAPPORT_V233.md', 'docs/RAPPORT_RETOURS_RECETTE_V233.md'}

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', default='avant-nettoyage-2026-11-13')
    parser.add_argument('--output', type=Path, default=Path('docs/maintenance/nettoyage'))
    args = parser.parse_args()
    commit = git('rev-parse', '--verify', args.ref+'^{commit}').decode().strip()
    rows = []
    for item in git('ls-tree', '-rlz', commit).split(b'\0'):
        if not item: continue
        info, path = item.split(b'\t', 1)
        mode, kind, oid, size = info.decode().split()
        if kind != 'blob': continue
        rows.append({'path':path.decode(), 'oid':oid, 'bytes':int(size)})
    names = {r['path'] for r in rows}
    texts = {}
    # Ni CLAUDE.md, ni PDF, ni texte commercial ajouté : seuls les fichiers suivis autorisés sont lus.
    for r in rows:
        if Path(r['path']).name.upper() == 'CLAUDE.MD' or Path(r['path']).suffix.lower() == '.pdf': continue
        try: texts[r['path']] = git('cat-file', 'blob', r['oid']).decode('utf-8')
        except UnicodeDecodeError: continue
    active = {p:t for p,t in texts.items() if not p.startswith('docs/historique/') and p!='docs/maintenance/INVENTAIRE.csv'}
    edges = set()
    for source, text in active.items():
        for target in names:
            if source != target and target in text: edges.add((source,target,'chemin-litteral'))
        for link in re.findall(r'\]\(([^)]+)\)', text):
            if '://' in link or link.startswith('#'): continue
            target = (Path(source).parent / link.split('#')[0]).as_posix()
            target=posixpath.normpath(target)
            if target in names and target!=source: edges.add((source,target,'lien-markdown'))
        if source.startswith('tests/') and source.endswith(('.cjs','.py')):
            edges.add(('scripts/test.py',source,'decouverte-glob'))
            if source.endswith('.cjs') and 'support/paths.cjs' in text:
                edges.add((source,'tests/support/paths.cjs','helper-require'))
            if source.endswith('.py') and 'from _paths import' in text:
                edges.add((source,'tests/browser/_paths.py','helper-import'))
    groups=defaultdict(list)
    for r in rows: groups[r['oid']].append(r['path'])
    references=Counter(t for _,t,_ in edges)
    out=ROOT/args.output
    report_names=['INVENTAIRE.csv','REFERENCES.csv','INDEX_TESTS.csv','SOURCE.json']
    originals={(ROOT/p).resolve() for p in names}
    if any((out/name).resolve() in originals for name in report_names):
        raise SystemExit('Refus : le dossier de sortie écraserait un fichier de la référence inventoriée.')
    out.mkdir(parents=True, exist_ok=True)
    counts=Counter(); size_counts=Counter()
    with (out/'INVENTAIRE.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.writer(f,lineterminator='\n');w.writerow(['chemin','octets','objet_git','proposition','preuve','references_detectees','autre_copie_identique'])
        for r in rows:
            path=r['path'];decision='garder';proof='G-DOC'
            if path.startswith('docs/historique/'): decision='archiver_git_apres_accord';proof='A-HIST'
            elif path=='docs/maintenance/INVENTAIRE.csv': decision='archiver_git_apres_accord';proof='A-INV'
            elif path in ARCHIVE_REPORTS: decision='archiver_git_apres_accord';proof='A-REL'
            elif path.startswith('tests/'): proof='G-TEST' if Path(path).name.startswith('test') else 'G-HELP'
            elif path=='app/simulateur.html': proof='G-APP'
            elif path=='data/MATRICE_TECHNIQUES.csv': proof='G-DATA'
            elif path.startswith('scripts/'): proof='G-TOOLS'
            elif path.startswith('.github/') or path in ['.gitignore','requirements-dev.txt']: proof='G-CONFIG'
            copies=';'.join(p for p in groups[r['oid']] if p!=path)
            counts[decision]+=1;size_counts[decision]+=r['bytes']
            w.writerow([path,r['bytes'],r['oid'],decision,proof,references[path],copies])
    with (out/'REFERENCES.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.writer(f,lineterminator='\n');w.writerow(['source','cible','nature']);w.writerows(sorted(edges))
    tags = {
        'imports-persistance':r'import|export|persist|storage|sauvegarde|backup',
        'personnages-livrets':r'roster|character|sheet|playbook|livret|wizard|npc',
        'combat-ressources':r'CombatCore|fatigue|balance|condition|statut|posture|approach',
        'techniques':r'\b(?:techniques?|TECH_CATALOG|terre|air|eau|feu|armes|technolog\w*)\b',
        'interface':r'page\.|document\.|locator\(|innerHTML|setView',
        'securite':r'security|__auditXss|Identifiant de fiche invalide',
    }
    tests=[r for r in rows if r['path'].startswith('tests/') and Path(r['path']).name.startswith('test') and r['path'].endswith(('.cjs','.py'))]
    with (out/'INDEX_TESTS.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.writer(f,lineterminator='\n');w.writerow(['chemin','suite','themes_indicatifs','objet_git_a_conserver'])
        for r in tests:
            themes=[name for name,pattern in tags.items() if re.search(pattern,texts.get(r['path'],''),re.I)]
            w.writerow([r['path'],'js' if r['path'].endswith('.cjs') else 'browser',';'.join(themes),r['oid']])
    summary={'reference':args.ref,'commit':commit,'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'proposals':dict(counts),'bytesByProposal':dict(size_counts),'duplicateGroups':[p for p in groups.values() if len(p)>1],'jsScripts':sum(r['path'].endswith('.cjs') for r in tests),'browserScripts':sum(r['path'].endswith('.py') for r in tests),'changesApplied':False,'scope':'main tag uniquement ; branches de convergence exclues','referencesLimit':'références statiques indicatives, jamais preuve suffisante d’inutilité ; thèmes de tests heuristiques non exclusifs'}
    (out/'SOURCE.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(summary,ensure_ascii=False))

if __name__=='__main__': main()
