/* ===================== DONNÉES : PLANCHES ET 15 ÉTAPES ===================== */
const PLANCHES = [
  {n:0, t:"GPT et le Transformer", s:"Le nom, le produit, l’architecture", rep:"nom, produit, architecture", go:"fondations", range:null},
  {n:1, t:"Préparer le texte", s:"Du fichier brut aux exercices « devine la suite »", rep:"348 220 tokens", go:"donnees", range:[1,3]},
  {n:2, t:"Concevoir le modèle", s:"Les cotes, l’inventaire des pièces, l’assemblage", rep:"1 315 968 réglages", go:"reseau", range:[4,6]},
  {n:3, t:"Démarrer, vérifier, accélérer", s:"Un point de départ, la preuve que tout marche, la vitesse", rep:"7 voyants verts en 16 s", go:"apprentissage", range:[7,9]},
  {n:4, t:"Apprendre, surveiller, écrire", s:"La boucle, le meilleur modèle, la génération", rep:"perte d’examen 4,39", go:"apprentissage", range:[10,12]},
  {n:5, t:"Du modèle à l’agent", s:"Ce qu’il a appris, puis l’assistant qui agit", rep:"≈ 2 bits par caractère", go:"agents", range:[13,15]}
];

const STEPS = [
{n:1, t:"Réunir les prérequis", short:"Un texte à imiter, un moteur de calcul et un plan.",
 why:"Pour fabriquer un modèle de langage, il faut trois choses : un texte à imiter, un moteur de calcul et un plan.",
 what:["<b>Python 3</b> : le langage dans lequel tout est écrit.",
   "<b>PyTorch</b> : la boîte à outils de calcul. Elle manipule des tenseurs (tableaux de nombres), calcule seule les dérivées de n’importe quel calcul et fournit l’optimiseur AdamW. Version « processeur seul ».",
   "<b>input.txt</b> (TinyShakespeare) : ~40 000 lignes de pièces de Shakespeare. C’est le seul monde que le modèle connaîtra.",
   "<b>micro_gpt.py</b> : un seul fichier qui contient le plan, le chantier et le contrôle qualité.",
   "<b>La graine 1337</b> : le « hasard » de l’ordinateur est une suite calculée. Même graine, mêmes tirages, mêmes résultats."],
 io:["Rien","un environnement prêt et un corpus de 1 115 394 caractères"],
 math:"Chaque nombre est rangé sur 32 bits (norme IEEE 754), soit ~7 chiffres significatifs. Les tenseurs relèvent de l’algèbre multilinéaire (algèbre linéaire en MPSI/MP, tenseurs en école).",
 info:"Chaque calcul est noté dans un graphe orienté sans cycle (DAG, graphes en MPI), que PyTorch parcourra à l’envers pour obtenir les dérivées. Les tirages viennent d’un générateur pseudo-aléatoire.",
 rep:"1 115 394 caractères", obs:true},
{n:2, t:"Fabriquer le vocabulaire : la tokenisation", short:"Découper le texte en 4 096 morceaux numérotés par fusions successives (BPE).",
 why:"Un réseau ne manipule que des nombres. En lettres, les textes seraient très longs, or le coût de l’attention croît comme le carré de la longueur. En mots, le vocabulaire serait immense et jamais complet. Le BPE, qui fusionne les paires fréquentes, est le compromis. (Ici, un « token » est un morceau de texte, pas un jeton d’accès.)",
 what:["On part des 256 valeurs possibles d’un octet : tout texte, accents et emojis compris, s’écrit déjà avec elles.",
   "On coupe le texte en mots, nombres, ponctuation et espaces, pour ne jamais fusionner à cheval sur deux mots.",
   "On repère la paire de symboles voisins la plus fréquente, on la remplace par un nouveau symbole, et on recommence.",
   "Après 3 840 fusions : 256 + 3 840 = 4 096 tokens. Les premières fusions donnent des bouts de mots, les dernières des mots entiers (« kindness »)."],
 io:["Texte brut","3 840 règles de fusion, dans l’ordre où elles ont été apprises"],
 math:"C’est de la compression : une paire fréquente devient un seul symbole, comme le Morse ou le code de Huffman donnent les codes les plus courts aux symboles fréquents (théorie de l’information de Shannon). Ça marche parce que la fréquence des mots suit la loi de Zipf. L’algorithme est glouton.",
 info:"Une expression régulière découpe le texte ; le théorème de Kleene garantit qu’elle est reconnue par un automate fini, qui lit le texte une seule fois (MPI). Des tables de hachage comptent les paires, et un index inverse « paire → mots qui la contiennent » évite de relire tout le texte à chaque fusion.",
 rep:"3 840 fusions en 5,3 s", obs:true,
 rig:"Si le vocabulaire est appris sur tout le texte, la partie « examen » de l’étape 3 y a contribué : petite fuite d’information. Pour un examen parfaitement neuf, on l’apprend sur les 90 % d’entraînement seulement."},
{n:3, t:"Transformer le texte en exercices", short:"348 220 tokens, 10 % mis de côté pour l’examen, des milliers d’exercices « début → suite ».",
 why:"Le modèle apprend une seule tâche : deviner le token suivant. On lui fabrique donc des milliers d’exercices « début → suite ».",
 what:["Tout le texte devient une longue suite de numéros : 348 220 tokens.",
   "On met de côté 10 % de cette suite. Le modèle ne la verra jamais pendant l’apprentissage : c’est l’examen qui vérifie qu’il généralise au lieu de réciter.",
   "À chaque pas, on tire au hasard 16 extraits de 256 tokens. La réponse attendue est le même extrait décalé d’un cran : un extrait fournit 256 exercices d’un coup."],
 io:["Texte","313 398 tokens d’entraînement et 34 822 d’examen"],
 math:"La probabilité d’un texte s’écrit comme un produit : p(x₁…x_T) = p(x₁) × p(x₂ | x₁) × … × p(x_T | x₁…x_{T−1}). Le modèle estime chaque facteur. Ne voyant que 256 tokens, c’est une chaîne de Markov d’ordre au plus 256. Tirer les extraits au hasard donne une estimation juste en moyenne (Monte-Carlo, estimateur sans biais).",
 info:"L’encodage met en cache chaque morceau déjà traité : c’est de la mémoïsation (informatique commune de 2ᵉ année). La séparation entraînement/validation estime l’erreur de généralisation.",
 rep:"3,20 caractères par token", obs:true},
{n:4, t:"Dessiner le plan (la configuration)", short:"d = 128, L = 4, 4 têtes, contexte 256, V = 4 096 : tenir sur un processeur en moins d’une heure.",
 why:"Avant de construire, on fixe les dimensions. Elles décident à la fois de ce que le modèle peut apprendre et du temps de calcul.",
 what:["<b>d = 128</b> : chaque token devient un vecteur de 128 nombres.",
   "<b>L = 4</b> : 4 étages identiques empilés, avec <b>4 têtes</b> d’attention de 32 nombres chacune.",
   "<b>d_ff = 344</b> : largeur du bloc de calcul, 8/3 × 128 ≈ 341,3 arrondi au multiple de 8 supérieur.",
   "<b>Contexte 256</b>, <b>V = 4 096</b>, et <b>16 × 2 000</b> : 16 extraits par pas, 2 000 pas prévus."],
 io:["Contraintes de budget","un objet Config, la fiche des cotes"],
 math:"d est la dimension d’un espace vectoriel : chaque token devient un point de ℝ¹²⁸. Pourquoi 8/3 ? Le bloc SwiGLU a 3 matrices ; avec une largeur 8/3·d, il coûte autant qu’un bloc classique à 2 matrices de largeur 4d, car 3 × 8/3 = 2 × 4.",
 info:"Estimation de complexité a priori, en temps et en mémoire (MPI). Lois d’échelle (Chinchilla) : ~20 tokens par réglage, soit 26 millions ici ; on n’en a que 313 398 différents, revus ~26 fois en 2 000 pas.",
 rep:"d = 128, L = 4, 4 têtes, V = 4 096, contexte 256", obs:false},
{n:5, t:"Faire l’inventaire des pièces", short:"Comparer ce que le code a construit avec ce que le plan prévoit : 1 315 968.",
 why:"Comme compter les pièces d’un meuble avant de le monter. On compare ce que le code a réellement construit (num_params() compte chaque nombre réglable) avec ce que le plan prévoit (une formule à la main). S’ils diffèrent, le code ne construit pas ce qu’on croit avoir dessiné.",
 what:["<b>4d²</b> : les 4 matrices carrées de l’attention (question, étiquette, contenu, sortie) : 65 536.",
   "<b>3·d·d_ff</b> : les 3 matrices du bloc de calcul : 132 096.",
   "<b>2d</b> : les gains des 2 normalisations de l’étage : 256. Le tout × 4 étages = 791 552.",
   "<b>V·d</b> : la table des 4 096 vecteurs, qui sert à l’entrée et à la sortie, comptée une fois : 524 288.",
   "<b>+ d</b> : la normalisation finale : 128. Total : <b>1 315 968</b>."],
 io:["Le plan","un nombre vérifié : 1 315 968 paramètres"],
 math:"Une matrice d × d contient d² coefficients (dimension de l’espace des matrices, MPSI). Réutiliser la table à la sortie revient à se servir de sa transposée. La position par rotation n’ajoute aucun réglage : ses angles sont fixés.",
 info:"C’est un test unitaire : une assertion qui compare un invariant attendu à la réalité (génie logiciel).",
 rep:"1 315 968 paramètres, fichier de 5,3 Mo (4 octets chacun)", obs:true},
{n:6, t:"Assembler le réseau, pièce par pièce", short:"Plongement, normalisation, attention, rotation, bloc de calcul, raccourcis, sortie.",
 why:"Chaque pièce a un rôle précis dans la transformation « suite de tokens → probabilités du token suivant ».",
 what:["<b>① Le plongement.</b> Chaque numéro de token devient un vecteur de 128 nombres, lu dans la table (produit par un vecteur de la base canonique).",
   "<b>② La normalisation (RMSNorm).</b> On divise chaque vecteur par sa taille moyenne, puis on applique des gains appris : il est ramené sur une sphère de rayon √128.",
   "<b>③ L’attention.</b> Chaque token pose une question (Q) ; lui-même et les précédents présentent une étiquette (K) et un contenu (V). Le produit scalaire Q·K mesure la pertinence, la softmax en fait des probabilités, et le token repart avec la moyenne pondérée des contenus. Un masque interdit de regarder le futur. 4 têtes travaillent en parallèle.",
   "<b>④ La position par rotation (RoPE).</b> On fait tourner Q et K d’un angle proportionnel à leur position : le produit scalaire ne dépend plus que de l’écart. 16 vitesses de rotation, en progression géométrique.",
   "<b>⑤ Le bloc de calcul (SwiGLU).</b> Chaque token est transformé seul, à travers SiLU(x) = x·σ(x) et une « vanne » multipliée coordonnée par coordonnée.",
   "<b>⑥ Les raccourcis.</b> Chaque pièce ajoute une correction au lieu de tout réécrire : h ← h + f(h). 8 corrections en tout.",
   "<b>⑦ La sortie.</b> Dernière normalisation, comparaison avec les 4 096 vecteurs de la table, puis softmax."],
 io:["256 numéros de tokens","256 lois de probabilité, une par position, sur les 4 096 tokens"],
 math:"Softmax : pᵢ = e^sᵢ / Σ e^sⱼ, le facteur de Boltzmann. On divise par √32 car le score de 32 coordonnées indépendantes de variance 1 a une variance de 32. Cauchy-Schwarz : |q·k| ≤ ‖q‖·‖k‖, maximal quand ils sont alignés. RoPE : z ↦ z·e^(imθ), morphisme de (ℤ,+) dans SO(2). Sans non-linéarité, des fonctions linéaires composées restent linéaires ; avec elle, approximation universelle (analogie avec Weierstrass). h ← h + f(h) est un pas d’Euler pour dh/dt = f(h).",
 info:"Le masque triangulaire fait du réseau un système causal, comme un filtre en traitement du signal. La vanne est un produit de Hadamard (terme à terme).",
 rep:"7 pièces, 4 étages, 8 corrections ajoutées au flux principal", obs:false},
{n:7, t:"Donner un point de départ aléatoire", short:"Le hasard brise la symétrie : loi normale d’écart-type 0,02, et ÷ √8 pour les ajouts.",
 why:"Si tous les réglages valaient zéro, tous les neurones calculeraient la même chose et recevraient les mêmes corrections : ils resteraient jumeaux pour toujours. Le hasard brise cette symétrie.",
 what:["Les matrices et la table sont tirées selon une loi normale centrée, d’écart-type 0,02 : des valeurs petites et variées.",
   "Les 8 matrices qui ajoutent leur résultat au flux principal sont tirées plus petites : 0,02 ÷ √8 ≈ 0,007.",
   "Les gains des normalisations partent de 1 : au départ, elles ne font que normaliser."],
 io:["Le réseau vide","des réglages aléatoires mais bien calibrés"],
 math:"Pour des tirages indépendants, les variances s’additionnent : 8 corrections de variance σ² donnent 8σ². En divisant chacune par √8, la somme garde la variance d’une seule. Le physicien y verrait un système désordonné à haute température, comme un verre de spin.",
 info:"Grâce à la graine 1337, ce même départ se reproduit à chaque essai.",
 rep:"Écart-type 0,02, et 0,02 ÷ √8 ≈ 0,007 pour les 8 ajouts", obs:false},
{n:8, t:"Contrôler avant de lancer : les 7 vérifications", short:"Sept essais à vide qui prouvent que chaque pièce fait ce qu’elle doit.",
 why:"Un bug dans un réseau ne fait pas planter le programme : le modèle apprend simplement mal. Comme on fait tourner une machine à vide avant de la charger, on vérifie chaque pièce en quelques secondes.",
 what:["<b>Aller-retour du vocabulaire</b> : encoder puis décoder un texte français avec accents et emoji redonne exactement le texte.",
   "<b>Inventaire</b> : 1 315 968 réglages, comme la formule de l’étape 5.",
   "<b>Perte de départ</b> : un modèle qui ne sait rien donne 1/4 096 à chaque token ; perte ln 4 096 ≈ 8,32, soit 12 bits.",
   "<b>Rotation</b> : le score entre les positions 10 et 3 égale celui entre 50 et 43.",
   "<b>Causalité</b> : modifier la fin d’un texte ne change rien aux prédictions du début.",
   "<b>Deux calculs, un résultat</b> : avec ou sans cache, attention écrite à la main ou optimisée, même résultat à 4·10⁻⁷ près.",
   "<b>Capacité à mémoriser</b> : sur un seul lot répété 150 fois, la perte tombe de 8,34 à 0,002."],
 io:["Le code","7 voyants verts en 16 secondes"],
 math:"Injectivité de l’encodage (1), égalité de comptage (2), entropie de la loi uniforme (3), morphisme de groupes R(m)ᵀ·R(n) = R(n − m) (4), système causal (5), précision machine 2⁻²³ ≈ 1,2·10⁻⁷ (6).",
 info:"Ce sont des tests unitaires. Le test de mémorisation détecte un bug dans les dérivées, l’optimiseur ou le décalage des cibles.",
 rep:"7 voyants verts en 16 s ; mémorisation : 8,34 → 0,002", obs:true},
{n:9, t:"Mesurer, puis accélérer", short:"Chronométrer chaque partie : attention fusionnée et lots de 16. De ≈ 3 s à ≈ 1 s par pas.",
 why:"Le premier essai prenait environ 3 secondes par pas. Avant d’optimiser, on chronomètre chaque partie séparément, pour savoir où part le temps.",
 what:["<b>L’attention</b> écrite à la main stocke le tableau des scores (256 × 256 par tête) : 0,33 s par étage. La version fusionnée de PyTorch fait exactement le même calcul en 0,07 s (vérification 6).",
   "<b>La taille des lots</b> : un pas de 32 extraits prenait 2,6 s, un pas de 16 extraits 0,9 s. On passe à 16."],
 io:["≈ 3 s par pas","≈ 1 s par pas : les 2 000 pas en 30 à 35 minutes"],
 math:"Pour ne jamais stocker le tableau des scores, la softmax se calcule morceau par morceau en suivant le plus grand score et la somme des exponentielles : l’astuce log-sum-exp (analyse numérique).",
 info:"C’est le principe de FlashAttention : des tuiles qui tiennent dans la mémoire rapide. Le calcul reste en T², mais les allers-retours vers la mémoire lente fondent. La taille des lots joue sur la même hiérarchie : registres, caches, mémoire vive.",
 rep:"≈ 3 s → ≈ 1 s par pas", obs:true,
 rig:"Passer de 32 à 16 extraits divise aussi par deux le texte traité à chaque pas. Le vrai gain se mesure par extrait : 2,6 ÷ 32 ≈ 0,081 s contre 0,9 ÷ 16 ≈ 0,056 s, soit ~1,4 fois plus vite, et non 2,9. Et 3 s × 2 000 pas = 6 000 s : le premier essai aurait duré 1 h 40, pas « plus de 2 heures »."},
{n:10, t:"Entraîner : la boucle d’apprentissage", short:"Cinq gestes, 2 000 fois : tirer, prédire, rétropropager, plafonner, corriger.",
 why:"C’est ici que le modèle apprend. On ajuste les 1,3 million de réglages pour que ses prédictions collent au texte.",
 what:["<b>Tirer un lot</b> au hasard : 16 extraits de 256 tokens.",
   "<b>Prédire et mesurer l’erreur</b> : l’entropie croisée, moyenne de −ln(probabilité donnée au bon token) sur les 4 096 positions du lot.",
   "<b>Remonter les responsabilités</b> : la rétropropagation calcule, pour chaque réglage, dans quel sens le bouger.",
   "<b>Plafonner le pas</b> : si la longueur du gradient dépasse 1, on la ramène à 1 sans changer sa direction.",
   "<b>Corriger avec AdamW</b> : inertie, pas sur mesure, rappel vers zéro découplé. Taux d’apprentissage : montée sur 100 pas, puis descente en cosinus jusqu’au pas 2 000."],
 io:["Réglages aléatoires","réglages ajustés au texte"],
 math:"La rétropropagation, c’est (g∘f)′ = (g′∘f)·f′ appliquée en parcourant le graphe à l’envers (ordre topologique inverse) ; elle coûte ~2 fois la prédiction. Minimiser l’entropie croisée = maximiser la vraisemblance. L’écrêtage est une projection sur la boule de rayon 1. Le refroidissement lent reprend le recuit des métallurgistes.",
 info:"Différentiation automatique en mode inverse. AdamW en deux groupes : matrices avec décroissance des poids, gains des RMSNorm sans.",
 rep:"Perte d’examen : 8,24 au pas 0, 4,39 au pas 800", obs:true,
 rig:"Le calcul de test s’est arrêté au pas 800 (limite de l’environnement), quand la taille des pas valait encore ~70 % de son maximum : 4,39 est un résultat intermédiaire. Et 8,24 au pas 0 est sous ln 4 096 ≈ 8,32 : sans doute mesuré après la première correction. À vérifier."},
{n:11, t:"Surveiller et sauvegarder", short:"Tous les 200 pas, mesurer l’examen et ne garder que le meilleur modèle.",
 why:"Un modèle peut se mettre à réciter son corpus au lieu d’en saisir les régularités. On le surveille donc sur l’examen, les 10 % de texte qu’il ne voit jamais.",
 what:["Tous les 200 pas, on mesure l’erreur sur l’entraînement et sur l’examen.",
   "On ne sauvegarde que le meilleur modèle vu jusque-là, d’après l’examen : micro_gpt.pt.",
   "Presque tout l’apprentissage se fait dans les 200 premiers pas (≈ 8,3 → ≈ 4,5). Ensuite les deux courbes s’écartent : l’écart de 0,94 marque le début du par-cœur."],
 io:["Les courbes d’erreur","micro_gpt.pt, le meilleur instantané du modèle"],
 math:"La perplexité, e^perte, est le nombre de tokens entre lesquels le modèle hésite : de 3 791 à 80,7. C’est la formule de Boltzmann S = k ln W lue à l’envers, W = e^(S/k). L’écart entraînement/examen illustre le compromis biais-variance.",
 info:"Arrêt précoce (early stopping) et points de reprise (checkpointing).",
 rep:"4,39 à l’examen (perplexité 80,7), 3,45 à l’entraînement", obs:true},
{n:12, t:"Faire parler le modèle", short:"Température 0,8, top-p 95 %, cache KV : « ROMEO: » devient une scène.",
 why:"C’est la finalité : produire un texte nouveau à partir d’un début donné. Le modèle ne donne que les probabilités du token suivant : on en tire un, on l’ajoute, on recommence.",
 what:["Le début, « ROMEO: », est lu en une seule passe ; les K et V de chaque token sont gardés dans un cache : chaque nouveau token ne calcule plus que sa propre ligne.",
   "Les 4 096 scores sont divisés par la température 0,8, passés en softmax, puis on ne garde que les tokens qui totalisent 95 % (top-p) avant de tirer au sort.",
   "Mesuré : après « ROMEO », 98,4 % pour « : » (99,8 % à T = 0,8) ; après « ROMEO: », 99,3 % pour le retour à la ligne.",
   "À 256 tokens, on repart de la seconde moitié du texte et on reconstruit le cache : une fenêtre glissante."],
 io:["« ROMEO: »","une scène dialoguée"],
 math:"La température est celle du facteur de Boltzmann : quand T → 0, tout se concentre sur le token le plus probable. Le tirage suit la méthode d’inversion : U uniforme sur [0, 1], puis le premier token dont la probabilité cumulée dépasse U.",
 info:"Le cache KV est une mémoïsation : chaque nouveau token coûte un calcul proportionnel à la longueur du texte, au lieu de son carré.",
 rep:"Température 0,8, top-p 95 %", obs:false},
{n:13, t:"Lire le résultat", short:"La forme est acquise, le fond non. ≈ 2 bits par caractère au lieu de 8.",
 why:"Il faut savoir ce que le modèle a réellement appris, et ce qu’il ne peut pas apprendre à cette taille.",
 what:["<b>La forme est acquise</b> : noms de personnages en majuscules, répliques, ponctuation, tournures anciennes (« ’Tis », « thou art »).",
   "<b>Le fond, non</b> : aucun sens suivi d’une réplique à l’autre.",
   "<b>C’est un modèle de base</b> : il continue un texte, mais ne répond pas à une question et ne suit pas de consigne.",
   "Une perte de 4,39 par token vaut 6,3 bits par token, soit ≈ 2 bits par caractère, contre 8 dans le fichier brut.",
   "~2 bits de savoir stockable par réglage : 1,3 M réglages retiennent au plus ~330 Ko, moins que le corpus de 1,1 Mo."],
 io:["Le modèle entraîné","un bilan : la forme avant le fond"],
 math:"Pour Shannon, un code optimal utilise −log₂ p bits pour un symbole de probabilité p : la perte convertie en bits est la longueur du meilleur code que permet le modèle. Prédire, c’est compresser.",
 info:"Capacité d’un modèle : il retient les régularités les plus rentables.",
 rep:"≈ 2 bits par caractère, contre 8", obs:true,
 rig:"Les 330 Ko sont un plafond tiré de mesures sur d’autres modèles, pas une mesure de celui-ci. Les 2 bits par caractère, eux, découlent des mesures du parcours."},
{n:14, t:"Post-entraîner : du modèle de base à l’assistant", short:"Dialogues, appels d’outils, SFT, LoRA, puis DPO : un modèle qui répond.",
 why:"Un modèle de base continue un texte : il ne répond pas à une question et ne sait pas quand appeler un outil. Il faut lui apprendre le format d’une conversation et la forme d’un appel d’outil. (Sur un modèle ouvert de 1 à 3 Md de réglages : micro_gpt.py est trop petit.)",
 what:["<b>Des dialogues d’exemple</b>, consigne → réponse, avec des tokens spéciaux pour les tours de parole.",
   "<b>Des exemples d’appels d’outils</b> : la description de l’outil (nom, rôle, schéma JSON) est dans le contexte ; la réponse attendue est un appel structuré.",
   "<b>L’affinage supervisé (SFT)</b> : la boucle de l’étape 10, mais l’erreur n’est comptée que sur ce qu’écrit l’assistant.",
   "<b>LoRA</b> : les grandes matrices restent figées ; on entraîne à côté deux petites matrices dont le produit forme une correction.",
   "<b>En option, DPO</b> : deux réponses à une même consigne, on augmente la probabilité relative de la préférée."],
 io:["Modèle de base","modèle « instruit », qui répond et écrit des appels d’outils bien formés"],
 math:"LoRA remplace W par W + B·A, avec B : d × r, A : r × d, r ≪ d : correction de rang ≤ r. Pour d = 3 072 et r = 16 : 98 304 nombres au lieu de 9 437 184 (1,04 %). Eckart-Young (valeurs singulières) éclaire pourquoi un petit rang suffit. DPO repose sur Bradley-Terry, P(A ≻ B) = σ(score(A) − score(B)), avec la divergence KL intégrée à la formule.",
 info:"Le schéma JSON est une grammaire des appels valides ; la génération contrainte écarte les tokens qui casseraient le format, avec un automate à pile. Réentraîner tout coûterait 16 octets par réglage (48 Go pour 3 Md).",
 rep:"≈ 1 % des réglages de chaque matrice adaptée", obs:false, future:true},
{n:15, t:"Brancher les outils : la boucle d’agent et le MCP", short:"Le modèle demande, l’hôte exécute via un serveur MCP, le résultat revient dans le contexte.",
 why:"Le modèle ne fait que produire du texte. Pour agir (lire un fichier, interroger une base, consulter un service), une application doit exécuter ce qu’il demande. Le MCP standardise ce branchement.",
 what:["L’hôte demande au serveur la liste de ses outils (<b>tools/list</b>) et place leurs descriptions dans le contexte du modèle.",
   "Le modèle génère. S’il écrit un appel d’outil, l’hôte l’intercepte, vérifie le JSON contre le schéma et peut demander confirmation.",
   "L’hôte envoie <b>tools/call</b> au serveur, qui exécute l’outil et renvoie le résultat.",
   "Le résultat rejoint le contexte comme un message « outil », et le modèle reprend.",
   "La boucle s’arrête à la première réponse sans appel d’outil, ou au nombre maximal de tours."],
 io:["Modèle instruit + outils","un agent capable d’agir et de rendre compte de ce qu’il a fait"],
 math:"La boucle d’agent est un système dynamique discret : l’état est le contexte, chaque tour le transforme. Le nombre de tours restants est un variant, un entier qui diminue à chaque tour : il garantit que la boucle s’arrête (MPI).",
 info:"Architecture client-serveur, appel de procédure distant en JSON-RPC 2.0, transports stdio ou HTTP. Validation par schéma = vérification de types. Sécurité : moindre privilège, et méfiance envers l’injection de prompt.",
 rep:"3 messages clés : initialize, tools/list, tools/call", obs:false, future:true}
];

