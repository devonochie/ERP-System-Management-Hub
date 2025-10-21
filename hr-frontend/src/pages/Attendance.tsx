import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clockIn, clockInAsync, clockOut, clockOutAsync, fetchTodayAttendanceAsync } from '@/store/slices/attendanceSlice';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { fetchEmployeesAsync } from '@/store/slices/employeesSlice';

export default function Attendance() {
  const dispatch = useAppDispatch();
  const attendance = useAppSelector((state) => state.attendance.records);
  const {employees} = useAppSelector((state) => state.employees);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
  });

  useEffect(() => {
    dispatch(fetchEmployeesAsync({
      page,
      limit,
      filters,
    }));
  }, [dispatch, page, limit, filters]);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(r => r.date === today);

  
  const stats = {
    present: todayRecords.filter(r => r.status === 'present' && r.checkIn && !r.checkOut).length,
    late:  todayRecords.filter(r => r.status === 'late' && r.checkIn && !r.checkOut).length,
    checkedOut: todayRecords.filter(r => r.checkOut).length,
    notCheckedIn: employees.length - todayRecords.length,
  };

  const now = new Date();

  const handleClockIn = (employeeId: string, employeeName: string) => {
    dispatch(clockInAsync({
        employeeId: employeeId,
        date: today,
        checkIn: now.toTimeString().split(' ')[0]
    }))
    toast({
      title: "Clocked In",
      description: `${employeeName} has been clocked in successfully.`,

    });
  };

  const handleClockOut = (employeeId: string, employeeName: string) => {
    dispatch(clockOutAsync({
      employeeId: employeeId,
      date: today, 
      checkOut: now.toString(),     
    }))

    toast({
      title: "Clocked Out",
      description: `${employeeName} has been clocked out successfully.`,
    });
  };

  const getEmployeeStatus = (employeeId: string) => {
    const record = todayRecords.find(r => r.employeeId === employeeId);
    if (!record) return 'not-clocked-in';
    if (record.checkOut) return 'clocked-out';
    return 'clocked-in';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: { bg: 'bg-success/20', text: 'text-success', icon: CheckCircle2 },
      absent: { bg: 'bg-destructive/20', text: 'text-destructive', icon: XCircle },
      late: { bg: 'bg-warning/20', text: 'text-warning', icon: AlertCircle },
      halfday: { bg: 'bg-secondary/20', text: 'text-secondary', icon: Clock },
    };
    const variant = variants[status as keyof typeof variants] || variants.present;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.bg} ${variant.text} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Attendance
          </h1>
          <p className="text-muted-foreground mt-2">Track employee attendance and working hours</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="stat-card gradient-success">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-white/80">Clocked In</p>
                <h3 className="text-3xl font-bold mt-2">{stats.present || stats.late}</h3>
              </div>
              <CheckCircle2 className="w-8 h-8 text-white/80" />
            </div>
          </Card>

          <Card className="stat-card bg-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clocked Out</p>
                <h3 className="text-3xl font-bold mt-2">{stats.checkedOut}</h3>
              </div>
              <LogOut className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="stat-card bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Checked In</p>
                <h3 className="text-3xl font-bold mt-2">{stats.notCheckedIn}</h3>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Clock In/Out Section */}
        <Card className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Clock In / Clock Out</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => {
                const status = getEmployeeStatus(employee.id);
                const record = todayRecords.find(r => r.employeeId === employee.id);
                
                return (
                  <Card key={employee.id} className="p-4 hover:shadow-elegant transition-smooth">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.role}</p>
                      </div>
                    </div>
                    
                    {status === 'not-clocked-in' && (
                      <Button 
                        onClick={() => handleClockIn(employee.id, employee.name)}
                        className="w-full"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Clock In
                      </Button>
                    )}
                    
                    {status === 'clocked-in' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Clocked in at:</span>
                          <span className="font-medium">{record?.checkIn}</span>
                        </div>
                        <Button 
                          onClick={() => handleClockOut(employee.id, employee.name)}
                          variant="outline"
                          className="w-full"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Clock Out
                        </Button>
                      </div>
                    )}
                    
                    {status === 'clocked-out' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Clocked in:</span>
                          <span className="font-medium">{record?.checkIn}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Clocked out:</span>
                          <span className="font-medium">{record?.checkOut}</span>
                        </div>
                        <Badge className="w-full justify-center bg-success/20 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Attendance Records */}
        {todayRecords.length > 0 && (
          <Card className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Today's Attendance Records</h3>
                <Badge variant="secondary" className="ml-2">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 font-semibold">Employee</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Check In</th>
                    <th className="text-left p-4 font-semibold">Check Out</th>
                    <th className="text-left p-4 font-semibold">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.map((record) => {
                    const checkIn = record.checkIn ? new Date(`${record.date} ${record.checkIn}`) : null;
                    const checkOut = record.checkOut ? new Date(`${record.date} ${record.checkOut}`) : null;
                    const hours = checkIn && checkOut ? 
                      ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1) : 
                      '-';
                    
                    const status = record.checkOut ? 'clocked-out' : 'clocked-in';

                    return (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/20 transition-smooth">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                              {record.employeeName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{record.employeeName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={status === 'clocked-out' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}>
                            {status === 'clocked-out' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {status === 'clocked-out' ? 'Completed' : 'Active'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{record.checkIn || '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{record.checkOut || '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium">{record.totalHours}h</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
