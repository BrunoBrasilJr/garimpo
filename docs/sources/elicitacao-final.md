# Elicitação final — transcrição para consulta

Fonte: [Garimpo-Perguntas-e-Respostas-Elicitacao.pdf](Garimpo-Perguntas-e-Respostas-Elicitacao.pdf), 42 páginas, 14 rodadas, 98 respostas. Confirmada como versão final pelo responsável nesta conversa. Quebras de linha extraídas do PDF; consultar o original para diagramação. SHA-256: `f2f9b61fd3f5b758b226784008d00286ed54914d2c86a677e5868ba38db45fd5`.

## R01-P1

**Pergunta:** Escopo da primeira versão: todas as funcionalidades descritas deverão estar na primeira
entrega, incluindo o aplicativo mobile, ou haverá uma versão inicial reduzida? Se houver
redução, quais funcionalidades ficam para depois?

**Resposta:** Escopo da primeira versão: todas as funcionalidades descritas farão parte da entrega final,
incluindo web e aplicativo mobile. Porém, o desenvolvimento será incremental: primeiro serão
implementados autenticação, catálogo, estoque, carrinho e pedidos; depois pagamentos, frete,
avaliações, trocas/devoluções, notificações e relatórios. O mobile consumirá a mesma API
REST da versão web.

## R01-P2

**Pergunta:** Operação e responsabilidades: o Garimpo venderá apenas estoque próprio de uma única loja ou
também aceitará discos de terceiros? Nesse funcionamento, quais responsabilidades serão do
administrador e quais poderão ser realizadas pelo operador?

**Resposta:** Operação e responsabilidades: o Garimpo trabalhará apenas com estoque próprio de uma única
loja, sem marketplace ou venda de discos de terceiros. O administrador terá acesso completo,
incluindo usuários internos, produtos, estoque, promoções, cupons, pedidos, pagamentos,
estornos, clientes, avaliações e relatórios. O operador ficará responsável pelas atividades
operacionais do dia a dia, como produtos e estoque, processamento de pedidos, rastreamento e
atendimento de trocas/devoluções, sem acesso ao gerenciamento de usuários administrativos
e configurações sensíveis.

## R01-P3

**Pergunta:** Organização do catálogo: quando existirem dois exemplares usados da mesma edição, com
conservação, fotos e preços diferentes, eles aparecerão como anúncios separados ou como
opções dentro de uma página da edição? Essa decisão também afeta o significado de um item
“voltar ao estoque”.

**Resposta:** Organização do catálogo: exemplares usados da mesma edição serão apresentados dentro da
mesma página da edição, mas cada exemplar terá identificação própria, preço, conservação,
fotos e disponibilidade. Assim, o cliente escolhe especificamente qual exemplar deseja
comprar. Um item “voltar ao estoque” significa que um exemplar compatível com aquela
edição voltou a ficar disponível.

## R01-P4

**Pergunta:** Reserva de exemplares únicos: em qual momento um disco deve ficar indisponível para outros
compradores: ao entrar no carrinho, ao iniciar a finalização, ao gerar o pedido ou somente ao
confirmar o pagamento? Se houver reserva, por quanto tempo ela poderá durar?

**Resposta:** Reserva de exemplares únicos: adicionar um disco ao carrinho não fará reserva, para evitar
bloqueio de estoque por carrinhos abandonados. A reserva ocorrerá quando o usuário iniciar a
finalização da compra e terá duração de 15 minutos. Durante esse período, o exemplar ficará
indisponível para outros compradores. Se a compra não for concluída, a reserva expirará
automaticamente.

## R01-P5

**Pergunta:** Pedido e confirmação de pagamento: Pix e boleto podem ser confirmados depois da criação do
pedido. Nesse intervalo, o pedido poderá existir como “aguardando pagamento”, com estoque
reservado, e ser cancelado se o prazo expirar? Isso precisa ser esclarecido para interpretar a
exigência de transação única presente no trabalho.

**Resposta:** Pedido e confirmação de pagamento: o pedido poderá existir com status “aguardando
pagamento”. No cartão, a confirmação poderá ocorrer imediatamente na simulação. Para Pix e
boleto, o estoque continuará reservado após a criação do pedido até o pagamento ou
vencimento. Para fins acadêmicos, será adotado prazo de 30 minutos para Pix e 2 dias para
boleto. Se não houver confirmação, o pedido será cancelado e o estoque liberado. A transação
ACID garantirá atomicidade na criação do pedido e reserva/baixa correspondente do estoque; a
confirmação posterior de pagamentos assíncronos será tratada em uma nova transação.

## R01-P6

**Pergunta:** Serviços externos na entrega acadêmica: pagamento, cálculo de frete, rastreamento e envio
de e-mails deverão funcionar com serviços externos reais, ambientes de teste ou simulações?
Podem indicar uma opção diferente para cada serviço.

**Resposta:** Serviços externos na entrega acadêmica: serão utilizadas simulações ou ambientes de teste,
evitando dependência de serviços pagos ou operações financeiras reais. Pagamentos serão
simulados ou usarão sandbox; o frete será calculado por uma integração simulada baseada em
CEP; o rastreamento utilizará códigos e atualizações simuladas; e os e-mails poderão ser
enviados por um serviço de teste ou registrados localmente para demonstração. A
arquitetura continuará preparada para substituir essas implementações por serviços reais
posteriormente.

## R01-P7

**Pergunta:** Trocas e devoluções: o sistema deverá apenas receber a solicitação para tratamento manual
pela equipe ou acompanhar todo o processo, incluindo aprovação, retorno do disco, estorno e
eventual disponibilização para venda novamente?

**Resposta:** Trocas e devoluções: o sistema acompanhará todo o fluxo, e não apenas a abertura da
solicitação. O cliente solicitará troca ou devolução vinculada ao pedido; a equipe poderá analisar
e aprovar ou rejeitar; após aprovação, será registrado o retorno e a conferência do disco; em
devoluções, haverá registro do estorno; em trocas, será registrado o envio do substituto.
Quando aplicável, o exemplar devolvido poderá retornar ao estoque somente após conferência
do seu estado de conservação.

## R02-P1

**Pergunta:** Compra e identificação: visitantes poderão navegar, usar o carrinho e consultar frete sem
login, exigindo autenticação apenas ao iniciar a finalização, ou será permitido concluir uma
compra sem conta?

**Resposta:** Compra e identificação: visitantes poderão navegar pelo catálogo, pesquisar, aplicar filtros,
visualizar produtos, adicionar itens ao carrinho e consultar o frete sem login. A autenticação
será obrigatória ao iniciar a finalização da compra. Não haverá compra como convidado, pois os
pedidos precisam ficar vinculados ao histórico do cliente.

## R02-P2

**Pergunta:** Discos novos e edições de colecionador: discos novos idênticos terão estoque por quantidade,
enquanto usados terão controle individual? “Edição de colecionador” será uma característica
da edição, que poderá ter exemplares novos ou usados, ou terá outra regra de estoque?

**Resposta:** Discos novos e edições de colecionador: discos novos e idênticos terão estoque controlado por
quantidade. Discos usados terão controle individual por exemplar, já que podem possuir
conservação, fotos e preço próprios, conforme a própria justificativa do projeto. “Edição de
colecionador” será uma característica da edição, e poderá possuir exemplares novos ou
usados. Portanto, ser de colecionador não determina a regra de estoque; o que determina é a
condição de novo ou usado.

## R02-P3

**Pergunta:** Conservação dos usados: a classificação Goldmine será registrada separadamente para o disco
e para a capa? Além das fotos e classificações, haverá descrição obrigatória de defeitos
particulares de cada exemplar?

**Resposta:** Conservação dos usados: a classificação Goldmine será registrada separadamente para o disco
(mídia) e para a capa. Cada exemplar usado também terá uma descrição obrigatória de
particularidades relevantes, como riscos, marcas, desgaste, manchas ou danos na capa. Isso
complementa as fotos próprias e torna mais precisa a descrição do estado do exemplar.

## R02-P4

**Pergunta:** Indisponibilidade na finalização: se o carrinho tiver vários itens e algum estiver indisponível ao
tentar reservar, a finalização inteira será interrompida ou o cliente poderá prosseguir com os
disponíveis após confirmar a alteração?

**Resposta:** Indisponibilidade na finalização: se algum item estiver indisponível no momento da reserva,
nenhuma reserva será criada naquele primeiro momento. O sistema informará quais itens ou
quantidades deixaram de estar disponíveis e apresentará a atualização do carrinho. O cliente
poderá confirmar a alteração e prosseguir apenas com os itens disponíveis; então uma nova
tentativa de reserva será realizada para o carrinho atualizado.

## R02-P5

**Pergunta:** Expiração e pagamento tardio: criar o pedido dentro dos 15 minutos iniciará um novo prazo
integral de 30 minutos para Pix ou 2 dias para boleto? Se uma confirmação chegar depois do
vencimento e da liberação do estoque, o pagamento deverá ser recusado ou estornado, ou o
sistema tentará atender o pedido caso os itens ainda estejam disponíveis?

**Resposta:** Expiração e pagamento tardio: os 15 minutos correspondem apenas à etapa de finalização.
Quando o pedido for efetivamente criado, começa um novo prazo integral: 30 minutos para Pix
ou 2 dias para boleto. Se o prazo expirar, o pedido será cancelado e o estoque liberado. Uma
confirmação recebida depois disso não reativará automaticamente o pedido, mesmo que o
estoque ainda esteja disponível. Na simulação, o pagamento tardio será identificado e o valor
será estornado, evitando que um pedido cancelado concorra novamente por itens que já podem
ter sido vendidos.

## R02-P6

