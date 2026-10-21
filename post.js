/**
 * GUIA DE MANUTENÇÃO — post.js
 * Objetivo: Lógica de interface e integração da página/módulo.
 * Como modificar: Leia os imports para identificar dependências. Mantenha validação de dados, tratamento de erros e escape de conteúdo inserido no HTML.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import{supabaseClient}from'./supabaseClient.js';import{escapeHtml,requireAuth,toast,setButtonLoading}from'./app.js';
const id=new URLSearchParams(location.search).get('id');const detail=document.querySelector('#post-detail'),comments=document.querySelector('#comments-list'),form=document.querySelector('#comment-form');let user=null;
/**
 * Busca e combina conteúdo para a aba selecionada; aqui ficam filtros, tabelas consultadas e limite de resultados.
 */
async function load(){if(!detail)return;if(!supabaseClient||!id){detail.innerHTML='<div class="empty">Informe o id da publicação.</div>';return}const{data,error}=await supabaseClient.from('posts').select('id,author_id,content,created_at,likes_count,comments_enabled,status,visibility').eq('id',id).single();if(error||!data){detail.innerHTML='<div class="empty">Publicação não encontrada.</div>';return}const{data:profile}=await supabaseClient.from('public_profile_cards').select('display_name,username,avatar_url').eq('id',data.author_id).maybeSingle();user=await requireAuth();let liked=false;if(user){const{data:r}=await supabaseClient.from('post_reactions').select('id').eq('post_id',id).eq('user_id',user.id).eq('reaction_type','like').maybeSingle();liked=Boolean(r)}detail.innerHTML=`<article class="card post-card"><div class="post-meta"><span class="mini-avatar">${escapeHtml((profile?.display_name||profile?.username||'U').slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(profile?.display_name||profile?.username||'Usuário')}</strong><span>${new Date(data.created_at).toLocaleString('pt-BR')}</span></div></div><div class="post-content">${escapeHtml(data.content||'')}</div><div class="post-actions"><button class="btn ${liked?'liked':''}" data-like-post aria-pressed="${liked}">♡ <span>${data.likes_count||0}</span></button><button class="btn" data-share-post>Compartilhar</button></div></article>`;
detail.querySelector('[data-like-post]')?.addEventListener('click',toggleLike);detail.querySelector('[data-share-post]')?.addEventListener('click',share);loadComments(data.comments_enabled);
}
/**
 * Alterna a curtida no banco e atualiza o estado visual do botão.
 */
async function toggleLike(){if(!user)return;const b=detail.querySelector('[data-like-post]'),liked=b.classList.contains('liked');b.disabled=true;try{if(liked){const{error}=await supabaseClient.from('post_reactions').delete().eq('post_id',id).eq('user_id',user.id).eq('reaction_type','like');if(error)throw error}else{const{error}=await supabaseClient.from('post_reactions').insert({post_id:id,user_id:user.id,reaction_type:'like'});if(error)throw error}const c=b.querySelector('span');c.textContent=Math.max(0,Number(c.textContent)+(liked?-1:1));b.classList.toggle('liked',!liked)}catch(e){toast(e.message,'error')}finally{b.disabled=false}}
/**
 * Função share: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
async function share(){try{await navigator.clipboard.writeText(location.href);toast('Link copiado.','success')}catch{toast(location.href)}}
/**
 * Função loadComments: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
async function loadComments(enabled=true){if(!comments)return;if(!enabled){comments.innerHTML='<div class="empty">Os comentários estão desativados nesta publicação.</div>';return}const{data,error}=await supabaseClient.from('post_comments').select('id,author_id,content,created_at').eq('post_id',id).eq('status','published').is('deleted_at',null).order('created_at',{ascending:true}).limit(100);if(error){comments.innerHTML=`<div class="empty error">${escapeHtml(error.message)}</div>`;return}const ids=[...new Set((data||[]).map(x=>x.author_id))];let profiles={};if(ids.length){const{data:p}=await supabaseClient.from('public_profile_cards').select('id,display_name,username').in('id',ids);profiles=Object.fromEntries((p||[]).map(x=>[x.id,x]))}comments.innerHTML=(data||[]).map(c=>`<article class="item"><strong>${escapeHtml(profiles[c.author_id]?.display_name||profiles[c.author_id]?.username||'Usuário')}</strong><p>${escapeHtml(c.content)}</p><small class="muted">${new Date(c.created_at).toLocaleString('pt-BR')}</small></article>`).join('')||'<div class="empty">Seja a primeira pessoa a comentar.</div>'}
form?.addEventListener('submit',async e=>{e.preventDefault();user=user||await requireAuth();if(!user)return;const content=form.content.value.trim();if(!content)return;const b=form.querySelector('button[type="submit"]');setButtonLoading(b,true,'Enviando...');const{error}=await supabaseClient.from('post_comments').insert({post_id:id,author_id:user.id,content,status:'published'});setButtonLoading(b,false);if(error)toast(error.message,'error');else{form.reset();toast('Comentário publicado.','success');loadComments(true)}});
load();
