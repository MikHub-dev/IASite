/* ===================== PARCOURS LLM : L'ATTENTION ===================== */
TITLES.attention = "Parcours LLM : l’attention";
(function(){
  const q = s => document.querySelector(s);
  const sm = a => { const m = Math.max(...a); const e = a.map(x => Math.exp(x - m)); const s = e.reduce((p,c)=>p+c,0); return e.map(x => x/s); };
  const fmt = (x,n=3) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(n).replace('.',',');
  const pct = x => (x*100).toFixed(1).replace('.',',') + ' %';
  const names = ['Le','chien','aboie'];
  const bars = (el, items, hi) => el.innerHTML = items.map((it,i) =>
    `<div class="row${i===hi?' hi':''}"><span>${it[0]}</span><div class="bar"><i style="width:${Math.max(it[1]*100,.4).toFixed(1)}%"></i></div><span>${pct(it[1])}</span></div>`).join('');

  /* encadrés et navigation interne */
  const sec = q('#p-attention'), mb = q('#pa-more');
  mb.onclick = () => { const off = sec.classList.toggle('nomore'); mb.classList.toggle('on', !off);
    mb.textContent = 'Encadrés « Pour aller plus loin » : ' + (off ? 'masqués' : 'affichés'); };
  const refit = () => { if(curPage==='attention') fitPl(plsOf('attention')[curIdx]); };
  sec.addEventListener('change', refit); sec.addEventListener('click', e => { if(e.target.closest('button')) setTimeout(refit,0); });
  const TILES = [['Prédire','Un LLM prédit le mot suivant'],['Vecteurs','Des mots aux vecteurs'],['Attention','Donner des poids aux mots'],['Q, K, V','Le calcul complet, modifiable'],['Softmax','Des scores aux poids'],['Masque','Ne pas voir le futur'],['Têtes','Plusieurs regards en parallèle'],['Couches et quiz','Empiler, puis vérifier']];
  q('#pa-tiles').innerHTML = TILES.map((t,i)=>`<div class="pa-tile" data-pago="${i+1}"><span class="pa-n">${i+1}</span><b>${t[0]}</b><span>${t[1]}</span></div>`).join('');
  q('#pa-tiles').addEventListener('click', e => { const b = e.target.closest('[data-pago]'); if(b){ const i = plsOf('attention').findIndex(p=>p.dataset.pa===b.dataset.pago); goTarget('attention/'+(i+1)); } });

  bars(q('#pa-next'), [['fort',.46],['la nuit',.18],['fort,',.12],['encore',.10],['(autres)',.14]], 0);
  bars(q('#pa-sky'), [['Le',.02],['Grand',.31],['Chien',.08],['est',.01],['visible',.24],['dans',.01],['le',.01],['ciel',.32]], 7);

  /* calculateur */
  const X0 = [[1,0,1,0],[0,2,0,1],[1,1,0,1]];
  let X = X0.map(r => r.slice());
  function attn(Xm, sqrtOn, causal){
    const d = Xm[0].length, sc = sqrtOn ? Math.sqrt(d) : 1;
    const S = Xm.map(a => Xm.map(k => a.reduce((s,v,t) => s + v*k[t], 0)));
    const Sd = S.map(r => r.map(v => v/sc));
    const Sm = Sd.map((r,i) => r.map((v,j) => causal && j>i ? -Infinity : v));
    const A = Sm.map(sm);
    const O = A.map(a => Xm[0].map((_,t) => a.reduce((s,w,j) => s + w*Xm[j][t], 0)));
    return {S, Sd, Sm, A, O, d};
  }
  function drawInputs(){
    q('#pa-xin').innerHTML = '<tr><th></th><th>dim 1</th><th>dim 2</th><th>dim 3</th><th>dim 4</th></tr>' +
      X.map((r,i) => `<tr><th>${names[i]}</th>` + r.map((v,j) => `<td><input class="pa-num" type="number" step="0.5" data-i="${i}" data-j="${j}" value="${v}" aria-label="${names[i]} dimension ${j+1}"></td>`).join('') + '</tr>').join('');
  }
  q('#pa-xin').addEventListener('input', e => { const t = e.target; if(t.dataset.i){ X[+t.dataset.i][+t.dataset.j] = parseFloat(t.value) || 0; calc(); } });
  function calc(){
    const i = +q('#pa-qsel').value, sq = q('#pa-sqrt').checked, ca = q('#pa-causal').checked, r = attn(X, sq, ca);
    const lst = a => '[' + a.map(v => v === -Infinity ? '−∞' : fmt(v,2)).join(' ; ') + ']';
    q('#pa-calc').innerHTML = `<pre style="margin:0">Mot qui regarde : ${names[i]} (d = ${r.d})
scores bruts q·k     ${lst(r.S[i])}
${sq ? ('÷ √'+r.d+' = '+fmt(Math.sqrt(r.d),2)).padEnd(21) : '(sans division)'.padEnd(21)}${lst(r.Sd[i])}
${ca ? 'après masque         ' + lst(r.Sm[i]) + '\n' : ''}poids (softmax)      [${r.A[i].map(v=>fmt(v,3)).join(" ; ")}]
nouveau vecteur      ${lst(r.O[i])}</pre><div class="bars" id="pa-calcbars" style="margin-top:10px"></div>`;
    bars(q('#pa-calcbars'), names.map((n,j) => [n, r.A[i][j]]), r.A[i].indexOf(Math.max(...r.A[i])));
  }
  ['#pa-qsel','#pa-sqrt','#pa-causal'].forEach(s => q(s).onchange = calc);
  q('#pa-reset').onclick = () => { X = X0.map(r => r.slice()); drawInputs(); calc(); };
  drawInputs(); calc();

  /* simulation √d */
  const gauss = () => { let u=0, v=0; while(!u) u=Math.random(); while(!v) v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  q('#pa-sim').onclick = () => {
    let out = '   d    écart-type de q·k    après ÷ √d\n';
    [4,64,1024].forEach(d => { let s = 0; const N = 2000;
      for(let t=0;t<N;t++){ let p=0; for(let k=0;k<d;k++) p += gauss()*gauss(); s += p*p; }
      const sd = Math.sqrt(s/N);
      out += String(d).padStart(5) + sd.toFixed(2).replace('.',',').padStart(16) + (sd/Math.sqrt(d)).toFixed(2).replace('.',',').padStart(18) + '\n'; });
    q('#pa-simout').textContent = out + '\nL’écart-type brut croît comme √d. Après division, il reste proche de 1.';
  };

  /* softmax */
  function drawSm(){
    const v = parseFloat(q('#pa-sm').value); q('#pa-smv').value = String(v).replace('.',',');
    const s = [1,v,2], e = s.map(Math.exp);
    bars(q('#pa-smbars'), names.map((n,j) => [n, sm(s)[j]]), 1);
    q('#pa-smcalc').textContent = 'exp : [' + e.map(x => fmt(x,2)).join(' ; ') + ']\nsomme = ' + fmt(e.reduce((a,b)=>a+b,0),2);
  }
  q('#pa-sm').oninput = drawSm; drawSm();

  /* carte de chaleur */
  function drawHeat(){
    const causal = q('input[name=pa-mode]:checked').value === 'ca', r = attn(X0, true, causal);
    q('#pa-heat').innerHTML = '<tr><th></th>' + names.map(n => `<th>${n}</th>`).join('') + '</tr>' +
      r.A.map((row,i) => `<tr><th>${names[i]}</th>` + row.map(v => `<td style="background:rgba(61,216,255,${(v*.75).toFixed(3)});color:${v>.5?'#021021':'#e8effc'}">${fmt(v,3)}</td>`).join('') + '</tr>').join('');
  }
  document.querySelectorAll('input[name=pa-mode]').forEach(e => e.onchange = drawHeat); drawHeat();

  /* dimensions */
  function drawDim(){
    const dm = +q('#pa-dm').value, h = +q('#pa-hh').value, f = n => n.toLocaleString('fr-FR');
    if(dm % h){ q('#pa-dimout').textContent = 'd_model doit être divisible par h : ' + dm + ' / ' + h + ' n’est pas un entier.'; return; }
    const dh = dm/h;
    q('#pa-dimout').textContent = `d_head = d_model / h = ${dm} / ${h} = ${dh}
Chaque token : ${f(dm)} nombres. Chaque tête : ${dh} nombres.
W_Q d’une tête : ${f(dm)} × ${dh} = ${f(dm*dh)} paramètres (idem W_K, W_V)
Une couche d’attention (h têtes × 3 matrices + W_O) : ${f(4*dm*dm)} paramètres
Facteur de normalisation : √${dh} = ${Math.sqrt(dh).toFixed(2).replace('.',',')}` + (dm===128 && h===4 ? '\n→ c’est exactement le micro-GPT' : '');
  }
  q('#pa-dm').onchange = drawDim; q('#pa-hh').onchange = drawDim; drawDim();

  /* quiz */
  const Q = [
   {q:'Que calcule le softmax appliqué aux scores d’attention ?', o:['Des poids positifs de somme 1','Le produit scalaire de Q et K','La dimension des têtes'], a:0, w:'Il transforme chaque ligne de scores en distribution de probabilités.'},
   {q:'Dans l’analogie de la bibliothèque, que représente la Value (V) ?', o:['La question posée','L’étiquette du livre','Le contenu du livre qu’on lit'], a:2, w:'Q compare, K étiquette, V transporte l’information effectivement récupérée.'},
   {q:'Pourquoi divise-t-on les scores par √d ?', o:['Pour accélérer le calcul','Pour éviter que le softmax se bloque sur un seul mot','Pour rendre les scores négatifs'], a:1, w:'Sans cela, les scores grandissent avec d et le softmax devient quasi one-hot.'},
   {q:'Quand applique-t-on le masque causal ?', o:['Avant le softmax, en mettant −∞','Après le softmax, en mettant 0','Sur les embeddings seulement'], a:0, w:'exp(−∞) = 0 donne un poids nul, et les autres poids restent de somme 1.'},
   {q:'Quel modèle utilise une attention bidirectionnelle ?', o:['GPT','BERT','Aucun'], a:1, w:'BERT lit tout le texte pour le comprendre ; GPT génère et ne doit pas voir le futur.'},
   {q:'Avec d_model = 4096 et 32 têtes, que vaut d_head ?', o:['32','128','4096'], a:1, w:'4096 / 32 = 128.'}
  ];
  let score = 0, done = 0;
  const qHTML = (x,i) => `<div class="pa-q" id="pa-q${i}"><b>${i+1}. ${x.q}</b><div class="pa-opts">${x.o.map((o,j) => `<button type="button" data-q="${i}" data-j="${j}">${o}</button>`).join('')}</div><div class="note pa-why" hidden></div></div>`;
  const drawQuiz = () => { score = 0; done = 0; q('#pa-score').textContent = '';
    q('#pa-quiz1').innerHTML = Q.slice(0,2).map((x,i)=>qHTML(x,i)).join('');
    q('#pa-quiz2').innerHTML = Q.slice(2,4).map((x,i)=>qHTML(x,i+2)).join('');
    q('#pa-quiz3').innerHTML = Q.slice(4).map((x,i)=>qHTML(x,i+4)).join('') + '<div class="pa-row"><span id="pa-score2" class="note"></span><button class="btn" type="button" id="pa-again">Recommencer le quiz</button></div>'; };
  document.addEventListener('click', e => {
    if(e.target.id === 'pa-again'){ drawQuiz(); if(curPage==='attention') fitPl(plsOf('attention')[curIdx]); return; }
    const b = e.target.closest('button[data-q]'); if(!b) return;
    const i = +b.dataset.q, j = +b.dataset.j, box = q('#pa-q'+i);
    if(box.dataset.done) return; box.dataset.done = 1;
    box.querySelectorAll('button').forEach((bt,k) => { bt.disabled = true; if(k === Q[i].a) bt.classList.add('good'); });
    if(j !== Q[i].a) b.classList.add('bad'); else score++;
    const w = box.querySelector('.pa-why'); w.hidden = false; w.textContent = (j === Q[i].a ? 'Exact. ' : 'Pas tout à fait. ') + Q[i].w;
    done++; const txt = 'Score : ' + score + ' / ' + done + (done === Q.length ? (score === Q.length ? ' · parcours maîtrisé' : ' · relis les étapes des questions manquées') : '');
    q('#pa-score').textContent = txt; q('#pa-score2').textContent = txt;
    if(curPage==='attention') fitPl(plsOf('attention')[curIdx]);
  });
  drawQuiz();

  /* recherche */
  const PA_STEPS = ['Un LLM prédit le mot suivant','Des mots aux vecteurs : tokenisation, embedding, d_model','L’idée de l’attention : donner des poids aux mots, Q K V bibliothèque','Q, K, V : le calcul complet, produit scalaire, division par √d','Softmax : transformer des scores en poids, exponentielle','Le masque causal : GPT ne doit pas voir le futur, BERT bidirectionnel','Plusieurs têtes d’attention, d_head, concaténation, W_O','Les couches, puis quiz de fin de parcours'];
  PA_STEPS.forEach((t,i) => IDX.push({t:`Attention · étape ${i+1} · ${t}`, s:'Parcours LLM : comprendre l’attention', txt:t, go:'attention', pa:i+1}));
})();

/* ===================== DÉMARRAGE ===================== */
/* On attend les polices (Outfit, JetBrains Mono) avant de répartir le contenu, pour mesurer le texte réel. */
(function start(){
  let done = false;
  const go1 = () => { if(done) return; done = true;
    $$('.pl').forEach(wrapPl);
    setScale(); PACK_W = IW / F_PACK;
    packAll(); buildGenerated(); setScale(); show(...parseHash()); };
  const fl = document.fonts ? Promise.all([document.fonts.load('400 16px Outfit'), document.fonts.load('600 16px Outfit'), document.fonts.load('400 14px "JetBrains Mono"')]).then(()=>document.fonts.ready) : Promise.resolve();
  fl.then(go1, go1); setTimeout(go1, 2500);
})();