**Pergunta:** Cancelamento pelo cliente: em quais etapas o cliente poderá cancelar diretamente: somente
enquanto aguarda pagamento, também depois de pagar e antes da separação, ou até o envio?
Para pedidos pagos, o cancelamento permitido deverá gerar estorno integral
automaticamente na simulação ou depender de aprovação da equipe?

**Resposta:** Cancelamento pelo cliente: o cliente poderá cancelar diretamente enquanto o pedido estiver
“aguardando pagamento” e também depois do pagamento enquanto ainda não tiver iniciado a
separação. Se o pedido já estiver em “separado” ou “enviado”, deverá ser utilizado o fluxo de
devolução, e não o cancelamento direto. Quando um pedido já pago puder ser cancelado
diretamente, a simulação realizará estorno integral automático, registrando a operação no
pedido.

## R02-P7

**Pergunta:** Substituto em uma troca: a troca será limitada a outro exemplar da mesma edição ou poderá
envolver qualquer disco? Como deverão ser tratadas diferenças de preço e a ausência de um
substituto disponível?

**Resposta:** Substituto em uma troca: a troca será limitada a outro exemplar da mesma edição, evitando
transformar a troca em uma nova operação comercial. Se não houver outro exemplar
disponível, o cliente poderá aguardar disponibilidade ou converter a solicitação em devolução
com estorno. Se existirem exemplares da mesma edição com preços diferentes — situação
possível principalmente entre usados — não haverá cobrança adicional nem crédito pela
diferença: para evitar distorções, o substituto deverá ser aprovado pela equipe como
equivalente ao exemplar originalmente adquirido.

## R03-P1

**Pergunta:** Início da separação: vocês mencionaram que o cancelamento fica bloqueado quando a separação
começa, mas os estados previstos incluem apenas “separado”. Haverá um estado “em
separação” que já bloqueia o cancelamento, ou a equipe marcará “separado” assim que iniciar
essa atividade?

**Resposta:** Início da separação: será acrescentado o estado “em separação”. O fluxo ficará: aguardando
pagamento -> pago -> em separação -> separado -> enviado -> entregue. Ao entrar em “em
separação”, o cancelamento direto pelo cliente será bloqueado. Isso deixa explícito quando a
operação logística começou.

## R03-P2

**Pergunta:** Devolução antes do envio: quando o pedido estiver separado, mas ainda não enviado, a
solicitação de devolução permitirá que a equipe interrompa o envio e faça o estorno sem exigir
recebimento e retorno físico pelo cliente? Como proceder se a postagem ocorrer antes da
análise?

**Resposta:** Devolução antes do envio: se o pedido estiver em separação ou separado, mas ainda não tiver
sido enviado, o cliente poderá solicitar a devolução. Se a equipe analisar antes da postagem, o
envio será interrompido e, após aprovação, o estorno poderá ser realizado sem retorno físico,
pois o produto nunca saiu da loja. Se a postagem ocorrer antes da análise, o processo seguirá
como uma devolução normal após a entrega.

## R03-P3

**Pergunta:** Condições de troca e devolução: qual será o prazo para solicitar cada modalidade e a partir de
qual evento ele será contado? A solicitação poderá abranger apenas alguns itens ou unidades do
pedido, e quais motivos serão aceitos?

**Resposta:** Condições de troca e devolução: tanto troca quanto devolução poderão ser solicitadas em até 7
dias corridos após a entrega registrada no sistema. A solicitação poderá ser parcial,
abrangendo determinados itens ou quantidades. Para devolução, serão aceitos motivos como
desistência, produto diferente do anunciado, avaria no transporte ou problema não informado.
Para troca, serão aceitos principalmente produto incorreto, avaria ou condição divergente da
descrição. O motivo e uma descrição complementar ficarão registrados.

## R03-P4

**Pergunta:** Valores e frete no pós-venda: em devoluções totais ou parciais, quais valores serão
estornados — valor efetivamente pago pelos itens, frete original ou ambos? Quem assumirá o
frete de retorno e o envio do substituto em uma troca?

**Resposta:** Valores e frete no pós-venda: o estorno utilizará o valor efetivamente pago pelos itens
devolvidos, considerando promoções e cupons. Em devolução integral do pedido, o frete original
também será estornado; em devolução parcial, somente os itens serão estornados. Na
simulação acadêmica, o Garimpo assumirá o frete de retorno quando houver erro da loja,
avaria ou divergência do produto. Em desistência, o retorno também será tratado sem
cobrança adicional ao cliente. Em uma troca aprovada, o Garimpo assumirá tanto o retorno
quanto o envio do substituto.

## R03-P5

**Pergunta:** Espera por substituto: quando o cliente optar por aguardar outro exemplar, haverá prazo
máximo para essa espera? Quando surgir um exemplar equivalente, ele será reservado para a
troca e dependerá da concordância do cliente antes do envio?

**Resposta:** Espera por substituto: o cliente poderá aguardar por até 30 dias por um exemplar equivalente.
Quando surgir um exemplar adequado, ele será reservado para aquela troca, evitando que seja
vendido para outro cliente. O cliente será notificado e deverá confirmar o interesse antes do
envio. Se não houver substituto dentro dos 30 dias, ou se o cliente não quiser mais aguardar, a
troca poderá ser convertida em devolução com estorno.

## R03-P6

**Pergunta:** Preço durante a compra: se o preço mudar enquanto o produto estiver no carrinho, o cliente
deverá confirmar o novo valor antes da reserva? Durante os 15 minutos de finalização, os
preços e descontos ficarão garantidos até a criação do pedido ou poderão ser recalculados?

**Resposta:** Preço durante a compra: enquanto o produto estiver apenas no carrinho, preços, promoções e
descontos não estarão garantidos. Se houver alteração, o carrinho será recalculado e o cliente
precisará visualizar e confirmar o novo total antes da reserva. A partir do início
bem-sucedido da finalização e da reserva de 15 minutos, preços e descontos serão congelados
durante esse prazo. Se a reserva expirar, os valores serão recalculados antes de uma nova
tentativa.

## R03-P7

**Pergunta:** Promoções e cupons: será permitido aplicar apenas um cupom por pedido? Ele poderá acumular
com produtos em promoção, e quais restrições deverão existir, como valor mínimo, limite
total de usos, limite por cliente e aplicação apenas a determinadas edições ou gêneros?

**Resposta:** Promoções e cupons: será permitido um cupom por pedido. O cupom poderá acumular com
produtos que já estejam em promoção, desde que suas próprias regras permitam isso. Cada
cupom poderá definir tipo de desconto (percentual ou valor fixo), validade, valor mínimo do
pedido, limite total de utilizações, limite de uso por cliente e aplicação a produtos, edições ou
gêneros específicos. Também haverá uma configuração indicando se ele pode ou não ser
aplicado sobre itens promocionais. Todas essas regras serão validadas novamente no servidor
no momento da reserva, não apenas na interface.

## R04-P1

**Pergunta:** Prazo para aceitar o substituto: quando um exemplar for reservado para uma troca, quanto
tempo o cliente terá para confirmar o interesse? Se não responder, o exemplar será liberado
e a solicitação continuará aguardando até completar os 30 dias, ou será convertida em
devolução?

**Resposta:** Prazo para aceitar o substituto: quando um exemplar equivalente for encontrado, ele ficará
reservado por 48 horas aguardando confirmação do cliente. Se não houver resposta, o
exemplar será liberado para venda e a solicitação continuará aguardando outro substituto,
respeitando o prazo original de 30 dias. Ao término dos 30 dias sem uma troca confirmada, a
solicitação será convertida em devolução com estorno.

## R04-P2

**Pergunta:** Limites de uso dos cupons: para impedir que reservas simultâneas ultrapassem o limite do
cupom, cada reserva deverá também reservar uma utilização? Em qual momento o uso será
considerado definitivo: criação do pedido ou confirmação do pagamento? Cancelamentos e
devoluções deverão recuperar esse uso?

**Resposta:** Limites de uso dos cupons: ao iniciar uma reserva de 15 minutos, o sistema também fará uma
reserva temporária de uma utilização do cupom, evitando que compras simultâneas
ultrapassem seu limite. O uso será considerado definitivo quando o pedido for criado, inclusive
para Pix e boleto. Se a reserva expirar ou o pedido for cancelado, a utilização será liberada.
Uma devolução posterior, parcial ou integral, não devolverá a utilização do cupom, pois ele
efetivamente foi utilizado em uma compra concluída/criada.

## R04-P3

**Pergunta:** Cálculo dos descontos: o valor mínimo do cupom será calculado sobre os produtos após as
promoções, sem incluir frete? Quando o cupom estiver restrito a determinados produtos, o
mínimo considerará todo o carrinho ou apenas os itens elegíveis?

**Resposta:** Cálculo dos descontos: o valor mínimo exigido pelo cupom será calculado sobre o subtotal dos
produtos após as promoções, sem considerar o frete. Quando o cupom estiver restrito a
determinados produtos, edições ou gêneros, tanto o desconto quanto o valor mínimo serão
calculados considerando somente os itens elegíveis.

## R04-P4

**Pergunta:** Rateio para devoluções parciais: podemos distribuir o desconto do cupom proporcionalmente
entre os itens elegíveis, registrando o valor líquido de cada unidade na compra? Assim, uma
devolução parcial estornará esse valor registrado, sem recalcular o desconto dos itens que o
cliente manteve.

**Resposta:** Rateio para devoluções parciais: sim. O desconto do cupom será distribuído proporcionalmente
entre os itens elegíveis no momento da criação do pedido, com ajuste de centavos para
garantir que a soma corresponda exatamente ao desconto concedido. O valor líquido
efetivamente pago por cada unidade ficará registrado. Assim, em uma devolução parcial, será
estornado exatamente esse valor, sem recalcular o pedido original nem alterar o desconto dos
itens mantidos pelo cliente.

