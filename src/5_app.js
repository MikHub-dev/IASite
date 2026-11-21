/* ===================== APPLICATION ===================== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fr = (x, d=0) => Number(x).toLocaleString('fr-FR', {minimumFractionDigits:d, maximumFractionDigits:d});
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip = s => String(s).replace(/<[^>]+>/g,'');
const norm = s => strip(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

const TITLES = {accueil:"Accueil", fondations:"Fondations", donnees:"Données & tokens", reseau:"Le réseau", apprentissage:"Apprentissage",
  generation:"Génération", assistant:"Assistant", agents:"Agents & MCP", physique:"Physique & hasard", echelles:"Échelles",
  dico:"Dictionnaire", ateliers:"Ateliers", frise:"Frise", parcours:"Le parcours", fmaths:"Fiches Mathématiques", fphys:"Fiches Physiques",
  finfo:"Fiches Informatiques", reperes:"Repères chiffrés", approche:"Choisir son approche", code:"Le code micro_gpt.py",
  attention:"Parcours LLM : l’attention", apropos:"À propos"};
const ORDER = Object.keys(TITLES);

/* ===================== MOTEUR DE PLANCHES ===================== */
let PW = 1600, IW = 1512; const PH = 900, IH = 840;   // hauteur fixe ; largeur adaptée à l'écran (calculée au démarrage)
const F_CARD = 1.32;          // taille fixe du contenu des vignettes (test A : 11,6 px pour le texte à 1536×700)
const F_PACK = F_CARD, F_MAX = 2.2;   // remplissage à la taille des vignettes ; les planches sans vignette peuvent grandir jusqu'à F_MAX
const VIGN = '.card,.step,.lx,.stat,.pa-tile,.ev,.evt';
let PACK_W = IW / F_PACK; const PACK_H = IH / F_PACK * 1.04;   // 4 % de marge : évite de perdre une ligne pour quelques pixels
const FITLOG = {};
function wrapPl(pl){ if(!pl.firstElementChild || !pl.firstElementChild.classList.contains('plin')){ const w=document.createElement('div'); w.className='plin'; while(pl.firstChild) w.appendChild(pl.firstChild); pl.appendChild(w); } return pl.firstElementChild; }
/* Cherche le plus grand agrandissement f pour lequel le contenu tient dans la planche (hauteur et largeur). */
function fitPl(pl, iw){
  if(iw === undefined) iw = pl.classList.contains('fiche') ? 1512 : IW;
  const inn = wrapPl(pl);
  const ok = f => {
    inn.style.width = (iw/f)+'px'; inn.style.transform = `scale(${f})`;
    if(inn.offsetHeight*f > IH + .5) return false;
    if(inn.scrollWidth > inn.clientWidth + 1) return false;
    for(const e of inn.querySelectorAll('pre')) if(e.scrollWidth > e.clientWidth + 1) return false;
    for(const e of inn.querySelectorAll('table')) if(e.offsetWidth > e.parentElement.clientWidth + 1) return false;
    return true;
  };
  // Les grilles changent de nombre de colonnes avec la largeur : on balaie de la plus grande taille à la plus petite.
  const top = inn.querySelector(VIGN) ? F_CARD : F_MAX;   // planche à vignettes : taille fixe, jamais plus grande
  let lo = null;
  if(ok(top)) lo = top;
  else for(let f = top; f >= .35; f -= .05){ if(ok(f)){ lo = f; break; } }
  if(lo === null) lo = .35;
  else if(lo < top) { let hi = Math.min(top, lo + .05); for(let k=0;k<5;k++){ const m=(lo+hi)/2; if(ok(m)) lo=m; else hi=m; } }
  ok(lo);
  FITLOG[((pl.closest('section')||pl.parentElement||{}).id||'modal')+' · '+(pl.dataset.t||'')] = +lo.toFixed(2);
  return lo;
}
/* Répartit le contenu d'une planche d'origine en planches qui tiennent avec un texte doublé. */
const SPLIT = '.grid,.steps,.lexg,.col-stack,.frise,.stats,.pillars,.pa-tiles,.fsplit';
function packPl(orig){
  const inn = wrapPl(orig), kids = [...inn.children];
  const header = kids.length && kids[0].matches('.head,.phead,.pa-h,.planche') ? kids[0] : null;
  const hk = header ? ((header.querySelector('.kicker')||{}).textContent||'') : '';
  const ht = header ? ((header.querySelector('h1,h2')||{}).textContent||'') : '';
  const host = $('#measure'), pages = [];
  let box;
  const newPage = () => {
    const pg = document.createElement('div'); pg.className = orig.className; if(orig.dataset.pa) pg.dataset.pa = orig.dataset.pa;
    box = document.createElement('div'); box.className = 'plin'; box.style.width = PACK_W+'px'; pg.appendChild(box); host.appendChild(pg); pages.push(pg);
    if(pages.length > 1 && header) box.insertAdjacentHTML('beforeend', `<div class="phead cont"><div class="kicker">${esc(hk)}</div><h2>${esc(ht.trim())} <span class="note">(suite)</span></h2></div>`);
  };
  const over = () => box.offsetHeight > PACK_H;
  const units = () => [...box.children].filter(c => c !== header && !c.classList.contains('cont')).length;
  const carry = () => { const prev = box; newPage(); const mv = [];
    while(prev.lastElementChild && prev.lastElementChild !== header && prev.lastElementChild.matches('.sectitle,.keepnext')) mv.unshift(prev.lastElementChild);
    mv.forEach(m => box.appendChild(m)); };
  newPage(); if(header) box.appendChild(header);
  for(const u of kids){
    if(u === header) continue;
    box.appendChild(u);
    if(!over()) continue;
    const canSplit = u.matches(SPLIT) && !u.classList.contains('nosplit') && u.children.length > 1;
    if(!canSplit){ if(units() > 1){ u.remove(); carry(); box.appendChild(u); } continue; }
    u.remove(); const ch = [...u.children]; ch.forEach(c => c.remove());
    let cont = u; box.appendChild(cont);
    ch.forEach(c => {
      cont.appendChild(c);
      if(!over()) return;
      if(cont.children.length > 1){ c.remove(); newPage(); cont = u.cloneNode(false); cont.removeAttribute('id'); box.appendChild(cont); cont.appendChild(c); }
      else if(units() > 1){ cont.remove(); carry(); box.appendChild(cont); }
    });
  }
  const t = orig.dataset.t || '';
  pages.forEach((pg,i) => pg.dataset.t = pages.length > 1 && i ? `${t} (${i+1})` : t);
  return pages;
}
function packAll(){
  $$('section.page').forEach(sec => {
    [...sec.children].filter(e => e.classList.contains('pl') && !e.dataset.k).forEach(orig => {
      if(orig.dataset.nosplit) return;
      const pages = packPl(orig);
      pages.forEach(pg => sec.insertBefore(pg, orig)); orig.remove();
    });
  });
}
/* La planche occupe toute la largeur disponible : sa largeur suit les proportions de la zone d'affichage. */
function computeDims(){
  const v = $('#viewport').getBoundingClientRect();
  const a = Math.max(.6, (v.width - 8) / Math.max(200, v.height - 8));
  PW = Math.round(Math.min(2800, Math.max(900, PH * a))); IW = PW - 88;
  document.documentElement.style.setProperty('--pw', PW+'px');
}
function setScale(){
  computeDims();
  const v = $('#viewport').getBoundingClientRect();
  const s = Math.min((v.width-8)/PW, (v.height-8)/PH);
  document.documentElement.style.setProperty('--s', Math.max(s,.2));
  document.documentElement.style.setProperty('--sm', Math.min(innerWidth*.96/1600, (innerHeight-74)/PH));
}
addEventListener('resize', () => { setScale(); if(curPage) show(curPage, curIdx); });

