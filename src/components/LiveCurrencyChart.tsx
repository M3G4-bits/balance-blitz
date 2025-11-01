import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CurrencyData {
  time: string;
  rate: number;
}

const LiveCurrencyChart = () => {
  const [data, setData] = useState<CurrencyData[]>([]);
  const [currentRate, setCurrentRate] = useState(1.0856);

  useEffect(() => {
    // Initialize with some data points
    const initialData: CurrencyData[] = [];
    const baseRate = 1.0856;
    
    for (let i = 20; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.01;
      initialData.push({
        time: new Date(Date.now() - i * 60000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        rate: baseRate + variance
      });
    }
    
    setData(initialData);

    // Simulate live updates every 3 seconds
    const interval = setInterval(() => {
      setData(prevData => {
        const lastRate = prevData[prevData.length - 1]?.rate || 1.0856;
        const variance = (Math.random() - 0.5) * 0.005;
        const newRate = lastRate + variance;
        
        setCurrentRate(newRate);
        
        const newData = [
          ...prevData.slice(1),
          {
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            rate: newRate
          }
        ];
        
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const change = data.length > 1 
    ? ((data[data.length - 1].rate - data[0].rate) / data[0].rate * 100).toFixed(2)
    : '0.00';

  return (
    <Card className="w-full shadow-glass backdrop-blur-glass border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              EUR/USD Live
            </CardTitle>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">
                {currentRate.toFixed(4)}
              </span>
              <span className={`text-sm font-semibold ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(change) >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={['dataMin - 0.005', 'dataMax + 0.005']}
              tickFormatter={(value) => value.toFixed(4)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [value.toFixed(4), 'Rate']}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LiveCurrencyChart;