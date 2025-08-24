import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function TransferTIN() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tinNumber, setTinNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (tinNumber.length < 10) {
      toast({
        title: "Invalid TIN",
        description: "Please enter a valid Tax Identification Number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's correct TIN from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tin_number')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (tinNumber !== profile.tin_number) {
        toast({
          title: "Invalid TIN",
          description: "The TIN you entered is incorrect",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to OTP page
      navigate("/transfer/otp", { state: { ...transferData, tinNumber } });
    } catch (error) {
      console.error('Error validating TIN:', error);
      toast({
        title: "Error",
        description: "Failed to validate TIN",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-blue-600">CPB</div>
            <div className="text-xs text-gray-500">CREDIT POINT BANK</div>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Currency ticker */}
        <div className="bg-white border border-gray-200 px-2 py-1 mb-4 overflow-hidden">
          <div className="flex space-x-4 text-xs text-gray-600 whitespace-nowrap animate-scroll">
            <span className="text-red-500">• 176 ▼</span>
            <span>GBP/USD = 1.29455 ▼</span>
            <span className="text-green-500">GBP/NZD = 2.26481 ▲</span>
            <span>GBP/TRY = 49.1</span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white text-2xl font-bold">!</div>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-2">
              Tax Identification Number is Required.
            </h1>
            <p className="text-sm text-red-500 mb-6">
              The Federal TIN code is required for this transaction can be completed successfully. 
              You can visit any of our nearest branches or contact our online customer care 
              representative with: for more details send mail to support@creditpointbnk.com
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Enter TIN:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="xxxxxx"
                  maxLength={10}
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">TIN</div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-600">
                We have security measures in place to safeguard your money, because we are 
                committed to providing you with a secure banking experience.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={tinNumber.length < 10 || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-md font-medium transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}