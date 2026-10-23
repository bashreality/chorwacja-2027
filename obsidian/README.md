# Notatki dla Obsidiana

Pliki `.md` w tym folderze powstaja automatycznie z planera (`index.html`).
Po kazdym pushu do `main` GitHub Action (`.github/workflows/obsidian.yml`)
uruchamia `node scripts/build-obsidian.mjs` i commituje zmiany.

Nie edytuj tych plikow recznie — zostana nadpisane. Wlasne notatki trzymaj
poza repo albo w innym folderze sejfu.

## Jednorazowa konfiguracja na komputerze

1. Sklonuj repo do folderu sejfu, np.
   `git clone https://github.com/bashreality/chorwacja-2027.git "<sejf>/Chorwacja 2027"`
   (na Windowsie najprosciej przez GitHub Desktop: File → Clone repository, wskaz folder w sejfie).
2. W Obsidianie: Ustawienia → Wtyczki spolecznosci → Przegladaj → **Git** (autor Vinzent) → Zainstaluj → Wlacz.
3. Ustawienia wtyczki Git:
   - **Auto pull interval (minutes)**: `10`
   - **Pull on startup**: wlaczone
   - Auto commit / auto push: zostaw wylaczone (sejf tylko czyta repo).
4. Otworz notatke **Chorwacja 2027** — to spis wszystkich dni z linkami.

Jesli klon repo jest podfolderem wiekszego sejfu, ktory sam nie jest repo git,
otworz ten podfolder jako osobny sejf albo uzyj w wtyczce Git opcji
„Custom base path” ustawionej na ten folder.
