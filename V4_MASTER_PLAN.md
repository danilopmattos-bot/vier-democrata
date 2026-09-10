# Democrata Bier V4 — Master Plan

## Objetivo

Construir uma versão autoral do Democrata Bier que não seja uma reforma visual da versão do Gemini. A V4 deve parecer um produto próprio, coerente, premium e extremamente útil para um cervejeiro caseiro experiente.

A versão atual do Gemini serve apenas como fonte de dados, cálculos e ideias que já funcionam. A experiência, arquitetura de produto, linguagem, navegação e hierarquia visual devem ser redesenhadas do zero.

## Princípios

1. **BJCP como sistema, não decoração.** O estilo escolhido deve orientar OG, FG, IBU, SRM, ABV, equilíbrio, fermentação e decisões de receita.
2. **Lógica antes de espetáculo.** Visual premium, mas nenhuma animação ou efeito pode atrapalhar a brassagem real.
3. **Mobile-first no brewday.** Durante a brassagem, tudo deve ser legível e operável com uma mão.
4. **IA como assistente opcional.** O app deve funcionar 100% sem IA. A IA pode explicar, sugerir ou diagnosticar, nunca ser o motor da receita.
5. **Linguagem de cervejeiro.** OG, FG, ABV, IBU, SRM, mash, whirlpool, dry hop etc. podem existir, mas sempre com contexto simples. Evitar nomes pseudo-científicos ou marketing vazio.
6. **Dados locais primeiro.** Preservar receitas existentes do navegador e manter compatibilidade com localStorage.
7. **Não inventar precisão.** Quando um cálculo for aproximação, mostrar isso de forma clara.

## O que reaproveitar

Reaproveitar somente o que for tecnicamente sólido:

- `src/data/bjcpStyles.ts`
- bancos de maltes, lúpulos e leveduras de `src/data/ingredients.ts`
- cálculos úteis de `src/utils/brewingCalculations.ts`
- modelos/types de receita que fizerem sentido
- receitas existentes do usuário e compatibilidade com o storage atual
- utilidades de priming, refratômetro, hidrometro, pitch rate, água e escala de lote

Revisar criticamente qualquer texto grandioso, alegação técnica exagerada ou número que pareça falso. A V4 deve soar confiável.

## Arquitetura de produto V4

### 1. Início / Brew Desk

A home não deve ser um formulário. Deve responder em segundos:

- Qual receita está aberta?
- Está dentro do estilo?
- Qual é a próxima ação útil?
- Qual foi a última brassagem?
- Quais receitas valem repetir?

Hero principal com identidade Democrata, copo da cerveja atual e métricas essenciais: OG, FG, ABV, IBU, SRM e volume.

Ações principais:

- `Criar receita`
- `Continuar receita`
- `Começar brassagem`
- `Fazer novamente`

### 2. Recipe Forge — criador de receita guiado

Criar receita deve ser um fluxo claro, não uma parede de campos.

Etapas sugeridas:

1. **Intenção** — estilo BJCP, volume, eficiência e objetivo sensorial.
2. **Grãos** — composição, porcentagens, peso, contribuição de cor e gravidade.
3. **Lúpulos** — amargor, sabor, aroma, whirlpool e dry hop.
4. **Levedura e fermentação** — cepa, atenuação, faixa térmica, pitch e cronograma.
5. **Água** — água base, alvo, sais, sulfato/cloreto, pH estimado.
6. **Resumo** — receita final, conformidade BJCP, riscos e brewday.

A qualquer momento, a lateral deve mostrar o impacto em tempo real:

- OG calculada vs faixa BJCP
- FG calculada vs faixa BJCP
- ABV vs faixa
- IBU vs faixa
- SRM vs faixa
- BU:GU
- pH estimado
- volume de água

Não usar um único “score mágico” como verdade. Mostrar cada dimensão individualmente e um resumo do tipo:

- `Dentro do estilo`
- `Mais amarga que o estilo`
- `Cor abaixo da faixa`
- `FG provavelmente alta`

### 3. Biblioteca BJCP

Tela dedicada para explorar estilos.

Cada estilo deve mostrar:

- código e nome
- categoria
- OG / FG / ABV / IBU / SRM
- aparência
- aroma
- sabor
- impressão geral em português simples
- receitas Democrata relacionadas

Adicionar comparação entre dois estilos quando possível.

### 4. Brewday / Modo Brassagem

Esta é a tela mais importante do produto.

No celular, usar tela limpa e grande:

- `ETAPA 3 DE 8`
- nome da etapa
- temperatura alvo
- cronômetro principal
- instrução atual
- próxima ação
- leituras rápidas

Botões grandes:

- `Iniciar / Pausar`
- `Concluir etapa`
- `+1 min`
- `Registrar leitura`

Etapas devem ser derivadas da receita real:

- preparação de água
- aquecimento da água de ataque
- mostura / descansos
- mash out
- lavagem
- pré-fervura
- fervura
- adições de lúpulo em seus tempos corretos
- whirlpool
- resfriamento
- transferência
- inoculação

Durante fervura, gerar automaticamente uma linha do tempo das adições de lúpulo.

