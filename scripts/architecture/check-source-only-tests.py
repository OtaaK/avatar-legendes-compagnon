"""Preuve ponctuelle 3E.1 : exécuter les tests migrés sans HTML ni interface."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
proof = json.loads((ROOT / 'docs/architecture/MIGRATION_TESTS_3E.json').read_text())
with tempfile.TemporaryDirectory(prefix='avatar-source-only-') as directory:
    target = Path(directory)
    shutil.copytree(ROOT / 'src', target / 'src')
    shutil.rmtree(target / 'src/interface')
    shutil.copytree(ROOT / 'scripts/architecture', target / 'scripts/architecture')
    for row in proof['migrated']:
        destination = target / row['path']
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / row['path'], destination)
    assert not (target / 'app').exists()
    assert not (target / 'src/interface').exists()
    def run(row):
        result = subprocess.run(['node', str(target / row['path'])], cwd=target,
                                capture_output=True, text=True, timeout=60)
        return row['path'], result
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(run, proof['migrated']))
    failures = [(name, result) for name, result in results if result.returncode]
    for name, result in failures:
        print(name, result.stdout, result.stderr)
    if failures:
        raise SystemExit(f'{len(failures)} échec(s) sans HTML/interface')
    print(f'{len(results)}/{len(results)} scripts migrés réussis sans app/, interface ni helpers historiques')
