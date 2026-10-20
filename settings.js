import { supabaseClient } from './supabaseClient.js';
import { requireAuth, toast, setInlineMessage, setButtonLoading } from './app.js';

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const status=$('#settings-status');
const message=$('#settings-message');
let user=null;

function setForm(form,data={}){
  if(!form) return;
  [...form.elements].forEach(el=>{
    if(!el.name||!(el.name in data)) return;
    if(el.type==='checkbox') el.checked=Boolean(data[el.name]);
    else el.value=data[el.name]??'';
  });
}
function getForm(form){
  const data={};
  [...form.elements].forEach(el=>{
    if(!el.name) return;
    data[el.name]=el.type==='checkbox'?el.checked:el.value;
  });
  return data;
}
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

async function loadOne(table){
  const {data,error}=await supabaseClient.from(table).select('*').eq(table==='profiles'?'id':'user_id',user.id).maybeSingle();
  if(error) throw error;
  return data||{};
}

async function load(){
  if(!supabaseClient){status.textContent='Supabase indisponível';return}
  user=await requireAuth(); if(!user) return;
  status.textContent='Sincronizado com Supabase';status.classList.add('online');
  $('#settings-account-email').textContent=user.email||'Conta PurperZone';
  try{
    const [profile,experience,privacy,notifications,audio]=await Promise.all([
      loadOne('profiles'),loadOne('user_settings'),loadOne('user_privacy_settings'),loadOne('notification_preferences'),loadOne('user_audio_preferences')
    ]);
    setForm($('#profile-settings'),{...profile,email:user.email||profile.email||''});
    setForm($('#experience-settings'),experience);
    setForm($('#privacy-settings'),privacy);
    setForm($('#notification-settings'),notifications);
    setForm($('#audio-settings'),audio);
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

const initialTab=location.hash.slice(1);if(initialTab){document.querySelector(`[data-settings-tab="${initialTab}"]`)?.click()}
load();
