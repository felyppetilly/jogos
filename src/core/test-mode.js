// Modo de teste: ativado com ?teste=1 na URL. Usado pelos testes automáticos
// para ler o que foi falado e qual é a rodada atual, sem tocar áudio real.

const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

export function isTestMode() {
  return params.get('teste') === '1';
}

export function getSeed() {
  const s = Number(params.get('semente'));
  if (Number.isFinite(s) && s > 0) return s;
  return isTestMode() ? 1 : (Date.now() % 2147483647) || 1;
}

// Quanto o tempo é acelerado no modo de teste (?acelera=N; padrão 50).
export function getAccel() {
  if (!isTestMode()) return 1;
  const a = Number(params.get('acelera'));
  return Number.isFinite(a) && a > 0 ? a : 50;
}

export const testLog = { vozLog: [], rodada: null };
