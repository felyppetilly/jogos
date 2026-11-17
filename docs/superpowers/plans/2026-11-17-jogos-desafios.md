# Jogos da Filha — 3 Desafios — Plano de Implementação

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** construir um site PWA, instalável no iPad e no iPhone, com tela inicial e 3 desafios falados em pt-BR (Siga a Música, Letra Inicial com Dinossauros e Continhas no Bolo), com dificuldade adaptativa e funcionamento offline.

**Arquitetura:** site estático com Vite e JavaScript puro em módulos ES. Roteamento por hash. Cada jogo tem um `logic.js` puro, testado com Vitest, e um `view.js` que monta DOM + SVG e anima com GSAP. Um núcleo compartilhado cuida da voz (clipes mp3 por ID, com prioridade para gravação substituta e fallback para a voz do navegador), das notas (Web Audio), da dificuldade, da comemoração e da moldura do jogo. Os clipes de voz são gerados uma única vez por script, com a TTS da OpenAI, e versionados.

**Stack:** Node 24, Vite 6, Vitest 3, @playwright/test (projetos WebKit iPhone/iPad), GSAP 3.13, vite-plugin-pwa 1.x, OpenMoji 15 (SVGs coloridos, CC BY-SA 4.0), OpenAI TTS (`gpt-4o-mini-tts`).

**Spec:** `docs/specs/2026-11-17-jogos-desafios-design.md`. Leia junto com este plano.

## Restrições globais

- Todo texto falado, comentário e mensagem de commit em **português do Brasil**. Os commits terminam com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Nenhum link externo** e nenhum `<a href>` para fora do site. Nada de anúncios, analytics ou fontes remotas: tudo é servido localmente.
- **Nenhum texto obrigatório para a criança.** Toda instrução é falada. Texto escrito só aparece na dica de instalação para os pais e nos créditos.
- **Erro nunca pune:** não há game over, vidas, pontos perdidos, cronômetro ou som de erro estridente. Errar faz o elemento balançar, toca um incentivo e dá outra chance.
- **Alvos de toque:** no mínimo 80px no iPad e 60px no iPhone. Na prática, `min(80px, 16vmin)` com piso de 60px.
- **Responsivo:** do iPhone (375×667) ao iPad (1024×768 ou maior), em paisagem e retrato.
- **iOS:** sem Fullscreen API. Modo app via manifest `display: "standalone"` + `<meta name="apple-mobile-web-app-capable" content="yes">` + `apple-touch-icon` 180px. Áudio só depois do primeiro toque. Definir `navigator.audioSession.type = "playback"` quando existir. A voz toca por `HTMLAudioElement`.
- **Gestos do sistema:** `touch-action: manipulation`, `-webkit-touch-callout: none`, `user-select: none`, `overscroll-behavior: none` e body sem rolagem.
- **Entrada:** usar `pointerdown`, não `click`, para a resposta ser imediata.
- **Comemoração grande** a cada **5 rodadas vencidas** em todos os jogos.
- **Dificuldade:** uma rodada resolvida **sem erro** soma 1 à sequência de acertos. Com **3 seguidos**, sobe um nível. No **2º erro** da mesma rodada, mostra a dica. Com **3 rodadas seguidas** que precisaram de dica, desce um nível sem avisar. O nível fica salvo em `localStorage["jogos.nivel.<jogoId>"]`.
- **Modo de teste:** a URL com `?teste=1` ativa `window.__jogos = { vozLog: string[], rodada: object|null }`, troca o player de voz por um que resolve na hora e registra os IDs falados, acelera o GSAP (`gsap.globalTimeline.timeScale(50)`) e fixa a semente aleatória em `?semente=N` (padrão 1).

## Foco da revisão

1. **Toques rápidos ou repetidos durante animação ou fala.** A entrada fica bloqueada enquanto o jogo está "ocupado" (tocando a sequência, comemorando, animando o ovo). Um segundo toque não pontua duas vezes. Testes nas Tarefas 5, 6 e 7.
2. **Fila de voz acumulando.** Ao contar morangos depressa, cada toque **interrompe** a fala anterior, sem empilhar 10 frases. Teste na Tarefa 3.
3. **Girar o aparelho no meio do jogo.** O layout se recalcula e todos os alvos continuam dentro da tela. Teste na Tarefa 7, que é a mais densa.
4. **App em segundo plano e de volta.** O iOS suspende o `AudioContext`, e ele precisa ser retomado no `visibilitychange`. Teste na Tarefa 3.
5. **`localStorage` indisponível ou com lixo.** O nível volta ao mínimo, sem quebrar. Teste na Tarefa 2.

---

## Estrutura de arquivos

```
index.html                     tela única; metatags iOS; <div id="app">
vite.config.js                 base via env BASE_PATH (padrão "/"); plugin PWA (Tarefa 9)
playwright.config.js           projetos: webkit "iPhone 13" e "iPad (gen 7) landscape"
src/main.js                    boot: modo de teste, desbloqueio de áudio, roteador
src/styles/base.css            tokens de cor, alvos de toque, layout, regras de gesto
src/core/random.js             RNG com semente
src/core/difficulty.js         dificuldade adaptativa (puro)
src/core/phrases.js            catálogo ID → texto de TODAS as falas
src/core/voice.js              resolução de clipe + fila + interrupção
src/core/audio.js              desbloqueio iOS, AudioContext, notas, efeitos
src/core/celebrate.js          confete / pulo / comemoração grande (GSAP)
src/core/shell.js              moldura do jogo: casinha, ouvir de novo, ocupado
src/core/test-mode.js          detecção de ?teste=1, vozLog, semente
src/router.js                  rotas por hash
src/screens/start.js           botão "começar" + dica de instalação iOS
src/screens/menu.js            3 cartões
src/games/musica/{logic,view}.js
src/games/letras/{words,logic,view}.js
src/games/bolo/{logic,view}.js
scripts/gerar-vozes.mjs        TTS OpenAI → public/audio/voz/<id>.mp3
scripts/manifesto-audio.mjs    varre voz/ e gravado/ → public/audio/manifesto.json
scripts/copiar-openmoji.mjs    copia só os SVGs usados → public/img/emoji/
public/audio/gravado/.gitkeep  (futuras gravações do pai: <id>.mp3)
public/icons/                  apple-touch-icon-180.png, icon-192.png, icon-512.png
public/creditos.txt            atribuição OpenMoji CC BY-SA 4.0
tests/unit/*.test.js           Vitest
tests/e2e/*.spec.js            Playwright
```

