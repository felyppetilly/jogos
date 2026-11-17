// Gerador aleatório com semente (mulberry32): mesma semente, mesma sequência.
export function createRng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min, max) => min + Math.floor(next() * (max - min + 1));
  const pick = (arr) => arr[int(0, arr.length - 1)];
  const shuffle = (arr) => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = int(0, i);
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  return { next, int, pick, shuffle };
}
