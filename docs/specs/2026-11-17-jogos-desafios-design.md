# Site de jogos da filha — primeiros 3 desafios

Data: 2026-11-17 · Status: rascunho para aprovação

## Intenção

Um site de jogos feito sob medida para a filha do autor, de 3 anos e 10 meses (faz 4 em janeiro de 2027), jogar no tablet. Hoje ela assiste vídeos no tablet e adorou o app "Bebi – Jogos para Crianças". O objetivo é ela **se divertir e aprender** com jogos ativos, no nível dela, sem anúncios e sem sair do ambiente.

Uso **privado, da família**: sem distribuição comercial.

### Quem joga

- Joga **sozinha** no tablet, com toque. **Não lê**, então tudo o que importa precisa ser falado.
- Sabe as cores em português e inglês, conta até 20, sabe os números em inglês até 10 e reconhece algumas letras (as do nome dela e do nome do pai, por exemplo).
- No Bebi, os jogos favoritos dela são: enfeitar bolo, posicionar dinossauros numa cena e o de música. Também gosta de adivinhar personagem pela música.
- Os favoritos dela são de **brincadeira livre**, sem resposta errada: ela cria e o jogo reage.

### Conceito do site

Duas categorias de jogo: **brincadeira livre** (fica para depois) e **desafios leves**. Os desafios acontecem **dentro dos mundos que ela já ama** (bolo, dinossauros, música) para parecer brincadeira, não lição. O site cresce aos poucos, um jogo de cada vez.

Este documento cobre os **3 primeiros desafios**: Siga a Música, Letra Inicial com Dinossauros e Continhas no Bolo.

## Objetivos

- Três desafios jogáveis do começo ao fim por ela sozinha, só com voz e toque.
- A dificuldade se ajusta sozinha: começa no nível dela e sobe conforme ela acerta.
- Funciona no tablet como app: ícone na tela inicial, tela cheia e **sem internet** depois de instalado.
- Animações caprichadas e comemoração em cada acerto.
- Fácil acrescentar jogos novos depois, incluindo os de brincadeira livre.

## Fora do escopo (agora)

- Jogos de brincadeira livre, inglês, rimas e os demais desafios da lista de ideias (ver apêndice).
- Contas, login, vários perfis, painel de progresso para os pais, analytics.
- Distribuição em loja de apps.
- Gravação da voz do pai (fica para uma segunda etapa, mas a estrutura precisa permitir; ver "Voz").
- Personagens famosos: só entram depois, com arquivos fornecidos pelo pai. Nenhum material de terceiros vem embutido no projeto.

## Anti-objetivos (se acontecer, falhou, mesmo funcionando)

- **Punição**: "game over", vidas, perder pontos, som de erro estridente ou cronômetro pressionando. Errar só gera um incentivo gentil e outra chance.
- **Precisar ler** ou precisar de um adulto para navegar.
- **Fácil demais** (ela já domina cores e contagem simples) ou **difícil demais** a ponto de frustrar.
- Qualquer caminho que a leve **para fora do site**: links externos, anúncios, compartilhamento.
- Tela poluída, alvos de toque pequenos, partidas longas.

## Restrições

- Aparelho principal: **iPad**, no Safari, instalado como app pelo "Adicionar à Tela de Início". Também precisa funcionar bem no **iPhone** do pai. Ou seja, o layout é **responsivo**: do celular ao tablet, em paisagem (preferida) e retrato.
  - Em tela pequena, a quantidade de elementos na tela se adapta (menos teclas, ovos ou morangos por vez, se precisar) para manter os alvos de toque grandes.