/* Découpe une liste en planches : chaque planche reçoit un en-tête et autant d'éléments qu'elle peut en contenir. */
function paginate(secId, key, {title, head, wrap, items}){
  const sec = $('#p-'+secId), host = $('#measure');
  sec.querySelectorAll(`.pl[data-k="${key}"]`).forEach(p=>p.remove());
  const out = [];
  const mk = i => { const pl = document.createElement('div'); pl.className='pl'; pl.dataset.k=key;
    pl.innerHTML = `<div class="plin" style="width:${PACK_W}px">${head(i)}${wrap}</div>`; host.appendChild(pl); out.push(pl); return pl; };
  let pl = mk(0), slot = pl.querySelector('[data-slot]');
  items.forEach(html => {
    slot.insertAdjacentHTML('beforeend', html);
    if(pl.firstElementChild.offsetHeight > PACK_H && slot.children.length > 1){
      const last = slot.lastElementChild; last.remove();
      const carry = [];
      while(slot.lastElementChild && slot.lastElementChild.classList.contains('keepnext')) carry.unshift(slot.lastElementChild.outerHTML), slot.lastElementChild.remove();
      pl = mk(out.length); slot = pl.querySelector('[data-slot]');
      carry.forEach(c => slot.insertAdjacentHTML('beforeend', c));
      slot.appendChild(last);
    }
  });
  out.forEach((p,i) => { p.dataset.t = out.length>1 ? `${title} ${i+1}/${out.length}` : title; sec.appendChild(p); });
}

/* ---------- navigation ---------- */
let curPage = null, curIdx = 0;
const plsOf = id => $$(`#p-${id} > .pl`);
function parseHash(){ const [p,n] = location.hash.slice(1).split('/'); return [TITLES[p]?p:'accueil', Math.max(0,(parseInt(n)||1)-1)]; }
function show(id, idx=0){
  const pls = plsOf(id); if(!pls.length) return;
  idx = Math.min(Math.max(idx,0), pls.length-1);
  curPage = id; curIdx = idx;
  $$('section.page').forEach(s => s.classList.toggle('on', s.id === 'p-'+id));
  pls.forEach((p,i) => p.classList.toggle('cur', i===idx));
  fitPl(pls[idx]);
  $$('[data-go]').forEach(a => { if(a.closest('nav.main,aside.side')) a.classList.toggle('on', a.dataset.go.split('/')[0] === id); });
  document.title = 'IASite — ' + TITLES[id] + (pls.length>1 ? ` (${idx+1}/${pls.length})` : '');
  drawNav(pls);
}
function drawNav(pls){
  const pi = ORDER.indexOf(curPage);
  const prev = curIdx>0 ? ['← '+pls[curIdx-1].dataset.t, `${curPage}/${curIdx}`] : (pi>0 ? ['← '+TITLES[ORDER[pi-1]], ORDER[pi-1]+'/last'] : null);
  const next = curIdx<pls.length-1 ? [pls[curIdx+1].dataset.t+' →', `${curPage}/${curIdx+2}`] : (pi<ORDER.length-1 ? [TITLES[ORDER[pi+1]]+' →', ORDER[pi+1]] : null);
  const set = (el, v) => { el.classList.toggle('off', !v); el.textContent = v ? v[0] : ''; el.dataset.target = v ? v[1] : ''; el.title = v ? v[0] : ''; };
  set($('#pPrev'), prev); set($('#pNext'), next);
  const pt = pls[curIdx].dataset.t||''; $('#pTitle').innerHTML = `<b>${esc(TITLES[curPage])}</b>` + (pt && !pt.startsWith(TITLES[curPage]) && pt!==TITLES[curPage] ? ` · ${esc(pt)}` : '') + (pls.length>1 ? ` · ${curIdx+1} / ${pls.length}` : '');
  $('#pDots').innerHTML = pls.length>1 && pls.length<=30 ? pls.map((p,i)=>`<button class="${i===curIdx?'on':''}" title="${esc(p.dataset.t||'')}" data-dot="${i+1}"></button>`).join('') : '';
}
function goTarget(t){
  let [p,n] = t.split('/');
  if(p.includes('@')){ const [pp,el] = p.split('@'); p = pp; const k = plsOf(p).findIndex(x => x.querySelector('#'+el)); n = String(k >= 0 ? k+1 : 1); }
  if(n === 'last') n = String(plsOf(p).length);
  location.hash = p + (n && +n > 1 ? '/'+n : '');
}
function go(t){ const before = location.hash; goTarget(t); if(location.hash === before) show(...parseHash()); }
function step(d){
  const t = (d<0 ? $('#pPrev') : $('#pNext')).dataset.target;
  if(t) goTarget(t);
}
window.addEventListener('hashchange', () => show(...parseHash()));
$('#pPrev').addEventListener('click', ()=>step(-1));
$('#pNext').addEventListener('click', ()=>step(1));
$('#pDots').addEventListener('click', e => { const b=e.target.closest('[data-dot]'); if(b) goTarget(`${curPage}/${b.dataset.dot}`); });
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if(g){ e.preventDefault(); closeAll(); go(g.dataset.go); return; }
  const st = e.target.closest('[data-step]');
  if(st){ e.preventDefault(); closeSearch(); openStep(+st.dataset.step); }
});

