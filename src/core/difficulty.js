// Dificuldade adaptativa por jogo.
// - Rodada vencida sem erro soma na sequência; 3 seguidas sobem um nível.
// - 2º erro na mesma rodada pede dica.
// - 3 rodadas seguidas que precisaram de dica descem um nível (em silêncio).
// O nível fica salvo no aparelho; se o armazenamento falhar, começa do mínimo.

const SOBE_APOS = 3;
const DICA_NO_ERRO = 2;
const DESCE_APOS = 3;

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function createDifficulty({ gameId, minLevel, maxLevel, storage = defaultStorage() }) {
  const key = `jogos.nivel.${gameId}`;

  let level = minLevel;
  try {
    const raw = storage?.getItem(key);
    const n = Number(raw);
    if (raw !== null && raw !== undefined && Number.isInteger(n) && n >= minLevel && n <= maxLevel) level = n;
  } catch { /* armazenamento indisponível */ }

  const save = () => {
    try { storage?.setItem(key, String(level)); } catch { /* ignora */ }
  };

  let streak = 0;
  let hintedRounds = 0;
  let wrongInRound = 0;

  return {
    get level() { return level; },
    startRound() { wrongInRound = 0; },
    recordWrong() {
      wrongInRound++;
      return { showHint: wrongInRound >= DICA_NO_ERRO };
    },
    recordWin() {
      let levelChanged = 0;
      if (wrongInRound === 0) {
        streak++;
        hintedRounds = 0;
      } else {
        streak = 0;
        if (wrongInRound >= DICA_NO_ERRO) hintedRounds++;
      }
      if (streak >= SOBE_APOS) {
        streak = 0;
        if (level < maxLevel) { level++; levelChanged = 1; save(); }
      }
      if (hintedRounds >= DESCE_APOS) {
        hintedRounds = 0;
        if (level > minLevel) { level--; levelChanged = -1; save(); }
      }
      wrongInRound = 0;
      return { levelChanged };
    },
  };
}
