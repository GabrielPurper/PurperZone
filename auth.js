/**
 * GUIA DE MANUTENÇÃO — auth.js
 * Objetivo: Fluxos de autenticação e estado da conta.
 * Como modificar: Gerencia operações de login/cadastro e estado de sessão. Para provedores Google/GitHub, confira também as configurações de Auth no painel Supabase e as URLs de callback do provedor.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';
import { toast, setInlineMessage, setButtonLoading } from './app.js';

const modeButtons=[...document.querySelectorAll('[data-auth-mode]')];
const forms=[...document.querySelectorAll('[data-auth-form]')];
const message=document.querySelector('#auth-message');
const params=new URLSearchParams(location.search);
const confirmationActions=document.querySelector('#confirmation-actions');
const resendButton=document.querySelector('#resend-confirmation');
let lastSignupEmail='';

/**

 * Função friendlyAuthError: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function friendlyAuthError(error){
  const raw=(error?.message||'').toLowerCase();
  if(raw.includes('invalid login credentials'))return'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  if(raw.includes('email not confirmed'))return'Seu e-mail ainda não foi confirmado. Abra a mensagem enviada pelo PurperZone e confirme a conta.';
  if(raw.includes('user already registered'))return'Já existe uma conta com este e-mail. Tente entrar em vez de criar outra conta.';
  if(raw.includes('password should be'))return'A senha precisa ter pelo menos 8 caracteres.';
  if(raw.includes('rate limit'))return'Muitas tentativas em pouco tempo. Aguarde um momento e tente novamente.';
  if(raw.includes('signup is disabled'))return'Novos cadastros estão temporariamente desativados no Supabase.';
  if(raw.includes('provider is not enabled')||raw.includes('unsupported provider'))return'Este login social ainda não foi ativado no Supabase Auth. O botão está pronto, mas o provedor precisa ser configurado pelo administrador.';
  if(raw.includes('redirect'))return'O provedor recusou o endereço de retorno. Verifique as Redirect URLs do Supabase Auth.';
  if(raw.includes('network')||raw.includes('fetch'))return'Não foi possível conectar ao Supabase. Verifique sua internet e tente novamente.';
  return error?.message||'Não foi possível concluir a autenticação.';
}

/**

 * Função showMode: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function showMode(mode){
  const validMode=forms.some(form=>form.dataset.authForm===mode);
  if(!validMode)return;

  modeButtons.forEach(button=>{
    const active=button.dataset.authMode===mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
  });

  forms.forEach(form=>{
    const active=form.dataset.authForm===mode;
    form.hidden=!active;
    form.setAttribute('aria-hidden',String(!active));
    form.style.display=active?'grid':'none';
  });

  if(message)message.hidden=true;
  if(confirmationActions)confirmationActions.hidden=true;

  // Garante que a área de cadastro fique imediatamente visível ao trocar de aba.
  const activeForm=document.querySelector(`[data-auth-form="${mode}"]`);
  activeForm?.querySelector('input:not([type="hidden"])')?.focus({preventScroll:true});
}

// A troca de formulário usa delegação de eventos para continuar funcionando mesmo
// se algum componente da página for atualizado ou renderizado novamente.
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-auth-mode]');
  if(!button)return;
  event.preventDefault();
  showMode(button.dataset.authMode);
});
if(params.get('mode')==='signup')showMode('signup');
if(params.get('mode')==='reset')showMode('reset');
if(params.get('status')==='signed-out')setInlineMessage(message,'Você saiu da sua conta com segurança.','success');
if(params.get('status')==='email-confirmed')setInlineMessage(message,'E-mail confirmado com sucesso. Agora você já pode entrar no PurperZone.','success');
if(params.get('status')==='confirmation-sent')setInlineMessage(message,'Enviamos novamente o e-mail de confirmação. Confira sua caixa de entrada e também o spam.','success');

const ALLOWED_REDIRECT_PAGES = new Set([
  'index.html', 'feed.html', 'reels.html', 'projects.html', 'games.html', 'library.html',
  'apps.html', 'store.html', 'jarvis.html', 'messages.html', 'notifications.html',
  'moderation.html', 'plans.html', 'post.html', 'profile.html', 'search.html', 'settings.html',
  'cart.html', 'checkout.html', 'success.html'
]);

/**

 * Função redirectTarget: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function redirectTarget(){
  const next = params.get('next');
  if (!next || next.length > 512 || next.includes('\\')) return 'feed.html';
  try {
    // URL resolve + origin/path allowlist rejects javascript:, data:, protocol-relative,
    // absolute external URLs, nested paths and pages outside the known app routes.
    const destination = new URL(next, location.origin + location.pathname.replace(/[^/]*$/, ''));
    if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== location.origin) return 'feed.html';
    if (destination.username || destination.password || destination.hash) return 'feed.html';
    const segments = destination.pathname.split('/').filter(Boolean);
    if (segments.length !== 1 || !ALLOWED_REDIRECT_PAGES.has(segments[0])) return 'feed.html';
    return `${segments[0]}${destination.search}`;
  } catch {
    return 'feed.html';
  }
}

/**

 * Função ensureProfile: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

async function ensureProfile(user,extra={}){
  if(!supabaseClient||!user)return;
  const meta=user.user_metadata||{};
  const provider=user.app_metadata?.provider||user.identities?.[0]?.provider||extra.login_provider||'email';
  const email=user.email||'';
  let username=extra.username||meta.username||meta.user_name||meta.preferred_username||'';
  let displayName=extra.display_name||meta.display_name||meta.full_name||meta.name||username||email.split('@')[0]||'Usuário';
  username=String(username).toLowerCase().replace(/[^a-z0-9_.-]/g,'').slice(0,24);
  if(!username)username='user';
  const {data:existing}=await supabaseClient.from('profiles').select('id,username,display_name,birth_date').eq('id',user.id).maybeSingle();
  if(existing){
    const patch={email,login_provider:provider,login_provider_user_id:user.identities?.find(i=>i.provider===provider)?.id||user.id,social_login_enabled:provider!=='email',last_sign_in_at:new Date().toISOString()};
    if(extra.birth_date)patch.birth_date=extra.birth_date;
    await supabaseClient.from('profiles').update(patch).eq('id',user.id);
    return;
  }
  let candidate=username;
  for(let i=0;i<8;i++){
    const {data:conflict}=await supabaseClient.from('profiles').select('id').eq('username',candidate).maybeSingle();
    if(!conflict)break;
    candidate=`${username}${Math.floor(Math.random()*900+100)}`.slice(0,30);
  }
  const {error}=await supabaseClient.from('profiles').insert({id:user.id,email,username:candidate,display_name:displayName,birth_date:extra.birth_date||null,login_provider:provider,login_provider_user_id:user.identities?.find(i=>i.provider===provider)?.id||user.id,social_login_enabled:provider!=='email',last_sign_in_at:new Date().toISOString()});
  if(error&&error.code!=='23505')throw error;
}

/**

 * Função finishOAuth: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

async function finishOAuth(){
  if(!supabaseClient)return;
  try{
    const {data,error}=await supabaseClient.auth.getSession();
    if(error)throw error;
    if(data.session?.user){
      try{await ensureProfile(data.session.user);}catch(profileError){console.warn('Perfil não pôde ser sincronizado:',profileError);}
      toast('Login realizado. Bem-vindo ao PurperZone!','success');
      location.href=redirectTarget();
    }
  }catch(error){setInlineMessage(message,friendlyAuthError(error),'error');}
}

const loginForm=document.querySelector('[data-auth-form="login"]');
loginForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!supabaseClient)return setInlineMessage(message,'O cliente Supabase não pôde ser carregado.','error');
  const button=loginForm.querySelector('button[type="submit"]');
  setButtonLoading(button,true,'Entrando...');
  try{
    const {data,error}=await supabaseClient.auth.signInWithPassword({email:loginForm.email.value.trim(),password:loginForm.password.value});
    if(error)throw error;
    if(!data.session)throw new Error('A sessão não foi criada. Confirme seu e-mail e tente novamente.');
    try{await ensureProfile(data.user);}catch(profileError){console.warn('Perfil não pôde ser sincronizado:',profileError);}
    toast('Login realizado. Bem-vindo ao PurperZone!','success');
    location.href=redirectTarget();
  }catch(error){
    setInlineMessage(message,friendlyAuthError(error),'error');
    const raw=(error?.message||'').toLowerCase();
    if(raw.includes('email not confirmed')){
      lastSignupEmail=loginForm.email.value.trim();
      if(confirmationActions)confirmationActions.hidden=false;
    }
  }
  finally{setButtonLoading(button,false);}
});

const signupForm=document.querySelector('[data-auth-form="signup"]');
signupForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!supabaseClient)return setInlineMessage(message,'O cliente Supabase não pôde ser carregado.','error');
  const button=signupForm.querySelector('button[type="submit"]');
  const displayName=signupForm.display_name.value.trim();
  const username=signupForm.username.value.trim().replace(/^@/,'');
  const birthDate=signupForm.birth_date.value;
  const email=signupForm.email.value.trim();
  const password=signupForm.password.value;
  const confirm=signupForm.confirm_password.value;
  if(password!==confirm)return setInlineMessage(message,'As duas senhas precisam ser iguais.','error');
  if(!/^[a-zA-Z0-9_.-]{3,30}$/.test(username))return setInlineMessage(message,'O username precisa ter de 3 a 30 caracteres e usar apenas letras, números, ponto, hífen ou _.','error');
  if(!birthDate)return setInlineMessage(message,'Informe sua data de nascimento.','error');
  setButtonLoading(button,true,'Criando conta...');
  try{
    const emailRedirectTo=new URL('confirm-email.html',location.href).href;
    const {data,error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo,data:{display_name:displayName,username,birth_date:birthDate}}});
    if(error)throw error;
    lastSignupEmail=email;
    if(data.session){
      try{await ensureProfile(data.user,{display_name:displayName,username,birth_date:birthDate,login_provider:'email'});}catch(profileError){console.warn('Perfil não pôde ser sincronizado:',profileError);}
      setInlineMessage(message,'Conta criada. Redirecionando...','success');
      setTimeout(()=>location.href=redirectTarget(),500);
    }else{
      setInlineMessage(message,'Conta criada! Enviamos um e-mail de confirmação para este endereço. Abra a mensagem e confirme sua conta para continuar.','success');
      if(confirmationActions)confirmationActions.hidden=false;
      signupForm.reset();
    }
  }catch(error){setInlineMessage(message,friendlyAuthError(error),'error');}
  finally{setButtonLoading(button,false);}
});

const resetForm=document.querySelector('[data-auth-form="reset"]');
resetForm?.addEventListener('submit',async e=>{
  e.preventDefault();
  const button=resetForm.querySelector('button[type="submit"]');
  setButtonLoading(button,true,'Enviando...');
  try{
    const {error}=await supabaseClient.auth.resetPasswordForEmail(resetForm.email.value.trim(),{redirectTo:new URL('login.html?mode=reset',location.href).href});
    if(error)throw error;
    setInlineMessage(message,'Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir a senha.','success');
  }catch(error){setInlineMessage(message,friendlyAuthError(error),'error');}
  finally{setButtonLoading(button,false);}
});

resendButton?.addEventListener('click',async()=>{
  const email=lastSignupEmail || signupForm?.email?.value?.trim() || loginForm?.email?.value?.trim() || '';
  if(!email)return setInlineMessage(message,'Informe seu e-mail primeiro para reenviar a confirmação.','error');
  setButtonLoading(resendButton,true,'Enviando...');
  try{
    const emailRedirectTo=new URL('confirm-email.html',location.href).href;
    const {error}=await supabaseClient.auth.resend({type:'signup',email,options:{emailRedirectTo}});
    if(error)throw error;
    setInlineMessage(message,'Se este endereço tiver uma confirmação pendente, um novo e-mail foi enviado. Confira a caixa de entrada e o spam.','success');
  }catch(error){setInlineMessage(message,friendlyAuthError(error),'error');}
  finally{setButtonLoading(resendButton,false);}
});

for(const button of document.querySelectorAll('[data-oauth]'))button.addEventListener('click',async()=>{
  if(!supabaseClient)return setInlineMessage(message,'O cliente Supabase não pôde ser carregado.','error');
  const provider=button.dataset.oauth;
  setButtonLoading(button,true,'Abrindo...');
  try{
    const {error}=await supabaseClient.auth.signInWithOAuth({provider,options:{redirectTo:new URL(`login.html?oauth=1&next=${encodeURIComponent(redirectTarget())}`,location.href).href,queryParams:provider==='google'?{access_type:'offline',prompt:'select_account'}:undefined}});
    if(error)throw error;
  }catch(error){setInlineMessage(message,friendlyAuthError(error),'error');setButtonLoading(button,false);}
});

supabaseClient?.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_IN'&&session?.user&&params.get('oauth')==='1'){
    setTimeout(()=>finishOAuth(),0);
  }
});

const hashParams=new URLSearchParams(location.hash.replace(/^#/,'').replace(/^\?/,'') );
const oauthError=hashParams.get('error_description')||params.get('error_description');
if(oauthError)setInlineMessage(message,oauthError,'error');

if(params.get('oauth')==='1'&&!oauthError)finishOAuth();