/* ---------- cartes d'étapes ---------- */
function stepCard(s){
  return `<div class="step${s.future?' future':''}" data-step="${s.n}">
    <div class="n">${s.n}</div>${s.future?'<span class="lbl">modèle ouvert</span>':''}
    <h3>${s.t}</h3><p>${s.short}</p><div class="r">${s.obs?'Repère observé':'Repère'} · ${s.rep}</div></div>`;
}
$$('[data-steps]').forEach(c => {
  const [a,b] = c.dataset.steps.split('-').map(Number);
  c.innerHTML = STEPS.filter(s => s.n>=a && s.n<=b).map(stepCard).join('');
});
$('#homePlanches').innerHTML = PLANCHES.map(p => `
  <div class="card" style="cursor:pointer" data-go="${p.range? 'parcours@pg-'+p.n : 'fondations'}">
    <div class="kicker">Planche ${p.n} / 5${p.range?` · étapes ${p.range[0]} à ${p.range[1]}`:''}</div>
    <h3>${p.t}</h3><p class="note" style="margin:0 0 8px">${p.s}</p>
    <span class="tag m">${p.rep}</span></div>`).join('');

/* Le parcours : une planche d'ensemble, puis une planche par groupe d'étapes */
(function(){
  const sec = $('#p-parcours');
  let html = `<div class="pl" data-t="Vue d’ensemble"><div class="head"><div class="kicker">Parcours en 15 étapes</div><h1>Construire un micro-GPT de zéro</h1>
    <p class="lead">Du texte brut au modèle qui écrit, puis à l’assistant qui répond et à l’agent qui agit. Les étapes 1 à 13 ont été réalisées et mesurées avec micro_gpt.py (1 315 968 réglages, entraîné sur Shakespeare). Les étapes 14 et 15, en violet, se pratiquent sur un modèle ouvert plus grand.</p></div>
    <div class="svgbox"><svg viewBox="0 0 1500 300" font-family="Outfit,system-ui,sans-serif">
      <path id="parcLine" d="M60 150 H1440" stroke="#3dd8ff" stroke-opacity=".5" stroke-width="3"/>
      <circle r="7" fill="#fff"><animateMotion dur="9s" repeatCount="indefinite"><mpath href="#parcLine"/></animateMotion></circle>
      ${STEPS.map((s,i)=>{ const x=60+i*(1380/14); const top=i%2===0;
        return `<g data-step="${s.n}" style="cursor:pointer"><circle cx="${x}" cy="150" r="20" fill="${s.future?'#6941c6':'#1677b8'}" stroke="${s.future?'#d0b8ff':'#7fe6ff'}" stroke-width="2"/>
        <text x="${x}" y="156" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">${s.n}</text>
        <text x="${x}" y="${top?100:210}" text-anchor="middle" fill="#dfe9fb" font-size="13">${esc(s.t.split(/ :|,/)[0].slice(0,26))}</text></g>`; }).join('')}
      <text x="750" y="280" text-anchor="middle" fill="#93a8cb" font-size="13">Cliquez sur une étape pour ouvrir sa fiche · flèche → pour les planches</text>
    </svg></div>
    <div class="grid g3">${PLANCHES.map(p=>`<div class="card" style="cursor:pointer" data-go="${p.range?'parcours@pg-'+p.n:'fondations'}"><div class="kicker">Planche ${p.n} / 5</div><b>${p.t}</b><br><span class="note">${p.rep}</span></div>`).join('')}</div></div>`;
  sec.innerHTML = html;
})();

