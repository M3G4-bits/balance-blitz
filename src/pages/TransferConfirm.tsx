import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { addTransaction, formatCurrency } = useBanking();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!transferData) {
    navigate("/transfer");
    return null;
  }

  const { amount, recipient, accountNumber, bankName, sortCode, description } = transferData;

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let forceSuccess = true; // Default to success mode
    
    // Check admin transfer settings
    if (user) {
      try {
        const { data, error } = await supabase
          .from('admin_transfer_settings')
          .select('force_success')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (!error && data !== null) {
          forceSuccess = data.force_success;
        }
      } catch (error) {
        console.error('Error checking transfer settings:', error);
        forceSuccess = true;
      }
    }
    
    setIsLoading(false);
    
    // Route based on admin setting
    if (forceSuccess === false) {
      // FAILURE MODE: Full verification flow (TAC → Security → TIN → Email OTP)
      navigate("/transfer/tac", { state: transferData });
    } else {
      // SUCCESS MODE: Direct to Email OTP (skip verification steps)
      navigate("/transfer/otp", { state: transferData });
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-banking-gradient p-6">
      <AnimatedTicker />
      <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
        <Card className="backdrop-blur-sm bg-card/95 shadow-xl border-border/50 hover-scale">
          <CardHeader className="text-center">
            <div className="mb-4 animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary mb-2 animate-fade-in">
              Confirm Transfer
            </CardTitle>
            <CardDescription className="text-base animate-fade-in" style={{animationDelay: '0.2s'}}>
              Please review your transfer details carefully before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-secondary/50 to-accent/30 p-6 rounded-lg space-y-4 animate-fade-in border border-border/20" style={{animationDelay: '0.3s'}}>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                <span className="text-muted-foreground font-medium">From Account:</span>
                <span className="font-semibold">Checking Account - ****1234</span>
              </div>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.5s'}}>
                <span className="text-muted-foreground font-medium">Amount:</span>
                <span className="font-bold text-3xl text-primary">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.6s'}}>
                <span className="text-muted-foreground font-medium">Recipient:</span>
                <span className="font-semibold">{recipient}</span>
              </div>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.7s'}}>
                <span className="text-muted-foreground font-medium">Account Number:</span>
                <span className="font-semibold font-mono">{accountNumber}</span>
              </div>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.8s'}}>
                <span className="text-muted-foreground font-medium">Bank:</span>
                <span className="font-semibold">{bankName}</span>
              </div>
              <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '0.9s'}}>
                <span className="text-muted-foreground font-medium">Sort Code:</span>
                <span className="font-semibold font-mono">{sortCode}</span>
              </div>
              {description && (
                <div className="flex justify-between items-center animate-slide-in-right" style={{animationDelay: '1s'}}>
                  <span className="text-muted-foreground font-medium">Description:</span>
                  <span className="font-semibold">{description}</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-primary/10 p-4 rounded-lg border border-primary/20 animate-scale-in" style={{animationDelay: '1.1s'}}>
              <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
              <p className="font-bold text-lg text-green-600">Free</p>
            </div>

            <div className="flex space-x-4 animate-fade-in" style={{animationDelay: '1.2s'}}>
              <Button 
                variant="outline" 
                className="flex-1 hover-scale transition-all duration-200"
                onClick={handleCancel}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 bg-primary hover:bg-primary/90 hover-scale transition-all duration-200"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  'Proceed with Transfer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}