import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BankingDashboard } from "@/components/BankingDashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check captcha verification
    const captchaVerified = localStorage.getItem('captcha_verified');
    if (!captchaVerified) {
      navigate('/');
      return;
    }

    // Check authentication
    if (!user) {
      navigate('/auth');
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
