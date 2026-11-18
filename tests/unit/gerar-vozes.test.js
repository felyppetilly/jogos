import { describe, it, expect } from 'vitest';
import { planejarGeracao } from '../../scripts/gerar-vozes.mjs';

describe('planejarGeracao', () => {
  it('pula os áudios que já existem', () => {
    expect(planejarGeracao({ a: 'x', b: 'y' }, new Set(['a']), false)).toEqual(['b']);
  });
  it('com force gera tudo', () => {
    expect(planejarGeracao({ a: 'x', b: 'y' }, new Set(['a']), true)).toEqual(['a', 'b']);
  });
});
