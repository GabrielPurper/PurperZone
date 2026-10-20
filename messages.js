import { supabaseClient } from './supabaseClient.js';
import { escapeHtml, toast, requireAuth, setButtonLoading } from './app.js';

const conversationList = document.querySelector('#conversation-list');
const messagesList = document.querySelector('#messages-list');
const form = document.querySelector('#message-form');
const input = form?.querySelector('input[name="content"]');

let user = null;
let activeConversationId = null;
let realtimeChannel = null;

function conversationTitle(conversation, members = []) {
  if (conversation.title) return conversation.title;
  const others = members.filter(member => member.user_id !== user?.id);
  if (!others.length) return 'Notas pessoais';
  return others.map(member => member.profile?.display_name || member.profile?.username || 'Usuário').join(', ');
}

async function loadConversations() {
  if (!conversationList) return;
  user = user || await requireAuth();
  if (!user) return;

  const { data: memberships, error } = await supabaseClient
    .from('conversation_members')
    .select('conversation_id, role, last_read_at, conversations(id, conversation_type, title, avatar_url, status, updated_at)')
    .eq('user_id', user.id)
    .is('left_at', null);

  if (error) {
    conversationList.innerHTML = `<div class="empty error">${escapeHtml(error.message)}</div>`;
    return;
  }

  const rows = memberships || [];
  if (!rows.length) {
    conversationList.innerHTML = '<div class="empty">Você ainda não possui conversas.</div>';
    if (messagesList) messagesList.innerHTML = '<div class="empty">Escolha uma conversa para começar.</div>';
    return;
  }

  const ids = rows.map(row => row.conversation_id);
  const { data: allMembers } = await supabaseClient
    .from('conversation_members')
    .select('conversation_id,user_id,left_at')
    .in('conversation_id', ids)
    .is('left_at', null);

  const userIds = [...new Set((allMembers || []).map(member => member.user_id))];
  let profiles = {};
  if (userIds.length) {
    const { data } = await supabaseClient
      .from('public_profile_cards')
      .select('id,username,display_name,avatar_url')
      .in('id', userIds);
    profiles = Object.fromEntries((data || []).map(profile => [profile.id, profile]));
  }

  const groupedMembers = {};
  for (const member of allMembers || []) {
    (groupedMembers[member.conversation_id] ||= []).push({ ...member, profile: profiles[member.user_id] });
  }

  rows.sort((a, b) => new Date(b.conversations?.updated_at || 0) - new Date(a.conversations?.updated_at || 0));
  conversationList.innerHTML = rows.map(row => {
    const conversation = row.conversations;
    const active = conversation?.id === activeConversationId;
    return `<button type="button" class="conversation-item ${active ? 'active' : ''}" data-conversation="${conversation?.id}">
      <span class="mini-avatar">${escapeHtml(conversationTitle(conversation, groupedMembers[conversation?.id] || []).slice(0, 1).toUpperCase())}</span>
      <span><strong>${escapeHtml(conversationTitle(conversation, groupedMembers[conversation?.id] || []))}</strong><small>${conversation?.conversation_type === 'group' ? 'Grupo' : 'Conversa'}</small></span>
    </button>`;
  }).join('');

  conversationList.querySelectorAll('[data-conversation]').forEach(button => {
    button.addEventListener('click', () => selectConversation(button.dataset.conversation));
  });

  if (!activeConversationId || !ids.includes(activeConversationId)) {
    await selectConversation(rows[0].conversation_id);
  }
}

async function selectConversation(conversationId) {
  activeConversationId = conversationId;
  conversationList?.querySelectorAll('[data-conversation]').forEach(button => {
    button.classList.toggle('active', button.dataset.conversation === conversationId);
  });
  await loadMessages();
  await supabaseClient.from('conversation_members').update({ last_read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', user.id);
  subscribeRealtime();
  input?.focus();
}

async function loadMessages() {
  if (!messagesList || !activeConversationId) return;
  messagesList.innerHTML = '<div class="empty">Carregando mensagens…</div>';
  const { data, error } = await supabaseClient
    .from('messages')
    .select('id,sender_id,content,message_type,status,created_at,edited_at')
    .eq('conversation_id', activeConversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    messagesList.innerHTML = `<div class="empty error">${escapeHtml(error.message)}</div>`;
    return;
  }

  messagesList.innerHTML = (data || []).map(message => {
    const mine = message.sender_id === user.id;
    const deleted = message.status === 'deleted';
    return `<article class="chat-bubble ${mine ? 'me' : ''}">
      <div>${deleted ? '<em>Mensagem removida.</em>' : escapeHtml(message.content || '')}</div>
      <small class="muted">${new Date(message.created_at).toLocaleString('pt-BR')}</small>
    </article>`;
  }).join('') || '<div class="empty">Nenhuma mensagem ainda. Envie a primeira.</div>';

  messagesList.scrollTop = messagesList.scrollHeight;
}

function subscribeRealtime() {
  if (!supabaseClient || !activeConversationId) return;
  if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel = supabaseClient
    .channel(`purperzone-conversation-${activeConversationId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` }, loadMessages)
    .subscribe();
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!activeConversationId) {
    toast('Selecione uma conversa primeiro.', 'error');
    return;
  }
  const content = String(input?.value || '').trim();
  if (!content) return;

  const button = form.querySelector('button[type="submit"]');
  setButtonLoading(button, true, 'Enviando…');
  try {
    const { error } = await supabaseClient.from('messages').insert({
      conversation_id: activeConversationId,
      sender_id: user.id,
      content,
      message_type: 'text',
      status: 'sent'
    });
    if (error) throw error;
    form.reset();
    await loadMessages();
  } catch (error) {
    toast(error?.message || 'Não foi possível enviar a mensagem.', 'error');
  } finally {
    setButtonLoading(button, false);
  }
});

async function init() {
  if (!supabaseClient) {
    conversationList && (conversationList.innerHTML = '<div class="empty">Supabase não configurado.</div>');
    return;
  }
  user = await requireAuth();
  if (!user) return;
  await loadConversations();
}

init();