---

### Task 1: Esqueleto do projeto

**Arquivos:**
- Criar: `package.json`, `index.html`, `vite.config.js`, `vitest.config.js`, `playwright.config.js`, `.gitignore`, `src/main.js`, `src/styles/base.css`, `src/core/test-mode.js`, `tests/e2e/esqueleto.spec.js`

**Interfaces:**
- Produz: `isTestMode(): boolean`, `getSeed(): number` e `testLog: { vozLog: string[], rodada: object|null }`, que fica em `window.__jogos` quando o modo de teste está ativo. Tudo em `src/core/test-mode.js`.
- Produz: os scripts npm `dev`, `build`, `preview`, `test` (vitest run), `e2e` (playwright test), `vozes` (gerar-vozes + manifesto), `emoji` (copiar-openmoji).

- [ ] **Passo 1:** `git init` em `c:\Users\Felyppe Tilly\Documents\Projetos\Jogos` e `.gitignore` com `node_modules`, `dist`, `test-results`, `playwright-report` e `.env`.
- [ ] **Passo 2:** `npm init -y`, depois `npm i gsap` e `npm i -D vite@6 vitest@3 @playwright/test vite-plugin-pwa openmoji`, depois `npx playwright install webkit`.
- [ ] **Passo 3:** `index.html` com `lang="pt-BR"`, viewport `width=device-width, initial-scale=1, viewport-fit=cover`, as metatags iOS das Restrições globais, `<div id="app">` e `<script type="module" src="/src/main.js">`. `base.css` com as regras de gesto, `body { margin:0; position:fixed; inset:0; overflow:hidden }`, padding com `env(safe-area-inset-*)` e a variável `--alvo: max(60px, min(80px, 16vmin))`.
- [ ] **Passo 4:** `playwright.config.js` com `webServer: npm run dev -- --port 5199`, `baseURL http://localhost:5199` e os projetos `devices['iPhone 13']` e `devices['iPad (gen 7) landscape']`.
- [ ] **Passo 5: escrever o teste que falha** em `tests/e2e/esqueleto.spec.js`:

```js
test('carrega e expõe o modo de teste', async ({ page }) => {
  await page.goto('/?teste=1&semente=7');
  await expect(page.locator('#app')).toBeVisible();
  expect(await page.evaluate(() => Array.isArray(window.__jogos.vozLog))).toBe(true);
});
```

- [ ] **Passo 6:** rodar `npm run e2e`. Esperado: FALHA (`window.__jogos` indefinido).
- [ ] **Passo 7:** implementar `test-mode.js`. `main.js` o importa e, se `isTestMode()`, atribui `window.__jogos = testLog`.
- [ ] **Passo 8:** rodar `npm run e2e`. Esperado: PASSA nos 2 projetos.
- [ ] **Passo 9:** commit `chore: esqueleto do projeto com Vite, Vitest e Playwright`.

### Task 2: Aleatoriedade e dificuldade adaptativa

**Arquivos:**
- Criar: `src/core/random.js`, `src/core/difficulty.js`, `tests/unit/difficulty.test.js`, `tests/unit/random.test.js`

**Interfaces:**
- Produz: `createRng(seed: number) -> { next(): number /*[0,1)*/, int(min, max): number /*inclusive*/, pick(arr), shuffle(arr): arr /*cópia*/ }`. Use mulberry32.
- Produz: `createDifficulty({ gameId: string, minLevel: number, maxLevel: number, storage?: Storage }) -> { readonly level: number, startRound(): void, recordWrong(): { showHint: boolean }, recordWin(): { levelChanged: -1|0|1 } }`.
  - `recordWin()` fecha a rodada: se ela teve 0 erros, `streak++` e `hintedRounds = 0`. Se teve erro, `streak = 0`. Se teve 2 ou mais erros, `hintedRounds++`. Com `streak === 3` e `level < max`: sobe e zera `streak`. Com `hintedRounds === 3` e `level > min`: desce e zera `hintedRounds`.
  - `recordWrong()` devolve `showHint: true` exatamente no 2º erro da rodada.
  - Ler e gravar o storage fica em try/catch. Valor inválido ou fora da faixa vira `minLevel`.

- [ ] **Passo 1: escrever os testes que falham:**

```js
test('mesma semente, mesma sequência', () => {
  const a = createRng(5), b = createRng(5);
  expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
});
test('int é inclusivo e fica na faixa', () => {
  const r = createRng(1);
  for (let i = 0; i < 500; i++) { const v = r.int(2, 4); expect(v).toBeGreaterThanOrEqual(2); expect(v).toBeLessThanOrEqual(4); }
});
test('3 vitórias sem erro sobem um nível', () => { /* storage em memória; 3x startRound+recordWin → level 2; 3ª chamada devolve levelChanged 1 */ });
test('vitória com erro zera a sequência', () => { /* win, win, (wrong, win), win → ainda nível 1 */ });
test('dica no segundo erro da rodada', () => { /* wrong → showHint false; wrong → true; wrong → false */ });
test('3 rodadas com dica descem um nível', () => { /* começa no nível 3 salvo; 3x (wrong,wrong,win) → nível 2 */ });
test('não passa do máximo nem do mínimo', () => { /* maxLevel 2: 6 vitórias → 2; minLevel 1: 3 rodadas com dica → 1 */ });
test('persiste em jogos.nivel.<id>', () => { /* após subir, storage.getItem('jogos.nivel.musica') === '2'; nova instância lê 2 */ });
test('storage que lança exceção ou valor lixo não quebra', () => {
  const quebrado = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  expect(createDifficulty({ gameId:'a', minLevel:1, maxLevel:5, storage: quebrado }).level).toBe(1);
  const lixo = { getItem: () => 'abc', setItem() {} };
  expect(createDifficulty({ gameId:'a', minLevel:1, maxLevel:5, storage: lixo }).level).toBe(1);
});
```

