import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, gradient = false }: StatCardProps) {
  return (
    <Card className={`stat-card-glow ${gradient ? 'gradient-primary' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={gradient ? 'text-white' : ''}>
          <p className={`text-sm font-medium ${gradient ? 'text-white/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${gradient ? 'text-white/90' : trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient ? 'bg-white/20' : 'bg-primary/10'}`}>
          <Icon className={`w-6 h-6 ${gradient ? 'text-white' : 'text-primary'}`} />
        </div>
      </div>
    </Card>
  );
}
