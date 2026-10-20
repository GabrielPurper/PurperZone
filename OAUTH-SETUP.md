# Google e GitHub no PurperZone

O frontend já está preparado para login e cadastro social sem pedir senha ou e-mail do PurperZone. O navegador é redirecionado para o provedor e volta para `login.html` usando PKCE.

## Supabase Auth

No projeto PurperZone, em Authentication > Providers, ative:

- Google
- GitHub

O callback OAuth dos dois provedores é:

`https://yyxxtxsuixuyvshefwdz.supabase.co/auth/v1/callback`

Em Authentication > URL Configuration, adicione o endereço público do site, incluindo a página de retorno:

`https://gabrielpurper.github.io/PurperZone/login.html`

Para desenvolvimento local, adicione também a URL local que você realmente usar.

## Google

Crie um OAuth Client do tipo Web Application no Google Cloud Console. Cadastre o callback do Supabase como Authorized redirect URI e coloque o Client ID e Client Secret no provider Google do Supabase.

## GitHub

Crie um OAuth App nas Developer Settings do GitHub. Use o callback do Supabase como Authorization callback URL e coloque o Client ID e Client Secret no provider GitHub do Supabase.

## O que o frontend faz

- Login por e-mail e senha.
- Cadastro por e-mail, nome, data de nascimento, username, senha e confirmação.
- Recuperação de senha.
- Login/cadastro com Google.
- Login/cadastro com GitHub.
- OAuth não pede senha do PurperZone.
- Após OAuth, o perfil é sincronizado no `profiles` sem criar um novo perfil para cada login.
- O Supabase Auth faz identity linking automático quando as identidades usam o mesmo e-mail verificado.
- Erros de OAuth aparecem na própria tela em vez de voltar silenciosamente para o login.
- O frontend nunca contém `service_role` ou segredo de OAuth.
