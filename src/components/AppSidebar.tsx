import { 
  Settings, 
  User, 
  DollarSign, 
  History, 
  Shield, 
  HeadphonesIcon,
  LogOut,
  MapPin
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useBanking } from "@/contexts/BankingContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { title: "My Account", url: "/my-account", icon: User },
  { title: "Account Summary", url: "/account-summary", icon: DollarSign },
  { title: "History", url: "/history", icon: History },
  { title: "KYC Status", url: "/kyc-status", icon: Shield },
  { title: "Support", url: "/support", icon: HeadphonesIcon },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const { balance } = useBanking();
  const location = useLocation();
  const currentPath = location.pathname;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ ip: string; country: string; flag: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      }
    };

    const fetchUserLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserLocation({
          ip: data.ip,
          country: data.country_name,
          flag: data.country_code ? getCountryFlag(data.country_code) : '🌍'
        });
      } catch (error) {
        console.error('Error fetching location:', error);
        setUserLocation({ ip: 'Unknown', country: 'Unknown', flag: '🌍' });
      }
    };
    
    fetchUserProfile();
    fetchUserLocation();
  }, [user]);

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium rounded-lg" : "hover:bg-muted/50 rounded-lg";

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <SidebarContent style={{ backgroundColor: 'hsl(var(--dark-blue))' }}>
        {/* Profile Section */}
        {state !== "collapsed" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <NavLink 
                to="/my-account" 
                className="flex items-center gap-3 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userProfile?.avatar_url || ""} />
                  <AvatarFallback className="text-lg">
                    {userProfile?.first_name?.charAt(0) || userProfile?.last_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium">
                    {userProfile?.first_name && userProfile?.last_name 
                      ? `${userProfile.first_name} ${userProfile.last_name}`
                      : userProfile?.display_name || 'Guest User'
                    }
                  </span>
                  <span className="text-xs text-muted-foreground">Account: {userProfile?.account_number || 'N/A'}</span>
                  {userLocation && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{userLocation.flag} {userLocation.ip}</span>
                    </div>
                  )}
                </div>
              </NavLink>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-lg">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 mb-3">
              <ThemeToggle />
              {state !== "collapsed" && <span className="text-sm text-muted-foreground">Theme</span>}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              {state !== "collapsed" && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        {state !== "collapsed" && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p>© 2024 Credit Stirling Bank PLC</p>
            <p>All rights reserved</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}