/* ---------- fiche modale : une ou plusieurs planches, texte doublé ---------- */
let curStep = null, ficheIdx = 0;
function openStep(n, page=0){
  const s = STEPS.find(x => x.n === n); if(!s) return;
  curStep = n;
  const p = PLANCHES.find(p => p.range && n>=p.range[0] && n<=p.range[1]);
  const tmp = document.createElement('div'); tmp.className = 'pl fiche'; tmp.dataset.t = 'Étape '+n;
  tmp.innerHTML = `<div class="head"><div class="kicker">Planche ${p.n} · ${p.t} · étape ${n} / 15</div><h1 style="margin:0">${s.t}</h1></div>
    ${s.future?'<div class="rig" style="border-color:var(--vi);background:rgba(169,139,255,.08);margin:0">Étape non exécutée avec micro_gpt.py : elle se pratique sur un modèle ouvert de 1 à 3 milliards de réglages, déjà pré-entraîné selon les étapes 1 à 13.</div>':''}
    <div class="fsec why" style="margin:0"><h4>Pourquoi</h4><p>${s.why}</p></div>
    <div class="fsec what fsplit col-stack" style="margin:0;gap:8px"><h4 style="margin:0">Ce qui se passe</h4>${s.what.map(w=>`<div class="li">${w}</div>`).join('')}</div>
    <div class="fsec io" style="margin:0"><h4>Entrée → sortie</h4><div class="iobox"><span>${s.io[0]}</span><em>→</em><span>${s.io[1]}</span></div></div>
    <div class="fsec math" style="margin:0"><h4>Le lien avec les maths</h4><p>${s.math}</p></div>
    <div class="fsec info" style="margin:0"><h4>Côté informatique</h4><p>${s.info}</p></div>
    ${s.rig?`<div class="rig" style="margin:0"><b>Point de rigueur.</b> ${s.rig}</div>`:''}
    <div class="fsec rep" style="margin:0"><h4>${s.obs?'Repère observé':(s.future?'Repère attendu':'Repère')}</h4><span class="repbox">${s.rep}</span></div>`;
  $('#measure').appendChild(tmp);
  const pages = packPl(tmp); tmp.remove();
  const modal = $('#modal'); modal.querySelectorAll('.fiche').forEach(x => x.remove());
  pages.forEach(pg => { pg.classList.add('fiche'); modal.appendChild(pg); });
  ficheIdx = page < 0 ? pages.length-1 : Math.min(page, pages.length-1);
  pages.forEach((pg,i) => pg.classList.toggle('cur', i===ficheIdx));
  modal.classList.add('on');
  fitPl(pages[ficheIdx]);
  $('#mpages').innerHTML = `<button class="btn" data-mnav="-1" ${n===1&&ficheIdx===0?'disabled style="opacity:.3"':''}>←</button>
    <span>Étape ${n} / 15${pages.length>1?` · page ${ficheIdx+1} / ${pages.length}`:''}</span>
    <button class="btn" data-mnav="1" ${n===15&&ficheIdx===pages.length-1?'disabled style="opacity:.3"':''}>→</button>
    <button class="btn" data-go="${p.go}">Voir la planche illustrée</button><button class="btn" data-mclose="1">Fermer ✕</button>`;
  $('#mpages').dataset.total = pages.length;
}
function ficheNav(d){
  const tot = +$('#mpages').dataset.total;
  if(ficheIdx + d >= 0 && ficheIdx + d < tot) openStep(curStep, ficheIdx + d);
  else if(d > 0 && curStep < 15) openStep(curStep+1, 0);
  else if(d < 0 && curStep > 1) openStep(curStep-1, -1);
}
function closeModal(){ $('#modal').classList.remove('on'); curStep = null; }
$('#modal').addEventListener('click', e => {
  if(e.target.id === 'modal' || e.target.closest('[data-mclose]')) closeModal();
  const nv = e.target.closest('[data-mnav]'); if(nv && curStep) ficheNav(+nv.dataset.mnav);
});
function closeAll(){ closeModal(); closeSearch(); }

/* ---------- apprentissage : vérifications, vitesse, perte ---------- */
$('#checks').innerHTML = CHECKS.map((c,i)=>`<div style="display:flex;gap:12px;align-items:flex-start;margin:7px 0">
  <span style="flex:none;width:14px;height:14px;margin-top:5px;border-radius:50%;background:#3ee0a1;box-shadow:0 0 10px #3ee0a1"></span>
  <div><b>${i+1}. ${c[0]}</b><br><span class="note">${c[1]}</span></div></div>`).join('');
(function(){
  $('#speedbars').innerHTML = [[0,1],[2,3],[4,5]].map(([a,b])=>{
    const max = SPEED[a][2];
    return `<div style="margin:8px 0 2px;color:var(--mut);font-size:.85rem">${SPEED[a][0]}</div>` + [a,b].map(i=>
      `<div class="row"><span>${SPEED[i][1]}</span><div class="bar"><i style="width:${SPEED[i][2]/max*100}%;${i===a?'opacity:.4':''}"></i></div><span>${SPEED[i][3]}</span></div>`).join('');
  }).join('');
})();
(function(){
  const X = s => 60 + s/800*430, Y = v => 240 - (v-3)/6*215;
  let g = '';
  for(let v=3; v<=9; v++) g += `<line x1="60" x2="495" y1="${Y(v)}" y2="${Y(v)}" stroke="#1b3156"/><text x="50" y="${Y(v)+4}" fill="#93a8cb" font-size="11" text-anchor="end">${v}</text>`;
  LOSS.steps.forEach(s => g += `<text x="${X(s)}" y="262" fill="#93a8cb" font-size="11" text-anchor="middle">${s}</text>`);
  g += `<text x="278" y="278" fill="#5f7499" font-size="11" text-anchor="middle">pas d’entraînement</text>`;
  g += `<line x1="60" x2="495" y1="${Y(8.318)}" y2="${Y(8.318)}" stroke="#5f7499" stroke-dasharray="5 5"/>`;
  const vp = LOSS.steps.map((s,i)=>`${X(s)},${Y(LOSS.val[i])}`).join(' ');
  g += `<polyline points="${vp}" fill="none" stroke="#ff8a3d" stroke-width="2.5" stroke-dasharray="900" stroke-dashoffset="900"><animate attributeName="stroke-dashoffset" from="900" to="0" dur="2.5s" fill="freeze"/></polyline>`;
  const tp = LOSS.steps.map((s,i)=>LOSS.train[i]==null?null:`${X(s)},${Y(LOSS.train[i])}`).filter(Boolean).join(' ');
  g += `<polyline points="${tp}" fill="none" stroke="#3dd8ff" stroke-width="2" stroke-dasharray="6 5"/>`;
  LOSS.steps.forEach((s,i)=>{
    g += `<circle cx="${X(s)}" cy="${Y(LOSS.val[i])}" r="4.5" fill="#ff8a3d"/><text x="${X(s)+6}" y="${Y(LOSS.val[i])-8}" fill="#ffc9a3" font-size="11">${fr(LOSS.val[i],2)}</text>`;
    if(LOSS.train[i]!=null && i>0) g += `<circle cx="${X(s)}" cy="${Y(LOSS.train[i])}" r="4.5" fill="#3dd8ff"/><text x="${X(s)+6}" y="${Y(LOSS.train[i])+16}" fill="#bfefff" font-size="11">${fr(LOSS.train[i],2)}</text>`;
  });
  g += `<text x="${X(800)-4}" y="${(Y(3.45)+Y(4.39))/2+4}" fill="#ffd166" font-size="11" text-anchor="end">écart 0,94</text>`;
  $('#losschart').innerHTML = g;
})();

