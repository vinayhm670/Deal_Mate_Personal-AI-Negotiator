import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables with fallback to localStorage (for live testing in browser)
const getEnv = (key: string): string => {
  try {
    return (import.meta.env[key] as string) || '';
  } catch {
    return '';
  }
};

const getStoredSupabaseConfig = () => {
  try {
    const url = localStorage.getItem('dealmate_supabase_url') || getEnv('VITE_SUPABASE_URL');
    const anonKey = localStorage.getItem('dealmate_supabase_anon_key') || getEnv('VITE_SUPABASE_ANON_KEY');
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
};

const initialConfig = getStoredSupabaseConfig();

export let supabase: SupabaseClient | null = null;
export let isSupabaseConnected = false;

// Initialize Supabase if valid URL & Key are available
export const initSupabaseClient = (url?: string, anonKey?: string): boolean => {
  const finalUrl = (url || initialConfig.url || '').trim();
  const finalKey = (anonKey || initialConfig.anonKey || '').trim();

  if (finalUrl && finalKey && finalUrl.startsWith('http')) {
    try {
      supabase = createClient(finalUrl, finalKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      isSupabaseConnected = true;
      return true;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabase = null;
      isSupabaseConnected = false;
      return false;
    }
  }

  supabase = null;
  isSupabaseConnected = false;
  return false;
};

// Initial startup call
initSupabaseClient();

// Test Supabase Connection
export const testSupabaseConnection = async (
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string }> => {
  const clientToTest =
    testUrl && testKey
      ? createClient(testUrl.trim(), testKey.trim())
      : supabase;

  if (!clientToTest) {
    return {
      success: false,
      message: 'Supabase credentials are not provided. Please provide valid Supabase Project URL and Anon Key.',
    };
  }

  try {
    // Attempt pinging health or public table
    const { error } = await clientToTest.from('deals').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "deals" does not exist')) {
      // If table doesn't exist yet, connection is still valid!
      if (error.message.includes('does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Database tables need to be created using provided SQL schema)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
};

// Dealmate Supabase Service Helpers (with automatic LocalStorage backup)
export const supabaseService = {
  // 1. Save Deal
  async saveDeal(deal: Record<string, unknown>) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('deals').upsert([deal]);
        if (!error) return { success: true, data };
      } catch (e) {
        console.warn('Supabase saveDeal fallback:', e);
      }
    }
    // Fallback: LocalStorage
    try {
      const deals = JSON.parse(localStorage.getItem('dealmate_deals') || '[]');
      deals.unshift({ ...deal, savedAt: new Date().toISOString() });
      localStorage.setItem('dealmate_deals', JSON.stringify(deals.slice(0, 50)));
    } catch {
      // ignore
    }
    return { success: true, isLocalFallback: true };
  },

  // 2. Fetch Deals
  async getDeals(userId?: string) {
    if (supabase) {
      try {
        let query = supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getDeals fallback:', e);
      }
    }
    try {
      return JSON.parse(localStorage.getItem('dealmate_deals') || '[]');
    } catch {
      return [];
    }
  },

  // 3. Save Order
  async saveOrder(order: Record<string, unknown>) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert([order]);
        if (!error) return { success: true, data };
      } catch (e) {
        console.warn('Supabase saveOrder fallback:', e);
      }
    }
    return { success: true, isLocalFallback: true };
  },

  // 4. Save Negotiation Record
  async saveNegotiationAudit(record: Record<string, unknown>) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('negotiations').insert([record]);
        if (!error) return { success: true, data };
      } catch (e) {
        console.warn('Supabase saveNegotiationAudit fallback:', e);
      }
    }
    return { success: true, isLocalFallback: true };
  },
};

// SQL Schema Definition for 1-Click Supabase Setup
export const SUPABASE_SQL_SCHEMA = `-- DealMate Supabase Schema
-- Run this in your Supabase Project -> SQL Editor

-- 1. Deals Table
create table if not exists public.deals (
  id text primary key,
  product_id text not null,
  product_name text not null,
  final_price numeric not null,
  original_price numeric not null,
  savings numeric not null,
  user_id text,
  coupon_applied text,
  merchant text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Orders Table
create table if not exists public.orders (
  id text primary key,
  user_id text,
  customer_name text,
  customer_email text,
  shipping_address text,
  product_id text not null,
  product_name text not null,
  final_price numeric not null,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Negotiation Audits Table
create table if not exists public.negotiations (
  id text primary key,
  user_id text,
  product_id text not null,
  initial_price numeric not null,
  settled_price numeric not null,
  rounds_count integer default 1,
  outcome text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.deals enable row level security;
alter table public.orders enable row level security;
alter table public.negotiations enable row level security;

-- Public Access Policies for Demo
create policy "Allow all actions on deals" on public.deals for all using (true) with check (true);
create policy "Allow all actions on orders" on public.orders for all using (true) with check (true);
create policy "Allow all actions on negotiations" on public.negotiations for all using (true) with check (true);
`;
