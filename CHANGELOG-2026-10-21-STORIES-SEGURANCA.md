# PurperZone — Stories, publicações e segurança (21/10/2026)

## O que foi acrescentado
- Área de Stories no Painel Principal, com publicação de texto/link de mídia e expiração prevista em 24 horas.
- Compositor de publicação redesenhado, com seletor de tipo: social/entretenimento, código, projeto e games/lazer.
- Filtros do painel para conteúdo social, código/projetos e games/lazer. A visualização “Tudo” mantém os tipos misturados por data.
- Configuração de verificação em duas etapas com autenticador TOTP via Supabase Auth MFA.
- Campo privado de e-mail secundário, separado do e-mail principal da conta.
- Comentários estruturados nos componentes novos e migration SQL com RLS para Stories e e-mail secundário.

## Ação obrigatória no Supabase
Execute `supabase/stories-and-account-security.sql` no SQL Editor do projeto antes de testar Stories e e-mail secundário. O script cria as tabelas, índices, RLS e políticas restritas ao usuário autenticado.

## Segurança e limitações importantes
- O MFA é gerenciado pelo Supabase Auth; confirme no painel Supabase se MFA/TOTP está habilitado para o projeto.
- O e-mail secundário é armazenado como contato privado, mas esta entrega ainda não implementa o envio de código/link para provar posse do endereço. A interface avisa que ele não pode ser usado para recuperação até ser verificado.
- Stories expiram logicamente em 24 horas e deixam de aparecer nas consultas. A linha antiga não é apagada automaticamente; pode-se adicionar uma rotina agendada de limpeza posteriormente.
- O campo de mídia aceita link HTTP/HTTPS, não faz upload de arquivo. Upload direto para Storage precisa de bucket e políticas próprios.
- Não foi possível aplicar a migration ao projeto Supabase a partir deste ZIP. O SQL deve ser executado no painel e o fluxo deve ser testado com duas contas reais.
