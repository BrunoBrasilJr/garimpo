# Estratégia de testes e aceitação

Todos os cenários estão PLANEJADOS e NÃO EXECUTADOS. IDs existentes preservados; TEST-032 a TEST-035 cobrem RF-026 a RF-029. Fonte: README e respostas finais do PDF. Resultados reais futuros pertencem ao registro operacional da tarefa.

## Estratégia

Unitários para preço, rateio, estados e elegibilidade; integração em banco real de teste para transações/constraints; API para payload e autorização; E2E para clientes web/mobile conforme plataforma definida. Concorrência usa requisições independentes, não simulação sequencial. Relógio injetável testa antes/no limite/depois de 15min, 30min, 2 dias, 7 dias, 30 dias e 48h. Nenhum controle público de relógio é requisito do produto.

Cada cenário funcional deve cobrir sucesso e exceções listadas; recorte por tarefa conforme incremento explícito do backlog. Checkpoints exigem integração real, sem stub liberando regra comercial. Sem parâmetros pendentes não se declara aprovado o gate correspondente.

## TEST-001 Cadastrar conta

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

**Casos negativos/alternativos:** Entrada inválida ou e-mail existente não cria segunda conta.

**Rastreabilidade:** RF-001; UC-001; RN-001, RN-002, RN-029, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-004, TASK-005, TASK-006, TASK-033.

## TEST-002 Autenticar e encerrar sessão

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

**Casos negativos/alternativos:** Credenciais erradas e tokens revogados são negados sem dados sensíveis.

**Rastreabilidade:** RF-002; UC-002; RN-001, RN-028, RN-029, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-004, TASK-006, TASK-022, TASK-033.

## TEST-003 Recuperar senha

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

**Casos negativos/alternativos:** Resposta pública genérica; falha de mensagem permite repetição sem perder conta.

**Rastreabilidade:** RF-003; UC-003; RN-003, RN-032, RN-033; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; TASK-005, TASK-006, TASK-033.

## TEST-004 Gerenciar perfil e endereços

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

**Casos negativos/alternativos:** Endereço inválido bloqueia compra; e-mail proposto não substitui atual antes da confirmação.

**Rastreabilidade:** RF-004; UC-004; RN-002, RN-032, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-004, TASK-006, TASK-022, TASK-033.

## TEST-005 Explorar pesquisar e filtrar

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Busca cobre título, artistas de edição/faixa e faixas; década usa ano da edição; filtros se combinam; desconhecidos não viram anos inventados.

**Casos negativos/alternativos:** Sem resultados mostra lista vazia; edição inativa não permite nova compra.

**Rastreabilidade:** RF-005; UC-005; RN-004, RN-032, RN-036; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008; TASK-008, TASK-010, TASK-011, TASK-033.

## TEST-006 Consultar edição e ofertas

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Página agrupa novos/usados; usados exibem preço, fotos, Goldmine e descrição; prévia pertence à faixa e é opcional.

**Casos negativos/alternativos:** Sem áudio ou link indisponível não impede catálogo; esgotado não é comprável.

**Rastreabilidade:** RF-006; UC-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; TASK-008, TASK-010, TASK-011, TASK-033.

## TEST-007 Manter lista de desejos

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Adiciona/remove edição uma vez; não reserva nem ativa alerta implicitamente.

**Casos negativos/alternativos:** Item repetido é idempotente; conta não acessa lista alheia.

**Rastreabilidade:** RF-007; UC-007; RN-032, RN-037; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-012, TASK-033.

## TEST-008 Receber alertas de reposição

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Retorno de disponibilidade notifica todos compatíveis sem reservar; sucesso encerra; falha mantém inscrição; duplicação não envia duas vezes a mesma ativação.

**Casos negativos/alternativos:** Falha permite repetição; nova reposição após sucesso requer reinscrição.

**Rastreabilidade:** RF-008; UC-008; RN-024, RN-032, RN-037; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; TASK-012, TASK-023, TASK-033.

## TEST-009 Avaliar compra verificada

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

**Casos negativos/alternativos:** Compra não entregue ou totalmente desfeita é inelegível; outro autor não edita.

**Rastreabilidade:** RF-009; UC-009; RN-025, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-013, TASK-023, TASK-026, TASK-033.

## TEST-010 Manter carrinho e iniciar reserva

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

