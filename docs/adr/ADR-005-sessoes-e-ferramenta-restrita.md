# ADR-005 — Sessões e canais de acesso

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

Contas internas separadas; e-mail confirmado antes do primeiro pedido; bloqueio/encerramento impedem login.

## Problema

Como proteger sessão, links e mensagens de teste?

## Alternativas consideradas

Tokens permanentes; sessões revogáveis; caixas públicas versus acesso restrito.

## Decisão proposta

Propor sessão revogável e credencial curta com renovação, tokens por propósito guardados como hash e mensagens protegidas. Valores confirmados: inicial 24h/reset 30min; reset revoga todas sessões. Algoritmos, prazo de mudança/reativação e armazenamento web/mobile em TASK-001.

## Deliberação da TASK-001 — 2026-10-25

[Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): scrypt versionado com salt aleatório e custo explícito, sessões opacas revogáveis, acesso 15min/renovação rotativa até 7 dias, cookie web HttpOnly/Secure com proteção de origem/CSRF e SecureStore mobile. Hash de tokens por propósito; confirmação inicial 24h/reset 30min preservados; mudança e reativação propostas em 24h. Caixa local protegida por acesso técnico separado e bootstrap ADMIN explícito sem senha padrão. Aferição de custo, revogação e proteção do canal dependem dos testes de implementação. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Permite revogação verificável e evita mistura de credenciais comerciais/técnicas.

## Consequências

OPERATOR não herda ADMIN; último ADMIN protegido. Não autoriza acesso de bloqueado por token antigo nem dispensa transporte seguro.

## RF/RN/RNF/UC relacionados

RF-001, RF-002, RF-003, RF-004, RF-021, RF-024, RF-026, RF-027, RF-028; RN-001, RN-002, RN-003, RN-028, RN-029, RN-043, RN-044; RNF-001, RNF-002, RNF-006, RNF-010; UC-001, UC-002, UC-003, UC-004, UC-021, UC-024, UC-026, UC-027, UC-028.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
