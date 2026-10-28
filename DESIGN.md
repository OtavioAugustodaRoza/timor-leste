# Direção visual

Atlas editorial imersivo, de leitura e exploração. Papel quente, tinta escura, vermelho profundo e amarelo dourado derivados da bandeira; fotografia documental do país, tipografia Cormorant Garamond e DM Sans. Composição assimétrica, grandes espaços e linhas finas. Motivos geométricos originais inspirados no ritmo de tecelagem do tais, sem apresentar o desenho como reprodução tradicional.

Primeira tela: título editorial enorme à esquerda e fotografia costeira à direita, faixa gráfica vermelha e nota de localização. A navegação leva a território, cultura, história, economia e solidariedade. Variação de composição entre seções, sem repetir uma grade de cartões como estrutura da página.

Movimento: abertura que revela a página como dois painéis; rolagem suave com Lenis, fotografia em paralaxe, máscaras progressivas e sequência narrativa com GSAP ScrollTrigger. Respeitar prefers-reduced-motion automaticamente, sem controle manual no site; conteúdo legível sem esperar animações. Navegação móvel pelos atalhos inferiores, sem menu hambúrguer, tabs culturais, exploração de locais e painel de fontes.

## Evolução: celular e leitura noturna

O celular é a plataforma prioritária, conforme solicitação do usuário. Texto de leitura maior, controles de pelo menos 44 px, atalhos inferiores com áreas seguras, abas culturais com rolagem horizontal e fotografia visível já na abertura. O movimento de toque permanece nativo; Lenis atua somente com ponteiro fino.

Modo escuro em verde muito profundo, texto marfim e destaques em terracota claro. Detectar a preferência do sistema até haver uma escolha explícita; persistir a escolha localmente. O contraste das superfícies vermelhas e das fotografias permanece independente dos tokens da página.

A seção histórica é o momento central: palco com position sticky, quatro cenas e uma linha do tempo GSAP reversível vinculada à rolagem. Fotografias contemporâneas identificadas como tal; transições de máscara, aproximação da imagem, texto e ano em planos distintos. Anos selecionáveis e link para pular a história. Em movimento reduzido ou telas muito baixas, todos os capítulos aparecem na leitura vertical, sem conteúdo escondido.

## Rolagem como narrativa

Entre cultura e paisagem, uma composição geométrica autoral inspirada no tais se forma pela rolagem: fios verticais, cruzamento dos fios e motivos. O desenho é SVG, com etapas reversíveis ligadas diretamente à posição de scroll, sem reprodução automática. Explicar no próprio trecho que a arte não reproduz uma técnica ou motivo tradicional específico. Oferecer botões de etapas; a história vem em seguida na rolagem.

O scrubbing da história e da composição usa ligação direta, sem atraso de interpolação. A roda do mouse nessas sequências usa rolagem nativa; o toque permanece nativo em todo o site. Abas culturais ficam fixas no limite do cabeçalho e a coluna editorial da solidariedade acompanha a leitura no desktop. O progresso global mostra barra e porcentagem reais, inclusive quando a altura do documento muda; continua disponível com movimento reduzido.
