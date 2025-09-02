import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerItem {
  symbol: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

const generateMockData = (): TickerItem[] => [
  { symbol: "BTC/USD", value: "42,350.50", change: 2.34, trend: 'up' },
  { symbol: "ETH/USD", value: "2,850.75", change: -1.25, trend: 'down' },
  { symbol: "GBP/EUR", value: "1.1531", change: 0.45, trend: 'up' },
  { symbol: "GBP/AUD", value: "2.04562", change: 1.12, trend: 'up' },
  { symbol: "GBP/CAD", value: "1.85714", change: -0.67, trend: 'down' },
  { symbol: "AAPL", value: "175.40", change: 0.89, trend: 'up' },
  { symbol: "TSLA", value: "248.50", change: -2.15, trend: 'down' },
  { symbol: "MSFT", value: "367.25", change: 1.45, trend: 'up' },
];

export default function AnimatedTicker() {
  const [data, setData] = useState<TickerItem[]>(generateMockData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData().map(item => ({
        ...item,
        value: (parseFloat(item.value.replace(',', '')) + (Math.random() - 0.5) * 10).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        change: (Math.random() - 0.5) * 5,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-muted/20 border-y border-border">
      {/* Top Ticker - Crypto/Stocks */}
      <div className="overflow-hidden py-2 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="animate-scroll flex items-center space-x-8 whitespace-nowrap">
          {[...data, ...data].map((item, index) => (
            <div key={`${item.symbol}-${index}`} className="flex items-center space-x-2 min-w-max">
              <span className="font-medium text-foreground">{item.symbol}</span>
              <span className="text-sm text-muted-foreground">=</span>
              <span className="font-bold text-foreground">{item.value}</span>
              <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {item.trend === 'up' ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Ticker - Promotional Message */}
      <div className="overflow-hidden py-3 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="animate-scroll-reverse flex items-center space-x-16 whitespace-nowrap">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-2 min-w-max">
              <span className="text-lg font-bold text-primary">
                USE CSB TODAY FOR YOUR CONVENIENCE, TRANSFER MONEY TO FRIENDS AND FAMILY
              </span>
              <span className="text-xl">💰</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}