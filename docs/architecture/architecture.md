# Arquitetura e fluxos transacionais

## Situação

Base normativa: [README](../../README.md) e PDF final transcrito em [fontes](../sources/elicitacao-final.md). As decisões de produto abaixo são confirmadas; tecnologias, divisão física de módulos e mecanismos transacionais são propostas a ratificar em TASK-001. Não há implementação. Mobile usa React Native/Expo e API REST comum; plataforma final e implantação seguem PD-002.

## Fronteiras propostas

Monólito modular com apresentação, aplicação, persistência e dados. Stack herdada React/Vite, Express/TypeScript, Prisma/PostgreSQL permanece PROPOSED (ADR-001), sem compatibilidade de versões verificada nesta revisão. Alternativa de serviços separados acrescenta operação e coordenação distribuída, sem requisito que a imponha.

Estrutura proposta: apps/api, apps/web, apps/mobile, packages/contracts, tests e scripts. Módulos: accounts, catalog, media, inventory, cart, checkout, pricing, orders, payments, engagement, reviews, aftersales, refunds, reports, messaging e operations. Contratos compartilhados não deslocam regras para o cliente. Core contém relógio, erros, transação, auditoria e idempotência, sem absorver negócios.

## Identidade e acesso

USER compra em conta de cliente. ADMIN/OPERATOR operam pela web em contexto interno; não compram com essa conta. Cadastro público nunca concede privilégio. Bootstrap inicial e credenciais são decisões técnicas; transações impedem desativar o último administrador ativo. OPERATOR gerencia catálogo, estoque, logística, moderação e atendimento, mas não configura frete/cupons, altera/bloqueia clientes, gere internos ou autoriza estornos/exceções.

Bloqueio e encerramento impedem login e uso de sessões anteriores; cancelam checkout e pedidos pendentes com liberação de saldo/cupom. Pedidos pagos e atendimento seguem pela equipe. Interações recebidas pelo e-mail cadastrado são registradas com ator, data e decisão. Reativação voluntária não remove bloqueio administrativo. Encerramento preserva histórico; retenção/anonimização ainda pendentes.

Confirmação inicial de e-mail vale 24h e é exigida antes do primeiro pedido; reset vale 30min, uso único, revoga todas as sessões. Alterar e-mail exige confirmar novo antes da troca; anterior permanece válido. Tokens de cada propósito são separados. Proteção do canal de teste, hash/sessão e transporte serão ratificados, sem exceção HTTP presumida.

## Carrinho e checkout

Carrinho de visitante pode ser local (proposta), sem reservar. Após login, mesclar com conta, somando novos até disponível, avisando ajuste e removendo/sinalizando usado indisponível; não duplicar usados. Se já houver checkout, recuperar mesmo recurso; alterações de itens devem encerrar a reserva e pedir nova validação, nunca modificar silenciosamente preço congelado.

Ao iniciar checkout: validar cliente apto, menos de 3 pendentes, todo saldo, preço/promoção/cupom e confirmação de totais. Criar um único checkout ativo por cliente, snapshots de preço/desconto e reservas do conjunto por 15 minutos. Uma falha de item aborta todas as reservas e mostra alterações para aceite; não comprar subconjunto silenciosamente. Reservar também utilização de cupom.

Mudar itens/quantidade/cupom encerra checkout e exige nova validação e novo prazo. Alterar endereço recalcula frete mantendo produtos/preço/prazo. CEP não atendido conserva reserva até vencimento, mas impede pedido. Expiração libera conjunto e cupom. Servidor revalida tempo em cada operação, mesmo se processamento periódico atrasar.

## Concorrência

ADR-003 propõe transações, bloqueios ou atualizações condicionais, com ordem estável: identidade, agregado comercial, ofertas ordenadas e cupom. Reler saldo/estado após coordenação; repetição limitada para conflitos. Isolamento e SQL dependem da tecnologia ratificada. Validar também último ADMIN, limite de 3 pedidos, um checkout e unidades de atendimento. Transações não incluem chamada externa de rede. Idempotência grava efeito e referência de resposta consistentemente.

## Pedido, cobrança e pagamento

Pix/boleto: criar pedido e transferir reservas sem liberar saldo; prazo integral da criação é 30 minutos/2 dias. Uso de cupom passa a definitivo na criação. Pedido mantém preços, conservação, endereço, gênero principal e rateio por unidade. Pagamento válido consome reservas e baixa estoque atomicamente; expiração cancela pendente e libera estoque/cupom.

Cartão: tentativa pode existir antes de pedido. Recusa não cria pedido nem renova checkout; permite nova tentativa/outro método no prazo original. Aprovação válida cria pedido pago e baixa saldo. Aprovação tardia não cria nem reativa pedido: estorno automático, incluindo tentativa sem orderId.

Cancelamento parcial por indisponibilidade antes do pagamento invalida cobrança e gera outra com valor restante, mesmo vencimento. Sem tempo hábil, cancela. Pagamento da cobrança invalidada é integralmente estornado, sem quitar a nova. Simulador local reproduz aprovação, recusa, pendência, vencimento, tardio e falha de estorno; adaptador substituível.

