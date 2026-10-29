/**
 * GUIA DE MANUTENÇÃO — settings.js
 * Objetivo: Lógica de interface e integração da página/módulo.
 * Como modificar: Leia os imports para identificar dependências. Mantenha validação de dados, tratamento de erros e escape de conteúdo inserido no HTML.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import { supabaseClient } from './supabaseClient.js';
import { requireAuth, toast, setInlineMessage, setButtonLoading } from './app.js';

/**

 * Função $: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

const $=s=>document.querySelector(s);
/**
 * Função $$: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
const $$=s=>[...document.querySelectorAll(s)];
const status=$('#settings-status');
const message=$('#settings-message');
let user=null;

/**

 * Função setForm: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

function setForm(form,data={}){
  if(!form) return;
  [...form.elements].forEach(el=>{
    if(!el.name||!(el.name in data)) return;
    if(el.type==='checkbox') el.checked=Boolean(data[el.name]);
    else el.value=data[el.name]??'';
  });
}
/**
 * Função getForm: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
function getForm(form){
  const data={};
  [...form.elements].forEach(el=>{
    if(!el.name) return;
    data[el.name]=el.type==='checkbox'?el.checked:el.value;
  });
  return data;
}
/**
 * Função bindUpsert: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.
 */
function bindUpsert(formSelector,table,transform=(x=>x),success='Configurações salvas.'){
  const form=$(formSelector);
  form?.addEventListener('submit',async e=>{
    e.preventDefault();
    const button=form.querySelector('button[type="submit"]');
    setButtonLoading(button,true,'Salvando...');
    try{
      const payload=transform(getForm(form));
      const {error}=await supabaseClient.from(table).upsert(payload,{onConflict:table==='profiles'?'id':'user_id'});
      if(error) throw error;
      setInlineMessage(message,success,'success');toast(success,'success');
    }catch(error){setInlineMessage(message,error.message||'Não foi possível salvar.','error');}
    finally{setButtonLoading(button,false)}
  });
}

$$('[data-settings-tab]').forEach(button=>button.addEventListener('click',()=>{
  const tab=button.dataset.settingsTab;
  $$('[data-settings-tab]').forEach(b=>b.classList.toggle('active',b===button));
  $$('[data-settings-panel]').forEach(p=>p.hidden=p.dataset.settingsPanel!==tab);
  history.replaceState(null,'',`#${tab}`);
}));

/**

 * Função loadOne: implemente aqui a regra desta etapa. Ao modificar, confira entradas, retorno, tratamento de erros e efeitos na interface.

 */

async function loadOne(table){
  const {data,error}=await supabaseClient.from(table).select('*').eq(table==='profiles'?'id':'user_id',user.id).maybeSingle();
  if(error) throw error;
  return data||{};
}

/**

 * Busca e combina conteúdo para a aba selecionada; aqui ficam filtros, tabelas consultadas e limite de resultados.

 */

async function load(){
  if(!supabaseClient){status.textContent='Supabase indisponível';return}
  user=await requireAuth(); if(!user) return;
  refreshMfaStatus();
  status.textContent='Sincronizado com Supabase';status.classList.add('online');
  $('#settings-account-email').textContent=user.email||'Conta PurperZone';
  try{
    const [profile,experience,privacy,notifications,audio,secondaryEmail]=await Promise.all([
      loadOne('profiles'),loadOne('user_settings'),loadOne('user_privacy_settings'),loadOne('notification_preferences'),loadOne('user_audio_preferences'),loadOne('account_contact_emails').catch(()=>({}))
    ]);
    setForm($('#profile-settings'),{...profile,email:user.email||profile.email||''});
    setForm($('#experience-settings'),experience);
    setForm($('#privacy-settings'),privacy);
    setForm($('#notification-settings'),notifications);
    setForm($('#audio-settings'),audio);
    setForm($('#secondary-email-form'),secondaryEmail);
    $('#settings-account-name').textContent=profile.display_name||profile.username||'Minha conta';
    $('#security-summary').innerHTML=`<div><span>E-mail</span><strong>${user.email||'—'}</strong></div><div><span>Último login</span><strong>${user.last_sign_in_at?new Date(user.last_sign_in_at).toLocaleString('pt-BR'):'—'}</strong></div><div><span>Provedor</span><strong>${user.app_metadata?.provider||'email'}</strong></div>`;
  }catch(error){setInlineMessage(message,'Algumas configurações não puderam ser carregadas: '+error.message,'error')}
}

bindUpsert('#profile-settings','profiles',data=>({id:user.id,display_name:data.display_name.trim(),username:data.username.trim().replace(/^@/,''),bio:data.bio.trim(),country:data.country.trim(),state:data.state.trim(),city:data.city.trim(),email:user.email,updated_at:new Date().toISOString()}),'Perfil atualizado.');
bindUpsert('#experience-settings','user_settings',data=>({user_id:user.id,...data,updated_at:new Date().toISOString()}),'Experiência atualizada.');
bindUpsert('#privacy-settings','user_privacy_settings',data=>({user_id:user.id,...data,updated_at:new Date().toISOString()}),'Privacidade atualizada.');
bindUpsert('#notification-settings','notification_preferences',data=>({user_id:user.id,...data,updated_at:new Date().toISOString()}),'Notificações atualizadas.');
bindUpsert('#audio-settings','user_audio_preferences',data=>({user_id:user.id,...data,volume:Number(data.volume||0.35),updated_at:new Date().toISOString()}),'Preferências de áudio atualizadas.');