## R04-P5

**Pergunta:** Promoções simultâneas: se duas promoções atingirem o mesmo item, deverá prevalecer a que
oferecer o menor preço, haverá uma prioridade definida pelo administrador ou o cadastro
impedirá essa sobreposição?

**Resposta:** Promoções simultâneas: o cadastro poderá possuir promoções com períodos e produtos
sobrepostos. Quando mais de uma promoção for aplicável ao mesmo item, será utilizada
automaticamente a promoção que resultar no menor preço para aquele produto. As promoções
não serão acumuladas entre si. Isso evita exigir uma prioridade manual e deixa o
comportamento determinístico.

## R04-P6

**Pergunta:** Solicitações repetidas de pós-venda: uma mesma unidade poderá participar de apenas uma
solicitação ativa de troca ou devolução por vez? Após uma troca concluída, o substituto terá
um novo prazo de 7 dias a partir de sua entrega para solicitar outro atendimento?

**Resposta:** Solicitações repetidas de pós-venda: cada unidade poderá participar de apenas uma solicitação
ativa de troca ou devolução por vez. Após uma troca ser concluída e o substituto entregue,
esse novo exemplar terá um novo prazo de 7 dias corridos, contado a partir da entrega, para
abertura de atendimento caso apresente problema ou divergência. O sistema manterá o
vínculo entre a compra original, a primeira troca e eventuais atendimentos posteriores.

## R04-P7

**Pergunta:** Decisões do operador: o operador poderá aprovar ou rejeitar solicitações, declarar um
substituto equivalente e autorizar estornos, ou alguma dessas decisões será exclusiva do
administrador? O acesso operacional já foi definido, mas esses poderes de decisão ainda
precisam ser delimitados.

**Resposta:** Decisões do operador: o operador poderá analisar e aprovar ou rejeitar solicitações, registrar
recebimento e conferência dos produtos e indicar um exemplar como equivalente para uma
troca. Entretanto, a autorização de estornos será exclusiva do administrador, por envolver
operação financeira. O operador poderá encaminhar a solicitação para estorno, mas a
efetivação dependerá do administrador. Ações relevantes de ambos os perfis serão
registradas no log de auditoria, seguindo a exigência técnica já prevista no projeto.

## R05-P1

**Pergunta:** Estornos automáticos e autorização: a exigência de autorização do administrador valerá
apenas para estornos decorrentes do atendimento de troca/devolução, mantendo automáticos
os estornos de cancelamento direto e pagamento tardio? Ou todos os estornos passarão a
aguardar autorização administrativa?

**Resposta:** Estornos automáticos e autorização: a autorização do administrador será necessária
somente para estornos decorrentes de troca ou devolução. Permanecem automáticos os
estornos de cancelamento direto permitido pelo sistema e de pagamento confirmado após o
vencimento do pedido. Assim, situações objetivas e previamente definidas não exigem
intervenção manual, enquanto decisões de pós-venda exigem autorização.

## R05-P2

**Pergunta:** Conversão de troca em devolução: ao completar 30 dias sem troca confirmada, a conversão
será automática, mas o estorno ficará aguardando autorização do administrador e, quando
houver retorno físico, conferência do disco? Isso distingue o encerramento da espera da
liberação do dinheiro.

**Resposta:** Conversão de troca em devolução: ao completar os 30 dias sem uma troca confirmada, a
solicitação será automaticamente convertida em devolução. Isso não significa estorno
imediato. Quando houver necessidade de retorno físico, o produto deverá ser recebido e
conferido primeiro. Depois disso, o estorno ficará aguardando autorização do administrador.
Portanto, a conversão encerra a espera pelo substituto, mas não necessariamente libera o
dinheiro naquele momento.

## R05-P3

**Pergunta:** Reserva perto do fim da espera: se um substituto surgir no 29º dia, as 48 horas para resposta
poderão ultrapassar o prazo original de 30 dias, ou a reserva terminará junto com esse prazo,
mesmo oferecendo menos tempo para confirmação?

**Resposta:** Reserva perto do fim da espera: se um substituto for encontrado antes do término dos 30
dias, o cliente terá as 48 horas completas para responder, mesmo que esse período ultrapasse
o 30º dia. Enquanto essa última oferta estiver ativa, a conversão automática em devolução
ficará suspensa. Se o cliente recusar ou não responder nas 48 horas, o exemplar será liberado
e, como o prazo original já terminou, a solicitação será convertida em devolução.

## R05-P4

**Pergunta:** Sequência da troca: o substituto só poderá ser enviado após o recebimento e a conferência do
exemplar original? A busca e a reserva do substituto poderão ocorrer antes desse
recebimento?

**Resposta:** Sequência da troca: a busca por um substituto e sua reserva poderão ocorrer antes do
recebimento do exemplar original, evitando que outro cliente compre uma unidade adequada
durante o processo. Entretanto, o substituto somente poderá ser enviado depois que o original
for recebido e conferido pela equipe e a troca permanecer aprovada após essa conferência.

## R05-P5

**Pergunta:** Avaliações: a avaliação será vinculada à edição, reunindo compradores de exemplares
diferentes, ou ao exemplar adquirido? Somente clientes com entrega confirmada poderão
avaliar, e qual será o limite de avaliações por cliente ou item comprado?

**Resposta:** Avaliações: as avaliações serão vinculadas à edição do disco, e não ao exemplar individual,
permitindo reunir avaliações de compradores de diferentes exemplares daquela edição.
Somente clientes com entrega confirmada poderão avaliar. Cada unidade adquirida dará direito
a uma avaliação, mas, se o mesmo cliente comprar várias unidades da mesma edição dentro do
mesmo pedido, será permitida apenas uma avaliação referente àquela edição naquele pedido. A
avaliação poderá ser posteriormente editada pelo próprio cliente.

## R05-P6

**Pergunta:** Avisos de reposição: a inscrição será para qualquer exemplar da edição ou permitirá escolher
“novo” ou “usado”? O aviso será enviado a todos os interessados quando houver disponibilidade
para venda, sem garantir reserva para quem recebeu a mensagem?

**Resposta:** Avisos de reposição: o cliente poderá escolher entre receber aviso de disponibilidade de
exemplar novo, usado ou qualquer um dos dois para determinada edição. Quando surgir
disponibilidade correspondente, todos os clientes com aviso ativo serão notificados. A
notificação não realizará reserva nem dará prioridade de compra; o exemplar continuará
disponível normalmente e, no caso dos usados, será adquirido por quem conseguir reservá-lo
primeiro durante a finalização. Isso mantém coerência com a função de notificação de retorno
ao estoque já prevista no projeto.

## R05-P7

**Pergunta:** Exclusão de produtos: quando uma edição ou exemplar estiver vinculado a pedidos, avaliações
ou atendimentos, a exclusão deverá ser bloqueada e substituída pela inativação, preservando o
histórico? Para itens sem vínculos, a exclusão definitiva será permitida?

**Resposta:** Exclusão de produtos: se uma edição ou exemplar possuir vínculo com pedidos, avaliações,
trocas, devoluções ou qualquer outro registro histórico relevante, a exclusão definitiva será
bloqueada, permitindo apenas sua inativação. Dessa forma, pedidos antigos continuam exibindo
corretamente os dados necessários. A exclusão definitiva será permitida somente para
registros sem qualquer vínculo histórico. Isso também esclarece a diferença entre
“inativação” e “exclusão”, ambas previstas originalmente nas funções administrativas.

## R06-P1

**Pergunta:** Reservas do mesmo cliente: cada cliente poderá manter apenas uma finalização com reserva
de 15 minutos ativa? Ao abrir outra aba ou acessar pelo mobile, deverá retomar essa mesma
finalização ou poderá criar reservas independentes?

**Resposta:** Reservas do mesmo cliente: cada cliente poderá manter apenas uma finalização ativa por vez,
independentemente do dispositivo. Se abrir outra aba ou acessar pelo mobile enquanto houver
uma reserva válida, o sistema deverá recuperar a mesma finalização, com os mesmos itens,
valores e tempo restante. Não será possível criar reservas independentes usando a mesma
conta.

## R06-P2

**Pergunta:** Falha no cartão: se o pagamento for recusado, o cliente poderá tentar novamente ou escolher
Pix/boleto no mesmo pedido? Por quanto tempo o estoque ficará reservado nessa situação,
considerando que os prazos definidos até agora cobrem a finalização, o Pix e o boleto?

**Resposta:** Falha no cartão: se o cartão for recusado, o pedido ainda não será criado. O cliente poderá
tentar novamente ou escolher outro meio de pagamento enquanto permanecer dentro dos 15
minutos da reserva original. Uma tentativa recusada não reinicia nem prolonga esse prazo. Se
escolher Pix ou boleto e o pedido for criado dentro dos 15 minutos, passam a valer os
respectivos prazos já definidos de 30 minutos e 2 dias.

## R06-P3

**Pergunta:** Carrinho após login: se o visitante tiver itens no carrinho e entrar em uma conta que já possui
outro carrinho salvo, os itens deverão ser combinados ou um dos carrinhos substituirá o
outro? Para discos novos repetidos, as quantidades deverão ser somadas e conferidas contra
o estoque disponível?

**Resposta:** Carrinho após login: o carrinho do visitante será mesclado com o carrinho salvo da conta. Para
o mesmo produto novo, as quantidades serão somadas até o limite disponível em estoque; se a
soma ultrapassar a disponibilidade, o sistema ajustará para a quantidade máxima possível e
avisará o cliente. Exemplares usados, por serem individuais, não serão duplicados. Se um usado
presente nos dois carrinhos já estiver indisponível, ele será sinalizado e removido antes da
finalização.

