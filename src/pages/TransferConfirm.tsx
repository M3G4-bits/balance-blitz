// // // import { Button } from "@/components/ui/button";
// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import { useBanking } from "@/contexts/BankingContext";
// // // import { useAuth } from "@/contexts/AuthContext";
// // // import { useEffect, useState } from "react";
// // // import { supabase } from "@/integrations/supabase/client";

// // // export default function TransferConfirm() {
// // //   const navigate = useNavigate();
// // //   const location = useLocation();
// // //   const transferData = location.state;
// // //   const { addTransaction, formatCurrency } = useBanking();
// // //   const { user } = useAuth();
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   useEffect(() => {
// // //     if (!user) {
// // //       navigate('/auth');
// // //     }
// // //   }, [user, navigate]);

// // //   if (!transferData) {
// // //     navigate("/transfer");
// // //     return null;
// // //   }

// // //   const { amount, recipient, accountNumber, bankName, sortCode, description } = transferData;

// // //   const handleConfirm = async () => {
// // //     setIsLoading(true);
    
// // //     // Simulate processing time
// // //     await new Promise(resolve => setTimeout(resolve, 2000));
    
// // //     let shouldSucceed = true; // Default to success
    
// // //     // Check if admin has set force_success to false (force failure)
// // //     if (user) {
// // //       try {
// // //         const { data, error } = await supabase
// // //           .from('admin_transfer_settings')
// // //           .select('force_success')
// // //           .eq('user_id', user.id)
// // //           .maybeSingle();
        
// // //         if (!error && data !== null) {
// // //           shouldSucceed = data.force_success;
// // //         }
// // //       } catch (error) {
// // //         console.error('Error checking transfer settings:', error);
// // //       }
// // //     }
    
// // //     setIsLoading(false);
    
// // //     // Route based on admin setting
// // //     if (shouldSucceed) {
// // //       // Success mode: go directly to OTP
// // //       navigate("/transfer/otp", { state: transferData });
// // //     } else {
// // //       // Force failure mode: go through all four pages (TAC → Security → TIN → OTP)
// // //       navigate("/transfer/tac", { state: transferData });
// // //     }
// // //   };

// // //   const handleCancel = () => {
// // //     navigate("/");
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
// // //       <div className="max-w-2xl mx-auto space-y-6">
// // //         <div className="flex items-center space-x-4">
// // //           <Button variant="ghost" size="icon" onClick={() => navigate("/transfer")}>
// // //             <ArrowLeft className="h-5 w-5" />
// // //           </Button>
// // //           <h1 className="text-3xl font-bold text-foreground">Confirm Transfer</h1>
// // //         </div>

// // //         <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
// // //           <CardHeader>
// // //             <CardTitle className="flex items-center space-x-2">
// // //               <CheckCircle className="h-5 w-5 text-primary" />
// // //               <span>Review Transfer Details</span>
// // //             </CardTitle>
// // //           </CardHeader>
// // //           <CardContent className="space-y-6">
// // //             <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">From Account:</span>
// // //                 <span className="font-medium">Checking Account - ****1234</span>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">Amount:</span>
// // //                 <span className="font-semibold text-2xl">{formatCurrency(amount)}</span>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">Recipient:</span>
// // //                 <span className="font-medium">{recipient}</span>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">Account Number:</span>
// // //                 <span className="font-medium">{accountNumber}</span>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">Bank:</span>
// // //                 <span className="font-medium">{bankName}</span>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span className="text-muted-foreground">Sort Code:</span>
// // //                 <span className="font-medium">{sortCode}</span>
// // //               </div>
// // //               {description && (
// // //                 <div className="flex justify-between">
// // //                   <span className="text-muted-foreground">Description:</span>
// // //                   <span className="font-medium">{description}</span>
// // //                 </div>
// // //               )}
// // //             </div>

// // //             <div className="bg-primary/10 p-4 rounded-lg">
// // //               <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
// // //               <p className="font-semibold">Free</p>
// // //             </div>

// // //             <div className="flex space-x-3">
// // //               <Button 
// // //                 variant="outline" 
// // //                 className="flex-1"
// // //                 onClick={handleCancel}
// // //               >
// // //                 Cancel
// // //               </Button>
// // //               <Button 
// // //                 onClick={handleConfirm} 
// // //                 className="flex-1 bg-primary hover:bg-primary/90"
// // //                 size="lg"
// // //                 disabled={isLoading}
// // //               >
// // //                 {isLoading ? (
// // //                   <>
// // //                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// // //                     Processing Transfer...
// // //                   </>
// // //                 ) : (
// // //                   'Proceed with Transfer'
// // //                 )}
// // //               </Button>
// // //             </div>
// // //           </CardContent>
// // //         </Card>
// // //       </div>
// // //     </div>
// // //   );
// // // }



// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { useBanking } from "@/contexts/BankingContext";
// // import { useAuth } from "@/contexts/AuthContext";
// // import { useEffect, useState } from "react";
// // import { supabase } from "@/integrations/supabase/client";

// // export default function TransferConfirm() {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const transferData = location.state;
// //   const { addTransaction, formatCurrency } = useBanking();
// //   const { user } = useAuth();
// //   const [isLoading, setIsLoading] = useState(false);

// //   useEffect(() => {
// //     if (!user) {
// //       navigate('/auth');
// //     }
// //   }, [user, navigate]);

// //   if (!transferData) {
// //     navigate("/transfer");
// //     return null;
// //   }

// //   const { amount, recipient, accountNumber, bankName, sortCode, description } = transferData;

// //   const handleConfirm = async () => {
// //     setIsLoading(true);
    
// //     // Simulate processing time
// //     await new Promise(resolve => setTimeout(resolve, 2000));
    
// //     let forceSuccess = true; // Default to success mode
    
// //     // Check admin transfer settings
// //     if (user) {
// //       try {
// //         const { data, error } = await supabase
// //           .from('admin_transfer_settings')
// //           .select('force_success')
// //           .eq('user_id', user.id)
// //           .single();
        
// //         if (!error && data !== null) {
// //           forceSuccess = data.force_success;
// //         }
// //       } catch (error) {
// //         console.error('Error checking transfer settings:', error);
// //         forceSuccess = true;
// //       }
// //     }
    
// //     setIsLoading(false);
    
// //     // Route based on admin setting
// //     if (forceSuccess === false) {
// //       // FAILURE MODE: Full verification flow (TAC → Security → TIN → Email OTP)
// //       navigate("/transfer/tac", { state: transferData });
// //     } else {
// //       // SUCCESS MODE: Direct to Email OTP (skip verification steps)
// //       navigate("/transfer/otp", { state: { ...transferData, mode: 'success' } });
// //     }
// //   };

// //   const handleCancel = () => {
// //     navigate("/");
// //   };

// //   return (
// //     <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
// //       <div className="max-w-2xl mx-auto space-y-6">
// //         <div className="flex items-center space-x-4">
// //           <Button variant="ghost" size="icon" onClick={() => navigate("/transfer")}>
// //             <ArrowLeft className="h-5 w-5" />
// //           </Button>
// //           <h1 className="text-3xl font-bold text-foreground">Confirm Transfer</h1>
// //         </div>

// //         <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
// //           <CardHeader>
// //             <CardTitle className="flex items-center space-x-2">
// //               <CheckCircle className="h-5 w-5 text-primary" />
// //               <span>Review Transfer Details</span>
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent className="space-y-6">
// //             <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">From Account:</span>
// //                 <span className="font-medium">Checking Account - ****1234</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Amount:</span>
// //                 <span className="font-semibold text-2xl">{formatCurrency(amount)}</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Recipient:</span>
// //                 <span className="font-medium">{recipient}</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Account Number:</span>
// //                 <span className="font-medium">{accountNumber}</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Bank:</span>
// //                 <span className="font-medium">{bankName}</span>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span className="text-muted-foreground">Sort Code:</span>
// //                 <span className="font-medium">{sortCode}</span>
// //               </div>
// //               {description && (
// //                 <div className="flex justify-between">
// //                   <span className="text-muted-foreground">Description:</span>
// //                   <span className="font-medium">{description}</span>
// //                 </div>
// //               )}
// //             </div>

// //             <div className="bg-primary/10 p-4 rounded-lg">
// //               <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
// //               <p className="font-semibold">Free</p>
// //             </div>

// //             <div className="flex space-x-3">
// //               <Button 
// //                 variant="outline" 
// //                 className="flex-1"
// //                 onClick={handleCancel}
// //               >
// //                 Cancel
// //               </Button>
// //               <Button 
// //                 onClick={handleConfirm} 
// //                 className="flex-1 bg-primary hover:bg-primary/90"
// //                 size="lg"
// //                 disabled={isLoading}
// //               >
// //                 {isLoading ? (
// //                   <>
// //                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                     Processing Transfer...
// //                   </>
// //                 ) : (
// //                   'Proceed with Transfer'
// //                 )}
// //               </Button>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   );
// // }

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useBanking } from "@/contexts/BankingContext";
// import { useAuth } from "@/contexts/AuthContext";
// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";

// export default function TransferConfirm() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const transferData = location.state;
//   const { addTransaction, formatCurrency } = useBanking();
//   const { user } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth');
//     }
//   }, [user, navigate]);

//   if (!transferData) {
//     navigate("/transfer");
//     return null;
//   }

//   const { amount, recipient, accountNumber, bankName, sortCode, description } = transferData;

//   const handleConfirm = async () => {
//     setIsLoading(true);
    
//     // Simulate processing time
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     let forceSuccess = true; // Default to success mode
    
//     // DEBUG: Log current user ID
//     console.log('🔍 DEBUG - Current User ID:', user?.id);
//     console.log('🔍 DEBUG - User object:', user);
    
//     // Check admin transfer settings
//     if (user) {
//       try {
//         console.log('🔍 DEBUG - Querying database for user:', user.id);
        
//         // Optional: Keep this for debugging duplicates
//         const { data: allData, error: allError } = await supabase
//           .from('admin_transfer_settings')
//           .select('*');
//         console.log('🔍 DEBUG - All records in table:', allData);
        
//         const { data, error } = await supabase
//           .from('admin_transfer_settings')
//           .select('force_success')
//           .eq('user_id', user.id)
//           .limit(1)  // Ensures at most one record is returned
//           .maybeSingle();  // Returns null if no record, without error
        
//         console.log('🔍 DEBUG - Database query result:', { data, error });
        
//         if (error) throw error;  // Only throw on real errors (e.g., network), not missing record
        
//         if (data !== null) {
//           forceSuccess = data.force_success;
//           console.log('🔍 DEBUG - Found setting, forceSuccess set to:', forceSuccess);
//         } else {
//           console.log('🔍 DEBUG - No setting found, using default:', forceSuccess);
//         }
//       } catch (error) {
//         console.error('🔍 DEBUG - Error checking transfer settings:', error);
//         // On error (e.g., network), default to success for safety
//         forceSuccess = true;
//       }
//     } else {
//       console.log('🔍 DEBUG - No user found, using default forceSuccess:', forceSuccess);
//     }
    
//     console.log('🔍 DEBUG - Final forceSuccess value:', forceSuccess);
//     console.log('🔍 DEBUG - Type of forceSuccess:', typeof forceSuccess);
    
//     setIsLoading(false);
    
//     // Route based on admin setting - EXPLICIT ROUTING
//     if (forceSuccess === false) {
//       // FAILURE MODE: ALWAYS go through full verification flow (TAC → Security → TIN → OTP)
//       console.log('🔴 FAILURE MODE ACTIVATED: Going to /transfer/tac');
//       console.log('🔴 Transfer data being passed:', transferData);
//       navigate("/transfer/tac", { state: transferData });
//     } else {
//       // SUCCESS MODE: Direct route to OTP (skip all verification steps)
//       console.log('🟢 SUCCESS MODE ACTIVATED: Going to /transfer/otp');
//       console.log('🟢 Transfer data being passed:', transferData);
//       navigate("/transfer/otp", { state: transferData });
//     }
//   };

//   const handleCancel = () => {
//     navigate("/");
//   };

//   return (
//     <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
//       <div className="max-w-2xl mx-auto space-y-6">
//         <div className="flex items-center space-x-4">
//           <Button variant="ghost" size="icon" onClick={() => navigate("/transfer")}>
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <h1 className="text-3xl font-bold text-foreground">Confirm Transfer - DEBUG VERSION</h1>
//         </div>

//         <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <CheckCircle className="h-5 w-5 text-primary" />
//               <span>Review Transfer Details</span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* DEBUG INFO CARD */}
//             <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg">
//               <h3 className="font-bold text-yellow-800">DEBUG INFO</h3>
//               <p className="text-yellow-700">User ID: {user?.id || 'No user'}</p>
//               <p className="text-yellow-700">Check browser console for detailed logs</p>
//             </div>

//             <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">From Account:</span>
//                 <span className="font-medium">Checking Account - ****1234</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Amount:</span>
//                 <span className="font-semibold text-2xl">{formatCurrency(amount)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Recipient:</span>
//                 <span className="font-medium">{recipient}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Account Number:</span>
//                 <span className="font-medium">{accountNumber}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Bank:</span>
//                 <span className="font-medium">{bankName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-muted-foreground">Sort Code:</span>
//                 <span className="font-medium">{sortCode}</span>
//               </div>
//               {description && (
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Description:</span>
//                   <span className="font-medium">{description}</span>
//                 </div>
//               )}
//             </div>

//             <div className="bg-primary/10 p-4 rounded-lg">
//               <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
//               <p className="font-semibold">Free</p>
//             </div>

//             <div className="flex space-x-3">
//               <Button 
//                 variant="outline" 
//                 className="flex-1"
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleConfirm} 
//                 className="flex-1 bg-primary hover:bg-primary/90"
//                 size="lg"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Processing Transfer...
//                   </>
//                 ) : (
//                   'Proceed with Transfer'
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTicker from "@/components/AnimatedTicker";

