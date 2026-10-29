# PurperZone Company — Marketplace, empresas e acesso temporário a jogos

Atualizado em 22/10/2026.

## O que foi preparado no Supabase

### Segurança P0
- `public_profiles` agora lê `public_profile_cards` e usa `security_invoker = true`, respeitando a RLS da tabela de cartões.
- A política permissiva antiga `public_profile_cards_read` (que usava `true`) foi removida. A leitura passa pela regra `private.pz_can_view_profile(id)`.
- As tabelas `stories` e `account_contact_emails` foram criadas porque o frontend já as consultava, mas elas não existiam no banco conectado.
- O e-mail alternativo fica privado por RLS. Um usuário comum não consegue marcar o endereço como verificado; `verified_at` precisa ser definido por um fluxo confiável de verificação.
- As tabelas do marketplace usam RLS. Contratos, pagamentos, marcos e mudanças de estado financeiro não aceitam escrita direta do navegador.
- Status de verificação de freelancers e empresas não pode ser autodeclarado pelo próprio usuário.

### Freelance e grandes empresas

Tabelas novas:
- `freelancer_profiles`: apresentação profissional, competências, disponibilidade, portfólio e taxa horária.
- `freelance_services`: serviços que um profissional pode anunciar e vender.
- `freelance_jobs`: vagas e trabalhos publicados por clientes ou empresas.
- `freelance_proposals`: propostas dos freelancers para as vagas.
- `freelance_contracts`: escopo, valor, datas, estado e referência a checkout/pagamento.
- `freelance_milestones`: etapas de entrega de um contrato.
- `freelance_payments`: registro de pagamento, taxa da plataforma e transferência Stripe, sem dados de cartão.
- `freelance_reviews`: avaliação após contrato concluído.
- `freelance_disputes`: abertura de disputa entre as partes.
- `business_organizations` e `business_organization_members`: perfis de empresa, equipes e papéis de acesso (administração, recrutamento, cobrança e membros).

## Teste grátis de jogos

Tabelas novas:
- `game_access_offers`: define se o jogo é grátis, pago, por assinatura ou com teste seguido de compra. O teste padrão é de 5 dias, configurável por jogo.
- `game_access_entitlements`: registra o direito de acesso por usuário/jogo, datas do teste, compra e expiração.
- `start_game_trial(game_id)`: inicia o teste uma única vez por usuário e jogo. A função usa `SECURITY INVOKER`; as permissões de inserção são limitadas por RLS para impedir que o cliente declare uma compra.

**Importante:** o banco já tem a estrutura de acesso, mas a compra real ainda exige integração do checkout/webhook Stripe para conceder `active`, além de um servidor ou endpoint que confira o direito de acesso antes de entregar/abrir o jogo. Um site não consegue impedir que um usuário mantenha cópias de arquivos que já baixou. Não considere uma tela de bloqueio no frontend como proteção comercial suficiente.

## O que ainda não está concluído

1. Frontend completo do marketplace: páginas de descoberta, perfil profissional, criação de vaga/serviço, propostas, painel de contrato e avaliações.
2. Edge Functions para aceitar propostas, criar contratos e marcos, criar checkout Stripe, validar webhooks, liberar pagamentos e tratar reembolsos/disputas.
3. Stripe Connect e processo de onboarding de prestadores/empresas, incluindo verificações de identidade e requisitos fiscais aplicáveis.
4. Testes de integração com duas contas e testes de acesso cruzado/RLS.
5. Configuração do Supabase Auth para bloquear senhas vazadas: é um ajuste do painel de Auth, não uma migração SQL.

## Ativar proteção contra senhas vazadas

Abra o projeto Supabase e vá para **Authentication → Settings / Password Security**. Ative **Prevent use of leaked passwords**. A documentação informa que essa opção depende do plano Pro ou superior. Se a opção não estiver disponível, aumente o tamanho mínimo da senha e mantenha MFA, recuperação segura e proteção contra tentativas abusivas.

Link direto para as configurações de Auth: https://supabase.com/dashboard/project/yyxxtxsuixuyvshefwdz/auth/providers?provider=Email
Documentação: https://supabase.com/docs/guides/auth/password-security

## Histórico do banco remoto

As alterações foram aplicadas por migrações versionadas ao projeto Supabase conectado. O arquivo `supabase/PURPERZONE-MARKETPLACE-TRIALS.sql` é uma referência consolidada para revisão, não deve ser tratado como substituto de todo o histórico antigo do banco nem executado às cegas em um projeto vazio.

### Verificação adicional de privacidade
A revisão da sincronização dos cartões mostrou que país, estado e cidade eram copiados para o cartão público sem mascaramento por campo. A view foi ajustada para chamar uma função interna que aplica `profile_visibility_rules` por campo. A consulta de verificação retornou 2 perfis e zero valores expostos de país/estado/cidade. Isso valida esse cenário observado no banco, mas não substitui testes de autorização com duas contas reais.