## R06-P4

**Pergunta:** Estoque reservado e inativação: a equipe poderá inativar um produto ou registrar
perda/avaria enquanto ele estiver reservado ou em pedido ainda não enviado? Se isso for
permitido, qual tratamento deverá ocorrer com a compra afetada: preservar seu
atendimento ou cancelar com liberação do cupom e estorno quando houver pagamento?

**Resposta:** Estoque reservado e inativação: a equipe não poderá registrar como perda/avaria uma unidade
atualmente reservada ou vinculada a um pedido ativo sem resolver primeiro essa vinculação. A
inativação comercial da edição poderá impedir novas compras sem afetar reservas ou pedidos
já existentes. Se for constatado que uma unidade reservada ou vendida realmente não pode
ser entregue por perda ou avaria, a compra afetada será cancelada por indisponibilidade: a
reserva será encerrada, a utilização do cupom será liberada quando aplicável e, caso já exista
pagamento, ocorrerá estorno automático, pois o cancelamento decorre de impossibilidade
objetiva de atendimento e não de uma decisão de pós-venda.

## R06-P5

**Pergunta:** Frete simulado: qual regra será usada para calcular valor e prazo por CEP — por exemplo, uma
tabela fixa por região? Haverá regiões não atendidas, frete grátis ou retirada na loja, ou a
primeira versão terá somente entrega com frete cobrado?

**Resposta:** Frete simulado: será utilizada uma tabela fixa por faixa de CEP/região, retornando valor e
prazo estimado. Para simplificar a primeira versão, haverá apenas entrega com frete
cobrado, sem retirada na loja e sem regra permanente de frete grátis. Algumas faixas de CEP
poderão ser configuradas como não atendidas, permitindo demonstrar também a validação de
cobertura. O cálculo continuará sendo apresentado ao cliente a partir do CEP, conforme
previsto originalmente.

## R06-P6

**Pergunta:** Avisos de reposição recorrentes: depois de enviar um aviso, a inscrição será encerrada ou
continuará ativa para futuras reposições? A liberação de um exemplar por expiração de
reserva ou cancelamento também deverá disparar avisos, ou somente a entrada de estoque
novo e o retorno de itens conferidos?

**Resposta:** Avisos de reposição recorrentes: após o envio de uma notificação, a inscrição correspondente
será encerrada. Se o cliente quiser continuar recebendo avisos depois que o item esgotar
novamente, deverá criar uma nova inscrição. O aviso será disparado sempre que um exemplar
compatível voltar efetivamente à disponibilidade para venda, independentemente da origem:
reposição cadastrada pela equipe, devolução conferida, cancelamento de pedido ou expiração de
reserva. A simples criação ou movimentação interna de estoque que ainda não esteja
disponível não dispara o aviso.

## R06-P7

**Pergunta:** Moderação de avaliações: avaliações serão publicadas imediatamente, com possibilidade de
ocultação posterior, ou dependerão de aprovação? Quem poderá moderá-las — somente o
administrador ou também o operador — e uma edição feita pelo cliente exigirá nova análise?

**Resposta:** Moderação de avaliações: avaliações serão publicadas imediatamente, sem aprovação prévia, e
poderão ser ocultadas posteriormente em caso de conteúdo inadequado. Tanto administrador
quanto operador poderão realizar essa moderação, mas a ação deverá ficar registrada no log
de auditoria. Se o cliente editar sua avaliação, a nova versão também será publicada
imediatamente e continuará sujeita à moderação. O sistema deverá preservar internamente
as informações necessárias para auditar a modificação e a eventual ocultação, mantendo a
função de moderação prevista no projeto original.

## R07-P1

**Pergunta:** Cartão aprovado no limite da reserva: se a confirmação de aprovação chegar depois que os 15
minutos expirarem, o sistema deverá impedir a criação do pedido e estornar automaticamente
o pagamento, mesmo que o item ainda esteja disponível?

**Resposta:** Cartão aprovado no limite da reserva: se a aprovação chegar depois dos 15 minutos, o pedido
não será criado, mesmo que os itens ainda estejam disponíveis. O pagamento será estornado
automaticamente. Não será feita uma nova tentativa de reservar os produtos, evitando que
uma resposta tardia altere uma reserva já encerrada.

## R07-P2

**Pergunta:** Pedidos aguardando pagamento: depois de criar um pedido por Pix ou boleto, o cliente poderá
iniciar outra compra enquanto aquele pedido aguarda pagamento? Haverá limite de pedidos
pendentes por cliente, considerando que boletos podem manter exemplares únicos reservados
por dois dias?

**Resposta:** Pedidos aguardando pagamento: o cliente poderá iniciar outra compra mesmo tendo pedido
aguardando Pix ou boleto. Porém, para evitar bloqueio excessivo de estoque, haverá limite de 3
pedidos aguardando pagamento por cliente. Ao atingir esse limite, será necessário pagar ou
aguardar o cancelamento de um deles antes de criar outro. Cada pedido manterá suas próprias
reservas e seu respectivo prazo de pagamento.

## R07-P3

**Pergunta:** Indisponibilidade em parte do pedido: se apenas um item de um pedido com vários produtos
sofrer perda ou avaria, o pedido inteiro será cancelado ou haverá cancelamento parcial? Caso
seja parcial, como deverão ficar o frete e a utilização do cupom?

**Resposta:** Indisponibilidade em parte do pedido: será permitido cancelamento parcial quando apenas
determinadas unidades não puderem ser entregues. As demais continuarão no pedido. O valor
efetivamente pago pelas unidades afetadas será estornado automaticamente, utilizando o
rateio registrado na compra. O frete original será mantido enquanto existir pelo menos um
item a ser enviado; se todos os itens forem cancelados, também será estornado. O uso do
cupom não será recalculado nem recuperado em cancelamento parcial; se todos os itens forem
cancelados por impossibilidade de atendimento da loja, a utilização será liberada.

## R07-P4

**Pergunta:** Alterações durante a finalização: enquanto houver reserva ativa, o cliente poderá alterar
itens, quantidades, endereço ou cupom? Essas alterações deverão encerrar a reserva e iniciar
uma nova validação com preços atuais, ou algumas poderão ocorrer mantendo o prazo e as
condições originais?

**Resposta:** Alterações durante a finalização: alterações em itens, quantidades ou cupom encerram a
reserva atual e exigem uma nova validação de estoque, preços, promoções e cupom, iniciando
uma nova reserva de 15 minutos. A alteração do endereço de entrega poderá manter a reserva
dos produtos e seus preços, mas o frete será recalculado. O prazo original de 15 minutos
continuará correndo e não será reiniciado pela mudança de endereço.

## R07-P5

**Pergunta:** Cadastro e acesso: quais dados serão obrigatórios para criar a conta, e quais serão exigidos
apenas na compra? Será necessário confirmar o e-mail antes de finalizar pedidos? A
recuperação de senha poderá usar um link temporário enviado pelo mesmo serviço de e-mail de
teste?

**Resposta:** Cadastro e acesso: para criar a conta serão obrigatórios nome, e-mail e senha. O e-mail
deverá ser único. Dados necessários à entrega, como endereço e CEP, serão exigidos apenas
para a compra e poderão ser salvos posteriormente no perfil. O e-mail deverá ser confirmado
antes da criação do primeiro pedido. A recuperação de senha utilizará um link temporário, de
uso único e com prazo de validade, enviado pelo mesmo serviço de e-mail de teste utilizado nas
demais notificações. Isso implementa a recuperação de senha já prevista no escopo.

## R07-P6

**Pergunta:** Gerenciamento de clientes: o que administrador e operador poderão fazer nessa função:
consultar dados e pedidos, corrigir informações, bloquear acesso ou outras ações? Se houver
bloqueio, ele impedirá apenas novas compras ou também o acesso ao histórico e às solicitações
de pós-venda?

**Resposta:** Gerenciamento de clientes: administrador e operador poderão consultar cadastro, endereços,
pedidos e histórico de atendimentos. O próprio cliente continuará sendo o responsável normal
pela edição de seus dados. O operador não poderá alterar dados cadastrais nem bloquear
contas; poderá apenas consultar as informações necessárias ao atendimento. O administrador
poderá corrigir dados quando necessário e bloquear/desbloquear contas, com registro em
auditoria. O bloqueio impedirá login e novas operações comerciais, mas não apagará pedidos,
avaliações ou histórico. Caso exista pós-venda pendente, a equipe poderá continuar seu
processamento administrativo mesmo com a conta bloqueada.

## R07-P7

**Pergunta:** Avaliação ocultada e depois editada: a regra de publicação imediata após edição também valerá
para avaliações anteriormente ocultadas pela equipe? Ou essas permanecerão ocultas até
liberação de um moderador, evitando que a edição desfaça automaticamente a moderação?

**Resposta:** Avaliação ocultada e depois editada: uma avaliação ocultada pela moderação continuará oculta
mesmo se o cliente editá-la. A edição ficará registrada e colocará a avaliação em estado de
“aguardando nova análise”. Administrador ou operador deverá liberá-la explicitamente para
que volte a aparecer publicamente. Assim, o cliente não consegue contornar uma decisão de
moderação simplesmente alterando o conteúdo.

## R08-P1

**Pergunta:** Cancelamento parcial antes do pagamento: se uma unidade ficar indisponível em um pedido
aguardando Pix ou boleto, a cobrança original será invalidada e substituída por outra com valor
reduzido? Nesse caso, o vencimento original será mantido ou começará um novo prazo?

