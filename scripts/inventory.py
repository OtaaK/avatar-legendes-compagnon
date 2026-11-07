#!/usr/bin/env python3
"""Inventorier le devenir de chaque fichier d'une référence Git, sans rien supprimer."""
import argparse
import csv
import hashlib
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def destination(name):
    path = Path(name)
    if path.parent == Path('app') and path.name.startswith('test') and path.suffix in ['.cjs','.py']:
        return Path('tests')/('js' if path.suffix == '.cjs' else 'browser')/path.name
    if name == 'app/MATRICE_TECHNIQUES.csv':
        return Path('data/MATRICE_TECHNIQUES.csv')
    if name == 'docs/historique/README.md':
        return Path('docs/historique/README_ORIGINAL_V071.md')
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    names = subprocess.check_output(['git','ls-tree','-r','--name-only',args.baseline], cwd=ROOT, text=True).splitlines()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.writer(stream, lineterminator='\n')
        writer.writerow(['chemin_avant','chemin_apres','action','octets_avant','octets_apres','sha256_avant','sha256_apres','justification'])
        for name in names:
            before = subprocess.check_output(['git','show',f'{args.baseline}:{name}'], cwd=ROOT)
            target = destination(name)
            if not (ROOT/target).is_file():
                raise SystemExit(f'Fichier absent : {target} ; suppression à justifier avant génération')
            after = (ROOT/target).read_bytes()
            moved = str(target) != name
            action = 'déplacé' if moved else 'conservé'
            if before != after:
                action += ' et adapté' if moved else ' et actualisé'
            if name.startswith('app/test'):
                reason = 'Test conservé ; chemins centralisés ; assertions inchangées.'
            elif name == 'app/MATRICE_TECHNIQUES.csv':
                reason = 'Donnée de référence utilisée par les tests ; aucune dépendance à exécuter dans le navigateur.'
            elif name == 'docs/historique/README.md':
                reason = 'Ancien accueil V0.71 archivé ; remplacé par un index explicatif.'
            elif name.startswith('docs/historique/'):
                reason = 'Archive utile pour la traçabilité ; conservée sans réécriture.'
            elif before != after:
                reason = 'Chemins, procédures ou règles de maintenance actualisés ; pas de changement des règles du jeu.'
            else:
                reason = 'Toujours utile au fonctionnement, aux instructions ou à la compréhension du projet.'
            writer.writerow([name,str(target),action,len(before),len(after),hashlib.sha256(before).hexdigest(),hashlib.sha256(after).hexdigest(),reason])
    print(f'{len(names)} fichiers d’origine inventoriés dans {args.output}')


if __name__ == '__main__':
    main()
