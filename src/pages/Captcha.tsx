import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Shield, ArrowLeft, Banknote } from "lucide-react";
import { toast } from "sonner";

const Captcha = () => {
  const navigate = useNavigate();
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      toast.error("Please enter the captcha code");
      return;
    }

    setIsLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (userInput.toUpperCase() === captchaCode.toUpperCase()) {
        toast.success("Verification successful!");
        navigate("/auth");
      } else {
        setAttempts(prev => prev + 1);
        
        if (attempts >= 2) {
          toast.error("Too many failed attempts. Please try again.");
          generateCaptcha();
          setAttempts(0);
        } else {
          toast.error("Incorrect captcha code. Please try again.");
        }
        
        setUserInput("");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    generateCaptcha();
    toast.info("New captcha generated");
  };

  return (
    <div className="min-h-screen bg-banking-gradient flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-primary p-2 rounded-lg">
              <Banknote className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Credit Stirling Bank</h1>
              <p className="text-xs text-muted-foreground">Secure Access Portal</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-primary border-primary/20">
              Security Verification
            </Badge>
          </div>
          
          <CardTitle className="text-2xl font-bold">Human Verification</CardTitle>
          <CardDescription>
            Please enter the security code below to continue to the banking portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Captcha Display */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-muted/50 to-accent/20 p-6 rounded-lg border-2 border-dashed border-border/50 text-center">
              <div className="font-mono text-3xl font-bold tracking-widest text-foreground mb-2 select-none">
                {captchaCode.split('').map((char, index) => (
                  <span 
                    key={index} 
                    className="inline-block mx-1 transform hover:scale-110 transition-transform duration-200"
                    style={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      color: `hsl(${210 + index * 20}, 70%, ${45 + index * 5}%)`
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the code exactly as shown above
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-primary border-primary/20 hover:bg-primary/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Code
              </Button>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enter Verification Code
              </label>
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
                disabled={isLoading}
              />
              {attempts > 0 && (
                <p className="text-xs text-destructive">
                  Attempt {attempts}/3 - {3 - attempts} attempts remaining
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This security measure helps protect our banking services from automated attacks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Captcha;