**Resposta:** Cancelamento parcial antes do pagamento: se uma unidade ficar indisponível enquanto o pedido
aguarda Pix ou boleto, a cobrança original será invalidada e uma nova cobrança será gerada
com o valor atualizado. O pedido continuará sendo o mesmo, registrando a substituição da
cobrança. O vencimento original será mantido, evitando que uma indisponibilidade prorrogue
artificialmente a reserva dos demais itens. Se não houver tempo hábil para gerar uma nova
cobrança válida, o pedido será cancelado.

## R08-P2

**Pergunta:** Limite de pedidos pendentes: ao atingir três pedidos aguardando pagamento, o cliente também
poderá cancelar diretamente um deles para liberar uma vaga, conforme a regra de
cancelamento já definida? A verificação desse limite deverá ocorrer antes de reservar
produtos para outra finalização?

**Resposta:** Limite de pedidos pendentes: sim. Enquanto estiver em “aguardando pagamento”, o cliente
poderá cancelar diretamente um dos pedidos, liberando o estoque e uma vaga no limite de três.
A verificação do limite ocorrerá antes da criação de uma nova reserva de finalização.
Portanto, quem já possuir três pedidos pendentes não conseguirá bloquear novos itens antes
de resolver pelo menos um deles.

## R08-P3

**Pergunta:** Bloqueio de conta com compras em andamento: ao bloquear um cliente, suas reservas de
finalização serão encerradas? Pedidos aguardando pagamento serão cancelados ou continuarão
válidos, e pedidos pagos continuarão sendo atendidos normalmente?

**Resposta:** Bloqueio de conta com compras em andamento: o bloqueio encerrará imediatamente qualquer
reserva de finalização ainda ativa. Pedidos aguardando pagamento também serão cancelados e
seus estoques liberados. Pedidos já pagos não serão cancelados automaticamente e
continuarão sendo processados normalmente, salvo se existir outro motivo operacional
específico que impeça seu atendimento.

## R08-P4

**Pergunta:** Pós-venda de cliente bloqueado: como o bloqueio impede login, a equipe poderá registrar
solicitações e decisões do cliente recebidas por um canal externo, inclusive sua aceitação de
um substituto? Qual canal será considerado na demonstração acadêmica?

**Resposta:** Pós-venda de cliente bloqueado: sim. Como o cliente não poderá acessar a conta, a equipe
poderá registrar manualmente no sistema solicitações e decisões recebidas externamente,
inclusive a confirmação ou recusa de um substituto. Para a demonstração acadêmica, o canal
considerado será o e-mail cadastrado do cliente. O operador registrará a interação no
atendimento, incluindo data, decisão comunicada e responsável pelo registro, preservando a
rastreabilidade.

## R08-P5

**Pergunta:** Prazo para retorno físico: após a aprovação de uma troca ou devolução, quanto tempo o
cliente terá para postar o produto? Se não houver postagem, a solicitação será encerrada,
ficará pendente ou dependerá de decisão da equipe? O prazo de 30 dias para encontrar
substituto começará na aprovação da troca ou em outro evento?

**Resposta:** Prazo para retorno físico: depois da aprovação de uma troca ou devolução que exija retorno
físico, o cliente terá 7 dias corridos para realizar a postagem e informar o envio. Se não
houver postagem nesse prazo, a solicitação será encerrada por expiração, podendo uma
exceção ser analisada pela equipe. No caso de troca, o prazo de 30 dias para encontrar um
substituto começará somente após o recebimento e a conferência favorável do exemplar
original. Isso evita reservar ou procurar substitutos por longos períodos para produtos que
nunca foram efetivamente devolvidos.

## R08-P6

**Pergunta:** Conferência com divergência: se o produto devolvido não corresponder ao exemplar vendido ou
apresentar danos adicionais, a equipe poderá rejeitar o atendimento após a conferência?
Nesse caso, como será tratado o produto recebido e quem poderá decidir uma exceção?

**Resposta:** Conferência com divergência: sim. Se o item recebido não corresponder ao exemplar vendido ou
apresentar danos adicionais incompatíveis com o motivo do atendimento, a equipe poderá
rejeitar a troca ou devolução após a conferência, registrando o motivo e evidências. O produto
recebido ficará aguardando definição para devolução ao cliente. O operador poderá realizar a
conferência e indicar a rejeição conforme as regras normais; exceções que autorizem
atendimento apesar da divergência serão exclusivas do administrador e ficarão registradas no
log de auditoria, coerente com o controle administrativo previsto no projeto.

## R08-P7

**Pergunta:** Relatórios e indicadores: “vendas por período” considerará a data do pagamento e descontará
cancelamentos e estornos? Para ticket médio, gêneros mais vendidos e produtos com maior
giro, deverão ser consideradas apenas as unidades efetivamente vendidas, excluindo
substitutos enviados em trocas?

**Resposta:** Relatórios e indicadores: sim. Vendas por período utilizará a data de confirmação do
pagamento e considerará o valor líquido efetivamente vendido, descontando cancelamentos e
estornos correspondentes. O ticket médio será calculado sobre pedidos pagos efetivamente
mantidos, considerando os ajustes decorrentes de cancelamentos e devoluções. Gêneros mais
vendidos e produtos com maior giro considerarão apenas unidades efetivamente vendidas e não
posteriormente canceladas/devolvidas. Exemplares enviados como substitutos em trocas não
contarão como novas vendas, pois não representam uma nova operação comercial. Isso detalha
os quatro indicadores previstos originalmente no painel administrativo.

## R09-P1

**Pergunta:** Busca antecipada de substituto: continua permitido procurar, oferecer e reservar um
substituto antes de receber o original, contando os 30 dias apenas após a conferência
favorável? Ou a nova decisão determina que toda a busca comece somente após essa
conferência?

**Resposta:** Busca antecipada de substituto: continua permitido procurar, oferecer e reservar
antecipadamente um exemplar equivalente antes do recebimento do original. Entretanto, essa
busca antecipada não consome o prazo formal de 30 dias. Os 30 dias começam após o
recebimento e a conferência favorável do exemplar devolvido. Assim, a busca antecipada
funciona como uma tentativa de agilizar a troca.

## R09-P2

**Pergunta:** Substituto confirmado e retorno pendente: caso a busca antecipada continue permitida e o
cliente aceite o substituto em até 48 horas, ele permanecerá reservado até a chegada e
conferência do original? Se a solicitação expirar por falta de postagem ou for rejeitada na
conferência, essa reserva será liberada automaticamente?

**Resposta:** Substituto confirmado e retorno pendente: se o cliente aceitar o substituto dentro das 48
horas, ele permanecerá reservado para aquela troca até a chegada e conferência do original,
mas não será enviado antes disso. Se o cliente não postar o original dentro dos 7 dias e não
houver prorrogação autorizada, ou se o atendimento for rejeitado após a conferência, a
reserva do substituto será automaticamente cancelada e o exemplar voltará a ficar
disponível para venda.

## R09-P3

**Pergunta:** Pagamento de cobrança substituída: se chegar uma confirmação de pagamento da cobrança
antiga, já invalidada após cancelamento parcial, ela será integralmente estornada, mantendo
válida apenas a nova cobrança? Isso evita aceitar um valor que já não corresponde ao pedido
atualizado.

**Resposta:** Pagamento de cobrança substituída: sim. Uma cobrança invalidada jamais poderá quitar o
pedido atualizado. Se sua confirmação chegar posteriormente, o valor recebido será
integralmente estornado de forma automática. Apenas a nova cobrança, correspondente ao
valor atualizado do pedido, permanecerá apta a confirmar o pagamento.

## R09-P4

**Pergunta:** Exceções ao prazo de postagem: quem poderá autorizar atendimento depois dos sete dias sem
postagem: operador e administrador ou somente administrador? A exceção deverá
estabelecer um novo prazo explícito e registrar uma justificativa?

**Resposta:** Exceções ao prazo de postagem: somente o administrador poderá autorizar uma exceção aos 7
dias. A autorização deverá conter justificativa e estabelecer explicitamente um novo prazo
de postagem. A decisão, o administrador responsável, a data e o novo vencimento serão
registrados no log de auditoria. O operador poderá registrar a situação e encaminhar o pedido
de exceção, mas não autorizá-lo.

## R09-P5

**Pergunta:** Trocas nos relatórios: quando o original retornar e houver envio de um substituto, a compra
continuará contando como uma venda de uma unidade da edição, pelo valor original pago? Isso
esclarece a diferença entre retorno para troca e devolução com estorno, que reduz as vendas.

**Resposta:** Trocas nos relatórios: uma troca concluída não desfaz nem cria uma nova venda. A compra
continuará representando uma unidade vendida da edição pelo valor líquido originalmente pago
pela unidade, mesmo que fisicamente outro exemplar tenha sido entregue como substituto. O
substituto não será contabilizado como segunda venda. Já uma devolução com estorno
reduzirá os valores e quantidades líquidas dos indicadores correspondentes.

## R09-P6

**Pergunta:** Período dos ajustes financeiros: se uma compra paga em setembro tiver estorno em outubro,
o relatório de setembro será recalculado para refletir esse estorno ou o ajuste aparecerá em
outubro? No ticket médio, o valor considerado incluirá frete ou somente produtos após
descontos e estornos?

**Resposta:** Período dos ajustes financeiros: os relatórios preservarão os eventos em seus respectivos
períodos. Assim, uma venda paga em setembro aparecerá como venda de setembro; se houver
estorno em outubro, o estorno aparecerá como ajuste negativo em outubro, sem reescrever
retroativamente o resultado fechado de setembro. O sistema poderá relacionar o ajuste à
venda original para rastreabilidade. Para o ticket médio, serão considerados somente os
valores líquidos dos produtos, após promoções, cupons, cancelamentos e estornos, sem incluir
frete.

