# Confirmação de e-mail

O cadastro usa `supabase.auth.signUp()` com `emailRedirectTo` apontando para `confirm-email.html`. Quando a confirmação de e-mail está habilitada no Supabase Auth, o Supabase envia automaticamente a mensagem de confirmação.

## No Supabase

1. Authentication → Providers → Email: mantenha **Confirm email** habilitado.
2. Authentication → URL Configuration: adicione a URL pública do `confirm-email.html` às Redirect URLs.
3. Authentication → Email Templates → Confirm signup: personalize o assunto e o conteúdo usando `{{ .ConfirmationURL }}` ou o fluxo recomendado pelo Supabase.

O frontend também possui **Reenviar confirmação** usando `auth.resend({ type: 'signup' })`. O site usa uma resposta genérica para não revelar se um endereço de e-mail já possui conta.
