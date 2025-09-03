import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferStart() {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { balance, formatCurrency, country } = useBanking();
  const { toast } = useToast();
  const navigate = useNavigate();
  const transferLimit = 500000;

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

    if (transferAmount > transferLimit) {
      toast({
        title: "Transfer Limit Exceeded",
        description: `Transfer amount cannot exceed ${formatCurrency(transferLimit)}.`,
        variant: "destructive"
      });
      return;
    }

    // Navigate to transfer form with amount
    navigate("/transfer", { state: { amount: transferAmount } });
  };

  const displayAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";
  const currentAmount = parseFloat(amount) || 0;
  const progressPercentage = Math.min((currentAmount / transferLimit) * 100, 100);
  const currencySymbol = country?.currency || "£";

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

          {/* Deleted Account Section */}
          <Card className="bg-card/40 backdrop-blur-glass border-destructive/50 shadow-glass opacity-60 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-destructive/20 rounded-full p-2">
                <X className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardHeader className="line-through">
              <CardTitle className="flex items-center space-x-2 text-muted-foreground">
                <span>Checking Account Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 line-through text-muted-foreground">
              <div className="bg-muted/20 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available Balance</span>
                  <span className="text-xl font-bold">{formatCurrency(balance)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
            <CardHeader>
              <CardTitle>Transfer Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-4">
                <Label htmlFor="amount" className="text-lg font-semibold">
                  Enter Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                    {currencySymbol}
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
                    {currencySymbol}{displayAmount}
                  </div>
                </div>

                {/* Transfer Limit Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transfer Limit</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(transferLimit)}
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                  <div className="text-xs text-center text-muted-foreground">
                    {currentAmount > transferLimit ? (
                      <span className="text-destructive font-semibold">
                        Limit exceeded by {formatCurrency(currentAmount - transferLimit)}
                      </span>
                    ) : (
                      <span>
                        {formatCurrency(transferLimit - currentAmount)} remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button 
                onClick={handleContinue} 
                className="w-full bg-primary hover:bg-primary/90 h-12"
                size="lg"
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > transferLimit}
              >
                <span className="mr-2">Proceed with transfer</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}