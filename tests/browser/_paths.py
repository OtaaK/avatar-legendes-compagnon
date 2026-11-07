"""Chemins communs aux tests, indépendants du dossier de lancement."""
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_DIR = ROOT / 'app'
APP_HTML = APP_DIR / 'simulateur.html'
# None demande à Playwright son Chromium installé ; aucun téléchargement implicite.
CHROMIUM_EXECUTABLE = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
