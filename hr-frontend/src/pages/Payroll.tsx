import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchEmployeePayrollAsync, fetchPayrollRecordsAsync, generatePayslipAsync, processPaymentAsync, updatePayrollStatus } from '@/store/slices/payrollSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DollarSign, Download, CheckCircle2, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AddPayrollDialog } from '@/components/AddPayrollDialog';
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Payroll() {
  const dispatch = useAppDispatch();
  const payroll = useAppSelector((state) => state.payroll.records);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    month: selectedMonth,
    status: "",
    employeeId: ''
  });

  useEffect(() => {
    if (selectedDate) {
      const monthStr = format(selectedDate, 'yyyy-MM');
      setSelectedMonth(monthStr);
    }
  }, [selectedDate]);

  useEffect(() => {
    dispatch(fetchPayrollRecordsAsync({
      page,
      limit,
      filters,
    }))
  }, [dispatch,  page, limit, filters])

  const handlePayment = (id: string, name: string, amount: number) => {
    const paymentDate = new Date().toISOString().split('T')[0];
    dispatch(processPaymentAsync({ id, paymentDate }))

    toast.success(`Payment of $${amount.toLocaleString()} processed for ${name}`);
  };

  const handlePayslipDownload = async (id: string, name: string) => {
    try {
      await dispatch(generatePayslipAsync(id))
      toast.success(`Payslip generated for ${name}`);
    } catch (error) {
      toast.error(error || 'Failed to generate payslip');
    }
  };

  // Filter payroll based on selected date (month and year)
  const filteredPayroll = useMemo(() => {
    if (!selectedDate) return payroll;
    const selectedMonthYear = format(selectedDate, 'yyyy-MM');
    return payroll.filter(r => r.month === selectedMonthYear);
  }, [payroll, selectedDate]);

  // Helper to format month from YYYY-MM to readable format
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return format(date, 'MMMM yyyy');
  };

  const totalPending = filteredPayroll
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.netSalary, 0);

  const totalPaid = filteredPayroll
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.netSalary, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Payroll
            </h1>
            <p className="text-muted-foreground mt-2">Manage employee compensation and payments</p>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMMM yyyy") : <span>Filter by month</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(undefined)}
              >
                Clear Filter
              </Button>
            )}
            <AddPayrollDialog />
            <Button className="gradient-primary text-white hover:opacity-90 transition-smooth">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="stat-card gradient-primary">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium text-white/80">Total Paid</p>
                <h3 className="text-3xl font-bold mt-2">${totalPaid.toLocaleString()}</h3>
                <p className="text-sm text-white/70 mt-2">This month</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-white/80" />
            </div>
          </Card>

          <Card className="stat-card bg-warning/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <h3 className="text-3xl font-bold mt-2">${totalPending.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredPayroll.filter(r => r.status === 'pending').length} employees
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-warning" />
            </div>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">Payroll Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-semibold">Employee</th>
                  <th className="text-left p-4 font-semibold">Month</th>
                  <th className="text-left p-4 font-semibold">Gross Salary</th>
                  <th className="text-left p-4 font-semibold">Deductions</th>
                  <th className="text-left p-4 font-semibold">Net Salary</th>
                  <th className="text-left p-4 font-semibold">Attendance</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
                <tbody>
                {filteredPayroll.map((record) => {
                  const grossSalary = record.breakdown.basic + record.breakdown.hra + 
                          record.breakdown.conveyance + record.breakdown.medical
                  return (
                  <tr key={record.id} className="border-b border-border hover:bg-muted/20 transition-smooth">
                    <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                      {record.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                      <div className="font-medium">{record.employeeName}</div>
                      <div className="text-xs text-muted-foreground">ID: {record.employeeId}</div>
                      </div>
                    </div>
                    </td>
                    <td className="p-4">
                    <span className="text-sm">{formatMonth(record.month)}</span>
                    </td>
                    <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium">${grossSalary.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                      Base: ${record.breakdown.basic.toLocaleString()}
                      </div>
                    </div>
                    </td>
                    <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-destructive font-medium">${record.deductions.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                      Tax: ${record.breakdown.tax.toLocaleString()} | PF: ${record.breakdown.pf.toLocaleString()}
                      </div>
                    </div>
                    </td>
                    <td className="p-4">
                    <span className="font-bold text-lg">${record.netSalary.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                    <div className="text-sm">
                      <div>{record.attendance.presentDays}/{record.attendance.workingDays} days</div>
                      <div className="text-xs text-muted-foreground">
                      {record.attendance.leaveDays} leave{record.attendance.leaveDays !== 1 ? 's' : ''}
                      </div>
                    </div>
                    </td>
                    <td className="p-4">
                    <Badge className={
                      record.status === 'paid' ? 'bg-success/20 text-success' :
                      record.status === 'processing' ? 'bg-secondary/20 text-secondary' :
                      'bg-warning/20 text-warning'
                    }>
                      {record.status}
                    </Badge>
                    </td>
                    <td className="p-4">
                    {record.status === 'pending' ? (
                      <Button
                      size="sm"
                      onClick={() => handlePayment(record.id, record.employeeName, record.netSalary)}
                      className="bg-success hover:bg-success/90 text-white"
                      >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Pay
                      </Button>
                    ) : (
                      <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePayslipDownload(record.id, record.employeeName)}
                      >
                      <Download className="mr-1 h-3 w-3" />
                      Payslip
                      </Button>
                    )}
                    </td>
                  </tr>
                  );
                })}
                </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
