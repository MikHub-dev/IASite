#!/usr/bin/env bash
# Assemble index.html à partir des sources de src/ (un seul fichier autonome).
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
r = lambda f: open(f, encoding='utf-8').read()
html = r('src/1_head.html') + r('src/2_body.html') + '<script>\n' + r('src/3_app.js') + '</script>' + r('src/4_tail.html')
open('index.html', 'w', encoding='utf-8').write(html)
print('index.html :', len(html.encode('utf-8')), 'octets')
PY