export default function TransferConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const transferData = location.state;
  const { addTransaction, formatCurrency } = useBanking();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!transferData) {
    navigate("/transfer");
    return null;
  }

  const { amount, recipient, accountNumber, bankName, sortCode, description } = transferData;

  const handleConfirm = async () => {
    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let forceSuccess = true; // Default to success mode
    
    if (user) {
      try {
        const { data, error } = await supabase
          .from('admin_transfer_settings')
          .select('force_success')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data !== null) {
          forceSuccess = data.force_success;
        }
      } catch (error) {
        // On error, default to success for safety
        forceSuccess = true;
      }
    }
    
    setIsLoading(false);
    
    // Route based on admin setting
    if (forceSuccess === false) {
      navigate("/transfer/tac", { state: transferData });
    } else {
      navigate("/transfer/otp", { state: transferData });
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient">
      {/* Animated Top Banner */}
      <AnimatedTicker />
      
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Confirm Transfer</h1>
        </div>

        <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Review Transfer Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Account:</span>
                <span className="font-medium">Checking Account - ****1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-2xl">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-medium">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number:</span>
                <span className="font-medium">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank:</span>
                <span className="font-medium">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sort Code:</span>
                <span className="font-medium">{sortCode}</span>
              </div>
              {description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="font-medium">{description}</span>
                </div>
              )}
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Transfer Fee:</p>
              <p className="font-semibold">Free</p>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm} 
                className="flex-1 bg-primary hover:bg-primary/90"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  'Proceed with Transfer'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
