# Pagamentos simulados e estornos automáticos

Nenhuma cobrança real. Fixtures sintéticas, HTTPS real de loopback e PostgreSQL `garimpo_test`, schema novo `task019_<uuid>` retido em cada execução. Não há fallback para base de desenvolvimento, reset ou descarte da base original.

No Ubuntu WSL preparado:

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
npm run build
npm run typecheck
npm run lint
npm test
npm run test:payments
npm run test:checkout
npm run test:cart
npm run test:pricing
npm run audit:toolchain
```

A variável TEST_DATABASE_URL vem do arquivo protegido; não copiar seu conteúdo para logs, commits ou comandos de demonstração. Se o compilador de todos os testes atingir limite de heap, usar `NODE_OPTIONS=--max-old-space-size=1536` apenas nesse processo. Isso não reduz custo criptográfico, verificações, cenários ou prazos de produção. Scripts de teste de integração criam o schema e aplicam migrations nele, nunca na base original.

As integrações exercitam captura aprovada/recusada/pendente, estoque usado único, Pix/boleto, limites de dono/papel/CSRF/origem/transporte, alteração de endereço, limite original após reinício, cobrança substituída, liberação de cupom, falha e repetição de estorno, falha de auditoria e mensagens. Corridas usam duas conexões independentes, barreira SQL e evidência de espera em pg_stat_activity; não são mocks sequenciais. Uma porta de gateway controlada por Promise comprova que a intenção já está visível e que o job pode adquirir a identidade enquanto a resposta financeira aguarda fora da transação. O processo real de CLI usa o relógio real sobre intenção criada no passado sintético; não há espera de 15 minutos nem relógio controlável pelo cliente.

Operações técnicas disponíveis no host local configurado, sem copiar tokens no celular:

```bash
npm run simulator -- payment-event <attemptId> APPROVED <eventId>
npm run simulator -- resume <attemptId>
npm run simulator -- refund-retry <refundId> SUCCEEDED <key>
npm run orders:expire
```

PENDING não avança o relógio, não renova a reserva e não confirma venda. Depois de falha, repetir a chave original consulta/retoma sua referência. Estorno FAILED continua registrado e visível na consulta do cliente; a repetição comercial exige ADMIN web, ou rotina técnica local do sistema. Este incremento não autoriza estorno de pós-venda nem entrega telas de checkout (TASK-020). Não há teste de Android/iOS físico ou leitor de tela nesta tarefa sem interface. Auditoria bruta de dependências mantém os avisos conhecidos; gate restritivo não equivale a `npm audit` limpo.