- [ ] **Passo 2:** `npx vitest run tests/unit`. Esperado: FALHA (módulos inexistentes).
- [ ] **Passo 3:** implementar `random.js` e `difficulty.js` com as interfaces acima.
- [ ] **Passo 4:** `npx vitest run tests/unit`. Esperado: PASSA.
- [ ] **Passo 5:** commit `feat: rng com semente e dificuldade adaptativa`.

### Task 3: Catálogo de falas, voz e áudio

**Arquivos:**
- Criar: `src/core/phrases.js`, `src/core/voice.js`, `src/core/audio.js`, `scripts/manifesto-audio.mjs`, `public/audio/gravado/.gitkeep`, `public/audio/manifesto.json` (inicial: `{"voz":[],"gravado":[]}`), `tests/unit/voice.test.js`, `tests/unit/audio.test.js`, `tests/unit/phrases.test.js`

**Interfaces:**
- Produz `PHRASES: Record<string,string>` (ID → texto em pt-BR), `ELOGIOS: string[]` (IDs `elogio.1..8`), `INCENTIVOS: string[]` (`incentivo.1..4`) e `GRANDES: string[]` (`grande.1..3`). Os IDs usam o padrão `^[a-z0-9.\-]+$`, porque viram nome de arquivo.
  - **IDs fixos usados pelas tarefas seguintes:**
    - Início e menu: `inicio.oi` ("Oi! Vamos brincar?"), `menu.musica` ("Siga a música!"), `menu.letras` ("As letras dos dinossauros!"), `menu.bolo` ("Continhas no bolo!").
    - Música: `musica.escuta` ("Escuta…"), `musica.suavez` ("Agora é sua vez!"), `musica.denovo` ("Vamos ouvir de novo?"), `musica.livre` ("Agora toca do jeito que você quiser!").
    - Letras: `letras.nome.<L>` para as 26 letras, com o nome escrito para a TTS pronunciar certo (A "Á!", B "Bê!", C "Cê!", D "Dê!", E "É!", F "Éfe!", G "Gê!", H "Agá!", I "I!", J "Jota!", K "Cá!", L "Éle!", M "Ême!", N "Êne!", O "Ó!", P "Pê!", Q "Quê!", R "Érre!", S "Ésse!", T "Tê!", U "U!", V "Vê!", W "Dáblio!", X "Xis!", Y "Ípsilon!", Z "Zê!"). `letras.toque.<L>` ("Toque na letra Bê!"), `letras.pergunta.<palavraId>` ("Bola! Com que letra começa bola?") e `letras.dica.<palavraId>` ("Escuta só: bó… bó… bola!").
    - Bolo, para cada cobertura `c ∈ {morango, cereja, docinho}`:
      - `bolo.tem.<c>.<n>` com n de 1 a 10 ("Tem 1 morango no bolo." / "Tem 3 morangos no bolo.");
      - `bolo.caiu.<c>.<n>` com n de 1 a 5 ("Caiu mais 2 morangos! Quantos morangos tem agora?");
      - `bolo.comeu.<c>.<n>` com n de 1 a 3 ("O passarinho comeu 1 morango! Quantos sobraram?");
      - `bolo.quantos.<c>` ("Quantos morangos tem no bolo?").
    - Bolo, gerais: `num.<n>` com n de 0 a 10 ("zero!" … "dez!"), `bolo.vamoscontar` ("Vamos contar juntos?"), `bolo.pronto` ("O bolo ficou pronto! Assopra a velinha!"), `bolo.parabens` ("Parabéns pra você!").
  - Os IDs das letras e do bolo são **gerados por laço** em `phrases.js`, a partir de `WORDS` (Tarefa 6) e das listas de coberturas. Para não criar ciclo, `phrases.js` importa `words.js`, e `words.js` não importa nada.
- Produz `createVoice({ manifest: {voz:string[], gravado:string[]}, base: string, player }) -> { resolve(id), say(id, opts?): Promise<void>, sayAll(ids): Promise<void>, repeatLast(): Promise<void>, stop(): void }`.
  - `resolve(id)` devolve `{kind:'gravado', url}` se `id ∈ gravado`. Senão, `{kind:'voz', url}` se `id ∈ voz`. Senão, `{kind:'tts', text: PHRASES[id]}`. As URLs são `${base}audio/gravado/${id}.mp3` e `${base}audio/voz/${id}.mp3`.
  - `say(id, {interrupt:true})` chama `player.stop()`, esvazia a fila e fala já. Sem `interrupt`, a fala vai para a fila. `repeatLast()` repete o último ID da última instrução, ignorando elogios e números (`elogio.*`, `incentivo.*`, `grande.*`, `num.*`, `letras.nome.*`).
  - ID desconhecido: avisa no console e resolve sem falar.
  - Interface do `player`: `{ playUrl(url): Promise<void>, speak(text): Promise<void>, stop(): void }`. O player real usa um único `HTMLAudioElement` reaproveitado e `speechSynthesis` com `lang='pt-BR'`. No modo de teste, o player apenas faz `testLog.vozLog.push(id)` e resolve.
- Produz `audio.js`:
  - `unlockAudio(): Promise<void>`, chamado no 1º toque: cria e retoma o `AudioContext`, toca um silêncio no `HTMLAudioElement` e define `audioSession.type`.
  - `getAudioElement(): HTMLAudioElement`.
  - `playNote(index: 0..4, ms = 400): void`. Pentatônica: Dó4 261.63, Ré4 293.66, Mi4 329.63, Sol4 392.00, Lá4 440.00 Hz. Onda triângulo com envelope suave.
  - `playSfx(name: 'pop'|'tada'|'whoosh'|'boing'): void`, sintetizado.
  - `playMelody(notes: Array<[freqHz, ms]>): Promise<void>`.
  - `installVisibilityResume(doc = document, ctxGetter): void`: no `visibilitychange` para `visible`, chama `ctx.resume()` se o estado for `suspended` ou `interrupted`.
