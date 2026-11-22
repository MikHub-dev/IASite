# IASite

Cinquième site de la famille FamZakSites, sur le modèle de QuantumSite : le parcours IA de A à Z et le savoir qui se cache derrière, du micro-GPT de 1,3 million de réglages jusqu'à l'agent qui utilise des outils via le MCP.

## Contenu

- **Fondations** : GPT, la fiche produit, le Transformer en une page.
- **Le parcours en 15 étapes** : du texte brut au modèle qui écrit (étapes 1 à 13, réalisées et mesurées avec `micro_gpt.py`), puis à l'assistant et à l'agent (étapes 14 et 15).
- **Chapitres illustrés** : données et tokens, le réseau, apprentissage, génération, assistant, agents et MCP, physique et hasard, échelles.
- **Ressources** : frise historique, fiches mathématiques, physiques et informatiques, dictionnaire de 143 notions, repères chiffrés, choix d'une approche selon le volume de données, extraits du code.
- **Parcours LLM : comprendre l'attention** (8 étapes, calculateur Q·K·V, softmax, masque causal, têtes, quiz).
- **Ateliers** : tokenisation BPE, compteur de réglages, température et top-p, budget LoRA.

## Navigation

- Barre du haut : les chapitres du parcours, des fondations aux agents, plus Dictionnaire et Ateliers.
- Barre latérale : les ressources transversales (frise, parcours en 15 étapes, fiches par discipline, repères, approche, code, parcours de l'attention).
- Les pages défilent verticalement. Un clic sur une étape ouvre sa fiche ; dans une fiche, ← → passent d'une étape à l'autre. Touche `/` : rechercher (étapes, notions, frise et texte de toutes les pages ; un résultat ouvre la page sur le bon passage). Échap : fermer.
- Dans les listes groupées (dictionnaire, fiches, parcours), le titre de chaque famille est une vignette placée dans la grille, pour que les familles s'enchaînent sans couper la ligne. Les frises restent en liste verticale.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Le site complet, en un seul fichier autonome (généré). |
| `src/1_head.html` | En-tête et feuille de style. |
| `src/2_body.html` | Les pages du site. |
| `src/3_app.js` | Données (étapes, lexique, frise…), navigation, recherche, ateliers et parcours de l'attention. |
| `src/4_tail.html` | Fin du document. |
| `build.sh` | Reconstruit `index.html` à partir de `src/`. |
| `robots.txt` | Interdit l'indexation, comme sur le portail (la balise `meta robots` de `index.html` fait de même). |

Après une modification dans `src/`, lancer `./build.sh` puis committer `index.html`.

## Sources

Projet « IA Level 1 » : *Micro-GPT en 15 étapes : le schéma*, *parcours_micro_gpt.docx*, *Micro-GPT : les notions du parcours et à quoi elles servent*, l'export de la conversation « Construire une IA, du micro-GPT au MCP », *Quelle approche IA selon le volume de données ?* et *Parcours LLM : comprendre l'attention*.
