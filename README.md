# Timor-Leste — A força de ser livre

Atlas editorial independente em React 19 e TypeScript.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Node.js 20.19+ ou 22.12+. A versão de produção é gerada em `dist/` e pode ser servida como um site estático. A configuração do Sites fica em `.openai/hosting.json`.

## Estrutura

- `src/App.tsx`: componentes e interações; GSAP ScrollTrigger e Lenis.
- `src/HistoryJourney.tsx`: sequência histórica vinculada à rolagem, com navegação direta e alternativa de leitura contínua.
- `src/useTheme.ts`: temas claro/escuro, preferência do sistema e persistência local.
- `src/motion.ts`: planos de paralaxe da abertura e da paisagem.
- `src/WeaveJourney.tsx`: composição geométrica autoral ligada diretamente à rolagem, com desenho progressivo e etapas reversíveis.
- `src/ReadingProgress.tsx`: porcentagem e barra do percurso, recalculadas quando a altura da página muda.
- `src/data.ts`: destinos, cultura, história, PIB e referências.
- `src/styles.css`: identidade visual, responsividade e redução de movimento.
- `src/enhancements.css`: tema escuro, experiência móvel e palco da narrativa histórica.
- `src/scroll-experience.css`: composição da trama, abas culturais fixas e progresso global.
- `public/images/`: fotografias locais do portal oficial de turismo.
- `scripts/fetch-assets.py`: download reproduzível das fotografias selecionadas.
- `scripts/verify-browser.py`: verificação de navegação, abas, gráfico, responsividade e movimento reduzido.
- `scripts/verify-enhancements.py`: suíte atual com temas, persistência, cinco tamanhos de tela, toque emulado, avanço/retorno da história e alternativa para movimento reduzido. O comando `python scripts/verify-browser.py` executa esta suíte.

O modo escuro segue a preferência do sistema até uma escolha pelo botão do cabeçalho. A escolha é salva no armazenamento local, quando disponível. Na história, rolar para baixo avança os marcos; rolar para cima retorna. Os anos permitem ir diretamente a um capítulo e “Pular história” leva à economia. Em movimento reduzido ou telas com menos de 660 px de altura, os quatro capítulos são exibidos em sequência vertical.

Na seção “Fio a fio”, o scroll desenha uma trama original inspirada no tais. A história e a trama usam scrubbing direto e reversível; parar a rolagem para a reprodução. As abas culturais ficam fixas durante a leitura, com fixação adicional da coluna editorial de solidariedade no desktop. O progresso global é baseado na distância real percorrida, com observação de alterações de layout. `python scripts/verify-scroll.py` verifica estes recursos na versão servida em `http://127.0.0.1:5173`.

Conteúdo consultado em 27/10/2026. Os valores do PIB são nominais, em bilhões de dólares correntes, com fonte Banco Mundial via FRED, e não representam uma série de crescimento real. A seção sobre Myanmar identifica opinião editorial e distingue tensões diplomáticas de conflito armado entre países.

Fotografias: Turismo de Timor-Leste, Ministério do Turismo e Ambiente. A origem e os créditos estão acessíveis no próprio site. Fontes tipográficas: Cormorant Garamond e DM Sans, distribuídas por Fontsource com as licenças dos respectivos pacotes. Os padrões visuais são desenhos originais inspirados em ritmos de tecelagem.

## Ajustar o scrubbing da história

`src/HistoryJourney.tsx` organiza a timeline em `entry`, `transformation`, quatro `chapter-N` e `exit`. O progresso é reversível e acompanha a rolagem diretamente com `scrub: true`. `ENTRY`, `CHAPTER` e `EXIT` controlam a proporção de cada etapa; a navegação por ano usa os mesmos valores. `MOTION.desktop` e `MOTION.mobile` controlam deslocamento em pixels, escala inicial e paralaxe em porcentagem.

Em `src/enhancements.css`, `--memory-scroll-height` define a duração em distância: `480svh` no desktop e `360svh` até 800px. A altura do palco é descontada desse percurso. Movimento reduzido e telas abaixo de 660px de altura mantêm todos os capítulos em leitura vertical. O contexto `useGSAP` reverte a timeline ao desmontar ou mudar o breakpoint; listeners e temporizadores têm limpeza explícita.