- `scripts/manifesto-audio.mjs`: lista `public/audio/voz/*.mp3` e `public/audio/gravado/*.mp3` e grava `public/audio/manifesto.json` com os IDs ordenados. Entra como `prebuild` e `predev` no `package.json`.

- [ ] **Passo 1: escrever os testes que falham:**

```js
// phrases.test.js
test('todos os IDs são válidos como nome de arquivo', () => { for (const id of Object.keys(PHRASES)) expect(id).toMatch(/^[a-z0-9.\-]+$/); });
test('26 nomes de letras e 26 "toque"', () => { /* conta letras.nome.* e letras.toque.* === 26 */ });
test('bolo: singular e plural', () => {
  expect(PHRASES['bolo.tem.morango.1']).toBe('Tem 1 morango no bolo.');
  expect(PHRASES['bolo.tem.morango.3']).toBe('Tem 3 morangos no bolo.');
});
// voice.test.js — player falso que registra chamadas
test('prioridade: gravado > voz > tts', () => { /* manifest {voz:['a','b'], gravado:['a']} → resolve('a').kind 'gravado', 'b' 'voz', 'inicio.oi' 'tts' */ });
test('fila não sobrepõe', async () => { /* player cuja promessa fica pendente; say(x); say(y) → só 1 playUrl até a 1ª resolver */ });
test('interrupt esvazia a fila', async () => { /* say(x1..x5) sem interrupt (x1 tocando, pendente); say(z,{interrupt:true}) → stop chamado; ao final playUrl foi chamado só para x1 e z, nunca x2..x5 */ });
test('repeatLast ignora elogios e números', async () => { /* say('musica.escuta'); say('elogio.1'); say('num.3'); repeatLast() → toca musica.escuta */ });
// audio.test.js
test('retoma AudioContext ao voltar para a frente', () => {
  const ctx = { state: 'suspended', resume: vi.fn() };
  const doc = new EventTarget(); doc.visibilityState = 'visible';
  installVisibilityResume(doc, () => ctx);
  doc.dispatchEvent(new Event('visibilitychange'));
  expect(ctx.resume).toHaveBeenCalled();
});
```

- [ ] **Passo 2:** `npx vitest run tests/unit`. Esperado: FALHA.
- [ ] **Passo 3:** implementar `phrases.js`. Para não travar nesta tarefa, `words.js` pode começar como `export const WORDS = []` e é preenchido na Tarefa 6. Implementar também `voice.js`, `audio.js` e o script de manifesto, e registrar `prebuild`/`predev`.
- [ ] **Passo 4:** `npx vitest run tests/unit`. Esperado: PASSA.
- [ ] **Passo 5:** commit `feat: catálogo de falas, voz com fila e áudio para iOS`.

### Task 4: Telas de início e menu, roteador, moldura e comemoração

**Arquivos:**
- Criar: `src/router.js`, `src/screens/start.js`, `src/screens/menu.js`, `src/core/shell.js`, `src/core/celebrate.js`, `tests/unit/router.test.js`, `tests/e2e/navegacao.spec.js`
- Modificar: `src/main.js`, `src/styles/base.css`

**Interfaces:**
- Consome: `createVoice`, `unlockAudio`, `installVisibilityResume`, `testLog`, `isTestMode`.
- Produz `parseRoute(hash: string) -> 'menu'|'musica'|'letras'|'bolo'`. Hash vazio ou desconhecido vira `'menu'`. `navigate(route)` muda o hash.
- Produz o contrato de jogo que as Tarefas 5–7 implementam: `export function mount(root: HTMLElement, ctx: GameCtx): () => void`, que devolve uma função de desmontagem. Formato de `GameCtx`:
  - `voice`, `rng`;
  - `difficulty(gameId, minLevel, maxLevel)`;
  - `shell: { setBusy(b: boolean), isBusy(): boolean, onRepeat(fn) }`;
  - `celebrate: { small(el?), big(): Promise<void> }`;
  - `testLog`.
- `shell.js` desenha a moldura: botão casinha (canto superior esquerdo, volta ao menu) e botão de ouvido (canto superior direito, chama `voice.repeatLast()`), os dois com `data-testid="casinha"` e `"ouvir"`. Com `setBusy(true)`, o root ganha a classe `ocupado`, e os handlers dos jogos devem checar `isBusy()` antes de agir.
- `celebrate.small(el)` faz o elemento pular, toca `pop` e fala um elogio sorteado. `big()` mostra ~60 confetes SVG com GSAP, toca `tada`, fala um `grande.*` sorteado e resolve ao terminar.
- Tela de início: um único botão gigante com `data-testid="comecar"`. No `pointerdown`, chama `unlockAudio()` e `voice.say('inicio.oi')` e vai para o menu. Se `/iPad|iPhone/` estiver no userAgent (ou for iPad com cara de Mac: `navigator.maxTouchPoints > 1`) e `navigator.standalone !== true`, mostra embaixo a dica escrita para os pais: "Para instalar: toque em Compartilhar e depois em Adicionar à Tela de Início."
- Menu: 3 cartões grandes só com ilustração, com `data-testid="cartao-musica|cartao-letras|cartao-bolo"`. O 1º toque fala `menu.<jogo>` e abre o jogo.

- [ ] **Passo 1: escrever os testes que falham:** `router.test.js` (`parseRoute('#/bolo') === 'bolo'`, `''` e `'#/xyz'` dão `'menu'`) e `navegacao.spec.js`:

