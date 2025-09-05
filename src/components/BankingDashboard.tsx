import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CustomerSupportChat from "@/components/CustomerSupportChat";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { usePresence } from "@/hooks/usePresence";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  PiggyBank,
  History,
  Eye,
  EyeOff,
  Shield,
  HeadphonesIcon,
  User,
  LogOut,
  DollarSign,
  ArrowLeftRight,
  Plane,
  Menu
} from "lucide-react";

export const BankingDashboard = () => {
  usePresence(); // Track user presence
  const navigate = useNavigate();
  const { balance, transactions, formatCurrency } = useBanking();
  const { user, signOut } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, first_name, last_name, account_number')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (data) {
        setAvatarUrl(data.avatar_url);
        setUserName(data.first_name || 'User');
        setAccountNumber(data.account_number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 bg-background bg-banking-gradient p-3 md:p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-lg md:text-xl font-medium text-muted-foreground">Credit Stirling Bank PLC</h1>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{getTimeGreeting()}, {userName}!</p>
                  {accountNumber && (
                    <p className="text-sm text-muted-foreground">Account: ****{accountNumber.slice(-4)}</p>
                  )}
                </div>
              </div>
            </div>

        {/* Balance Card */}
        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Balance
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-foreground shadow-balance-glow">
                {showBalance ? formatCurrency(balance) : "••••••"}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => navigate("/transfer")}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/deposit")}
                >
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loans & Credit Section */}
        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle>Loans & Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Credit Score</h3>
                <div className="text-3xl font-bold text-success-green">870</div>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Available Credit</h3>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(25000)}</div>
                <p className="text-sm text-muted-foreground">Line of Credit</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/apply-loan")}>
                Apply for Loan
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/increase-credit-line")}>
                Increase Credit Line
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Slider */}
        <div className="relative">
          <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-1">
            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/pay-bills")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-primary" />
                <p className="text-[10px] md:text-xs font-medium">Pay Bills</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/savings")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <PiggyBank className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-accent" />
                <p className="text-[10px] md:text-xs font-medium">Savings</p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/history")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <History className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-muted-foreground" />
                <p className="text-[10px] md:text-xs font-medium">History</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/kyc-status")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <Shield className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-success-green" />
                <p className="text-[10px] md:text-xs font-medium">KYC Status</p>
                <p className="text-[8px] md:text-[10px] text-success-green">Verified</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/virtual-cards")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-accent" />
                <p className="text-[10px] md:text-xs font-medium">Virtual Cards</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground">2 Active</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/account-summary")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-primary" />
                <p className="text-[10px] md:text-xs font-medium">Account Summary</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground">Overview</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/transfer")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <ArrowLeftRight className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-accent" />
                <p className="text-[10px] md:text-xs font-medium">Local Transfer</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground">Send Money</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/travel-leisure")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <Plane className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-green-600" />
                <p className="text-[10px] md:text-xs font-medium">Travel & Leisure</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground">Visa & Booking</p>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/80 backdrop-blur-glass border-border shadow-glass cursor-pointer hover:bg-card/90 transition-all min-w-[100px] md:min-w-[120px] snap-start rounded-xl"
              onClick={() => navigate("/support")}
            >
              <CardContent className="p-2 md:p-3 text-center">
                <HeadphonesIcon className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 md:mb-2 text-primary" />
                <p className="text-[10px] md:text-xs font-medium">Support</p>
                <p className="text-[8px] md:text-[10px] text-muted-foreground">24/7 Help</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className={`p-1.5 md:p-2 rounded-full ${
                      transaction.amount > 0 
                        ? 'bg-success-green/20' 
                        : 'bg-destructive/20'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowDownLeft className="h-3 w-3 md:h-4 md:w-4 text-success-green" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm md:text-base truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm md:text-base flex-shrink-0 ${
                    transaction.amount > 0 
                      ? 'text-success-green' 
                      : 'text-destructive'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-card/95 backdrop-blur-glass border-border shadow-glass max-w-md w-full">
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className={`font-semibold ${
                    selectedTransaction.amount > 0 ? 'text-success-green' : 'text-destructive'
                  }`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">
                    {selectedTransaction.amount > 0 ? 'Credit' : 'Debit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedTransaction.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium text-right">
                    {selectedTransaction.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">
                    {selectedTransaction.reference || 'N/A'}
                  </span>
                </div>
                <Button 
                  onClick={() => setShowTransactionModal(false)} 
                  className="w-full mt-4"
                  variant="outline"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
      <CustomerSupportChat />
    </SidebarProvider>
  );
};