# ADR-002 — Simulações e ambiente

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

R14-P7 define simulador local substituível; R01-P6 permite e-mail de teste ou registro local. Ambiente acadêmico ainda pendente.

## Problema

Como testar integrações sem cobrança real?

## Alternativas consideradas

Gateway real; sandbox externo; simulador local.

## Decisão proposta

Requisito confirmado: simulador local de pagamento com aprovação, recusa, pendência, vencimento, tardio e falha de estorno. Propor adaptadores para frete por tabela, logística manual e mensagens de teste. Não impor interface específica de escolha nem exceção HTTP; implantação e proteção do canal em TASK-001.

## Deliberação da TASK-001 — 2026-10-25

[Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): desenvolvimento/testes em Windows/Ubuntu WSL2, simulador financeiro restrito e substituível, frete tabelado após PD-004, logística manual e caixa local protegida de mensagens. HTTPS para acesso dos clientes; nenhuma dispensa de transporte seguro ou cobrança real. WSL2 instalado foi identificado; runtime Linux/dispositivo e serviços ainda precisam de verificação. Implantação final não é ratificada por esta proposta. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Reproduz casos necessários sem fornecedor financeiro.

## Consequências

O pacote completo do ADR permanece PROPOSED devido ao ambiente/adaptadores; isso não reabre a decisão do simulador. Não valida produção real.

## RF/RN/RNF/UC relacionados

RF-003, RF-011, RF-012, RF-013, RF-024; RN-012, RN-014, RN-033; RNF-001, RNF-006; UC-003, UC-011, UC-012, UC-013, UC-024.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