```js
test('começar → menu → jogo → casinha', async ({ page }) => {
  await page.goto('/?teste=1');
  await page.getByTestId('comecar').click();
  await expect(page.getByTestId('cartao-musica')).toBeVisible();
  expect(await page.evaluate(() => window.__jogos.vozLog)).toContain('inicio.oi');
  await page.getByTestId('cartao-bolo').click();
  await expect(page).toHaveURL(/#\/bolo/);
  expect(await page.evaluate(() => window.__jogos.vozLog)).toContain('menu.bolo');
  await page.getByTestId('casinha').click();
  await expect(page.getByTestId('cartao-bolo')).toBeVisible();
});
test('cartões têm pelo menos 60px e cabem na tela', async ({ page }) => { /* boundingBox de cada cartão: width/height >= 60 e dentro do viewport */ });
test('não há links externos', async ({ page }) => { /* page.locator('a[href^="http"]') tem count 0 */ });
```

  Como as rotas dos jogos ainda não existem, cada rota monta um placeholder vazio com a moldura até as Tarefas 5–7.
- [ ] **Passo 2:** `npx vitest run tests/unit && npm run e2e`. Esperado: FALHA.
- [ ] **Passo 3:** implementar. Visual: fundo claro e quente, cartões arredondados, ilustrações de cartão com os emojis OpenMoji 🎹 1F3B9, 🦕 1F995 e 🎂 1F382 (copiados a mão para `public/img/emoji/` por enquanto; o script da Tarefa 6 passa a copiá-los).
- [ ] **Passo 4:** `npx vitest run tests/unit && npm run e2e`. Esperado: PASSA nos 2 projetos.
- [ ] **Passo 5:** commit `feat: início, menu, roteador, moldura e comemoração`.

### Task 5: Siga a Música

**Arquivos:**
- Criar: `src/games/musica/logic.js`, `src/games/musica/view.js`, `tests/unit/musica.test.js`, `tests/e2e/musica.spec.js`
- Modificar: `src/router.js` (rota `musica` → `mount`)

**Interfaces:**
- Consome: o contrato `mount`/`GameCtx` da Tarefa 4, `playNote` e `createDifficulty`.
- Produz `LEVELS = {1:{keys:3,len:[2,2]}, 2:{keys:3,len:[3,3]}, 3:{keys:4,len:[3,4]}, 4:{keys:5,len:[4,5]}, 5:{keys:5,len:[5,6]}}` (gameId `musica`, mín 1, máx 5).
- Produz `generateSequence(level, rng) -> number[]`, com índices de tecla em `0..keys-1`, comprimento sorteado em `len`, e nunca a mesma tecla 3 vezes seguidas.
- Produz `checkInput(seq, input) -> 'continua'|'completa'|'errada'`.
- Cores das teclas por índice: vermelho, laranja, amarelo, verde, azul (mesma ordem das notas de `playNote`). As teclas ficam em `data-testid="tecla-<i>"`.
- Fluxo de uma rodada:
  1. `setBusy(true)`, fala `musica.escuta` e toca a sequência (cada tecla acende e soa, 600ms por nota).
  2. Fala `musica.suavez` e `setBusy(false)`.
  3. Cada toque soa e acende a tecla. Se a entrada for `errada`: a tecla balança, `recordWrong()`, fala `musica.denovo`, e a **mesma** sequência toca de novo. Se for o 2º erro (dica), a repetição fica mais lenta (900ms por nota).
  4. Se for `completa`: `recordWin()`, `celebrate.small()`, e a cada 5 vitórias `celebrate.big()`. Depois vem a próxima rodada.
- Botão `data-testid="tocar-livre"`: alterna para o modo livre (fala `musica.livre`, as teclas só tocam, sem rodada). Tocar de novo volta ao desafio.
- No modo de teste: `testLog.rodada = { seq }`.

- [ ] **Passo 1: escrever os testes que falham:**

```js
test('comprimento e faixa por nível', () => { /* para cada nível, 200 sequências: len dentro de LEVELS[n].len e todo índice < keys */ });
test('nunca 3 notas iguais seguidas', () => { /* 1000 sequências nível 5 */ });
test('checkInput', () => {
  expect(checkInput([0,1,2],[0])).toBe('continua');
  expect(checkInput([0,1,2],[0,1,2])).toBe('completa');
  expect(checkInput([0,1,2],[0,2])).toBe('errada');
});
// e2e
test('acertar a sequência comemora e gera outra', async ({ page }) => { /* abre #/musica?teste=1; lê window.__jogos.rodada.seq; toca as teclas na ordem; vozLog contém um 'elogio.*'; rodada.seq mudou de referência */ });
test('errar repete a mesma sequência', async ({ page }) => { /* toca tecla errada; vozLog contém 'musica.denovo'; rodada.seq igual à anterior */ });
test('toques durante a reprodução são ignorados', async ({ page }) => { /* enquanto ocupado (classe .ocupado), tocar uma tecla não altera o resultado: a rodada continua aguardando a sequência completa */ });
test('5 teclas cabem no iPhone em retrato', async ({ page }) => { /* subir ao nível 5 via localStorage 'jogos.nivel.musica'='5'; as 5 teclas visíveis, largura >= 60, dentro do viewport */ });
```

- [ ] **Passo 2:** rodar `npx vitest run tests/unit/musica.test.js && npx playwright test tests/e2e/musica.spec.js`. Esperado: FALHA.
- [ ] **Passo 3:** implementar `logic.js` e `view.js`. Visual: xilofone com teclas arredondadas em leque. Ao tocar, a tecla brilha e afunda (GSAP `scale` + `filter: brightness`).
- [ ] **Passo 4:** rodar de novo. Esperado: PASSA.
- [ ] **Passo 5:** commit `feat: jogo Siga a Música`.

### Task 6: Letra Inicial com Dinossauros

**Arquivos:**
- Criar: `src/games/letras/logic.js`, `src/games/letras/view.js`, `scripts/copiar-openmoji.mjs`, `public/creditos.txt`, `tests/unit/letras.test.js`, `tests/e2e/letras.spec.js`
- Modificar: `src/games/letras/words.js` (preencher), `src/router.js`

