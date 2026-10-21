/**
 * GUIA DE MANUTENÇÃO — feed.js
 * Objetivo: Painel Principal: agrega publicações, projetos e jogos em uma única linha do tempo.
 * Como modificar: Carrega conteúdo do Supabase, renderiza cartões seguros, controla curtidas/compartilhamento e fornece sugestões de pesquisa. Para mudar os tipos de conteúdo, revise renderPost/renderProject/renderGame e a consulta dentro de load().
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';
import { escapeHtml, toast, requireAuth, setButtonLoading } from './app.js';

const list=document.querySelector('#feed-list'), form=document.querySelector('#post-form');
const tabs=[...document.querySelectorAll('[data-feed-mode]')];
const searchInput=document.querySelector('#global-search'), suggestions=document.querySelector('#search-suggestions');
let user=null, mode='for-you', loading=false, searchTimer;

/**

 * Função safeDate: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

const safeDate=v=>v?new Date(v).toLocaleString('pt-BR'):'Agora';
/**
 * Transforma uma publicação em cartão HTML; preserve escapeHtml em todo texto vindo de usuários.
 */
function renderPost(post,profile,liked=false){
  const author=profile?.display_name||profile?.username||'Usuário PurperZone';
  const isReel=post.metadata?.content_type==='reel';
  const contentType=isReel?'Reel':(post.metadata?.content_type==='code'?'Código':'Publicação');
  return `<article class="card post-card interactive">
    <div class="post-meta"><span class="mini-avatar">${escapeHtml(author.slice(0,1).toUpperCase())}</span><div><strong>${escapeHtml(author)}</strong><span>${escapeHtml(safeDate(post.created_at))} · ${contentType}</span></div></div>
    <div class="post-content">${escapeHtml(post.content||'')}</div>
    ${post.metadata?.content_type==='code'?'<span class="tag">Código</span>':''}
    <div class="post-actions"><button class="btn ${liked?'liked':''}" type="button" data-like="${post.id}" aria-pressed="${liked}">♡ <span>${Number(post.likes_count)||0}</span></button><a class="btn" href="post.html?id=${encodeURIComponent(post.id)}">◌ Comentar</a><button class="btn" type="button" data-share="${post.id}">↗ Compartilhar</button></div>
  </article>`;
}
/**
 * Monta um cartão de projeto da comunidade a partir dos campos retornados pelo banco.
 */
function renderProject(x){return `<article class="card mixed-content-card"><span class="tag">Projeto</span><h3>${escapeHtml(x.name||'Projeto da comunidade')}</h3><p>${escapeHtml(x.description||'Projeto compartilhado no PurperZone.')}</p>${x.repo_url?`<a class="btn" href="${escapeHtml(x.repo_url)}" target="_blank" rel="noopener noreferrer">Abrir repositório ↗</a>`:''}<small>${escapeHtml(safeDate(x.created_at))}</small></article>`}
/**
 * Monta um cartão de jogo cadastrado pela comunidade.
 */
function renderGame(x){return `<article class="card mixed-content-card"><span class="tag">Game da comunidade</span><h3>${escapeHtml(x.name||'Jogo')}</h3><p>${escapeHtml((x.platforms||[]).join(', ')||'Descoberta da comunidade')}</p><a class="btn" href="games.html">Ver Games ↗</a></article>`}

/**

 * Busca e combina conteúdo para a aba selecionada; aqui ficam filtros, tabelas consultadas e limite de resultados.

 */

async function load(modeOverride=mode){
 if(!list||loading)return;loading=true;mode=modeOverride;list.innerHTML='<div class="empty">Atualizando o Painel Principal…</div>';
 if(!supabaseClient){list.innerHTML='<div class="empty">Não foi possível conectar ao Supabase.</div>';loading=false;return}
 user=user||await requireAuth();if(!user){loading=false;return}
 let postsQuery=supabaseClient.from('posts').select('id,author_id,content,likes_count,created_at,status,visibility,metadata').in('status',['published','unlisted']).is('deleted_at',null).order(mode==='trending'?'likes_count':'created_at',{ascending:false}).limit(24);
 if(mode==='following'){
  const {data:follows,error}=await supabaseClient.from('follows').select('following_id').eq('follower_id',user.id);
  if(error){list.innerHTML=`<div class="empty error">Não foi possível carregar quem você segue: ${escapeHtml(error.message)}</div>`;loading=false;return}
  const ids=(follows||[]).map(x=>x.following_id);
  if(ids.length)postsQuery=postsQuery.in('author_id',ids);else postsQuery=null;
 }
 const requests=[postsQuery?postsQuery:Promise.resolve({data:[],error:null}),
   supabaseClient.from('projects').select('id,owner_id,name,description,repo_url,created_at,is_public').eq('is_public',true).order('created_at',{ascending:false}).limit(8),
   supabaseClient.from('games').select('id,owner_id,name,platforms,created_at,is_public').eq('is_public',true).order('created_at',{ascending:false}).limit(5)];
 const [postRes,projectRes,gameRes]=await Promise.all(requests);
 if(postRes.error){list.innerHTML=`<div class="empty error">Não foi possível carregar publicações: ${escapeHtml(postRes.error.message)}</div>`;loading=false;return}
 const posts=postRes.data||[], ids=[...new Set(posts.map(p=>p.author_id))];let profiles={};
 if(ids.length){const {data}=await supabaseClient.from('public_profile_cards').select('id,display_name,username,avatar_url').in('id',ids);profiles=Object.fromEntries((data||[]).map(p=>[p.id,p]));}
 const postIds=posts.map(p=>p.id);let likedSet=new Set();
 if(postIds.length){const {data}=await supabaseClient.from('post_reactions').select('post_id').eq('user_id',user.id).eq('reaction_type','like').in('post_id',postIds);likedSet=new Set((data||[]).map(x=>x.post_id));}
 const entries=[
  ...posts.map(p=>({date:p.created_at,html:renderPost(p,profiles[p.author_id],likedSet.has(p.id)),kind:'post'})),
  ...((projectRes.data||[]).map(x=>({date:x.created_at,html:renderProject(x),kind:'project'}))),
  ...((gameRes.data||[]).map(x=>({date:x.created_at,html:renderGame(x),kind:'game'})))
 ].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
 list.innerHTML=entries.length?entries.map(x=>x.html).join(''):'<div class="empty"><strong>Seu painel está começando.</strong><br>Publique algo, siga pessoas ou explore Games e Projetos para descobrir a comunidade.</div>';
 bindInteractions();loading=false;
}
/**
 * Alterna a curtida no banco e atualiza o estado visual do botão.
 */
