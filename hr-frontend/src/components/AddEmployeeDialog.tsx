import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addEmployee, createEmployeeAsync } from '@/store/slices/employeesSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { z } from 'zod';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  role: z.string().min(2, 'Role is required').max(100, 'Role is too long'),
  department: z.string().min(2, 'Department is required'),
  salary: z.number().min(0, 'Salary must be positive').max(10000000, 'Invalid salary'),
  joinDate: z.string().min(1, 'Join date is required'),
});

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departments = ['Engineering', 'Product', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'];

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
      
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    }
    
    if (currentStep === 2) {
      if (!formData.role.trim()) newErrors.role = 'Role is required';
      if (!formData.department) newErrors.department = 'Department is required';
    }
    
    if (currentStep === 3) {
      const salary = parseFloat(formData.salary);
      if (!formData.salary) newErrors.salary = 'Salary is required';
      else if (isNaN(salary) || salary <= 0) newErrors.salary = 'Invalid salary amount';
      
      if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;

    try {
      const validated = employeeSchema.parse({
        ...formData,
        salary: parseFloat(formData.salary),
      });
      dispatch(createEmployeeAsync({
        email: validated.email,
        name: validated.name,
        role: validated.role,
        department: validated.department,
        salary: validated.salary,
        joinDate: validated.joinDate,
        status: 'active' as const,
        avatar: validated.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      }))
      
      toast.success(`${validated.name} has been added successfully!`);
      handleClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      salary: '',
      joinDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Add New Employee
          </DialogTitle>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-smooth ${
                  s <= step ? 'gradient-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="mt-2"
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.smith@company.com"
                  className="mt-2"
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="role">Job Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Senior Developer"
                  className="mt-2"
                />
                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive mt-1">{errors.department}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="salary">Annual Salary ($) *</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g., 75000"
                  className="mt-2"
                />
                {errors.salary && <p className="text-sm text-destructive mt-1">{errors.salary}</p>}
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="mt-2"
                />
                {errors.joinDate && <p className="text-sm text-destructive mt-1">{errors.joinDate}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3">
          {step > 1 && (
            <Button onClick={handleBack} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1 gradient-primary text-white ml-auto">
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 gradient-success text-white ml-auto">
              <Check className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
