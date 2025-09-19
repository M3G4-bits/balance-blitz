import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GlobalChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-96 bg-background border shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
            <h3 className="font-semibold">Customer Support</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="text-primary-foreground hover:bg-primary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Hello! How can we help you today?</p>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-left">
                  Account Balance Inquiry
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-left">
                  Transfer Issues
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-left">
                  Card Services
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-left">
                  Technical Support
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Available 24/7 • Email: support@creditstirling.com
            </p>
          </div>
        </Card>
      )}

      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
        size="sm"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
};

export default GlobalChatButton;