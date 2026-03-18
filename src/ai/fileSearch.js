import { supabase } from "../lib/supabaseClient";

export async function searchFiles(keyword, userId) {
  const { data } = await supabase
    .from("files")
    .select("*")
    .ilike("nome", `%${keyword}%`)
    .eq("user_id", userId);

  return data || [];
}
