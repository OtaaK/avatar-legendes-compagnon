#!/usr/bin/env python3
"""Exécuter tous les scripts de régression, sans dépendre du dossier courant."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]


def run_one(path, timeout):
    command = ['node' if path.suffix == '.cjs' else sys.executable, str(path)]
    start = time.monotonic()
    try:
        process = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, timeout=timeout)
        code, output = process.returncode, process.stdout + process.stderr
    except subprocess.TimeoutExpired:
        code, output = 124, f'Délai de {timeout} secondes dépassé.'
    except OSError as error:
        code, output = 127, str(error)
    return {'file':str(path.relative_to(ROOT)), 'exit_code':code, 'seconds':round(time.monotonic()-start, 3), 'output':output, 'limitations':[line for line in output.splitlines() if line.startswith('LIMITATION:')]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--suite', choices=['all','js','browser'], default='all')
    parser.add_argument('--jobs', type=int, default=2, help='Nombre de processus indépendants (défaut : 2).')
    parser.add_argument('--timeout', type=float, default=120, help='Délai maximal par script, en secondes.')
    parser.add_argument('--report', type=Path, help='Rapport JSON facultatif, par exemple work/tests.json.')
    args = parser.parse_args()
    if args.jobs < 1 or args.timeout <= 0:
        parser.error('--jobs et --timeout doivent être positifs')
    paths = []
    if args.suite in ['all','js']:
        if not shutil.which('node'):
            parser.error('Node.js est requis pour les tests JavaScript')
        paths.extend(sorted((ROOT/'tests/js').glob('test*.cjs')))
    if args.suite in ['all','browser']:
        paths.extend(sorted((ROOT/'tests/browser').glob('test*.py')))
    if not paths:
        parser.error('Aucun test trouvé ; vérifier la structure du dépôt')
    results = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        for future in as_completed([pool.submit(run_one, path, args.timeout) for path in paths]):
            result = future.result()
            results.append(result)
            for limitation in result['limitations']:
                print(f"{result['file']} — {limitation}", flush=True)
            if result['exit_code']:
                print(f"ÉCHEC {result['file']}\n{result['output']}", flush=True)
            elif len(results) % 25 == 0:
                print(f'{len(results)}/{len(paths)} scripts exécutés', flush=True)
    results.sort(key=lambda item:item['file'])
    passed = sum(result['exit_code'] == 0 for result in results)
    limitations = [{'file':result['file'], 'detail':line} for result in results for line in result['limitations']]
    report = {'suite':args.suite, 'total':len(results), 'passed':passed, 'failed':len(results)-passed, 'limitations':limitations, 'results':results}
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"Résultat : {passed}/{len(results)} réussis ; {len(results)-passed} échec(s) ; {len(limitations)} limite(s) explicite(s)")
    return 0 if passed == len(results) else 1


if __name__ == '__main__':
    raise SystemExit(main())