**Casos negativos/alternativos:** Falta de item aborta reserva completa; mudança comercial reinicia validação; endereço não reinicia prazo.

**Rastreabilidade:** RF-010; UC-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034.

## TEST-011 Cotar e criar pedido

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

**Casos negativos/alternativos:** CEP não atendido impede pedido e conserva checkout até prazo; mudança de frete exige aceite.

**Rastreabilidade:** RF-011; UC-011; RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-007, RNF-008, RNF-011; TASK-018, TASK-020, TASK-033, TASK-034.

## TEST-012 Simular pagamentos

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

**Casos negativos/alternativos:** Repetição não duplica efeito; vencimento não depende do job; recusa não renova prazo.

**Rastreabilidade:** RF-012; UC-012; RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041; RNF-001, RNF-002, RNF-003, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034.

## TEST-013 Acompanhar pedidos

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Exibe em separação, separado, envio, entrega, cobranças/estornos e rastreio manual; datas reais registradas, não estimadas.

**Casos negativos/alternativos:** Cliente bloqueado não entra; equipe mantém atendimento externo registrado.

**Rastreabilidade:** RF-013; UC-013; RN-015, RN-032, RN-033; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-021, TASK-033.

## TEST-014 Cancelar pedidos e unidades indisponíveis

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

**Casos negativos/alternativos:** Em separação usa devolução; cobrança antiga paga após substituição gera estorno separado; falha financeira não reabre pedido.

**Rastreabilidade:** RF-014; UC-014; RN-011, RN-017, RN-019, RN-032, RN-039, RN-041; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-019, TASK-022, TASK-025, TASK-028, TASK-033.

## TEST-015 Processar devoluções

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

**Casos negativos/alternativos:** Postagem ocorrida antes de análise muda para retorno após entrega; divergência pode rejeitar e exigir reenvio ao cliente.

**Rastreabilidade:** RF-015; UC-015; RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011; TASK-026, TASK-028, TASK-033.

## TEST-016 Processar trocas

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

**Casos negativos/alternativos:** Cliente pode converter em devolução; oferta no dia 29 mantém 48h; original rejeitado é reenviado por conta da loja.

**Rastreabilidade:** RF-016; UC-016; RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010, RNF-011; TASK-027, TASK-028, TASK-033.

## TEST-017 Administrar catálogo e imagens

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Publicação valida campos/fotos mínimos; suporta artistas por faixa e anos distintos; histórico impede exclusão; inativação preserva reservas existentes; limites de imagem aplicados.

**Casos negativos/alternativos:** Sem foto própria usado não publica; formato inválido rejeita; histórico impede exclusão física.

**Rastreabilidade:** RF-017; UC-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008, RNF-010; TASK-008, TASK-009, TASK-023, TASK-033.

## TEST-018 Controlar estoque

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

**Casos negativos/alternativos:** Reserva existente exige resolver compra antes de perda/avaria; repetição não duplica movimento.

**Rastreabilidade:** RF-018; UC-018; RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034.

## TEST-019 Administrar promoções e cupons

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

**Casos negativos/alternativos:** Cupom inaplicável informa motivo; fixo não gera negativo/crédito; frete permanece.

**Rastreabilidade:** RF-019; UC-019; RN-008, RN-016, RN-017, RN-018, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034.

## TEST-020 Administrar logística e atendimentos

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

**Casos negativos/alternativos:** Atualização concorrente revalida; OPERATOR não autoriza estorno/exceção financeira.

**Rastreabilidade:** RF-020; UC-020; RN-001, RN-015, RN-019, RN-023, RN-032, RN-040; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

## TEST-021 Consultar e administrar clientes

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

**Casos negativos/alternativos:** Reativação voluntária não remove bloqueio; tokens antigos não contornam estado da conta.

**Rastreabilidade:** RF-021; UC-021; RN-001, RN-028, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-022, TASK-023, TASK-033, TASK-034.

## TEST-022 Moderar avaliações

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

**Casos negativos/alternativos:** Devolução de todas as unidades não pode ser contornada por liberação manual.

**Rastreabilidade:** RF-022; UC-022; RN-001, RN-025, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-013, TASK-026, TASK-033.

## TEST-023 Consultar relatórios

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

**Casos negativos/alternativos:** Período sem pedidos não divide por zero; volume/meta de desempenho permanecem pendentes.

