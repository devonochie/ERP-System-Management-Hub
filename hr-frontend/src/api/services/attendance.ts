import axiosInstance from "../axios";
import { AttendanceRecord } from "@/types";

export const clockedIn = async (attendanceData: { employeeId: string; date: string; checkIn: string }): Promise<AttendanceRecord> => {
    const { employeeId, date, checkIn } = attendanceData;
    const response = await axiosInstance.post('/attendance/clock-in', {
        employeeId,
        date,
        checkIn
    })
    return response.data;
}

export const clockedOut = async (attendanceData: { employeeId: string; date: string; checkOut: string }): Promise<AttendanceRecord> => {
    const { employeeId, date, checkOut } = attendanceData;
    const response = await axiosInstance.post('/attendance/clock-out', {
        employeeId,
        date,
        checkOut
    });
    return response.data;
}

export const getTodayAttendance = async(): Promise<AttendanceRecord[]> =>  {
    const response = await axiosInstance.get('/attendance/today')
    return response.data
}

export const markAbsent = async (employeeId: string, date: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post('/attendance/absent', { employeeId, date });
    return response.data;
}

export const getAttendanceHistory = async (employeeId: string): Promise<AttendanceRecord[]> => {
    const response = await axiosInstance.get(`/attendance/${employeeId}/history`);
    return response.data;
}

export const getAttendanceStats = async (employeeId: string, month: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.get(`/attendance/${employeeId}/stats`, {
        params: { month }
    });
    return response.data;
}

