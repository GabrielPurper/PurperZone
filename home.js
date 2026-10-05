import { DB, query, supabase } from '../api/supabase.js';
import { escapeHTML, formatDate, subscribeTable, toast } from '../app.js';

export async function initHome(){
  const stats=[['profiles','profiles-count'],['projects','projects-count'],['posts','posts-count']];
  await Promise.all(stats.map(async([table,id])=>{try{const rows=await query(table,{select:'id',limit:1000}); const el=document.getElementById(id); if(el)el.textContent=rows.length+(rows.length===1000?'+':'')}catch{}}));
  const host=document.querySelector('#recent-feed'); if(!host)return;
  try{
    const posts=await query(DB.posts,{select:'id,author_id,content,image_url,created_at,likes_count,status,profiles:author_id(id,username,display_name,avatar_url)',order:{column:'created_at',ascending:false},limit:6});
    const visible=posts.filter(p=>p.status==='published');
    host.innerHTML=visible.length?visible.map(postCard).join(''):`<div class="empty-state">Ainda não há publicações públicas.</div>`;
    subscribeTable(DB.posts,()=>location.reload());
  }catch(e){host.innerHTML='<div class="empty-state">Não foi possível carregar o feed agora.</div>'}
}
function postCard(p){return `<article class="post-card card"><div class="post-card__author"><img class="avatar" src="${escapeHTML(p.profiles?.avatar_url||'https://ui-avatars.com/api/?name=P&background=151b22&color=fff')}" alt=""><div><strong>${escapeHTML(p.profiles?.display_name||p.profiles?.username||'Usuário')}</strong><span>@${escapeHTML(p.profiles?.username||'usuario')}</span></div></div><p>${escapeHTML(p.content||'')}</p>${p.image_url?`<img class="post-card__image" src="${escapeHTML(p.image_url)}" alt="Imagem da publicação" loading="lazy">`:''}<div class="post-card__meta"><time>${formatDate(p.created_at)}</time><span>♡ ${p.likes_count||0}</span></div></article>`}
