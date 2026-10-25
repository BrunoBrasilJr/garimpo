# Conciliação com a elicitação final

## Decisão de origem

O responsável confirmou: “o pdf é a versão final” e autorizou a correção com “bora”, esclarecendo que não se trata de apresentação. Fonte: [98 respostas transcritas](../sources/elicitacao-final.md). A revisão substitui regras divergentes do pacote anterior, preservando IDs e sem executar software.

## Principais correções

| Tema | Versão anterior superada | Fonte final aplicada |
| --- | --- | --- |
| Perfis | Somente USER/ADMIN; administrador compra | USER separado de ADMIN/OPERATOR; último ADMIN protegido |
| Reserva | Item do carrinho com prazo individual | Checkout único, conjunto todos-ou-nenhum, 15min; carrinho sem reserva |
| Pagamento | Pedido sempre antes de aprovação e prazo único 15min | Cartão pode preceder pedido; Pix 30min/boleto 2 dias; até 3 pendentes |
| Cupom | Nunca acumula e reserva uso no pedido | Acumulação configurável; reserva no checkout e consome na criação |
| Troca | Sem equivalente segue estorno | Espera 30 dias após conferência, oferta 48h e aceite; conversão não autoriza estorno |
| Conta | Bloqueado acessa; confirmação ausente | Bloqueio impede login; confirmação, encerramento e reativação |
| Avaliação | Uma por cliente/edição | Uma por cliente/edição/pedido; regras de ocultação e devolução |
| Relatórios | Vendas antigas recalculadas e vários gêneros | Evento financeiro no seu período; ticket por coorte; gênero principal |
| Infraestrutura | Android/local/HTTP/sete backups e metas numéricas aprovados | Plataforma/ambiente/transporte/retenção/metas pendentes ou propostas |
| Notificação | Recuperação/reposição somente | Eventos comerciais completos, falha e repetição; alerta encerra após sucesso |

## Cobertura das 98 respostas

Cada linha liga uma resposta a regras/requisitos ou pendências. Respostas posteriores refinam a mesma regra; não contar versões anteriores como regras cumulativas incompatíveis. Consulta inversa: RN no README contém fonte e RF/UC; matriz do README liga RF a API/teste/TASK.