- **Alvos de toque grandes**, no mínimo ~80px no iPad e ~60px no iPhone, considerando dedos de 3–4 anos.
- **Offline** depois da primeira visita (PWA com service worker).
- **Particularidades do iOS** que o plano precisa tratar:
  - Não existe botão de instalar: o site mostra uma dica visual para o pai fazer "Compartilhar → Adicionar à Tela de Início".
  - Não existe API de tela cheia: a tela cheia vem do modo app (manifest com `display: standalone` e metatags da Apple).
  - O áudio só toca depois do primeiro toque. A tela inicial resolve isso com um botão grande de "começar".
  - No iPhone, a chave de silencioso pode calar o Web Audio: o áudio precisa tocar mesmo com ela ligada, por exemplo com `navigator.audioSession.type = "playback"` ou tocando por elemento `<audio>`.
  - O Safari pode apagar o armazenamento de sites **não instalados**. Instalado na tela de início, o nível salvo persiste.
- Todo o texto falado é em **português do Brasil**.

## Abordagens consideradas

### Tecnologia

| Opção | Prós | Contras |
|---|---|---|
| **HTML/CSS/JS + SVG + GSAP (escolhida)** | Leve, ideal para tocar e arrastar, layout responsivo fácil, animações ricas com GSAP | Física complexa teria que ser feita na mão |
| Motor de jogos (Phaser) | Física, sprites, muitos objetos animados | Pesado para jogos de toque/arraste; layout em canvas é mais trabalhoso |
| App Android nativo | Integração com o sistema | Instalação manual, mais difícil de mexer, nenhum ganho para ela |

**Escolha:** HTML/JS puro, com desenhos em SVG e animações com GSAP. Cada jogo é um módulo independente, então um jogo futuro que precise de física pode usar Phaser sozinho, sem afetar os outros. O pai preferiu começar pelo básico e avaliar.

### Voz

| Opção | Resultado | Custo |
|---|---|---|
| A. Voz do próprio navegador (Web Speech) | Robótica e varia por aparelho | Zero |
| **B. Voz artificial de qualidade, pré-gerada em arquivos de áudio (escolhida)** | Natural, consistente, funciona offline | Centavos, gerada uma vez |
| C. Voz do pai gravada | A mais carinhosa | O pai grava dezenas de frases |

**Escolha do pai: B.** Requisito derivado: cada frase é um arquivo identificado por um ID estável, e o jogo procura primeiro uma gravação substituta para aquele ID. Assim a opção C pode entrar depois frase a frase, sem mexer no código dos jogos.

## Estrutura do site

### Tela inicial

- Botão grande de "começar" no primeiro acesso, que libera o áudio e entra em tela cheia.
- Três cartões grandes, só com ilustração (piano, dinossauro, bolo). Ao tocar, a voz diz o nome do jogo e o jogo abre.
- Sem texto obrigatório.

### Dentro de cada jogo

- Botão "casinha" sempre visível num canto, para voltar ao início.
- Botão "ouvir de novo", que repete a última instrução.
- Rodadas curtas. A cada **5 acertos**, uma comemoração maior (confete, música curta) e uma pausa natural em que ela pode continuar ou voltar.

### Partes compartilhadas

- **Voz:** toca a frase por ID e enfileira as frases sem sobreposição. Procura primeiro uma gravação substituta para o ID e cai no arquivo padrão se não houver.
- **Sons e notas:** efeitos curtos e as notas musicais. As notas podem ser sintetizadas com Web Audio, sem arquivos.
- **Comemoração:** confete, personagem pulando e frase de elogio variada (sorteada entre várias, para não ficar repetitivo).
- **Dificuldade adaptativa por jogo:** 3 acertos seguidos sobe um nível. 2 erros na mesma rodada mostram uma dica. Errar bastante seguido desce um nível em silêncio. O nível atual de cada jogo fica salvo no aparelho (`localStorage`); se for perdido, ela recomeça do nível 1, o que é aceitável.
- **Erro gentil:** o objeto errado balança ("hmm"), a voz incentiva ("Quase! Escuta de novo…") e a instrução se repete. Nunca há som de erro agressivo nem perda de nada.

## Jogo 1 — Siga a Música

**Mundo:** um xilofone ou piano colorido. Cada tecla tem uma cor e uma nota fixas.

