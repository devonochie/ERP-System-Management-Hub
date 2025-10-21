/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const attendanceData = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 95, absent: 5 },
  { month: 'Apr', present: 90, absent: 10 },
  { month: 'May', present: 93, absent: 7 },
  { month: 'Jun', present: 91, absent: 9 },
];

const departmentData = [
  { name: 'Engineering', value: 12, color: 'hsl(var(--primary))' },
  { name: 'Product', value: 8, color: 'hsl(var(--secondary))' },
  { name: 'Design', value: 6, color: 'hsl(var(--success))' },
  { name: 'HR', value: 4, color: 'hsl(var(--warning))' },
];

const payrollData = [
  { month: 'Jan', amount: 450000 },
  { month: 'Feb', amount: 460000 },
  { month: 'Mar', amount: 455000 },
  { month: 'Apr', amount: 470000 },
  { month: 'May', amount: 465000 },
  { month: 'Jun', amount: 480000 },
];

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights and data visualization</p>
          </div>
          <Button className="gradient-primary text-white hover:opacity-90 transition-smooth">
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="attendance" className="rounded-lg">Attendance</TabsTrigger>
            <TabsTrigger value="payroll" className="rounded-lg">Payroll</TabsTrigger>
            <TabsTrigger value="departments" className="rounded-lg">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Attendance Trends</h3>
                  <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="present" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Payroll Expenses</h3>
                  <p className="text-sm text-muted-foreground">Monthly payroll trends</p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">Department Distribution</h3>
                  <p className="text-sm text-muted-foreground">Employee count by department</p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${Math.round((percent || 0) * 100)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="glass-card p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">Department Statistics</h3>
                  <p className="text-sm text-muted-foreground">Detailed breakdown</p>
                </div>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-smooth">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{dept.name}</span>
                        <span className="text-2xl font-bold">{dept.value}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(dept.value / 30) * 100}%`,
                            backgroundColor: dept.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.round((dept.value / 30) * 100)}% of total workforce
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