Registrar valores reais da brassagem separadamente dos valores previstos:

- volume pré-fervura
- densidade pré-fervura
- volume pós-fervura
- OG real
- temperatura de inoculação
- observações

### 5. Fermentação

Após a brassagem, transformar a receita em acompanhamento de lote.

Mostrar:

- temperatura alvo
- dias de fermentação
- leituras de densidade
- FG prevista vs real
- dry hop programado
- descanso de diacetil
- cold crash
- embalagem

Não prometer previsão exata de término; usar estado e tendência.

### 6. Água

A água deve ser útil para quem realmente vai pesar sais.

Mostrar:

- água base
- perfil alvo
- Ca, Mg, Na, Cl, SO4, HCO3
- sulfato : cloreto
- sais em gramas
- volume total de água
- pH estimado da mostura

Separar claramente “estimado” de “medido”.

### 7. Diagnóstico de problemas

Substituir textos excessivamente técnicos por diagnóstico prático.

Fluxo:

`O que você percebeu?`

Ex.: manteiga, maçã verde, solvente, milho cozido, papelão, azedo, fenólico, vegetal, metálico.

Para cada hipótese mostrar:

- possível causa
- quando costuma acontecer
- o que ainda pode ser feito neste lote
- como evitar na próxima vez
- confiança/limitação do diagnóstico

### 8. Histórico de lotes

Separar **receita** de **brassagem**.

Uma receita pode ter vários lotes.

Cada lote deve guardar:

- data
- OG prevista / real
- FG prevista / real
- ABV previsto / real
- eficiência prevista / real
- notas
- avaliação de 1 a 5
- “faria novamente?”

Botão `Fazer novamente` deve duplicar a receita preservando as notas do lote anterior como referência.

## Direção visual

Identidade: cervejaria artesanal brasileira premium, oficina, madeira escura, metal, vidro, cobre, âmbar e creme.

Evitar estética de dashboard SaaS azul/roxo, neon futurista, laboratório sci-fi ou excesso de glassmorphism.

Paleta-base sugerida:

- carvão profundo
- preto quente
- âmbar
- cobre
- creme
- verde de lúpulo usado com moderação

Tipografia:

- serif forte apenas em títulos/branding
- sans limpa no trabalho diário
- números e medições com fonte monoespaçada quando útil

Hero pode ser cinematográfico; telas operacionais devem ser muito mais sóbrias.

## Comparação com a versão Gemini

Ao final, produzir um documento ou seção comparando objetivamente:

| Área | Gemini atual | V4 autoral |
|---|---|---|
| arquitetura | grande tela com muitos módulos | fluxos separados por tarefa |
| BJCP | indicadores e barras | sistema que orienta a receita |
| receita | edição ampla e técnica | criação guiada com impacto em tempo real |
| brewday | cockpit complexo | execução mobile-first |
| histórico | receita e lote pouco separados | receita com múltiplas brassagens |
| linguagem | muitos termos grandiosos | linguagem de cervejeiro clara |
| IA | destaque forte | assistente opcional |
| visual | craft-tech | cervejaria premium funcional |

## Estratégia de implementação para economizar Codex

Não reconstruir tudo em uma única tarefa.

### Fase 1 — Fundação V4

Objetivo: criar o esqueleto novo sem implementar todas as funções.

- criar shell/layout V4
- nova navegação
- nova home
- design tokens
- preservar storage e cálculos existentes
- criar tipos/estrutura de lotes se necessário
- nada de refatorar brewday ainda
- build deve passar

### Fase 2 — Recipe Forge + BJCP

- fluxo guiado
- painel de métricas BJCP
- biblioteca de estilos
- reutilizar banco BJCP existente
- alertas lógicos por métrica

### Fase 3 — Brewday mobile-first

- nova experiência de brassagem
- cronômetro por etapa
- linha do tempo de lúpulos
- registros reais do lote

### Fase 4 — Fermentação + histórico

- modelo de brew session/lote
- densidades reais
- notas e avaliação
- Fazer novamente

### Fase 5 — Água + diagnóstico + ferramentas

- reorganizar recursos existentes
- simplificar linguagem
- separar estimativa de medição

### Fase 6 — Polimento

- animações discretas
- estados vazios
- responsividade
- acessibilidade
- revisão de textos
- comparação Gemini vs V4

## Regras para o Codex

Em cada fase:

1. Leia este arquivo antes de editar.
2. Trabalhe somente na fase pedida.
3. Não remova cálculos ou dados úteis sem justificar.
4. Não altere `main` diretamente; trabalhar em `v4-authoral`.
5. Evite dependências novas sem necessidade clara.
6. Rode TypeScript e build antes de terminar.
7. Corrija todos os erros introduzidos na fase.
8. Ao finalizar, resuma arquivos alterados, decisões e limitações.
9. Pare depois da fase solicitada; não continue sozinho para a próxima.

## Critério de sucesso

A V4 precisa fazer um cervejeiro abrir o app e pensar:

> “Isso entende como eu faço cerveja.”

E não apenas:

> “Isso parece bonito.”

A beleza deve vir da clareza, do ritual da brassagem e da identidade da Democrata Bier.