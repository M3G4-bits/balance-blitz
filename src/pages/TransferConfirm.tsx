import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function TransferConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { addTransaction, formatCurrency } = useBanking();
  const { user } = useAuth();

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
    // 50/50 chance of success or failure
    const isSuccess = Math.random() >= 0.5;
    const status = isSuccess ? 'completed' : 'pending';

    // Add transaction to history
    await addTransaction({
      type: 'transfer',
      amount: -amount,
      description: `Transfer to ${recipient}`,
      date: new Date(),
      recipient: recipient,
      status: status
    });
    
    if (isSuccess) {
      navigate("/transfer/success", { state: transferData });
    } else {
      navigate("/transfer/failure", { state: transferData });
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/transfer")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Confirm Transfer</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Review Transfer Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Account:</span>
                <span className="font-medium">Checking Account - ****1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-2xl">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-medium">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sort Code:</span>
                <span className="font-medium">{sortCode}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{description}</span>
                </div>
              )}
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
              <p className="font-semibold">Free</p>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
              >
                Proceed with Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}