## R09-P7

**Pergunta:** Gêneros e giro de produtos: uma edição poderá pertencer a vários gêneros? Se puder, sua
venda contará em todos eles ou apenas em um gênero principal? O indicador de “maior giro”
significará quantidade líquida de unidades vendidas por edição no período ou uma relação entre
vendas e estoque médio?

**Resposta:** Gêneros e giro de produtos: uma edição poderá pertencer a vários gêneros. Para evitar que
uma única venda seja contabilizada várias vezes no ranking, cada edição também terá um
gênero principal, e somente ele será utilizado no indicador “gêneros mais vendidos”; os demais
continuarão disponíveis para classificação e filtros do catálogo. “Produtos com maior giro”,
nesta primeira versão, significará a quantidade líquida de unidades vendidas por edição no
período, descontando cancelamentos e devoluções. Não será calculada relação com estoque
médio, mantendo o indicador mais simples e adequado ao escopo acadêmico.

## R10-P1

**Pergunta:** Ticket médio por período: qual regra vocês preferem: calcular a média dos pedidos pagos
naquele período, considerando seus ajustes conhecidos; ou dividir o saldo de produtos do
período — vendas menos estornos ocorridos nele — pela quantidade de pedidos pagos no
período? A segunda opção pode produzir valor negativo quando houver muitos estornos de
compras antigas; a primeira pode mudar conforme ocorram devoluções posteriores.

**Resposta:** Ticket médio por período: vamos usar a primeira regra. O ticket médio de um período será a
média dos pedidos pagos naquele período, considerando o valor líquido dos produtos desses
pedidos e os ajustes já conhecidos no momento da consulta. Portanto, se uma venda de
setembro sofrer devolução em outubro, ao consultar novamente o ticket médio de setembro,
o valor daquele pedido será considerado já descontado do estorno. O estorno continuará
aparecendo financeiramente como ajuste de outubro, mas o indicador de ticket médio
refletirá o valor líquido final das vendas originadas no período. Isso evita tickets negativos ou
distorcidos por estornos referentes a vendas antigas.

## R10-P2

**Pergunta:** Identificação de uma edição: quais características distinguirão duas edições do mesmo álbum?
Por exemplo: número de catálogo, gravadora, país, ano de prensagem e formato. Também será
necessário separar o ano de lançamento original do álbum do ano daquela edição para definir o
filtro por década?

**Resposta:** Identificação de uma edição: duas edições do mesmo álbum serão diferenciadas por
informações como gravadora/selo, número de catálogo, país de prensagem, ano da
edição/prensagem e formato, além de características relevantes como gramatura quando
aplicável. Serão armazenados separadamente o ano de lançamento original do álbum e o ano
daquela edição específica. O filtro por década utilizará o ano da edição/prensagem, permitindo
distinguir, por exemplo, uma prensagem original de 1975 de uma reedição de 2025. Isso detalha
os campos de catálogo já previstos no documento.

## R10-P3

**Pergunta:** Artistas e faixas: uma edição poderá reunir vários artistas, como em coletâneas, e cada faixa
poderá ter artistas próprios? A busca por artista deverá encontrar tanto os artistas da
edição quanto os participantes registrados nas faixas?

**Resposta:** Artistas e faixas: uma edição poderá possuir um ou vários artistas principais, permitindo
representar coletâneas e trabalhos colaborativos. Cada faixa também poderá possuir um ou
vários artistas próprios. A busca por artista considerará tanto os artistas associados à
edição quanto os participantes cadastrados nas faixas. Dessa forma, a busca textual por
título, artista ou faixa prevista originalmente continuará funcionando também nesses casos.

## R10-P4

**Pergunta:** Prévia de áudio: as prévias serão cadastradas pela equipe como arquivos de demonstração,
links externos ou ambas as opções? Elas estarão associadas a cada faixa ou haverá apenas
uma prévia por edição?

**Resposta:** Prévia de áudio: para simplificar a entrega acadêmica, as prévias serão cadastradas como
links para arquivos/recursos de demonstração, sem upload e armazenamento de áudio pela
própria aplicação. A prévia será associada individualmente às faixas, e cada faixa poderá ter
nenhuma ou uma prévia. A interface só exibirá a opção de reprodução quando houver uma
prévia cadastrada.

## R10-P5

**Pergunta:** Alerta de estoque baixo: o limite será configurado por edição para unidades novas, enquanto
usados terão alerta quando não existir nenhum exemplar disponível, ou haverá outra regra? O
alerta aparecerá apenas no painel administrativo ou também por e-mail?

**Resposta:** Alerta de estoque baixo: para discos novos, cada edição terá um limite mínimo configurável;
quando a quantidade disponível atingir ou ficar abaixo desse limite, será gerado o alerta. Para
usados, haverá alerta quando não existir nenhum exemplar disponível daquela edição. Na
primeira versão, os alertas aparecerão somente no painel administrativo, sem envio por
e-mail. Isso atende ao controle com alerta de estoque baixo previsto no escopo administrativo
sem acrescentar uma integração desnecessária.

## R10-P6

**Pergunta:** Critérios da entrega acadêmica: existem prazo de entrega, rubrica do professor ou
restrições adicionais obrigatórias? Quais navegadores e plataformas mobile deverão ser
demonstrados — Android, iOS ou ambos — e haverá exigência de publicação ou bastará execução
local?

**Resposta:** Critérios da entrega acadêmica: PENDENTE DE DECISÃO / INFORMAÇÃO DO PROFESSOR. O
documento fornecido não informa prazo de entrega, rubrica de avaliação, navegadores
obrigatórios, plataforma mobile específica ou necessidade de publicação. Pelo projeto,
sabemos apenas que haverá uma interface web responsiva e aplicativo em React Native com
Expo. Portanto, não vou inventar esses requisitos. Precisamos consultar o enunciado/rubrica
correspondente caso exista.

## R10-P7

**Pergunta:** Volume e desempenho: qual volume de demonstração devemos considerar para edições,
exemplares, clientes e acessos simultâneos? Há uma meta de tempo de resposta para busca e
finalização ou esses valores permanecem PENDENTES DE DECISÃO?

**Resposta:** Volume e desempenho: PENDENTE DE DECISÃO. O documento não estabelece quantidade
esperada de edições, exemplares, clientes ou usuários simultâneos, nem metas de tempo de
resposta para busca, reserva ou finalização. Podemos definir esses números posteriormente
como requisitos não funcionais mensuráveis, mas não há base no material atual para tratá-los
como exigência acadêmica.

## R11-P1

**Pergunta:** Pedidos integralmente estornados no ticket médio: eles continuarão no denominador da média,
com valor líquido zero, ou serão excluídos do cálculo? A definição anterior de “pedidos
efetivamente mantidos” deixa essa diferença em aberto.

**Resposta:** Pedidos integralmente estornados no ticket médio: serão excluídos do denominador. O ticket
médio representará a média do valor líquido dos pedidos originados no período que
permaneceram, pelo menos parcialmente, como vendas. Um pedido integralmente estornado
terá valor líquido zero e não será considerado uma venda efetivamente mantida. Pedidos
parcialmente estornados permanecem no cálculo pelo seu valor líquido restante.

## R11-P2

**Pergunta:** Lista de desejos: ela reunirá edições, exemplares específicos ou ambos? Será exclusiva de
clientes autenticados e independente da inscrição para avisos de reposição?

**Resposta:** Lista de desejos: será vinculada à edição, e não a exemplares usados específicos. Assim, o
cliente demonstra interesse no título/edição independentemente do exemplar disponível
naquele momento. A lista será exclusiva de usuários autenticados e será independente dos
avisos de reposição: adicionar à lista de desejos não ativa notificações automaticamente, e
ativar uma notificação não exige adicionar à lista. A lista de desejos já consta entre as
funcionalidades destinadas ao usuário.

## R11-P3

**Pergunta:** Dados históricos do pedido: ao concluir a compra, deverão ser preservadas cópias do endereço
de entrega e das informações dos itens — descrição, edição, conservação e valores — para que
alterações posteriores no cadastro não modifiquem pedidos antigos?

**Resposta:** Dados históricos do pedido: sim. Na criação do pedido serão armazenados snapshots dos dados
relevantes, incluindo endereço de entrega, identificação e descrição da edição, informações do
exemplar quando aplicáveis, conservação de mídia/capa, preço original, promoção, parcela de
desconto do cupom e valor líquido por unidade. Alterações posteriores no endereço, catálogo,
preço ou descrição não modificarão pedidos antigos. Os relacionamentos com os registros
originais poderão continuar existindo para rastreabilidade, mas a exibição histórica utilizará
os dados preservados no pedido.

## R11-P4

**Pergunta:** Rastreamento e entrega: administrador e operador registrarão manualmente os eventos
simulados, incluindo a entrega que inicia os sete dias de pós-venda? Cada pedido terá uma única
remessa ou poderá ser dividido em várias, com códigos e datas de entrega diferentes?

**Resposta:** Rastreamento e entrega: administrador e operador poderão registrar manualmente os
eventos simulados de envio, rastreamento e entrega. A data registrada como entrega efetiva
iniciará o prazo de 7 dias para troca/devolução. Na primeira versão, cada pedido terá uma
única remessa, com um código de rastreamento e uma data de entrega. Não haverá divisão do
mesmo pedido em múltiplas remessas, reduzindo a complexidade do fluxo. O registro do código
de rastreio e a atualização do status já estão previstos nas funções administrativas.

## R11-P5

