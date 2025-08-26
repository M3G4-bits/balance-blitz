import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TransferTAC() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tacCode, setTacCode] = useState("");
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

      if (error) throw error;

      if (tacCode.toUpperCase() !== profile.tac_code) {
        toast({
          title: "Invalid TAC Code",
          description: "The TAC code you entered is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to security code page
      navigate("/transfer/security", { state: { ...transferData, tacCode } });
    } catch (error) {
      console.error('Error validating TAC:', error);
      toast({
        title: "Error",
        description: "Failed to validate TAC code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-glass border-b border-border p-4 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-primary">CPB</div>
            <div className="text-xs text-muted-foreground">CREDIT POINT BANK</div>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-background rounded-full"></div>
          </div>
        </div>

        {/* Currency ticker */}
        <div className="bg-card/80 backdrop-blur-glass border border-border px-2 py-1 mb-4 overflow-hidden">
          <div className="flex space-x-4 text-xs text-muted-foreground whitespace-nowrap animate-scroll">
            <span className="text-red-500">• 191.16135 ▲</span>
            <span>GBP/HKD = 10.03334 ▲</span>
            <span>GBP/MXN = 26.16031 ▲</span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-card/80 backdrop-blur-glass rounded-lg shadow-glass border border-border p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Transfer Authorization Code is required.
            </h1>
            <p className="text-sm text-red-500 mb-6">
              Your account is restricted and inactive from carrying out transactions via our online banking channel. 
              Kindly visit the nearest CPB branches to activate your account. For more information, contact your 
              Account Officer for guidelines.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-foreground mb-2">
                Enter Transfer Authorization Code:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tacCode}
                  onChange={(e) => setTacCode(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-border bg-background rounded-md text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                  placeholder="Enter TAC"
                  maxLength={6}
                />
                <div className="absolute right-3 top-3 text-muted-foreground text-sm">TAC</div>
              </div>
            </div>

            <div className="bg-secondary/50 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                We have security measures in place to safeguard your money, because we are 
                committed to providing you with a secure banking experience.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={tacCode.length !== 6 || isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground py-3 rounded-md font-medium transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            © 2025 Credit point bank - All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}