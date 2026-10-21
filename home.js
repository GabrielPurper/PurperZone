/**
 * GUIA DE MANUTENÇÃO — home.js
 * Objetivo: Comportamento da página inicial e links de entrada na plataforma.
 * Como modificar: Adapta links e ações conforme a sessão do Supabase. A página inicial continua sendo a apresentação pública; o usuário autenticado pode seguir para o Painel Principal.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';
/**
 * Inicializa os links e ações da página inicial conforme o estado da sessão.
 */
export async function initHome(){
 if(!supabaseClient)return;
 try{
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(session?.user){
   document.querySelectorAll('.home-header .brand,.home-footer .brand').forEach(a=>a.setAttribute('href','feed.html'));
   const start=document.querySelector('.home-hero .hero-actions a.btn--primary');
   if(start){start.textContent='Abrir meu painel';start.href='feed.html'}
   const cta=document.querySelector('.home-cta a.btn--primary');
   if(cta){cta.textContent='Ir para meu Painel Principal';cta.href='feed.html'}
  }
 }catch{}
 const stats=[['profiles','profiles-count'],['projects','projects-count'],['posts','posts-count']];
 await Promise.all(stats.map(async([table,id])=>{
  try{const {count,error}=await supabaseClient.from(table).select('id',{count:'exact',head:true});const el=document.getElementById(id);if(el&&!error)el.textContent=count??0;}catch{}
 }));
}
initHome();
