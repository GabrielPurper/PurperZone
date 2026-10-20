# Relatório de desempenho do Supabase — 18/10/2026

## Alterações aplicadas e verificadas

- Foram adicionados 20 índices para colunas usadas como chaves estrangeiras, abrangendo áreas de administração/configuração, aplicativos, carrinho e pedidos, pagamentos, eventos, notificações promocionais, busca, Jarvis, OAuth e estado de áudio.
- A consulta de verificação retornou **0 colunas de chave estrangeira sem índice correspondente**, entre **154 restrições de chave estrangeira** examinadas nos schemas `public` e `private`.
- Nenhum índice preexistente foi removido e nenhuma política RLS foi alterada nesta etapa.
- O SQL de referência está em `supabase/performance-indexes.sql`.

## O que isso melhora

Os índices podem reduzir o custo de localizar linhas relacionadas durante joins, exclusões/atualizações da linha referenciada e consultas filtradas por essas colunas. O ganho real depende do padrão de consultas e do volume de dados; ainda não foi medido um percentual de aceleração por benchmark antes/depois.

## Alertas que permanecem

- O Performance Advisor apontou grupos de políticas RLS permissivas sobrepostas. É necessário revisar o predicado e o comportamento de cada política antes de consolidá-las, para não interromper funcionalidades nem ampliar acesso.
- A tabela `private.audit_logs` foi sinalizada com RLS desabilitado. **Ela não foi alterada automaticamente**: antes de habilitar RLS, deve-se confirmar como os serviços internos inserem os registros e como administradores autorizados os consultam, para evitar bloquear auditoria ou abrir acesso indevido.
- O relatório do advisor indicou muitos índices sem uso observado. Índices recém-criados também aparecem como não utilizados até que exista tráfego relevante. Não foram removidos índices com base apenas nessa métrica.

## Próximos passos recomendados

1. Capturar consultas lentas e seus planos (`EXPLAIN (ANALYZE, BUFFERS)`) em um ambiente representativo.
2. Medir consultas do feed, mensagens, notificações e biblioteca antes/depois.
3. Revisar as políticas RLS sobrepostas com testes de usuário anônimo, usuário comum e administrador.
4. Definir políticas específicas para `private.audit_logs` com base no fluxo real de leitura e escrita antes de habilitar RLS.
5. Avaliar índices não utilizados após um período de tráfego representativo, levando em conta constraints, relatórios e consultas administrativas.

## Observação de implantação

Os índices já foram aplicados diretamente no projeto Supabase conectado durante esta conversa. O arquivo SQL no ZIP documenta e reproduz a alteração; não é necessário executá-lo novamente no mesmo projeto. Ele usa `IF NOT EXISTS` para facilitar o uso em outros ambientes.
