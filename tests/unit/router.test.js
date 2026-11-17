import { test, expect } from 'vitest';
import { parseRoute } from '../../src/router.js';

test('rotas conhecidas', () => {
  expect(parseRoute('#/bolo')).toBe('bolo');
  expect(parseRoute('#/musica')).toBe('musica');
  expect(parseRoute('#/letras')).toBe('letras');
});

test('vazio ou desconhecido vai para o menu', () => {
  expect(parseRoute('')).toBe('menu');
  expect(parseRoute('#/')).toBe('menu');
  expect(parseRoute('#/xyz')).toBe('menu');
});
