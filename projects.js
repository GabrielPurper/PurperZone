/**
 * GUIA DE MANUTENÇÃO — projects.js
 * Objetivo: Descoberta de projetos e notícias para desenvolvimento.
 * Como modificar: Combina busca pública do GitHub, catálogo npm e conteúdo da comunidade no Supabase. Para incluir outro ecossistema, crie uma função de carregamento, trate erros e renderize cartões usando escapeHtml.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import {supabaseClient} from './supabaseClient.js';
import {escapeHtml} from './app.js';
const list=document.querySelector('#projects-list'),updates=document.querySelector('#dev-updates'),packages=document.querySelector('#package-updates'),codeList=document.querySelector('#code-community'),input=document.querySelector('#dev-search');
const esc=escapeHtml;let timer;
/**
 * Renderiza um cartão reutilizável para uma fonte externa.
 */
function externalCard(tag,title,description,url,meta=''){return `<article class="card dev-update-card"><span class="tag">${esc(tag)}</span><h3>${esc(title)}</h3><p>${esc(description||'')}</p>${meta?`<small class="muted">${esc(meta)}</small>`:''}<a class="btn" href="${url}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a></article>`}
/**
 * Busca repositórios públicos recentemente atualizados no GitHub.
 */
async function loadGitHub(q='javascript'){
 try{
  const res=await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=8`,{headers:{Accept:'application/vnd.github+json'}});
  if(!res.ok)throw new Error('GitHub API indisponível');const data=await res.json();
  updates.innerHTML=(data.items||[]).length?data.items.map(x=>externalCard('GitHub',x.full_name,x.description,x.html_url,`★ ${x.stargazers_count} · Atualizado ${new Date(x.updated_at).toLocaleDateString('pt-BR')}`)).join(''):'<div class="empty">Nenhum repositório encontrado.</div>';
 }catch{updates.innerHTML='<div class="empty">Não foi possível carregar as novidades do GitHub agora. <a href="https://github.com/explore" target="_blank" rel="noopener noreferrer">Explorar GitHub ↗</a></div>'}
}
/**
 * Busca pacotes públicos no registro npm.
 */
async function loadNpm(q='react'){
 try{
  const res=await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(q)}&size=6`,{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('npm indisponível');const data=await res.json();
  packages.innerHTML=(data.objects||[]).length?data.objects.map(o=>{const x=o.package;return externalCard('npm',x.name,x.description,`https://www.npmjs.com/package/${encodeURIComponent(x.name)}`,`Versão ${x.version||'não informada'}${x.date?' · Publicado '+new Date(x.date).toLocaleDateString('pt-BR'):''}`)}).join(''):'<div class="empty">Nenhum pacote encontrado.</div>';
 }catch{packages.innerHTML='<div class="empty">Não foi possível carregar pacotes agora. <a href="https://www.npmjs.com/" target="_blank" rel="noopener noreferrer">Explorar npm ↗</a></div>'}
}
/**
 * Carrega projetos publicados pela comunidade no Supabase.
 */
async function loadProjects(){
 if(!supabaseClient){list.innerHTML='<div class="empty">Supabase não está disponível.</div>';return}
 const {data,error}=await supabaseClient.from('projects').select('id,name,description,repo_url,status,created_at,is_public').eq('is_public',true).order('created_at',{ascending:false}).limit(20);
 if(error){list.innerHTML=`<div class="empty">Não foi possível carregar projetos da comunidade: ${esc(error.message)}</div>`;return}
 list.innerHTML=(data||[]).length?(data||[]).map(x=>`<article class="card project-card"><span class="tag">${esc(x.status||'Projeto da comunidade')}</span><h3>${esc(x.name||'Projeto')}</h3><p>${esc(x.description||'Sem descrição.')}</p>${x.repo_url?`<a class="btn" href="${esc(x.repo_url)}" target="_blank" rel="noopener noreferrer">Repositório ↗</a>`:''}</article>`).join(''):'<div class="empty">Ainda não há projetos públicos. Compartilhe um projeto pelo Painel Principal.</div>';
}
/**
 * Carrega discussões/publicações relacionadas a programação.
 */
async function loadCode(){
 if(!supabaseClient){codeList.innerHTML='<div class="empty">Supabase não está disponível.</div>';return}
 const {data,error}=await supabaseClient.from('posts').select('id,content,created_at,metadata').in('status',['published','unlisted']).is('deleted_at',null).order('created_at',{ascending:false}).limit(50);
 if(error){codeList.innerHTML='<div class="empty">Não foi possível carregar discussões.</div>';return}
 const items=(data||[]).filter(x=>x.metadata?.content_type==='code'||/```|erro:|exception|bug|como (faço|resolver)|stack ?overflow|código/i.test(x.content||''));
 codeList.innerHTML=items.length?items.slice(0,8).map(x=>`<article class="card"><span class="tag">Pergunta / solução</span><p>${esc((x.content||'').slice(0,700))}</p><a class="btn" href="post.html?id=${encodeURIComponent(x.id)}">Ver discussão ↗</a></article>`).join(''):'<div class="empty">Ainda não há perguntas de código identificadas. Use o Painel Principal para compartilhar um problema, trecho de código ou solução.</div>';
}
/**
 * Espera brevemente após a digitação para evitar excesso de chamadas às APIs externas.
 */
function searchExternal(){const q=input.value.trim();clearTimeout(timer);timer=setTimeout(()=>{loadGitHub(q||'javascript');loadNpm(q||'react')},350)}
input?.addEventListener('input',searchExternal);
loadGitHub();loadNpm();loadProjects();loadCode();
