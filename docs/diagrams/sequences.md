# Sequências principais

## Checkout e Pix/boleto — RN-006/007/011/017

```mermaid
sequenceDiagram
  actor C as Cliente
  participant API
  participant DB as Transacao
  participant SIM as Simulador
  C->>API: confirmar carrinho e iniciar checkout
  API->>DB: validar limite, saldo, preco e cupom
  alt falha de algum item
    DB-->>API: rollback de todo conjunto
    API-->>C: avisar alteracoes e pedir confirmacao
  else conjunto valido
    DB-->>API: checkout 15min, reservas e uso temporario
    API-->>C: checkout e prazo unico
    C->>API: criar pedido Pix ou boleto
    API->>DB: validar email/endereco e transferir reservas
    DB-->>API: pedido, cobranca e uso definitivo do cupom
    API-->>C: prazo integral por metodo
    SIM->>API: evento de pagamento com chave
    API->>DB: revalidar cobranca, estado e prazo
    alt pagamento valido
      DB-->>API: pago e estoque baixado
    else tardio ou cobranca invalidada
      DB-->>API: obrigacao de estorno, sem reativar pedido
    end
  end
```

## Cartão — RN-012/013

```mermaid
sequenceDiagram
  actor C as Cliente
  participant API
  participant SIM as Simulador
  participant DB
  C->>API: tentar cartao no checkout
  API->>SIM: executar cenario
  SIM-->>API: resultado
  API->>DB: registrar tentativa e revalidar checkout
  alt recusado
    API-->>C: sem pedido, mesmo prazo restante
  else aprovado no prazo
    API->>DB: criar pedido pago e baixar estoque atomicamente
    API-->>C: pedido criado
  else aprovado depois do prazo
    API->>DB: registrar estorno da tentativa sem pedido
    API-->>C: checkout expirado, reembolso acompanhado
  end
```

## Troca — RN-020/022/023/040

```mermaid
sequenceDiagram
  actor C as Cliente
  participant E as Equipe
  participant API
  C->>API: abrir troca por unidade
  E->>API: aprovar e definir postagem em 7 dias
  E->>API: oferecer equivalente da mesma edicao
  API-->>C: oferta com 48h completas
  C->>API: aceitar substituto
  E->>API: receber e conferir original
  alt conferencia favoravel
    E->>API: enviar substituto aceito
    E->>API: registrar entrega
    API-->>C: nova janela de 7 dias
  else reprovado
    API->>API: liberar reserva e manter produto fora do estoque
    E->>API: registrar reenvio ao cliente
  end
```

Oferta pode preceder retorno; envio não. Sem equivalente, espera formal começa após conferência; conversão em devolução não dispensa ADMIN para estorno.

## Notificação — RN-024/042

```mermaid
sequenceDiagram
  participant API
  participant DB
  participant W as Processador
  participant M as Canal de teste
  API->>DB: negocio e evento no mesmo commit
  W->>DB: ler evento pendente
  W->>M: entregar com chave de deduplicacao
  alt sucesso
    W->>DB: marcar entregue e encerrar alerta se aplicavel
  else falha
    W->>DB: registrar tentativa e manter alerta ativo
  end
```