| Resposta | Regra/requisito ou pendência consolidada |
| --- | --- |
| [R01-P1](../sources/elicitacao-final.md#r01-p1) | RN-032 |
| [R01-P2](../sources/elicitacao-final.md#r01-p2) | RN-001 |
| [R01-P3](../sources/elicitacao-final.md#r01-p3) | RN-004 |
| [R01-P4](../sources/elicitacao-final.md#r01-p4) | RN-006, RN-007 |
| [R01-P5](../sources/elicitacao-final.md#r01-p5) | RN-011, RN-013 |
| [R01-P6](../sources/elicitacao-final.md#r01-p6) | RN-033 |
| [R01-P7](../sources/elicitacao-final.md#r01-p7) | RN-021 |
| [R02-P1](../sources/elicitacao-final.md#r02-p1) | RN-009 |
| [R02-P2](../sources/elicitacao-final.md#r02-p2) | RN-004, RN-035 |
| [R02-P3](../sources/elicitacao-final.md#r02-p3) | RN-005 |
| [R02-P4](../sources/elicitacao-final.md#r02-p4) | RN-006 |
| [R02-P5](../sources/elicitacao-final.md#r02-p5) | RN-011 |
| [R02-P6](../sources/elicitacao-final.md#r02-p6) | RN-019 |
| [R02-P7](../sources/elicitacao-final.md#r02-p7) | RN-022 |
| [R03-P1](../sources/elicitacao-final.md#r03-p1) | RN-015, RN-019 |
| [R03-P2](../sources/elicitacao-final.md#r03-p2) | RN-019 |
| [R03-P3](../sources/elicitacao-final.md#r03-p3) | RN-020 |
| [R03-P4](../sources/elicitacao-final.md#r03-p4) | RN-021 |
| [R03-P5](../sources/elicitacao-final.md#r03-p5) | RN-022 |
| [R03-P6](../sources/elicitacao-final.md#r03-p6) | RN-010 |
| [R03-P7](../sources/elicitacao-final.md#r03-p7) | RN-016 |
| [R04-P1](../sources/elicitacao-final.md#r04-p1) | RN-022 |
| [R04-P2](../sources/elicitacao-final.md#r04-p2) | RN-008, RN-017 |
| [R04-P3](../sources/elicitacao-final.md#r04-p3) | RN-016 |
| [R04-P4](../sources/elicitacao-final.md#r04-p4) | RN-018 |
| [R04-P5](../sources/elicitacao-final.md#r04-p5) | RN-016 |
| [R04-P6](../sources/elicitacao-final.md#r04-p6) | RN-020, RN-034 |
| [R04-P7](../sources/elicitacao-final.md#r04-p7) | RN-001 |
| [R05-P1](../sources/elicitacao-final.md#r05-p1) | RN-021, RN-041 |
| [R05-P2](../sources/elicitacao-final.md#r05-p2) | RN-021, RN-022 |
| [R05-P3](../sources/elicitacao-final.md#r05-p3) | RN-022 |
| [R05-P4](../sources/elicitacao-final.md#r05-p4) | RN-023 |
| [R05-P5](../sources/elicitacao-final.md#r05-p5) | RN-025 |
| [R05-P6](../sources/elicitacao-final.md#r05-p6) | RN-024 |
| [R05-P7](../sources/elicitacao-final.md#r05-p7) | RN-027 |
| [R06-P1](../sources/elicitacao-final.md#r06-p1) | RN-007, RN-009 |
| [R06-P2](../sources/elicitacao-final.md#r06-p2) | RN-012, RN-013 |
| [R06-P3](../sources/elicitacao-final.md#r06-p3) | RN-009 |
| [R06-P4](../sources/elicitacao-final.md#r06-p4) | RN-019, RN-027, RN-035, RN-041 |
| [R06-P5](../sources/elicitacao-final.md#r06-p5) | RN-014 |
| [R06-P6](../sources/elicitacao-final.md#r06-p6) | RN-024 |
| [R06-P7](../sources/elicitacao-final.md#r06-p7) | RN-025 |
| [R07-P1](../sources/elicitacao-final.md#r07-p1) | RN-012, RN-013 |
| [R07-P2](../sources/elicitacao-final.md#r07-p2) | RN-011 |
| [R07-P3](../sources/elicitacao-final.md#r07-p3) | RN-019 |
| [R07-P4](../sources/elicitacao-final.md#r07-p4) | RN-008 |
| [R07-P5](../sources/elicitacao-final.md#r07-p5) | RN-002, RN-003 |
| [R07-P6](../sources/elicitacao-final.md#r07-p6) | RN-001, RN-028 |
| [R07-P7](../sources/elicitacao-final.md#r07-p7) | RN-025 |
| [R08-P1](../sources/elicitacao-final.md#r08-p1) | RN-039 |
| [R08-P2](../sources/elicitacao-final.md#r08-p2) | RN-011 |
| [R08-P3](../sources/elicitacao-final.md#r08-p3) | RN-028 |
| [R08-P4](../sources/elicitacao-final.md#r08-p4) | RN-023, RN-028 |
| [R08-P5](../sources/elicitacao-final.md#r08-p5) | RN-022, RN-040 |
| [R08-P6](../sources/elicitacao-final.md#r08-p6) | RN-040 |
| [R08-P7](../sources/elicitacao-final.md#r08-p7) | RN-030 |
| [R09-P1](../sources/elicitacao-final.md#r09-p1) | RN-022 |
| [R09-P2](../sources/elicitacao-final.md#r09-p2) | RN-022, RN-023, RN-035 |
| [R09-P3](../sources/elicitacao-final.md#r09-p3) | RN-039 |
| [R09-P4](../sources/elicitacao-final.md#r09-p4) | RN-040 |
| [R09-P5](../sources/elicitacao-final.md#r09-p5) | RN-030, RN-034 |
| [R09-P6](../sources/elicitacao-final.md#r09-p6) | RN-030 |
| [R09-P7](../sources/elicitacao-final.md#r09-p7) | RN-030, RN-036 |
| [R10-P1](../sources/elicitacao-final.md#r10-p1) | RN-030 |
| [R10-P2](../sources/elicitacao-final.md#r10-p2) | RN-036 |
| [R10-P3](../sources/elicitacao-final.md#r10-p3) | RN-036 |
| [R10-P4](../sources/elicitacao-final.md#r10-p4) | RN-026 |
| [R10-P5](../sources/elicitacao-final.md#r10-p5) | RN-038 |
| [R10-P6](../sources/elicitacao-final.md#r10-p6) | RN-032; PD-001, PD-002, PD-003 |
| [R10-P7](../sources/elicitacao-final.md#r10-p7) | RNF-003; PD-007 |
| [R11-P1](../sources/elicitacao-final.md#r11-p1) | RN-030 |
| [R11-P2](../sources/elicitacao-final.md#r11-p2) | RN-037 |
| [R11-P3](../sources/elicitacao-final.md#r11-p3) | RN-010 |
| [R11-P4](../sources/elicitacao-final.md#r11-p4) | RN-015 |
| [R11-P5](../sources/elicitacao-final.md#r11-p5) | RN-045 |
| [R11-P6](../sources/elicitacao-final.md#r11-p6) | RN-002, RN-003 |
| [R11-P7](../sources/elicitacao-final.md#r11-p7) | RN-031; PD-008 |
| [R12-P1](../sources/elicitacao-final.md#r12-p1) | RN-001, RN-029 |
| [R12-P2](../sources/elicitacao-final.md#r12-p2) | RN-044 |
| [R12-P3](../sources/elicitacao-final.md#r12-p3) | RN-041 |
| [R12-P4](../sources/elicitacao-final.md#r12-p4) | RN-024, RN-042 |
| [R12-P5](../sources/elicitacao-final.md#r12-p5) | RN-043 |
| [R12-P6](../sources/elicitacao-final.md#r12-p6) | RN-045 |
| [R12-P7](../sources/elicitacao-final.md#r12-p7) | RNF-007; TEST-028 |
| [R13-P1](../sources/elicitacao-final.md#r13-p1) | RN-001, RN-032 |
| [R13-P2](../sources/elicitacao-final.md#r13-p2) | RN-043 |
| [R13-P3](../sources/elicitacao-final.md#r13-p3) | RN-015, RN-020, RN-023, RN-034 |
| [R13-P4](../sources/elicitacao-final.md#r13-p4) | RN-040 |
| [R13-P5](../sources/elicitacao-final.md#r13-p5) | RN-017 |
| [R13-P6](../sources/elicitacao-final.md#r13-p6) | RN-008, RN-010, RN-014 |
| [R13-P7](../sources/elicitacao-final.md#r13-p7) | RN-025 |
| [R14-P1](../sources/elicitacao-final.md#r14-p1) | RN-030 |
| [R14-P2](../sources/elicitacao-final.md#r14-p2) | RN-025 |
| [R14-P3](../sources/elicitacao-final.md#r14-p3) | RN-043 |
| [R14-P4](../sources/elicitacao-final.md#r14-p4) | RN-001, RN-014, RN-038 |
| [R14-P5](../sources/elicitacao-final.md#r14-p5) | RN-042 |
| [R14-P6](../sources/elicitacao-final.md#r14-p6) | RN-005, RN-036, RN-045 |
| [R14-P7](../sources/elicitacao-final.md#r14-p7) | RN-012, RN-033 |


## Limites e histórico

- IDs RF-001–RF-025, RN-001–RN-038, RNF-001–RNF-012, UC-001–UC-025, TASK-001–TASK-037, TEST-001–TEST-031 e ADR-001–ADR-006 preservados. Novos requisitos e regras recebem IDs posteriores.
- API-009.04 e API-014.02 preservadas como DEPRECATED: exclusão de avaliação pelo autor não foi especificada; aprovação de cancelamento na separação foi substituída por devolução.
- Não existe evidência de teste de software, aprovação do professor ou ratificação técnica nesta revisão. O antigo relatório de 371 verificações não comprova a nova versão.
- Sem repositório Git no pacote inspecionado; não foi criada branch/commit. Cópia de segurança dos documentos anteriores foi salva em tmp/planejamento-antes-conciliacao.zip, fora do pacote normativo.
- Dúvida residual PD-009 registra frete em devoluções parciais sucessivas que totalizem o pedido; não impede corrigir as decisões já explícitas.
