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
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Top Banner */}
      <AnimatedTicker />
      
      {/* Header */}
      <div className="px-6 py-6 flex items-center bg-card/50 backdrop-blur-sm border-b">
        <button 
          onClick={() => navigate("/")}
          className="mr-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center ml-auto">
          <Shield className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Account Section */}
      <div className="px-6 mb-8">
        <div className="relative">
          <button
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            className="w-full bg-card rounded-xl p-5 border border-border hover:border-primary transition-all duration-200 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground text-lg">{selectedAccount.name}</div>
                  <div className="text-muted-foreground text-sm">{selectedAccount.number}</div>
                  <div className="text-primary font-medium text-sm">
                    Available: {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-primary" />
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>
          
          {/* Dropdown overlay */}
          {isAccountDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-10">
              <div className="p-4 text-muted-foreground text-sm text-center">
                This is your only available account for transfers
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Amount Section */}
      <div className="px-6 mb-8">
        <div className="bg-card rounded-xl p-6 border border-border shadow-xl">
          <h2 className="text-foreground text-2xl font-bold mb-6 flex items-center">
            Transfer Amount
            <Clock className="w-5 h-5 ml-2 text-primary" />
          </h2>
          
          <div className="mb-6">
            <label className="text-muted-foreground text-lg mb-4 block font-medium">Enter Amount</label>
            <div className="bg-input rounded-xl p-4 flex items-center border-2 border-border focus-within:border-primary transition-colors">
              <span className="text-foreground text-xl mr-4 font-bold">{currencySymbol}</span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="0.00"
                className="flex-1 bg-transparent text-foreground text-2xl outline-none placeholder-muted-foreground font-semibold"
              />
            </div>
            {amount && parseFloat(amount) > selectedAccount.balance && (
              <div className="mt-3 p-3 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">
                  Insufficient funds. Maximum available: {formatCurrency(selectedAccount.balance)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-muted-foreground">
              <span className="font-medium">Per Transfer Limit</span>
              <span className="font-semibold">{formatCurrency(transferLimit)}</span>
            </div>
            <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
            <div className="text-center text-muted-foreground text-sm font-medium">
              {currentAmount > transferLimit ? (
                <span className="text-red-400 font-semibold">
                  Limit exceeded by {formatCurrency(currentAmount - transferLimit)}
                </span>
              ) : (
                <span>
                  {formatCurrency(transferLimit - currentAmount)} remaining for this transfer
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!isValidAmount || isLoading}
            className={`py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center transform ${
              isValidAmount && !isLoading
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-[1.02]'
                : 'bg-muted cursor-not-allowed text-muted-foreground'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                Proceed with Transfer
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="px-6 pb-8">
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
          <p className="text-primary text-sm text-center font-medium">
            🔒 Transfer fees may apply based on recipient bank and transfer type.
          </p>
        </div>
      </div>
    </div>
  );
}