import { DB, query, insert } from '../api/supabase.js';
import { requireAuth, escapeHTML, formatDate, toast } from '../app.js';

export async function initPost(){
  const user=await requireAuth(); if(!user)return;
  const id=new URLSearchParams(location.search).get('id');
  if(!id){location.href='feed.html';return}
  const host=document.querySelector('#post-detail');
  try{
    const posts=await query(DB.posts,{eq:{id},limit:1});
    const post=posts[0]; if(!post){host.innerHTML='<div class="empty-state">Publicação não encontrada.</div>';return}
    const profiles=await query(DB.profiles,{eq:{id:post.author_id},limit:1});
    const profile=profiles[0];
    host.innerHTML=`<article class="post-card card"><div class="post-card__author"><img class="avatar" src="${escapeHTML(profile?.avatar_url||'https://ui-avatars.com/api/?name=P&background=151b22&color=fff')}" alt=""><div><strong>${escapeHTML(profile?.display_name||profile?.username||'Usuário')}</strong><span>@${escapeHTML(profile?.username||'usuario')} · ${formatDate(post.created_at)}</span></div></div><p>${escapeHTML(post.content||'')}</p>${post.image_url?`<img class="post-card__image" src="${escapeHTML(post.image_url)}" alt="">`:''}</article>`;
    await loadComments(id);
    document.querySelector('#comment-form').onsubmit=async e=>{e.preventDefault();const content=e.currentTarget.content.value.trim();if(!content)return;try{await insert(DB.comments,{post_id:id,author_id:user.id,content,status:'published',moderation_status:'clear'});e.currentTarget.reset();toast('Comentário publicado.','success');loadComments(id)}catch(err){toast(err.message,'error')}};
  }catch(e){host.innerHTML='<div class="empty-state">Não foi possível carregar a publicação.</div>'}
}
async function loadComments(postId){const host=document.querySelector('#comments-list');try{const rows=await query(DB.comments,{eq:{post_id:postId},order:{column:'created_at',ascending:true},limit:100});const profiles=await query(DB.profiles,{limit:500});const map=new Map(profiles.map(p=>[p.id,p]));host.innerHTML=rows.filter(c=>c.status==='published'&&!c.deleted_at).map(c=>{const p=map.get(c.author_id);return `<article class="comment card"><strong>${escapeHTML(p?.display_name||p?.username||'Usuário')}</strong><small>@${escapeHTML(p?.username||'usuario')} · ${formatDate(c.created_at)}</small><p>${escapeHTML(c.content||'')}</p></article>`}).join('')||'<div class="empty-state">Seja a primeira pessoa a comentar.</div>'}catch(e){host.innerHTML='<div class="empty-state">Não foi possível carregar os comentários.</div>'}}
