# Chorwacja 2027 — zasady dla Claude

- Planer to jeden plik `index.html` (dane w JS: `D`, `M`, `PRZ`, `NOC`, `WYC`).
- Folder `obsidian/` to notatki Markdown dla Obsidiana generowane z planera.
  **Po każdej zmianie `index.html` uruchom `node scripts/build-obsidian.mjs`
  i dodaj zmienione pliki `obsidian/*.md` do tego samego commita.**
  Nie edytuj `obsidian/*.md` ręcznie.
- Jeśli dodajesz nową strukturę danych w `index.html`, rozszerz skrypt, żeby trafiła też do notatek.
