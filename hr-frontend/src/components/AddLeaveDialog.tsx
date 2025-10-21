import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addLeaveRequest, applyLeaveAsync } from '@/store/slices/leavesSlice';
import {
    Dialog,
    DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { fetchEmployeesAsync } from '@/store/slices/employeesSlice';

const leaveFormSchema = z.object({
    employeeId: z.string().min(1, 'Please select an employee'),
    type: z.enum(['sick', 'vacation', 'personal', 'unpaid'], {
        required_error: 'Please select a leave type',
    }),
    startDate: z.date({
        required_error: 'Please select a start date',
    }),
    endDate: z.date({
        required_error: 'Please select an end date',
    }),
    reason: z.string().min(1, 'Please provide a reason').max(1000, 'Reason must be less than 1000 characters'),
    }).refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export function AddLeaveDialog() {
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch();
    const employees = useAppSelector((state) => state.employees.employees);
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
    

    const form = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveFormSchema),
    });

    const onSubmit = (data: LeaveFormValues) => {
        const employee = employees.find((emp) => emp.id === data.employeeId);
        
        if (!employee) {
            toast.error('Employee not found');
            return;
        }

        const days = Math.ceil(
            (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        dispatch(applyLeaveAsync({
            employeeId: data.employeeId,
            employeeName: employee.name,
            type: data.type,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
            endDate: format(data.endDate, 'yyyy-MM-dd'),
            days,
            reason: data.reason,
            status: 'pending' as const,
            appliedDate: format(new Date(), 'yyyy-MM-dd'),
        }))

        toast.success(`Leave request created for ${employee.name}`);
        form.reset();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Leave Request
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>Create Leave Request</DialogTitle>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.role}
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
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="personal">Personal Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                                )}
                            >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                                )}
                            >
                                {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>

                <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Enter reason for leave..."
                        className="min-h-[100px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                </Button>
                <Button type="submit">Create Request</Button>
                </div>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    );
}
