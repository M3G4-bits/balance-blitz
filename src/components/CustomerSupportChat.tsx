import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
}

interface CustomerSupportChatProps {
  isOpen?: boolean;
  onToggle?: () => void;
  unreadCount?: number;
  showWelcomeMessage?: boolean;
}

const CustomerSupportChat = ({ isOpen: externalIsOpen, onToggle, unreadCount = 0, showWelcomeMessage = false }: CustomerSupportChatProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const toggleChat = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load or create conversation when chat opens
  useEffect(() => {
    if (isOpen && user && !conversationId) {
      loadConversation();
    }
  }, [isOpen, user]);

  // Send welcome message if needed
  useEffect(() => {
    if (showWelcomeMessage && conversationId && user) {
      setTimeout(() => {
        handleSendWelcomeMessage();
      }, 1000);
    }
  }, [showWelcomeMessage, conversationId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.some(msg => msg.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const loadConversation = async () => {
    if (!user) return;

    try {
      // Check for existing conversation
      const { data: conversations } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .limit(1);

      let convId: string;

      if (conversations && conversations.length > 0) {
        convId = conversations[0].id;
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('support_conversations')
          .insert({
            user_id: user.id,
            status: 'open'
          })
          .select('id')
          .single();

        if (error) throw error;
        convId = newConv.id;
      }

      setConversationId(convId);

      // Load existing messages
      const { data: existingMessages } = await supabase
        .from('support_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (existingMessages) {
        setMessages(existingMessages as Message[]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'user',
          message: inputValue,
        });

      if (error) throw error;
      setInputValue("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcomeMessage = async () => {
    if (!conversationId || !user) return;

    const welcomeMessage = `Welcome back! 👋 We're here to help you with any questions about your CSB account or transfers. How can we assist you today?`;

    try {
      await supabase
        .from('support_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: 'admin',
          message: welcomeMessage,
        });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleChat}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg relative"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 z-50 shadow-xl bg-background border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-medium">Customer Support</h3>
            <Button
              onClick={toggleChat}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 h-64">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.sender_type === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default CustomerSupportChat;