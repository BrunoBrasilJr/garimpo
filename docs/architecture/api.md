# Contratos iniciais da API

Planejamento, sem endpoints implementados. Base `/api/v1`, exceto LOCAL. Os IDs existentes são preservados; operações sem fundamento na fonte final são DEPRECATED e não devem ser implementadas.

## Convenções

Dinheiro em centavos; datas com fuso; relógio do servidor controla prazos. Mutação crítica exige chave idempotente e revisão quando indicada: repetição do mesmo payload retorna efeito anterior; payload diferente com mesma chave é conflito. Totais são calculados no servidor.

Erros comuns: 401 sessão ausente/revogada; 403 papel, bloqueio ou propriedade; 404 recurso ausente/oculto por propriedade; 409 estado/saldo/versão; 422 entrada inválida; 429 limite técnico; 500 erro sem segredo. Envelope: code, message, fieldErrors e correlationId. Consulta paginada não expõe dados de outro cliente.

Prefixo `/admin` é administrativo, não sinônimo de papel ADMIN: catálogo/estoque/logística/moderação/atendimento permitem OPERATOR; configuração de frete, promoções/cupons, relatórios e contas internas exigem ADMIN. Consulta de clientes permite equipe; edição/bloqueio somente ADMIN. Estorno de pós-venda e exceções somente ADMIN. Cliente em `/me` acessa somente próprios recursos. Contas internas não usam checkout. Bloqueado/encerrado não usa sessão antiga. Rotas de autenticação e confirmação validam propósito de token.

`/demo` é proposta de adaptador de mensagens local protegido, não papel comercial. Canal de teste e acesso técnico serão ratificados no ADR-005. Eventos LOCAL do simulador não são endpoints financeiros públicos. API-012.01/02 são comandos de cenário de teste, nunca integração real. Criação por cartão também exige e-mail confirmado e os mesmos controles de conta/endereço do pedido Pix/boleto. Visitante consulta catálogo/frete e mantém carrinho sem reserva; armazenamento e mescla do carrinho visitante são descritos na arquitetura.

Operações de recibo/inspeção não autorizam estorno implicitamente. Estorno tardio pode existir sem pedido. Evidência privada exige autorização em cada download. Verificações comuns somam-se às respostas por linha.

## RF-001 Cadastrar conta

**Atores:** Visitante. **Pré-condição:** E-mail ainda não cadastrado.

**Validações:** Cadastro válido cria USER; e-mail duplicado falha; payload não promove papel; confirmação de e-mail é emitida.

**Rastreabilidade:** UC-001; RN-001, RN-002, RN-029, RN-032; TEST-001; TASK-004, TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-001.01 | POST | /auth/register | name, email, password | id, name, email, role=USER | 201; 409 e-mail existente |

## RF-002 Autenticar e encerrar sessão

**Atores:** Cliente e equipe. **Pré-condição:** Conta ativa não bloqueada/encerrada.

**Validações:** Credenciais válidas autenticam no contexto correto; bloqueio/encerramento impedem login; logout revoga sessão; conta interna não compra.

**Rastreabilidade:** UC-002; RN-001, RN-028, RN-029, RN-032; TEST-002; TASK-004, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-002.01 | POST | /auth/login | email, password | credenciais de sessão, usuário, bloqueio | 200; 401 credenciais inválidas |
| API-002.02 | POST | /auth/refresh | credencial de renovação | nova credencial | 200; 401 revogada/expirada |
| API-002.03 | POST | /auth/logout | credencial de renovação | sem corpo | 204 |

## RF-003 Recuperar senha

**Atores:** Titular. **Pré-condição:** Endereço de conta informado.

**Validações:** Reset válido em até 30 minutos altera senha uma vez e revoga todas as sessões; expirado/reutilizado falha.

**Rastreabilidade:** UC-003; RN-003, RN-032, RN-033; TEST-003; TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-003.01 | POST | /auth/password-reset | email | confirmação genérica | 202 |
| API-003.02 | POST | /auth/password-reset/confirm | token, newPassword | confirmação sem token | 200; 422 token inválido/expirado |

## RF-004 Gerenciar perfil e endereços

**Atores:** Cliente; ADMIN nas correções autorizadas. **Pré-condição:** Conta própria ativa ou permissão ADMIN.

**Validações:** Somente titular edita normalmente; OPERATOR consulta sem editar; endereço histórico não muda; novo e-mail depende de confirmação.

