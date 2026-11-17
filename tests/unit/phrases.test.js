import { test, expect } from 'vitest';
import { PHRASES, ELOGIOS, INCENTIVOS, GRANDES } from '../../src/core/phrases.js';

test('todos os IDs são válidos como nome de arquivo', () => {
  for (const id of Object.keys(PHRASES)) expect(id).toMatch(/^[a-z0-9.\-]+$/);
});

test('todo texto é não vazio', () => {
  for (const t of Object.values(PHRASES)) expect(t.trim().length).toBeGreaterThan(0);
});

test('26 nomes de letras e 26 "toque"', () => {
  const ids = Object.keys(PHRASES);
  expect(ids.filter((i) => i.startsWith('letras.nome.')).length).toBe(26);
  expect(ids.filter((i) => i.startsWith('letras.toque.')).length).toBe(26);
  expect(PHRASES['letras.nome.b']).toBe('Bê!');
});

test('bolo: singular, plural e gênero', () => {
  expect(PHRASES['bolo.tem.morango.1']).toBe('Tem um morango no bolo.');
  expect(PHRASES['bolo.tem.morango.3']).toBe('Tem três morangos no bolo.');
  expect(PHRASES['bolo.tem.cereja.1']).toBe('Tem uma cereja no bolo.');
  expect(PHRASES['bolo.tem.cereja.2']).toBe('Tem duas cerejas no bolo.');
  expect(PHRASES['bolo.caiu.docinho.2']).toBe('Caíram mais dois docinhos! Quantos docinhos tem agora?');
  expect(PHRASES['bolo.caiu.morango.1']).toBe('Caiu mais um morango! Quantos morangos tem agora?');
  expect(PHRASES['bolo.comeu.morango.1']).toBe('O passarinho comeu um morango! Quantos sobraram?');
  expect(PHRASES['bolo.quantos.cereja']).toBe('Quantas cerejas tem no bolo?');
});

test('IDs fixos usados pelos jogos existem', () => {
  for (const id of ['inicio.oi', 'menu.musica', 'menu.letras', 'menu.bolo', 'musica.escuta', 'musica.suavez',
    'musica.denovo', 'musica.livre', 'bolo.vamoscontar', 'bolo.pronto', 'bolo.parabens', 'num.0', 'num.10',
    'bolo.tem.docinho.10', 'bolo.caiu.cereja.5', 'bolo.comeu.docinho.3'])
    expect(PHRASES[id], id).toBeTruthy();
  for (const id of [...ELOGIOS, ...INCENTIVOS, ...GRANDES]) expect(PHRASES[id], id).toBeTruthy();
  expect(ELOGIOS.length).toBe(8);
  expect(INCENTIVOS.length).toBe(4);
  expect(GRANDES.length).toBe(3);
});