**Como joga:**
1. Voz: "Escuta…". O jogo toca uma sequência de notas e cada tecla acende enquanto toca.
2. Voz: "Agora é sua vez!". Ela repete tocando as teclas, e cada toque acende e soa.
3. Acertou a sequência: comemoração, e a próxima é um pouco maior.
4. Errou uma nota: a tecla balança, a voz diz "Vamos ouvir de novo?" e a mesma sequência é tocada outra vez. Ela não perde progresso.

**Progressão** (segue a regra geral: 3 acertos seguidos sobem um nível; *decisão de quem constrói*):
- Nível 1: 3 teclas, sequência de 2 notas.
- Nível 2: 3 teclas, 3 notas.
- Nível 3: 4 teclas, 3–4 notas.
- Nível 4: 5 teclas, 4–5 notas.
- Nível 5 (teto inicial): 5 teclas, 5–6 notas.

**Extra:** um botão "tocar livre" para ela brincar com o piano sem desafio, aproveitando que ela adora música.

**Habilidades:** memória sequencial, atenção auditiva, coordenação.

## Jogo 2 — Letra Inicial com Dinossauros

**Mundo:** um ninho com 3 ovos e um dinossauro mamãe ao lado.

**Como joga:**
1. Aparece um objeto ilustrado (ex.: uma bola). Voz: "Bola! Com que letra começa *bola*?"
2. Cada ovo mostra uma letra maiúscula de forma (letra bastão).
3. Ao tocar um ovo, a voz diz o nome da letra ("Bê!").
4. Acertou: o ovo racha e nasce um filhote de dinossauro, com comemoração. Os filhotes nascidos ficam no ninho durante a sessão, como uma "coleção".
5. Errou: o ovo balança e a voz dá a dica pelo som inicial ("Escuta: Bbbbola…"). No segundo erro, o ovo certo brilha.

**Conteúdo:**
- **Meta: ela se familiarizar com todas as letras do alfabeto** (pedido do pai). O banco de palavras cobre o máximo de letras possível, com ~2 palavras por letra (~50 palavras), cada uma com imagem e frase falada.
- Nas fases de som inicial, só entram palavras em que a **letra inicial soa de forma clara**. Começos ambíguos para essa idade, como H mudo, "ch", "qu" e "lh", ficam de fora.
- As letras sem palavra boa em português (H, K, W, Y, talvez X e Q) aparecem no **nível 0, "toque na letra"**, para ela conhecer a forma e o nome. Palavras emprestadas de som claro (ex.: "kiwi", "iô-iô") são *decisão de quem constrói*.
- As imagens vêm de um conjunto aberto de emojis/ilustrações (ex.: OpenMoji) **embutido no projeto**, para ficar igual em qualquer aparelho e funcionar offline.

**Progressão:**
- Nível 0, ponto de partida (*decisão de quem constrói*: perceber o som inicial pode ainda ser novo para ela): "Toque no **B**!". Ela reconhece a letra pelo nome, sem som inicial. Com 3 acertos seguidos passa para o nível 1. Se ela já souber, sobe em poucos segundos.
- Nível 1: palavras que começam com letras **frequentes e de som claro** (ex.: A, B, M, P, S, T), com letras distratoras visualmente bem diferentes. A lista de letras iniciais fica num arquivo de configuração, para o pai incluir depois as letras dos nomes da família.
- Nível 2: outras letras comuns, com distratores ainda diferentes.
- Nível 3: distratores parecidos (B/D, M/N, P/R, E/F).

**Habilidades:** consciência fonológica (som inicial), reconhecimento de letras.

## Jogo 3 — Continhas no Bolo

**Mundo:** um bolo numa mesa. As coberturas (morangos, cerejas, docinhos) caem do alto e quicam no bolo.

