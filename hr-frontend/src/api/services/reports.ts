/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../axios";
import { PayrollRecord, AttendanceRecord, LeaveRequest } from "@/types";

export const getPayrollReport = async (): Promise<PayrollRecord[]> => {
    const response = await axiosInstance.get('/reports/payroll');
    return response.data;
}

export const getAttendanceReport = async (): Promise<AttendanceRecord[]> => {
    const response = await axiosInstance.get('/reports/attendance');
    return response.data;
}

export const getLeaveReport = async (): Promise<LeaveRequest[]> => {
    const response = await axiosInstance.get('/reports/leaves');
    return response.data;
}

export const getEmployeeReport = async (): Promise<any> => {
    const response = await axiosInstance.get('/reports/employees');
    return response.data;
}

