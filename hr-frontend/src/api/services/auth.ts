import { User } from "@/types";
import axiosInstance from "../axios";



export const register = async (userData: Partial<User>): Promise<User> => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
}

export const login = async (email: string, password: string, role: string): Promise<User> => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
}

export const logout = async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
}  