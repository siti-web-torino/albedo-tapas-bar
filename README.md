# Albedo · Tapas Bar

Sito a pagina unica per Albedo, tapas bar nel quartiere Vanchiglia a Torino. Presenta tapas, drink e Sunday Brunch e rimanda a WhatsApp per le prenotazioni.

## Anteprima e pubblicazione

Il sito è statico. `index.html` e la cartella `assets/` contengono tutto quello che serve per servirlo. Con Node.js puoi aprire un’anteprima locale eseguendo questo comando dalla cartella del progetto.

```sh
npx --yes serve .
```

Per GitHub Pages si può scegliere **Deploy from a branch** in **Settings → Pages**, selezionando `main` e `/(root)`. I collegamenti relativi funzionano anche quando il sito è servito sotto il percorso della repository.

## Aggiornamenti

- `index.html` contiene il testo, i contatti e gli orari. Aggiorna sia la tabella con gli attributi `data-opens` e `data-closes` sia i dati strutturati se cambia l’orario.
- `assets/site.js` calcola lo stato di apertura nel fuso di Torino, gestisce i turni che terminano dopo mezzanotte e abilita i filtri, il carosello e le animazioni. Le informazioni e i link restano disponibili anche con JavaScript disattivato.
- `src/site.css` è il sorgente Tailwind. Esegui `npm ci` e `npm run build` per rigenerare `assets/site.css`, che è incluso nella repository.

## Contenuti e immagini

Logo e locandina del Sunday Brunch provengono dagli allegati. Il punteggio, il numero di recensioni e gli estratti attribuiti nel carosello provengono dalla scheda Google Maps di Albedo, consultata il 6 novembre 2026. Il sito collega alla scheda per leggere i commenti completi.

Le fotografie illustrative sono state generate per il sito e contrassegnate nella pagina. Le scene richieste per gli asset erano un brindisi su una tavola bordeaux, un piatto di crocchette, una ciotola di gazpacho e una coppia di calici di vino e cocktail. Le foto possono essere sostituite conservando i nomi dei file in `assets/` e aggiornando le descrizioni alternative in `index.html`.

DM Sans, Playfair Display e Space Grotesk sono ospitati localmente. Le licenze sono in `assets/font-licenses/`.
