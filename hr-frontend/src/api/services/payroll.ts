/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../axios";
import { PayrollRecord } from "@/types";

export const generatePayroll = async (employeeId: string, month: string): Promise<{ payrollRecord: PayrollRecord }> => {
    const response = await axiosInstance.post('/payroll/generate', { employeeId, month });
    return response.data;
};

export const generateBulkPayroll = async (month: string): Promise<PayrollRecord[]> => {
    const response = await axiosInstance.post(`/payroll/generate/${month}`);
    return response.data;
}

export async function fetchPayrollRecords(params: {
    page?: number;
    limit?: number;
    filters?: {
        month?: string;
        status?: string;
        employeeId?: string;
    };
}): Promise<{ payrollRecords: PayrollRecord[]; total: number }> {
    const searchParams = new URLSearchParams();

    searchParams.append("page", (params.page ?? 1).toString());
    searchParams.append("limit", (params.limit ?? 10).toString());

    // Add filters as nested object
    if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
            if (value) {
                searchParams.append(`filters[${key}]`, value);
            }
        });
    }

    const url = `/payroll?${searchParams.toString()}`;
    const response = await axiosInstance.get(url);
    return response.data;
}

export const fetchEmployeePayroll = async (employeeId: string, month: string): Promise<PayrollRecord> => {
    const response = await axiosInstance.get(`/payroll/${employeeId}/${month}`);
    return response.data;
}

export const processPayment = async (id: string, paymentDate: string): Promise<{ payrollRecord: PayrollRecord }> => {
    const response = await axiosInstance.post(`/payroll/${id}/process`, { paymentDate });
    return response.data;
};

export const generatePayslip = async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/payroll/payslip/${id}`, { responseType: 'blob' });
    return response.data;
}

export const fetchPayrollSummary = async (month: string): Promise<any> => {
    const response = await axiosInstance.get(`/payroll/summary/${month}`);
    return response.data;
}

