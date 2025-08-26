import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, transferData } = await req.json();

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Generated OTP for ${email}: ${otp}`);
    console.log(`Transfer data:`, transferData);

    // In a real implementation, you would:
    // 1. Store the OTP in database with expiration time
    // 2. Send the OTP via email service (like Resend)
    // For demo purposes, we'll just log it and return success

    const response = {
      success: true,
      message: "OTP sent successfully",
      // In production, don't return the OTP in the response
      otp: otp, // Only for demo purposes
    };

    console.log("OTP email sent successfully");

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