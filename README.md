# Maison Glow – Beauty Atelier (Demo-Website)

Eine animierte One-Page-Website für ein Beauty-Studio. Reines HTML, CSS und JavaScript – kein Build-Tool, keine Installation nötig.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Die komplette Seite (alle Texte, Preise, Bereiche) |
| `style.css` | Design, Farben, Animationen, Handy-Ansicht |
| `script.js` | Reiter, Maus-Effekt, Terminbuchung, Ersatz-Animationen für ältere Browser |
| `favicon.svg` | Symbol im Browser-Tab |

## Auf GitHub Pages veröffentlichen

1. Auf GitHub ein neues Repository anlegen (z. B. `maison-glow`), Sichtbarkeit **Public**.
2. **Add file → Upload files** und alle vier Dateien hochladen (direkt ins Hauptverzeichnis, nicht in einen Unterordner).
3. **Settings → Pages** öffnen, bei *Source* „Deploy from a branch“ wählen, Branch `main` und Ordner `/ (root)`, dann **Save**.
4. Nach 1–2 Minuten ist die Seite erreichbar unter `https://DEIN-NAME.github.io/maison-glow/`.

Lokal ansehen: einfach `index.html` im Browser öffnen.

## Anpassen

- **Name, Texte, Preise:** direkt in `index.html` ändern. Die Preise stehen in den `data-price`-Attributen **und** im sichtbaren Text – beides ändern, damit die Buchung dieselben Preise zeigt.
- **Farben:** oben in `style.css` unter `:root` (z. B. `--rose`, `--ink`, `--blush`).
- **Öffnungszeiten der Buchung:** in `script.js` bei `HOURS` (Minuten ab Mitternacht, z. B. 540 = 9:00 Uhr).
- **Platzhalter** wie `[Straße Nr.]`, `[Telefon]`, `[E-Mail]` im Kontaktbereich ersetzen.

## Wichtig vor dem echten Einsatz

- **Demo:** Name, Preise und Zeiten sind Beispiele. Die Terminbuchung verschickt nichts – für echte Anfragen muss sie an ein Buchungssystem oder einen Formular-Dienst angebunden werden.
- **Impressum & Datenschutz:** In Deutschland Pflicht. Die Links im Footer zeigen noch ins Leere.
- **Google Fonts:** Die Schriften werden von Google geladen. Für eine echte Kundenseite in Deutschland besser die Schriften selbst hosten (Datenschutz/DSGVO).

## Browser

Die Scroll-Animationen (Text füllt sich, Karten gleiten seitwärts, Fortschrittsbalken) laufen in aktuellen Chrome-, Edge- und Safari-Versionen. In anderen Browsern erscheinen die Bereiche stattdessen mit einer einfachen Einblend-Animation, und die Karten lassen sich seitlich wischen.
