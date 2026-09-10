# Democrata Bier V4 — Release Notes

## Estado

V4 autoral funcional, pronta para revisão visual final e merge do PR.

## O que está pronto

### Bancada
- Home própria com identidade Democrata.
- Foto `/brewmaster.jpg` como fundo principal.
- Receita aberta, métricas principais, estado BJCP, próxima ação, último lote e receitas para repetir.
- Sem data de fundação inventada.

### Recipe Forge
- Criação/edição guiada em seis etapas: intenção, grãos, lúpulos, fermentação, água e resumo.
- Painel persistente com OG, FG, ABV, IBU e SRM comparados individualmente às faixas do estilo.
- Grãos e lúpulos ligados aos bancos já existentes.
- Levedura, cronograma de fermentação, mostura e sais editáveis.
- Salvamento local preservado.

### Atlas BJCP
- Busca de estilos.
- Ficha de faixa numérica e perfil sensorial.
- Comparação entre dois estilos.
- Aplicação do estilo à receita atual.
- Base identificada como BJCP 2021 para cerveja.

### Brewday
- Execução mobile-first.
- Etapas derivadas da receita real.
- Temperatura alvo, cronômetro, próxima ação e progresso.
- Fervura com linha do tempo das adições de lúpulo.
- Registro de volume/densidade pré-fervura, volume pós-fervura, OG, temperatura de inoculação e pH medido.
- Valores previstos e reais separados.

### Fermentação e histórico
- `BrewSession` representa um lote real separado da receita.
- Leituras de densidade, temperatura e observação.
- Previsto x real para OG, FG, ABV e eficiência.
- Estados planejado, brassagem, fermentando, embalado e concluído.
- Avaliação de 1–5 estrelas e “faria novamente?”.
- Notas finais do lote.
- Repetição de receita pode carregar as notas do lote anterior como referência.

### Água
- Água de partida e perfil alvo.
- Ca, Mg, Na, Cl, SO4 e HCO3 previstos.
- Relação sulfato/cloreto.
- Sais e ácido em quantidades operacionais.
- pH previsto explicitamente separado do pH medido no lote.

### Diagnóstico
- Busca pelo que o cervejeiro percebeu, não por jargão químico.
- Hipóteses do banco de off-flavors.
- Percepção, causas, ação possível no lote, prevenção e limite do diagnóstico.
- Sem depender de IA.

### Ferramentas mantidas
- Calculadoras rápidas.
- Ficha da receita / impressão.
- Estúdio de rótulos.
- Assistente de IA opcional.

## Persistência

Mantidas as chaves históricas de receitas e estilos do navegador. Lotes reais usam a chave `democrata_brew_sessions_v1`.

## Validação

O workflow do GitHub usa Node 22 e executa:

1. instalação de dependências;
2. `npm run lint` (`tsc --noEmit`);
3. `npm run build` (Vite produção).

A validação da V4 foi executada com sucesso após a integração dos novos workspaces.

## Decisão de produto

O app não tenta julgar se uma cerveja é “boa”. Ele ajuda o cervejeiro a planejar, enxergar desvios em relação ao estilo, executar a brassagem, registrar o que realmente aconteceu e aprender com o lote seguinte.
