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

export const testLog = { vozLog: [], rodada: null };