**Interfaces:**
- Produz `WORDS: Array<{ id: string, palavra: string, letra: string, emoji: string /*código OpenMoji, ex. '26BD'*/ }>`. Lista inicial (o executor pode trocar uma palavra se o emoji não existir no OpenMoji, mantendo as regras do teste):
  - A abelha 1F41D, avião 2708
  - B bola 26BD, banana 1F34C
  - C cavalo 1F40E, casa 1F3E0
  - D dado 1F3B2, dinossauro 1F995
  - E estrela 2B50, elefante 1F418
  - F foca 1F9AD, flor 1F33C
  - G gato 1F408, galinha 1F414
  - I ilha 1F3DD, ímã 1F9F2
  - J jacaré 1F40A, joaninha 1F41E
  - K kiwi 1F95D
  - L leão 1F981, lua 1F319
  - M macaco 1F412, maçã 1F34E
  - N navio 1F6A2, nuvem 2601
  - O ovo 1F95A, óculos 1F453
  - P pato 1F986, peixe 1F41F
  - R rato 1F400, relógio 23F0
  - S sapo 1F438, sol 2600
  - T tartaruga 1F422, tomate 1F345
  - U uva 1F347, urso 1F43B
  - V vaca 1F404, violão 1F3B8
  - Z zebra 1F993
  - IDs = palavra sem acento (`aviao`, `ima`, `leao`, `maca`, `oculos`, `relogio`, `violao`, `jacare`).
- Produz `LETRAS_INICIAIS = ['A','B','M','P','S','T']`, editável pelo pai, e `SIMILARES = [['B','D','P','R'], ['M','N','W'], ['E','F'], ['O','Q','C','G'], ['I','L','J'], ['U','V'], ['K','X']]`.
- Produz `generateRound(level, rng) -> { tipo: 'toque'|'palavra', alvo: string, palavra?: Word, opcoes: string[3] }` (gameId `letras`, mín **0**, máx 3):
  - nível 0: `tipo 'toque'`, alvo sorteado nas **26 letras**, distratores **fora do grupo similar** do alvo;
  - nível 1: `tipo 'palavra'`, palavra com letra em `LETRAS_INICIAIS`, distratores fora do grupo similar;
  - nível 2: qualquer palavra de `WORDS`, distratores fora do grupo similar;
  - nível 3: qualquer palavra, com **pelo menos 1 distrator do mesmo grupo similar**, quando o grupo existir (senão, comportamento do nível 2).
  - Opções sempre distintas e embaralhadas, contendo o alvo.
  - Nunca repete o mesmo alvo duas rodadas seguidas (`generateRound` recebe `prevAlvo?` como 3º parâmetro).
- `copiar-openmoji.mjs`: copia `node_modules/openmoji/color/svg/<CODE>.svg` para `public/img/emoji/<CODE>.svg`. Copia os de `WORDS` e também 1F995 (dino), 1F3B9, 1F382, 1F353 (morango), 1F352 (cereja), 1F36C (docinho), 1F426 (passarinho) e 1F56F (vela). Falha com mensagem clara se algum código não existir.
- `creditos.txt`: "Emojis: OpenMoji (openmoji.org), licença CC BY-SA 4.0." Esse texto não vira link.
- Fluxo da tela:
  - Dinossauro mamãe (1F995) ao lado de um ninho com 3 ovos SVG desenhados à mão (duas metades, para rachar), cada um com a letra maiúscula em fonte bastão grande. Ovos em `data-testid="ovo-<LETRA>"`.
  - Tipo `palavra`: mostra o emoji da palavra em destaque e fala `letras.pergunta.<id>`. Tipo `toque`: fala `letras.toque.<L>`.
  - Tocar um ovo fala `letras.nome.<L>` (com interrupt).
  - Ovo certo: `setBusy(true)`, o ovo racha, nasce um filhote (1F995 em escala menor, com matiz aleatório via `filter: hue-rotate`) que vai para a fileira do ninho, `celebrate.small()` e próxima rodada. Os filhotes ficam só na sessão; no iPhone, a fileira guarda no máximo 8 e os mais antigos saem.
  - Ovo errado: balança e fala um `incentivo.*`. Na dica (2º erro): fala `letras.dica.<id>` (ou repete `letras.toque.<L>`) e o ovo certo brilha pulsando.
- No modo de teste: `testLog.rodada = { alvo, tipo, opcoes }`.

- [ ] **Passo 1: escrever os testes que falham:**

```js
test('palavras: letra = primeira letra sem acento, sem começos ambíguos', () => {
  for (const w of WORDS) {
    expect(w.palavra.normalize('NFD').replace(/\p{M}/gu,'')[0].toUpperCase()).toBe(w.letra);
    expect(w.palavra).not.toMatch(/^(h|ch|qu|lh|nh)/i);
  }
});
test('cobertura: pelo menos 20 letras com palavra', () => { /* new Set(WORDS.map(w=>w.letra)).size >= 20 */ });
test('todo emoji existe no pacote openmoji', () => { /* fs.existsSync(`node_modules/openmoji/color/svg/${w.emoji}.svg`) */ });
test('nível 0 sorteia das 26 letras e evita similares', () => { /* 2000 rodadas: conjunto de alvos tem 26; nenhuma opção no mesmo grupo similar do alvo */ });
test('nível 1 só usa LETRAS_INICIAIS', () => {});
test('nível 3 inclui distrator similar quando existe grupo', () => { /* alvo 'B' → opcoes ∩ {D,P,R} não vazio */ });
test('opções distintas, contêm o alvo, sem repetir alvo seguido', () => {});
// e2e
test('acertar o ovo faz nascer filhote', async ({ page }) => { /* #/letras?teste=1; toca ovo-<alvo>; vozLog contém letras.nome.<alvo> e um elogio.*; existe 1 filhote no ninho */ });
test('segundo erro mostra dica', async ({ page }) => { /* toca 2 ovos errados; ovo certo tem classe 'dica' */ });
test('toque duplo no ovo certo conta uma vez', async ({ page }) => { /* dois pointerdown rápidos no ovo certo → 1 filhote */ });
```

- [ ] **Passo 2:** rodar os testes de letras. Esperado: FALHA.
- [ ] **Passo 3:** preencher `words.js`. Rodar `npm run emoji`. Implementar `logic.js` e `view.js`, e confirmar que `phrases.js` passa a gerar as falas de `letras.pergunta.*` e `letras.dica.*` a partir de `WORDS`.
- [ ] **Passo 4:** rodar os testes de letras e a suíte unitária inteira (o teste de `phrases` continua passando). Esperado: PASSA.
- [ ] **Passo 5:** commit `feat: jogo Letra Inicial com Dinossauros`.