**Rastreabilidade:** UC-004; RN-002, RN-032, RN-044; TEST-004; TASK-004, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-004.01 | GET | /me | sessão | perfil sem hash | 200 |
| API-004.02 | PATCH | /me | name e campos de perfil; e-mail via RF-028 | perfil atualizado sem alterar e-mail diretamente | 200; 422 dados |
| API-004.03 | GET | /me/addresses | sessão | endereços próprios | 200 |
| API-004.04 | POST | /me/addresses | destinatário, CEP, UF, cidade, bairro, rua, número, complemento opcional | endereço com id | 201 |
| API-004.05 | PATCH | /me/addresses/{id} | campos de endereço | endereço atualizado | 200 |
| API-004.06 | DELETE | /me/addresses/{id} | id próprio | sem corpo; snapshots mantidos | 204 |

## RF-005 Explorar pesquisar e filtrar

**Atores:** Visitante e cliente. **Pré-condição:** Catálogo publicado.

**Validações:** Busca cobre título, artistas de edição/faixa e faixas; década usa ano da edição; filtros se combinam; desconhecidos não viram anos inventados.

**Rastreabilidade:** UC-005; RN-004, RN-032, RN-036; TEST-005; TASK-008, TASK-010, TASK-011, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-005.01 | GET | /editions | q, artist, genre, decade, minPrice, maxPrice, discCondition, sleeveCondition, available, page, pageSize | edições, disponibilidade, paginação | 200 |
| API-005.02 | GET | /catalog/filters | nenhum | artistas, gêneros e opções de filtro | 200 |

## RF-006 Consultar edição e ofertas

**Atores:** Visitante e cliente. **Pré-condição:** Edição acessível.

**Validações:** Página agrupa novos/usados; usados exibem preço, fotos, Goldmine e descrição; prévia pertence à faixa e é opcional.

**Rastreabilidade:** UC-006; RN-004, RN-005, RN-026, RN-032, RN-036, RN-045; TEST-006; TASK-008, TASK-010, TASK-011, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-006.01 | GET | /editions/{id} | id | metadados, faixas, ofertas, fotos, prévia opcional | 200; 404 indisponível para consulta |

## RF-007 Manter lista de desejos

**Atores:** Cliente. **Pré-condição:** Autenticação.

**Validações:** Adiciona/remove edição uma vez; não reserva nem ativa alerta implicitamente.

**Rastreabilidade:** UC-007; RN-032, RN-037; TEST-007; TASK-012, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-007.01 | GET | /me/wishlist | sessão | edições desejadas | 200 |
| API-007.02 | PUT | /me/wishlist/{editionId} | edição | entrada idempotente | 200 |
| API-007.03 | DELETE | /me/wishlist/{editionId} | edição | sem corpo | 204 |

## RF-008 Receber alertas de reposição

**Atores:** Cliente; processo de mensagens. **Pré-condição:** Inscrição ativa por edição e NEW/USED/ANY.

**Validações:** Retorno de disponibilidade notifica todos compatíveis sem reservar; sucesso encerra; falha mantém inscrição; duplicação não envia duas vezes a mesma ativação.

**Rastreabilidade:** UC-008; RN-024, RN-032, RN-037; TEST-008; TASK-012, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-008.01 | GET | /me/availability-alerts | sessão | alertas e estado | 200 |
| API-008.02 | POST | /me/availability-alerts | editionId, kind NEW/USED/ANY | inscrição ativa | 201; 409 equivalente ativa |
| API-008.03 | DELETE | /me/availability-alerts/{id} | id próprio | sem corpo, inscrição encerrada | 204 |

## RF-009 Avaliar compra verificada

**Atores:** Cliente. **Pré-condição:** Pedido entregue com unidade mantida da edição.

**Validações:** Uma avaliação por cliente/edição/pedido; troca não cria outra; devolução integral da edição oculta e impede nova; edição de ocultada aguarda moderação.

**Rastreabilidade:** UC-009; RN-025, RN-032; TEST-009; TASK-013, TASK-023, TASK-026, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-009.01 | GET | /editions/{id}/reviews | paginação | avaliações visíveis verificadas | 200 |
| API-009.02 | POST | /editions/{id}/reviews | orderId, nota, comentário | avaliação por edição/pedido | 201; 403 inelegível; 409 duplicada |
| API-009.03 | PATCH | /me/reviews/{id} | nota, comentário | avaliação atualizada | 200 |
| API-009.04 | DEPRECATED | /me/reviews/{id} (DELETE antigo) | N/A | Exclusão pelo autor não especificada no PDF; não implementar sem decisão | N/A |

