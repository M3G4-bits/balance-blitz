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
import AnimatedTicker from "@/components/AnimatedTicker";

interface TransferData {
  amount: number;
  recipient: string;
  accountNumber: string;
  bankName: string;
  sortCode: string;
  description?: string;
}

export default function TransferOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state as TransferData;
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
      sendOTPEmail();
    }
  }, [user, transferData, navigate]);

  if (!transferData) {
    return null;
  }

  const sendOTPEmail = async () => {
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

      const pendingData = {
        user_id: user?.id,
        amount: transferData.amount,
        recipient: transferData.recipient,
        bank_name: transferData.bankName,
        account_number: transferData.accountNumber,
        sort_code: transferData.sortCode,
        description: `Transfer to ${transferData.recipient}`,
        email: user?.email,
        transfer_data: { ...transferData, otp: generatedOtp, expires_at: expiresAt },
        otp_code: generatedOtp,
        otp_expires_at: expiresAt,
      };

      const { error: insertError } = await supabase
        .from('pending_transactions')
        .insert(pendingData);

      if (insertError) throw insertError;

      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: user?.email,
          otp: generatedOtp,
          transferData: transferData 
        }
      });

      if (emailError) throw emailError;

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
      navigate("/transfer");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

      const updateData = {
        transfer_data: { ...transferData, otp: newOtp, expires_at: newExpiresAt },
        otp_code: newOtp,
        otp_expires_at: newExpiresAt,
      };

      const { error } = await supabase
        .from('pending_transactions')
        .update(updateData)
        .eq('user_id', user?.id)
        .eq('recipient', transferData.recipient)
        .eq('amount', transferData.amount);

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: { 
          email: user?.email,
          otp: newOtp,
          transferData: transferData 
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
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
      // Retrieve and validate the OTP from pending_transactions
      const { data: pendingTransaction, error: pendingError } = await supabase
        .from('pending_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (pendingError || !pendingTransaction) {
        throw new Error('No pending transaction found');
      }

      // Validate OTP matches
      const hashedOtp = await supabase.rpc('hash_verification_code', {
        code: otpCode,
        user_id: user?.id,
        code_type: 'otp'
      });

      if (hashedOtp.data !== pendingTransaction.otp_code) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if OTP has expired
      if (new Date(pendingTransaction.otp_expires_at) < new Date()) {
        toast({
          title: "OTP Expired",
          description: "Your OTP has expired. Please request a new one.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check admin settings for transfer completion
      const { data: transferSetting } = await supabase
        .from('admin_transfer_settings')
        .select('force_success')
        .eq('user_id', user?.id)
        .single();

      const isForceFailure = transferSetting && !transferSetting.force_success;

      if (isForceFailure) {
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
        // Complete transfer
        const transactionData = {
          user_id: user?.id,
          type: 'transfer',
          amount: -transferData.amount,
          description: `Transfer to ${transferData.recipient}`,
          recipient: transferData.recipient,
          bank_name: transferData.bankName,
          account_number: transferData.accountNumber,
          sort_code: transferData.sortCode,
          status: 'completed'
        };

        const { error: insertError } = await supabase
          .from('transactions')
          .insert(transactionData);

        if (insertError) throw insertError;

        // Update balance
        const { data: currentBalance } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', user?.id)
          .single();

        if (currentBalance) {
          const newBalance = currentBalance.balance - transferData.amount;
          await supabase
            .from('user_balances')
            .update({ balance: newBalance })
            .eq('user_id', user?.id);
        }

        await addTransaction({
          type: 'transfer',
          amount: -transferData.amount,
          description: `Transfer to ${transferData.recipient}`,
          date: new Date(),
          recipient: transferData.recipient,
          bank_name: transferData.bankName,
          status: 'completed'
        });

        toast({
          title: "Transfer Completed",
          description: "Your transfer was successful!",
        });
        navigate("/transfer/success", { 
          state: { 
            ...transferData, 
            status: 'completed'
          } 
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient">
      {/* Animated Ticker */}
      <AnimatedTicker />
      
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
                  This code expires in 3 minutes. Check your spam folder if you don't see the email.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate(-1)}
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
    </div>
  );
}