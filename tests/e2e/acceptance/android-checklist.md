# Conferência nativa pendente — TASK-033

Usar Android e Expo Go compatível com o SDK 57 do projeto. Registrar modelo,
versão do Android e do Expo Go. O agente prepara uma sessão nova com dados
sintéticos, catálogo, endereço coberto e pedidos/atendimentos de teste. URLs
antigas de Metro/túnel não devem ser reutilizadas. Não iniciar túnel enquanto
o aparelho não estiver disponível. Administração e caixa técnica ficam locais.

1. Entrar com a conta sintética fornecida; fechar/reabrir o app e conferir a
   recuperação da sessão. Ao sair, conferir que dados privados deixam de aparecer.
2. Buscar por artista/faixa, combinar filtros, abrir edição e escolher novo/usado;
   conferir fotos, conservação e comportamento quando o áudio não estiver disponível.
3. Salvar/remover desejo e criar/cancelar alerta sem que essas ações reservem estoque.
4. Adicionar ao carrinho, alterar quantidade e conferir valores; reservar somente
   após confirmação. Retomar a mesma finalização sem renovar seu prazo.
5. Escolher endereço, cotar/aceitar frete, confirmar dados e simular pagamento.
   Conferir resultado e pedido no histórico; nenhuma cobrança real ocorre.
6. Nos pedidos entregues preparados para o ensaio, abrir atendimento por unidade,
   anexar foto e acompanhar devolução/estorno falho; em outra unidade, conferir
   oferta de substituto e enviar resposta. Não misturar os dois atendimentos na
   mesma unidade. Os dados de logística são registrados pela equipe no ambiente local.
7. Ampliar a fonte do sistema, anotando o ajuste anterior, e conferir leitura,
   campos e botões de catálogo, conta, carrinho, compra e pós-venda. Restaurar o
   ajuste anterior depois. Registrar qualquer corte ou ação inacessível.

O responsável recusou TalkBack; ele não faz parte deste roteiro e não será marcado
como aprovado. A inspeção de rótulos nos testes automáticos não substitui leitor.
Não se declara iOS físico a partir de Android/RNW/bundle.

Informar os passos executados e resultados reais. “Não executado” é diferente de
“funcionou”. Não enviar senha, token, código de e-mail ou QR no chat/relatório.
Encerrar o ambiente e os encaminhamentos temporários depois da conferência.

## Sessão local com Expo Go pelo Wi-Fi

Quando houver autorização para o túnel desta conferência, rodar no Ubuntu
`GARIMPO_ANDROID_TUNNEL=1 GARIMPO_ANDROID_ACCEPTANCE_DIR=<diretório-novo> npx playwright test --config tests/e2e/acceptance/android.config.ts`.
O diretório precisa estar sob `test-results/acceptance/android-live-*` no
workspace Windows. O roteiro reutiliza o PostgreSQL de teste, prepara dois
pedidos entregues e grava a origem HTTPS e a conta fictícia em
`android-ready.json`. Não versionar esses dados.

Iniciar Metro com essa origem em `EXPO_PUBLIC_API_ORIGIN`, usando a rede
local para o bundle. Abrir no Android somente o endereço Metro da execução
atual. Registrar evidências humanas separadamente dos controles do túnel.
Ao concluir, gravar `stop` em `stop.txt` no diretório da sessão, encerrar
Metro e remover o encaminhamento temporário. O processo do túnel tem limite
de 45 minutos.