## RF-010 Manter carrinho e iniciar reserva

**Atores:** Visitante no carrinho; cliente no checkout. **Pré-condição:** Catálogo disponível; checkout exige conta apta e menos de 3 pendentes.

**Validações:** Carrinho não reserva; mescla avisada ao login; checkout único de 15 minutos reserva todos ou nenhum; outra aba retoma mesmo prazo.

**Rastreabilidade:** UC-010; RN-004, RN-006, RN-007, RN-008, RN-009, RN-010, RN-028, RN-032, RN-035; TEST-010; TASK-016, TASK-017, TASK-018, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-010.01 | GET | /me/cart | sessão | itens, preços atuais e revisão; sem reserva por item | 200 |
| API-010.02 | POST | /me/cart/items | offerId, quantity, revisão | carrinho atualizado sem reservar | 201; 409 revisão |
| API-010.03 | PATCH | /me/cart/items/{id} | quantity, revisão | carrinho; checkout anterior encerrado se houver alteração | 200; 409 revisão |
| API-010.04 | DELETE | /me/cart/items/{id} | id próprio, revisão | carrinho; encerra checkout afetado | 200 |
| API-010.05 | DELETE | /me/cart/items | sessão | carrinho vazio | 200 |
| API-010.06 | POST | /me/cart/merge | itens do visitante, revisão | carrinho mesclado e avisos de ajuste | 200; 409 estado/versão; 422 dados |
| API-010.07 | POST | /checkouts | revisão confirmada, cupom opcional | checkout único, snapshots, expiresAt, serverTime | 201; 409 saldo/limite de 3/valores |
| API-010.08 | GET | /me/checkout | sessão | checkout ativo e tempo restante | 200; 404 sem ativo |
| API-010.09 | DELETE | /checkouts/{id} | id próprio | checkout encerrado e reservas liberadas | 204 |

## RF-011 Cotar e criar pedido

**Atores:** Visitante para frete; cliente para pedido. **Pré-condição:** Checkout válido, e-mail confirmado e endereço atendido para pedido.

**Validações:** Cotação por CEP inclui cobertura; congela produtos/descontos no checkout; cria pedido Pix/boleto com novo prazo próprio; snapshots e cupom não se perdem.

**Rastreabilidade:** UC-011; RN-002, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-013, RN-014, RN-016, RN-017, RN-018, RN-032, RN-033; TEST-011; TASK-018, TASK-020, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-011.01 | POST | /checkout/quote | itens ou checkoutId, CEP/endereço, cupom | preços, frete/cobertura, prazos e revisão; visitante permitido | 200; 422 CEP/cupom; 409 revisão |
| API-011.02 | POST | /orders | checkoutId, método PIX/BOLETO, endereço e frete aceitos, chave | pedido pendente; Pix 30min/boleto 2 dias; cobrança ativa | 201; 403 e-mail não confirmado; 409 prazo/saldo |
| API-011.03 | PATCH | /checkouts/{id}/address | endereço próprio e revisão de frete aceita | frete recalculado; prazo original preservado | 200; 422 não atendido |

## RF-012 Simular pagamentos

**Atores:** Cliente e simulador. **Pré-condição:** Checkout para cartão; cobrança ativa para Pix/boleto.

**Validações:** Recusa de cartão não cria pedido; Pix 30 min/boleto 2 dias; tardio estorna sem reativar; cobrança substituída nunca quita; falha de estorno permanece visível.

**Rastreabilidade:** UC-012; RN-010, RN-011, RN-012, RN-013, RN-017, RN-028, RN-032, RN-033, RN-039, RN-041; TEST-012; TASK-019, TASK-020, TASK-023, TASK-025, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-012.01 | POST | /orders/{id}/simulated-payments | chargeId ativo, resultado simulado, chave | tentativa, pedido e eventual estorno | 200; 409 estado; 403 sem permissão |
| API-012.02 | POST | /checkouts/{id}/simulated-card-payments | cenário simulado, chave | recusa sem pedido ou pedido pago; tardio gera estorno | 200; 409 estado/versão; 422 dados |
| API-012.03 | LOCAL | simulator payment-event | chargeId ou attemptId, eventId, resultado | efeito idempotente; estorno se tardio/invalidado | sucesso/falha auditados |

