/**
 * GUIA DE MANUTENÇÃO — apps.js
 * Objetivo: Lógica de interface e integração da página/módulo.
 * Como modificar: Leia os imports para identificar dependências. Mantenha validação de dados, tratamento de erros e escape de conteúdo inserido no HTML.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import{supabaseClient}from'./supabaseClient.js';import{escapeHtml}from'./app.js';const list=document.querySelector('#apps-list');async function load(){if(!list)return;if(!supabaseClient){list.innerHTML='<div class="empty">Supabase não configurado.</div>';return}const{data}=await supabaseClient.from('apps').select('*').order('created_at',{ascending:false});list.innerHTML=(data||[]).map(x=>`<article class="card"><span class="tag">App</span><h3>${escapeHtml(x.name||x.title)}</h3><p class="muted">${escapeHtml(x.description||'')}</p></article>`).join('')||'<div class="empty">Nenhum aplicativo publicado.</div>'}load();