### Task 7: Continhas no Bolo

**Arquivos:**
- Criar: `src/games/bolo/logic.js`, `src/games/bolo/view.js`, `tests/unit/bolo.test.js`, `tests/e2e/bolo.spec.js`
- Modificar: `src/router.js`

**Interfaces:**
- Produz `COBERTURAS = [{id:'morango', emoji:'1F353'}, {id:'cereja', emoji:'1F352'}, {id:'docinho', emoji:'1F36C'}]`.
- Produz `generateRound(level, rng) -> { tipo: 'contar'|'somar'|'tirar', cobertura, a: number, b: number, resposta: number, opcoes: number[3], falas: string[] }` (gameId `bolo`, mín 1, máx 4):
  - nível 1, `contar`: `a ∈ 3..10`, `b = 0`, resposta `a`. Falas: `['bolo.quantos.<c>']`.
  - nível 2, `somar`: `a ≥ 1`, `b ∈ 1..4`, `a+b ≤ 5`. Falas: `['bolo.tem.<c>.<a>', 'bolo.caiu.<c>.<b>']`.
  - nível 3, `somar`: `a ≥ 1`, `b ∈ 1..5`, `a+b ∈ 4..10`.
  - nível 4, `tirar`: `a ∈ 2..10`, `b ∈ 1..3`, `b ≤ a`, resposta `a-b`. Falas: `['bolo.tem.<c>.<a>', 'bolo.comeu.<c>.<b>']`.
  - Opções: 3 números distintos em `0..10`, incluindo a resposta, com distratores a ±1 ou ±2 dela, embaralhados.
- Produz `layoutPositions(n: number, box: {w, h}, alvoPx: number) -> Array<{x, y}>`: até 10 posições sobre o topo do bolo, sem sobreposição (distância entre centros ≥ `alvoPx`) e dentro de `box`. Duas fileiras escalonadas; diminui a escala do emoji se precisar, mas nunca abaixo de `alvoPx`.
- Fluxo da tela:
  - Bolo SVG desenhado à mão (2 andares, cobertura escorrendo), velas acumuladas no topo e 3 botões de numeral grandes embaixo, em `data-testid="numero-<n>"`. As coberturas ficam em `data-testid="cobertura"`.
  - Início da rodada (`setBusy(true)`): as `a` coberturas aparecem e a 1ª fala é dita. Em `somar`, as `b` caem do alto com quique (GSAP `bounce.out`) e a 2ª fala é dita. Em `tirar`, o passarinho (1F426) entra voando, leva `b` coberturas e a 2ª fala é dita. Depois, `setBusy(false)`.
  - Tocar uma cobertura conta em voz alta: a k-ésima cobertura **distinta** tocada fala `num.<k>` (com interrupt) e ganha um selo com o número. Tocar a mesma de novo não avança a contagem.
  - Tocar um número fala `num.<n>` (com interrupt). Se for o certo: ganha uma vela, `celebrate.small()`, e na 5ª vela fala `bolo.pronto` e espera o toque na vela (`data-testid="vela"`). O toque apaga as chamas (`whoosh`), toca `playMelody` com o "Parabéns pra você" e fala `bolo.parabens` (equivale à `celebrate.big()`). Depois vem um bolo novo. Se for errado: o botão balança, `recordWrong()`. Na dica: fala `bolo.vamoscontar`, as coberturas são contadas uma a uma (cada uma pula + `num.k`) e ela escolhe de novo.
  - Ao girar ou redimensionar (`resize`), as posições são recalculadas com `layoutPositions`.
- No modo de teste: `testLog.rodada = { tipo, a, b, resposta, opcoes }`.

- [ ] **Passo 1: escrever os testes que falham:**

```js
test('faixas por nível', () => { /* 2000 rodadas por nível; asserts das faixas acima; resposta ∈ opcoes; opcoes distintas em 0..10 */ });
test('falas existem no catálogo', () => { /* toda id em r.falas ∈ PHRASES */ });
test('layout: 10 posições sem sobreposição e dentro da caixa', () => {
  for (const box of [{w:300,h:120},{w:700,h:220}]) {
    const p = layoutPositions(10, box, 60);
    expect(p).toHaveLength(10);
    /* todos dentro de box; distância par a par >= 60 */
  }
});
// e2e
test('somar: acertar ganha vela', async ({ page }) => { /* força nível 2 via localStorage; lê rodada.resposta; toca numero-<resposta>; 1 vela; vozLog contém elogio.* */ });
test('contar tocando conta uma vez cada', async ({ page }) => { /* nível 1; toca a mesma cobertura 2x e outra 1x → vozLog termina com num.1, num.2 (não num.3) */ });
test('5 acertos → assoprar vela toca parabéns', async ({ page }) => { /* 5 acertos; vozLog contém bolo.pronto; toca 'vela'; vozLog contém bolo.parabens */ });
test('girar o aparelho mantém coberturas tocáveis', async ({ page }) => { /* nível 3 com resposta alta; setViewportSize retrato → paisagem; toda 'cobertura' visível, dentro do viewport, >= 60px */ });
```

- [ ] **Passo 2:** rodar os testes de bolo. Esperado: FALHA.
- [ ] **Passo 3:** implementar `logic.js` e `view.js`.
- [ ] **Passo 4:** rodar os testes de bolo e a suíte completa (`npm test && npm run e2e`). Esperado: PASSA.
- [ ] **Passo 5:** commit `feat: jogo Continhas no Bolo`.

### Task 8: Geração das vozes

**Arquivos:**
- Criar: `scripts/gerar-vozes.mjs`, `tests/unit/gerar-vozes.test.js`, `public/audio/voz/*.mp3` (gerados)
- Modificar: `public/audio/manifesto.json` (regenerado)

