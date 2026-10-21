/**
 * GUIA DE MANUTENÇÃO — app.js
 * Objetivo: Utilitários compartilhados do frontend.
 * Como modificar: Centraliza funções reutilizadas por páginas, como escape de HTML, notificações, estado de botões e verificação de sessão. Antes de alterar uma função daqui, procure os imports para evitar regressões em várias telas.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';

/**

 * Função $: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

const $ = (s, root=document) => root.querySelector(s);
/**
 * Função $$: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
/**
 * Função escapeHtml: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
export const escapeHtml = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

/**

 * Função toast: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export const toast = (message,type='info',duration=4200) => {
  let el=$('#toast');
  if(!el){ el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent=message; el.className=`toast toast--visible ${type}`;
  clearTimeout(window.__purperToastTimer);
  window.__purperToastTimer=setTimeout(()=>el.classList.remove('toast--visible'),duration);
};

/**

 * Função setInlineMessage: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setInlineMessage(target,message,type='info'){
  const el=typeof target==='string'?$(target):target; if(!el)return;
  el.hidden=false; el.className=`form-message ${type}`; el.textContent=message;
}

/**

 * Função setButtonLoading: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setButtonLoading(button,loading,label='Aguarde...'){
  if(!button)return;
  if(loading){
    if(!button.dataset.originalText)button.dataset.originalText=button.textContent;
    button.disabled=true; button.textContent=label; button.classList.add('is-loading');
  }else{
    button.disabled=false; button.textContent=button.dataset.originalText||button.textContent; button.classList.remove('is-loading');
  }
}


const MAINTENANCE_EXEMPT_PAGES = new Set(['maintenance.html', 'login.html', 'confirm-email.html', 'status.html']);

/**

 * Função enforceMaintenanceMode: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

async function enforceMaintenanceMode(){
  const current = location.pathname.split('/').pop() || 'index.html';
  if (MAINTENANCE_EXEMPT_PAGES.has(current)) return;
  if (window.PURPERZONE_MAINTENANCE_MODE === true) {
    location.replace(new URL('maintenance.html', location.href).href);
    return;
  }
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.rpc('get_maintenance_status');
    if (error) throw error;
    if (data?.enabled) location.replace(new URL('maintenance.html', location.href).href);
  } catch (error) {
    // Se o serviço de configuração estiver indisponível, não travamos todo o site.
    // As operações de escrita continuam protegidas pelo gatilho no banco durante manutenção.
    console.warn('Não foi possível consultar o modo de manutenção:', error?.message || error);
  }
}

/**

 * Função getUser: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export async function getUser(){
  if(!supabaseClient)return null;
  const {data,error}=await supabaseClient.auth.getUser();
  if(error)return null;
  return data.user||null;
}

/**

 * Função requireAuth: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export async function requireAuth(){
  const user=await getUser();
  const current=location.pathname.split('/').pop()||'index.html';
  if(!user&&!['login.html','index.html','404.html','maintenance.html'].includes(current)){
    const next=encodeURIComponent(current+location.search);
    location.href=`login.html?next=${next}`;
    return null;
  }
  return user;
}

/**

 * Função updateAuthUI: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function updateAuthUI(session){
  const signedIn=Boolean(session?.user);
  document.documentElement.dataset.auth=signedIn?'signed-in':'signed-out';
  $$('[data-auth-only]').forEach(el=>{el.hidden=!signedIn;});
  $$('[data-guest-only]').forEach(el=>{el.hidden=signedIn;});
  $$('[data-logout]').forEach(el=>{el.hidden=!signedIn;});
  $$('[data-login-link]').forEach(el=>{el.hidden=signedIn;});
  $$('[data-auth-account]').forEach(el=>{
    if(signedIn){el.textContent='Perfil';el.href='profile.html';}
    else{el.textContent='Entrar';el.href='login.html';}
  });
}

/**

 * Função setupNav: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setupNav(){
  const page=location.pathname.split('/').pop()||'index.html';
  $$('[data-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===page));
  const toggle=$('[data-mobile-toggle]'),sidebar=$('.sidebar');
  toggle?.addEventListener('click',()=>sidebar?.classList.toggle('open'));
  document.addEventListener('click',e=>{
    const link=e.target.closest('a');
    if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
    const href=link.getAttribute('href')||'';
    if(!href.includes('.html')||href.startsWith('http'))return;
    if(!href.startsWith('#'))document.body.classList.add('page-leaving');
  });
}

/**

 * Função setupLogout: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setupLogout(){
  document.addEventListener('click',async e=>{
    const button=e.target.closest('[data-logout]');
    if(!button)return;
    e.preventDefault();
    setButtonLoading(button,true,'Saindo...');
    try{
      const {error}=await supabaseClient.auth.signOut({scope:'local'});
      if(error)throw error;
      toast('Você saiu da sua conta.','success');
      setTimeout(()=>location.href='login.html?status=signed-out',250);
    }catch(error){
      setButtonLoading(button,false);
      toast(error?.message||'Não foi possível sair da conta.','error');
    }
  });
}

/**

 * Função setupAuthAwareUI: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setupAuthAwareUI(){
  if(!supabaseClient)return;
  supabaseClient.auth.getSession().then(({data})=>updateAuthUI(data.session));
  supabaseClient.auth.onAuthStateChange((_event,session)=>updateAuthUI(session));
}

/**

 * Função setupPageMotion: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function setupPageMotion(){
  document.body.classList.add('page-ready');
  $$('main .card, main .page-head, main .list > *, main .grid > *').forEach((el,i)=>{el.dataset.reveal='';el.style.transitionDelay=`${Math.min(i,8)*35}ms`;});
  const items=$$('[data-reveal]');
  if(!('IntersectionObserver' in window)){items.forEach(x=>x.classList.add('is-visible'));return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});
  items.forEach(x=>observer.observe(x));
}

/**

 * Função setupReturnMemory: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function setupReturnMemory(){
  const key='purperzone_last_page';
  if(location.pathname.endsWith('feed.html'))sessionStorage.setItem(key,location.href);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&location.pathname.endsWith('feed.html'))sessionStorage.setItem(key,location.href);});
}

/**

 * Função init: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

export function init(){void enforceMaintenanceMode();setupNav();setupLogout();setupAuthAwareUI();setupReturnMemory();setupPageMotion();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});}
init();
