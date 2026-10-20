/* Cliente público do PurperZone. Nunca use service_role/secret key no navegador. */
const SUPABASE_URL = window.PURPERZONE_SUPABASE_URL || 'https://yyxxtxsuixuyvshefwdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = window.PURPERZONE_SUPABASE_KEY || 'sb_publishable_Ar4MC4Reji8rA1mThhWEDw_f01gZDNg';

export const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}}) || null;
export { SUPABASE_URL };
