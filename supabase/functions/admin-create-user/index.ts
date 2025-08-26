import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, first_name, last_name } = (await req.json()) as CreateUserRequest;

    if (!email || !password || !first_name || !last_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    // Client using caller's JWT to verify admin status
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    // Service role client for privileged operations
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify caller
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser();
    if (getUserError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check admin role
    const { data: roleRow, error: roleError } = await supabase
      .from("admin_roles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (roleError || !roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create auth user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: { first_name, last_name },
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      console.error("Create user error:", createErr);
      return new Response(JSON.stringify({ error: createErr?.message || "Failed to create user" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const newUserId = created.user.id;

    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the created profile (created by trigger)
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("account_number")
      .eq("user_id", newUserId)
      .single();

    if (profileErr || !profile?.account_number) {
      console.error("Profile fetch error:", profileErr);
      return new Response(JSON.stringify({ error: "Failed to fetch created profile" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate static codes for the new user (tac, security, tin, otp)
    const { error: codeErr } = await admin.rpc("generate_static_codes_for_users");
    if (codeErr) {
      console.warn("Code generation warning:", codeErr);
      // Not fatal; continue
    }

    return new Response(
      JSON.stringify({ success: true, user_id: newUserId, account_number: profile.account_number }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("admin-create-user error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
