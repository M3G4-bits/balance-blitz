import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CustomerSupportChat from "./CustomerSupportChat";

export default function GlobalChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(0);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <CustomerSupportChat
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        unreadCount={unreadCount}
        showWelcomeMessage={false}
      />
    </>
  );
}