const CHECKS = [
 ["Aller-retour du vocabulaire","221 octets → 137 tokens → texte identique"],
 ["Inventaire des pièces","1 315 968 = formule"],
 ["Perte de départ","8,355 ≈ ln 4 096 = 8,318"],
 ["Rotation relative","q·k(10,3) = q·k(50,43) = −6,54239"],
 ["Causalité","écart nul avant la position 100"],
 ["Deux calculs, un résultat","écarts ≈ 4·10⁻⁷ et 3·10⁻⁷"],
 ["Capacité à mémoriser","8,34 → 0,002 en 150 pas"]
];
const SPEED = [
 ["Attention / étage","avant",0.33,"0,33 s"],["","après",0.07,"0,07 s"],
 ["Un pas","32 ext.",2.6,"2,6 s"],["","16 ext.",0.9,"0,9 s"],
 ["Par extrait","avant",0.081,"0,081 s"],["","après",0.056,"0,056 s"]
];
const LOSS = {steps:[0,200,400,600,800], train:[8.27,null,null,3.69,3.45], val:[8.24,4.83,4.51,4.49,4.39]};
/* ===================== DONNÉES : LEXIQUE ===================== */
const FAMS = {
 base:"Le vocabulaire de base", outils:"Outils et formats", texte:"Texte et tokenisation", proba:"Probabilités et statistique",
 alg:"Algèbre linéaire et géométrie", ana:"Analyse et optimisation", phys:"Physique : les analogies", pieces:"Les pièces du modèle",
 train:"Entraîner, vérifier, accélérer", gen:"Générer du texte", post:"Post-entraînement", mcp:"Agents et MCP"
};
// [notion, famille, domaines (m maths, p physique, i informatique, a IA), à quoi elle a servi, étapes]
const LEX = [
["GPT","base","a","Generative Pre-trained Transformer : le type de modèle construit dans tout le parcours, qui génère du texte après un pré-entraînement sur un corpus.","0, 1–13"],
["Transformer","base","a","L’architecture publiée par Google en 2017. Le micro-GPT en garde la moitié « décodeur » : des étages d’attention et de calcul empilés.","0, 6"],
["Modèle de langage","base","a","Un programme qui donne une probabilité à chaque suite possible d’un texte. C’est ce que le parcours fabrique.","3, 6"],
["Réseau de neurones","base","a","La fonction à réglages qui transforme des numéros de tokens en probabilités. Assemblé à l’étape 6, ajusté à l’étape 10.","4–12"],
["Token","base","a","Un morceau de texte numéroté (pas un jeton d’accès) : l’unité que le modèle lit et prédit. Il y en a 4 096 différents ici.","2"],
["Paramètre (réglage, poids)","base","a","Un nombre ajusté pendant l’apprentissage. Le micro-GPT en compte 1 315 968, vérifiés à l’étape 5.","5, 10"],
["Hyperparamètre","base","a","Un réglage choisi à la main avant l’entraînement : d, L, têtes, contexte, taille des lots, taux d’apprentissage. Il fixe la taille et le coût du modèle.","4"],
["Corpus","base","a","Le texte d’apprentissage : TinyShakespeare, 1 115 394 caractères. C’est le seul monde que le modèle connaît.","1"],
["Modèle de base","base","a","Un modèle seulement pré-entraîné : il continue un texte mais ne suit pas de consignes. Point de départ de l’étape 14.","13, 14"],
["Assistant (modèle instruit)","base","a","Un modèle de base post-entraîné pour répondre à des consignes et écrire des appels d’outils bien formés.","14"],
["Agent","base","a","Un modèle instruit relié à des outils par une application qui exécute ses demandes, en boucle, jusqu’à la réponse finale.","15"],

["Python","outils","i","Le langage dans lequel micro_gpt.py est écrit.","1"],
["PyTorch","outils","i","La bibliothèque de calcul : tenseurs, dérivées automatiques et optimiseur AdamW. Installée en version sans carte graphique.","1"],
["Tenseur (algèbre multilinéaire)","outils","mi","Un tableau de nombres à plusieurs dimensions, par exemple 16 extraits × 256 tokens × 128 nombres. Toutes les données du modèle sont rangées ainsi.","1, 6"],
["Différentiation automatique","outils","mi","PyTorch calcule seul les dérivées de n’importe quel calcul : la rétropropagation se fait sans écrire une seule dérivée à la main.","1, 10"],
["Graphe orienté sans cycle (DAG)","outils","i","PyTorch y note chaque opération. La rétropropagation le parcourt à l’envers pour calculer les dérivées.","1, 10"],
["Virgule flottante 32 bits (IEEE 754)","outils","i","Le format de chaque nombre : ~7 chiffres significatifs et 4 octets par réglage, d’où le fichier de 5,3 Mo.","1, 5"],
["Précision machine","outils","mi","Le plus petit écart relatif visible sur 32 bits, ~1,2·10⁻⁷. Étalon pour juger l’écart de 4·10⁻⁷ entre deux calculs censés être identiques.","8"],
["Générateur pseudo-aléatoire, graine","outils","i","Une suite calculée qui imite le hasard. La graine 1337 fixe son point de départ : mêmes tirages, résultats reproductibles.","1, 7"],
["Processeur (CPU), carte graphique (GPU)","outils","i","Le micro-GPT tourne sur processeur, d’où les tailles choisies. L’affinage de l’étape 14 demande une carte graphique de 16 à 24 Go.","4, 9, 14"],

["Octet, UTF-8","texte","i","Le vocabulaire de départ du BPE : 256 octets possibles. Grâce à UTF-8, tout texte s’écrit avec, accents et emojis compris.","2"],
["BPE (Byte Pair Encoding)","texte","ia","L’algorithme qui fusionne 3 840 fois la paire de symboles voisins la plus fréquente. Il a produit le vocabulaire de 4 096 tokens.","2"],
["Expression régulière, automate fini, Kleene","texte","mi","Le motif qui découpe d’abord le texte en mots, nombres, ponctuation et espaces. Kleene relie ces motifs aux automates finis qui les reconnaissent.","2"],
["Table de hachage (dictionnaire)","texte","i","Elle compte les paires de symboles et retrouve un compte presque instantanément.","2"],
["Index inverse","texte","i","Une table « paire → mots qui la contiennent » : chaque fusion ne met à jour que les mots concernés.","2"],
["Algorithme glouton","texte","i","La stratégie du BPE : à chaque tour, prendre la meilleure fusion immédiate, sans revenir en arrière.","2"],
["Compression de données","texte","mi","Le principe du BPE (une paire fréquente devient un symbole) et la conclusion de l’étape 13 : bien prédire, c’est bien compresser.","2, 13"],
["Code de Huffman","texte","mi","Les codes les plus courts aux symboles les plus fréquents : une analogie pour comprendre pourquoi le BPE raccourcit le texte.","2"],
["Théorie de l’information (Shannon)","texte","mi","Elle mesure l’information en bits : les 12 bits de la perte initiale et le lien entre prédiction et compression.","2, 8, 13"],
["Loi de Zipf","texte","m","Quelques mots très fréquents, la plupart très rares : c’est ce qui rend les premières fusions du BPE si rentables.","2"],
["Mémoïsation (cache)","texte","i","Garder un résultat déjà calculé pour ne pas le refaire. L’encodage met en cache les morceaux traités ; le cache KV fait de même à la génération.","3, 12"],
["Fuite de données","texte","ia","Un examen qui a « déteint » sur l’apprentissage. Un vocabulaire appris sur tout le texte, examen compris, en crée une légère.","2, 3"],

["Probabilités composées (règle de chaîne)","proba","m","p(x₁…x_T) = p(x₁) × p(x₂ | x₁) × … : la probabilité d’un texte se ramène à celle du token suivant, la seule tâche apprise.","3"],
["Chaîne de Markov","proba","m","Un processus dont l’avenir ne dépend que d’un passé limité. Avec 256 tokens de contexte, le modèle en est une d’ordre au plus 256.","3"],
["Méthode de Monte-Carlo, estimateur sans biais","proba","mp","Tirer 16 extraits au hasard donne une estimation juste en moyenne du gradient calculé sur tout le corpus.","3, 10"],
["Loi normale (courbe en cloche)","proba","m","La loi des tirages de départ des poids, d’écart-type 0,02.","7"],
["Variance d’une somme","proba","m","Pour des variables indépendantes, les variances s’additionnent : d’où la division par √32 dans l’attention et par √8 à l’initialisation.","6, 7"],
["Séparation entraînement / validation","proba","ma","90 % du texte pour apprendre, 10 % gardés comme examen pour mesurer la généralisation.","3, 11"],
["Erreur de généralisation","proba","ma","L’écart entre l’erreur à l’examen et à l’entraînement (4,39 contre 3,45). Elle signale le début du par-cœur.","11"],
["Maximum de vraisemblance","proba","m","Choisir les réglages qui rendent le texte observé le plus probable. Minimiser l’entropie croisée revient exactement à cela.","10"],
["Entropie croisée (la perte)","proba","ma","La moyenne de −ln(probabilité donnée au bon token) : l’erreur que l’entraînement fait baisser, de 8,24 à 4,39 sur l’examen.","8, 10, 11"],
["Entropie, bit","proba","mp","L’incertitude d’une loi. Pour la loi uniforme sur 4 096 tokens : ln 4 096 ≈ 8,32, soit 12 bits.","8"],
["Perplexité","proba","ma","e^(perte) : le nombre de tokens entre lesquels le modèle hésite. De 3 791 à 80,7.","11"],
["Compromis biais-variance","proba","m","Un modèle plus souple colle mieux aux données vues mais généralise moins bien : il explique l’écart entraînement / examen.","11"],
["Méthode d’inversion","proba","m","Tirer U uniforme entre 0 et 1, puis prendre le premier token dont la probabilité cumulée dépasse U.","12"],
["Modèle de Bradley-Terry","proba","m","La probabilité de préférer A à B vaut σ(score(A) − score(B)). C’est la base de DPO.","14"],
["Divergence de Kullback-Leibler","proba","m","Une mesure de l’écart entre deux lois. Dans DPO, elle retient le modèle près de sa version de départ.","14"],

["Vecteur, dimension","alg","m","Chaque token devient un vecteur de 128 nombres, un point de ℝ¹²⁸.","4, 6"],
["Matrice, application linéaire","alg","m","Les pièces réglables du réseau. Une matrice d × d compte d² coefficients, d’où le terme 4d².","5, 6"],
["Base canonique","alg","m","Lire le vecteur d’un token dans la table revient à multiplier la table par un vecteur de la base canonique.","6"],
["Transposée, partage de la table","alg","m","La même table sert à l’entrée et, transposée, à la sortie. Elle n’est comptée qu’une fois.","5, 6"],
["Produit scalaire","alg","m","Il mesure la pertinence entre une question et une étiquette, et compare le vecteur final aux 4 096 tokens.","6"],
["Inégalité de Cauchy-Schwarz","alg","m","Le produit scalaire est maximal quand les vecteurs sont alignés : d’où son rôle de mesure de ressemblance.","6"],
["Norme euclidienne, sphère","alg","m","RMSNorm ramène chaque vecteur sur une sphère de rayon √128 avant de le pondérer.","6"],
["Barycentre","alg","m","La sortie de l’attention est le barycentre des contenus V, pondérés par les probabilités de la softmax.","6"],
["Produit de Hadamard","alg","m","La « vanne » du bloc SwiGLU : deux vecteurs multipliés coordonnée par coordonnée.","6"],
["Composée d’applications linéaires","alg","m","Elle reste linéaire : c’est pourquoi le réseau a besoin d’une non-linéarité.","6"],
["Nombres complexes, rotations","alg","m","RoPE fait tourner chaque paire de coordonnées : z devient z·e^(imθ) à la position m.","6"],
["Groupe SO(2), morphisme de groupes","alg","m","m ↦ rotation d’angle mθ change l’addition des positions en composition des rotations : seul l’écart compte.","6, 8"],
["Invariance par translation","alg","m","Le score entre (10, 3) égale celui entre (50, 43). Vérifié au contrôle 4.","8"],
["Injectivité","alg","m","Décoder après encoder redonne le texte : l’encodage ne confond jamais deux textes. Contrôle 1.","8"],
["Rang d’une matrice","alg","m","La correction LoRA B·A est de rang au plus r = 16, ce qui la rend minuscule à stocker.","14"],
["Valeurs singulières, Eckart-Young","alg","m","La meilleure approximation de rang r garde les r plus grandes valeurs singulières : pourquoi un petit rang peut suffire.","14"],

["Dérivée, gradient","ana","m","Pour chaque réglage, le sens et la force du mouvement qui fait baisser l’erreur. Le gradient les rassemble tous.","10"],
["Dérivation des fonctions composées","ana","m","(g∘f)′ = (g′∘f)·f′ : la règle que la rétropropagation applique étage par étage.","10"],
["Rétropropagation","ana","mi","Le calcul de toutes les dérivées en parcourant le graphe à l’envers. Elle coûte environ deux fois la prédiction.","10"],
["Ordre topologique","ana","i","Un ordre où chaque calcul vient après ceux dont il dépend ; la rétropropagation suit l’ordre inverse.","10"],
["Descente de gradient","ana","m","Avancer chaque réglage d’un petit pas contre son gradient : le principe de toute la boucle. (Cauchy, 1847.)","10"],
["Écrêtage du gradient","ana","m","Si la norme du gradient dépasse 1, on le ramène à 1 sans changer sa direction : une projection sur la boule.","10"],
["AdamW","ana","ma","L’optimiseur : moyenne récente des dérivées (inertie), pas divisé par leur amplitude récente, rappel des poids vers zéro appliqué à part.","1, 10"],
["Méthode de la bille lourde (Polyak)","ana","mp","L’image de l’inertie d’AdamW : une bille lourde qui roule en frottant franchit les petits creux.","10"],
["Régularisation de Tikhonov (L2)","ana","m","Pénaliser les grands poids. Le rappel vers zéro d’AdamW s’en inspire, mais « découplé » : appliqué hors du pas adaptatif.","10"],
["Taux d’apprentissage, échauffement","ana","ma","La taille des pas. Elle monte doucement pendant 100 pas, le temps que les moyennes d’AdamW se stabilisent.","10"],
["Décroissance en cosinus","ana","m","Après l’échauffement, la taille des pas redescend en cosinus jusqu’au pas 2 000, pour que le modèle se pose.","10"],
["Méthode d’Euler explicite","ana","mp","Une connexion résiduelle h ← h + f(h) est un pas d’Euler (pas 1) pour dh/dt = f(h). Le réseau en enchaîne 8.","6"],
["Théorème de Weierstrass, approximation universelle","ana","m","Les polynômes approchent toute fonction continue ; de même, un réseau avec non-linéarité approche toute fonction raisonnable.","6"],
["Fonction logistique (sigmoïde σ)","ana","m","σ(x) = 1/(1 + e^(−x)). Elle sert dans SiLU et dans le modèle de préférence de DPO.","6, 14"],
["SiLU (Swish)","ana","ma","x·σ(x) : la non-linéarité du bloc SwiGLU.","6"],
["Softmax","ana","mpa","Transforme des scores en probabilités positives de somme 1, dans l’attention et à la sortie.","6, 12"],
["Astuce log-sum-exp, softmax en ligne","ana","mi","Calculer la softmax morceau par morceau en suivant le maximum et la somme des exponentielles : c’est ce qui rend possible l’attention fusionnée.","9"],
["Fréquences, analyse de Fourier","ana","mp","Les 16 vitesses de rotation de RoPE vont de rapide à très lente, en progression géométrique, comme les aiguilles d’une horloge.","6"],

["Facteur de Boltzmann, ensemble canonique","phys","p","La softmax a la même formule : un score élevé joue le rôle d’une énergie basse, exponentiellement plus probable.","6"],
["Température","phys","pa","On divise les scores par T avant la softmax. T = 0,8 concentre un peu les choix ; quand T → 0, on prend toujours le plus probable.","12"],
["Formule de Boltzmann S = k ln W","phys","p","Lue à l’envers, W = e^(S/k) : comme la perplexité, exponentielle de l’erreur, qui compte les « états » entre lesquels le modèle hésite.","11"],
["Principe fondamental de la dynamique, frottement fluide","phys","p","L’image d’AdamW : la moyenne des dérivées agit comme une vitesse freinée par un frottement.","10"],
["Recuit, recuit simulé","phys","pi","La baisse lente du taux d’apprentissage ressemble au refroidissement lent d’un métal, qui le laisse se poser dans un état stable.","10"],
["Verre de spin","phys","p","L’image du réseau au départ : un système désordonné de réglages aléatoires.","7"],
["Système causal (filtre)","phys","pi","Comme un filtre qui ne dépend que du passé, le masque empêche de regarder les tokens futurs. Contrôle 5.","6, 8"],

["Plongement (embedding)","pieces","a","La table qui donne à chaque token son vecteur de 128 nombres : la première pièce du réseau.","6"],
["RMSNorm","pieces","a","La normalisation placée avant chaque calcul : chaque vecteur ramené à une taille standard, puis pondéré par des gains appris qui partent de 1.","6, 7"],
["Attention (Q, K, V)","pieces","a","La pièce où les tokens échangent : chacun pose une question (Q) ; lui-même et les précédents présentent une étiquette (K) et un contenu (V).","6"],
["Têtes d’attention","pieces","a","4 attentions en parallèle par étage, chacune sur 32 nombres, puis recollées et mélangées par la matrice de sortie.","4, 6"],
["Division par √32","pieces","ma","Elle ramène la variance des scores à 1, pour qu’un seul score n’écrase pas tous les autres dans la softmax.","6"],
["Masque causal","pieces","a","Le masque triangulaire qui interdit à un token de regarder les suivants.","6, 8"],
["RoPE (position par rotation)","pieces","ma","Indique l’ordre des tokens en faisant tourner Q et K d’un angle proportionnel à la position. Aucun réglage à apprendre.","5, 6"],
["SwiGLU (bloc de calcul)","pieces","a","3 matrices et une vanne : chaque token transformé seul, à travers SiLU. Largeur 344 ≈ 8/3 × 128.","4, 5, 6"],
["Connexions résiduelles","pieces","a","Chaque pièce ajoute une correction au flux principal au lieu de tout réécrire : 8 ajouts en tout, 2 par étage.","6, 7"],
["Couche de sortie","pieces","a","Normalisation finale, comparaison avec les 4 096 vecteurs de la table, puis softmax : les probabilités du token suivant.","6"],

["Initialisation aléatoire, brisure de symétrie","train","ma","Des poids tirés au hasard (écart-type 0,02) pour que les neurones ne restent pas jumeaux ; sorties de branches divisées par √8.","7"],
["Boucle d’apprentissage","train","a","2 000 répétitions de cinq gestes : tirer un lot, prédire, rétropropager, plafonner, corriger.","10"],
["Lot (batch)","train","a","Les 16 extraits de 256 tokens traités ensemble à chaque pas.","3, 9"],
["Test unitaire, assertion","train","i","Vérifier automatiquement qu’une égalité attendue est vraie, comme le nombre de paramètres.","5, 8"],
["Les 7 vérifications","train","ia","Les essais à vide avant l’entraînement : vocabulaire, inventaire, perte initiale, rotation, causalité, équivalence des calculs, mémorisation.","8"],
["Test de mémorisation d’un lot","train","ia","Répéter un seul lot 150 fois : la perte doit tomber (8,34 → 0,002), sinon un bug se cache dans les dérivées.","8"],
["Profilage (chronométrage)","train","i","Mesurer chaque partie séparément avant d’optimiser. Il a désigné l’attention et la taille des lots.","9"],
["Attention fusionnée","train","i","La version optimisée de PyTorch : même calcul, 0,07 s par étage au lieu de 0,33 s.","9"],
["FlashAttention","train","i","Calculer l’attention par tuiles qui tiennent en mémoire rapide, sans stocker le tableau complet des scores.","9"],
["Hiérarchie mémoire","train","i","Registres, caches, RAM : les mémoires rapides sont petites, un calcul qui y tient va beaucoup plus vite.","9"],
["Sur-apprentissage","train","a","Le modèle réussit mieux ce qu’il a déjà vu (3,45) que l’examen (4,39) : il commence à réciter.","11"],
["Arrêt précoce, meilleur modèle","train","ia","On mesure l’examen tous les 200 pas et on garde la meilleure version, même si l’entraînement continue.","11"],
["Point de reprise (checkpoint)","train","i","Le fichier micro_gpt.pt qui sauvegarde le meilleur état du modèle.","11"],
["Lois d’échelle, Chinchilla","train","ma","Pour un budget de calcul donné, ~20 tokens d’entraînement par paramètre. Ici il en faudrait ~26 millions.","4, 11"],
["Capacité (≈ 2 bits par paramètre)","train","ma","Un ordre de grandeur publié du savoir stockable par réglage : ≈ 330 Ko pour 1,3 M réglages. Un plafond, pas une mesure.","13"],

["Génération autorégressive","gen","a","Produire un token, l’ajouter au texte, recommencer : c’est ainsi que « ROMEO: » devient une scène.","12"],
["Cache KV","gen","i","Garder les K et V déjà calculés : chaque nouveau token coûte un calcul proportionnel à la longueur du texte, pas à son carré.","8, 12"],
["Échantillonnage top-p","gen","ma","Garder le plus petit groupe de tokens qui totalise 95 %, puis tirer dedans : on écarte la longue traîne absurde.","12"],
["Fenêtre de contexte","gen","a","Le modèle ne voit que 256 tokens : à cette limite, on garde la seconde moitié du texte et on reconstruit le cache.","4, 12"],
["Prédire, c’est compresser","gen","mi","Une perte de 4,39 vaut ≈ 2 bits par caractère, contre 8 dans le fichier brut.","13"],

["Post-entraînement","post","a","Tout ce qui transforme un modèle de base en assistant : dialogues d’exemple, affinage supervisé, préférences.","14"],
["Apprentissage par transfert","post","a","Partir d’un modèle ouvert déjà pré-entraîné, de 1 à 3 Md de paramètres, au lieu de tout refaire.","14"],
["Tokens spéciaux, gabarit de conversation","post","a","Des tokens réservés qui marquent les tours de parole : utilisateur, assistant, outil.","14"],
["SFT (affinage supervisé)","post","a","La boucle de l’étape 10 appliquée à des dialogues d’exemple.","14"],
["Masquage de la perte","post","a","L’erreur n’est comptée que sur les tokens écrits par l’assistant ; consigne et résultats d’outils sont masqués.","14"],
["LoRA","post","ma","Les grandes matrices restent figées ; on entraîne B et A dont le produit corrige W. ~1 % des réglages de chaque matrice adaptée.","14"],
["DPO","post","ma","Apprendre des préférences : pour une même consigne, augmenter la probabilité relative de la réponse jugée meilleure.","14"],
["Appel d’outil","post","ia","Une réponse structurée, par exemple {\"name\": \"meteo\", …}, que le modèle apprend à écrire quand un outil est utile.","14, 15"],
["JSON, schéma JSON","post","i","Le format des appels, et la grammaire qui décrit les appels valides : nom, paramètres, types.","14, 15"],
["Génération contrainte","post","i","Écarter à chaque pas les tokens qui casseraient le JSON, pour ne produire que des appels conformes.","14"],
["Grammaire, automate à pile","post","mi","Le JSON s’emboîte : le reconnaître demande un automate à pile, plus puissant qu’un automate fini.","14"],
["Mémoire par paramètre (16 octets)","post","i","Poids, dérivée et deux moyennes d’AdamW sur 4 octets chacun : ≈ 48 Go pour réentraîner 3 Md de paramètres. D’où LoRA.","14"],

["Boucle d’agent","mcp","ia","Générer, intercepter un appel d’outil, l’exécuter, réinjecter le résultat, recommencer jusqu’à la réponse finale.","15"],
["MCP (Model Context Protocol)","mcp","i","Le standard qui branche des outils sur des applications : un outil écrit une fois marche avec toute application compatible.","15"],
["Hôte, client MCP, serveur MCP","mcp","i","L’hôte dialogue avec le modèle et crée un client par serveur ; chaque serveur expose ses outils.","15"],
["Outils, ressources, prompts","mcp","i","Ce qu’un serveur MCP expose : des actions, des données lisibles à une adresse, des gabarits de consignes.","15"],
["initialize, tools/list, tools/call","mcp","i","Les messages pour se présenter, lister les outils (leurs descriptions vont dans le contexte), puis en appeler un.","15"],
["JSON-RPC 2.0","mcp","i","Le format des messages : une requête porte un identifiant, la réponse reprend le même.","15"],
["Appel de procédure distant, client-serveur","mcp","i","Demander à un autre programme d’exécuter une fonction et d’en renvoyer le résultat.","15"],
["stdio et HTTP","mcp","i","Les deux transports : les entrées-sorties d’un programme local, ou HTTP pour un serveur distant.","15"],
["Validation par schéma, typage","mcp","i","Vérifier qu’un appel respecte son schéma avant de l’exécuter, comme une vérification de types.","15"],
["Système dynamique discret","mcp","m","La boucle d’agent vue en maths : l’état est le contexte, chaque tour le transforme.","15"],
["Variant de boucle","mcp","mi","Le nombre de tours restants, un entier qui diminue à chaque tour : il garantit que l’agent s’arrête.","15"],
["Moindre privilège","mcp","i","Chaque serveur n’accède qu’au strict nécessaire, pour limiter les dégâts possibles.","15"],
["Injection de prompt","mcp","ia","Des instructions malveillantes cachées dans un résultat d’outil. On traite ce contenu comme des données, jamais comme des ordres.","15"]
];

