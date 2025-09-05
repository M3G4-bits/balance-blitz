import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferTAC() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tacCode, setTacCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

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
    if (tacCode.length !== 6) {
      toast({
        title: "Invalid TAC Code",
        description: "Please enter the complete 6-character TAC code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's correct TAC code from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tac_code')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        throw error;
      }

      if (profile?.tac_code !== tacCode) {
        setAttempts(prev => prev + 1);
        
        if (attempts + 1 >= maxAttempts) {
          toast({
            title: "Maximum Attempts Exceeded",
            description: "Please try again later or contact support",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        toast({
          title: "Invalid TAC Code",
          description: `Incorrect code. ${maxAttempts - attempts - 1} attempts remaining`,
          variant: "destructive",
        });
        setTacCode("");
        setIsLoading(false);
        return;
      }

      // Success - proceed to security code verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/transfer/security", { state: transferData });

    } catch (error) {
      console.error('Error verifying TAC:', error);
      toast({
        title: "Verification Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-banking-gradient">
      <AnimatedTicker />
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <Card className="backdrop-blur-sm bg-card/95 shadow-2xl border-border/50 hover-scale">
          <CardHeader className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary animate-fade-in">
              TAC Authentication
            </CardTitle>
            <CardDescription className="text-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
              Enter your 6-digit Transaction Authorization Code to proceed
            </CardDescription>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20 animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Attempts remaining: {maxAttempts - attempts}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <label className="block text-sm font-medium text-center">
                Transaction Authorization Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={tacCode}
                  onChange={setTacCode}
                  disabled={isLoading}
                >
                  <InputOTPGroup className="gap-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot 
                        key={index} 
                        index={index}
                        className="w-12 h-12 text-lg font-mono border-2 border-primary/20 hover:border-primary/50 focus:border-primary transition-all duration-200 hover-scale"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200/20 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Security Information</p>
                  <p>Your TAC is required for all high-value transactions. This helps protect your account from unauthorized transfers.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button
                variant="outline"
                onClick={() => navigate("/transfer/confirm")}
                className="flex-1 hover-scale transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={tacCode.length !== 6 || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 hover-scale transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify TAC"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}