# ADR-004 — Eventos e valores históricos

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

Snapshots/ rateio aprovados no PDF; notificações podem falhar; relatórios distinguem evento financeiro e coorte de ticket.

## Problema

Como preservar histórico e repetir operações sem duplicação?

## Alternativas consideradas

Execução apenas em memória; fila externa; outbox no banco e processamento idempotente.

## Decisão proposta

Propor outbox persistente, snapshots por unidade e valores em centavos; rateio por maiores restos com desempate estável a ratificar. FinancialEvent imutável por data do evento; ticket por coorte usa ajustes conhecidos. Mensagem tem tentativa/entrega explícita; alerta só encerra no sucesso.

## Deliberação da TASK-001 — 2026-10-25

[Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): centavos inteiros e rateio por maiores restos com desempate por ID estável de unidade congelado; outbox/tentativas persistentes e deduplicação; eventos financeiros imutáveis separados de estorno tardio sem venda. Persistir UTC, interpretar filtro de data em America/Sao_Paulo com início inclusivo/fim exclusivo e registrar asOf. Não alterar regras confirmadas de evento/coorte. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Evita perda por reinício e alteração de preço histórico.

## Consequências

Pagamento tardio sem venda tem estorno próprio e não infla receita de vendas. Falha de estorno não marca sucesso nem desfaz cancelamento.

## RF/RN/RNF/UC relacionados

RF-008, RF-011, RF-012, RF-015, RF-023, RF-024; RN-010, RN-018, RN-024, RN-030, RN-041, RN-042; RNF-004, RNF-011; UC-008, UC-011, UC-012, UC-015, UC-023, UC-024.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
