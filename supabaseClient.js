// ============================================================
// PurperZone — supabaseClient.js
// Ponto único de conexão com o Supabase. Todos os outros arquivos
// (auth.js, profile.js, projects.js, library.js) importam o
// `supabase` exportado aqui em vez de criar seus próprios clientes.
//
// Carregado via CDN (jsdelivr) direto no HTML, então este arquivo
// deve ser incluído DEPOIS da tag <script> do supabase-js.
// Quando o projeto migrar para bundler (Vite/TS), troque isso por:
//   import { createClient } from '@supabase/supabase-js'
// ============================================================

// URL do projeto Supabase "PurperZone" (org GabrielPurper).
const SUPABASE_URL = "https://yyxxtxsuixuyvshefwdz.supabase.co";

// Chave pública ("anon"/"publishable"). É segura para expor no
// front-end: ela só permite o que as políticas de RLS de cada
// tabela liberarem (ver supabase/schema.sql). NUNCA coloque aqui
// a service_role key — essa dá acesso total e deve ficar só no
// backend/servidor, nunca no navegador.
const SUPABASE_ANON_KEY =
  "sb_publishable_Ar4MC4Reji8rA1mThhWEDw_f01gZDNg";

// `window.supabase` vem do script global carregado no <head>:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
