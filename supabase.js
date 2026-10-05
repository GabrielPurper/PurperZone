// Conexão única do frontend com o projeto Supabase PurperZone.
// Esta chave é pública e só deve ser usada junto das políticas RLS do banco.
// Nunca substitua por service_role ou outra chave secreta.

const SUPABASE_URL = 'https://yyxxtxsuixuyvshefwdz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Ar4MC4Reji8rA1mThhWEDw_f01gZDNg';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const DB = {
  profiles: 'profiles', posts: 'posts', postMedia: 'post_media', comments: 'post_comments',
  reactions: 'post_reactions', shares: 'post_shares', follows: 'follows', projects: 'projects',
  library: 'library_items', games: 'games', apps: 'apps', notifications: 'notifications',
  notificationReads: 'notification_reads', notificationPreferences: 'notification_preferences',
  conversations: 'conversations', members: 'conversation_members', messages: 'messages',
  messageReads: 'message_reads', messageAttachments: 'message_attachments', messageReports: 'message_reports',
  products: 'products', categories: 'product_categories', carts: 'carts', cartItems: 'cart_items',
  orders: 'orders', orderItems: 'order_items', payments: 'payments', subscriptions: 'subscriptions',
  plans: 'subscription_plans', planFeatures: 'plan_features', userPlans: 'user_plans',
  reports: 'content_reports', reportEvents: 'content_report_events', appeals: 'appeals', appealEvents: 'appeal_events',
  moderationQueue: 'moderation_queue', analytics: 'analytics_events', metrics: 'content_metrics',
  trending: 'trending_items', recommendations: 'recommendation_items', recommendationProfiles: 'recommendation_profiles',
  hashtags: 'hashtags', postHashtags: 'post_hashtags', jarvisAgents: 'jarvis_agents',
  jarvisDevices: 'jarvis_devices', jarvisEvents: 'jarvis_events', jarvisMemories: 'jarvis_memories',
  jarvisMessages: 'jarvis_messages', jarvisSessions: 'jarvis_sessions', faqs: 'faqs', faqCategories: 'faq_categories'
};

export async function currentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function currentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function query(table, options = {}) {
  let q = supabase.from(table).select(options.select || '*', options.selectOptions || {});
  if (options.eq) for (const [k, v] of Object.entries(options.eq)) q = q.eq(k, v);
  if (options.neq) for (const [k, v] of Object.entries(options.neq)) q = q.neq(k, v);
  if (options.order) q = q.order(options.order.column, { ascending: options.order.ascending ?? false });
  if (options.limit) q = q.limit(options.limit);
  if (options.range) q = q.range(options.range[0], options.range[1]);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function insert(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function update(table, filters, payload) {
  let q = supabase.from(table).update(payload);
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { data, error } = await q.select();
  if (error) throw error;
  return data;
}

export async function remove(table, filters) {
  let q = supabase.from(table).delete();
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { data, error } = await q.select();
  if (error) throw error;
  return data;
}

export function publicStorageUrl(bucket, path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
