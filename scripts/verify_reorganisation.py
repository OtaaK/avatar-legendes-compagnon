#!/usr/bin/env python3
"""Prouver que la réorganisation conserve le HTML et les assertions des tests."""
import argparse
import ast
import hashlib
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def git_file(ref, path):
    return subprocess.check_output(['git','show',f'{ref}:{path}'], cwd=ROOT)


def expected_test(text, suffix):
    if suffix == '.cjs':
        return text.replace("__dirname+'/simulateur.html'", "require('../support/paths.cjs').APP_HTML").replace("__dirname+'/MATRICE_TECHNIQUES.csv'", "require('../support/paths.cjs').MATRIX_CSV")
    module = ast.parse(text)
    lines = text.splitlines(keepends=True)
    first = module.body[0]
    line = first.end_lineno if isinstance(first, ast.Expr) and isinstance(first.value, ast.Constant) and isinstance(first.value.value, str) else 0
    lines.insert(line, 'from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE\n')
    return ''.join(lines).replace("Path(__file__).with_name('simulateur.html')", 'APP_HTML').replace('Path(__file__).parent', 'APP_DIR').replace("'/usr/bin/chromium'", 'CHROMIUM_EXECUTABLE')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--baseline', required=True, help='Commit V2.33 avant réorganisation (voir rapport).')
    args = parser.parse_args()
    html = (ROOT/'app/simulateur.html').read_bytes()
    if html != git_file(args.baseline, 'app/simulateur.html'):
        raise SystemExit('ÉCHEC : le HTML diffère de la référence demandée')
    names = subprocess.check_output(['git','ls-tree','-r','--name-only',args.baseline], cwd=ROOT, text=True).splitlines()
    count = 0
    for name in names:
        old = Path(name)
        if old.parent != Path('app') or not old.name.startswith('test') or old.suffix not in ['.cjs','.py']:
            continue
        target = ROOT/'tests'/('js' if old.suffix == '.cjs' else 'browser')/old.name
        expected = expected_test(git_file(args.baseline, name).decode('utf-8'), old.suffix)
        if target.read_text(encoding='utf-8') != expected:
            raise SystemExit(f'ÉCHEC : changement non limité aux chemins dans {target.relative_to(ROOT)}')
        count += 1
    if not count:
        raise SystemExit('ÉCHEC : aucun test de référence identifié')
    if (ROOT/'data/MATRICE_TECHNIQUES.csv').read_bytes() != git_file(args.baseline,'app/MATRICE_TECHNIQUES.csv'):
        raise SystemExit('ÉCHEC : la matrice diffère de la référence')
    for name in names:
        if name.startswith('docs/historique/'):
            target = ROOT/('docs/historique/README_ORIGINAL_V071.md' if name == 'docs/historique/README.md' else name)
            if target.read_bytes() != git_file(args.baseline, name):
                raise SystemExit(f'ÉCHEC : archive modifiée : {name}')
    print(f'HTML identique : SHA-256 {hashlib.sha256(html).hexdigest()}')
    print(f'{count} tests conservés : seuls les chemins et la configuration de Chromium ont changé.')
    print('Matrice et toutes les archives historiques conservées octet pour octet.')


if __name__ == '__main__':
    main()
