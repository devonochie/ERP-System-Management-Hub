export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'halfday';
    checkIn?: string;
    checkOut?: string;
    totalHours?: number
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: 'active' | 'inactive';
    avatar: string;
    salary: number;
    joinDate: string;
}


export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'sick' | 'vacation' | 'personal' | 'unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
}

export interface PayrollRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    month: string; // Format: YYYY-MM
    baseSalary: number;
    bonus: number;
    deductions: number;
    netSalary: number;
    status: 'paid' | 'pending' | 'processing';
    paymentDate?: string;
    payslipUrl?: string;
    breakdown: {
        basic: number;
        hra: number;
        conveyance: number;
        medical: number;
        tax: number;
        pf: number;
        otherDeductions: number;
    };
    attendance: {
        workingDays: number;
        presentDays: number;
        leaveDays: number;
    };
}

export interface User {
    id: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'employee';
}