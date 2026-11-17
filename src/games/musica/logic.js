// Siga a Música — regras puras (sem tela).
export const LEVELS = {
  1: { keys: 3, len: [2, 2] },
  2: { keys: 3, len: [3, 3] },
  3: { keys: 4, len: [3, 4] },
  4: { keys: 5, len: [4, 5] },
  5: { keys: 5, len: [5, 6] },
};

export function generateSequence(level, rng) {
  const { keys, len } = LEVELS[level];
  const n = rng.int(len[0], len[1]);
  const seq = [];
  while (seq.length < n) {
    const k = rng.int(0, keys - 1);
    const l = seq.length;
    if (l >= 2 && seq[l - 1] === k && seq[l - 2] === k) continue;
    seq.push(k);
  }
  return seq;
}

export function checkInput(seq, input) {
  for (let i = 0; i < input.length; i++) if (input[i] !== seq[i]) return 'errada';
  return input.length === seq.length ? 'completa' : 'continua';
}
