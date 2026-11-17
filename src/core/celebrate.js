// Comemorações: pequena (elemento pula + elogio) e grande (confete + festa).
import { gsap } from 'gsap';
import { playSfx } from './audio.js';
import { ELOGIOS, GRANDES } from './phrases.js';

const CORES = ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#c77dff', '#ff9f1c'];

export function createCelebrate({ voice, rng }) {
  function small(el) {
    playSfx('pop');
    if (el) gsap.fromTo(el, { y: 0, scale: 1 }, { y: -30, scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
    return voice.say(rng.pick(ELOGIOS));
  }

  function big() {
    playSfx('tada');
    const camada = document.createElement('div');
    camada.className = 'confete';
    document.body.append(camada);
    const w = innerWidth, h = innerHeight;
    const tl = gsap.timeline();
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.background = CORES[i % CORES.length];
      p.style.left = `${rng.int(0, w)}px`;
      p.style.borderRadius = rng.next() < 0.5 ? '50%' : '3px';
      camada.append(p);
      tl.fromTo(p, { y: -40, rotation: 0 }, {
        y: h + 40, x: rng.int(-120, 120), rotation: rng.int(-540, 540),
        duration: 1.6 + rng.next() * 1.2, ease: 'power1.in',
      }, rng.next() * 0.5);
    }
    const fala = voice.say(rng.pick(GRANDES));
    const anim = new Promise((r) => tl.eventCallback('onComplete', r));
    return Promise.all([fala, anim]).then(() => camada.remove());
  }

  return { small, big };
}
