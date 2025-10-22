import { StatCard } from '@/components/StatCard';
import { Users, Calendar, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', attendance: 92, leaves: 8 },
  { month: 'Feb', attendance: 88, leaves: 12 },
  { month: 'Mar', attendance: 95, leaves: 5 },
  { month: 'Apr', attendance: 90, leaves: 10 },
  { month: 'May', attendance: 93, leaves: 7 },
  { month: 'Jun', attendance: 91, leaves: 9 },
];

export default function Dashboard() {
  const employees = useAppSelector((state) => state.employees.employees);
  const leaves = useAppSelector((state) => state.leaves.requests);
  const attendance = useAppSelector((state) => state.attendance.records);
  const payroll = useAppSelector((state) => state.payroll.records);

  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length || 0
  const todayPresent = attendance.filter(record => record.status === 'present' || record.status === 'late').length || 0
  const pendingPayroll = payroll.filter(record => record.status === 'pending').length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={Users}
            trend={{ value: '+2 this month', isPositive: true }}
            gradient
          />
          <StatCard
            title="Present Today"
            value={todayPresent}
            icon={Calendar}
            trend={{ value: `${Math.round((todayPresent / employees.length) * 100)}% attendance`, isPositive: true }}
          />
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves}
            icon={FileText}
            trend={{ value: '3 requests', isPositive: false }}
          />
          <StatCard
            title="Pending Payroll"
            value={pendingPayroll}
            icon={DollarSign}
            trend={{ value: '$157,500', isPositive: false }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Attendance Trend</h3>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="leaves" 
                  fill="hsl(var(--secondary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {leaves.slice(0, 3).map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-smooth">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {leave.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{leave.employeeName}</p>
                    <p className="text-sm text-muted-foreground">Applied for {leave.type} leave</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'approved' ? 'bg-success/20 text-success' :
                    leave.status === 'pending' ? 'bg-warning/20 text-warning' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    {leave.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{leave.days} days</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
