import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  transferData: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendKey) {
      console.error('RESEND_API_KEY not found');
      throw new Error('Email service not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found');
      throw new Error('Database service not configured');
    }

    const { email, transferData }: OTPRequest = await req.json();

    if (!email || !transferData) {
      throw new Error('Missing required parameters: email and transferData');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Generated OTP for ${email}: ${otp}`);
    console.log(`Transfer data:`, transferData);

    // Get user ID from email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (profileError) {
      console.error('Error finding user profile:', profileError);
      throw new Error(`Database error: ${profileError.message}`);
    }

    if (!profiles) {
      console.error('User profile not found for email:', email);
      throw new Error('User not found');
    }

    console.log('Found user profile:', profiles.user_id);

    // Store OTP in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ otp_code: otp })
      .eq('user_id', profiles.user_id);

    if (updateError) {
      console.error('Error storing OTP:', updateError);
      throw new Error(`Failed to store OTP: ${updateError.message}`);
    }

    console.log('OTP stored successfully in database');

    // Send OTP email using Resend
    const emailResponse = await resend.emails.send({
      from: "Banking App <noreply@bankingapp.com>",
      to: [email],
      subject: "Your Transaction OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Transaction Verification</h1>
          <p>Hi there,</p>
          <p>You have initiated a transfer of <strong>₦${transferData.amount?.toLocaleString()}</strong> to <strong>${transferData.recipient}</strong>.</p>
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

    const response = {
      success: true,
      message: "OTP sent successfully",
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
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