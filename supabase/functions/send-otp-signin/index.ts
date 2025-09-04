import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPSigninRequest {
  email: string;
  otp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!Deno.env.get("RESEND_API_KEY")) {
    console.error("RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { email, otp }: OTPSigninRequest = await req.json();

    console.log("Sending signin OTP to:", email);

    const emailResponse = await resend.emails.send({
      from: "CSB Banking <noreply@bankingapp.com>",
      to: [email],
      subject: "Your Sign-in OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">CSB Banking</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Secure Banking Solutions</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Sign-in Verification Code</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Someone is trying to sign in to your CSB Banking account. Use the verification code below to complete your sign-in:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
              <h3 style="color: #1f2937; font-size: 32px; letter-spacing: 4px; margin: 0; font-family: monospace; font-weight: bold;">${otp}</h3>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                ⚠️ <strong>Security Notice:</strong> This code expires in 5 minutes. Never share this code with anyone.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 25px;">
              If you didn't request this code, please ignore this email or contact our support team immediately.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                CSB Banking - Secure, Reliable, Trusted<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Signin OTP email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Signin OTP sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp-signin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);