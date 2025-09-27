import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BankingDashboard } from "@/components/BankingDashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check authentication - redirect to home if not authenticated
    // Home component will handle captcha verification flow
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Don't render dashboard if checks are still running
  if (!user) {
    return null;
  }

  return <BankingDashboard />;
};

export default Index;
