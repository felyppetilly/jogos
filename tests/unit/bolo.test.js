import { test, expect } from 'vitest';
import { generateRound, layoutPositions, COBERTURAS } from '../../src/games/bolo/logic.js';
import { PHRASES } from '../../src/core/phrases.js';
import { createRng } from '../../src/core/random.js';

const rodadas = (nivel, n = 2000, seed = 11) => {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => generateRound(nivel, rng));
};

function opcoesValidas(r) {
  expect(r.opcoes).toHaveLength(3);
  expect(new Set(r.opcoes).size).toBe(3);
  expect(r.opcoes).toContain(r.resposta);
  for (const o of r.opcoes) {
    expect(o).toBeGreaterThanOrEqual(0);
    expect(o).toBeLessThanOrEqual(10);
    expect(Math.abs(o - r.resposta)).toBeLessThanOrEqual(2);
  }
}

test('nível 1: contar de 3 a 10', () => {
  for (const r of rodadas(1)) {
    expect(r.tipo).toBe('contar');
    expect(r.a).toBeGreaterThanOrEqual(3); expect(r.a).toBeLessThanOrEqual(10);
    expect(r.b).toBe(0); expect(r.resposta).toBe(r.a);
    expect(r.falas).toEqual([`bolo.quantos.${r.cobertura.id}`]);
    opcoesValidas(r);
  }
});

test('nível 2: somar até 5', () => {
  for (const r of rodadas(2)) {
    expect(r.tipo).toBe('somar');
    expect(r.a).toBeGreaterThanOrEqual(1);
    expect(r.b).toBeGreaterThanOrEqual(1); expect(r.b).toBeLessThanOrEqual(4);
    expect(r.a + r.b).toBeLessThanOrEqual(5);
    expect(r.resposta).toBe(r.a + r.b);
    expect(r.falas).toEqual([`bolo.tem.${r.cobertura.id}.${r.a}`, `bolo.caiu.${r.cobertura.id}.${r.b}`]);
    opcoesValidas(r);
  }
});

test('nível 3: somar de 4 a 10', () => {
  for (const r of rodadas(3)) {
    expect(r.tipo).toBe('somar');
    expect(r.a).toBeGreaterThanOrEqual(1);
    expect(r.b).toBeGreaterThanOrEqual(1); expect(r.b).toBeLessThanOrEqual(5);
    expect(r.a + r.b).toBeGreaterThanOrEqual(4); expect(r.a + r.b).toBeLessThanOrEqual(10);
    opcoesValidas(r);
  }
});

test('nível 4: tirar', () => {
  for (const r of rodadas(4)) {
    expect(r.tipo).toBe('tirar');
    expect(r.a).toBeGreaterThanOrEqual(2); expect(r.a).toBeLessThanOrEqual(10);
    expect(r.b).toBeGreaterThanOrEqual(1); expect(r.b).toBeLessThanOrEqual(3);
    expect(r.b).toBeLessThanOrEqual(r.a);
    expect(r.resposta).toBe(r.a - r.b);
    expect(r.falas).toEqual([`bolo.tem.${r.cobertura.id}.${r.a}`, `bolo.comeu.${r.cobertura.id}.${r.b}`]);
    opcoesValidas(r);
  }
});

test('falas existem no catálogo e todas as coberturas aparecem', () => {
  const vistas = new Set();
  for (const nivel of [1, 2, 3, 4]) for (const r of rodadas(nivel, 300)) {
    vistas.add(r.cobertura.id);
    for (const id of r.falas) expect(PHRASES[id], id).toBeTruthy();
  }
  expect(vistas.size).toBe(COBERTURAS.length);
});

test('layout: até 10 posições sem sobreposição e dentro da caixa', () => {
  for (const box of [{ w: 300, h: 120 }, { w: 700, h: 220 }, { w: 420, h: 130 }]) {
    for (let n = 1; n <= 10; n++) {
      const p = layoutPositions(n, box, 60);
      expect(p).toHaveLength(n);
      for (const q of p) {
        expect(q.tam).toBeGreaterThanOrEqual(60);
        expect(q.x - 30).toBeGreaterThanOrEqual(-0.001); expect(q.x + 30).toBeLessThanOrEqual(box.w + 0.001);
        expect(q.y - 30).toBeGreaterThanOrEqual(-0.001); expect(q.y + 30).toBeLessThanOrEqual(box.h + 0.001);
      }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
        expect(Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y)).toBeGreaterThanOrEqual(60 - 0.001);
    }
  }
});
