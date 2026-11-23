/* ===================== PROGRÈS ET QUIZ PAR CHAPITRE =====================
   Gardé sur l'appareil (localStorage) :
   - famzak:iasite:etapes-vues  : numéros des fiches d'étapes ouvertes (1 à 15) ;
   - famzak:quiz:iasite:<page>  : meilleur score de chaque quiz de chapitre (moteur quiz-famzak.js) ;
   - famzak:quiz:iasite:attention : meilleur score du quiz du parcours de l'attention. */
const CLE_VUES = 'famzak:iasite:etapes-vues';
function etapesVues(){ try { return JSON.parse(localStorage.getItem(CLE_VUES)) || []; } catch(e){ return []; } }
function marquerEtapeVue(n){
  const v = etapesVues(); if(v.includes(n)) return;
  v.push(n); v.sort((a,b) => a-b);
  try { localStorage.setItem(CLE_VUES, JSON.stringify(v)); } catch(e){}
  rafraichirProgres();
}
function noterQuizAttention(score, total){
  const cle = 'famzak:quiz:iasite:attention';
  let m = null; try { m = JSON.parse(localStorage.getItem(cle)); } catch(e){}
  if(!m || m.total !== total || score > m.score){
    m = {score, total, date: new Date().toISOString().slice(0,10)};
    try { localStorage.setItem(cle, JSON.stringify(m)); } catch(e){}
  }
  rafraichirProgres();
  return ' · meilleur score sur cet appareil : ' + m.score + ' / ' + m.total;
}

