import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TransferOTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTransaction, setBalance, balance } = useBanking();
  const { user } = useAuth();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  const transferData = location.state?.transferData;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!transferData) {
      navigate('/');
      return;
    }
  }, [user, transferData, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (!user || !transferData || otp.length !== 6) return;

    try {
      // Get pending transaction with OTP
      const { data: pendingTransactions, error: fetchError } = await supabase
        .from('pending_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('recipient', transferData.recipient)
        .eq('amount', transferData.amount)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const pendingTransaction = pendingTransactions?.[0];
      if (!pendingTransaction) {
        toast.error("Transaction not found");
        return;
      }

      const transferDataObj = typeof pendingTransaction.transfer_data === 'object' 
        ? pendingTransaction.transfer_data as any 
        : {};
      const storedOTP = transferDataObj?.otp;
      const expiryTime = new Date(transferDataObj?.expires_at);

      if (new Date() > expiryTime) {
        setIsExpired(true);
        toast.error("OTP has expired");
        return;
      }

      if (otp !== storedOTP) {
        toast.error("Invalid OTP");
        return;
      }

      // Check if user is in force failure mode - this overrides all other logic
      // When Force Failure is enabled, ALWAYS keep transactions pending until admin approval
      const { data: transferSetting } = await supabase
        .from('admin_transfer_settings')
        .select('force_success')
        .eq('user_id', user.id)
        .maybeSingle();

      const isForceFailure = transferSetting && !transferSetting.force_success;

      if (isForceFailure) {
        // Force Failure mode enabled - transaction remains pending until admin manually approves
        // This overrides any alternating success/failure patterns
        toast.success("Transfer submitted for approval!");
        navigate('/transfer-success', { 
          state: { 
            transferData: {
              ...transferData,
              status: 'pending'
            }
          } 
        });
      } else {
        // No Force Failure setting OR Force Success is enabled - complete transfer immediately
        const newBalance = balance - transferData.amount;
        setBalance(newBalance);
        
        addTransaction({
          type: 'transfer',
          amount: transferData.amount,
          description: `Transfer to ${transferData.recipient}`,
          recipient: transferData.recipient,
          bank_name: transferData.bankName,
          status: 'completed',
          date: new Date()
        });

        // Delete pending transaction
        await supabase
          .from('pending_transactions')
          .delete()
          .eq('id', pendingTransaction.id);

        toast.success("Transfer completed successfully!");
        navigate('/transfer-success', { 
          state: { 
            transferData: {
              ...transferData,
              status: 'completed'
            }
          } 
        });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (!user || !transferData) return;

    try {
      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();

      if (!profile?.email) {
        throw new Error("User email not found");
      }

      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send OTP email
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: {
          email: profile.email,
          otp: newOtp,
          transferData: transferData
        }
      });

      if (emailError) {
        toast.error("Failed to send OTP email");
        return;
      }

      // Update pending transaction with new OTP and expiry
      const newExpiryTime = new Date(Date.now() + 3 * 60 * 1000);
      
      const { error } = await supabase
        .from('pending_transactions')
        .update({
          transfer_data: { ...transferData, otp: newOtp, expires_at: newExpiryTime.toISOString() }
        })
        .eq('user_id', user.id)
        .eq('recipient', transferData.recipient)
        .eq('amount', transferData.amount);

      if (error) throw error;

      setTimeLeft(180);
      setIsExpired(false);
      setOtp("");
      toast.success("New OTP sent to your email");
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP");
    }
  };

  if (!transferData) return null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Verify OTP</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-lg font-semibold ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isExpired ? 'Expired' : formatTime(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground">Time remaining</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isExpired}
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
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6 || isExpired}
                className="w-full"
              >
                Verify & Complete Transfer
              </Button>

              {isExpired && (
                <Button 
                  variant="outline"
                  onClick={handleResendOTP}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Transferring <span className="font-semibold">${transferData.amount}</span></p>
              <p>To: {transferData.recipient}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}