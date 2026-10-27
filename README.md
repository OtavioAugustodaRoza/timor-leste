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
- `src/data.ts`: destinos, cultura, história, PIB e referências.
- `src/styles.css`: identidade visual, responsividade e redução de movimento.
- `public/images/`: fotografias locais do portal oficial de turismo.
- `scripts/fetch-assets.py`: download reproduzível das fotografias selecionadas.
- `scripts/verify-browser.py`: verificação de navegação, abas, gráfico, responsividade e movimento reduzido.

Conteúdo consultado em 27/10/2026. Os valores do PIB são nominais, em bilhões de dólares correntes, com fonte Banco Mundial via FRED, e não representam uma série de crescimento real. A seção sobre Myanmar identifica opinião editorial e distingue tensões diplomáticas de conflito armado entre países.

Fotografias: Turismo de Timor-Leste, Ministério do Turismo e Ambiente. A origem e os créditos estão acessíveis no próprio site. Fontes tipográficas: Cormorant Garamond e DM Sans, distribuídas por Fontsource com as licenças dos respectivos pacotes. Os padrões visuais são desenhos originais inspirados em ritmos de tecelagem.
