import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Phone, Mail, MessageCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";


export default function TransferFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { formatCurrency } = useBanking();
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const { amount, recipient } = transferData;
  const transactionId = `TXN${Date.now()}`;

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-destructive/20 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Transfer Failed</h1>
          <p className="text-muted-foreground">We're sorry, your transfer could not be completed</p>
        </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Transaction Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive mb-2">
                {formatCurrency(amount)}
              </p>
              <p className="text-muted-foreground">to {recipient} was not processed</p>
            </div>

            <div className="bg-destructive/10 p-4 rounded-lg space-y-3">
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
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-destructive">Failed</span>
              </div>
            </div>

            <div className="bg-secondary/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happened?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your transfer could not be processed due to a technical issue. Your account balance has not been affected.
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact our customer service team for assistance with this transaction.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Contact Customer Service</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Us
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Live Chat
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Customer Service: 24/7 Support</p>
                <p>Phone: 1-800-BALANCE</p>
                <p>Email: support@balanceblitz.com</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => navigate("/transfer")} 
                className="flex-1"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}