// Lista os áudios existentes e grava public/audio/manifesto.json,
// para o site saber o que tocar sem precisar tentar e errar.
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
const ids = (pasta) => {
  const p = join(raiz, pasta);
  if (!existsSync(p)) return [];
  return readdirSync(p).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
};
const manifesto = { voz: ids('voz'), gravado: ids('gravado') };
writeFileSync(join(raiz, 'manifesto.json'), JSON.stringify(manifesto) + '\n');
console.log(`manifesto: ${manifesto.voz.length} vozes, ${manifesto.gravado.length} gravações`);