**Pergunta:** Imagens e evidências: quais formatos, tamanho máximo por arquivo e quantidade de fotos
serão aceitos para edições e exemplares usados? As solicitações de troca/devolução também
permitirão anexar imagens pelo cliente e pela equipe?

**Resposta:** Imagens e evidências: para o catálogo serão aceitos JPEG, PNG e WebP, com tamanho máximo
de 5 MB por arquivo. Cada edição poderá possuir até 10 imagens, e cada exemplar usado até 8
imagens próprias. Solicitações de troca/devolução poderão receber até 5 imagens do cliente
como evidência, e a equipe poderá anexar até 5 imagens da conferência. Os uploads serão
validados no servidor quanto ao formato e tamanho. Esses limites são decisões de projeto,
pois o documento exige fotos/upload de imagens, mas não especifica quantidade ou tamanho.

## R11-P6

**Pergunta:** Confirmação de e-mail e recuperação de senha: quais serão os prazos de validade dos
respectivos links? A troca de senha deverá encerrar as sessões existentes em todos os
dispositivos, exigindo novo login?

**Resposta:** Confirmação de e-mail e recuperação de senha: o link de confirmação de e-mail terá validade
de 24 horas e poderá ser reenviado. O link de recuperação de senha terá validade de 30
minutos, será de uso único e será invalidado após utilização. Quando a senha for alterada por
recuperação, todas as sessões/tokens ativos da conta serão invalidados, exigindo novo login
nos dispositivos. Isso complementa as exigências de recuperação de senha, armazenamento
seguro das senhas e autenticação por token previstas no projeto.

## R11-P7

**Pergunta:** Backup e recuperação: o documento exige backup diário e testes periódicos de restauração.
Por quantos dias os backups serão mantidos, com que frequência a restauração será testada
e onde as cópias ficarão armazenadas? Se essas definições dependerem do ambiente de
implantação, podemos mantê-las como PENDENTES DE DECISÃO.

**Resposta:** Backup e recuperação: manteremos PENDENTES DE DECISÃO o período exato de retenção, a
frequência dos testes de restauração e o local definitivo de armazenamento, pois dependem do
ambiente de implantação que ainda não foi definido. O requisito já estabelecido permanece:
haverá backup automático diário, política de retenção e testes periódicos de restauração.
Quando o ambiente da entrega estiver definido, esses três parâmetros deverão ser fechados
e documentados.

## R12-P1

**Pergunta:** Usuários internos: somente administradores poderão criar contas de operadores e outros
administradores? Uma mesma conta poderá também comprar como cliente? O sistema deverá
impedir o bloqueio ou a remoção do último administrador ativo?

**Resposta:** Usuários internos: somente administradores poderão criar, editar, bloquear ou inativar contas
de operadores e de outros administradores. As contas internas serão separadas das contas
de cliente; portanto, uma conta administrativa não será utilizada para realizar compras. A
mesma pessoa poderá possuir uma conta de cliente separada, com outro contexto de
autenticação. O sistema impedirá a inativação, bloqueio ou remoção do último administrador
ativo, garantindo que a área administrativa nunca fique sem alguém com permissão de gestão.

## R12-P2

**Pergunta:** Alteração de e-mail: cliente e administrador poderão alterar o e-mail cadastrado? Se
puderem, o novo endereço deverá ser confirmado antes de substituir o anterior, preservando
o acesso e o recebimento de mensagens até essa confirmação?

**Resposta:** Alteração de e-mail: clientes poderão solicitar alteração do próprio e-mail. O novo endereço
deverá ser confirmado por link antes de substituir o atual; até lá, o e-mail anterior continuará
válido para login e comunicações. Administradores poderão corrigir o e-mail de clientes, mas a
alteração também exigirá confirmação do novo endereço. Para contas internas, somente
administradores poderão alterar o e-mail, seguindo igualmente a confirmação antes da
substituição.

## R12-P3

**Pergunta:** Falha no estorno: se a simulação ou sandbox rejeitar um estorno, o pedido continuará
cancelado e o estorno ficará pendente para nova tentativa? Quem poderá solicitar essa
tentativa, e o cliente deverá visualizar que o dinheiro ainda não foi estornado?

**Resposta:** Falha no estorno: se a simulação/sandbox rejeitar ou falhar ao processar um estorno, o
cancelamento ou devolução continuará válido, mas o estorno ficará com estado “pendente” ou
“falhou”, sem ser marcado falsamente como concluído. O cliente visualizará que o pedido foi
cancelado, mas que o reembolso ainda está pendente. Estornos automáticos poderão ter nova
tentativa pelo sistema ou pelo administrador; nos estornos de pós-venda, somente o
administrador poderá autorizar/solicitar a tentativa. Todas as tentativas serão registradas.

## R12-P4

**Pergunta:** Falha no envio de e-mail: pedidos e atendimentos deverão continuar normalmente quando uma
notificação falhar? Para avisos de reposição, a inscrição deverá ser encerrada somente após o
envio bem-sucedido, permitindo nova tentativa em caso de erro?

**Resposta:** Falha no envio de e-mail: uma falha de e-mail não bloqueará pedidos, pagamentos, entregas ou
atendimentos; o evento principal continuará normalmente e a falha da notificação será
registrada para nova tentativa. No caso específico de aviso de reposição, a inscrição será
encerrada somente após o envio bem-sucedido. Se o envio falhar, permanecerá ativa para nova
tentativa referente àquela disponibilidade, evitando que o cliente perca o aviso por uma falha
técnica.

## R12-P5

**Pergunta:** Exclusão de conta: o cliente poderá solicitar encerramento da conta? Como deverão ser
tratados seus dados pessoais e os históricos de pedidos, pagamentos e atendimentos? Se a
política de retenção ainda não estiver definida, ela poderá permanecer pendente, sem
presumirmos exclusão definitiva de todo o histórico.

**Resposta:** Exclusão de conta: o cliente poderá solicitar o encerramento da conta. Isso bloqueará novos
acessos e operações, mas não significará apagar imediatamente todos os registros
relacionados. Pedidos, pagamentos, estornos e atendimentos necessários à integridade do
histórico serão preservados, com os dados pessoais tratados conforme a política de retenção
que vier a ser definida. Como o documento não estabelece prazo ou política específica para
retenção desses dados, os prazos de anonimização/exclusão permanecem PENDENTES DE
DECISÃO. Não vamos presumir uma exclusão definitiva que poderia quebrar os históricos do
sistema.

## R12-P6

**Pergunta:** Acesso a imagens: fotos do catálogo serão públicas, enquanto evidências de troca/devolução
ficarão acessíveis somente ao cliente envolvido e à equipe autorizada? Os formatos JPEG,
PNG e WebP e o limite de 5 MB também valerão para essas evidências?

**Resposta:** Acesso a imagens: fotos de edições e exemplares destinadas ao catálogo serão públicas.
Evidências anexadas em trocas/devoluções serão privadas e acessíveis apenas ao cliente
relacionado à solicitação e aos usuários internos autorizados. Para manter uma regra
uniforme de upload, as evidências também aceitarão somente JPEG, PNG e WebP, com máximo
de 5 MB por arquivo, mantendo os limites quantitativos definidos na rodada anterior.

## R12-P7

**Pergunta:** Acessibilidade: podemos estabelecer como critérios da entrega web navegação por teclado,
foco visível, rótulos nos campos, mensagens de erro compreensíveis, contraste adequado e
descrições das imagens? No mobile, deverão existir rótulos para leitores de tela e suporte à
ampliação de texto, ou esses critérios ainda precisam de decisão?

**Resposta:** Acessibilidade: sim, podemos estabelecer esses requisitos como critérios do próprio projeto,
mesmo que não tenham sido explicitados no documento original. Na web, serão adotados
navegação por teclado, foco visível, campos com rótulos adequados, mensagens de erro
compreensíveis, contraste adequado e texto alternativo para imagens relevantes. No mobile,
os componentes interativos terão rótulos para leitores de tela e a interface deverá suportar
ampliação de texto sem impedir as operações principais. Isso será tratado como requisito não
funcional do Garimpo; não significa, porém, que exista uma exigência acadêmica específica de
conformidade com algum nível formal de WCAG, pois isso continua não informado no material
fornecido.

## R13-P1

**Pergunta:** Escopo do aplicativo: o mobile terá todas as funções destinadas ao cliente, enquanto a
administração ficará exclusivamente na web? Ou administradores e operadores também
deverão trabalhar pelo aplicativo?

**Resposta:** Escopo do aplicativo: o aplicativo mobile terá todas as funcionalidades destinadas ao cliente:
autenticação, catálogo, busca e filtros, detalhes, lista de desejos, carrinho, finalização,
pedidos, rastreamento, avaliações, avisos de disponibilidade, perfil e pós-venda. A
administração ficará exclusivamente na aplicação web. Administradores e operadores não
precisarão executar suas funções administrativas pelo aplicativo.

## R13-P2

**Pergunta:** Encerramento da conta: a solicitação terá os mesmos efeitos do bloqueio administrativo —
encerrar reservas, cancelar pedidos aguardando pagamento e preservar pedidos pagos e
atendimentos em andamento? O encerramento poderá ser revertido ou exigirá novo cadastro
para futuras compras?

**Resposta:** Encerramento da conta: terá efeitos operacionais semelhantes ao bloqueio: encerrará
reservas de finalização e cancelará pedidos ainda aguardando pagamento, liberando seus
estoques. Pedidos pagos continuarão sendo processados, assim como atendimentos de
pós-venda existentes. O encerramento será reversível mediante reativação da conta, desde
que os dados ainda estejam dentro do período de retenção. Não será necessário criar outra
conta apenas para voltar a comprar. Os prazos e condições definitivos de retenção
permanecem PENDENTES DE DECISÃO.

