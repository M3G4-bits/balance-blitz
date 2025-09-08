import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, Check, CreditCard, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/hooks/use-toast";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferStart() {
  const [amount, setAmount] = useState("");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleAmountBlur = () => {
    if (amount && !isNaN(parseFloat(amount))) {
      const num = parseFloat(amount);
      setAmount(num.toFixed(2));
    }
  };

  const handleContinue = async () => {
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

    setIsLoading(true);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to transfer form with amount
    navigate("/transfer", { state: { amount: transferAmount } });
  };

  const displayAmount = amount ? parseFloat(amount).toFixed(2) : "0.00";
  const currentAmount = parseFloat(amount) || 0;
  const progressPercentage = Math.min((currentAmount / transferLimit) * 100, 100);
  const currencySymbol = country?.currency || "£";
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance && parseFloat(amount) <= transferLimit;

  const selectedAccount = {
    name: 'Checking Account',
    number: '****1234',
    balance: balance,
    type: 'primary'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Top Banner */}
      <AnimatedTicker />
      
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">New Transfer</h1>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="mb-3">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">From Account</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="w-full bg-card/60 backdrop-blur-sm rounded-2xl p-4 border border-border/50 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-sm">
                  <CreditCard className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground text-base leading-tight">{selectedAccount.name}</div>
                  <div className="text-muted-foreground text-sm">{selectedAccount.number}</div>
                  <div className="text-primary font-semibold text-sm mt-0.5">
                    {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-green-500/20 p-1 rounded-full">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>
          
          {/* Dropdown overlay */}
          {isAccountDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl z-10 overflow-hidden">
              <div className="p-4 text-muted-foreground text-sm text-center bg-muted/30">
                This is your primary account for transfers
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Amount Section */}
      <div className="px-4 pb-4">
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border/50 shadow-sm">
          <div className="mb-6">
            <h2 className="text-foreground text-xl font-bold mb-2 flex items-center">
              Transfer Amount
              <Clock className="w-4 h-4 ml-2 text-primary" />
            </h2>
            <p className="text-muted-foreground text-sm">Enter the amount you want to transfer</p>
          </div>
          
          <div className="mb-6">
            <div className="bg-background/50 rounded-2xl p-4 border-2 border-border/30 focus-within:border-primary/50 focus-within:bg-background/80 transition-all duration-200">
              <div className="flex items-baseline">
                <span className="text-muted-foreground text-lg mr-2 font-medium">{currencySymbol}</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-foreground text-3xl font-bold outline-none placeholder-muted-foreground/50"
                />
              </div>
            </div>
            {amount && parseFloat(amount) > selectedAccount.balance && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                <p className="text-destructive text-sm font-medium">
                  Insufficient funds. Available: {formatCurrency(selectedAccount.balance)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">Daily Transfer Limit</span>
              <span className="text-foreground font-semibold text-sm">{formatCurrency(transferLimit)}</span>
            </div>
            <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary via-primary to-primary/80 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
            <div className="text-center">
              {currentAmount > transferLimit ? (
                <span className="text-destructive text-xs font-semibold bg-destructive/10 px-2 py-1 rounded-full">
                  Exceeds limit by {formatCurrency(currentAmount - transferLimit)}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {formatCurrency(transferLimit - currentAmount)} remaining today
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!isValidAmount || isLoading}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center transform ${
              isValidAmount && !isLoading
                ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-muted/50 cursor-not-allowed text-muted-foreground'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span>Continue Transfer</span>
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="px-4 pb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-primary/20 p-2 rounded-full">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-primary text-xs text-center font-medium leading-relaxed">
            Transfers are secured with bank-grade encryption. Fees may apply based on recipient bank.
          </p>
        </div>
      </div>
    </div>
  );
}