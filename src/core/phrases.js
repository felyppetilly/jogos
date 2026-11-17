// Catálogo de TODAS as falas do site: ID → texto em português do Brasil.
// O ID vira nome de arquivo de áudio (public/audio/voz/<id>.mp3), por isso só
// usa letras minúsculas, números, ponto e hífen.
import { WORDS } from '../games/letras/words.js';

export const PHRASES = {
  'inicio.oi': 'Oi! Vamos brincar?',
  'menu.musica': 'Siga a música!',
  'menu.letras': 'As letras dos dinossauros!',
  'menu.bolo': 'Continhas no bolo!',

  'musica.escuta': 'Escuta…',
  'musica.suavez': 'Agora é sua vez!',
  'musica.denovo': 'Vamos ouvir de novo?',
  'musica.livre': 'Agora toca do jeito que você quiser!',
  'musica.desafio': 'Vamos brincar de seguir a música?',

  'bolo.vamoscontar': 'Vamos contar juntos?',
  'bolo.pronto': 'O bolo ficou pronto! Assopra a velinha!',
  'bolo.parabens': 'Parabéns pra você!',
};

// Elogios, incentivos e comemorações grandes (sorteados para não repetir).
const elogios = ['Muito bem!', 'Isso aí!', 'Parabéns!', 'Que demais!', 'Você conseguiu!', 'Arrasou!', 'Muito bom!', 'Uhuul!'];
const incentivos = ['Quase! Vamos tentar de novo?', 'Hmm… tenta outra vez!', 'Tá quase lá!', 'Vamos de novo?'];
const grandes = ['Uau! Você é demais!', 'Que incrível! Você é uma campeã!', 'Uhuul! Que festa!'];
export const ELOGIOS = elogios.map((t, i) => { PHRASES[`elogio.${i + 1}`] = t; return `elogio.${i + 1}`; });
export const INCENTIVOS = incentivos.map((t, i) => { PHRASES[`incentivo.${i + 1}`] = t; return `incentivo.${i + 1}`; });
export const GRANDES = grandes.map((t, i) => { PHRASES[`grande.${i + 1}`] = t; return `grande.${i + 1}`; });

// Números falados (0 a 10), masculino e feminino.
const NUM_M = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
const NUM_F = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
NUM_M.forEach((t, n) => { PHRASES[`num.${n}`] = `${t[0].toUpperCase()}${t.slice(1)}!`; });

// Letras: nome escrito do jeito que deve ser pronunciado.
export const NOMES_LETRAS = {
  A: 'Á', B: 'Bê', C: 'Cê', D: 'Dê', E: 'É', F: 'Éfe', G: 'Gê', H: 'Agá', I: 'I', J: 'Jota', K: 'Cá', L: 'Éle', M: 'Ême',
  N: 'Êne', O: 'Ó', P: 'Pê', Q: 'Quê', R: 'Érre', S: 'Ésse', T: 'Tê', U: 'U', V: 'Vê', W: 'Dáblio', X: 'Xis', Y: 'Ípsilon', Z: 'Zê',
};
for (const [L, nome] of Object.entries(NOMES_LETRAS)) {
  PHRASES[`letras.nome.${L.toLowerCase()}`] = `${nome}!`;
  PHRASES[`letras.toque.${L.toLowerCase()}`] = `Toque na letra ${nome}!`;
}
for (const w of WORDS) {
  const P = w.palavra[0].toUpperCase() + w.palavra.slice(1);
  PHRASES[`letras.pergunta.${w.id}`] = `${P}! Com que letra começa ${w.palavra}?`;
  PHRASES[`letras.dica.${w.id}`] = w.dica ?? `Escuta só: ${w.palavra}… ${w.palavra}!`;
}

// Bolo: frases inteiras para cada combinação (soa mais natural que colar pedaços).
export const COBERTURAS_FALA = {
  morango: { sing: 'morango', plur: 'morangos', fem: false },
  cereja: { sing: 'cereja', plur: 'cerejas', fem: true },
  docinho: { sing: 'docinho', plur: 'docinhos', fem: false },
};
for (const [c, { sing, plur, fem }] of Object.entries(COBERTURAS_FALA)) {
  const num = (n) => (fem ? NUM_F : NUM_M)[n];
  const nome = (n) => (n === 1 ? sing : plur);
  for (let n = 1; n <= 10; n++) PHRASES[`bolo.tem.${c}.${n}`] = `Tem ${num(n)} ${nome(n)} no bolo.`;
  for (let n = 1; n <= 5; n++) PHRASES[`bolo.caiu.${c}.${n}`] = `${n === 1 ? 'Caiu' : 'Caíram'} mais ${num(n)} ${nome(n)}! Quant${fem ? 'as' : 'os'} ${plur} tem agora?`;
  for (let n = 1; n <= 3; n++) PHRASES[`bolo.comeu.${c}.${n}`] = `O passarinho comeu ${num(n)} ${nome(n)}! Quant${fem ? 'as' : 'os'} sobraram?`;
  PHRASES[`bolo.quantos.${c}`] = `Quant${fem ? 'as' : 'os'} ${plur} tem no bolo?`;
}