## R13-P3

**Pergunta:** Envios de pós-venda: a regra de uma remessa por pedido continuará valendo para o envio
original, mas cada troca terá seus próprios registros de retorno e envio do substituto, com
códigos e datas separados? Isso permitirá contar os novos sete dias a partir da entrega do
substituto.

**Resposta:** Envios de pós-venda: sim. A regra de uma remessa refere-se ao envio original do pedido. Cada
atendimento de troca possuirá registros próprios para o retorno do exemplar original e para o
envio do substituto, incluindo códigos de rastreamento, datas de postagem e datas de entrega.
A entrega do substituto iniciará um novo prazo de 7 dias para eventual atendimento daquele
exemplar, conforme definido anteriormente.

## R13-P4

**Pergunta:** Produto rejeitado na conferência: para encerrar esse atendimento, a equipe registrará a
devolução do produto ao cliente, com rastreamento? Quem assumirá esse frete na simulação,
e o que acontecerá enquanto não houver definição sobre o envio?

**Resposta:** Produto rejeitado na conferência: quando o atendimento for rejeitado após a conferência, o
produto ficará em estado “aguardando devolução ao cliente” até que a equipe registre seu
reenvio, com código de rastreamento e posteriormente a entrega. Na simulação acadêmica, o
Garimpo assumirá esse frete, simplificando o tratamento financeiro. Enquanto o reenvio não
for definido/registrado, o produto permanecerá fisicamente sob responsabilidade da loja, mas
não poderá voltar ao estoque nem ser vendido. Uma exceção que altere a decisão da
conferência continuará dependendo do administrador.

## R13-P5

**Pergunta:** Desconto superior ao valor elegível: um cupom de valor fixo será limitado ao subtotal dos
itens elegíveis, sem gerar saldo negativo ou crédito? Se os produtos ficarem gratuitos, a
compra continuará cobrando o frete normalmente?

**Resposta:** Desconto superior ao valor elegível: o desconto de um cupom de valor fixo ficará limitado ao
subtotal dos produtos elegíveis. Ele nunca produzirá valor negativo, saldo restante ou crédito
para compras futuras. Se o desconto reduzir os produtos elegíveis a zero, o pedido continuará
cobrando normalmente o frete, já que o cupom é aplicado aos produtos e não ao transporte.

## R13-P6

**Pergunta:** Cobertura de frete durante a reserva: se o cliente trocar o endereço por um CEP não
atendido, a reserva dos produtos continuará até o prazo original, permitindo corrigir o
endereço, mas impedindo criar o pedido? O valor do frete aceito ficará preservado no pedido
após sua criação?

**Resposta:** Cobertura de frete durante a reserva: se o endereço for alterado para um CEP não atendido,
os produtos continuarão reservados até o término dos 15 minutos originais, permitindo que o
cliente corrija o endereço. Enquanto não existir um endereço atendido e um frete válido, o
pedido não poderá ser criado. Quando o pedido for criado, o valor do frete aceito será
armazenado no snapshot do pedido e não será alterado posteriormente por mudanças na tabela
de frete ou no endereço cadastrado.

## R13-P7

**Pergunta:** Avaliações após pós-venda: uma avaliação já publicada permanecerá visível se a compra for
posteriormente devolvida e estornada? Uma troca da mesma unidade manterá o direito à
avaliação original, sem gerar uma avaliação adicional pelo substituto?

**Resposta:** Avaliações após pós-venda: se uma compra for posteriormente integralmente devolvida e
estornada, a avaliação relacionada deixará de ser exibida publicamente, mas será preservada
no histórico para auditoria. Em devolução parcial, avaliações referentes às unidades/edições
que permanecerem efetivamente compradas continuam válidas. Uma troca não remove a
avaliação nem concede uma avaliação adicional, pois continua representando a mesma unidade
comercial adquirida; o substituto não constitui uma nova venda nem um novo direito de
avaliação.

## R14-P1

**Pergunta:** Produtos gratuitos nos indicadores: um pedido cujos produtos ficaram gratuitos por cupom,
mas foram entregues e mantidos pelo cliente, contará nas quantidades vendidas e no
denominador do ticket médio, contribuindo com valor zero no numerador?

**Resposta:** Produtos gratuitos nos indicadores: sim. Se os produtos tiverem valor líquido zero por causa
de cupom, mas forem entregues e mantidos pelo cliente, as unidades continuam contando como
vendidas nos indicadores de quantidade e giro. O pedido também permanece no denominador do
ticket médio, contribuindo com zero no numerador. Só serão excluídos do denominador os
pedidos em que todas as unidades vendidas tenham sido posteriormente desfeitas por
cancelamento ou devolução, independentemente do valor financeiro delas.

## R14-P2

**Pergunta:** Avaliação em devolução parcial da mesma edição: se o cliente comprar duas unidades de uma
edição no mesmo pedido e devolver apenas uma, a única avaliação daquela edição continuará
pública enquanto ao menos uma unidade permanecer comprada? Se devolver todas, ela será
ocultada e uma nova avaliação para essa compra ficará impedida?

**Resposta:** Avaliação em devolução parcial da mesma edição: sim. Se duas unidades da mesma edição forem
adquiridas no mesmo pedido e apenas uma for devolvida, a única avaliação continuará pública
enquanto ao menos uma unidade daquela edição permanecer efetivamente comprada. Se todas
forem devolvidas, a avaliação será ocultada, preservada apenas no histórico, e aquela compra
não poderá gerar uma nova avaliação posteriormente.

## R14-P3

**Pergunta:** Reativação de conta encerrada: o cliente poderá reativá-la por um fluxo próprio com
confirmação pelo e-mail cadastrado, ou deverá solicitar ao administrador? Contas bloqueadas
administrativamente continuarão dependendo exclusivamente do administrador para
desbloqueio?

**Resposta:** Reativação de conta encerrada: o cliente poderá reativar voluntariamente sua conta por um
fluxo próprio, utilizando confirmação enviada ao e-mail cadastrado. Não será necessária
intervenção administrativa, desde que a conta esteja apenas encerrada pelo próprio cliente.
Uma conta bloqueada administrativamente não poderá utilizar esse mecanismo e dependerá
exclusivamente de um administrador para desbloqueio. Se a conta estiver simultaneamente
encerrada e bloqueada, o bloqueio terá precedência.

## R14-P4

**Pergunta:** Administração de configurações: somente administradores poderão alterar a tabela de frete,
regiões atendidas, promoções e cupons? Operadores poderão configurar os limites de estoque
baixo como parte da gestão de produtos e estoque?

**Resposta:** Administração de configurações: somente administradores poderão alterar tabela de frete,
regiões atendidas, promoções e cupons. Operadores poderão gerenciar produtos e estoque e,
nesse contexto, também configurar os limites de estoque baixo das edições. Alterações
relevantes continuarão registradas no log de auditoria. Essa divisão detalha as funções
administrativas originalmente previstas.

## R14-P5

**Pergunta:** Notificações de acompanhamento: além dos links de acesso, avisos de reposição e ofertas de
substituto já definidos, quais eventos deverão gerar e-mail: criação do pedido, confirmação do
pagamento, envio, entrega, cancelamento, andamento do pós-venda e resultado do estorno?
Todos esses eventos ou apenas alguns?

**Resposta:** Notificações de acompanhamento: serão enviados e-mails para os principais eventos: criação
do pedido, confirmação do pagamento, envio, entrega, cancelamento, abertura e decisão de
troca/devolução, necessidade de postagem, oferta de substituto, envio do substituto e
conclusão ou falha de estorno. Alterações intermediárias puramente internas não gerarão
e-mail. Como definido anteriormente, uma falha de envio da mensagem não impedirá a operação
principal.

## R14-P6

**Pergunta:** Dados desconhecidos do catálogo: informações como país de prensagem, ano da edição,
gramatura e número de catálogo poderão ficar como “não informado” quando desconhecidas,
especialmente em usados? Quais dados e fotos serão indispensáveis para colocar uma edição
ou exemplar à venda?

**Resposta:** Dados desconhecidos do catálogo: país de prensagem, ano da edição, gramatura e número de
catálogo poderão ficar como “não informado” quando realmente desconhecidos, principalmente
em usados. Para publicar uma edição serão obrigatórios título, pelo menos um artista,
formato, gênero principal e pelo menos uma imagem. Para colocar um exemplar usado à venda
serão obrigatórios também preço, classificação Goldmine da mídia, classificação da capa,
descrição das particularidades/defeitos e pelo menos uma foto própria do exemplar. Dados
complementares poderão ser adicionados posteriormente. Isso mantém o detalhamento de
catálogo exigido pelo projeto sem impedir o cadastro de usados cuja procedência completa
seja desconhecida.

## R14-P7

**Pergunta:** Escolha da integração de pagamento: para o planejamento inicial, podemos definir um
simulador local que reproduza aprovação, recusa, vencimento, confirmação tardia e falha de
estorno, mantendo a integração substituível? Ou é necessário usar o sandbox de um gateway
específico, cuja escolha ficará pendente?

**Resposta:** Escolha da integração de pagamento: para a primeira versão, vamos definir um simulador local
de gateway de pagamento, capaz de reproduzir aprovação, recusa, pagamento pendente,
vencimento, confirmação tardia e falha de estorno. A integração será isolada por uma
interface/serviço substituível, permitindo trocar o simulador por um gateway real ou
sandbox posteriormente sem alterar as regras de negócio. Isso atende à arquitetura prevista,
que justamente busca permitir a substituição do gateway sem reescrever essas regras. A
escolha de um gateway externo específico não será requisito da primeira versão; portanto,
não precisamos mantê-la como pendência para implementar o projeto.
