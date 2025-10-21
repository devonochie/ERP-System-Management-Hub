import axiosInstance from "../axios";
import { LeaveRequest } from "@/types";

export const applyLeave = async (leaveData: Partial<LeaveRequest>): Promise<LeaveRequest> => {
    const response = await axiosInstance.post('/leave', leaveData);
    return response.data;
}

export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
    const response = await axiosInstance.get<{leaveRequests: LeaveRequest[]}>('/leave');
    return response.data.leaveRequests
}


export const approveLeave = async (id: string, status: string): Promise<LeaveRequest> => {
    const response = await axiosInstance.put(`/leave/${id}/approve`, {
        status
    });
    return response.data;
}

export const rejectLeave = async (id: string, status: string): Promise<LeaveRequest> => {
    const response = await axiosInstance.put(`/leave/${id}/reject`, {
        status
    });
    return response.data;
}

export const getLeaveBalance = async (employeeId: string): Promise<{ balance: number }> => {
    const response = await axiosInstance.get(`/leave/${employeeId}/balance`);
    return response.data;
}

