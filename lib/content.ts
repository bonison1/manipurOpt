// Path: lib/content.ts
import 'server-only';
import { createAdminClient } from '@/lib/auth/admin-client';

export type EventItem = {
  id: string;
  title: string;
  date: string;
  type: string | null;
  location: string | null;
  description: string | null;
  photo_url: string | null;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body: string | null;
  published_at: string;
};

export type LeaderMessage = {
  id: string;
  name: string;
  role: string | null;
  message: string;
  photo_url: string | null;
  sort_order: number;
};

const today = () => new Date().toISOString().slice(0, 10);

// Homepage: upcoming events, soonest first
export async function getUpcomingEvents(limit = 3): Promise<EventItem[]> {
  const { data } = await createAdminClient()
    .from('events')
    .select('*')
    .gte('date', today())
    .order('date', { ascending: true })
    .limit(limit);
  return (data ?? []) as EventItem[];
}

// /events page and admin: newest first
export async function getAllEvents(): Promise<EventItem[]> {
  const { data } = await createAdminClient()
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  return (data ?? []) as EventItem[];
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const { data } = await createAdminClient()
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data as EventItem) ?? null;
}

export async function getLatestNews(limit?: number): Promise<NewsItem[]> {
  let q = createAdminClient()
    .from('news')
    .select('*')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const { data } = await createAdminClient()
    .from('news')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return (data as NewsItem) ?? null;
}

// About page: messages from the President and other office bearers
export async function getLeaderMessages(): Promise<LeaderMessage[]> {
  const { data } = await createAdminClient()
    .from('leader_messages')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  return (data ?? []) as LeaderMessage[];
}