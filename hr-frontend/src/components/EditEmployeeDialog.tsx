import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateEmployee, updateEmployeeAsync,  } from '@/store/slices/employeesSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { z } from 'zod';
import { Employee } from '@/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  role: z.string().min(2, 'Role is required').max(100, 'Role is too long'),
  department: z.string().min(2, 'Department is required'),
  salary: z.number().min(0, 'Salary must be positive').max(10000000, 'Invalid salary'),
  joinDate: z.string().min(1, 'Join date is required'),
  status: z.enum(['active', 'inactive']),
});

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EditEmployeeDialog({ open, onOpenChange, employee }: EditEmployeeDialogProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    salary: '',
    joinDate: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const departments = ['Engineering', 'Product', 'Design', 'Human Resources', 'Marketing', 'Sales', 'Finance'];

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        salary: employee.salary.toString(),
        joinDate: employee.joinDate,
        status: employee.status,
      });
    }
  }, [employee]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    
    const salary = parseFloat(formData.salary);
    if (!formData.salary) newErrors.salary = 'Salary is required';
    else if (isNaN(salary) || salary <= 0) newErrors.salary = 'Invalid salary amount';
    
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !employee) return;

    try {
      const validated = employeeSchema.parse({
        ...formData,
        salary: parseFloat(formData.salary),
      });

      const updatedEmployee: Employee = {
        ...employee,
        ...validated,
        avatar: validated.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };

      dispatch(updateEmployeeAsync({id: employee.id, employeeData: updatedEmployee as Partial<Employee> }))
      toast.success(`${validated.name}'s information has been updated!`);
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
    setErrors({});
    onOpenChange(false);
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Edit Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-role">Job Role *</Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-2"
              />
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role}</p>}
            </div>
            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-salary">Annual Salary ($) *</Label>
              <Input
                id="edit-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="mt-2"
              />
              {errors.salary && <p className="text-sm text-destructive mt-1">{errors.salary}</p>}
            </div>
            <div>
              <Label htmlFor="edit-joinDate">Join Date *</Label>
              <Input
                id="edit-joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="mt-2"
              />
              {errors.joinDate && <p className="text-sm text-destructive mt-1">{errors.joinDate}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gradient-primary text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
