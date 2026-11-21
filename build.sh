#!/usr/bin/env bash
# Assemble index.html à partir des sources de src/ (un seul fichier autonome).
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
body = open('src/2_body.html', encoding='utf-8').read()
pa = open('src/2b_attention.html', encoding='utf-8').read()
mark = '<!--ATTENTION-->'
assert mark in body
body = body.replace(mark, pa + mark, 1)
js = ''.join(open(f, encoding='utf-8').read() for f in ['src/3_data_steps.js', 'src/4_data_lex.js', 'src/5_app.js', 'src/5b_attention.js'])
html = open('src/1_head.html', encoding='utf-8').read() + body + '<script>\n' + js + '</script>\n</body></html>\n'
open('index.html', 'w', encoding='utf-8').write(html)
print('index.html :', len(html.encode('utf-8')), 'octets')
PY
