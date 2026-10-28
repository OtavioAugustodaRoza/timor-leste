# Direção visual

Atlas editorial imersivo, de leitura e exploração. Papel quente, tinta escura, vermelho profundo e amarelo dourado derivados da bandeira; fotografia documental do país, tipografia Cormorant Garamond e DM Sans. Composição assimétrica, grandes espaços e linhas finas. Motivos geométricos originais inspirados no ritmo de tecelagem do tais, sem apresentar o desenho como reprodução tradicional.

Primeira tela: título editorial enorme à esquerda e fotografia costeira à direita, faixa gráfica vermelha e nota de localização. A navegação leva a território, cultura, história, economia e solidariedade. Variação de composição entre seções, sem repetir uma grade de cartões como estrutura da página.

Movimento: abertura que revela a página como dois painéis; rolagem suave com Lenis, fotografia em paralaxe, máscaras progressivas e sequência narrativa com GSAP ScrollTrigger. Respeitar prefers-reduced-motion; conteúdo legível sem esperar animações. Menu móvel acessível, tabs culturais, exploração de locais e painel de fontes.

## Evolução: celular e leitura noturna

O celular é a plataforma prioritária, conforme solicitação do usuário. Texto de leitura maior, controles de pelo menos 44 px, atalhos inferiores com áreas seguras, abas culturais com rolagem horizontal e fotografia visível já na abertura. O movimento de toque permanece nativo; Lenis atua somente com ponteiro fino.

Modo escuro em verde muito profundo, texto marfim e destaques em terracota claro. Detectar a preferência do sistema até haver uma escolha explícita; persistir a escolha localmente. O contraste das superfícies vermelhas e das fotografias permanece independente dos tokens da página.

A seção histórica é o momento central: palco com position sticky, quatro cenas e uma linha do tempo GSAP reversível vinculada à rolagem. Fotografias contemporâneas identificadas como tal; transições de máscara, aproximação da imagem, texto e ano em planos distintos. Anos selecionáveis e link para pular a história. Em movimento reduzido ou telas muito baixas, todos os capítulos aparecem na leitura vertical, sem conteúdo escondido.
