import { test, expect, vi } from 'vitest';
import { createVoice } from '../../src/core/voice.js';

function fakePlayer({ pendente = false } = {}) {
  const chamadas = [];
  const pendentes = [];
  return {
    chamadas,
    pendentes,
    stop: vi.fn(),
    playUrl(url, id) {
      chamadas.push(['url', id, url]);
      if (pendente) return new Promise((r) => pendentes.push(() => r(true)));
      return Promise.resolve(true);
    },
    speak(text, id) { chamadas.push(['tts', id, text]); return Promise.resolve(); },
  };
}
const tick = () => new Promise((r) => setTimeout(r, 0));

test('prioridade: gravado > voz > tts', () => {
  const v = createVoice({ manifest: { voz: ['inicio.oi', 'menu.bolo'], gravado: ['inicio.oi'] }, base: '/', player: fakePlayer() });
  expect(v.resolve('inicio.oi')).toEqual({ kind: 'gravado', url: '/audio/gravado/inicio.oi.mp3' });
  expect(v.resolve('menu.bolo')).toEqual({ kind: 'voz', url: '/audio/voz/menu.bolo.mp3' });
  expect(v.resolve('menu.musica')).toEqual({ kind: 'tts', text: 'Siga a música!' });
});

test('arquivo que falha cai para a voz do navegador', async () => {
  const p = fakePlayer();
  p.playUrl = (url, id) => { p.chamadas.push(['url', id]); return Promise.resolve(false); };
  const v = createVoice({ manifest: { voz: ['menu.bolo'], gravado: [] }, base: '/', player: p });
  await v.say('menu.bolo');
  expect(p.chamadas.map((c) => c[0])).toEqual(['url', 'tts']);
});

test('fila não sobrepõe', async () => {
  const p = fakePlayer({ pendente: true });
  const v = createVoice({ manifest: { voz: ['menu.bolo', 'menu.musica'], gravado: [] }, base: '/', player: p });
  v.say('menu.bolo');
  v.say('menu.musica');
  await tick();
  expect(p.chamadas.length).toBe(1);
  p.pendentes[0]();
  await tick(); await tick();
  expect(p.chamadas.map((c) => c[1])).toEqual(['menu.bolo', 'menu.musica']);
});

test('interrupt esvazia a fila', async () => {
  const p = fakePlayer({ pendente: true });
  const ids = ['num.1', 'num.2', 'num.3', 'num.4', 'num.5', 'num.6'];
  const v = createVoice({ manifest: { voz: ids, gravado: [] }, base: '/', player: p });
  for (const id of ids.slice(0, 5)) v.say(id);
  await tick();
  const z = v.say('num.6', { interrupt: true });
  await tick();
  expect(p.stop).toHaveBeenCalled();
  p.pendentes.forEach((r) => r());
  await tick(); await tick();
  await z;
  expect(p.chamadas.map((c) => c[1])).toEqual(['num.1', 'num.6']);
});

test('repeatLast ignora elogios e números', async () => {
  const p = fakePlayer();
  const v = createVoice({ manifest: { voz: [], gravado: [] }, base: '/', player: p });
  await v.say('musica.escuta');
  await v.say('elogio.1');
  await v.say('num.3');
  await v.say('letras.nome.b');
  await v.repeatLast();
  expect(p.chamadas.at(-1)[1]).toBe('musica.escuta');
});

test('ID desconhecido não quebra', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const p = fakePlayer();
  const v = createVoice({ manifest: { voz: [], gravado: [] }, base: '/', player: p });
  await v.say('nao.existe');
  expect(p.chamadas.length).toBe(0);
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
});

test('sayAll fala em sequência', async () => {
  const p = fakePlayer();
  const v = createVoice({ manifest: { voz: [], gravado: [] }, base: '/', player: p });
  await v.sayAll(['bolo.tem.morango.2', 'bolo.caiu.morango.1']);
  expect(p.chamadas.map((c) => c[1])).toEqual(['bolo.tem.morango.2', 'bolo.caiu.morango.1']);
});
