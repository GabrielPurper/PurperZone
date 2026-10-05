# PurperZone — GitHub Pages

Todos os arquivos do frontend estão na raiz deste pacote para facilitar o envio direto ao repositório GitHub Pages.

- HTML/CSS/JS funcionam diretamente no navegador.
- Os arquivos `.ejs` ficam na raiz como templates de referência. O GitHub Pages não executa EJS no servidor.
- `service_role` e segredos do Stripe não ficam no frontend. Operações privilegiadas usam Supabase Edge Functions.
