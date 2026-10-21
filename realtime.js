/**
 * GUIA DE MANUTENÇÃO — realtime.js
 * Objetivo: Lógica de interface e integração da página/módulo.
 * Como modificar: Leia os imports para identificar dependências. Mantenha validação de dados, tratamento de erros e escape de conteúdo inserido no HTML.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import{supabaseClient}from'./supabaseClient.js';export function subscribe(table,callback){if(!supabaseClient)return null;return supabaseClient.channel(`purperzone:${table}`).on('postgres_changes',{event:'*',schema:'public',table},callback).subscribe()}export function stop(channel){return supabaseClient?.removeChannel(channel)}
