// Copia só os desenhos OpenMoji usados pelo site para public/img/emoji/.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORDS } from '../src/games/letras/words.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const origem = join(raiz, 'node_modules', 'openmoji', 'color', 'svg');
const destino = join(raiz, 'public', 'img', 'emoji');
mkdirSync(destino, { recursive: true });

const EXTRAS = ['1F995', '1F3B9', '1F382', '1F353', '1F352', '1F36C', '1F426', '1F56F'];
const codigos = [...new Set([...WORDS.map((w) => w.emoji), ...EXTRAS])];
const faltando = codigos.filter((c) => !existsSync(join(origem, `${c}.svg`)));
if (faltando.length) {
  console.error(`Emoji(s) inexistente(s) no OpenMoji: ${faltando.join(', ')}`);
  process.exit(1);
}
for (const c of codigos) copyFileSync(join(origem, `${c}.svg`), join(destino, `${c}.svg`));
console.log(`${codigos.length} desenhos copiados.`);