**Rastreabilidade:** RF-023; UC-023; RN-018, RN-021, RN-030, RN-032, RN-034; RNF-001, RNF-003, RNF-004, RNF-005; TASK-029, TASK-033, TASK-034.

## TEST-024 Processar notificações de teste

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

**Casos negativos/alternativos:** Falha de reposição não encerra inscrição; serviço real de produção não é requerido.

**Rastreabilidade:** RF-024; UC-024; RN-003, RN-024, RN-032, RN-033, RN-042; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

## TEST-025 Executar backup e restaurar

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

**Casos negativos/alternativos:** Falha não elimina último backup íntegro; ausência de parâmetros impede declarar aceite concluído.

**Rastreabilidade:** RF-025; UC-025; RN-031, RN-032; RNF-002, RNF-009, RNF-011, RNF-012; TASK-030, TASK-035.

## TEST-032 Gerenciar contas internas

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

**Casos negativos/alternativos:** Concorrência entre dois bloqueios não pode eliminar todos os administradores.

**Rastreabilidade:** RF-026; UC-026; RN-001, RN-029, RN-032, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-004, TASK-005, TASK-006, TASK-033.

## TEST-033 Encerrar e reativar conta

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Encerrar revoga acesso, cancela checkout/pendentes e preserva pagos/histórico; reativação confirma e-mail; bloqueio prevalece; retenção permanece pendente.

**Casos negativos/alternativos:** Não apagar histórico nem contornar bloqueio; dados fora da retenção exigem política definida.

**Rastreabilidade:** RF-027; UC-027; RN-032, RN-043; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; TASK-022, TASK-023, TASK-033.

## TEST-034 Confirmar e alterar e-mail

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

**Casos negativos/alternativos:** Token de reset não confirma e-mail; repetição/expiração não altera conta. Prazo específico de alteração/reativação em PD-005.

**Rastreabilidade:** RF-028; UC-028; RN-002, RN-032, RN-044; RNF-001, RNF-002, RNF-004, RNF-005, RNF-006, RNF-007, RNF-008, RNF-011; TASK-004, TASK-005, TASK-006, TASK-022, TASK-033.

## TEST-035 Configurar frete e cobertura

**Estado:** PLANEJADO. **Tipos:** unitário nas regras, integração/API e aceitação nos canais aplicáveis.

**Resultado obrigatório:** Somente ADMIN altera valores/prazos/cobertura; faixas podem ser não atendidas; edição da tabela não muda snapshot de pedido criado.

**Casos negativos/alternativos:** OPERATOR negado; configuração ausente não vira frete gratuito nem prazo fictício.

**Rastreabilidade:** RF-029; UC-029; RN-014, RN-032; RNF-001, RNF-002, RNF-004, RNF-005, RNF-007, RNF-008; TASK-018, TASK-033.

## TEST-026 Concorrência e dinheiro

**Estado:** PLANEJADO.

Disputar último usado, última unidade nova, uso de cupom e terceiro pedido pendente; somente efeitos permitidos sobrevivem. Concorrer pagamento/expiração/bloqueio/cancelamento, último ADMIN, aceite/expiração de oferta e atendimento por mesma unidade. Somar rateios exatamente; repetir evento e estorno não duplica dinheiro. Cobrir aprovação de cartão sem pedido após expiração e cobrança invalidada após cancelamento parcial.

**Rastreabilidade:** RF-004, RF-010, RF-011, RF-012, RF-014, RF-015, RF-016, RF-018, RF-019, RF-021, RF-026, RF-027; UC-004, UC-010, UC-011, UC-012, UC-014, UC-015, UC-016, UC-018, UC-019, UC-021, UC-026, UC-027; RNF-004; TASK-004, TASK-016, TASK-018, TASK-019, TASK-022, TASK-023, TASK-025, TASK-026, TASK-027, TASK-034.

## TEST-027 Desempenho

**Estado:** PLANEJADO.

Definir PD-007 antes de medir: volume, concorrência, ambiente, amostra, métrica e limites. Medir busca, reserva, cotação, pedido, pagamento e relatórios; registrar amostras e distribuição. Não importar metas numéricas da versão superada nem declarar sucesso sem critério definido.

**Rastreabilidade:** RF-005, RF-010, RF-011, RF-012, RF-023; UC-005, UC-010, UC-011, UC-012, UC-023; RNF-003; TASK-034.

