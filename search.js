/**
 * GUIA DE MANUTENÇÃO — search.js
 * Objetivo: Pesquisa global com resultados em tempo real por categoria.
 * Como modificar: Controla o campo de busca, filtros e consultas a perfis, posts, Reels, projetos, games e apps. Para adicionar uma categoria, inclua uma consulta, transforme os registros em entries e conecte o valor ao filtro data-search-type.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import {supabaseClient} from './supabaseClient.js';
import {escapeHtml} from './app.js';
const input=document.querySelector('#search-query'),list=document.querySelector('#search-results'),clear=document.querySelector('#clear-search');
const filterButtons=[...document.querySelectorAll('[data-search-type]')];
let activeType='all',timer;
const params=new URLSearchParams(location.search);
/**
 * Função safe: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
const safe=(v)=>escapeHtml(v??'');
/**
 * Renderiza um item de resultado com texto escapado.
 */
function item(type,title,description,url,meta=''){
 return `<article class="card search-result-card"><span class="tag">${safe(type)}</span><h3>${safe(title)}</h3><p>${safe(description||'')}</p>${meta?`<small class="muted">${safe(meta)}</small>`:''}<a class="btn" href="${url}">Abrir ↗</a></article>`;
}
/**
 * Executa a pesquisa global e aplica o filtro ativo.
 */
async function search(){
 const q=input.value.trim();clearTimeout(timer);
 if(q.length<2){list.innerHTML='<div class="empty">Digite pelo menos 2 caracteres para pesquisar.</div>';return}
 if(!supabaseClient){list.innerHTML='<div class="empty">Supabase não está disponível.</div>';return}
 list.innerHTML='<div class="empty">Procurando em contas, publicações, Reels, games, projetos e códigos…</div>';
 const term=`%${q.replace(/[%_,]/g,' ')}%`;
 const [profiles,posts,projects,games,apps]=await Promise.all([
  supabaseClient.from('public_profile_cards').select('id,display_name,username,bio').or(`display_name.ilike.${term},username.ilike.${term}`).limit(12),
  supabaseClient.from('posts').select('id,content,created_at,metadata').ilike('content',term).is('deleted_at',null).in('status',['published','unlisted']).order('created_at',{ascending:false}).limit(20),
  supabaseClient.from('projects').select('id,name,description,repo_url').or(`name.ilike.${term},description.ilike.${term}`).limit(12),
  supabaseClient.from('games').select('id,name,description,platforms').or(`name.ilike.${term},description.ilike.${term}`).limit(12),
  supabaseClient.from('apps').select('id,name,description').or(`name.ilike.${term},description.ilike.${term}`).limit(8)
 ]);
 const entries=[
  ...(profiles.data||[]).map(x=>({type:'profiles',html:item('Conta',x.display_name||x.username||'Conta',x.bio,`profile.html?id=${encodeURIComponent(x.id)}`,x.username?`@${x.username}`:'')})),
  ...(posts.data||[]).map(x=>{const t=x.metadata?.content_type==='reel'?'reels':x.metadata?.content_type==='code'?'code':'posts';return{type:t,html:item(t==='reels'?'Reel':t==='code'?'Código':'Publicação',(x.content||'').slice(0,90)||'Publicação',x.content,`post.html?id=${encodeURIComponent(x.id)}`,x.created_at?new Date(x.created_at).toLocaleDateString('pt-BR'):'')}}),
  ...(projects.data||[]).map(x=>({type:'projects',html:item('Projeto',x.name,x.description,x.repo_url||'projects.html')})),
  ...(games.data||[]).map(x=>({type:'games',html:item('Game',x.name,x.description||((x.platforms||[]).join(', ')), 'games.html')})),
  ...(apps.data||[]).map(x=>({type:'projects',html:item('App',x.name,x.description,'apps.html')}))
 ];
 const filtered=activeType==='all'?entries:entries.filter(x=>x.type===activeType);
 list.innerHTML=filtered.length?filtered.map(x=>x.html).join(''):`<div class="empty">Nenhum resultado encontrado${activeType!=='all'?' nesta categoria':''} para “${safe(q)}”. Tente outro termo ou escolha Tudo.</div>`;
}
input?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,220)});
filterButtons.forEach(b=>b.addEventListener('click',()=>{filterButtons.forEach(x=>x.classList.toggle('active',x===b));activeType=b.dataset.searchType;search()}));
clear?.addEventListener('click',()=>{input.value='';input.focus();list.innerHTML='<div class="empty">Comece digitando para pesquisar no PurperZone.</div>'});
if(params.get('type')==='code')activeType='code';
if(params.get('q')){input.value=params.get('q');search()}
filterButtons.forEach(b=>b.classList.toggle('active',b.dataset.searchType===activeType));
