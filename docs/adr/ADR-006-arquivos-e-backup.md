# ADR-006 — Arquivos e backup

## Status

ACCEPTED

Regras de produto confirmadas no PDF. Pacote técnico da TASK-001 ratificado pelo responsável em 2026-10-25: “Aprovo o pacote e conferi DOC-001/002”. Registro completo em docs/architecture/parametros.md; compatibilidade executável será comprovada no bootstrap, sem alegar teste já executado.

## Contexto

R11-P5/R12-P6 definem imagens/evidências e privacidade; R11-P7 deixa retenção/frequência/destino pendentes.

## Problema

Como preservar banco e arquivos com restauração verificável?

## Alternativas consideradas

Backup só banco; conjunto banco/arquivos; armazenamento externo versionado.

## Decisão proposta

Propor armazenamento por chaves internas, separando conteúdo público/privado, e backup consistente diário com manifesto. JPEG/PNG/WebP/5 MB e quantidades do PDF são requisitos. Retenção, destino e frequência de testes dependem de PD-008; não fixar sete cópias.

## Deliberação da TASK-001 — 2026-10-25

[Pacote concreto para decisão](../architecture/parametros.md#task-001--pacote-de-decisões-para-iniciar-a-implementação): chaves internas, bytes validados e raízes pública/privada separadas; backup diário com snapshot de banco, arquivos imutáveis e manifesto verificável, coleta de órfãos coordenada à retenção e restauração isolada. Limites de imagem confirmados preservados. PD-008 continua pendente quanto a retenção/destino/frequência/anonimização; não bloqueia bootstrap independente, mas bloqueia aceite dos trechos dependentes. Nenhuma política de sete cópias/SLA foi inventada. Ratificação registrada em 2026-10-25 pelo responsável: “Aprovo o pacote e conferi DOC-001/002”. Android disponível para validação inicial; iOS permanece alvo compatível sem evidência de execução neste momento. Pendências residuais explicitadas no pacote continuam abertas.

## Justificativa

Recuperação deve incluir referências e bytes, sem vazar evidência privada.

## Consequências

Restauração proposta em ambiente separado; procedimento e SLA não aprovados. Não afirmar aprovação do ambiente local.

## RF/RN/RNF/UC relacionados

RF-015, RF-016, RF-017, RF-025; RN-031, RN-045; RNF-002, RNF-009, RNF-010; UC-015, UC-016, UC-017, UC-025.

## Histórico da conciliação

ID preservado. O responsável confirmou o PDF de 14 rodadas como versão final e autorizou corrigir o pacote. Esta revisão substitui trechos incompatíveis; ADR-001/002/006 antes marcados ACCEPTED passam a PROPOSED quanto ao conjunto técnico sem evidência de aprovação na fonte final. Nenhuma tecnologia foi instalada ou implementada. Ver [conciliação](../architecture/conciliacao.md).

## Registro de ratificação

2026-10-25: responsável autorizou execução contínua do backlog e aprovou explicitamente o pacote técnico/conferência DOC-001/002. Estado anterior PROPOSED preservado no histórico; textos de proposta acima documentam a origem, e os parâmetros detalhados ratificados em TASK-001 passam a governar a implementação. Não há aprovação acadêmica presumida nem execução de software comprovada por esta decisão.
