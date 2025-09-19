import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BankingProvider } from "./contexts/BankingContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
// import GlobalChatButton from "./components/GlobalChatButton"; // Replaced with Smartsupp
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TransferStart from "./pages/TransferStart";
import Transfer from "./pages/Transfer";
import TransferConfirm from "./pages/TransferConfirm";
import TransferSuccess from "./pages/TransferSuccess";
import TransferFailure from "./pages/TransferFailure";
import TransferTAC from "./pages/TransferTAC";
import TransferSecurity from "./pages/TransferSecurity";
import TransferTIN from "./pages/TransferTIN";
import TransferOTP from "./pages/TransferOTP";
import TransferOTPVerify from "./pages/TransferOTPVerify";
import Deposit from "./pages/Deposit";
import AccountSummary from "./pages/AccountSummary";
import TravelLeisure from "./pages/TravelLeisure";
import AdminDeposit from "./pages/AdminDeposit";
import Savings from "./pages/Savings";
import PayBills from "./pages/PayBills";
import Settings from "./pages/Settings";
import KYCStatus from "./pages/KYCStatus";
import VirtualCards from "./pages/VirtualCards";
import Auth from "./pages/Auth";
import MyAccount from "./pages/MyAccount";
import History from "./pages/History";
import ApplyLoan from "./pages/ApplyLoan";
import IncreaseCreditLine from "./pages/IncreaseCreditLine";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <BankingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
               <Route path="/my-account" element={<MyAccount />} />
            <Route path="/transfer/start" element={<TransferStart />} />
            <Route path="/transfer" element={<Transfer />} />
          <Route path="/transfer/confirm" element={<TransferConfirm />} />
          <Route path="/transfer/tac" element={<TransferTAC />} />
          <Route path="/transfer/security" element={<TransferSecurity />} />
          <Route path="/transfer/tin" element={<TransferTIN />} />
          <Route path="/transfer/otp" element={<TransferOTP />} />
           <Route path="/transfer/success" element={<TransferSuccess />} />
           <Route path="/transfer/failure" element={<TransferFailure />} />
           <Route path="/transfer-otp-verify" element={<TransferOTPVerify />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/account-summary" element={<AccountSummary />} />
          <Route path="/travel-leisure" element={<TravelLeisure />} />
          <Route path="/admin/deposit" element={<AdminDeposit />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/pay-bills" element={<PayBills />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/kyc-status" element={<KYCStatus />} />
              <Route path="/virtual-cards" element={<VirtualCards />} />
              <Route path="/history" element={<History />} />
              <Route path="/apply-loan" element={<ApplyLoan />} />
              <Route path="/increase-credit-line" element={<IncreaseCreditLine />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
            {/* Smartsupp chat widget loaded via script */}
          </BankingProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