/* Trois questions par chapitre illustré */
const QUIZ_CHAP = {
 fondations: ['Fondations', [
  {q:'Que veut dire le « P » de GPT ?', o:['Programmé','Pré-entraîné (Pre-trained)','Probabiliste'], a:1, e:'Il a d’abord été entraîné sur d’immenses volumes de texte brut, sans étiquetage manuel.'},
  {q:'Quelle idée de 2017 est au cœur du Transformer ?', o:['La lecture mot après mot','L’attention : chaque token va chercher directement ceux qui comptent pour lui','Un dictionnaire écrit à la main'], a:1, e:'Tous les tokens sont traités en même temps, ce qui permet de répartir le calcul sur des cartes graphiques.'},
  {q:'Quelle moitié du Transformer d’origine GPT garde-t-il ?', o:['L’encodeur','Le décodeur, avec un masque qui l’empêche de lire la suite','Les deux'], a:1, e:'Le Transformer de traduction avait deux moitiés ; GPT ne garde que le décodeur.'}]],
 donnees: ['Données & tokens', [
  {q:'Pourquoi découpe-t-on le texte en tokens numérotés ?', o:['Pour le compresser en ZIP','Parce qu’un réseau ne manipule que des nombres','Pour corriger l’orthographe'], a:1, e:'Il faut d’abord transformer le texte en morceaux numérotés, puis en fabriquer des exercices.'},
  {q:'Dans un extrait d’entraînement, quelle est la cible sous chaque token ?', o:['Le token qui le suit','Le token qui le précède','Le même token'], a:0, e:'La cible est l’entrée décalée d’un token : c’est l’exercice « devine la suite ».'},
  {q:'Quelle part du texte sert à l’examen (validation) ?', o:['50 %','10 %','1 %'], a:1, e:'90 % pour apprendre (313 398 tokens), 10 % pour vérifier (34 822 tokens).'}]],
 reseau: ['Le réseau', [
  {q:'Combien de réglages compte le micro-GPT ?', o:['Environ 1,3 million','Environ 175 milliards','Environ 13 000'], a:0, e:'1 315 968 réglages ; GPT-3 en avait 175 milliards.'},
  {q:'Quelle pièce contient le plus de réglages ?', o:['Les normalisations','Le bloc de calcul (≈ 40 %)','Les raccourcis'], a:1, e:'Bloc de calcul 40,2 %, table des tokens 39,8 %, attention 19,9 %, normalisations 0,09 %.'},
  {q:'Que fait un raccourci (connexion résiduelle) ?', o:['Il efface le flux','Il ajoute une correction : h ← h + f(h)','Il double la taille du vecteur'], a:1, e:'Chaque pièce ajoute une correction au lieu de tout réécrire ; il y en a 2 par étage, 8 en tout.'}]],
 apprentissage: ['Apprentissage', [
  {q:'Pourquoi vérifie-t-on tout « à vide » avant d’entraîner ?', o:['Un bug ne fait pas planter le programme : le modèle apprend simplement mal','Pour gagner de la place sur le disque','Ce n’est pas utile'], a:0, e:'D’où les 7 voyants verts, vérifiés en 16 secondes.'},
  {q:'Que fait le « W » d’AdamW ?', o:['Il accélère la carte graphique','Il fait rétrécir un peu chaque poids à chaque pas, comme un ressort','Il mélange les données'], a:1, e:'C’est le rappel vers zéro, l’idée de Tikhonov appliquée à part.'},
  {q:'Quand les courbes d’entraînement et d’examen s’écartent, que se passe-t-il ?', o:['Le modèle commence à apprendre par cœur','Le modèle a fini','La carte graphique chauffe'], a:0, e:'Presque tout se joue dans les 200 premiers pas ; ensuite, c’est le début du par-cœur.'}]],
 generation: ['Génération', [
  {q:'Que sait faire le modèle, au fond ?', o:['Chercher une phrase dans une base','Donner les probabilités du token suivant','Comprendre le sens'], a:1, e:'On tire un token, on l’ajoute au texte, et on recommence.'},
  {q:'Que fait une température de 0,8 ?', o:['Elle rend les choix plus prudents (les scores sont divisés par 0,8)','Elle rend les choix totalement au hasard','Elle n’a aucun effet'], a:0, e:'Diviser par moins de 1 accentue les écarts : le token le plus probable l’est encore plus.'},
  {q:'Combien de bits par caractère faut-il avec le micro-GPT ?', o:['8','Environ 2','Environ 0,1'], a:1, e:'Prédire, c’est compresser : environ 2 bits par caractère au lieu de 8.'}]],
 assistant: ['Assistant', [
  {q:'Pourquoi un modèle de base n’est-il pas un assistant ?', o:['Il continue un texte au lieu de répondre','Il est trop petit','Il ne connaît pas l’anglais'], a:0, e:'L’affinage (SFT) lui apprend à répondre et à appeler des outils.'},
  {q:'Quel est l’intérêt de LoRA ?', o:['Corriger avec très peu de réglages (≈ 1 % ici)','Supprimer l’attention','Entraîner sans données'], a:0, e:'Pour d = 3 072 et r = 16 : 98 304 nombres au lieu de 9 437 184.'},
  {q:'Sur quoi repose DPO ?', o:['Deux réponses, dont l’une est préférée','Un dictionnaire de synonymes','Le hasard pur'], a:0, e:'On augmente la probabilité relative de la meilleure : P(A ≻ B) = σ(score(A) − score(B)).'}]],
 agents: ['Agents & MCP', [
  {q:'Qui exécute vraiment un appel d’outil ?', o:['Le modèle lui-même','L’application hôte','Le clavier'], a:1, e:'Le modèle ne fait que produire du texte ; l’hôte valide et exécute.'},
  {q:'À quoi ressemble le MCP ?', o:['À une prise standard : un outil écrit une fois marche partout','À un nouveau langage de programmation','À un modèle plus grand'], a:0, e:'Le MCP standardise le branchement entre applications et outils.'},
  {q:'Comment traiter un résultat d’outil qui contient des instructions ?', o:['Les suivre','Le traiter comme une donnée, jamais comme un ordre','L’effacer sans le lire'], a:1, e:'C’est la défense contre l’injection de prompt.'}]],
 physique: ['Physique & hasard', [
  {q:'De quelle loi de la physique la softmax a-t-elle la forme ?', o:['Loi de Boltzmann','Loi d’Ohm','Loi de Newton'], a:0, e:'p = e^(−E/kT) / Z : d’où le nom de « température ».'},
  {q:'À quoi ressemble la décroissance en cosinus du taux d’apprentissage ?', o:['Au recuit : refroidir lentement un métal','À une explosion','À la gravité'], a:0, e:'Baisser doucement laisse le système se poser au fond d’une vallée.'},
  {q:'Un raccourci h ← h + f(h), c’est…', o:['Un pas d’Euler','Une division par zéro','Un tirage au sort'], a:0, e:'Le réseau intègre une équation différentielle, étage par étage.'}]],
 echelles: ['Échelles', [
  {q:'Combien de paramètres faut-il pour apprendre le XOR ?', o:['Environ 10','Environ 1 million','Environ 1 milliard'], a:0, e:'Un MLP 2-2-1 a 9 paramètres.'},
  {q:'Selon Chinchilla, combien de tokens par paramètre à budget fixé ?', o:['≈ 2','≈ 20','≈ 2 000'], a:1, e:'Environ 20 tokens par paramètre.'},
  {q:'Quel est le coût de calcul d’un entraînement ?', o:['C ≈ 6 · N · D','C ≈ N + D','C ≈ N²'], a:0, e:'Environ 6 opérations par paramètre et par token.'}]]
};

