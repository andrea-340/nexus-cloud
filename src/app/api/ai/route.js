import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mobgcnfrmreltjqulftb.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_L_JVLjOMW0pb1oVOSw4jxg_r6Xn7zun";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body?.message || "").trim();
    const authHeader = req.headers.get("authorization") || "";
    const accessToken = (authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "") || body?.accessToken;

    if (!accessToken) {
      return Response.json({ reply: "Non autenticato." }, { status: 401 });
    }

    if (!message) {
      return Response.json({ reply: "Inserisci una richiesta valida." }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return Response.json({ reply: "Sessione non valida." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_files")
      .select("content")
      .eq("user_id", userData.user.id)
      .limit(200);

    if (error) {
      return Response.json({ reply: "Errore nella lettura dei documenti utente." }, { status: 500 });
    }

    const q = message.toLowerCase();
    const matches = (data || [])
      .map((r) => String(r?.content || ""))
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, 5);

    if (matches.length === 0) {
      return Response.json({ reply: "Non ho trovato documenti collegati alla tua richiesta nel tuo account." });
    }

    const snippets = matches.map((c) => c.slice(0, 500)).join("\n\n---\n\n");

    return Response.json({ reply: `Ho trovato contenuti nel tuo archivio:\n\n${snippets}` });
  } catch (err) {
    console.error(err);

    return Response.json({
      reply: "Errore nella ricerca dei documenti.",
    });
  }
}
