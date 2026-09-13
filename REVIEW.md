# San — Reste à faire

Suivi des points relevés lors de la revue du lot "moteur de jeu" (phases de tour, effets de
cartes, piste Virus). Tous les points relevés ont été traités directement (voir git log) :
suppression de `LocationType.Box` (les cartes Utilisation Unique sont maintenant retirées de la
partie via `deleteItems`, comme l'effet "Détruire une carte"), détermination du premier joueur
(`SanSetup.determineStartingPlayer`, rules p.5), placement du pion Virus sur la première case du
joueur qui commence plutôt qu'au centre (rules p.5), alignement de `VirusTrackLocator.topVirusChips`
sur `SanRule.virusChips` (pile vide → `0`), fin de partie déclenchée quand la Réserve se vide
pendant une corruption, et détermination du vainqueur pour la plateforme via `CompetitiveRank`
(voir détails ci-dessous). Il n'y a rien en attente pour l'instant.

## Traité — fin de partie (rules p.22)

- **Détermination du vainqueur pour la plateforme.** `SanRules` implémente maintenant
  `CompetitiveRank<...>` (`@gamepark/rules-api`) : `rankPlayers(a, b)` appelle
  `victoryOutcome(this)` (`rules/src/rules/helper/victory.ts`), qui déduit **à la demande** qui a
  gagné et pourquoi, depuis l'état final du plateau — rien n'est mémorisé pendant la partie. Les
  trois conditions de victoire immédiates mettent fin à la partie dès qu'elles sont remplies
  (`SanRules.afterItemMove`), donc elles sont mutuellement exclusives avec le cas Réserve vide : une
  fois la partie terminée, si aucune des trois n'est vérifiée dans l'état, c'est forcément la Réserve
  qui a causé la fin de partie.
  - Corruption / Propagande : on cherche lequel des deux joueurs a atteint le seuil dans l'état final
    (12 cartes corrompues, ou bannière en bout de piste).
  - Hacking : on cherche lequel des deux a la pile Virus vide — le vainqueur est l'adversaire
    (`otherCorporation()`, nouveau helper dans `Corporation.ts`), puisque c'est sa pile à lui qui
    vient d'être vidée par l'adversaire.
  - Réserve vide (rules p.22 : *« la Corporation la plus avancée sur au moins deux des trois
    conditions de victoire gagne, sinon égalité »*) : seul cas qui demande un vrai calcul
    (`reserveTieBreak`, dans le même fichier), en s'inspirant du style `rankPlayers` des projets
    voisins (`gatsby`, `rival-cities`, `bloody-grove` : chaque critère est une fonction nommée et
    documentée). À la différence de leur cascade à priorité stricte (le critère suivant ne compte
    que si le précédent est exactement à égalité), la règle p.22 est un **vote à la majorité** sur 3
    critères indépendants (`corruptionProgress` / `propagandaProgress` / `hackingProgress`) — une
    cascade classique aurait donné un résultat différent, et faux. L'avancement Hacking combine le
    nombre de cartes Virus adverses déjà retirées (poids dominant) et la position courante du pion
    sur la carte Virus adverse en cours (départage fin).
  - `VictoryOutcome` (`{ winner: Corporation | 0, type: VictoryType }`) est le seul type public
    exposé ; `VictoryType` (`rules/src/rules/VictoryType.ts`) vit à part pour être importable côté
    app sans tirer toute la logique de calcul.

- **Fin de partie sur Réserve vide pendant une corruption.** `PlayCardsRule.afterItemMove` (cas
  `CorruptionZone`) appelle maintenant `[this.endGame()]` quand la Réserve est vide, comme
  `BuyCardsRule.afterItemMove` (cas `Discard`) le fait déjà, au lieu de ne rien faire.

- **Message de fin de partie côté app.** `app/src/headers/GameOverHeader.tsx` appelle
  `victoryOutcome(rules)` (même fonction que `rankPlayers`, importée depuis
  `@gamepark/san/rules/helper/victory`) et affiche « Vous remportez la partie par
  Corruption/Propagande/Hacking ! », « {Corporation} remporte la partie par ... ! », ou
  « Égalité ! ». Branché via `Scoring.ts` (`ScoringDescription.ResultHeader`, passé au `GameProvider`
  dans `main.tsx`) plutôt que la prop `MaterialHeader.GameOver` (dépréciée) — ce chemin est lu à la
  fois par le bandeau d'en-tête et par la pop-up "Result" de fin de partie, qui affichaient sinon deux
  textes différents. `getScoringKeys` renvoie `[]` (San n'a pas de score chiffré, juste
  `CompetitiveRank`), donc la pop-up n'affiche pas de colonnes de score en plus. Traductions ajoutées
  dans `fr.json` uniquement (langue du développeur, cf. workflow de traduction dans `CLAUDE.md`) ;
  `GameOverHeader` testé en direct dans le navigateur pour les 4 cas (victoire perso, victoire
  adverse, Hacking, égalité) avant ce passage à une dérivation sans mémoire.

  *Première version :* le vainqueur et le type de victoire avaient d'abord été mémorisés
  (`Memory.Winner` / `Memory.VictoryType`, deux clés globales, pas par joueur) à chacun des 4 points
  de fin de partie. Simplifié ensuite : comme les 4 façons de terminer la partie sont mutuellement
  exclusives par construction, tout se déduit de l'état final sans rien stocker — un seul endroit
  (`victoryOutcome`) porte la logique, au lieu de 4 sites d'écriture à tenir synchronisés.