## RF-013 Acompanhar pedidos

**Atores:** Cliente. **Pré-condição:** Conta ativa e pedido próprio.

**Validações:** Exibe em separação, separado, envio, entrega, cobranças/estornos e rastreio manual; datas reais registradas, não estimadas.

**Rastreabilidade:** UC-013; RN-015, RN-032, RN-033; TEST-013; TASK-021, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-013.01 | GET | /me/orders | paginação, filtros de estado | pedidos próprios | 200 |
| API-013.02 | GET | /me/orders/{id} | id próprio | snapshots, tentativas, etapas e solicitações | 200 |

## RF-014 Cancelar pedidos e unidades indisponíveis

**Atores:** Cliente; equipe para indisponibilidade. **Pré-condição:** Pedido pendente/pago antes de em separação para cancelamento direto.

**Validações:** Cancelamento permitido libera estoque/cupom uma vez; pago estorna; indisponibilidade parcial preserva restantes e vencimento; parcial não recupera cupom/frete.

**Rastreabilidade:** UC-014; RN-011, RN-017, RN-019, RN-032, RN-039, RN-041; TEST-014; TASK-019, TASK-022, TASK-025, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-014.01 | POST | /orders/{id}/cancellations | motivo, chave | cancelamento direto somente PENDING/PAID antes de PREPARING | 201; 409 utilizar devolução |
| API-014.02 | DEPRECATED | /admin/cancellations/{id}/decision | N/A | Pedido em separação usa RF-015; não implementar antiga aprovação de cancelamento | N/A |
| API-014.03 | POST | /admin/orders/{id}/unavailable-units | unidades, motivo, revisão | cancelamento parcial/integral; cobrança substituída ou estorno | 200; 409 estado/versão; 422 dados |
| API-014.04 | POST | /admin/refunds/{id}/retry | motivo, chave | nova tentativa; ADMIN, inclusive pós-venda | 200; 409 estado/versão; 422 dados |

## RF-015 Processar devoluções

**Atores:** Cliente; ADMIN/OPERATOR. **Pré-condição:** Unidades elegíveis na janela ou devolução antes de envio.

**Validações:** Parcial estorna líquido; integral inclui frete; postagem em 7 dias; exceção só ADMIN; estorno pós-venda só ADMIN; evidências privadas; rejeitado não volta ao estoque.

**Rastreabilidade:** UC-015; RN-018, RN-019, RN-020, RN-021, RN-028, RN-032, RN-034, RN-040, RN-041, RN-045; TEST-015; TASK-026, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-015.01 | POST | /orders/{id}/returns | itens com orderItemId e quantity, motivo, Idempotency-Key | solicitação aberta | 201; 409 quantidade; 422 janela |
| API-015.02 | GET | /me/returns/{id} | id próprio | solicitação e estornos | 200 |
| API-015.03 | POST | /admin/returns/{id}/decision | APPROVE/REJECT, motivo | decisão | 200 |
| API-015.04 | POST | /admin/returns/{id}/receipt | unidades recebidas, resultado da inspeção, evidências | inspeção e aptidão; estorno aguarda autorização ADMIN | 200; 409 estado/quantidade |
| API-015.05 | POST | /returns/{id}/posting | rastreio, data; cliente ou equipe com interação externa | postagem registrada no prazo | 200; 409 estado/versão; 422 dados |
| API-015.06 | POST | /admin/returns/{id}/refund-authorization | unidades, motivo, chave; ADMIN | estorno autorizado e tentativa registrada | 200; 409 estado/versão; 422 dados |
| API-015.07 | POST | /admin/aftersales/{id}/posting-extension | novo prazo e justificativa; ADMIN | exceção auditada | 200; 409 estado/versão; 422 dados |
| API-015.08 | POST | /admin/aftersales/{id}/rejected-shipment | rastreio e data | reenvio de rejeitado sem reposição | 200; 409 estado/versão; 422 dados |
| API-015.09 | POST | /admin/aftersales/{id}/rejected-delivery | data de entrega | reenvio concluído | 200; 409 estado/versão; 422 dados |
| API-015.10 | POST | /aftersales/{id}/evidence | imagem, origem cliente/equipe | evidência privada; limites 5+5 | 201; 413 tamanho; 415 tipo; 403 acesso |
| API-015.11 | GET | /aftersales/{id}/evidence/{imageId} | sessão de proprietário/equipe | bytes ou URL temporária privada | 200; 403 acesso |
| API-015.12 | POST | /admin/aftersales/{id}/inspection-exception | justificativa e decisão; ADMIN | exceção auditada | 200; 409 estado/versão; 422 dados |

