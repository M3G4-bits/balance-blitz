import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function Transfer() {
  const [transferRecipient, setTransferRecipient] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { balance, formatCurrency } = useBanking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const transferAmount = location.state?.amount || 0;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
    if (!transferAmount || transferAmount <= 0) {
      navigate('/transfer/start');
    }
  }, [user, navigate, transferAmount]);

  const formatSortCode = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    const limited = numericValue.slice(0, 6);
    
    // Add hyphens after every 2 digits
    const formatted = limited.replace(/(\d{2})(?=\d)/g, '$1-');
    
    return formatted;
  };

  const handleSortCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSortCode(e.target.value);
    setSortCode(formatted);
  };

  const handleTransfer = async () => {
    if (!transferRecipient || !accountNumber || !bankName || !sortCode) {
      toast({
        title: "Invalid Transfer",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Validate account number (10 digits)
    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be exactly 10 digits.",
        variant: "destructive"
      });
      return;
    }

    // Validate sort code (6 digits)
    const sortCodeDigits = sortCode.replace(/[^0-9]/g, '');
    if (sortCodeDigits.length !== 6) {
      toast({
        title: "Invalid Sort Code",
        description: "Sort code must be exactly 6 digits.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate to confirmation page with transfer data
    navigate("/transfer/confirm", {
      state: {
        amount: transferAmount,
        recipient: transferRecipient,
        accountNumber,
        bankName,
        sortCode,
        description
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient">
      {/* Animated Ticker */}
      <AnimatedTicker />
      
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
            <h1 className="text-3xl font-bold text-foreground">Transfer Money</h1>
          </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              <span>Send Transfer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="recipient">Recipient Name</Label>
              <Input
                id="recipient"
                placeholder="Enter recipient name"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-2"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="sortCode">Sort Code</Label>
              <Input
                id="sortCode"
                placeholder="12-34-56"
                value={sortCode}
                onChange={handleSortCodeChange}
                className="mt-2"
                maxLength={8}
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Transfer Amount: {formatCurrency(transferAmount)}
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this transfer for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleTransfer} 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send Transfer'
              )}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}