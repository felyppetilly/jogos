import { test, expect } from 'vitest';
import { LEVELS, generateSequence, checkInput } from '../../src/games/musica/logic.js';
import { createRng } from '../../src/core/random.js';

test('níveis conforme o design', () => {
  expect(LEVELS).toEqual({
    1: { keys: 3, len: [2, 2] }, 2: { keys: 3, len: [3, 3] }, 3: { keys: 4, len: [3, 4] },
    4: { keys: 5, len: [4, 5] }, 5: { keys: 5, len: [5, 6] },
  });
});

test('comprimento e faixa por nível', () => {
  const rng = createRng(9);
  for (const n of [1, 2, 3, 4, 5]) {
    const { keys, len } = LEVELS[n];
    for (let i = 0; i < 200; i++) {
      const s = generateSequence(n, rng);
      expect(s.length).toBeGreaterThanOrEqual(len[0]);
      expect(s.length).toBeLessThanOrEqual(len[1]);
      for (const k of s) { expect(Number.isInteger(k)).toBe(true); expect(k).toBeGreaterThanOrEqual(0); expect(k).toBeLessThan(keys); }
    }
  }
});

test('nunca 3 notas iguais seguidas', () => {
  const rng = createRng(4);
  for (let i = 0; i < 1000; i++) {
    const s = generateSequence(5, rng);
    for (let j = 2; j < s.length; j++) expect(s[j] === s[j - 1] && s[j] === s[j - 2]).toBe(false);
  }
});

test('checkInput', () => {
  expect(checkInput([0, 1, 2], [0])).toBe('continua');
  expect(checkInput([0, 1, 2], [0, 1, 2])).toBe('completa');
  expect(checkInput([0, 1, 2], [0, 2])).toBe('errada');
});
