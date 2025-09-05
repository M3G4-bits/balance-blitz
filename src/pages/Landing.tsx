import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Banknote, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  const navigate = useNavigate();
  const [animatedStats, setAnimatedStats] = useState({
    customers: 0,
    transactions: 0,
    satisfaction: 0,
    branches: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setAnimatedStats(prev => ({
          customers: prev.customers < 2500000 ? prev.customers + 50000 : 2500000,
          transactions: prev.transactions < 15000000 ? prev.transactions + 300000 : 15000000,
          satisfaction: prev.satisfaction < 98.9 ? prev.satisfaction + 2 : 98.9,
          branches: prev.branches < 850 ? prev.branches + 17 : 850
        }));
      }, 100);

      const timeout = setTimeout(() => clearInterval(interval), 3000);
      return () => clearTimeout(timeout);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const services = [
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: "Personal Banking",
      description: "Comprehensive banking solutions tailored to your personal financial needs",
      features: ["Current & Savings Accounts", "Debit & Credit Cards", "Personal Loans", "Mortgages"]
    },
    {
      icon: <Building2 className="h-12 w-12 text-primary" />,
      title: "Business Banking",
      description: "Enterprise-grade banking services for businesses of all sizes",
      features: ["Business Accounts", "Commercial Loans", "Trade Finance", "Cash Management"]
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Wealth Management",
      description: "Professional investment and wealth advisory services",
      features: ["Investment Portfolio", "Financial Planning", "Retirement Solutions", "Insurance Products"]
    },
    {
      icon: <Smartphone className="h-12 w-12 text-primary" />,
      title: "Digital Banking",
      description: "Cutting-edge digital banking platform for 24/7 access",
      features: ["Mobile Banking App", "Online Transfers", "Digital Payments", "Account Notifications"]
    }
  ];

  const benefits = [
    { icon: <Shield />, title: "Bank-Grade Security", description: "256-bit SSL encryption and fraud protection" },
    { icon: <Globe />, title: "Global Network", description: "Access your account from anywhere in the world" },
    { icon: <Users />, title: "24/7 Support", description: "Round-the-clock customer service and assistance" },
    { icon: <Award />, title: "Award Winning", description: "Recognized for excellence in digital banking" }
  ];

  return (
    <div className="min-h-screen bg-banking-gradient">
      {/* Header */}
      <header className="border-b border-border/20 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Banknote className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Credit Stirling Bank</h1>
              <p className="text-xs text-muted-foreground">Your Trusted Financial Partner</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button onClick={() => navigate("/captcha")} className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <Badge variant="outline" className="mb-6 text-primary border-primary/20">
              Established 1987 • Trusted by Millions
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Banking Made
              <span className="text-primary block">Simple & Secure</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Experience the future of banking with Credit Stirling Bank. Comprehensive financial services, 
              cutting-edge technology, and personalized solutions for all your banking needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/captcha")} className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                Start Banking Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" onClick={() => navigate("/captcha")}>
                Sign In to Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-scale-in">
              <div className="text-4xl font-bold text-primary mb-2">
                {animatedStats.customers.toLocaleString()}+
              </div>
              <p className="text-muted-foreground">Satisfied Customers</p>
            </div>
            <div className="text-center animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl font-bold text-primary mb-2">
                £{animatedStats.transactions.toLocaleString()}M
              </div>
              <p className="text-muted-foreground">Monthly Transactions</p>
            </div>
            <div className="text-center animate-scale-in" style={{animationDelay: '0.4s'}}>
              <div className="text-4xl font-bold text-primary mb-2">
                {animatedStats.satisfaction}%
              </div>
              <p className="text-muted-foreground">Customer Satisfaction</p>
            </div>
            <div className="text-center animate-scale-in" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold text-primary mb-2">
                {animatedStats.branches}+
              </div>
              <p className="text-muted-foreground">Branches Worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">Our Banking Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial solutions designed to meet your personal and business banking requirements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={service.title} className="hover-scale transition-all duration-300 hover:shadow-lg border-border/50 animate-fade-in" style={{animationDelay: `${index * 0.2}s`}}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Credit Stirling Bank?</h2>
            <p className="text-xl text-muted-foreground">
              Trusted by millions worldwide for our commitment to excellence and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.15}s`}}>
                <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <div className="text-primary">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-right">
              <h2 className="text-4xl font-bold text-foreground mb-6">About Credit Stirling Bank</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Since 1987, Credit Stirling Bank has been at the forefront of financial innovation, 
                providing exceptional banking services to individuals and businesses across the globe. 
                Our commitment to excellence, security, and customer satisfaction has made us one of 
                the most trusted names in banking.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                With cutting-edge technology, personalized service, and a comprehensive range of 
                financial products, we're here to help you achieve your financial goals and secure 
                your future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">FCA Regulated</Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">FSCS Protected</Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">ISO 27001 Certified</Badge>
              </div>
            </div>
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className="h-8 w-8 text-primary fill-primary" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-foreground mt-6">
                  "Exceptional service and innovative banking solutions. Credit Stirling Bank 
                  has exceeded all our expectations."
                </blockquote>
                <p className="text-sm text-muted-foreground mt-4">- Financial Times Banking Awards 2023</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-xl text-muted-foreground">
              Ready to start your banking journey? Contact us today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center animate-fade-in">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Phone Banking</h3>
              <p className="text-muted-foreground">0800 123 4567</p>
              <p className="text-sm text-muted-foreground">24/7 Support Available</p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground">support@creditstirling.com</p>
              <p className="text-sm text-muted-foreground">Response within 2 hours</p>
            </div>
            
            <div className="text-center animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Branch Network</h3>
              <p className="text-muted-foreground">850+ Locations</p>
              <p className="text-sm text-muted-foreground">Find your nearest branch</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button size="lg" onClick={() => navigate("/captcha")} className="bg-primary hover:bg-primary/90 text-lg px-12 py-4">
              Access Your Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-6 bg-background/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <Banknote className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">Credit Stirling Bank</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Credit Stirling Bank plc is authorised by the Prudential Regulation Authority and regulated 
            by the Financial Conduct Authority and Prudential Regulation Authority.
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 Credit Stirling Bank. All rights reserved. | Privacy Policy | Terms & Conditions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;