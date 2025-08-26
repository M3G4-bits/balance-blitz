import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBanking } from "@/contexts/BankingContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TransferOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { addTransaction } = useBanking();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!transferData) {
      navigate("/");
    } else {
      // Send OTP email when component mounts
      sendOTPEmail();
    }
  }, [user, transferData, navigate]);

  if (!transferData) {
    return null;
  }

  const sendOTPEmail = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { 
          email: user?.email,
          transferData: transferData 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code",
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    await sendOTPEmail();
    setIsResending(false);
  };

  const handleSubmit = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user's correct OTP from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('otp_code')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (otpCode !== profile.otp_code) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if user has force_failure setting - this overrides all other logic
      const { data: transferSetting, error: settingError } = await supabase
        .from('admin_transfer_settings')
        .select('force_success')
        .eq('user_id', user?.id)
        .maybeSingle();

      const isForceFailure = transferSetting && !transferSetting.force_success;
      const isForceSuccess = transferSetting && transferSetting.force_success;

      if (isForceFailure) {
        // Force Failure mode - ALWAYS go through verification flow and keep pending
        console.log('Force failure mode - creating pending transaction');
        
        // For failure mode, create pending transaction with proper data
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_transactions')
          .insert({
            user_id: user?.id,
            amount: transferData.amount,
            recipient: transferData.recipient,
            bank_name: transferData.bankName,
            account_number: transferData.accountNumber,
            sort_code: transferData.sortCode,
            description: `Transfer to ${transferData.recipient}`,
            email: user?.email,
            transfer_data: transferData
          })
          .select();

        if (pendingError) {
          console.error('Error creating pending transaction:', pendingError);
          throw pendingError;
        }

        console.log('Pending transaction created:', pendingData);

        toast({
          title: "Transfer Submitted",
          description: "Your transfer is pending admin approval",
        });

        navigate("/transfer/success", { 
          state: { 
            ...transferData, 
            isPending: true,
            status: 'pending'
          } 
        });
      } else {
        // No Force Failure setting OR Force Success is enabled - complete transfer immediately
        // For success mode, complete the transaction immediately
        await addTransaction({
          type: 'transfer',
          amount: -transferData.amount,
          description: `Transfer to ${transferData.recipient}`,
          date: new Date(),
          recipient: transferData.recipient,
          bank_name: transferData.bankName,
          status: 'completed'
        });

        navigate("/transfer/success", { state: transferData });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to process transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBackPath = () => {
    // If coming from failure mode (has tinNumber), go back to TIN
    if (transferData.tinNumber) {
      return "/transfer/tin";
    }
    // If coming from success mode, go back to confirm
    return "/transfer/confirm";
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(getBackPath())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Email Verification</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Enter OTP Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We've sent a 6-digit verification code to your email: <br />
                <span className="font-medium">{user?.email}</span>
              </p>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                variant="ghost" 
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-primary"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </Button>
            </div>

            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400">
                This code expires in 10 minutes. Check your spam folder if you don't see the email.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(getBackPath())}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
                disabled={otpCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Complete Transfer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}