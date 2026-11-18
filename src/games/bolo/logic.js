// Continhas no Bolo — regras puras (sem tela).
export const COBERTURAS = [
  { id: 'morango', emoji: '1F353' },
  { id: 'cereja', emoji: '1F352' },
  { id: 'docinho', emoji: '1F36C' },
];

function opcoes(resposta, rng) {
  const candidatos = [-2, -1, 1, 2].map((d) => resposta + d).filter((v) => v >= 0 && v <= 10);
  const [d1, d2] = rng.shuffle(candidatos);
  return rng.shuffle([resposta, d1, d2]);
}

export function generateRound(level, rng) {
  const cobertura = rng.pick(COBERTURAS);
  const c = cobertura.id;
  let tipo, a, b, resposta, falas;
  if (level <= 1) {
    tipo = 'contar'; a = rng.int(3, 10); b = 0; resposta = a;
    falas = [`bolo.quantos.${c}`];
  } else if (level === 2) {
    tipo = 'somar'; b = rng.int(1, 4); a = rng.int(1, 5 - b); resposta = a + b;
    falas = [`bolo.tem.${c}.${a}`, `bolo.caiu.${c}.${b}`];
  } else if (level === 3) {
    tipo = 'somar';
    const total = rng.int(4, 10);
    b = rng.int(1, Math.min(5, total - 1)); a = total - b; resposta = total;
    falas = [`bolo.tem.${c}.${a}`, `bolo.caiu.${c}.${b}`];
  } else {
    tipo = 'tirar'; a = rng.int(2, 10); b = rng.int(1, Math.min(3, a)); resposta = a - b;
    falas = [`bolo.tem.${c}.${a}`, `bolo.comeu.${c}.${b}`];
  }
  return { tipo, cobertura, a, b, resposta, opcoes: opcoes(resposta, rng), falas };
}

// Distribui n coberturas em fileiras dentro da caixa, cada uma numa célula
// de pelo menos alvoPx (então nunca se sobrepõem). Devolve o centro e o tamanho.
export function layoutPositions(n, box, alvoPx) {
  if (n <= 0) return [];
  let melhor = null;
  for (let fileiras = 1; fileiras <= n; fileiras++) {
    const porFileira = Math.ceil(n / fileiras);
    const cw = box.w / porFileira;
    const ch = box.h / fileiras;
    const tam = Math.min(cw, ch);
    if (!melhor || tam > melhor.tam) melhor = { fileiras, porFileira, cw, ch, tam };
    if (tam >= alvoPx) { melhor = { fileiras, porFileira, cw, ch, tam }; break; }
  }
  const { fileiras, porFileira, cw, ch, tam } = melhor;
  const pos = [];
  for (let f = 0; f < fileiras; f++) {
    const naFileira = Math.min(porFileira, n - f * porFileira);
    const sobra = (porFileira - naFileira) * cw / 2; // centraliza fileira incompleta
    for (let i = 0; i < naFileira; i++) pos.push({ x: sobra + cw * (i + 0.5), y: ch * (f + 0.5), tam: Math.min(tam, alvoPx * 1.6) });
  }
  return pos;
}
