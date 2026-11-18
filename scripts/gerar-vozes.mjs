// Gera um mp3 por fala do catálogo (src/core/phrases.js) com a voz neural da
// OpenAI e grava em public/audio/voz/<id>.mp3. Depois atualiza o manifesto.
//
// Uso:
//   node scripts/gerar-vozes.mjs                 gera só o que falta
//   node scripts/gerar-vozes.mjs --force         regera tudo
//   node scripts/gerar-vozes.mjs --so=letras.    regera só os IDs com esse prefixo
//   --voz=marin   troca a voz (padrão: coral)
//   --saida=pasta grava em outra pasta (para comparar vozes sem mexer no site)
//
// Precisa de OPENAI_API_KEY no ambiente.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MODELO = 'gpt-4o-mini-tts';
const INSTRUCOES =
  'Fale em português do Brasil, com voz calorosa e alegre, devagar e bem articulada, ' +
  'para uma criança de 4 anos. Sem exageros.';
const CONCORRENCIA = 4;
const TENTATIVAS = 3;

/** Lista os IDs que precisam ser gerados: todos com force, senão só os que faltam. */
export function planejarGeracao(phrases, existentes, force) {
  return Object.keys(phrases).filter((id) => force || !existentes.has(id));
}

async function falar(texto, voz, chave) {
  const resp = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELO,
      voice: voz,
      input: texto,
      instructions: INSTRUCOES,
      response_format: 'mp3',
    }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  return Buffer.from(await resp.arrayBuffer());
}

async function comTentativas(fn) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i >= TENTATIVAS) throw e;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function main() {
  const chave = process.env.OPENAI_API_KEY;
  if (!chave) {
    console.error('Falta OPENAI_API_KEY no ambiente.');
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const opt = (nome) => args.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1];
  const so = opt('so');
  const voz = opt('voz') || 'coral';
  const pastaPadrao = join(AQUI, '..', 'public', 'audio', 'voz');
  const pasta = opt('saida') ? resolve(opt('saida')) : pastaPadrao;
  const force = args.includes('--force') || Boolean(so);

  const { PHRASES } = await import('../src/core/phrases.js');
  const alvo = so
    ? Object.fromEntries(Object.entries(PHRASES).filter(([id]) => id.startsWith(so)))
    : PHRASES;
  mkdirSync(pasta, { recursive: true });
  const existentes = new Set(
    readdirSync(pasta).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)),
  );
  const fila = planejarGeracao(alvo, existentes, force);
  console.log(`voz ${voz}: ${fila.length} falas para gerar em ${pasta}`);

  let feitos = 0;
  const falhas = [];
  const trabalhador = async () => {
    while (fila.length) {
      const id = fila.shift();
      try {
        const mp3 = await comTentativas(() => falar(alvo[id], voz, chave));
        writeFileSync(join(pasta, `${id}.mp3`), mp3);
        feitos++;
        if (feitos % 20 === 0) console.log(`  ${feitos} prontas…`);
      } catch (e) {
        falhas.push(id);
        console.error(`  falhou ${id}: ${e.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCORRENCIA }, trabalhador));
  console.log(`pronto: ${feitos} geradas, ${falhas.length} falhas`);

  if (pasta === pastaPadrao) {
    execFileSync(process.execPath, [join(AQUI, 'manifesto-audio.mjs')], { stdio: 'inherit' });
  }
  if (falhas.length) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
