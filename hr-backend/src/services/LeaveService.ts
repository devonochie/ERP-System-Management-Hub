import { EmployeeModel } from "../models/Employee"
import { LeaveRequestModel } from "../models/LeaveRequest"
import { ILeaveRequest } from "../types"


export class LeaveService {
    async applyForLeave(leaveData: {
        employeeId: string
        type: "sick" | "vacation" | "personal" | "unpaid",
        startDate: string,
        endDate: string,
        reason: string
    }): Promise<ILeaveRequest> {
        const employee = await EmployeeModel.findById(leaveData.employeeId)
        if(!employee) {
            throw new Error("Employee not found")
        }

        const start = new Date(leaveData.startDate)
        const end = new Date(leaveData.endDate)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))  + 1

        // check overlapping leave 
        const overLapping = await LeaveRequestModel.findOne({
            employeeId: leaveData.employeeId,
            status: { $in: ['pending', 'approved']},
            $or: [
                { 
                    startDate: { $lte: leaveData.startDate},
                    endDate: { $lte: leaveData.endDate}
                }
            ]
        })

        if(overLapping) {
            throw new Error("Overlapping leave request exists")
        }

        const leaveRequest = new LeaveRequestModel({
            ...leaveData,
            employeeName: employee.name,
            days,
            appliedDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        })

        return await leaveRequest.save()
    }

    async getLeaveRequest( filters: any = {}, 
        page: number = 1, 
        limit: number = 10
    ): Promise<{leaveRequests: ILeaveRequest[], total: number}> {
        const skip = (page - 1) * limit
        const query : any = {}

        if(filters.employeeId) query.employeedId = filters.employeeId
        if(filters.status) query.status = filters.status
        if(filters.type) query.type = filters.type
        if(filters.startDate && filters.endDate) {
            query.$or = [
                {
                    startDate: {$lte: filters.endDate},
                    endDate: { $gte: filters.startDate }
                }
            ]
        }
        
        const [ leaveRequests, total ] = await Promise.all([
            LeaveRequestModel.find(query)
                .populate('employeeId', 'name email department')
                .sort({ appliedDate: -1 })
                .limit(limit).
                skip(skip),
            LeaveRequestModel.countDocuments(query)
        ])

        return { leaveRequests, total }
    }

    async approveLeave(id: string, status: string) : Promise<ILeaveRequest | null> {
        const leaveRequest = await LeaveRequestModel.findByIdAndUpdate( 
            id, 
            { status },
            { new: true }  
        )

        return leaveRequest
    }

    async rejectLeave(id: string, status: string) : Promise<ILeaveRequest | null> {
        const leaveRequest = await LeaveRequestModel.findByIdAndUpdate(id, { status: 'rejected'}, { new: true })
        return leaveRequest
    }

    async getEmployeeLeaveBalance(employeeId: string): Promise<any> {
        const currentYear = new Date().getFullYear()
        const startDate = `${currentYear}-01-01`
        const endDate = `${currentYear}-12-31`

        const leaveStats = await LeaveRequestModel.aggregate([
            {
                $match: {
                    employeeId: employeeId,
                    status: 'approved',
                    startDate: { $gte: startDate },
                    endDate: { $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalLeaves: { $sum: '$days' }
                }
            }
        ])

        const entilements = {
            sick: 10,
            vacation: 15,
            personal: 5,
            unpaid: 0
        }

        const balance: any = {}
        for(const type of ["sick", "vacation", "personal", "unpaid"]) {
            const used = leaveStats.find(ls => ls.id === type)?.days || 0
            balance[type] = {
                entitled: entilements[type as keyof typeof entilements],
                used,
                remaining: entilements[type as keyof typeof entilements] - used
            }
        }

        return balance
    }
}

export const leaveService = new LeaveService()