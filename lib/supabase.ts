import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserEvent {
  id?: string;
  title: string;
  event_type: string;
  location: string;
  event_date: string;
  description?: string;
  weather_score?: number;
  created_at?: string;
  updated_at?: string;
}

export async function createEvent(event: Omit<UserEvent, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
}

export async function getEvents(location?: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (location) {
    query = query.eq('location', location);
  }

  if (startDate) {
    query = query.gte('event_date', startDate);
  }

  if (endDate) {
    query = query.lte('event_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data || [];
}

export async function updateEvent(id: string, updates: Partial<UserEvent>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }

  return true;
}