## TEST-028 Acessibilidade e paridade

**Estado:** PLANEJADO.

Web: navegar por teclado, foco visível, rótulos, erros claros, contraste e descrições. Mobile: leitor de tela e ampliação de texto sem impedir ações; catálogo/conta/compra/pós-venda nos alvos ratificados. Administração somente web. Sincronizar o mesmo checkout entre dispositivos sem renovar prazo.

**Rastreabilidade:** RF-001, RF-004, RF-005, RF-006, RF-010, RF-011, RF-012, RF-015, RF-016; UC-001, UC-004, UC-005, UC-006, UC-010, UC-011, UC-012, UC-015, UC-016; RNF-007, RNF-008; TASK-006, TASK-010, TASK-011, TASK-017, TASK-020, TASK-028, TASK-033.

## TEST-029 Backup e restauração

**Estado:** PLANEJADO.

Após PD-008, gerar conjunto íntegro, interromper uma execução sem perder último válido, aplicar retenção definida, restaurar em destino separado e comparar dados, fotos e evidências privadas. Verificar periodicidade de teste e destino, registrar duração sem SLA inventado.

**Rastreabilidade:** RF-025; UC-025; RNF-009; TASK-030, TASK-035.

## TEST-030 Segurança e arquitetura

**Estado:** PLANEJADO.

Negar promoção de papel pública, compra por interno, gestão interna por OPERATOR, evidência alheia e links inválidos/expirados/reutilizados. Proteger último ADMIN em concorrência. Reset revoga todos tokens; bloqueio/encerramento impedem uso anterior; reativação não remove bloqueio. Validar JPEG/PNG/WebP/5 MB/quantidades e logs sem segredos. Configuração de transporte segundo ADR ratificado.

**Rastreabilidade:** RF-001, RF-002, RF-003, RF-004, RF-015, RF-016, RF-017, RF-021, RF-024, RF-026, RF-027, RF-028; UC-001, UC-002, UC-003, UC-004, UC-015, UC-016, UC-017, UC-021, UC-024, UC-026, UC-027, UC-028; RNF-001, RNF-002, RNF-005, RNF-006, RNF-010, RNF-012; TASK-003, TASK-004, TASK-005, TASK-008, TASK-022, TASK-026, TASK-027, TASK-031.

## TEST-031 Retomada de processamento

**Estado:** PLANEJADO.

Interromper processo com checkout/pedido/oferta/evento ativos; avançar relógio de teste e retomar. Reconciliar vencimentos corretamente e repetir notificações/estornos pendentes sem efeito duplicado. Falha de mensagem não bloqueia negócio nem encerra alerta. Oferta dia 29 mantém 48h completas; confirmar/refutar conversão sob corrida.

**Rastreabilidade:** RF-008, RF-010, RF-011, RF-012, RF-016, RF-024; UC-008, UC-010, UC-011, UC-012, UC-016, UC-024; RNF-011; TASK-012, TASK-016, TASK-019, TASK-023, TASK-027, TASK-034.


## Casos temporais obrigatórios

- Pix/boleto: prazo novo integral da criação; mudança de cobrança conserva vencimento original.
- Cartão recusado: nenhum pedido; nova tentativa não amplia checkout. Aprovação após prazo: estorno mesmo com saldo disponível.
- Troca oferecida no dia 29: 48h completas; conversão suspensa enquanto oferta ativa. Após aceite, não liberar por timer antigo; falta de postagem/reprovação libera.
- Postagem: sete dias da aprovação; somente ADMIN prorroga com motivo e novo vencimento.
- Relatórios: venda paga em setembro e estornada em outubro; evento negativo em outubro, ticket da coorte de setembro atualizado. Produto gratuito mantido integra denominador e quantidade.
- Avaliação: duas unidades da mesma edição/pedido, devolve uma e mantém review; devolve todas, oculta e impede nova. Nova compra em outro pedido pode ter review próprio.

## Evidência

Registrar comando/procedimento, ambiente, dados, resultado e localização da evidência. Não confundir teste documental com execução de aplicativo. Build/lint/testes aplicáveis obrigatórios antes de DONE; N/A exige motivo e não encobre falha. Resultados desta revisão estão em VALIDACAO.md e se limitam a documentos.
