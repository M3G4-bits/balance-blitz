import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Key, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferSecurity() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { toast } = useToast();
  const [securityCode, setSecurityCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!transferData) {
      navigate("/");
    }
  }, [user, transferData, navigate]);

  if (!transferData) {
    return null;
  }

  const handleSubmit = async () => {
    if (securityCode.length !== 6) {
      toast({
        title: "Invalid Security Code",
        description: "Please enter the complete 6-character security code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's correct security code from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('security_code')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (securityCode.toUpperCase() !== profile.security_code) {
        toast({
          title: "Invalid Security Code",
          description: "The security code you entered is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to TIN page
      navigate("/transfer/tin", { state: { ...transferData, securityCode } });
    } catch (error) {
      console.error('Error validating security code:', error);
      toast({
        title: "Error",
        description: "Failed to validate security code",
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/transfer/tac")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Security Verification</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary" />
              <span>Enter Security Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please enter the security code provided by your administrator
              </p>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={securityCode}
                  onChange={(value) => {
                    // Only allow numeric input
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setSecurityCode(numericValue);
                  }}
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
            </div>

            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                This security code is unique to your transfer and expires after use.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/transfer/tac")}
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
                disabled={securityCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
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