/* ===================== FRISE ===================== */
const THEMES = {
 maths:["Mathématiques","#3dd8ff"], phys:["Physique & hasard","#ff8a3d"], info:["Informatique & IA symbolique","#3ee0a1"],
 rn:["Réseaux de neurones","#ffd166"], llm:["Transformers & LLM","#a98bff"], claude:["Claude & Anthropic","#ff7fa6"],
 mcp:["MCP & agents","#7fb6ff"], sci:["IA & physique","#ff4f6d"]
};
// [année affichée, thème, étoiles (0 ☆ / 1 ★ / 2 ★★), texte]
const FRISE = [
["v. −350","maths",0,"Aristote formalise le syllogisme : la validité d’un raisonnement dépend de sa forme."],
["v. 820","maths",0,"Al-Khwârizmî écrit le traité qui donne son nom à l’algèbre ; son nom deviendra « algorithme »."],
["1654","maths",1,"Pascal et Fermat fondent le calcul des probabilités sur le partage des mises d’un jeu interrompu."],
["1676–1684","maths",1,"Leibniz publie le calcul différentiel et la dérivation des fonctions composées : exactement ce qu’exécute la rétropropagation."],
["1713","maths",0,"Jacques Bernoulli, loi des grands nombres : une moyenne sur beaucoup d’exemples devient fiable."],
["1738","phys",0,"Daniel Bernoulli explique la pression d’un gaz par les chocs d’innombrables molécules."],
["1763–1812","maths",0,"Bayes puis Laplace : mettre à jour une croyance à la lumière des observations."],
["1805–1809","maths",1,"Legendre puis Gauss inventent les moindres carrés : la première « fonction de perte » minimisée sur des données."],
["1847","maths",1,"Cauchy présente la descente de gradient : suivre la pente vers un minimum."],
["1854","maths",1,"Boole, Les Lois de la pensée : la logique devient une algèbre."],
["1872–1877","phys",1,"Boltzmann : entropie S = k log W et distribution exponentielle en énergie/température — mathématiquement la softmax et sa « température »."],
["1890","phys",0,"Poincaré découvre le chaos déterministe avec le problème des trois corps."],
["1900","phys",1,"Bachelier modélise la Bourse par un mouvement brownien, cinq ans avant Einstein."],
["1902","phys",1,"Gibbs fonde la mécanique statistique moderne (ensembles canoniques)."],
["1905","phys",1,"Einstein explique le mouvement brownien par la diffusion."],
["1908","phys",0,"Langevin : une particule soumise à une force aléatoire ; Perrin confirme la réalité des atomes."],
["1913","maths",1,"Markov compte voyelles et consonnes dans Eugène Onéguine : premier modèle statistique d’un texte, ancêtre des modèles de langage."],
["1920–1925","phys",0,"Lenz et Ising : des spins qui interagissent sur un réseau, futur modèle des réseaux de Hopfield."],
["1926–1927","phys",1,"Born et Heisenberg : le hasard devient une propriété fondamentale de la nature."],
["1931","maths",0,"Gödel : tout système formel assez riche contient des vérités indémontrables."],
["1933","maths",1,"Kolmogorov axiomatise les probabilités."],
["1935","maths",0,"Zipf décrit la loi de fréquence des mots."],
["1936","info",1,"Turing et Church définissent la machine universelle et les limites de la calculabilité."],
["1943","rn",1,"McCulloch et Pitts inventent le neurone formel."],
["1944","phys",0,"Itô crée le calcul stochastique, cœur mathématique des futurs générateurs d’images."],
["1946–1949","phys",1,"Ulam, von Neumann et Metropolis inventent la méthode de Monte-Carlo à Los Alamos."],
["1948","info",1,"Shannon, théorie mathématique de la communication : l’entropie mesure l’information ; il génère déjà de faux textes par n-grammes."],
["1949","rn",1,"Hebb : des neurones qui s’activent ensemble renforcent leur connexion."],
["1950","info",1,"Turing propose le jeu de l’imitation et l’idée d’une « machine-enfant » qu’on éduque."],
["1951","maths",1,"Robbins et Monro : l’approximation stochastique, base de la descente de gradient sur petits lots."],
["1951","info",0,"Shannon fait deviner la lettre suivante d’un texte à des humains : la tâche même du pré-entraînement."],
["1953","phys",1,"Algorithme de Metropolis (chaînes de Markov Monte-Carlo), calculé sur le MANIAC."],
["1954–1957","info",0,"Harris et Firth : on connaît un mot par la compagnie qu’il fréquente — le principe des plongements."],
["1955–1956","info",1,"Dartmouth : McCarthy, Minsky, Rochester et Shannon forgent le terme « intelligence artificielle »."],
["1957–1958","rn",1,"Rosenblatt crée le Perceptron, premier réseau qui apprend de ses erreurs."],
["1966","info",0,"ELIZA donne l’illusion de comprendre avec des règles simples."],
["1969","rn",1,"Minsky et Papert montrent qu’un perceptron à une couche n’apprend pas le XOR : les financements se tarissent."],
["1970","rn",1,"Linnainmaa décrit la différentiation automatique en mode inverse ; Werbos l’applique aux réseaux en 1974."],
["1973","info",1,"Rapport Lighthill : premier « hiver de l’IA »."],
["1975–1979","phys",1,"Les verres de spin : Parisi résout le modèle par la brisure de symétrie des répliques."],
["1982","rn",1,"Hopfield conçoit une mémoire associative qui « roule » vers le minimum d’une énergie de type Ising."],
["1983","phys",1,"Kirkpatrick, Gelatt et Vecchi inventent le recuit simulé."],
["1985","rn",1,"Machine de Boltzmann (Ackley, Hinton, Sejnowski) : des neurones qui s’activent au hasard."],
["1986","rn",1,"Rumelhart, Hinton et Williams popularisent la rétropropagation dans Nature."],
["1989","rn",1,"LeCun et les réseaux convolutifs ; Cybenko démontre l’approximation universelle."],
["1990","rn",0,"Bridle baptise la « softmax »."],
["1994","info",0,"Philip Gage invente le byte pair encoding… pour la compression."],
["1997","rn",1,"Hochreiter et Schmidhuber créent la LSTM ; Deep Blue bat Kasparov sans apprentissage."],
["2003","llm",1,"Bengio et al. : le modèle de langage neuronal, chaque mot reçoit un vecteur appris."],
["2006","rn",1,"Hinton et al. relancent les réseaux profonds : l’essor du deep learning."],
["2009","rn",1,"ImageNet rassemble des millions d’images annotées."],
["2012","rn",2,"AlexNet remporte ImageNet avec 15,3 % d’erreur contre 26,2 % : le point de bascule."],
["2013","llm",1,"Word2Vec : roi − homme + femme ≈ reine."],
["2014","llm",1,"Seq2seq et mécanisme d’attention (Bahdanau, Cho, Bengio) ; Adam (Kingma et Ba)."],
["2015","rn",1,"ResNet atteint 152 couches grâce aux connexions résiduelles."],
["2016","rn",1,"AlphaGo bat Lee Sedol 4-1 ; normalisation de couche."],
["2017","llm",2,"« Attention Is All You Need » : le Transformer abandonne la récurrence."],
["2018","llm",1,"GPT-1 combine pré-entraînement génératif et affinage ; BERT domine la compréhension."],
["2019","llm",0,"GPT-2 (1,5 Md) ; échantillonnage top-p (Holtzman et al.)."],
["2020","llm",1,"Lois d’échelle (Kaplan et al.) puis GPT-3 (175 Md) et l’apprentissage « en contexte »."],
["2021","llm",0,"Positions rotatives RoPE ; CLIP, Codex."],
["2022","llm",0,"InstructGPT (RLHF), Chinchilla (~20 tokens par paramètre), FlashAttention, ReAct."],
["30 nov. 2022","llm",2,"ChatGPT fait entrer l’IA conversationnelle dans le grand public."],
["2024","llm",1,"o1 : le raisonnement est entraîné par renforcement."],
["2021","claude",1,"Fondation d’Anthropic : la sûreté doit avancer au rythme des capacités."],
["déc. 2022","claude",1,"Constitutional AI : le modèle critique et réécrit ses réponses selon une liste de principes."],
["14 mars 2023","claude",1,"Claude 1, le même jour que GPT-4."],
["4 mars 2024","claude",1,"Claude 3 (Haiku, Sonnet, Opus) avec la vision."],
["oct. 2024","claude",1,"Computer use : Claude pilote un ordinateur."],
["mai 2025","claude",1,"Claude 4 (Opus 4, Sonnet 4)."],
["juin 2026","claude",1,"Claude Fable 5 et Claude Mythos 5."],
["sept. 2026","claude",1,"Claude Opus 5.5, puis Sonnet 5.5."],
["2016","mcp",0,"Language Server Protocol : un protocole unique entre éditeurs et analyseurs, dont MCP s’inspire."],
["2023–2024","mcp",0,"Les outils arrivent dans les LLM, mais chaque intégration est faite sur mesure : N applications × M outils."],
["25 nov. 2024","mcp",2,"MCP, standard ouvert fondé sur JSON-RPC 2.0 : outils, ressources, prompts."],
["mars 2025","mcp",1,"Transport HTTP « streamable », autorisation OAuth 2.1 ; OpenAI adopte MCP."],
["juin 2025","mcp",0,"Sorties structurées et elicitation ; registre MCP en préversion en septembre."],
["nov. 2025","mcp",1,"Abstraction « Tasks » pour les opérations longues, registre centralisé."],
["déc. 2025","mcp",1,"MCP confié à l’Agentic AI Foundation (Linux Foundation)."],
["début 2026","mcp",0,"Les MCP Apps affichent des interfaces interactives dans la conversation."],
["28 juil. 2026","mcp",1,"Révision 2026-07-28 : plus de poignée de main d’initialisation, chaque requête porte sa version — un protocole sans état."],
["1982–2022","sci",1,"Aspect viole les inégalités de Bell : le hasard quantique n’est pas dû à des variables cachées (Nobel 2022)."],
["2015–2021","sci",1,"Les modèles de diffusion, inspirés de la thermodynamique hors équilibre : détruire une image par le bruit, puis remonter le temps."],
["2017","sci",0,"Carleo et Troyer représentent une fonction d’onde à N corps par un réseau de neurones."],
["2019","sci",1,"Sycamore échantillonne des circuits quantiques aléatoires en 200 secondes."],
["nov. 2020","sci",2,"AlphaFold 2 résout pratiquement le repliement des protéines."],
["oct. 2021","sci",1,"Nobel de physique à Giorgio Parisi : désordre et fluctuations, la physique des verres de spin consacrée."],
["2023","sci",0,"GraphCast prévoit la météo à 10 jours ; GNoME découvre ~380 000 cristaux stables inédits."],
["oct. 2024","sci",2,"Nobel de physique à Hopfield et Hinton ; Nobel de chimie à Baker, Hassabis et Jumper."],
["déc. 2024","sci",1,"GenCast applique la diffusion à la météo ; Willow passe sous le seuil de correction d’erreurs."],
["mai 2025","sci",0,"AlphaEvolve multiplie deux matrices complexes 4×4 en 48 multiplications, contre 49 depuis 1969."],
["oct. 2025","sci",1,"Nobel de physique à Clarke, Devoret et Martinis : effet tunnel macroscopique, base des qubits supraconducteurs."],
["févr. 2026","sci",1,"Un LLM débloque un problème d’amplitudes de gluons après 12 heures de calcul."]
];

