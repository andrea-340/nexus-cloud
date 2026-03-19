import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mobgcnfrmreltjqulftb.supabase.co";
const supabaseAnonKey = "sb_publishable_L_JVLjOMW0pb1oVOSw4jxg_r6Xn7zun";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
