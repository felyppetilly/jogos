import { test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { WORDS } from '../../src/games/letras/words.js';
import { generateRound, LETRAS_INICIAIS, SIMILARES, ALFABETO } from '../../src/games/letras/logic.js';
import { PHRASES } from '../../src/core/phrases.js';
import { createRng } from '../../src/core/random.js';

const semAcento = (s) => s.normalize('NFD').replace(/\p{M}/gu, '');
const grupo = (L) => SIMILARES.find((g) => g.includes(L)) ?? [];

test('palavras: letra = primeira letra sem acento, sem começos ambíguos', () => {
  for (const w of WORDS) {
    expect(semAcento(w.palavra)[0].toUpperCase(), w.palavra).toBe(w.letra);
    expect(w.palavra).not.toMatch(/^(h|ch|qu|lh|nh)/i);
    expect(w.id).toMatch(/^[a-z]+$/);
  }
});

test('cobertura: pelo menos 20 letras com palavra', () => {
  expect(new Set(WORDS.map((w) => w.letra)).size).toBeGreaterThanOrEqual(20);
});

test('todo emoji existe no pacote openmoji', () => {
  for (const w of WORDS) expect(existsSync(`node_modules/openmoji/color/svg/${w.emoji}.svg`), w.emoji).toBe(true);
});

test('cada palavra tem pergunta e dica faladas', () => {
  for (const w of WORDS) {
    expect(PHRASES[`letras.pergunta.${w.id}`]).toBeTruthy();
    expect(PHRASES[`letras.dica.${w.id}`]).toBeTruthy();
  }
});

test('letras iniciais têm palavras', () => {
  for (const L of LETRAS_INICIAIS) expect(WORDS.some((w) => w.letra === L), L).toBe(true);
});

test('nível 0 sorteia das 26 letras e evita similares', () => {
  const rng = createRng(2);
  const alvos = new Set();
  for (let i = 0; i < 2000; i++) {
    const r = generateRound(0, rng);
    expect(r.tipo).toBe('toque');
    alvos.add(r.alvo);
    for (const o of r.opcoes) if (o !== r.alvo) expect(grupo(r.alvo).includes(o)).toBe(false);
  }
  expect(alvos.size).toBe(26);
  expect(ALFABETO.length).toBe(26);
});

test('nível 1 só usa LETRAS_INICIAIS', () => {
  const rng = createRng(3);
  for (let i = 0; i < 500; i++) {
    const r = generateRound(1, rng);
    expect(r.tipo).toBe('palavra');
    expect(LETRAS_INICIAIS).toContain(r.alvo);
    expect(r.palavra.letra).toBe(r.alvo);
  }
});

test('nível 2 usa qualquer palavra e evita similares', () => {
  const rng = createRng(5);
  const alvos = new Set();
  for (let i = 0; i < 2000; i++) {
    const r = generateRound(2, rng);
    alvos.add(r.alvo);
    for (const o of r.opcoes) if (o !== r.alvo) expect(grupo(r.alvo).includes(o)).toBe(false);
  }
  expect(alvos.size).toBe(new Set(WORDS.map((w) => w.letra)).size);
});

test('nível 3 inclui distrator similar quando existe grupo', () => {
  const rng = createRng(6);
  for (let i = 0; i < 1000; i++) {
    const r = generateRound(3, rng);
    const g = grupo(r.alvo).filter((x) => x !== r.alvo);
    if (g.length) expect(r.opcoes.some((o) => g.includes(o)), r.alvo).toBe(true);
  }
});

test('opções distintas, contêm o alvo, sem repetir alvo seguido', () => {
  const rng = createRng(7);
  let prev;
  for (const nivel of [0, 1, 2, 3]) {
    for (let i = 0; i < 500; i++) {
      const r = generateRound(nivel, rng, prev);
      expect(r.opcoes).toHaveLength(3);
      expect(new Set(r.opcoes).size).toBe(3);
      expect(r.opcoes).toContain(r.alvo);
      expect(r.alvo).not.toBe(prev);
      prev = r.alvo;
    }
  }
});
