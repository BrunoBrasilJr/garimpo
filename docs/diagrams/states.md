# Estados e limites temporais

Estados técnicos propostos para materializar as regras do PDF. Convenção exata do instante de vencimento será ratificada em TASK-001; testar antes/no limite/depois.

## Checkout — RN-007/008

```mermaid
stateDiagram-v2
  direction LR
  [*] --> Carrinho
  Carrinho --> Ativo: reserva 15min
  Ativo --> Convertido: pedido criado
  Ativo --> Encerrado: muda itens ou cupom
  Ativo --> Expirado: prazo vencido
```

Converter significa criar pedido Pix/boleto ou criar pedido pago após cartão aprovado dentro do prazo. Recusa de cartão e mudança de endereço não renovam o prazo. Encerrado/Expirado termina aquela finalização; o carrinho continua disponível e nova reserva exige confirmação e validação. Cartão aprovado tarde não passa a Convertido: cria obrigação de estorno.

## Pedido — RN-011/015/019

```mermaid
stateDiagram-v2
  [*] --> Pendente: Pix 30min ou boleto 2 dias
  [*] --> Pago: cartao aprovado durante checkout
  Pendente --> Pago: cobranca ativa confirmada no prazo
  Pendente --> Cancelado: vencimento ou cancelamento ou bloqueio
  Pago --> Cancelado: cancelamento antes da separacao
  Pago --> EmSeparacao
  EmSeparacao --> Separado
  Separado --> Enviado
  Enviado --> Entregue
```

Devolução tem ciclo independente, inclusive solicitação pré-envio. Cancelamento parcial não torna todo pedido CANCELLED; unidades remanescentes seguem. Cobrança antiga/tardia nunca reativa Cancelado.

## Oferta de substituto — RN-022/023

```mermaid
stateDiagram-v2
  [*] --> Ofertada: reserva 48h completas
  Ofertada --> Aceita: resposta positiva
  Ofertada --> Liberada: recusa ou 48h sem resposta
  Aceita --> Liberada: postagem expirada ou reprovacao
  Aceita --> Enviada: original conferido favoravelmente
  Enviada --> Entregue: nova janela de 7 dias
```

Espera de 30 dias começa após conferência. Oferta ativa iniciada antes do fim suspende conversão, preservando 48h completas. Sem oferta/aceite após o limite, converter para devolução; não autorizar estorno automaticamente.

## Estorno — RN-041

```mermaid
stateDiagram-v2
  [*] --> AguardandoAutorizacao: pos_venda
  [*] --> Pendente: causa automatica
  AguardandoAutorizacao --> Pendente: ADMIN autoriza
  Pendente --> Concluido: sucesso simulado
  Pendente --> Falhou: falha simulada
  Falhou --> Pendente: nova tentativa autorizada
```

Falha mantém cancelamento/devolução válidos. Operador não autoriza tentativa de estorno de pós-venda.
