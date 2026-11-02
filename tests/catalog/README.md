# Validação do catálogo — TASK-008

Use o runtime Linux Node 24.22.1/npm 11 e o ambiente PostgreSQL protegido já preparado. Da raiz do projeto no Ubuntu:

```bash
export PATH="$HOME/.local/share/garimpo/node-v24.22.1-linux-x64/bin:$PATH"
source "$HOME/.local/share/garimpo/postgres17/environment.sh"
npm run verify
```

O comando inclui test:catalog. O runner aceita somente banco separado garimpo_test em loopback, cria schema task008_UUID novo e aplica migrations existentes sem reset/drop/truncate. Schemas e evidências permanecem para conferência. Não usar credenciais ou dados originais nos testes. As chaves TLS, sessões sintéticas e imagens desta suíte ficam em diretórios temporários fora do Git; não compartilhar esses diretórios.

Cobertura de API: catálogo público e rascunhos administrativos; ADMIN/OPERATOR web, negativa USER/mobile/HTTP/Origin/CSRF; metadados, artistas por faixa, anos independentes/desconhecidos, filtros combinados por oferta, consulta paginada; publicação com foto própria; usados individuais; revisão e idempotência do estoque inicial; bytes/tipos/limites de imagem; arquivos públicos somente por chave gerada; inativação e exclusão com FKs restritivas. Uma tabela de prova criada só no schema de teste demonstra preservação de referências; não representa implementação antecipada de pedidos, reservas ou avaliações.

Três testes de concorrência usam dois clientes/serviços de banco independentes. Uma terceira conexão mantém o lock da edição até observar ambas as aplicações esperando locks em pg_stat_activity. Só então libera: limite de dez fotos, preservação da última foto e repetição idempotente de criação de oferta. Não são mocks sequenciais. Arquivos são persistidos antes da transação e não há I/O externo no callback repetido; órfãos imutáveis aguardam a política de coleta/backup futura.

Testes unitários adicionais em tests/media verificam JPEG/PNG/WebP por decodificação real, metadados removidos, hash/chave imutável, MIME falso, arquivo truncado, fronteira exata de 5.000.000 bytes e dimensões/pixels. tests/catalog/validation cobre contratos, Goldmine, moeda, estoque e áudio HTTPS opcional. A configuração unitária limita workers a dois para conter memória; mantém asserções e limites dos testes e não reduz concorrência transacional.

Estado real e resultados executados ficam em TASKS.md. Navegação/CRUD pela interface web pertencem à TASK-009; catálogo público web/mobile às TASK-010/011; pedidos/reservas e histórico comercial completo aos incrementos/checkpoints correspondentes. Não atribuir a esta suíte inspeção humana de UI, leitor de tela ou execução nativa.