(function installerProgres(){
  const st = document.createElement('style');
  st.textContent = `
  .step.vue{position:relative}
  .step.vue::after{content:"✓ vue";position:absolute;top:8px;right:10px;font-size:.72rem;font-weight:700;color:#5fc98a}
  g[data-step].vue circle{stroke:#5fc98a;stroke-width:4}
  .progres{border:1px solid rgba(127,230,255,.25);border-radius:14px;padding:14px 16px;margin:0 0 18px;background:rgba(61,216,255,.05)}
  .progres h3{margin:0 0 8px;font-size:1.05rem}
  .progres .pb{height:8px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 10px}
  .progres .pb i{display:block;height:100%;background:#5fc98a;transition:width .3s}
  .progres .chips{display:flex;flex-wrap:wrap;gap:6px}
  .progres .chip{font-size:.78rem;padding:3px 9px;border-radius:99px;border:1px dashed rgba(255,255,255,.25);opacity:.75;cursor:pointer}
  .progres .chip.ok{border:1px solid #5fc98a;opacity:1}
  .chap-quiz{margin-top:26px}`;
  document.head.appendChild(st);

  Object.keys(QUIZ_CHAP).forEach(id => {
    const sec = document.getElementById('p-' + id); if(!sec) return;
    const tit = document.createElement('div'); tit.className = 'sectitle';
    tit.innerHTML = '<h2>Quiz du chapitre</h2>';
    const box = document.createElement('div'); box.className = 'chap-quiz';
    sec.appendChild(tit); sec.appendChild(box);
    FamZakQuiz.monter(box, {cle: 'iasite:' + id, titre: '3 questions pour vérifier', questions: QUIZ_CHAP[id][1], surFin: rafraichirProgres});
  });

  const pan = document.createElement('div'); pan.className = 'progres'; pan.id = 'progres';
  const parc = document.querySelector('#p-parcours > .head');
  if(parc) parc.after(pan);
  pan.addEventListener('click', e => { const c = e.target.closest('[data-go]'); if(c){ e.stopPropagation(); go(c.dataset.go); } });
  rafraichirProgres();
})();

function rafraichirProgres(){
  const v = etapesVues();
  $$('[data-step]').forEach(el => el.classList.toggle('vue', v.includes(+el.dataset.step)));
  const pan = document.getElementById('progres'); if(!pan) return;
  const ids = Object.keys(QUIZ_CHAP);
  const res = ids.map(id => [id, FamZakQuiz.meilleur('iasite:' + id)]);
  const reussis = res.filter(([, m]) => m && m.score === m.total).length;
  const att = (() => { try { return JSON.parse(localStorage.getItem('famzak:quiz:iasite:attention')); } catch(e){ return null; } })();
  pan.innerHTML = `<h3>Ma progression</h3>
    <div>${v.length} / 15 fiches d’étapes ouvertes${v.length === 15 ? ' · parcours complet 🏆' : ''}</div>
    <div class="pb"><i style="width:${v.length / 15 * 100}%"></i></div>
    <div style="margin-bottom:6px">${reussis} / ${ids.length} quiz de chapitre réussis sans faute${att ? ` · quiz de l’attention : ${att.score} / ${att.total}` : ''}</div>
    <div class="chips">${res.map(([id, m]) => `<span class="chip${m && m.score === m.total ? ' ok' : ''}" data-go="${id}" title="${m ? 'Meilleur score : ' + m.score + ' / ' + m.total : 'Pas encore fait'}">${m && m.score === m.total ? '✓ ' : ''}${esc(QUIZ_CHAP[id][0])}${m && m.score !== m.total ? ' · ' + m.score + '/' + m.total : ''}</span>`).join('')}</div>
    <p class="note" style="margin:8px 0 0">Gardé sur cet appareil. Le quiz de chaque chapitre est en bas de sa page.</p>`;
}
