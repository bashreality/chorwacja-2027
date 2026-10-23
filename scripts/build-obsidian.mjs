// Generuje notatki Markdown dla Obsidiana z danych planera (index.html).
// Uruchom: node scripts/build-obsidian.mjs  -> pliki w folderze obsidian/
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const outDir = join(root, 'obsidian');

// --- dane: od "const D=[" do mapy zdjec ---
const start = html.indexOf('const D=[');
const end = html.indexOf('const PHOTOS=');
if (start < 0 || end < 0) throw new Error('Nie znaleziono danych D / PHOTOS w index.html');
const ctx = {};
vm.runInNewContext(html.slice(start, end) + '\n;globalThis.__=({D,M,PRZ,NOC,WYC:typeof WYC!=="undefined"?WYC:{}});', ctx);
const { D, M, PRZ, NOC, WYC } = ctx.__;

// --- sekcja "Wiecej" (statyczny HTML w renderMore) ---
const moreMatch = html.match(/getElementById\('s-more'\)\.innerHTML=`([\s\S]*?)`;/);
const moreHtml = moreMatch ? moreMatch[1] : '';

const strip = (s = '') => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&mdash;/g, '—').replace(/&rarr;/g, '→').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
const esc = (s = '') => strip(s).replace(/\s*\|\s*/g, ' · ');
const dayHead = (day) => `Dzien ${day.id} · ${strip(day.t).replace(/[#|^[\]]/g, '')}`;

function listBlock(icon, block) {
  if (!block) return '';
  let o = `## ${icon} ${strip(block.h)}\n\n`;
  if (block.note) o += `> ${strip(block.note)}\n\n`;
  for (const x of block.l || []) {
    const name = strip(x.n);
    const title = x.u ? `[${name}](${x.u})` : name;
    o += `- ${x.e || ''} **${title}**${x.d ? ` — ${esc(x.d)}` : ''}\n`;
  }
  return o + '\n';
}

const header = (title) => `---\ntags: [chorwacja-2027]\nzrodlo: index.html\n---\n\n` +
  `> [!info] Plik generowany automatycznie z planera po kazdym pushu do main. Nie edytuj — zmiany zostana nadpisane. Wlasne notatki trzymaj w osobnych plikach.\n\n# ${title}\n\n`;

const files = {};
const cities = Object.entries(M);

for (const [c, m] of cities) {
  let o = header(`${m.n} — ${strip(m.sub)}`);
  o += `**${strip(m.dt)}**\n\n← [[Chorwacja 2027]]\n\n`;
  for (const day of D.filter(d => d.c === c)) {
    o += `## ${dayHead(day)}\n\n*${strip(day.dt)}* · ${strip(day.s)}\n\n`;
    o += `| Godzina | Plan |\n|---|---|\n`;
    for (const it of day.i) {
      let d = esc(it.d);
      if (it.r) d += `<br>🍽 **${esc(it.r.n)}** — ${esc(it.r.d)}`;
      o += `| ${esc(it.t)} | ${d} |\n`;
    }
    o += '\n';
    if (day.w) o += `> [!warning] 🌧 Deszcz\n> ${strip(day.w)}\n\n`;
    if (day.sp) o += `> [!tip] 😌 Spokojniej\n> ${strip(day.sp)}\n\n`;
    if (day.alt) o += `> [!note] 🔄 Alternatywa\n> ${strip(day.alt)}\n\n`;
    if (day.note) o += `> [!caution] ⚠️ Uwaga\n> ${strip(day.note)}\n\n`;
  }
  o += listBlock('🚌', PRZ[c]);
  o += listBlock('🛏', NOC[c]);
  o += listBlock('⛵', WYC[c]);
  files[`${m.n}.md`] = o.trimEnd() + '\n';
}

// Sekcja bonus: karty .mc z h3, pozycje .mi oraz tabela zwrotow
if (moreHtml) {
  let o = header('Jedzenie, trunki i rozmowki');
  o += `← [[Chorwacja 2027]]\n\n`;
  const cards = moreHtml.split(/<div class="mc"[^>]*>/).slice(1);
  for (const card of cards) {
    const h = card.match(/<h3>([\s\S]*?)<\/h3>/);
    if (h) o += `## ${strip(h[1])}\n\n`;
    for (const mi of card.matchAll(/<span class="me">([\s\S]*?)<\/span>[\s\S]*?<div class="mn">([\s\S]*?)<\/div><div class="md">([\s\S]*?)<\/div>/g)) {
      o += `- ${strip(mi[1])} **${strip(mi[2])}** — ${strip(mi[3])}\n`;
    }
    const rows = [...card.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => esc(c[1])));
    if (rows.length) {
      const w = Math.max(...rows.map(r => r.length));
      rows.forEach((r, i) => {
        while (r.length < w) r.push('');
        o += `| ${r.join(' | ')} |\n`;
        if (i === 0) o += `|${' --- |'.repeat(w)}\n`;
      });
    }
    o += '\n';
  }
  files['Jedzenie i rozmowki.md'] = o.trimEnd() + '\n';
}

// Notatka glowna
{
  let o = header('Chorwacja 2027');
  o += `Zrodlo: \`index.html\` w repo bashreality/chorwacja-2027.\n\n`;
  o += `| Miasto | Termin | Dni |\n|---|---|---|\n`;
  for (const [c, m] of cities) o += `| [[${m.n}]] | ${esc(m.dt)} | ${D.filter(d => d.c === c).length} |\n`;
  o += `\n## Wszystkie dni\n\n`;
  for (const [c, m] of cities) for (const day of D.filter(d => d.c === c))
    o += `- [[${m.n}#${dayHead(day)}|Dzien ${day.id}]] — ${strip(day.dt)} — ${strip(day.t)}\n`;
  if (files['Jedzenie i rozmowki.md']) o += `\nBonus: [[Jedzenie i rozmowki]]\n`;
  files['Chorwacja 2027.md'] = o;
}

mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.md') && !(f in files) && f !== 'README.md') rmSync(join(outDir, f));
for (const [name, body] of Object.entries(files)) writeFileSync(join(outDir, name), body);
console.log('Zapisano:', Object.keys(files).join(', '));
