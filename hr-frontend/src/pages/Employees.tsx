import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {  deleteEmployeeAsync, fetchEmployeesAsync, updateEmployeeAsync } from '@/store/slices/employeesSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreVertical, Pencil, Trash2, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddEmployeeDialog } from '@/components/AddEmployeeDialog';
import { EditEmployeeDialog } from '@/components/EditEmployeeDialog';
import { toast } from 'sonner';
import { Employee } from '@/types';

export default function Employees() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state) => state.employees.employees);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchEmployeesAsync({
      page,
      limit,
      filters,
    }));
}, [dispatch, page, limit, filters]);

  const handleDelete = (id: string, name: string) => {
    dispatch(deleteEmployeeAsync(id))
    toast.success(`${name} has been made in-active from the system`);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Employees
            </h1>
            <p className="text-muted-foreground mt-2">Manage your team members</p>
          </div>
          <Button 
            onClick={() => setAddDialogOpen(true)}
            className="gradient-primary text-white hover:opacity-90 transition-smooth shadow-lg hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="glass-card p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
          </div>
        </Card>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="glass-card glass-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handleEdit(employee)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => handleDelete(employee.id, employee.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Department</span>
                  <Badge variant="secondary" className="bg-muted">
                    {employee.department}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={employee.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted'}>
                    {employee.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Salary</span>
                  <span className="font-semibold">${employee.salary.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Joined {employee.joinDate}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <AddEmployeeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        <EditEmployeeDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          employee={selectedEmployee}
        />
      </div>
    </div>
  );
}
