/**
 * GUIA DE MANUTENÇÃO — supabaseClient.js
 * Objetivo: Inicialização do cliente Supabase usado pelas páginas.
 * Como modificar: Define a conexão do frontend com Supabase. Somente a chave pública/anon pode ficar no navegador; nunca coloque service_role, senhas ou tokens privados neste arquivo.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

/* Cliente público do PurperZone. Nunca use service_role/secret key no navegador. */
const SUPABASE_URL = window.PURPERZONE_SUPABASE_URL || 'https://yyxxtxsuixuyvshefwdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = window.PURPERZONE_SUPABASE_KEY || 'sb_publishable_Ar4MC4Reji8rA1mThhWEDw_f01gZDNg';

export const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}}) || null;
export { SUPABASE_URL };
