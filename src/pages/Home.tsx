import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Captcha from "./Captcha";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // If user is authenticated, redirect to dashboard
    if (user) {
      navigate('/dashboard');
      return;
    }

    // If user is not authenticated, check captcha verification
    const captchaVerified = localStorage.getItem('captcha_verified');
    if (captchaVerified) {
      // Captcha already verified, go to auth
      navigate('/auth');
      return;
    }

    // If no captcha verification, stay on this page to show captcha
  }, [user, loading, navigate]);

  // Show loading or captcha for non-authenticated users
  if (loading) {
    return null;
  }

  // If user exists, we're redirecting to dashboard
  if (user) {
    return null;
  }

  // Show captcha for non-authenticated users who haven't verified captcha
  const captchaVerified = localStorage.getItem('captcha_verified');
  if (!captchaVerified) {
    return <Captcha />;
  }

  // This shouldn't be reached due to the useEffect redirect
  return null;
};

export default Home;