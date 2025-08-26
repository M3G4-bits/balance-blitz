import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPEmailRequest {
  email: string;
  otp: string;
  transferData: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, transferData }: OTPEmailRequest = await req.json();

    console.log(`Sending OTP email to ${email}: ${otp}`);

    const emailResponse = await resend.emails.send({
      from: "Banking App <onboarding@resend.dev>",
      to: [email],
      subject: "Your Transaction OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Transaction Verification</h1>
          <p>Hi there,</p>
          <p>You have initiated a transfer of <strong>${transferData.amount}</strong> to <strong>${transferData.recipient}</strong>.</p>
          <p>Please enter the following OTP code to complete your transaction:</p>
          <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #495057; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          <p style="color: #6c757d; font-size: 14px;">This code will expire in 3 minutes.</p>
          <p style="color: #6c757d; font-size: 14px;">If you didn't initiate this transfer, please contact our support team immediately.</p>
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">Secure Banking App</p>
        </div>
      `,
    });

    console.log("OTP email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "OTP email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp-email function:", error);
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