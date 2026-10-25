# ER — contas, catálogo e engajamento

Detalhes em [modelo de dados](../architecture/data-model.md); RN-001/025/036/045. Quatro vistas do mesmo modelo, com entidades repetidas para leitura. Campos opcionais e restrições completas estão na tabela de dados.

## Contas e credenciais

```mermaid
erDiagram
  User ||--o{ Session : possui
  User ||--o{ EmailToken : confirma
  User ||--o{ PasswordReset : recupera
  User ||--o{ Address : cadastra
  User {
    string id PK
    string context
    string role
    datetime blockedAt
    datetime closedAt
  }
```

USER compra; ADMIN/OPERATOR são internos. Tokens não guardam segredo em claro. Contexto, papel e estado são verificados nas operações.

## Edições, artistas, faixas e imagens

```mermaid
erDiagram
  Edition ||--|{ EditionArtist : artistas
  Artist ||--o{ EditionArtist : participa
  Edition ||--|{ EditionGenre : classifica
  Genre ||--o{ EditionGenre : associa
  Genre ||--o{ Edition : principal
  Edition ||--o{ Track : faixas
  Track ||--o{ TrackArtist : artistas
  Artist ||--o{ TrackArtist : participa
  Edition ||--o{ Offer : ofertas
  Edition |o--o{ ProductImage : imagens
  Offer |o--o{ ProductImage : fotos_proprias
  Edition {
    string id PK
    int originalYear
    int editionYear
    string format
    string primaryGenreId FK
  }
```

ProductImage tem dono exclusivo edição OU oferta. Ano original e ano da edição são distintos; campos desconhecidos seguem a tabela de dados. Evidências de pós-venda não são fotos públicas.

## Avaliações

```mermaid
erDiagram
  User ||--o{ Review : escreve
  Order ||--o{ Review : habilita
  Edition ||--o{ Review : recebe
  Review ||--o{ ReviewRevision : preserva
  Review {
    string id PK
    string userId FK
    string editionId FK
    string orderId FK
    string moderationState
  }
```

Review é única por cliente/edição/pedido.

## Desejos e alertas

```mermaid
erDiagram
  direction LR
  Edition ||--o{ AvailabilityAlert : alvo
  User ||--o{ AvailabilityAlert : inscreve
  User ||--o{ WishlistEntry : deseja
  Edition ||--o{ WishlistEntry : alvo
```

Desejo não reserva nem ativa alerta; alerta NEW/USED/ANY encerra somente após entrega bem-sucedida.
