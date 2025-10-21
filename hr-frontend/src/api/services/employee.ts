import axiosInstance from "../axios"
import { Employee } from "@/types";

export const fetchEmployees = async (
    page: number = 1,
    limit: number = 10,
    filters?: {
        search?: string;      
        department?: string;  
        title?: string;       
    }): Promise<{ employees: Employee[]; total: number }> => {
    const params = new URLSearchParams();

    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters?.search) params.append("search", filters.search);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.title) params.append("title", filters.title);

    const url = `/employees?${params.toString()}`;
    const response = await axiosInstance.get<{ employees: Employee[]; total: number }>(url);

    return response.data;
};

export const fetchEmployeeById = async (id: string): Promise<Employee> => {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
}

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await axiosInstance.post('/employees', employeeData);
    return response.data;
}

export const updatedEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await axiosInstance.put(`/employees/${id}`, employeeData);
    return response.data;
}

export const deletedEmployee = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/employees/${id}`);
}
