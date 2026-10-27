# Evidências reais selecionadas

Logs copiados do computador de desenvolvimento, sem alterações. Datas/horários internos são os dos processos originais; não confundir com horário da montagem do ZIP. Não incluem arquivos privados de fixture, senhas, códigos ou perfis de navegador.

- verify-final.log.txt: build/tipos/lint, 31 unitários/protocolo e 39 integrações backend aprovados. A política restrita de auditoria passou; npm audit bruto continuou FAIL, quatro high conhecidos, com patch aprovado. Não afirmar auditoria limpa.
- android-final.log.txt: bundle de produção Android aprovado.
- browser-02.log.txt: TLS sem CA negado e fluxo cliente aprovados; a rodada falhou depois ao obter mensagem. Não é rodada integral aprovada.
- browser-03.log.txt: recuperação/alteração aprovadas; a rodada falhou depois por foco do erro. Histórico preservado.
- browser-04.log.txt: foco/zoom/teclado, relay HTTPS e OPERATOR aprovados; ADMIN teve timeout por rótulo. Histórico preservado.
- browser-05.log.txt: build e ADMIN aprovados após correção do rótulo.
- manual-clock-fix.log.txt: dois novos casos de relógio aprovados; tipos/lint dirigidos tiveram exit 0 registrado em TASKS.md.
- manual-clock-e2e.log.txt: recuperação/alteração revalidadas após correção do relógio manual.
- active-message-fix.log.txt: cenário existente ampliado com reenvio e seleção de token ativo, aprovado; tipos/lint dirigidos tiveram exit 0 registrado em TASKS.md.

Contagem acumulada sem duplicar reexecuções: 33 unitários/protocolo/relógio + 39 integrações + sete E2E/HTTPS = 79 casos distintos aprovados. Aceites humanos e limitações estão em TASKS.md e LEIA-ME-ENTREGA.md. O checkpoint TASK-007 deve executar a validação acumulada própria; ele não foi realizado nesta entrega.

Cópia versionada para avaliação no GitHub em 26/10/2026. Os logs recebem a extensão .log.txt para serem versionados sem alterar a política geral de ignorar logs locais. Conteúdo original preservado byte a byte; não há reexecução de testes nesta publicação.
