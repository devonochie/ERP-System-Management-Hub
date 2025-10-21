import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addPayrollRecord, generatePayrollAsync } from '@/store/slices/payrollSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchEmployeesAsync } from '@/store/slices/employeesSlice';

const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  month: z.string().min(1, 'Month is required'),
  baseSalary: z.string().min(1, 'Base salary is required'),
  workingDays: z.string().min(1, 'Working days is required'),
  presentDays: z.string().min(1, 'Present days is required'),
  leaveDays: z.string().min(1, 'Leave days is required'),
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

export function AddPayrollDialog() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state) => state.employees.employees);
  const [filters, setFilters] = useState({
      search: "",
      department: "",
    });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    dispatch(fetchEmployeesAsync({
      page,
      limit,
      filters,
    }))
  }, [dispatch, page, limit, filters])

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: '',
      month: '',
      baseSalary: '0',
      workingDays: '22',
      presentDays: '22',
      leaveDays: '0',
    },
  });

  const baseSalary = parseFloat(form.watch('baseSalary') || '0');
  
  // Calculate breakdown based on backend logic
  const basic = baseSalary * 0.5;
  const hra = baseSalary * 0.2;
  const conveyance = baseSalary * 0.1;
  const medical = baseSalary * 0.1;
  const pf = baseSalary * 0.12;
  
  const grossSalary = basic + hra + conveyance + medical;
  
  // Simple tax calculation (you can adjust this based on backend logic)
  const calculateTax = (gross: number) => {
    if (gross <= 250000) return 0;
    if (gross <= 500000) return (gross - 250000) * 0.05;
    if (gross <= 1000000) return 12500 + (gross - 500000) * 0.2;
    return 112500 + (gross - 1000000) * 0.3;
  };
  
  const tax = calculateTax(grossSalary);
  const totalDeductions = tax + pf;
  const netSalary = grossSalary - totalDeductions;

  const onSubmit = async (data: PayrollFormValues) => {
    const monthNumber = parseInt(data.month.split('-')[1]);
    const employee = employees.find(e => e.id === data.employeeId);
    if (!employee) return;

    dispatch(generatePayrollAsync({
      employeeId: data.employeeId,
      month: String(monthNumber)
    }))
    toast.success(`Payroll record created for ${employee.name}`);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-white hover:opacity-90 transition-smooth">
          <Plus className="mr-2 h-4 w-4" />
          Create Payroll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Payroll Record</DialogTitle>
          <DialogDescription>
            Create a new payroll record for an employee for a specific month.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const employee = employees.find(e => e.id === value);
                      if (employee) {
                        form.setValue('baseSalary', employee.salary.toString());
                      }
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                  <Input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    pattern="\d{2}"
                    {...field}
                    onChange={e => {
                    // Only allow 2 digits
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                    field.onChange(value);
                    }}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...field} 
                      disabled 
                      className="bg-muted/50" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="workingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presentDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Present Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leaveDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm font-semibold mb-2">Salary Breakdown</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Basic (50%):</div>
                <div className="text-right">${basic.toLocaleString()}</div>
                <div>HRA (20%):</div>
                <div className="text-right">${hra.toLocaleString()}</div>
                <div>Conveyance (10%):</div>
                <div className="text-right">${conveyance.toLocaleString()}</div>
                <div>Medical (10%):</div>
                <div className="text-right">${medical.toLocaleString()}</div>
                <div className="font-semibold">Gross Salary:</div>
                <div className="text-right font-semibold">${grossSalary.toLocaleString()}</div>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Tax:</div>
                  <div className="text-right text-destructive">${tax.toLocaleString()}</div>
                  <div>PF (12%):</div>
                  <div className="text-right text-destructive">${pf.toLocaleString()}</div>
                  <div className="font-semibold text-foreground">Total Deductions:</div>
                  <div className="text-right font-semibold text-destructive">${totalDeductions.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Salary:</span>
                <span className="text-2xl font-bold text-primary">
                  ${netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-primary text-white">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
