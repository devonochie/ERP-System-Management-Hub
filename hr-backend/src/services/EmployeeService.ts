import { EmployeeModel } from "../models/Employee";
import { IEmployee } from "../types";


export class EmployeeService {
    async createEmployee(employeeData: Partial<IEmployee>): Promise<IEmployee> {
        const employee = new EmployeeModel(employeeData)
        return employee.save()
    }

    async getEmployees(
        page: number = 1,
        limit: number = 10,
        filters: any = {}
    ): Promise<{employees: IEmployee[], total: number}> {
        const skip = (page - 1) * limit
        
        const query: any = {}
        if(filters.department) query.department = filters.department
        if(filters.status) query.status = filters.status
        if(filters.search) query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
        ];

        const [employees, total ] = await Promise.all([
            EmployeeModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            EmployeeModel.countDocuments(query)
        ])
        return { employees, total}
    }

    async getEmployeesById(id: string): Promise<IEmployee | null> {
        return await EmployeeModel.findById(id)
    }

    async updateEmployee(id: string, updateData: Partial<IEmployee> ): Promise<IEmployee | null > {
        const employee = await EmployeeModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true})
        return employee
    }

    async deleteEmployee(id: string): Promise<boolean> {
        const employee = await EmployeeModel.findByIdAndUpdate(id, { status: 'inactive'}, { new : true})
        
        return !!employee
    }

    async employeeStats(): Promise<any> {
        const stats = await EmployeeModel.aggregate([
            {
                $group: {
                _id: '$department',
                count: { $sum: 1 },
                totalSalary: { $sum: '$salary' },
                avgSalary: { $avg: '$salary' }
                }
            },
            {
                $project: {
                department: '$_id',
                count: 1,
                totalSalary: 1,
                avgSalary: { $round: ['$avgSalary', 2] }
                }
            }
        ])

        const totalEmployees = await EmployeeModel.countDocuments({ status: 'active' });
        const totalSalary = await EmployeeModel.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$salary' } } }
        ]);

        return {
            totalEmployees,
            totalSalary: totalSalary[0]?.total || 0,
            byDepartment: stats
        };
    }
}

export const employeeService = new EmployeeService()