const PHYS = [
 ["Boltzmann → softmax","c-or","p = e^(−E/kT) / Z","La softmax a exactement la forme de la distribution de Boltzmann : un score élevé joue le rôle d’une énergie basse. Le réglage « température » des LLM vient littéralement de là."],
 ["Hopfield → attention","c-rd","attention = mise à jour de Hopfield","Ramsauer et al. (2020) : chaque pas d’attention fait « relaxer » la requête vers les motifs stockés, comme une descente d’énergie."],
 ["Monte-Carlo → lots aléatoires","c-cy","16 extraits tirés au hasard","Tirer des extraits au hasard estime sans biais le gradient de tout le corpus. Le bruit des petits lots aide même à sortir des mauvais minima."],
 ["Recuit → décroissance en cosinus","c-go","refroidir lentement","Baisser doucement le taux d’apprentissage laisse le système se poser au fond d’une vallée, comme un métal refroidi lentement."],
 ["Verre de spin → initialisation","c-vi","désordre à haute température","Au départ, le réseau est un système désordonné de réglages aléatoires. Les mathématiques des verres de spin décrivent aussi la mémoire des réseaux et leurs paysages d’erreur."],
 ["Euler → connexions résiduelles","c-gr","h ← h + f(h)","Chaque raccourci est un pas d’Euler explicite pour dh/dt = f(h) : le réseau intègre une équation différentielle, étage par étage."],
 ["Bille lourde → AdamW","c-or","inertie + frottement","La moyenne des dérivées agit comme une vitesse freinée : principe fondamental de la dynamique avec frottement fluide (Polyak)."],
 ["S = k ln W → perplexité","c-cy","W = e^(S/k)","La perplexité, exponentielle de la perte, compte les « états » entre lesquels le modèle hésite : 80,7 au pas 800."],
 ["Langevin, Itô → diffusion","c-rd","bruit puis débruitage","Les générateurs d’images détruisent une image par du bruit, puis apprennent à remonter le temps : la dynamique de Langevin y sert à échantillonner."]
];

