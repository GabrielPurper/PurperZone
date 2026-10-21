/**
 * GUIA DE MANUTENÇÃO — profile.js
 * Objetivo: Perfil do usuário autenticado ou perfil público.
 * Como modificar: Carrega dados do perfil e conteúdo relacionado. Se a linha do perfil ainda não existir, apresenta os dados de sessão como alternativa. Ao mudar campos, confirme primeiro o esquema real do Supabase e as políticas RLS.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';
import { requireAuth, escapeHtml } from './app.js';
const name=document.querySelector('#profile-name'),bio=document.querySelector('#profile-bio'),posts=document.querySelector('#profile-posts'),projects=document.querySelector('#profile-projects'),avatar=document.querySelector('.avatar');
/**
 * Busca e combina conteúdo para a aba selecionada; aqui ficam filtros, tabelas consultadas e limite de resultados.
 */
async function load(){
  if(!supabaseClient){bio.textContent='Supabase indisponível.';return}
  const user=await requireAuth();if(!user)return;
  const [{data:profile},{data:userPosts},{data:userProjects}]=await Promise.all([
    supabaseClient.from('profiles').select('display_name,username,bio,avatar_url,city,state,country').eq('id',user.id).maybeSingle(),
    supabaseClient.from('posts').select('id,content,created_at,likes_count').eq('author_id',user.id).is('deleted_at',null).order('created_at',{ascending:false}).limit(12),
    supabaseClient.from('projects').select('id,name,description,tech_stack,created_at').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(12)
  ]);
  const metadata=user.user_metadata||{};
  const display=profile?.display_name||metadata.display_name||metadata.full_name||metadata.name||profile?.username||user.email?.split('@')[0]||'Meu perfil';
  name.textContent=display;
  bio.textContent=profile?.bio||'Sua conta está conectada. Complete sua bio e seus dados em Configurações.';
  avatar.textContent=display.slice(0,2).toUpperCase();
  if(!profile){const hint=document.createElement('div');hint.className='notice';hint.innerHTML='Sua sessão está ativa, mas o perfil ainda não foi sincronizado. Você pode continuar usando a conta e completar os dados em <a href="settings.html">Configurações</a>.';name.closest('.profile-main')?.append(hint);}
  if(posts)posts.innerHTML=userPosts?.length?userPosts.map(p=>`<article class="card post-card"><div class="post-content">${escapeHtml(p.content||'')}</div><div class="post-actions"><span class="tag">♡ ${p.likes_count||0}</span><a class="btn" href="post.html?id=${p.id}">Abrir</a></div></article>`).join(''):'<div class="empty">Você ainda não publicou nada.</div>';
  if(projects)projects.innerHTML=userProjects?.length?userProjects.map(p=>`<article class="card project-card"><div class="project-cover"></div><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.description||'Sem descrição.')}</p></article>`).join(''):'<div class="empty">Nenhum projeto publicado ainda.</div>';
}
load();