## Logística e pós-venda

PENDING → PAID → PREPARING → SEPARATED → SHIPPED → DELIVERED. Cliente cancela PENDING/PAID antes de PREPARING. A partir de PREPARING solicita devolução: equipe pode interromper envio antes da postagem e dispensar retorno; se já postado, tratar após entrega. ADMIN/OPERATOR registram eventos; uma remessa original por pedido.

Indisponibilidade pode cancelar unidades; restantes seguem. Parcial mantém frete e uso de cupom; cancelamento de todas devolve frete e libera cupom. Cancelamento pago permitido/impossibilidade gera estorno automático; devolução exige autorização ADMIN. Falha financeira mantém cancelamento/devolução e estado PENDING/FAILED para nova tentativa, sem sucesso fictício. Estorno por cobrança tardia é distinto de estorno da venda e não pode distorcer unidades comerciais.

Atendimento por unidades até 7 dias após entrega (inclusive nova entrega de substituto); uma solicitação ativa por unidade comercial. Postagem em 7 dias da aprovação; exceção ADMIN com novo prazo/motivo auditados. Recebimento/conferência pode reprovar: guardar evidência privada, não repor estoque, reenviar ao cliente por conta da loja e registrar rastreio/entrega. Apenas inspeção apta repõe.

Troca: mesma edição, equivalência decidida pela equipe, sem diferença financeira. Busca antecipada permitida; espera de 30 dias começa após conferência favorável. Oferta tem reserva de 48h completas; oferta iniciada antes do dia 30 pode ultrapassá-lo e suspende conversão. Aceite mantém reserva até inspeção/envio; recusa/expiração libera. Sem substituto pode aguardar ou converter; encerrado prazo sem oferta ativa/aceite, converter automaticamente, mas estorno continua exigindo ADMIN e inspeção quando necessária. Falta de postagem/reprovação libera substituto. Remessas de retorno, substituto e reenvio de rejeitado são separadas do envio original.

## Catálogo, preços e avaliações

Ano original e ano de edição separados; década usa edição. Artistas por edição e faixa; prévia por faixa. Um gênero principal para rankings, demais para busca. Novos agrupam quantidade; usados têm identidade/fotos/condições. Campos mínimos e limites de imagens seguem RN-036/RN-045. Inativação comercial preserva reservas; exclusão com histórico é proibida.

Promoções sobrepostas: menor preço, sem somar promoções. Cupom único pode acumular com promoção se configurado; alvo por produto/edição/gênero, mínimo e desconto somente elegíveis após promoção. Fixo limitado ao subtotal, frete separado. Checkout reserva uso, pedido o consome, cancelamento libera; devolução não libera. Rateio proporcional em centavos; maiores restos/desempate estável são proposta técnica ADR-004.

Avaliação única por cliente/edição/pedido entregue com unidade mantida. Publicação imediata, mas edição de moderada mantém oculta até liberação da equipe. Devolução de todas as unidades da edição oculta e bloqueia novo review dessa compra; troca não gera outro. Preservar versões e motivo de ocultação.

## Relatórios

Separar consultas: fluxo financeiro por instante do evento (venda no pagamento, estorno no estorno) e ticket médio da coorte de pedidos pagos no período, atualizado pelos ajustes conhecidos. Ticket exclui frete e pedidos sem unidades mantidas; unidade gratuita mantida participa. Ranking de gêneros usa principal; giro é quantidade líquida por edição, não razão de estoque médio. Troca não cria venda. Registrar asOf para leitura reproduzível. Limites exatos de filtro de datas e fusos serão documentados tecnicamente antes do teste.

## Notificações e recuperação

Outbox persistente proposta: evento gravado com negócio, consumidor independente com deduplicação e tentativas. Notificar todos os eventos de RN-042. Falha não bloqueia compra/atendimento. Alerta NEW/USED/ANY encerra só após entrega bem-sucedida; registro local pode ser adaptador de teste, serviço de teste também é permitido. Não tratar falha como entrega. Conteúdo de acesso protegido e fora de logs gerais.

## Arquivos e backup

Catálogo público; evidência privada por proprietário/equipe. JPEG/PNG/WebP, 5 MB, 10/edição, 8/usado, 5 do cliente e 5 da equipe por atendimento. Proposta: chaves internas, validação de bytes, temporários e limpeza segura de órfãos. Não excluir arquivo referenciado por histórico/backup retido sem política.

Backup automático diário; estratégia concreta, retenção, destino e frequência dos testes ainda pendentes. Propor conjunto consistente banco/arquivos com manifesto; não presumir que cópia concorrente de diretórios seja consistente. Restauração em banco/diretório isolados e comparação de referências/bytes. Não declarar SLA ou sete cópias como aprovado.

## Erros e observabilidade

Middleware central com code, message, fieldErrors e correlationId, sem stack/segredos públicos. Logs de auditoria preservam ator/alvo/resultado; tentativas de mensagens e estornos têm estados visíveis adequados. Metas de desempenho, infraestrutura e plataformas serão fixadas antes dos respectivos gates; testes ainda não executados.
