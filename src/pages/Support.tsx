import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, HeadphonesIcon, Mail, Phone, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [supportData, setSupportData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate sending support request
    setTimeout(() => {
      toast({
        title: "Support Request Sent",
        description: "Your support request has been sent to our team. We'll respond within 24 hours.",
      });
      setIsSubmitting(false);
      setSupportData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background bg-banking-gradient p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Get in touch with Credit Stirling Bank PLC support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <a 
                      href="mailto:support@creditstirling.proton.me" 
                      className="text-sm text-primary hover:underline"
                    >
                      support@creditstirling.proton.me
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="flex items-center gap-3 p-3 w-full h-auto justify-start"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </div>
                </Button>

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Support Hours</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                    <p>Saturday: 9:00 AM - 5:00 PM</p>
                    <p>Sunday: 10:00 AM - 4:00 PM</p>
                    <p className="text-primary font-medium">Emergency: 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur-glass border-border shadow-glass">
              <CardHeader>
                <CardTitle>Submit Support Request</CardTitle>
                <CardDescription>
                  Fill out the form below and our support team will get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={supportData.name}
                        onChange={(e) => setSupportData({ ...supportData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={supportData.email}
                        onChange={(e) => setSupportData({ ...supportData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setSupportData({ ...supportData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select support category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="transactions">Transaction Problems</SelectItem>
                        <SelectItem value="cards">Card Services</SelectItem>
                        <SelectItem value="loans">Loans & Credit</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="security">Security Concerns</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={supportData.subject}
                      onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed information about your issue"
                      value={supportData.message}
                      onChange={(e) => setSupportData({ ...supportData, message: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Before Submitting</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Check our FAQ section for common questions</li>
                      <li>• Include your account number if relevant</li>
                      <li>• Be specific about error messages or issues</li>
                      <li>• We typically respond within 24 hours</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending Request..." : "Submit Support Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;