import { Document, Types } from "mongoose";

export interface IEmployee extends Document {
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

export interface IAttendance extends Document {
    id: string
    employeeId: Types.ObjectId;
    employeeName: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'halfday';
    checkIn?: string;
    checkOut?: string;
    totalHours?: number
}

export interface ILeaveRequest extends Document {
    id: string
    employeeId: Types.ObjectId;
    employeeName: string;
    type: 'sick' | 'vacation' | 'personal' | 'unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedDate: string;
}


export interface IPayrollRecord extends Document {
    employeeId: Types.ObjectId;
    employeeName: string;
    month: string; 
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


export interface IUser extends Document {
    name: string
    email: string;
    password: string;
    role: 'admin' | 'hr' | 'employee';
    employeeId?: Types.ObjectId;
    isActive: boolean;
    lastLogin?: Date;
}