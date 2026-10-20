# PurperZone — GitHub Pages

Todos os arquivos principais do frontend ficam na raiz para facilitar o deploy direto no GitHub Pages.

- HTML/CSS/JS funcionam diretamente no navegador.
- `.ejs` são templates de referência e não são executados pelo GitHub Pages.
- O frontend usa somente a chave pública do Supabase.
- `service_role`, segredos OAuth e segredos do Stripe nunca devem ser publicados.
- Operações privilegiadas devem usar Supabase Edge Functions.