**Interfaces:**
- Consome: `PHRASES`.
- Produz `planejarGeracao(phrases: Record<string,string>, existentes: Set<string>, force: boolean) -> string[]`, que lista os IDs a gerar (exportada do script para teste). O script em si:
  - lê `OPENAI_API_KEY` do ambiente;
  - para cada ID do plano, faz `POST https://api.openai.com/v1/audio/speech` com `model: 'gpt-4o-mini-tts'`, uma voz feminina calorosa (ex.: `coral`), `response_format: 'mp3'` e `instructions: 'Fale em português do Brasil, com voz calorosa e alegre, devagar e bem articulada, para uma criança de 4 anos. Sem exageros.'`;
  - grava `public/audio/voz/<id>.mp3`, com concorrência 4 e até 3 tentativas com espera;
  - pula os arquivos que já existem, a menos que receba `--force` ou `--so=<prefixo>`;
  - no fim, roda o manifesto.
- **Antes de escrever a chamada**, consulte a documentação oficial pela skill `sbos-consulta-docs-openai` e confirme o nome do modelo, as vozes disponíveis e o parâmetro `instructions`. Se algo divergir, siga a documentação.

- [ ] **Passo 1: escrever o teste que falha:** `planejarGeracao({a:'x',b:'y'}, new Set(['a']), false)` deve ser `['b']`. Com `force=true`, deve ser `['a','b']`.
- [ ] **Passo 2:** `npx vitest run tests/unit/gerar-vozes.test.js`. Esperado: FALHA.
- [ ] **Passo 3:** implementar o script.
- [ ] **Passo 4:** `npx vitest run tests/unit/gerar-vozes.test.js`. Esperado: PASSA.
- [ ] **Passo 5:** gerar uma amostra com `node scripts/gerar-vozes.mjs --so=inicio` e `--so=letras.pergunta.bola`. **Pedir ao pai para ouvir** os 2 arquivos e aprovar a voz antes de gerar o resto. Se ele não gostar, trocar `voice`/`instructions` e repetir.
- [ ] **Passo 6:** `npm run vozes`. Esperado: um mp3 por ID de `PHRASES` (cerca de 250) e `manifesto.json` com o mesmo número de IDs em `voz`.
- [ ] **Passo 7:** `npm run e2e`. Esperado: PASSA (o modo de teste não toca áudio real).
- [ ] **Passo 8:** commit `feat: vozes geradas em pt-BR`.

### Task 9: PWA, ícones e offline

**Arquivos:**
- Criar: `public/icons/apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png` (dino 1F995 sobre fundo de cor sólida, gerados a partir do SVG com `sharp` em `scripts/icones.mjs`), `tests/e2e/offline.spec.js`
- Modificar: `vite.config.js`, `index.html`, `src/main.js`

**Interfaces:**
- `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Jogos', short_name: 'Jogos', lang: 'pt-BR', display: 'standalone', orientation: 'any', background_color, theme_color, icons }, workbox: { globPatterns: ['**/*.{js,css,html,svg,png,mp3,json}'] } })`.
- `index.html` aponta o `apple-touch-icon` para `/icons/apple-touch-icon-180.png`, respeitando o `base`.

- [ ] **Passo 1: escrever o teste que falha** em `offline.spec.js`, rodando contra `npm run build && npm run preview` (um `webServer` separado na porta 5200 só para este arquivo):

```js
test('funciona offline depois da 1ª visita', async ({ page, context }) => {
  await page.goto('http://localhost:5200/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByTestId('comecar').click();
  await expect(page.getByTestId('cartao-letras')).toBeVisible();
  const ok = await page.evaluate(async () => (await fetch('audio/voz/inicio.oi.mp3')).ok);
  expect(ok).toBe(true);
});
test('manifest standalone', async ({ page }) => { /* fetch do manifest → display 'standalone' */ });
```

  Se o service worker não funcionar no WebKit do Playwright, rode o teste offline só no projeto Chromium (`npx playwright install chromium`) e registre a limitação.
- [ ] **Passo 2:** rodar. Esperado: FALHA.
- [ ] **Passo 3:** configurar o plugin, gerar os ícones e importar o registro do SW em `main.js`.
- [ ] **Passo 4:** rodar `npm run build && npx playwright test tests/e2e/offline.spec.js`. Esperado: PASSA. Depois, a suíte completa.
- [ ] **Passo 5:** commit `feat: PWA instalável e offline`.

### Task 10: Publicação no GitHub Pages

**Arquivos:**
- Criar: `.github/workflows/deploy.yml`, `README.md` (como rodar, como gerar vozes, como substituir uma fala pela voz do pai colocando `public/audio/gravado/<id>.mp3`, como instalar no iPad e ativar o Acesso Guiado, créditos OpenMoji)

**Interfaces:**
- Workflow: em push na `main`, roda `npm ci`, `npm test` e `npm run build` com `BASE_PATH=/<repo>/`, e publica `dist` com `actions/upload-pages-artifact` + `actions/deploy-pages`. Sem `npm run vozes` no CI, porque os mp3 já estão versionados.

- [ ] **Passo 1:** escrever o workflow e o README. Rodar `BASE_PATH=/jogos/ npm run build && npx vite preview --base /jogos/` e conferir à mão que a tela inicial, o áudio e os ícones carregam sob `/jogos/`.
- [ ] **Passo 2:** commit `chore: deploy no GitHub Pages e README`.
- [ ] **Passo 3: PARAR e pedir confirmação ao pai** antes de qualquer ação externa. Informar o nome do repositório proposto (`jogos`, público, conforme autorizado) e aguardar o "ok".
- [ ] **Passo 4:** com o ok, rodar `gh repo create jogos --public --source . --push`, ativar o Pages com fonte "GitHub Actions" (`gh api -X POST repos/{owner}/jogos/pages -f build_type=workflow`) e acompanhar o workflow (`gh run watch`). Esperado: deploy verde e URL `https://<usuario>.github.io/jogos/`.
- [ ] **Passo 5:** abrir a URL publicada no navegador e conferir início → menu → cada jogo. Entregar ao pai a URL e o passo a passo de instalação no iPad e no iPhone, para o teste final nos aparelhos reais.
