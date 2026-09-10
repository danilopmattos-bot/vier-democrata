# Democrata Bier — Gemini atual vs V4 autoral

## Resumo

A V4 não trata a versão herdada do Gemini como produto final. Ela preserva apenas os dados, cálculos e utilidades que continuam úteis e reconstrói a experiência em torno do processo real de fazer cerveja em casa.

| Área | Versão herdada / Gemini | V4 autoral |
|---|---|---|
| Estrutura | Muitos módulos técnicos expostos ao mesmo tempo | Fluxo por momento: Bancada → Receita → Brassagem → Fermentação → Água |
| Home | Dashboard com atalhos e telemetria | Brew Desk: receita aberta → estado BJCP → próxima ação → último lote → repetir |
| BJCP | Score/barras como elemento forte | OG, FG, ABV, IBU e SRM analisados individualmente, com faixa real e estado |
| Criação de receita | Formulário longo com editores independentes | Recipe Forge guiado em seis etapas, com painel de impacto sempre visível |
| Estilos | Seletor/modal | Atlas BJCP com busca, ficha e comparação entre dois estilos |
| Receita x lote | Fronteira pouco clara | Receita é plano; BrewSession registra o que realmente aconteceu |
| Brewday | Cockpit com muita informação | Tela mobile-first com etapa atual, alvo, cronômetro, próxima ação e leituras reais |
| Lúpulos | Editor de adições | Recipe Forge + linha do tempo operacional durante a fervura |
| Fermentação | Cronograma dentro da receita | Área própria com leituras de densidade/temperatura, previsto x real e avaliação |
| Histórico | Secundário | Lotes persistentes com rating, notas e “faria novamente?” |
| Água | Laboratório técnico | Bancada prática: água base, alvo, sais a pesar, íons previstos e pH medido separado |
| Diagnóstico | Matriz/IA com textos extensos | Busca por percepção sensorial, hipótese, ação no lote, prevenção e limite do diagnóstico |
| IA | Presença forte | Assistente opcional; o app funciona sem IA |
| Linguagem | Craft-tech, termos grandiosos e alguns rótulos pseudo-científicos | Linguagem direta de cervejeiro caseiro, com precisão marcada como previsão ou medição |
| Visual | Dashboard craft-tech | Cervejaria/oficina premium: carvão, cobre, âmbar, creme e verde de lúpulo |
| Mobile | Adaptação do desktop | Brewday e navegação tratados como fluxos próprios no celular |

## O que foi mantido

- Compatibilidade com a chave histórica de receitas no `localStorage`.
- Banco de estilos e ingredientes existente quando tecnicamente útil.
- Motor de cálculo de OG, FG, ABV, IBU, SRM, água, mash e ferramentas auxiliares.
- Receitas salvas no navegador.
- Calculadoras rápidas, ficha de impressão e rótulos como ferramentas secundárias.

## O que mudou de princípio

### BJCP não é uma nota de qualidade

A V4 evita um veredito único. Uma receita pode ficar fora de uma faixa e ainda ser exatamente a cerveja que o cervejeiro deseja. O sistema mostra em qual dimensão ela se afastou e deixa a decisão explícita para o usuário.

### Previsão não é medição

OG prevista, pH estimado e eficiência calculada pertencem à receita. OG real, pH medido, volume real e FG real pertencem ao lote. Essa separação evita que um cálculo pareça um dado observado.

### Receita não é brassagem

Uma receita pode gerar vários lotes. Cada BrewSession guarda data, estado, leituras, números reais, avaliação e notas. Repetir uma receita pode usar as notas do lote anterior como referência sem sobrescrever o histórico.

### Brewday é execução

Durante a brassagem o objetivo não é mostrar tudo que o software sabe. O objetivo é dizer claramente o que fazer agora, qual é o alvo, quanto tempo falta, o que vem depois e onde registrar uma medição.

## Referência BJCP

A interface identifica a base de estilos como BJCP 2021 para cerveja. O produto deve tratar as faixas como referência de estilo e evitar alegar certificação, endosso ou precisão que não existe.

## Critério final

A versão autoral é considerada melhor quando reduz decisões ambíguas durante a brassagem, registra melhor o que realmente aconteceu e ajuda o cervejeiro a repetir ou corrigir um lote — não simplesmente quando tem mais efeitos visuais.
