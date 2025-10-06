import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    id: 1,
    user: "أحمد محمد",
    action: "قام بإنشاء تقرير جديد",
    time: "منذ 5 دقائق",
    type: "success",
    initials: "أم"
  },
  {
    id: 2,
    user: "فاطمة علي",
    action: "حدثت البيانات في النظام",
    time: "منذ 15 دقيقة",
    type: "info",
    initials: "فع"
  },
  {
    id: 3,
    user: "محمود خالد",
    action: "أضاف مستخدم جديد",
    time: "منذ ساعة",
    type: "success",
    initials: "مخ"
  },
  {
    id: 4,
    user: "سارة أحمد",
    action: "حذفت ملف قديم",
    time: "منذ ساعتين",
    type: "warning",
    initials: "سأ"
  },
];

export function RecentActivity() {
  return (
    <Card className="bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">النشاط الأخير</CardTitle>
        <p className="text-sm text-muted-foreground">آخر الأحداث في النظام</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-300 animate-slide-in-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar className="h-10 w-10 bg-gradient-primary">
                <AvatarFallback className="bg-gradient-primary text-white font-bold">
                  {activity.initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{activity.user}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      activity.type === 'success' 
                        ? 'border-success text-success' 
                        : activity.type === 'warning'
                        ? 'border-warning text-warning'
                        : 'border-info text-info'
                    }`}
                  >
                    {activity.type === 'success' ? 'نجاح' : activity.type === 'warning' ? 'تحذير' : 'معلومة'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
