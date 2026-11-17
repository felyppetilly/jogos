import { test, expect } from 'vitest';
import { createRng } from '../../src/core/random.js';

test('mesma semente, mesma sequência', () => {
  const a = createRng(5), b = createRng(5);
  expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
});

test('int é inclusivo e fica na faixa', () => {
  const r = createRng(1);
  const vistos = new Set();
  for (let i = 0; i < 500; i++) {
    const v = r.int(2, 4);
    expect(v).toBeGreaterThanOrEqual(2);
    expect(v).toBeLessThanOrEqual(4);
    vistos.add(v);
  }
  expect([...vistos].sort()).toEqual([2, 3, 4]);
});

test('shuffle devolve cópia com os mesmos itens', () => {
  const r = createRng(3);
  const orig = [1, 2, 3, 4, 5];
  const s = r.shuffle(orig);
  expect(s).not.toBe(orig);
  expect([...s].sort()).toEqual(orig);
});
