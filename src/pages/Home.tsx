import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Captcha from "./Captcha";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [captchaVerified, setCaptchaVerified] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If user is authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
      return;
    }

    // If captcha is verified, go to auth
    if (captchaVerified) {
      navigate('/auth');
      return;
    }

    // If no captcha verification, stay on this page to show captcha
  }, [user, loading, captchaVerified, navigate]);

  const handleCaptchaVerified = () => {
    setCaptchaVerified(true);
  };

  // Show loading or captcha for non-authenticated users
  if (loading) {
    return null;
  }

  // If user exists, we're redirecting to dashboard
  if (user) {
    return null;
  }

  // Show captcha for non-authenticated users who haven't verified captcha
  if (!captchaVerified) {
    return <Captcha onVerified={handleCaptchaVerified} />;
  }

  // This shouldn't be reached due to the useEffect redirect
  return null;
};

export default Home;