const APPROCHES = [
 ["Prompt + RAG","c-cy","Jusqu’à ~100 M tokens","quelques dizaines de milliers de pages","Ton Confluence, les documents d’une PME, des données familiales."],
 ["Fine-tuning léger (LoRA)","c-gr","Quelques centaines à quelques dizaines de milliers d’exemples annotés","paires entrée → sortie validées","5 000 tickets de support classés par des experts, pour apprendre un format ou un ton."],
 ["Pré-entraînement continu","c-go","~1 à 100 Md de tokens de texte brut du domaine","d’un modèle existant","Un grand éditeur juridique ou médical avec des décennies d’archives dans un jargon spécifique."],
 ["Entraînement de zéro","c-rd","≥ plusieurs centaines de Md de tokens","comme le micro-GPT, mais en grand","BloombergGPT : ~700 Md de tokens (363 Md financiers + 345 Md généraux), ~2,7 M$."]
];

const CODESECS = [
 ["§0 Config","d = 128, L = 4, 4 têtes, V = 4 096, contexte 256, lots de 16, 2 000 pas, graine 1337."],
 ["§1 Tokenizer BPE","Au niveau octet : accents et emojis passent. Pré-découpage par regex, index inverse, 3 840 fusions."],
 ["§2 Architecture","RMSNorm, RoPE, attention causale avec cache KV, SwiGLU, plongements d’entrée et de sortie partagés."],
 ["§3 Données","Téléchargement de TinyShakespeare, get_batch : y est x décalé d’un token."],
 ["§4 Entraînement","AdamW en deux groupes, échauffement puis cosinus, écrêtage, sauvegarde du meilleur modèle."],
 ["§5 Échantillonnage","Température et top-p, préremplissage puis décodage token par token avec le cache."],
 ["§6 Vérifications","Les 7 contrôles : tokenizer, paramètres, perte initiale, RoPE, causalité, cache KV, mémorisation."],
 ["§7 Ligne de commande","check, train (--data, --steps…), sample (--prompt, --temperature, --top_p, --seed)."]
];
/* ===================== APPLICATION ===================== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fr = (x, d=0) => Number(x).toLocaleString('fr-FR', {minimumFractionDigits:d, maximumFractionDigits:d});
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip = s => String(s).replace(/<[^>]+>/g,'');

const TITLES = {accueil:"Accueil", fondations:"Fondations", donnees:"Données & tokens", reseau:"Le réseau", apprentissage:"Apprentissage",
  generation:"Génération", assistant:"Assistant", agents:"Agents & MCP", physique:"Physique & hasard", echelles:"Échelles",
  dico:"Dictionnaire", ateliers:"Ateliers", parcours:"Le parcours", frise:"Frise", fmaths:"Fiches Mathématiques", fphys:"Fiches Physiques",
  finfo:"Fiches Informatiques", reperes:"Repères", approche:"Choisir son approche", code:"Le code", apropos:"À propos"};

/* ---------- routage ---------- */
function show(id){
  if(!TITLES[id]) id = 'accueil';
  $$('section.page').forEach(s => s.classList.toggle('on', s.id === 'p-'+id));
  $$('[data-go]').forEach(a => { if(a.closest('nav.main,aside.side')) a.classList.toggle('on', a.dataset.go === id); });
  document.title = 'IASite — ' + TITLES[id];
  window.scrollTo({top:0});
  buildToc(document.getElementById('p-'+id));
}

