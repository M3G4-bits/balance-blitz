import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Share, Clock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TransferSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { formatCurrency } = useBanking();
  const { user } = useAuth();

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

  const { amount, recipient, accountNumber, bankName } = transferData;

  const transactionId = `TXN${Date.now()}`;

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`${transferData?.status === 'pending' ? 'bg-amber-500/20' : 'bg-success-green/20'} p-4 rounded-full`}>
                {transferData?.status === 'pending' ? (
                  <Clock className="h-12 w-12 text-amber-500" />
                ) : (
                  <CheckCircle className="h-12 w-12 text-success-green" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {transferData?.status === 'pending' ? 'Transfer Pending Approval' : 'Transfer Successful!'}
            </h1>
            <p className="text-muted-foreground">
              {transferData?.status === 'pending'
                ? 'Your transfer is awaiting admin approval and will be processed once approved.'
                : 'Your money has been sent successfully'
              }
            </p>
          </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="text-center">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-success-green mb-2">
                {formatCurrency(amount)}
              </p>
              <p className="text-muted-foreground">sent to {recipient}</p>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">****{accountNumber.slice(-4)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>

            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}