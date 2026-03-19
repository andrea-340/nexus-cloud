import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mobgcnfrmreltjqulftb.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_L_JVLjOMW0pb1oVOSw4jxg_r6Xn7zun";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = String(body?.password || "");
    const code = typeof body?.code === "string" ? body.code : null;
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken : null;
    const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : null;

    if (password.length < 8) {
      return Response.json({ error: "La password deve avere almeno 8 caratteri." }, { status: 400 });
    }

    if (!code && !(accessToken && refreshToken)) {
      return Response.json({ error: "Link di ripristino non valido." }, { status: 400 });
    }

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.SUPABASE_SERVICE_KEY ||
      "";

    if (!serviceRoleKey) {
      return Response.json(
        { error: "Configurazione mancante: SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return Response.json({ error: error.message }, { status: 400 });
    } else {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return Response.json({ error: error.message }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return Response.json({ error: "Sessione di ripristino non valida." }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, { password });
    if (updateError) return Response.json({ error: updateError.message }, { status: 400 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err?.message || "Errore durante il reset password." }, { status: 500 });
  }
}

