import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Loader2, CheckCircle, Info } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferTIN() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tinNumber, setTinNumber] = useState("");
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

  const formatTIN = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    return cleaned.substring(0, 15); // Limit to 15 characters
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTIN(e.target.value);
    setTinNumber(formatted);
  };

  const handleSubmit = async () => {
    if (tinNumber.length < 8) {
      toast({
        title: "Invalid TIN",
        description: "Please enter a valid Tax Identification Number (minimum 8 characters)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's correct TIN from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tin_number')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        throw error;
      }

      if (profile?.tin_number !== tinNumber) {
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
          title: "Invalid TIN",
          description: `Incorrect TIN. ${maxAttempts - attempts - 1} attempts remaining`,
          variant: "destructive",
        });
        setTinNumber("");
        setIsLoading(false);
        return;
      }

      // Success - proceed to OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/transfer/otp", { state: transferData });

    } catch (error) {
      console.error('Error verifying TIN:', error);
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
                <FileText className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary animate-fade-in">
              Tax Identification Verification
            </CardTitle>
            <CardDescription className="text-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
              Please enter your Tax Identification Number (TIN) for verification
            </CardDescription>
            
            <div className="bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20 p-4 rounded-lg border border-orange-200/20 animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-center space-x-2 text-sm text-orange-700 dark:text-orange-300">
                <Info className="h-4 w-4" />
                <span>Attempts remaining: {maxAttempts - attempts}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <label className="block text-sm font-medium">
                Tax Identification Number (TIN)
              </label>
              <Input
                type="text"
                value={tinNumber}
                onChange={handleInputChange}
                placeholder="Enter your TIN (e.g., 1234567890ABCD)"
                className="text-center text-lg font-mono tracking-wider border-2 border-primary/20 hover:border-primary/50 focus:border-primary transition-all duration-200 hover-scale"
                disabled={isLoading}
                maxLength={15}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8-15 characters required</span>
                <span>{tinNumber.length}/15</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200/20 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-1">Tax Compliance Verification</p>
                  <p>Your TIN is used to verify tax compliance status for large financial transactions as required by banking regulations.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button
                variant="outline"
                onClick={() => navigate("/transfer/security")}
                className="flex-1 hover-scale transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={tinNumber.length < 8 || isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 hover-scale transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify TIN"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}