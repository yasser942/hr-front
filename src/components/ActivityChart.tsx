import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { name: "السبت", value: 4000, users: 2400 },
  { name: "الأحد", value: 3000, users: 1398 },
  { name: "الإثنين", value: 2000, users: 9800 },
  { name: "الثلاثاء", value: 2780, users: 3908 },
  { name: "الأربعاء", value: 1890, users: 4800 },
  { name: "الخميس", value: 2390, users: 3800 },
  { name: "الجمعة", value: 3490, users: 4300 },
];

export function ActivityChart() {
  return (
    <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">نشاط المستخدمين</CardTitle>
        <p className="text-sm text-muted-foreground">إحصائيات الأسبوع الحالي</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(0, 0%, 100%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(0, 0%, 60%)" 
              style={{ fontSize: '12px', fontFamily: 'IBM Plex Sans Arabic' }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 60%)" 
              style={{ fontSize: '12px', fontFamily: 'IBM Plex Sans Arabic' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 8%)', 
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                fontFamily: 'IBM Plex Sans Arabic'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(0, 0%, 100%)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
