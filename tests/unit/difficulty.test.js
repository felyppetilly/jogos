import { test, expect } from 'vitest';
import { createDifficulty } from '../../src/core/difficulty.js';

function memoria(inicial = {}) {
  const m = { ...inicial };
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, m };
}
const vitoria = (d) => { d.startRound(); return d.recordWin(); };
const comDica = (d) => { d.startRound(); d.recordWrong(); d.recordWrong(); return d.recordWin(); };

test('3 vitórias sem erro sobem um nível', () => {
  const d = createDifficulty({ gameId: 'musica', minLevel: 1, maxLevel: 5, storage: memoria() });
  expect(vitoria(d).levelChanged).toBe(0);
  expect(vitoria(d).levelChanged).toBe(0);
  expect(vitoria(d).levelChanged).toBe(1);
  expect(d.level).toBe(2);
});

test('vitória com erro zera a sequência', () => {
  const d = createDifficulty({ gameId: 'x', minLevel: 1, maxLevel: 5, storage: memoria() });
  vitoria(d); vitoria(d);
  d.startRound(); d.recordWrong(); d.recordWin();
  vitoria(d);
  expect(d.level).toBe(1);
});

test('dica a partir do segundo erro da rodada', () => {
  const d = createDifficulty({ gameId: 'x', minLevel: 1, maxLevel: 5, storage: memoria() });
  d.startRound();
  expect(d.recordWrong().showHint).toBe(false);
  expect(d.recordWrong().showHint).toBe(true);
  expect(d.recordWrong().showHint).toBe(true);
});

test('3 rodadas com dica descem um nível', () => {
  const d = createDifficulty({ gameId: 'x', minLevel: 1, maxLevel: 5, storage: memoria({ 'jogos.nivel.x': '3' }) });
  expect(d.level).toBe(3);
  comDica(d); comDica(d);
  expect(comDica(d).levelChanged).toBe(-1);
  expect(d.level).toBe(2);
});

test('não passa do máximo nem do mínimo', () => {
  const d = createDifficulty({ gameId: 'x', minLevel: 1, maxLevel: 2, storage: memoria() });
  for (let i = 0; i < 6; i++) vitoria(d);
  expect(d.level).toBe(2);
  const e = createDifficulty({ gameId: 'y', minLevel: 1, maxLevel: 2, storage: memoria() });
  comDica(e); comDica(e); comDica(e);
  expect(e.level).toBe(1);
});

test('mínimo zero é respeitado', () => {
  const d = createDifficulty({ gameId: 'letras', minLevel: 0, maxLevel: 3, storage: memoria() });
  expect(d.level).toBe(0);
});

test('persiste em jogos.nivel.<id>', () => {
  const s = memoria();
  const d = createDifficulty({ gameId: 'musica', minLevel: 1, maxLevel: 5, storage: s });
  vitoria(d); vitoria(d); vitoria(d);
  expect(s.getItem('jogos.nivel.musica')).toBe('2');
  expect(createDifficulty({ gameId: 'musica', minLevel: 1, maxLevel: 5, storage: s }).level).toBe(2);
});

test('storage que lança exceção ou valor lixo não quebra', () => {
  const quebrado = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  const d = createDifficulty({ gameId: 'a', minLevel: 1, maxLevel: 5, storage: quebrado });
  expect(d.level).toBe(1);
  vitoria(d); vitoria(d); vitoria(d);
  expect(d.level).toBe(2);
  const lixo = { getItem: () => 'abc', setItem() {} };
  expect(createDifficulty({ gameId: 'a', minLevel: 1, maxLevel: 5, storage: lixo }).level).toBe(1);
  const fora = { getItem: () => '99', setItem() {} };
  expect(createDifficulty({ gameId: 'a', minLevel: 1, maxLevel: 5, storage: fora }).level).toBe(1);
});