$('#password-form')?.addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;const password=form.password.value;const confirm=form.confirm_password.value;
  if(password!==confirm) return setInlineMessage(message,'As duas senhas precisam ser iguais.','error');
  const button=form.querySelector('button[type="submit"]');setButtonLoading(button,true,'Atualizando...');
  const {error}=await supabaseClient.auth.updateUser({password});setButtonLoading(button,false);
  if(error) return setInlineMessage(message,error.message,'error');
  form.reset();setInlineMessage(message,'Senha atualizada com sucesso.','success');toast('Senha atualizada.','success');
});

/** MFA/TOTP: enrollment is performed by Supabase Auth; never store TOTP secrets in app tables. */
let pendingMfaFactorId = null;
async function refreshMfaStatus(){
 const label=$('#mfa-status'), enroll=$('#mfa-enroll'), verify=$('#mfa-verify'), disable=$('#mfa-disable');
 if(!supabaseClient?.auth?.mfa){label.textContent='MFA indisponível nesta versão';enroll.disabled=true;return}
 try{const {data,error}=await supabaseClient.auth.mfa.listFactors();if(error)throw error;const factors=[...(data?.totp||[])];const verified=factors.find(x=>x.status==='verified');label.textContent=verified?'Ativa · autenticador TOTP':'Não configurada';enroll.hidden=Boolean(verified);disable.hidden=!verified;verify.hidden=!pendingMfaFactorId;}
 catch(e){label.textContent='Não foi possível consultar MFA';toast(e.message||'Falha ao consultar MFA.','error')}
}
$('#mfa-enroll')?.addEventListener('click',async()=>{
 try{const {data,error}=await supabaseClient.auth.mfa.enroll({factorType:'totp',friendlyName:'PurperZone Authenticator'});if(error)throw error;pendingMfaFactorId=data.id;const box=$('#mfa-enrollment');box.hidden=false;box.replaceChildren();const title=document.createElement('p');title.textContent='Escaneie o QR code no aplicativo autenticador e confirme com o código de 6 dígitos.';box.append(title);const img=document.createElement('img');img.alt='QR code para configurar verificação em duas etapas';img.className='mfa-qr';img.src=data.totp.qr_code;box.append(img);const secret=document.createElement('p');secret.textContent='Chave manual: '+data.totp.secret;box.append(secret);const input=document.createElement('input');input.id='mfa-code';input.inputMode='numeric';input.autocomplete='one-time-code';input.maxLength=6;input.placeholder='Código de 6 dígitos';input.setAttribute('aria-label','Código do autenticador');box.append(input);$('#mfa-verify').hidden=false;toast('Leia o QR code e confirme o código.','success');}
 catch(e){toast(e.message||'Não foi possível iniciar a verificação em duas etapas.','error')}
});
$('#mfa-verify')?.addEventListener('click',async()=>{const code=$('#mfa-code')?.value.trim();if(!pendingMfaFactorId||!/^\d{6}$/.test(code||''))return toast('Digite o código de 6 dígitos do autenticador.','error');try{const {error}=await supabaseClient.auth.mfa.challengeAndVerify({factorId:pendingMfaFactorId,code});if(error)throw error;pendingMfaFactorId=null;$('#mfa-enrollment').hidden=true;toast('Verificação em duas etapas ativada.','success');refreshMfaStatus()}catch(e){toast(e.message||'Código inválido ou expirado.','error')}});
$('#mfa-disable')?.addEventListener('click',async()=>{if(!confirm('Desativar a verificação em duas etapas desta conta?'))return;try{const {data,error}=await supabaseClient.auth.mfa.listFactors();if(error)throw error;const factor=(data?.totp||[]).find(x=>x.status==='verified');if(!factor)return refreshMfaStatus();const {error:removeError}=await supabaseClient.auth.mfa.unenroll({factorId:factor.id});if(removeError)throw removeError;toast('Verificação em duas etapas desativada.','success');refreshMfaStatus()}catch(e){toast(e.message||'Não foi possível desativar MFA.','error')}});
$('#secondary-email-form')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const email=String(form.email.value||'').trim().toLowerCase();if(!email||!email.includes('@'))return toast('Informe um e-mail válido.','error');if(email===String(user?.email||'').toLowerCase())return toast('O e-mail secundário precisa ser diferente do principal.','error');const button=form.querySelector('[type="submit"]');setButtonLoading(button,true,'Salvando…');try{const payload={user_id:user.id,secondary_email:email,purpose:form.purpose.value,verified_at:null,updated_at:new Date().toISOString()};const {error}=await supabaseClient.from('account_contact_emails').upsert(payload,{onConflict:'user_id'});if(error)throw error;setInlineMessage(message,'E-mail secundário salvo como contato privado. Ele ainda não está verificado e não deve ser usado para recuperação até confirmar sua posse.','success');toast('E-mail secundário salvo; falta verificar o endereço.','success')}catch(err){setInlineMessage(message,'Não foi possível salvar. Aplique a migration supabase/stories-and-account-security.sql. '+(err.message||''),'error')}finally{setButtonLoading(button,false)}});
$('#secondary-email-remove')?.addEventListener('click',async()=>{try{const {error}=await supabaseClient.from('account_contact_emails').delete().eq('user_id',user.id);if(error)throw error;$('#secondary-email-form').reset();toast('E-mail secundário removido.','success')}catch(e){toast(e.message||'Não foi possível remover o e-mail secundário.','error')}});

const initialTab=location.hash.slice(1);if(initialTab){document.querySelector(`[data-settings-tab="${initialTab}"]`)?.click()}
load();
