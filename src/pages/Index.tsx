import { Users, TrendingUp, Activity, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ActivityChart } from "@/components/ActivityChart";
import { RecentActivity } from "@/components/RecentActivity";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted-foreground text-lg">نظرة شاملة على أداء نظامك</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي المستخدمين"
            value="12,543"
            change="12.5%"
            isPositive={true}
            icon={Users}
            delay={0}
          />
          <StatCard
            title="معدل النمو"
            value="45.2%"
            change="8.3%"
            isPositive={true}
            icon={TrendingUp}
            delay={100}
          />
          <StatCard
            title="النشاط اليومي"
            value="8,234"
            change="3.1%"
            isPositive={false}
            icon={Activity}
            delay={200}
          />
          <StatCard
            title="الإيرادات"
            value="$45,231"
            change="15.7%"
            isPositive={true}
            icon={DollarSign}
            delay={300}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
