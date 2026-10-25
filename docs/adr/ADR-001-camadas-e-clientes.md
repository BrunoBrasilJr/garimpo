# ADR-001 — Camadas e clientes

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

Web e aplicativo compartilham REST; React Native/Expo definido no PDF. Demais tecnologias constavam no pacote anterior com referência a Word indisponível nesta revisão.

## Problema

Como organizar código sem duplicar regras?

## Alternativas consideradas

Monólito modular em camadas; serviços separados; regras duplicadas nos clientes.

## Decisão proposta

Propor apresentação React/Vite e React Native/Expo, aplicação Express/TypeScript, persistência Prisma e PostgreSQL. Ratificar stack/camadas em TASK-001. Administração só web é requisito confirmado; plataforma mobile/implantação seguem PD-002.

## Deliberação da TASK-001 — 2026-10-25

Execução contínua autorizada pelo responsável; pacote técnico ratificado em 2026-10-25. [Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): monólito modular TypeScript/npm workspaces, Node 24 LTS, React/Vite, Express 5, PostgreSQL 17/Prisma 7 e Expo SDK 57, com versões e requisitos oficiais consultados. Bootstrap deverá fixar patches/lockfile e comprovar build; consulta documental não é teste de compatibilidade executado. Proposta de validação web em Chrome/Edge e mobile Android/iOS, sem exclusividade; dispositivo disponível ainda precisa ser identificado. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Centraliza invariantes e transações; serviços separados não foram exigidos.

## Consequências

Compatibilidade e versões precisam de verificação; nenhuma exclusão de iOS/obrigação de Android está aprovada.

## RF/RN/RNF/UC relacionados

RF-001, RF-002, RF-005, RF-011, RF-026; RN-001, RN-032; RNF-008, RNF-012; UC-001, UC-002, UC-005, UC-011, UC-026.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
