import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Captcha() {
  const navigate = useNavigate();
  const [captchaInput, setCaptchaInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate a simple captcha code using random characters
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [captchaCode] = useState(generateCaptcha());

  const handleVerify = async () => {
    if (!captchaInput.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      toast.error("Invalid verification code. Please try again.");
      setCaptchaInput("");
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Verification successful!");
    
    // Store verification status in localStorage to prevent repeated verification
    localStorage.setItem('captcha_verified', 'true');
    
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-glass border-border shadow-glass">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-card-foreground mb-2">
            Welcome
          </CardTitle>
          <div className="bg-primary/10 border-l-4 border-primary px-4 py-3 rounded text-left">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please confirm you are not a Robot by verifying the auto-generated code below. 
              This will enable you to have access to CPB Online banking channels.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Captcha Display */}
          <div className="bg-primary text-primary-foreground p-6 rounded-lg text-center">
            <div className="text-4xl font-bold tracking-wider select-none font-mono">
              {captchaCode.split('').map((char, index) => (
                <span 
                  key={index} 
                  className="inline-block mx-1 transition-transform"
                  style={{ 
                    transform: `
                      rotate(${Math.random() * 40 - 20}deg) 
                      skew(${Math.random() * 20 - 10}deg, ${Math.random() * 15 - 7.5}deg)
                      scale(${0.9 + Math.random() * 0.3})
                    `,
                    textShadow: `
                      2px 2px 4px rgba(0,0,0,0.5),
                      -1px -1px 2px rgba(255,255,255,0.1)
                    `,
                    filter: `blur(${Math.random() * 0.5}px)`,
                    fontWeight: Math.random() > 0.5 ? 'bold' : 'normal',
                    fontStyle: Math.random() > 0.7 ? 'italic' : 'normal'
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter code"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="text-center text-lg font-medium tracking-wider"
              maxLength={6}
              disabled={isVerifying}
            />
          </div>

          {/* Verify Button */}
          <Button 
            onClick={handleVerify}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify code"}
          </Button>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 This verification helps protect against automated attacks
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}