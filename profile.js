import { supabaseClient } from './supabaseClient.js';
import { requireAuth, escapeHtml } from './app.js';
const name=document.querySelector('#profile-name'),bio=document.querySelector('#profile-bio'),posts=document.querySelector('#profile-posts'),projects=document.querySelector('#profile-projects'),avatar=document.querySelector('.avatar');
async function load(){
  if(!supabaseClient){bio.textContent='Supabase indisponível.';return}
  const user=await requireAuth();if(!user)return;
  const [{data:profile},{data:userPosts},{data:userProjects}]=await Promise.all([
    supabaseClient.from('profiles').select('display_name,username,bio,avatar_url,city,state,country').eq('id',user.id).maybeSingle(),
    supabaseClient.from('posts').select('id,content,created_at,likes_count').eq('author_id',user.id).is('deleted_at',null).order('created_at',{ascending:false}).limit(12),
    supabaseClient.from('projects').select('id,name,description,tech_stack,created_at').eq('owner_id',user.id).order('created_at',{ascending:false}).limit(12)
  ]);
  const display=profile?.display_name||profile?.username||user.email?.split('@')[0]||'Perfil PurperZone';name.textContent=display;bio.textContent=profile?.bio||'Adicione uma bio nas configurações.';avatar.textContent=display.slice(0,2).toUpperCase();
  if(posts)posts.innerHTML=userPosts?.length?userPosts.map(p=>`<article class="card post-card"><div class="post-content">${escapeHtml(p.content||'')}</div><div class="post-actions"><span class="tag">♡ ${p.likes_count||0}</span><a class="btn" href="post.html?id=${p.id}">Abrir</a></div></article>`).join(''):'<div class="empty">Você ainda não publicou nada.</div>';
  if(projects)projects.innerHTML=userProjects?.length?userProjects.map(p=>`<article class="card project-card"><div class="project-cover"></div><h3>${escapeHtml(p.name)}</h3><p class="muted">${escapeHtml(p.description||'Sem descrição.')}</p></article>`).join(''):'<div class="empty">Nenhum projeto publicado ainda.</div>';
}
load();
