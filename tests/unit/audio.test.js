import { test, expect, vi } from 'vitest';
import { installVisibilityResume } from '../../src/core/audio.js';

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
