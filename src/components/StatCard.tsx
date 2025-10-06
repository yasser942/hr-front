import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, change, isPositive, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className="relative overflow-hidden bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 hover:shadow-glow group animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
              <p className={`text-sm font-medium flex items-center gap-1 ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? '↑' : '↓'} {change}
              </p>
            </div>
          </div>
          
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Animated gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </CardContent>
    </Card>
  );
}
