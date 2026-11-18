import { test, expect, vi } from 'vitest';
import { installVisibilityResume, unlockAudio } from '../../src/core/audio.js';

test('retoma AudioContext ao voltar para a frente', () => {
  const ctx = { state: 'suspended', resume: vi.fn(() => Promise.resolve()) };
  const doc = new EventTarget();
  doc.visibilityState = 'visible';
  installVisibilityResume(doc, () => ctx);
  doc.dispatchEvent(new Event('visibilitychange'));
  expect(ctx.resume).toHaveBeenCalled();
});

test('não chama resume quando já está rodando ou oculto', () => {
  const ctx = { state: 'running', resume: vi.fn() };
  const doc = new EventTarget();
  doc.visibilityState = 'visible';
  installVisibilityResume(doc, () => ctx);
  doc.dispatchEvent(new Event('visibilitychange'));
  ctx.state = 'suspended';
  doc.visibilityState = 'hidden';
  doc.dispatchEvent(new Event('visibilitychange'));
  expect(ctx.resume).not.toHaveBeenCalled();
});

test('unlockAudio dá play no áudio na hora do toque, sem esperar o AudioContext', () => {
  const el = { src: '', play: vi.fn(() => Promise.resolve()) };
  const ctx = { resume: () => new Promise(() => {}) }; // iOS pode demorar a retomar
  unlockAudio({ el, ctx });
  expect(el.play).toHaveBeenCalledTimes(1);
  expect(el.src).toMatch(/^data:audio\/wav/);
});