async function toggleLike(button){
 if(!user)return;const postId=button.dataset.like,liked=button.classList.contains('liked');button.disabled=true;
 try{const result=liked?await supabaseClient.from('post_reactions').delete().eq('post_id',postId).eq('user_id',user.id).eq('reaction_type','like'):await supabaseClient.from('post_reactions').insert({post_id:postId,user_id:user.id,reaction_type:'like'});if(result.error)throw result.error;
 const count=button.querySelector('span');count.textContent=Math.max(0,Number(count.textContent||0)+(liked?-1:1));button.classList.toggle('liked',!liked);button.setAttribute('aria-pressed',String(!liked));
 }catch(error){toast(error.message||'Não foi possível atualizar a curtida.','error')}finally{button.disabled=false}
}
/**
 * Registra eventos nos cartões recém-renderizados.
 */
function bindInteractions(){
 list.querySelectorAll('[data-like]').forEach(b=>b.addEventListener('click',()=>toggleLike(b)));
 list.querySelectorAll('[data-share]').forEach(b=>b.addEventListener('click',async()=>{const url=new URL(`post.html?id=${encodeURIComponent(b.dataset.share)}`,location.href).href;try{await navigator.clipboard.writeText(url);toast('Link copiado.','success')}catch{toast(url)}}));
}
form?.addEventListener('submit',async e=>{
 e.preventDefault();if(!supabaseClient)return toast('Supabase não configurado.','error');user=user||await requireAuth();if(!user)return;
 const content=String(new FormData(form).get('content')||'').trim();if(!content)return toast('Escreva algo antes de publicar.','error');
 const button=form.querySelector('button[type="submit"]');setButtonLoading(button,true,'Publicando…');
 const {error}=await supabaseClient.from('posts').insert({content,author_id:user.id,status:'published',visibility:'public',metadata:{content_type:'post'}});
 setButtonLoading(button,false);if(error)toast(error.message,'error');else{form.reset();toast('Publicação criada.','success');load(mode)}
});
tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});tab.classList.add('active');tab.setAttribute('aria-selected','true');load(tab.dataset.feedMode)}));
/**
 * Debounce da busca rápida e montagem de sugestões por categoria.
 */
function searchNow(value){
 clearTimeout(searchTimer);const q=value.trim();if(!suggestions)return;
 if(q.length<2){suggestions.hidden=true;suggestions.innerHTML='';return}
 searchTimer=setTimeout(async()=>{
  if(!supabaseClient)return;
  const term=`%${q.replace(/[%_,]/g,' ')}%`;
  const [profiles,posts,projects,games]=await Promise.all([
   supabaseClient.from('public_profile_cards').select('id,display_name,username').or(`display_name.ilike.${term},username.ilike.${term}`).limit(3),
   supabaseClient.from('posts').select('id,content,metadata').ilike('content',term).is('deleted_at',null).limit(3),
   supabaseClient.from('projects').select('id,name').ilike('name',term).limit(2),
   supabaseClient.from('games').select('id,name').ilike('name',term).limit(2)
  ]);
  const items=[
   ...(profiles.data||[]).map(x=>({type:'Contas',label:x.display_name||x.username||'Conta',url:`profile.html?id=${encodeURIComponent(x.id)}`})),
   ...(posts.data||[]).map(x=>({type:x.metadata?.content_type==='reel'?'Reels':'Publicações',label:(x.content||'Publicação').slice(0,80),url:`post.html?id=${encodeURIComponent(x.id)}`})),
   ...(projects.data||[]).map(x=>({type:'Projetos',label:x.name,url:'projects.html'})),
   ...(games.data||[]).map(x=>({type:'Games',label:x.name,url:'games.html'}))
  ];
  suggestions.innerHTML=items.length?items.map(x=>`<a class="search-suggestion" role="option" href="${x.url}"><span>${x.type}</span><strong>${escapeHtml(x.label)}</strong></a>`).join('')+`<a class="search-suggestion search-suggestion--all" href="search.html?q=${encodeURIComponent(q)}">Ver todos os resultados para “${escapeHtml(q)}” ↗</a>`:`<a class="search-suggestion search-suggestion--all" href="search.html?q=${encodeURIComponent(q)}">Pesquisar “${escapeHtml(q)}” em todas as categorias ↗</a>`;
  suggestions.hidden=false;
 },180);
}
searchInput?.addEventListener('input',()=>searchNow(searchInput.value));
document.addEventListener('click',e=>{if(!e.target.closest('.pz-searchbox')&&suggestions)suggestions.hidden=true});
document.querySelector('[data-feed-mode="for-you"]')?.setAttribute('aria-selected','true');
load();
