import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aswnttslekiedptmnalw.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8kx3ahEeKJ56mSQ1hOMB2A_H-hUdpOv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