/* ---------- cartes diverses ---------- */
$('#approchCards').innerHTML = APPROCHES.map((a,i)=>`<div class="card${i===0?' hl':''}"><div class="kicker ${a[1]}">${i+1} / 4</div><h3 class="${a[1]}">${a[0]}</h3><p><b>${a[2]}</b><br><span class="note">${a[3]}</span></p><p class="note">Exemple : ${a[4]}</p></div>`).join('');
$('#codeSections').innerHTML = CODESECS.map(c=>`<div class="card"><h3 class="mono c-cy">${c[0]}</h3><p class="note" style="margin:0">${c[1]}</p></div>`).join('');

/* ---------- frise ---------- */
const MONTHS = {janv:1,'févr':2,mars:3,avr:4,mai:5,juin:6,juil:7,'août':8,sept:9,oct:10,nov:11,'déc':12,'début':0.5};
function yKey(s){
  const m = s.replace('−','-').match(/-?\d{3,4}/); let y = m ? +m[0] : 0;
  for(const k in MONTHS) if(s.includes(k)) { y += MONTHS[k]/13; break; }
  return y;
}
const ERAS = [[-1e9,"Des probabilités à Boltzmann"],[1900,"Le hasard entre dans la physique"],[1943,"Neurones formels, hivers et physique statistique"],[2000,"L’apprentissage profond"],[2017,"Transformers, LLM et agents"]];
function friseItems(theme, eras, tiles){
  const items = FRISE.map((f,i)=>({f,k:yKey(f[0])+i*1e-6})).filter(o=>theme==='all'||o.f[1]===theme).sort((a,b)=>a.k-b.k);
  const eraOf = k => ERAS.filter(x=>k>=x[0]).length-1;
  const counts = {}; items.forEach(o => { const e = eraOf(o.k); counts[e] = (counts[e]||0)+1; });
  const out = []; let era = -1;
  items.forEach(({f,k})=>{
    if(eras){ const e = eraOf(k); if(e!==era){ era=e;
      out.push(tiles ? `<div class="famtitle keepnext">${ERAS[e][1]}<span>${counts[e]} jalon${counts[e]>1?'s':''}</span></div>` : `<div class="era keepnext">${ERAS[e][1]}</div>`); } }
    const [lab,col] = THEMES[f[1]];
    out.push(tiles
      ? `<div class="evt${f[2]===2?' s2':''}" style="--c:${col}"><div class="evh"><span class="y">${f[0]}</span><span class="st">${['☆','★','★★'][f[2]]}</span></div><div class="th">${lab}</div><div>${f[3]}</div></div>`
      : `<div class="ev${f[2]===2?' s2':''}" style="--c:${col}"><span class="y">${f[0]}</span><span class="th">${lab}</span><span class="st">${['☆','★','★★'][f[2]]}</span>${f[3]}</div>`);
  });
  return out;
}
$$('[data-frise]').forEach(c => c.innerHTML = friseItems(c.dataset.frise, false).join(''));
let friseTheme = 'all';
function drawFrise(){
  const chips = `<div class="chips" style="margin:0"><button class="chip${friseTheme==='all'?' on':''}" data-th="all">Tout (${FRISE.length})</button>` +
    Object.entries(THEMES).map(([k,[l,c]])=>`<button class="chip${friseTheme===k?' on':''}" data-th="${k}"><i style="background:${c}"></i>${l}</button>`).join('') + '</div>';
  paginate('frise','f',{title:'Frise', items:friseItems(friseTheme, friseTheme==='all'),
    head:i=> i===0 ? `<div class="phead"><div class="kicker">Antiquité → 2026 · ★★ tournant historique · ★ jalon majeur · ☆ jalon mineur</div><h2>Frise : des probabilités aux agents</h2></div>${chips}` : `<div class="phead"><div class="kicker">Frise${friseTheme==='all'?'':' · '+THEMES[friseTheme][0]}</div></div>`,
    wrap:'<div class="frise" data-slot></div>'});
}
document.addEventListener('click', e=>{ const b=e.target.closest('[data-th]'); if(b){ friseTheme=b.dataset.th; drawFrise(); show('frise',0); history.replaceState(null,'','#frise'); }});

/* ---------- lexique ---------- */
const DOM = {m:['m','maths'],p:['p','physique'],i:['i','info'],a:['a','IA']};
function etapesLinks(e){ return e.replace(/\b(1[0-5]|[1-9])\b/g, n => `<span data-step="${n}" style="text-decoration:underline dotted;cursor:pointer">${n}</span>`); }
function lexCard(l){
  return `<div class="lx"><h4>${l[0]}</h4><p>${l[3]}</p>
    <div>${[...l[2]].map(d=>`<span class="tag ${DOM[d][0]}">${DOM[d][1]}</span>`).join('')}<span class="et">étape ${etapesLinks(l[4])}</span></div></div>`;
}
function lexItems(list){
  const by = {}; list.forEach(l => (by[l[1]] = by[l[1]] || []).push(l));
  const out = [];
  Object.keys(FAMS).filter(f=>by[f]).forEach(f=>{ out.push(`<div class="famtitle keepnext">${FAMS[f]} <span>${by[f].length} notion${by[f].length>1?'s':''}</span></div>`); by[f].forEach(l=>out.push(lexCard(l))); });
  return out;
}
let dicoFam = 'all', dicoQ = '';
function drawDico(){
  const q = norm(dicoQ.trim());
  const list = LEX.filter(l => (dicoFam==='all'||l[1]===dicoFam) && (!q || norm(l[0]+' '+l[3]).includes(q)));
  const chips = `<div class="chips" style="margin:0">` + `<button class="chip${dicoFam==='all'?' on':''}" data-f="all">Toutes</button>` +
    Object.entries(FAMS).map(([k,v])=>`<button class="chip${dicoFam===k?' on':''}" data-f="${k}">${v}</button>`).join('') + '</div>';
  paginate('dico','d',{title:'Dictionnaire', items: list.length ? lexItems(list) : ['<p class="note">Aucune notion ne correspond.</p>'],
    head:i=> i>0 ? `<div class="phead"><div class="kicker">Dictionnaire${dicoFam==='all'?'':' · '+FAMS[dicoFam]}${dicoQ?' · « '+esc(dicoQ)+' »':''}</div></div>` : `<div class="dicohead"><div class="phead"><div class="kicker">Lexique du micro-GPT</div><h2>Dictionnaire</h2></div>
      <span class="note">${list.length} notion${list.length>1?'s':''} sur ${LEX.length} · chaque notion et à quoi elle a servi, avec ses étapes</span>
      <input class="q dicoQ" placeholder="Filtrer : softmax, Boltzmann, LoRA…" value="${esc(dicoQ)}"></div>${chips}`,
    wrap:'<div class="lexg" data-slot></div>'});
}
document.addEventListener('input', e=>{ if(e.target.classList.contains('dicoQ')){ dicoQ = e.target.value; const pos = e.target.selectionStart; drawDico(); show('dico',0); history.replaceState(null,'','#dico');
  const inp = $('#p-dico .pl.cur .dicoQ'); if(inp){ inp.focus(); inp.setSelectionRange(pos,pos); } }});