## RF-016 Processar trocas

**Atores:** Cliente; ADMIN/OPERATOR. **Pré-condição:** Unidades elegíveis e mesma edição para substituto.

**Validações:** Espera 30 dias após conferência, oferta 48h completas; aceite necessário; envio após inspeção; falha/expiração libera reserva; conversão não autoriza estorno; substituto inicia nova janela.

**Rastreabilidade:** UC-016; RN-020, RN-022, RN-023, RN-028, RN-032, RN-034, RN-035, RN-040, RN-041, RN-045; TEST-016; TASK-027, TASK-028, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-016.01 | POST | /orders/{id}/exchanges | itens/quantidades, motivo, Idempotency-Key | solicitação | 201; 422 janela |
| API-016.02 | GET | /me/exchanges/{id} | id próprio | estado e substitutos | 200 |
| API-016.03 | POST | /admin/exchanges/{id}/decision | APPROVE/REJECT, motivo | decisão; substituto ofertado por operação própria | 200 |
| API-016.04 | POST | /admin/exchanges/{id}/receipt | recebidos, conferência, motivo | estado após inspeção | 200 |
| API-016.05 | POST | /admin/exchanges/{id}/shipment | dados demonstrativos de envio | envio registrado | 200; 409 não conferido |
| API-016.06 | POST | /admin/exchanges/{id}/delivery | confirmação de entrega | troca concluída | 200 |
| API-016.07 | POST | /admin/exchanges/{id}/cancel | motivo, Idempotency-Key | cancelamento e liberação do substituto | 200 |
| API-016.08 | POST | /admin/exchanges/{id}/substitute-offers | offerId da mesma edição, justificativa equivalência | oferta e reserva com 48h completas | 200; 409 estado/versão; 422 dados |
| API-016.09 | POST | /exchanges/{id}/substitute-offers/{offerId}/response | ACCEPT/REJECT; dono ou equipe via interação externa | aceite mantém reserva; recusa libera | 200; 409 estado/versão; 422 dados |
| API-016.10 | POST | /exchanges/{id}/convert-to-return | motivo; dono/equipe | devolução vinculada; estorno ainda depende de ADMIN | 200; 409 estado/versão; 422 dados |
| API-016.11 | POST | /exchanges/{id}/posting | rastreio e data; dono/equipe | postagem registrada | 200; 409 estado/versão; 422 dados |
| API-016.12 | LOCAL | exchange reconcile | relógio servidor e solicitações | expira oferta/postagem e converte espera, respeitando oferta além do dia 30 | sucesso/falha auditados |

## RF-017 Administrar catálogo e imagens

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Conta interna ativa.

**Validações:** Publicação valida campos/fotos mínimos; suporta artistas por faixa e anos distintos; histórico impede exclusão; inativação preserva reservas existentes; limites de imagem aplicados.

