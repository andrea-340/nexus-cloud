// import { createClient } from "../lib/supabaseClient"; // ❌ rimuovi
import { supabase } from "./supabaseClient"; // ✅ usa supabase già esportato

export async function getUserDocuments(userId) {
  const { data } = await supabase
    .from("user_files")
    .select("content")
    .eq("user_id", userId);

  return data?.map((d) => d.content) || [];
}