document.addEventListener('click', e=>{ const b=e.target.closest('[data-f]'); if(b){ dicoFam=b.dataset.f; drawDico(); show('dico',0); history.replaceState(null,'','#dico'); }});

/* ---------- pages générées : physique, fiches par discipline, repères ---------- */
const DOMPAGES = {fmaths:['m','Fiches Mathématiques','Les mathématiques du micro-GPT','Probabilités, algèbre linéaire, analyse et optimisation : chaque notion, et l’étape où elle sert.'],
  fphys:['p','Fiches Physiques','Les analogies physiques','Boltzmann, Euler, le recuit, les verres de spin : la physique n’est pas dans le code, mais ses formules y sont.'],
  finfo:['i','Fiches Informatiques','L’informatique du micro-GPT','Structures de données, automates, tests, mémoire, protocoles : tout ce qui fait tourner le modèle et le relie au monde.']};
const physCard = p => `<div class="card"><h3 class="${p[1]}">${p[0]}</h3><div class="formula">${p[2]}</div><p class="note" style="margin:0">${p[3]}</p></div>`;
function buildGenerated(){
  paginate('physique','a',{title:'Les analogies', items:PHYS.map(physCard),
    head:i=> i===0 ? `<div class="head"><div class="kicker">Fil rouge</div><h1>Physique et hasard</h1></div>`
      : `<div class="phead"><div class="kicker">Fil rouge</div><h2>Les analogies, suite</h2></div>`,
    wrap:'<div class="grid physg" data-slot></div>'});
  paginate('physique','b',{title:'L’IA et la physique', items:friseItems('sci',false),
    head:i=> i===0 ? `<div class="phead"><div class="kicker">Fil rouge</div><h2>Quand l’IA rend la pareille à la physique</h2></div><p class="lead" style="margin:0">Le hasard a d’abord été vu comme une ignorance à réduire. Il est devenu l’un des moteurs de l’apprentissage, et il intervient dans chaque réponse d’un LLM.</p>` : `<div class="phead"><div class="kicker">Fil rouge</div><h2>Quand l’IA rend la pareille à la physique (suite)</h2></div>`, wrap:'<div class="frise" data-slot></div>'});
  const pItems = [];
  PLANCHES.filter(p=>p.range).forEach(p=>{
    pItems.push(`<div class="famtitle keepnext" id="pg-${p.n}"><span class="fk">Planche ${p.n} / 5</span>${p.t}<span>${p.s}</span><span>Repère <b class="c-go">${p.rep}</b> · <a data-go="${p.go}">chapitre illustré →</a></span></div>`);
    STEPS.filter(s=>s.n>=p.range[0]&&s.n<=p.range[1]).forEach(s=>pItems.push(stepCard(s)));
  });
  paginate('parcours','g',{title:'Les étapes', items:pItems,
    head:i=>`<div class="phead"><div class="kicker">Parcours en 15 étapes · chaque fiche : pourquoi, ce qui se passe, entrée → sortie, maths, informatique, repère</div><h2>Les étapes, planche par planche${i?' (suite)':''}</h2></div>`,
    wrap:'<div class="lexg" data-slot></div>'});
  Object.entries(DOMPAGES).forEach(([pid,[d,kick,h1,lead]])=>{
    let pre = [];
    if(d==='p') pre = PHYS.map(physCard);
    else pre = STEPS.map(s=>`<div class="card" data-step="${s.n}" style="cursor:pointer"><div class="kicker"${d==='i'?' style="color:var(--gr)"':''}>Étape ${s.n}</div><h3>${s.t}</h3><p class="note" style="margin:0">${d==='m'?s.math:s.info}</p></div>`);
    paginate(pid,'a',{title: d==='p'?'Les analogies':'Étape par étape', items:pre,
      head:i=> i===0 ? `<div class="head"><div class="kicker">${kick}</div><h1>${h1}</h1><p class="lead">${lead}</p></div>`
        : `<div class="phead"><div class="kicker">${kick}</div><h2>${d==='p'?'Les analogies':'Étape par étape'}, suite</h2></div>`,
      wrap:`<div class="grid ${d==='p'?'physg':'g3'}" data-slot></div>`});
    paginate(pid,'b',{title:'Les notions', items:lexItems(LEX.filter(l=>l[2].includes(d))),
      head:()=>`<div class="phead"><div class="kicker">${kick}</div><h2>Les notions</h2></div>`, wrap:'<div class="lexg" data-slot></div>'});
  });
  paginate('reperes','a',{title:'Le tableau', items:STEPS.map(s=>`<tr data-step="${s.n}" style="cursor:pointer"><td class="num">${s.n}</td><td>${s.t}<br><span class="note">${s.io[1]}</span></td><td class="num" style="white-space:normal;color:${s.future?'#d6c8ff':'#ffd2b0'}">${s.rep}</td></tr>`),
    head:i=> i===0 ? `<div class="head"><div class="kicker">Récapitulatif</div><h1>Les repères du parcours</h1><p class="lead">Ce que chaque étape produit, et le nombre qui permet de vérifier qu’elle a réussi.</p></div>` : `<div class="phead"><div class="kicker">Récapitulatif</div><h2>Les repères, suite</h2></div>`,
    wrap:'<div class="card"><table class="t"><thead><tr><th>Étape</th><th>Ce qu’on obtient</th><th>Repère</th></tr></thead><tbody data-slot></tbody></table></div>'});
  paginate('reperes','b',{title:'Points de rigueur', items:STEPS.filter(s=>s.rig).map(s=>`<div class="rig" data-step="${s.n}" style="cursor:pointer;margin:0"><b>Étape ${s.n} · ${s.t}.</b> ${s.rig}</div>`),
    head:()=>`<div class="phead"><div class="kicker">Corrections et précisions apportées au parcours</div><h2>Points de rigueur</h2></div>`, wrap:'<div class="col-stack" data-slot></div>'});
  drawFrise(); drawDico();
}