**Rastreabilidade:** UC-017; RN-001, RN-004, RN-005, RN-026, RN-027, RN-032, RN-036, RN-045; TEST-017; TASK-008, TASK-009, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-017.01 | GET | /admin/editions | filtros/paginação inclusive inativos | catálogo administrativo | 200 |
| API-017.02 | POST | /admin/editions | título, artistas, gêneros/principal, formato, anos separados, faixas/artistas/áudio | edição; publicação exige imagem e campos mínimos | 201; 422 mínimos |
| API-017.03 | PATCH | /admin/editions/{id} | metadados permitidos | edição atualizada | 200 |
| API-017.04 | POST | /admin/editions/{id}/offers | NEW/USED, priceCents, condição, estoque inicial | oferta/exemplar | 201 |
| API-017.05 | PATCH | /admin/offers/{id} | preço, classificação, metadados próprios | oferta atualizada | 200; 409 revisão |
| API-017.06 | POST | /admin/offers/{id}/images | arquivo imagem, descrição, ordem | imagem registrada | 201; 413 tamanho; 415 tipo |
| API-017.07 | DELETE | /admin/images/{id} | id | sem corpo | 204 |
| API-017.08 | POST | /admin/offers/{id}/inactivate | motivo | oferta impede novas compras e preserva reservas existentes | 200 |
| API-017.09 | DELETE | /admin/offers/{id} | id | sem corpo | 204; 409 histórico/reserva |
| API-017.10 | POST | /admin/editions/{id}/inactivate | motivo | edição inativa preservando reservas/pedidos | 200 |
| API-017.11 | DELETE | /admin/editions/{id} | id | sem corpo | 204; 409 dependências históricas |
| API-017.12 | GET | /admin/catalog-metadata | tipo artist/genre/label | metadados | 200 |
| API-017.13 | POST | /admin/catalog-metadata | tipo, nome e dados | metadado | 201 |
| API-017.14 | PATCH | /admin/catalog-metadata/{type}/{id} | nome e dados permitidos | metadado | 200 |
| API-017.15 | DELETE | /admin/catalog-metadata/{type}/{id} | tipo, id sem vínculos | sem corpo | 204; 409 vinculado |
| API-017.16 | POST | /admin/editions/{id}/images | imagem, descrição, ordem | imagem da edição; até 10 | 201; 413 tamanho; 415 tipo |

## RF-018 Controlar estoque

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Oferta cadastrada.

**Validações:** Saldo nunca negativo; usado individual; ajuste não invade reservas; avaria resolve vínculo; limiar de novos por edição e zero usados alertam apenas no painel.

**Rastreabilidade:** UC-018; RN-001, RN-004, RN-006, RN-013, RN-019, RN-021, RN-022, RN-024, RN-027, RN-032, RN-035, RN-038, RN-039; TEST-018; TASK-009, TASK-016, TASK-019, TASK-023, TASK-025, TASK-026, TASK-027, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-018.01 | GET | /admin/stock | filtros/lowStock | físico, reservado, disponível, movimentos | 200 |
| API-018.02 | POST | /admin/offers/{id}/stock-adjustments | delta inteiro, motivo, Idempotency-Key | saldo e movimento | 201; 409 invade reserva; 422 quantidade |
| API-018.03 | PATCH | /admin/editions/{id}/low-stock | limiar de novos inteiro não negativo | limiar por edição; usado alerta em zero | 200; 409 estado/versão; 422 dados |

## RF-019 Administrar promoções e cupons

**Atores:** ADMIN. **Pré-condição:** Configuração válida.

**Validações:** Menor promoção vence; cupom pode acumular se autorizado; restrições por produto/edição/gênero; reserva no checkout respeita limites concorrentes; devolução não restitui uso.

**Rastreabilidade:** UC-019; RN-008, RN-016, RN-017, RN-018, RN-032; TEST-019; TASK-014, TASK-016, TASK-018, TASK-019, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-019.01 | GET | /admin/coupons | paginação | cupons e usos | 200 |
| API-019.02 | POST | /admin/coupons | code, type, amount, validity, minimumEligible, limits, allowPromotional, targets | cupom e elegibilidade | 201 |
| API-019.03 | PATCH | /admin/coupons/{id} | campos permitidos, active | cupom atualizado | 200 |
| API-019.04 | GET | /admin/promotions | filtros | promoções | 200 |
| API-019.05 | POST | /admin/promotions | ofertas, desconto, validade | promoção | 201 |
| API-019.06 | PATCH | /admin/promotions/{id} | campos permitidos, active | promoção atualizada | 200 |

## RF-020 Administrar logística e atendimentos

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Pedido pago ou atendimento autorizado.

**Validações:** Estado em separação bloqueia cancelamento direto; remessa original única; retorno/substituto têm rastreios próprios; interação externa de bloqueado fica auditada.

**Rastreabilidade:** UC-020; RN-001, RN-015, RN-019, RN-023, RN-032, RN-040; TEST-020; TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-020.01 | GET | /admin/orders | período/estado/cliente | pedidos com tentativas e estornos | 200 |
| API-020.02 | GET | /admin/orders/{id} | id | detalhes administrativos | 200 |
| API-020.03 | PATCH | /admin/orders/{id}/status | PREPARING/SEPARATED/SHIPPED/DELIVERED, revisão, rastreio quando aplicável | estado/evento e remessa original | 200; 409 transição |
| API-020.04 | POST | /admin/aftersales/external-interactions | cliente, e-mail cadastrado, decisão comunicada, data e vínculo | registro auditado e ação permitida em nome do cliente | 200; 409 estado/versão; 422 dados |

