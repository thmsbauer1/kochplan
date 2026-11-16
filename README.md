# Kochplan

Essensplanung der Familie: Wochenplan, Einkaufszettel, Sonntags-Vorbereitung, „Heute“-Ansicht und eigene Rezepte.
Läuft unter `https://thmsbauer1.github.io/kochplan/`. Anmeldung mit dem eigenen Konto des Familienspeichers (wie Lern-Match, Spürnase, Lernweg).

## Wochenrhythmus

- **Do/Fr – planen:** Kochtage an- und abwählen (Mo–Fr vorbelegt, Wochenende flexibel), „Woche vorschlagen“, einzelne Tage tauschen. Ab Donnerstag zeigt die App automatisch die nächste Woche.
- **Philip wählt:** Er sucht für einen Tag eins von drei kinderfreundlichen Gerichten aus (⭐, bleibt beim Neu-Mischen).
- **Sa – einkaufen:** Zettel nach REWE-Abteilungen, gemeinsam abhaken (Abgleich alle 10 Sekunden), Vorrat prüfen, Extras dazuschreiben. „Teilen/kopieren“ für Picnic oder WhatsApp.
- **So – vorbereiten:** Was sich vorbereiten lässt, zusammengefasst (z. B. Reis für zwei Gerichte auf einmal). Was nicht bis zum Kochtag hält, steht unter „Unter der Woche“.
- **Abends – Heute:** Rezept mit Mengen, Philips Job (Kochmützen), Bewertung 👍/👎.

## Vorschläge

Jeder Kochtag bekommt das Gericht mit der besten Passung: gemeinsame frische Zutaten mit dem Rest der Woche, Mischung (gut die Hälfte vegetarisch, etwa ein Drittel Fisch/Garnelen, höchstens einmal Geflügel), verschiedene Arten (nicht zwei Currys), unter der Woche höchstens 40 Minuten, keine Gerichte der letzten zwei Wochen, eure Bewertungen. Gerichte mit zwei oder mehr 👎 werden nicht mehr vorgeschlagen.

- **🍱 Mittagsbox:** +1 Portion am Abend, Einkaufsmengen werden mit hochgerechnet.
- **„+ Hähnchen für 2“:** einige vegetarische Gerichte haben einen Zusatz für die Fleischesser.

## Dateien

- `index.html` – die App
- `rezepte.js` – Grundstock (45 Gerichte, Mengen für 3 Portionen). Format steht oben in der Datei.
- `naehrwerte.js` – ungefähre kcal je 100 g der Zutaten. Daraus rechnet die App kcal je Portion und je 100 g fertiges Gericht (Einschätzung, etwa ±15 %). Eltern sehen die Kalorien, Philip nicht.
- `familie-sync.js` – Anmeldung, in allen Repos gleich

## Rezept aus Fotos

Unter Rezepte → „📷 Foto“ (oder im Formular „Eigenes Rezept“): bis zu 4 Fotos von einer Kochbuchseite, einem Zettel oder einem Bildschirmfoto – oder von Zutaten, dann gibt es einen Vorschlag.
Die Edge Function `rezept-foto` (Quelltext in `supabase/functions/rezept-foto/`) liest die Fotos mit Claude, rechnet auf 3 Portionen um und liefert Abteilung und ungefähre kcal je Zutat.
Das Formular wird vorausgefüllt und erst nach dem Prüfen gespeichert. Nur für angemeldete Familienmitglieder, höchstens 20 Mal am Tag je Person.
Nutzt das Secret `ANTHROPIC_API_KEY` im Familienspeicher (derselbe Schlüssel wie der Rechtschreib-Tie-Break).

## Familienspeicher (Supabase)

- `meal_weeks` – Wochenplan je Familie und Woche (Montag). Jeder Eintrag (Tag, Häkchen) hat einen Zeitstempel; beim Abgleich gewinnt je Eintrag der neuere. So können zwei Handys gleichzeitig abhaken.
- `meal_recipes` – eigene Rezepte (alle aus der Familie dürfen anlegen und ändern; löschen Ersteller oder Eltern)
- `meal_ratings` – 👍/👎 je Mitglied und Gericht

Ohne Anmeldung läuft alles nur auf dem Handy. Nach der Anmeldung wird der lokale Plan in den Familienspeicher übernommen.
