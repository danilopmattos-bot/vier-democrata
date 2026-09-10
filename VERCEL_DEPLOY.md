# Democrata Bier V2 — pronto para Vercel

Esta versão foi preparada para deploy direto na Vercel.

## Estrutura

- Frontend: React + Vite
- Build: `npm run build`
- Saída: `dist/`
- Funções de IA: `api/`
- Dados de receitas e brassagens: armazenados localmente no navegador
- Node.js: 22+

## Jeito mais fácil pelo celular

1. Salve o ZIP no app Arquivos.
2. Abra `https://vercel.com/drop` no Safari.
3. Faça login na Vercel.
4. Toque para escolher um arquivo e selecione o ZIP.
5. Dê um nome ao projeto, por exemplo `democrata-bier`.
6. Toque em Deploy.
7. Quando terminar, abra o domínio `.vercel.app` criado pela Vercel.

## Gemini / IA

O site funciona sem configurar chave de IA. Para ativar as funções que chamam o Gemini:

1. Abra o projeto na Vercel.
2. Vá em Settings → Environment Variables.
3. Crie `GEMINI_API_KEY` com a sua chave.
4. Salve.
5. Faça um novo deploy/redeploy.

Não coloque a chave Gemini diretamente no código ou em arquivos enviados ao projeto.