**Como joga:**
1. Voz: "Tem 2 morangos no bolo." Os morangos estão no bolo.
2. Cai mais 1 morango, com animação. Voz: "Caiu mais 1! Quantos morangos tem agora?"
3. Ela pode tocar em cada morango para contar: cada toque destaca o morango e a voz conta "um, dois, três".
4. Três botões grandes de numeral. Ao tocar, a voz fala o número ("cinco!") antes de confirmar; *decisão de quem constrói*, para não virar chute caso ela ainda esteja aprendendo o numeral escrito. A dificuldade adaptativa tira ela rápido do nível 1 se ele for fácil demais. Acertou: o bolo ganha uma vela e há comemoração.
5. Depois de 5 acertos, o bolo fica pronto. A voz pede para ela assoprar (tocar na vela) e toca "parabéns".
6. Errou: o botão balança e a voz diz "Vamos contar juntos?". Os morangos são contados em voz alta um a um, e ela escolhe de novo.

**Progressão:**
- Nível 1: só contar (quantos tem?), até 10.
- Nível 2: somar com resultado até 5.
- Nível 3: somar com resultado até 10.
- Nível 4: tirar ("O passarinho comeu 1 morango! Quantos sobraram?"), resultados de 0 a 10.

**Áudio:** as frases devem soar naturais, então a preferência é gerar a frase inteira para cada combinação usada (número + cobertura), e não colar pedaços. Como as combinações são poucas, isso é viável.

**Habilidades:** quantidade, adição e subtração com objetos concretos, associação entre quantidade e numeral.

## Geração das vozes

- Um script, rodado no computador do pai, lê uma lista de frases (ID → texto) e gera um arquivo de áudio para cada uma com um serviço de voz neural em pt-BR.
- Os arquivos gerados ficam versionados no projeto, então o site não depende de internet nem de serviço externo ao rodar.
- A voz deve ser calorosa e infantilizada na medida certa: clara, devagar, sem exagero.
- Para trocar uma frase pela voz do pai, basta colocar um arquivo gravado com o mesmo ID na pasta de gravações (etapa futura).

## Publicação

- Site estático, sem servidor próprio.
- A instalação como app exige HTTPS, então o site fica num serviço estático gratuito.
- **O pai autorizou o site a ficar acessível publicamente** para quem tiver o link. Repositório e hospedagem podem ser públicos.
- Recomendação ao pai: ativar o **Acesso Guiado** do iOS (Ajustes → Acessibilidade → Acesso Guiado) quando ela for jogar, para ela não sair do app sozinha.

## Critérios de pronto

- Os 3 jogos podem ser jogados do início ao fim só com toque e voz, sem nenhum texto necessário.
- Cada jogo sobe e desce de nível conforme as regras acima, e o nível fica salvo.
- Instalável no iPad e no iPhone pela tela de início e funcionando em modo avião.
- Som funcionando no iPhone com a chave de silencioso ligada.
- Layout utilizável em tela de iPhone e de iPad, em paisagem e retrato.
- Nenhum link externo e nenhum caminho que saia do site.
- Testado no navegador desktop com emulação de toque (viewports de iPhone e iPad, motor WebKit) e, por fim, pelo pai no iPad e no iPhone reais.

## Decisões deixadas para quem constrói

- Estrutura de pastas, ferramenta de build (ou nenhuma) e organização dos módulos.
- Estilo visual exato (paleta, traço dos desenhos), desde que seja colorido, simples e com contraste alto.
- Qual serviço de voz neural usar e qual voz pt-BR, dentro da descrição acima.
- Qual conjunto aberto de ilustrações usar, e a lista exata das ~50 palavras.
- Qual hospedagem estática usar.
- As frases exatas de instrução e de elogio.

## Apêndice — banco de ideias para depois

- **Brincadeira livre:** enfeitar bolo, montar cena de dinossauros, piano/bateria livre.
- **Letras:** monta o nome (dela e da família), rimas, palminhas nas sílabas.
- **Números:** "onde tem mais?", trenzinho dos números.
- **Lógica:** padrões (colar de contas), sombras, intruso, história em ordem, labirinto.
- **Memória:** jogo da memória, "o que sumiu?".
- **Inglês:** "Touch the red apple", vocabulário de animais, frutas e corpo.
- **Ouvido:** adivinhe pela música (personagens com arquivos do pai, animais, instrumentos).
- **Voz do pai** nos elogios.
