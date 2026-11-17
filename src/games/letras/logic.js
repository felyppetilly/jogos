// Letra Inicial com Dinossauros — regras puras (sem tela).
import { WORDS } from './words.js';

export const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Letras do começo (nível 1): frequentes e de som claro.
// O pai pode acrescentar aqui as letras dos nomes da família.
export const LETRAS_INICIAIS = ['A', 'B', 'M', 'P', 'S', 'T'];

// Letras que se parecem; no nível 3 uma delas aparece como "pegadinha".
export const SIMILARES = [['B', 'D', 'P', 'R'], ['M', 'N', 'W'], ['E', 'F'], ['O', 'Q', 'C', 'G'], ['I', 'L', 'J'], ['U', 'V'], ['K', 'X']];

const grupoDe = (L) => SIMILARES.find((g) => g.includes(L)) ?? [L];

function escolherDistratores(alvo, rng, comSimilar) {
  const grupo = grupoDe(alvo);
  const parecidas = grupo.filter((x) => x !== alvo);
  const diferentes = ALFABETO.filter((x) => !grupo.includes(x));
  const escolhidas = [];
  if (comSimilar && parecidas.length) escolhidas.push(rng.pick(parecidas));
  while (escolhidas.length < 2) {
    const d = rng.pick(diferentes);
    // as duas distratoras também não devem ser parecidas entre si
    if (!escolhidas.includes(d) && !escolhidas.some((e) => grupoDe(e).includes(d))) escolhidas.push(d);
  }
  return escolhidas;
}

export function generateRound(level, rng, prevAlvo) {
  if (level === 0) {
    let alvo;
    do { alvo = rng.pick(ALFABETO); } while (alvo === prevAlvo);
    return { tipo: 'toque', alvo, opcoes: rng.shuffle([alvo, ...escolherDistratores(alvo, rng, false)]) };
  }
  const pool = level === 1 ? WORDS.filter((w) => LETRAS_INICIAIS.includes(w.letra)) : WORDS;
  let palavra;
  do { palavra = rng.pick(pool); } while (palavra.letra === prevAlvo);
  const alvo = palavra.letra;
  return { tipo: 'palavra', alvo, palavra, opcoes: rng.shuffle([alvo, ...escolherDistratores(alvo, rng, level >= 3)]) };
}