/* ---------- recherche ---------- */
const IDX = [
  ...STEPS.map(s=>({t:`Étape ${s.n} · ${s.t}`, s:'Fiche du parcours', txt:strip([s.t,s.short,s.why,s.what.join(' '),s.math,s.info,s.rep,s.rig||''].join(' ')), step:s.n})),
  ...LEX.map(l=>({t:l[0], s:FAMS[l[1]]+' · étape '+l[4], txt:l[0]+' '+l[3], go:'dico', q:l[0]})),
  ...FRISE.map(f=>({t:`${f[0]} · ${f[3]}`, s:'Frise · '+THEMES[f[1]][0], txt:f[0]+' '+f[3], go:'frise'})),
  ...Object.entries(TITLES).map(([k,v])=>({t:v, s:'Page', txt:v, go:k}))
];
function openSearch(){ $('#search').classList.add('on'); $('#sq').value=''; $('#sres').innerHTML='<p class="note">Tapez au moins 2 lettres. Exemples : softmax, Boltzmann, 1847, LoRA, cache.</p>'; setTimeout(()=>$('#sq').focus(),30); }
function closeSearch(){ $('#search').classList.remove('on'); }
$('#openSearch').addEventListener('click', openSearch);
$('#search').addEventListener('click', e=>{ if(e.target.id==='search') closeSearch(); });
$('#sq').addEventListener('input', ()=>{
  const q = norm($('#sq').value.trim());
  if(q.length<2){ $('#sres').innerHTML=''; return; }
  const words = q.split(/\s+/);
  const hits = IDX.map(it=>{ const n = norm(it.t+' '+it.txt); if(!words.every(w=>n.includes(w))) return null;
      let sc = norm(it.t).includes(words[0]) ? 10 : 0; if(it.step) sc += 2; return {it,sc}; })
    .filter(Boolean).sort((a,b)=>b.sc-a.sc);
  const maxN = Math.max(3, Math.floor((innerHeight - 200) / 62));
  const hl = s => { let h = esc(s); words.forEach(w=>{ if(w.length<2) return;
      const re = new RegExp('('+[...w].map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+')','ig'); h = h.replace(re,'<mark>$1</mark>'); }); return h; };
  $('#sres').innerHTML = hits.length ? hits.slice(0,maxN).map(({it})=> it.step ? `<a data-step="${it.step}">${hl(it.t)}<small>${it.s}</small></a>`
      : `<a data-sgo="${it.go}" data-q="${esc(it.q||'')}" data-pa="${it.pa||''}">${hl(it.t.length>120?it.t.slice(0,120)+'…':it.t)}<small>${esc(it.s)}</small></a>`).join('')
      + (hits.length>maxN ? `<p class="note">${hits.length-maxN} autres résultats : précisez la recherche.</p>` : '')
    : '<p class="note">Aucun résultat.</p>';
});
$('#sres').addEventListener('click', e=>{
  const a = e.target.closest('[data-sgo]'); if(!a) return;
  closeSearch();
  if(a.dataset.sgo==='dico' && a.dataset.q){ dicoFam='all'; dicoQ=a.dataset.q; drawDico(); }
  if(a.dataset.pa){ const i = plsOf('attention').findIndex(p=>p.dataset.pa===a.dataset.pa); goTarget('attention/'+(i+1)); return; }
  go(a.dataset.sgo);
});
document.addEventListener('keydown', e=>{
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if(e.key==='Escape'){ closeAll(); if(typing) document.activeElement.blur(); return; }
  if(e.key==='/' && !typing){ e.preventDefault(); openSearch(); return; }
  if(typing || $('#search').classList.contains('on')) return;
  if(curStep){ if(e.key==='ArrowRight') ficheNav(1); if(e.key==='ArrowLeft') ficheNav(-1); return; }
  if(e.key==='ArrowRight'){ e.preventDefault(); step(1); }
  if(e.key==='ArrowLeft'){ e.preventDefault(); step(-1); }
});