## RF-021 Consultar e administrar clientes

**Atores:** ADMIN; OPERATOR somente consulta. **Pré-condição:** Conta interna ativa.

**Validações:** OPERATOR não altera/bloqueia; ADMIN bloqueia login, checkout e pendentes atomicamente, preservando pagos e atendimento; correção de e-mail exige confirmação.

**Rastreabilidade:** UC-021; RN-001, RN-028, RN-032; TEST-021; TASK-022, TASK-023, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-021.01 | GET | /admin/customers | busca/paginação | cadastros limitados ao necessário | 200 |
| API-021.02 | GET | /admin/customers/{id} | id | cadastro e pedidos | 200 |
| API-021.03 | POST | /admin/customers/{id}/block | motivo, Idempotency-Key | bloqueio e pendências canceladas | 200 |
| API-021.04 | POST | /admin/customers/{id}/unblock | motivo | estado desbloqueado | 200 |
| API-021.05 | PATCH | /admin/customers/{id} | campos permitidos; ADMIN | perfil corrigido; novo e-mail gera confirmação | 200; 409 estado/versão; 422 dados |

## RF-022 Moderar avaliações

**Atores:** ADMIN/OPERATOR. **Pré-condição:** Avaliação existente.

**Validações:** Ocultar preserva histórico; edição pelo autor não desfaz moderação; liberação explícita revalida elegibilidade de compra.

**Rastreabilidade:** UC-022; RN-001, RN-025, RN-032; TEST-022; TASK-013, TASK-026, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-022.01 | GET | /admin/reviews | filtros/paginação | avaliações incluindo ocultas | 200 |
| API-022.02 | POST | /admin/reviews/{id}/hide | motivo | avaliação oculta | 200 |
| API-022.03 | POST | /admin/reviews/{id}/release | motivo, revisão | avaliação liberada se compra ainda elegível | 200; 409 estado/versão; 422 dados |

## RF-023 Consultar relatórios

**Atores:** ADMIN. **Pré-condição:** Eventos comerciais registrados.

**Validações:** Pagamento setembro/estorno outubro ficam em períodos próprios; ticket setembro usa líquido atualizado; gênero principal evita duplicação; unidades gratuitas mantidas contam; troca não é venda nova.

**Rastreabilidade:** UC-023; RN-018, RN-021, RN-030, RN-032, RN-034; TEST-023; TASK-029, TASK-033, TASK-034.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-023.01 | GET | /admin/reports/sales | from, to, asOf | eventos financeiros no período e ticket da coorte separados | 200; 422 intervalo |
| API-023.02 | GET | /admin/reports/genres | from, to, asOf | ranking de gênero principal sem duplicação | 200 |
| API-023.03 | GET | /admin/reports/products | from, to | ranking de edições por giro líquido | 200 |

## RF-024 Processar notificações de teste

**Atores:** Processo técnico; titular como destinatário. **Pré-condição:** Evento de acesso/comercial ou reposição.

**Validações:** Todos os eventos de RN-042 geram mensagens; falha não bloqueia negócio; repetição é auditada; conteúdo de acesso e evidências não é público.

**Rastreabilidade:** UC-024; RN-003, RN-024, RN-032, RN-033, RN-042; TEST-024; TASK-005, TASK-012, TASK-019, TASK-021, TASK-025, TASK-026, TASK-027, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-024.01 | GET | /demo/messages | credencial separada, destinatário/tipo | mensagens fictícias restritas | 200; 403 ambiente/acesso |
| API-024.02 | GET | /demo/messages/{id} | credencial separada | mensagem restrita | 200 |

## RF-025 Executar backup e restaurar

**Atores:** Operação técnica. **Pré-condição:** Ambiente e parâmetros definidos.

**Validações:** Backup diário automático; recuperação testada periodicamente; política de retenção/destino não inventada; restauração de teste preserva origem.

**Rastreabilidade:** UC-025; RN-031, RN-032; TEST-025; TASK-030, TASK-035.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-025.01 | LOCAL | backup daily | configuração aprovada | conjunto consistente, retenção configurada e resultado | sucesso/falha; sem rota pública |
| API-025.02 | LOCAL | restore verify | conjunto completo, destino separado | relatório de comparação de dados/fotos | sucesso/falha; sem rota pública |

