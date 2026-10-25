# ADR-003 — Reservas e transações

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

Carrinho sem reserva, checkout único 15min, Pix 30min/boleto 2 dias, até 3 pendentes; usado único e cupom disputado.

## Problema

Como garantir saldo e exclusão mútua?

## Alternativas consideradas

Validação só cliente; transações com locks/atualização condicional; locks distribuídos.

## Decisão proposta

Propor transações com ordem estável de identidade, agregado, ofertas e cupom; checkout todos-ou-nenhum, transferência atômica ao pedido, tentativa de cartão sem pedido e idempotência. Validar também último ADMIN e atendimento único por unidade. Isolamento concreto em TASK-001.

## Deliberação da TASK-001 — 2026-10-25

[Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): transações críticas SERIALIZABLE em PostgreSQL, até três tentativas totais para serialização/deadlock, coordenação ordenada e idempotência atômica com efeito. Revalidar relógio/estado/saldo em cada comando; sem rede externa dentro da transação. Constraints e concorrência real continuam obrigatórias. A documentação oficial descreve a necessidade de repetir transações abortadas; a implementação e testes serão feitos somente nas tarefas responsáveis. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Permite comprovar invariantes com concorrência real sem serviço extra.

## Consequências

Requer tratar deadlocks/repetições; não acoplar chamada externa à transação. Novo modelo substitui reserva por item do carrinho.

## RF/RN/RNF/UC relacionados

RF-010, RF-011, RF-012, RF-014, RF-016, RF-018, RF-019, RF-026; RN-006, RN-007, RN-008, RN-011, RN-013, RN-017, RN-029, RN-035; RNF-004, RNF-011; UC-010, UC-011, UC-012, UC-014, UC-016, UC-018, UC-019, UC-026.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
