# Jogos

Site de jogos educativos para uma criança de 4 anos, feito para iPad e iPhone.
Ela joga sozinha, sem saber ler: tudo é falado e tudo é tocado.

| Jogo | O que treina |
|------|--------------|
| **Siga a Música** | memória e atenção: repetir a sequência no xilofone |
| **Letra Inicial com Dinossauros** | letras: achar a letra com que a palavra começa |
| **Continhas no Bolo** | contar, somar e tirar com coberturas no bolo |

A dificuldade se ajusta sozinha: sobe depois de 3 acertos seguidos e desce se
ela precisar de dica 3 rodadas seguidas. Não existe "perdeu" nem fim de jogo.

## Rodar no computador

Precisa de Node 24.

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Para abrir no iPad pela rede de casa: `npm run dev -- --host` e use o endereço
"Network" que aparecer.

## Testes

```bash
npm test               # testes unitários (Vitest)
npm run e2e            # jogos no iPhone e iPad simulados (Playwright/WebKit)
npm run e2e:offline    # app instalado funcionando sem internet
```

Na primeira vez: `npx playwright install webkit`.

## Vozes

As falas estão em [src/core/phrases.js](src/core/phrases.js) e os áudios em
`public/audio/voz/<id>.mp3`, gerados com a voz neural da OpenAI (voz `marin`).

```bash
# precisa de OPENAI_API_KEY no ambiente
npm run vozes                                  # gera só as falas que faltam
node scripts/gerar-vozes.mjs --so=letras.      # regera um grupo
node scripts/gerar-vozes.mjs --force           # regera tudo
```

Mudou o texto de uma fala? Regere aquela fala com `--so=<id>`.

### Trocar uma fala pela voz do pai ou da mãe

Grave a fala (no celular mesmo), converta para mp3 e salve como
`public/audio/gravado/<id>.mp3`, com o mesmo ID de `phrases.js`, por exemplo
`public/audio/gravado/inicio.oi.mp3`. A gravação tem prioridade sobre a voz
gerada. Depois rode `npm run build` (o manifesto de áudios é atualizado sozinho)
e publique.

## Instalar no iPad ou iPhone

1. Abra o site no **Safari**.
2. Toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início**.
3. Abra pelo ícone do dinossauro: o site abre em tela cheia, como um app, e
   continua funcionando sem internet depois da primeira abertura.

### Acesso Guiado (para ela não sair do jogo)

1. **Ajustes → Acessibilidade → Acesso Guiado**: ative e defina um código.
2. Abra o app dos Jogos e aperte **3 vezes** o botão lateral (ou o botão Home).
3. Toque em **Iniciar**. Para sair, aperte 3 vezes de novo e digite o código.

## Publicação

Cada push na `main` publica no GitHub Pages pelo workflow
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). O endereço fica
`https://<usuário>.github.io/<repositório>/`.

## Créditos

Desenhos: [OpenMoji](https://openmoji.org), licença
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Vozes: OpenAI `gpt-4o-mini-tts` (geradas por IA).