## RF-026 Gerenciar contas internas

**Atores:** ADMIN. **Pré-condição:** Administrador ativo.

**Validações:** Criar/editar/bloquear ADMIN/OPERATOR; impedir remoção do último ADMIN ativo; contas internas não compram; e-mail alterado só após confirmar novo.

**Rastreabilidade:** UC-026; RN-001, RN-029, RN-032, RN-044; TEST-032; TASK-004, TASK-005, TASK-006, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-026.01 | GET | /admin/staff | filtros | contas internas | 200; 409 estado/versão; 422 dados |
| API-026.02 | POST | /admin/staff | nome, e-mail, papel ADMIN/OPERATOR, convite/credencial conforme ADR | conta interna | 200; 409 estado/versão; 422 dados |
| API-026.03 | PATCH | /admin/staff/{id} | campos e papel permitidos | conta atualizada | 200; 409 estado/versão; 422 dados |
| API-026.04 | POST | /admin/staff/{id}/block | motivo | bloqueio exceto último ADMIN | 200; 409 estado/versão; 422 dados |
| API-026.05 | POST | /admin/staff/{id}/deactivate | motivo | inativação exceto último ADMIN | 200; 409 estado/versão; 422 dados |
| API-026.06 | POST | /admin/staff/{id}/unblock | motivo | conta desbloqueada | 200; 409 estado/versão; 422 dados |

## RF-027 Encerrar e reativar conta

**Atores:** Cliente. **Pré-condição:** Conta própria; reativação somente encerrada sem bloqueio.

**Validações:** Encerrar revoga acesso, cancela checkout/pendentes e preserva pagos/histórico; reativação confirma e-mail; bloqueio prevalece; retenção permanece pendente.

**Rastreabilidade:** UC-027; RN-032, RN-043; TEST-033; TASK-022, TASK-023, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-027.01 | POST | /me/closure | confirmação e chave | conta encerrada, pendências liberadas | 200; 409 estado/versão; 422 dados |
| API-027.02 | POST | /auth/reactivation | e-mail | resposta genérica e link se elegível | 202 |
| API-027.03 | POST | /auth/reactivation/confirm | token | conta reativada se sem bloqueio | 200; 409 estado/versão; 422 dados |

## RF-028 Confirmar e alterar e-mail

**Atores:** Titular; ADMIN inicia correção. **Pré-condição:** Token apropriado ou conta autorizada.

**Validações:** Confirmação inicial em 24h com reenvio; primeiro pedido exige confirmação; alteração mantém endereço anterior até confirmar novo; unicidade validada.

**Rastreabilidade:** UC-028; RN-002, RN-032, RN-044; TEST-034; TASK-004, TASK-005, TASK-006, TASK-022, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-028.01 | POST | /auth/email-verification | e-mail | reenvio genérico; link inicial 24h | 202 |
| API-028.02 | POST | /auth/email-verification/confirm | token | e-mail confirmado | 200; 409 estado/versão; 422 dados |
| API-028.03 | POST | /me/email-change | novo e-mail | solicitação; antigo permanece ativo | 202 |
| API-028.04 | POST | /auth/email-change/confirm | token | novo endereço confirmado e substituído | 200; 409 estado/versão; 422 dados |

## RF-029 Configurar frete e cobertura

**Atores:** ADMIN. **Pré-condição:** Tabela de faixas sem sobreposição ambígua.

**Validações:** Somente ADMIN altera valores/prazos/cobertura; faixas podem ser não atendidas; edição da tabela não muda snapshot de pedido criado.

**Rastreabilidade:** UC-029; RN-014, RN-032; TEST-035; TASK-018, TASK-033.

| API | Método | Rota/operação | Entrada | Saída/finalidade | Respostas |
| --- | --- | --- | --- | --- | --- |
| API-029.01 | GET | /admin/freight-rates | filtros | faixas, cobertura, valores/prazos | 200; 409 estado/versão; 422 dados |
| API-029.02 | POST | /admin/freight-rates | faixa, atendida, preço/prazo | regra versionada sem sobreposição ambígua | 201; 422 faixa/valor |
| API-029.03 | PATCH | /admin/freight-rates/{id} | campos e revisão | regra atualizada sem alterar pedidos | 200; 409 estado/versão; 422 dados |
