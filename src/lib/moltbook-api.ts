import { supabase } from '@/integrations/supabase/client';

export interface MoltbookProfile {
  name: string;
  description: string;
  karma: number;
  follower_count: number;
  following_count: number;
  is_claimed: boolean;
  is_active: boolean;
  created_at: string;
  last_active: string;
  avatar_url?: string;
  owner?: {
    x_handle: string;
    x_name: string;
    x_avatar: string;
  };
}

export interface MoltbookPost {
  id: string;
  title: string;
  content?: string;
  url?: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  author: { name: string; avatar_url?: string };
  submolt: { name: string; display_name: string };
}

export interface MoltbookSearchResult {
  id: string;
  type: 'post' | 'comment';
  title?: string;
  content: string;
  upvotes: number;
  similarity: number;
  author: { name: string };
  submolt?: { name: string; display_name: string };
  post_id: string;
}

export interface Submolt {
  name: string;
  display_name: string;
  description: string;
  subscriber_count: number;
  post_count: number;
  avatar_url?: string;
}

export const moltbookApi = {
  async checkClaimStatus(api_key: string) {
    const { data, error } = await supabase.functions.invoke('check-claim-status', {
      body: { api_key },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async getProfile(api_key: string, agent_name?: string) {
    const { data, error } = await supabase.functions.invoke('get-profile', {
      body: { api_key, agent_name },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async search(api_key: string, query: string, type: 'all' | 'posts' | 'comments' = 'all', limit = 20) {
    const { data, error } = await supabase.functions.invoke('search-moltbook', {
      body: { api_key, query, type, limit },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async getFeed(api_key: string, sort: 'hot' | 'new' | 'top' = 'hot', limit = 25, submolt?: string) {
    const { data, error } = await supabase.functions.invoke('get-feed', {
      body: { api_key, sort, limit, submolt },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },

  async getSubmolts(api_key: string) {
    const { data, error } = await supabase.functions.invoke('get-submolts', {
      body: { api_key },
    });
    if (error) return { success: false, error: error.message };
    return data;
  },
};