/* ---------- atelier 1 : BPE ---------- */
function bpe(){
  const text = $('#bpeText').value, N = +$('#bpeN').value; $('#bpeNo').value = N;
  let words = (text.match(/ ?[^\s]+|\s+/g) || []).map(w => [...w]);
  const merges = [];
  for(let k=0;k<N;k++){
    const cnt = new Map();
    words.forEach(w=>{ for(let i=0;i<w.length-1;i++){ const p=w[i]+'\u0000'+w[i+1]; cnt.set(p,(cnt.get(p)||0)+1); } });
    let best=null, bc=1; cnt.forEach((c,p)=>{ if(c>bc){ bc=c; best=p; } });
    if(!best) break;
    const [a,b] = best.split('\u0000'); merges.push([a,b,bc]);
    words = words.map(w=>{ const o=[]; for(let i=0;i<w.length;i++){ if(i<w.length-1 && w[i]===a && w[i+1]===b){ o.push(a+b); i++; } else o.push(w[i]); } return o; });
  }
  const toks = words.flat();
  const hue = s => { let h=0; for(const c of s) h=(h*31+c.codePointAt(0))%360; return h; };
  $('#bpeToks').innerHTML = toks.slice(0,90).map(t=>`<span style="background:hsla(${hue(t)},70%,55%,.22);border:1px solid hsla(${hue(t)},70%,60%,.45)">${esc(t.replace(/ /g,'␣'))}</span>`).join('') + (toks.length>90?'<span>…</span>':'');
  const chars = [...text].length;
  $('#bpeInfo').innerHTML = `${chars} caractères → <b style="color:#fff">${toks.length} tokens</b> (${fr(chars/Math.max(1,toks.length),2)} caractères par token) · ${merges.length} fusion${merges.length>1?'s':''} apprise${merges.length>1?'s':''}`;
  $('#bpeMerges').innerHTML = merges.length ? 'Fusions : ' + merges.slice(0,16).map((m,i)=>`<span class="mono">${i+1}. ${esc((m[0]+'+'+m[1]).replace(/ /g,'␣'))} ×${m[2]}</span>`).join(' · ') + (merges.length>16?' …':'') : 'Aucune fusion : chaque caractère est un token.';
  if(curPage==='ateliers') fitPl(plsOf('ateliers')[curIdx]);
}
$('#bpeText').setAttribute('maxlength','240');
['input','change'].forEach(ev=>{ $('#bpeText').addEventListener(ev,bpe); $('#bpeN').addEventListener(ev,bpe); });
bpe();

/* ---------- atelier 2 : compteur ---------- */
function params(){
  const d=+$('#pd').value, L=+$('#pL').value, V=+$('#pV').value;
  $('#pdo').value=d; $('#pLo').value=L; $('#pVo').value=V;
  const dff = 8*Math.ceil(8*d/3/8), blk = 4*d*d + 3*d*dff + 2*d, N = L*blk + V*d + d;
  $('#pOut').textContent = fr(N) + ' réglages';
  $('#pDetail').textContent = `${L} × (4·${d}² + 3·${d}·${dff} + 2·${d}) + ${V}·${d} + ${d}`;
  const mb = N*4/1e6, tok = 20*N;
  $('#pMore').innerHTML = `d_ff = ${dff} · fichier ≈ ${fr(mb, mb<10?1:0)} Mo en 32 bits · Chinchilla : ≈ ${tok>=1e9?fr(tok/1e9,1)+' Md':fr(tok/1e6,1)+' M'} de tokens d’entraînement` +
    (N===1315968?' · <b class="c-gr">c’est exactement le micro-GPT</b>':'');
}
['pd','pL','pV'].forEach(id=>$('#'+id).addEventListener('input',params)); params();

/* ---------- atelier 3 : température ---------- */
const TT = [[':',12.39],[',',7.95],['.',6.2],['␣of',5.6],['!',5.0],['↵',4.5]];
function temp(){
  const T=+$('#tT').value, P=+$('#tP').value; $('#tTo').value=fr(T,2); $('#tPo').value=fr(P,2);
  const m = Math.max(...TT.map(t=>t[1]/T)), ex = TT.map(t=>Math.exp(t[1]/T-m)), Z = ex.reduce((a,b)=>a+b,0);
  const pr = ex.map(e=>e/Z); let cum=0;
  const keep = pr.map(p=>{ const out = cum > P; cum += p; return !out; });
  $('#tBars').innerHTML = TT.map((t,i)=>`<div class="row${keep[i]?'':' out'}"><span>« ${esc(t[0])} »</span><div class="bar"><i style="width:${Math.max(pr[i]*100,.4)}%"></i></div><span>${fr(pr[i]*100, pr[i]<.01?2:1)} %</span></div>`).join('');
}
['tT','tP'].forEach(id=>$('#'+id).addEventListener('input',temp)); temp();

/* ---------- atelier 4 : LoRA ---------- */
function lora(){
  const d=+$('#ld').value, r=+$('#lr').value; $('#ldo').value=d; $('#lro').value=r;
  const small=2*d*r, full=d*d, pct=small/full*100;
  $('#lOut').textContent = fr(pct, pct<10?2:1) + ' % des réglages';
  $('#lDetail').textContent = `2 × ${d} × ${r} = ${fr(small)} au lieu de ${d}² = ${fr(full)}`;
  $('#lBar').setAttribute('width', Math.max(3, Math.min(400, pct*4)));
}
['ld','lr'].forEach(id=>$('#'+id).addEventListener('input',lora)); lora();

/* ---------- ciel animé ---------- */
(function(){
  const cv = $('#sky'), cx = cv.getContext('2d'); let W,H,stars=[],t=0;
  function size(){ W=cv.width=innerWidth*devicePixelRatio; H=cv.height=innerHeight*devicePixelRatio;
    stars = Array.from({length:Math.round(W*H/9000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4*devicePixelRatio,a:Math.random(),s:Math.random()*.02+.004})); }
  size(); addEventListener('resize', size);
  function frame(){
    if(document.hidden){ requestAnimationFrame(frame); return; }
    t += .004; cx.clearRect(0,0,W,H);
    for(const s of stars){ s.a += s.s; const o = .25+.45*Math.abs(Math.sin(s.a)); cx.fillStyle=`rgba(200,225,255,${o})`; cx.beginPath(); cx.arc(s.x,s.y,s.r,0,6.283); cx.fill(); }
    for(let k=0;k<7;k++){
      cx.beginPath(); const base = H*(.55+k*.035), amp = H*(.05+k*.01);
      for(let x=0;x<=W;x+=W/120){ const y = base + Math.sin(x/W*6.283*1.3 + t*(1+k*.15) + k)*amp + Math.sin(x/W*12 - t*2)*amp*.2; x?cx.lineTo(x,y):cx.moveTo(x,y); }
      cx.strokeStyle = k<4 ? `rgba(61,216,255,${.09-k*.012})` : `rgba(255,79,109,${.05+(k-4)*.015})`; cx.lineWidth = devicePixelRatio; cx.stroke();
    }
    requestAnimationFrame(frame);
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) frame();
})();
