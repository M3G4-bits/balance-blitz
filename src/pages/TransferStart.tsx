import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferStart() {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { balance, formatCurrency } = useBanking();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const formatAmountInput = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts[1].slice(0, 2); // Limit to 2 decimal places
    }
    
    return formatted;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountInput(e.target.value);
    setAmount(formatted);
  };

  const handleContinue = () => {
    const transferAmount = parseFloat(amount);
    
    if (!amount || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid transfer amount.",
        variant: "destructive"
      });
      return;
    }

    if (transferAmount > balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this transfer.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to transfer form with amount
    navigate("/transfer", { state: { amount: transferAmount } });
  };

  const displayAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background bg-banking-gradient">
      {/* Animated Ticker */}
      <AnimatedTicker />
      
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Start Transfer</h1>
          </div>

          <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Checking Account Mode Selected</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Balance Display */}
              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Balance</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(balance)}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <Label htmlFor="amount" className="text-lg font-semibold">
                  Transfer Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                    £
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-8 text-lg h-12 text-center font-mono"
                  />
                </div>
                
                {/* Amount Display */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    £{displayAmount}
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {[50, 100, 250].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="h-10"
                    >
                      £{quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <Button 
                onClick={handleContinue} 
                className="w-full bg-primary hover:bg-primary/90 h-12"
                size="lg"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                <span className="mr-2">Continue to Transfer Form</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Transfer Info */}
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  💡 You'll enter recipient details on the next page. Transfers are processed securely with multiple verification steps.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}