/* ---------- barre de navigation interne (collante) sur chaque page ---------- */
const TOC_H2_ONLY = ['p-fphys','p-fmaths','p-finfo'];   // pages dont la barre ne garde que les grandes parties (h2)
const TOC_SKIP = ['p-accueil','p-attention','p-dico','p-frise','p-approche'];   // accueil : page vitrine ; attention : barre propre ; dico, frise : filtres collants
function tocLabel(el){
  if(el.classList.contains('pgroup')){ const k = el.querySelector('.fk'), b = el.querySelector('.pgl b');
    return (k ? k.textContent.match(/\d+/)[0] + ' · ' : '') + (b ? b.textContent : ''); }
  const c = el.cloneNode(true); c.querySelectorAll('span,small,.fk,.tag').forEach(x => x.remove());
  let t = c.textContent.replace(/\s+/g,' ').trim();
  return t.length > 38 ? t.slice(0,36).replace(/\s\S*$/,'') + '…' : t;
}
function tocJump(el, nav){
  const off = 78 + (nav ? nav.offsetHeight : 0) + 14;
  window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - off, behavior:'smooth'});
}
function buildToc(sec){
  if(!sec || TOC_SKIP.includes(sec.id)) return;
  const old = sec.querySelector(':scope > .toc-nav'); if(old) old.remove();
  const inSec = el => !el.closest('.head,.modal,.toc-nav');
  const lvl1 = [...sec.querySelectorAll('h2, .famtitle, .pgroup')].filter(inSec);
  const all  = [...sec.querySelectorAll('h2, .famtitle, .pgroup, h3')].filter(el => inSec(el) && !(el.parentElement && el.parentElement.closest('.pgroup .lex, .famtitle')));
  let t;
  if(TOC_H2_ONLY.includes(sec.id)) t = all.filter(el => el.tagName === 'H2');
  else if(all.length <= 14) t = all;
  else {                                   // trop de titres : les grandes parties, plus les cartes situées avant la première
    const first = lvl1[0];
    t = all.filter(el => lvl1.includes(el) || (el.tagName === 'H3' && first && (first.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)));
  }
  if(t.length < 2) return;
  const nav = document.createElement('nav'); nav.className = 'pa-nav toc-nav';
  nav.innerHTML = t.map((el,i) => `<button type="button" data-toc="${i}">${tocLabel(el)}</button>`).join('');
  nav.addEventListener('click', e => { const b = e.target.closest('[data-toc]'); if(b) tocJump(t[+b.dataset.toc], nav); });
  const head = sec.querySelector(':scope > .head');
  head ? head.after(nav) : sec.prepend(nav);
}
function go(id){ if(location.hash.slice(1) === id) show(id); else location.hash = id; }
window.addEventListener('hashchange', () => show(location.hash.slice(1)));
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
  <div class="card" style="cursor:pointer" data-go="${p.range? 'parcours' : 'fondations'}">
    <div class="kicker">Planche ${p.n} / 5${p.range?` · étapes ${p.range[0]} à ${p.range[1]}`:''}</div>
    <h3>${p.t}</h3><p class="note" style="margin:0 0 8px">${p.s}</p>
    <span class="tag m">${p.rep}</span></div>`).join('');
/* Schéma d'ensemble animé : les 15 étapes sur une ligne, un point lumineux la parcourt */
(function(){
  const wrap = t => { const w = t.split(' '), lines = ['']; w.forEach(x => { const l = lines[lines.length-1]; if((l+' '+x).trim().length > 20 && l) lines.push(x); else lines[lines.length-1] = (l+' '+x).trim(); }); return lines.slice(0,2); };
  const g = STEPS.map((s,i)=>{ const x = 60 + i*(1380/14), top = i%2===0;
    const lab = wrap(s.t.split(/ :/)[0]); const y0 = top ? 104 - (lab.length-1)*16 : 200;
    return `<g data-step="${s.n}" style="cursor:pointer"><circle cx="${x}" cy="150" r="20" fill="${s.future?'#6941c6':'#1677b8'}" stroke="${s.future?'#d0b8ff':'#7fe6ff'}" stroke-width="2"/>
      <text x="${x}" y="156" text-anchor="middle" fill="#fff" font-size="15" font-weight="700">${s.n}</text>
      ${lab.map((l,k)=>`<text x="${x}" y="${y0+k*16}" text-anchor="middle" fill="#dfe9fb" font-size="13">${esc(l)}</text>`).join('')}</g>`; }).join('');
  $('#parcOverview').innerHTML = `<svg viewBox="0 0 1500 260" font-family="Outfit,system-ui,sans-serif">
    <path id="parcLine" d="M60 150 H1440" stroke="#3dd8ff" stroke-opacity=".5" stroke-width="3"/>
    <circle r="7" fill="#fff"><animateMotion dur="9s" repeatCount="indefinite"><mpath href="#parcLine"/></animateMotion></circle>
    ${g}<text x="750" y="250" text-anchor="middle" fill="#93a8cb" font-size="13">Cliquez sur une étape pour ouvrir sa fiche</text></svg>`;
  document.addEventListener('click', e => { const c = e.target.closest('[data-scroll]'); if(c){ const t = document.getElementById(c.dataset.scroll); if(t) t.scrollIntoView({behavior:'smooth', block:'start'}); } });
})();
$('#allPlanches').innerHTML = PLANCHES.map(p => `<div class="pgroup" id="pg-${p.n}">
  <div class="pghead"><div class="pgl"><span class="fk">Planche ${p.n} / 5${p.range?` · étapes ${p.range[0]} à ${p.range[1]}`:''}</span><b>${p.t}</b><span class="pgs">${p.s}</span></div>
  <div class="pgr">Repère <b class="c-go">${p.rep}</b><a data-go="${p.go}">chapitre illustré →</a></div></div>` +
  (p.range ? `<div class="lex">` + STEPS.filter(s=>s.n>=p.range[0]&&s.n<=p.range[1]).map(stepCard).join('') + `</div>` : '') + `</div>`).join('');

/* ---------- fiche modale ---------- */
let curStep = null;
function openStep(n){
  const s = STEPS.find(x => x.n === n); if(!s) return;
  curStep = n;
  const p = PLANCHES.find(p => p.range && n>=p.range[0] && n<=p.range[1]);
  $('#fiche').innerHTML = `<button class="x" title="Fermer (Échap)">✕</button>
    <div class="kicker">Planche ${p.n} · ${p.t} · étape ${n} / 15</div>
    <h1 style="font-size:1.9rem">${s.t}</h1>
    ${s.future?'<div class="rig" style="border-color:var(--vi);background:rgba(169,139,255,.08)">Étape non exécutée avec micro_gpt.py : elle se pratique sur un modèle ouvert de 1 à 3 milliards de réglages, déjà pré-entraîné selon les étapes 1 à 13.</div>':''}
    <div class="fsec why"><h4>Pourquoi</h4><p>${s.why}</p></div>
    <div class="fsec what"><h4>Ce qui se passe</h4><ul>${s.what.map(w=>`<li>${w}</li>`).join('')}</ul></div>
    <div class="fsec io"><h4>Entrée → sortie</h4><div class="iobox"><span>${s.io[0]}</span><em>→</em><span>${s.io[1]}</span></div></div>
    <div class="grid g2"><div class="fsec math"><h4>Le lien avec les maths</h4><p>${s.math}</p></div>
    <div class="fsec info"><h4>Côté informatique</h4><p>${s.info}</p></div></div>
    ${s.rig?`<div class="rig"><b>Point de rigueur.</b> ${s.rig}</div>`:''}
    <div class="fsec rep"><h4>${s.obs?'Repère observé':(s.future?'Repère attendu':'Repère')}</h4><span class="repbox">${s.rep}</span></div>
    <div class="nav"><button class="btn" data-nav="-1" ${n===1?'disabled style="opacity:.3"':''}>← Étape ${n-1}</button>
      <button class="btn" data-go="${p.go}">Voir la planche</button>
      <button class="btn" data-nav="1" ${n===15?'disabled style="opacity:.3"':''}>Étape ${n+1} →</button></div>`;
  $('#modal').classList.add('on');
  $('#modal').scrollTop = 0;
}
function closeModal(){ $('#modal').classList.remove('on'); curStep = null; }
$('#modal').addEventListener('click', e => {
  if(e.target.id === 'modal' || e.target.closest('.x')) closeModal();
  const nv = e.target.closest('[data-nav]'); if(nv && curStep) openStep(curStep + +nv.dataset.nav);
});
function closeAll(){ closeModal(); closeSearch(); }

/* ---------- apprentissage : vérifications, vitesse, perte ---------- */
$('#checks').innerHTML = CHECKS.map((c,i)=>`<div style="display:flex;gap:12px;align-items:flex-start;margin:7px 0">
  <span style="flex:none;width:14px;height:14px;margin-top:5px;border-radius:50%;background:#3ee0a1;box-shadow:0 0 10px #3ee0a1"></span>
  <div><b>${i+1}. ${c[0]}</b><br><span class="note">${c[1]}</span></div></div>`).join('');
(function(){
  const groups = [[0,1],[2,3],[4,5]];
  $('#speedbars').innerHTML = groups.map(([a,b])=>{
    const max = SPEED[a][2];
    return `<div style="margin:10px 0 4px;color:var(--mut);font-size:.85rem">${SPEED[a][0]}</div>` + [a,b].map(i=>
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
$('#physCards').innerHTML = PHYS.map(p=>`<div class="card"><h3 class="${p[1]}">${p[0]}</h3><div class="formula">${p[2]}</div><p>${p[3]}</p></div>`).join('');
$('#approchCards').innerHTML = APPROCHES.map((a,i)=>`<div class="card${i===0?' hl':''}"><div class="kicker ${a[1]}">${i+1} / 4</div><h3 class="${a[1]}">${a[0]}</h3><p><b>${a[2]}</b><br><span class="note">${a[3]}</span></p><p class="note">Exemple : ${a[4]}</p></div>`).join('');
$('#codeSections').innerHTML = CODESECS.map(c=>`<div class="card"><h3 class="mono c-cy">${c[0]}</h3><p class="note" style="margin:0">${c[1]}</p></div>`).join('');
$('#repTable').innerHTML = `<tr><th>Étape</th><th>Ce qu’on obtient</th><th>Repère</th></tr>` +
  STEPS.map(s=>`<tr data-step="${s.n}" style="cursor:pointer"><td class="num">${s.n}</td><td>${s.t}<br><span class="note">${s.io[1]}</span></td><td class="num" style="white-space:normal;color:${s.future?'#d6c8ff':'#ffd2b0'}">${s.rep}</td></tr>`).join('');
$('#rigList').innerHTML = STEPS.filter(s=>s.rig).map(s=>`<div class="rig" data-step="${s.n}" style="cursor:pointer"><b>Étape ${s.n} · ${s.t}.</b> ${s.rig}</div>`).join('');

/* ---------- frise ---------- */
const MONTHS = {janv:1,'févr':2,mars:3,avr:4,mai:5,juin:6,juil:7,'août':8,sept:9,oct:10,nov:11,'déc':12,'début':0.5};
function yKey(s){
  const m = s.replace('−','-').match(/-?\d{3,4}/); let y = m ? +m[0] : 0;
  for(const k in MONTHS) if(s.includes(k)) { y += MONTHS[k]/13; break; }
  return y;
}
const ERAS = [[-1e9,"Des probabilités à Boltzmann"],[1900,"Le hasard entre dans la physique"],[1943,"Neurones formels, hivers et physique statistique"],[2000,"L’apprentissage profond"],[2017,"Transformers, LLM et agents"]];
function friseHTML(theme, eras){
  const items = FRISE.map((f,i)=>({f,k:yKey(f[0])+i*1e-6})).filter(o=>theme==='all'||o.f[1]===theme).sort((a,b)=>a.k-b.k);
  let html = '', era = -1;
  items.forEach(({f,k})=>{
    if(eras){ let e = ERAS.filter(x=>k>=x[0]).length-1; if(e!==era){ era=e; html += `<div class="era">${ERAS[e][1]}</div>`; } }
    const [lab,col] = THEMES[f[1]];
    html += `<div class="ev${f[2]===2?' s2':''}" style="--c:${col}"><span class="y">${f[0]}</span><span class="th">${lab}</span><span class="st">${['☆','★','★★'][f[2]]}</span>${f[3]}</div>`;
  });
  return html;
}
$$('[data-frise]').forEach(c => c.innerHTML = friseHTML(c.dataset.frise, false));
let friseTheme = 'all';
function drawFrise(){
  $('#friseChips').innerHTML = `<button class="chip${friseTheme==='all'?' on':''}" data-th="all">Tout (${FRISE.length})</button>` +
    Object.entries(THEMES).map(([k,[l,c]])=>`<button class="chip${friseTheme===k?' on':''}" data-th="${k}"><i style="background:${c}"></i>${l}</button>`).join('');
  $('#friseAll').innerHTML = friseHTML(friseTheme, friseTheme==='all');
}
$('#friseChips').addEventListener('click', e=>{ const b=e.target.closest('[data-th]'); if(b){ friseTheme=b.dataset.th; drawFrise(); }});
drawFrise();

/* ---------- lexique ---------- */
const DOM = {m:['m','maths'],p:['p','physique'],i:['i','info'],a:['a','IA']};
function etapesLinks(e){ return e.replace(/\b(1[0-5]|[1-9])\b/g, n => `<span data-step="${n}" style="text-decoration:underline dotted;cursor:pointer">${n}</span>`); }
function lexCard(l){
  return `<div class="lx"><h4>${l[0]}</h4><p>${l[3]}</p>
    <div>${[...l[2]].map(d=>`<span class="tag ${DOM[d][0]}">${DOM[d][1]}</span>`).join('')}<span class="et">étape ${etapesLinks(l[4])}</span></div></div>`;
}
function lexGrouped(list){
  const by = {}; list.forEach(l => (by[l[1]] = by[l[1]] || []).push(l));
  return '<div class="lex">' + Object.keys(FAMS).filter(f=>by[f]).map(f=>`<div class="famtitle">${FAMS[f]}<span>${by[f].length} notion${by[f].length>1?'s':''}</span></div>${by[f].map(lexCard).join('')}`).join('') + '</div>';
}
let dicoFam = 'all';
const norm = s => strip(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function drawDico(){
  const q = norm($('#dicoQ').value.trim());
  const list = LEX.filter(l => (dicoFam==='all'||l[1]===dicoFam) && (!q || norm(l[0]+' '+l[3]).includes(q)));
  $('#dicoCount').textContent = `${list.length} notion${list.length>1?'s':''} sur ${LEX.length}`;
  $('#dicoFam').innerHTML = `<button class="chip${dicoFam==='all'?' on':''}" data-f="all">Toutes les familles</button>` +
    Object.entries(FAMS).map(([k,v])=>`<button class="chip${dicoFam===k?' on':''}" data-f="${k}">${v}</button>`).join('');
  $('#dicoList').innerHTML = list.length ? lexGrouped(list) : '<p class="note">Aucune notion ne correspond.</p>';
}
$('#dicoQ').addEventListener('input', drawDico);
$('#dicoFam').addEventListener('click', e=>{ const b=e.target.closest('[data-f]'); if(b){ dicoFam=b.dataset.f; drawDico(); }});
drawDico();

$$('[data-domain]').forEach(c=>{
  const d = c.dataset.domain;
  let top = '';
  if(d==='m') top = `<div class="sectitle"><h2>Les étapes</h2><span>le lien avec les maths de chaque fiche</span></div><div class="grid g3">${STEPS.map(s=>`<div class="card" data-step="${s.n}" style="cursor:pointer"><div class="kicker">Étape ${s.n}</div><h3>${s.t}</h3><p class="note" style="margin:0">${s.math}</p></div>`).join('')}</div>`;
  if(d==='i') top = `<div class="sectitle"><h2>Les étapes</h2><span>le côté informatique de chaque fiche</span></div><div class="grid g3">${STEPS.map(s=>`<div class="card" data-step="${s.n}" style="cursor:pointer"><div class="kicker" style="color:var(--gr)">Étape ${s.n}</div><h3>${s.t}</h3><p class="note" style="margin:0">${s.info}</p></div>`).join('')}</div>`;
  if(d==='p') top = `<div class="sectitle"><h2>Formules de la Physique</h2><span>de la physique au micro-GPT</span></div><div class="grid g3">${PHYS.map(p=>`<div class="card"><h3 class="${p[1]}">${p[0]}</h3><div class="formula">${p[2]}</div><p class="note" style="margin:0">${p[3]}</p></div>`).join('')}</div>`;
  c.innerHTML = top + `<div class="sectitle"><h2>${d==='p'?'Notions':'Les notions'}</h2></div>` + lexGrouped(LEX.filter(l=>l[2].includes(d)));
});

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
  const raw = $('#sq').value.trim(), q = norm(raw);
  if(q.length<2){ $('#sres').innerHTML=''; return; }
  const words = q.split(/\s+/);
  const hits = IDX.map(it=>{ const n = norm(it.t+' '+it.txt); if(!words.every(w=>n.includes(w))) return null;
      let sc = norm(it.t).includes(words[0]) ? 10 : 0; if(it.step) sc += 2; return {it,sc}; })
    .filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,40);
  const hl = s => { let h = esc(s); words.forEach(w=>{ if(w.length<2) return;
      const re = new RegExp('('+[...w].map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('')+')','ig'); h = h.replace(re,'<mark>$1</mark>'); }); return h; };
  $('#sres').innerHTML = hits.length ? hits.map(({it})=> it.step ? `<a data-step="${it.step}">${hl(it.t)}<small>${it.s}</small></a>`
      : `<a data-sgo="${it.go}" data-q="${esc(it.q||'')}" data-pa="${it.pa||''}">${hl(it.t.length>140?it.t.slice(0,140)+'…':it.t)}<small>${esc(it.s)}</small></a>`).join('')
    : '<p class="note">Aucun résultat.</p>';
});
$('#sres').addEventListener('click', e=>{
  const a = e.target.closest('[data-sgo]'); if(!a) return;
  closeSearch(); go(a.dataset.sgo);
  if(a.dataset.pa) setTimeout(()=>$('#pa-e'+a.dataset.pa).scrollIntoView({block:'start'}),60);
  if(a.dataset.sgo==='dico' && a.dataset.q){ dicoFam='all'; $('#dicoQ').value=a.dataset.q; drawDico(); }
});
document.addEventListener('keydown', e=>{
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if(e.key==='Escape'){ closeAll(); return; }
  if(e.key==='/' && !typing){ e.preventDefault(); openSearch(); return; }
  if(curStep && !typing){ if(e.key==='ArrowRight' && curStep<15) openStep(curStep+1); if(e.key==='ArrowLeft' && curStep>1) openStep(curStep-1); }
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
  $('#bpeToks').innerHTML = toks.map(t=>`<span style="background:hsla(${hue(t)},70%,55%,.22);border:1px solid hsla(${hue(t)},70%,60%,.45)">${esc(t.replace(/ /g,'␣'))}</span>`).join('');
  const chars = [...text].length;
  $('#bpeInfo').innerHTML = `${chars} caractères → <b style="color:#fff">${toks.length} tokens</b> (${fr(chars/Math.max(1,toks.length),2)} caractères par token) · ${merges.length} fusion${merges.length>1?'s':''} apprise${merges.length>1?'s':''}`;
  $('#bpeMerges').innerHTML = merges.length ? 'Fusions : ' + merges.map((m,i)=>`<span class="mono">${i+1}. ${esc((m[0]+'+'+m[1]).replace(/ /g,'␣'))} ×${m[2]}</span>`).join(' · ') : 'Aucune fusion : chaque caractère est un token.';
}
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
  q('#pa-nav').addEventListener('click', e => { const b = e.target.closest('[data-pa]'); if(b) tocJump(q('#pa-e'+b.dataset.pa), q('#pa-nav')); });

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
  const quiz = q('#pa-quiz');
  const drawQuiz = () => { score = 0; done = 0; q('#pa-score').textContent = '';
    quiz.innerHTML = Q.map((x,i) => `<div class="pa-q" id="pa-q${i}"><b>${i+1}. ${x.q}</b><div class="pa-opts">${x.o.map((o,j) => `<button type="button" data-q="${i}" data-j="${j}">${o}</button>`).join('')}</div><div class="note pa-why" hidden></div></div>`).join('') +
      '<div class="row"><button class="btn" type="button" id="pa-again">Recommencer le quiz</button></div>'; };
  quiz.addEventListener('click', e => {
    if(e.target.id === 'pa-again'){ drawQuiz(); return; }
    const b = e.target.closest('button[data-q]'); if(!b) return;
    const i = +b.dataset.q, j = +b.dataset.j, box = q('#pa-q'+i);
    if(box.dataset.done) return; box.dataset.done = 1;
    box.querySelectorAll('button').forEach((bt,k) => { bt.disabled = true; if(k === Q[i].a) bt.classList.add('good'); });
    if(j !== Q[i].a) b.classList.add('bad'); else score++;
    const w = box.querySelector('.pa-why'); w.hidden = false; w.textContent = (j === Q[i].a ? 'Exact. ' : 'Pas tout à fait. ') + Q[i].w;
    done++; q('#pa-score').textContent = 'Score : ' + score + ' / ' + done + (done === Q.length ? (score === Q.length ? ' · parcours maîtrisé' : ' · relis les étapes des questions manquées') : '');
  });
  drawQuiz();

  /* recherche */
  const PA_STEPS = ['Un LLM prédit le mot suivant','Des mots aux vecteurs : tokenisation, embedding, d_model','L’idée de l’attention : donner des poids aux mots, Q K V bibliothèque','Q, K, V : le calcul complet, produit scalaire, division par √d','Softmax : transformer des scores en poids, exponentielle','Le masque causal : GPT ne doit pas voir le futur, BERT bidirectionnel','Plusieurs têtes d’attention, d_head, concaténation, W_O','Les couches, puis quiz de fin de parcours'];
  PA_STEPS.forEach((t,i) => IDX.push({t:`Attention · étape ${i+1} · ${t}`, s:'Parcours LLM : comprendre l’attention', txt:t, go:'attention', pa:i+1}));
})();

show(location.hash.slice(1) || 'accueil');
