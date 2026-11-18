// Voz do site: fala frases do catálogo por ID.
// Ordem de busca: gravação do pai (audio/gravado) → voz gerada (audio/voz) → voz do navegador.
// As falas entram numa fila e nunca se sobrepõem; com { interrupt: true } a fila é
// descartada e a nova fala toca na hora (ex.: contar morangos depressa).
import { PHRASES } from './phrases.js';

const NAO_REPETIR = /^(elogio|incentivo|grande|num|letras\.nome)\./;

export function createVoice({ manifest, base = '/', player }) {
  const gravado = new Set(manifest?.gravado ?? []);
  const voz = new Set(manifest?.voz ?? []);
  let queue = [];
  let generation = 0;
  let running = false;
  let lastInstruction = null;

  function resolve(id) {
    if (gravado.has(id)) return { kind: 'gravado', url: `${base}audio/gravado/${id}.mp3` };
    if (voz.has(id)) return { kind: 'voz', url: `${base}audio/voz/${id}.mp3` };
    return { kind: 'tts', text: PHRASES[id] };
  }

  async function playOne(id) {
    if (!(id in PHRASES) && !gravado.has(id)) {
      console.warn(`[voz] fala desconhecida: ${id}`);
      return;
    }
    const r = resolve(id);
    if (r.url) {
      const ok = await player.playUrl(r.url, id);
      if (ok !== false) return;
    }
    if (PHRASES[id]) await player.speak(PHRASES[id], id);
  }

  function pump() {
    if (running) return;
    running = true;
    const gen = generation;
    (async () => {
      while (queue.length && gen === generation) {
        const item = queue.shift();
        try { await playOne(item.id); } catch (e) { console.warn('[voz]', e); }
        item.resolve();
      }
      if (gen === generation) running = false;
    })();
  }

  function say(id, { interrupt = false } = {}) {
    if (!NAO_REPETIR.test(id)) lastInstruction = id;
    if (interrupt) {
      generation++;
      running = false;
      queue.forEach((q) => q.resolve());
      queue = [];
      player.stop();
    }
    return new Promise((res) => {
      queue.push({ id, resolve: res });
      pump();
    });
  }

  function sayAll(ids, opts = {}) {
    let last = Promise.resolve();
    ids.forEach((id, i) => { last = say(id, i === 0 ? opts : {}); });
    return last;
  }

  function repeatLast() {
    return lastInstruction ? say(lastInstruction, { interrupt: true }) : Promise.resolve();
  }

  function stop() {
    generation++;
    running = false;
    queue.forEach((q) => q.resolve());
    queue = [];
    player.stop();
  }

  return { resolve, say, sayAll, repeatLast, stop };
}

// Player real: um único <audio> reaproveitado (o iOS só libera áudio num elemento
// que já tocou após um toque) + voz do navegador como reserva.
// O mp3 é baixado com fetch e tocado de um blob: o Safari pede áudio em pedaços
// (Range) e o cache offline devolve o arquivo inteiro, o que o iOS às vezes
// recusa tocar. Do blob ele sempre toca.
async function carregarBlob(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return URL.createObjectURL(await resp.blob());
}

export function createAudioPlayer(audioEl, { carregar = carregarBlob } = {}) {
  let finish = null;
  const blobs = new Map();
  const obter = (url) => {
    if (!blobs.has(url)) {
      blobs.set(url, carregar(url).catch(() => { blobs.delete(url); return url; }));
    }
    return blobs.get(url);
  };
  return {
    playUrl(url) {
      return new Promise((resolve) => {
        let done = false;
        const end = (ok) => { if (!done) { done = true; finish = null; resolve(ok); } };
        finish = () => end(true);
        obter(url).then((src) => {
          if (done) return; // stop() chegou durante o carregamento
          audioEl.onended = () => end(true);
          audioEl.onerror = () => end(false);
          audioEl.src = src;
          const p = audioEl.play();
          if (p?.catch) p.catch(() => end(false));
        });
      });
    },
    speak(text) {
      return new Promise((resolve) => {
        const synth = globalThis.speechSynthesis;
        if (!synth) return resolve();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'pt-BR';
        u.rate = 0.9;
        u.onend = u.onerror = () => resolve();
        finish = resolve;
        synth.speak(u);
      });
    },
    stop() {
      try { audioEl.pause(); } catch { /* ignora */ }
      try { globalThis.speechSynthesis?.cancel(); } catch { /* ignora */ }
      finish?.();
      finish = null;
    },
  };
}

// Player do modo de teste: só registra o ID falado.
export function createTestPlayer(log) {
  return {
    playUrl(url, id) { log.push(id); return Promise.resolve(true); },
    speak(text, id) { log.push(id); return Promise.resolve(); },
    stop() {},
  };
}
