import { Types } from "mongoose"
import { AttendanceModel } from "../models/Attendance"
import { EmployeeModel } from "../models/Employee"
import { IAttendance } from "../types"

class AttendanceService {
    async clockIn(attendanceData: {
        employeeId: string
        date: string,
        checkIn: string
    }): Promise<IAttendance> {
        const employee = await EmployeeModel.findById(attendanceData.employeeId)
        if(!employee) throw new Error('Employee not found')

        const today = new Date().toISOString().split('T')[0];
        const date = attendanceData.date ?? today;


        const existingAttendance = await AttendanceModel.findOne({
            employeeId: attendanceData.employeeId,
            date
        })

        if(existingAttendance){
            throw new Error("Employee clockin recorded")
        } 
        
        const checkInTime = new Date(`${date}T${attendanceData.checkIn}`);
        
        const expectedTime = new Date(`${today}T09:00:00`)
        const status = checkInTime.getTime() > expectedTime.getTime() ? 'late' : 'present';

        const attendance = new AttendanceModel({
            employeeId: attendanceData.employeeId,
            date,
            checkIn: checkInTime,
            employeeName: employee.name,
            status,
            totalHours: 0
        })

        return attendance.save()
    }

    async clockOut(attendanceData: {
        employeeId: string,
        date: string,
        checkOut: string
    }): Promise<IAttendance> {

        const attendance = await AttendanceModel.findOne({
            employeeId: attendanceData.employeeId,
            date: attendanceData.date
        })

        if(!attendance) throw new Error("No clock in record found for today")
        
        if(attendance.checkOut) throw new Error('Already clocked out for today')
        
        attendance.checkOut = attendanceData.checkOut
        
        if (attendance.checkIn) {
            const checkIn = new Date(attendance.checkIn);
            const checkOut = new Date(attendanceData.checkOut);
            const diffMs = checkOut.getTime() - checkIn.getTime();
            const totalHours = Number( diffMs / (1000 * 60 * 60))
            attendance.totalHours = Math.round(totalHours * 100) / 100;
        }

        return await attendance.save()
    }

    async getTodayAttendance(): Promise<IAttendance[]> {
        const today = new Date().toISOString().split("T")[0]; 

        return AttendanceModel.find({
            date: today
        });
    }


    async getAttendanceHistory(
        employeeId: string,
        startDate: string,
        endDate: string,
        page: number = 1,
        limit: number,
    ): Promise<{attendance: IAttendance[]; total: number}> {
        const skip = (page - 1 ) * limit

        const query: any = {
            employeeId: new Types.ObjectId(employeeId),
            date: { $gte: startDate, $lte: endDate }
        }

        const [attendance, total ] = await Promise.all([
            AttendanceModel.find()
                .skip(skip)
                .limit(limit)
                .sort({ datet: -1}),
            AttendanceModel.countDocuments(query)

        ])

        return { attendance, total}
    }

    async getAttendanceStats(employeeId: string, month: string): Promise<any> {
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;

        const stats = await AttendanceModel.aggregate([
        {
            $match: {
            employeeId: new Types.ObjectId(employeeId),
            date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalHours: { $sum: '$totalHours' }
            }
        }
        ]);

        const totalDays = stats.reduce((sum, stat) => sum + stat.count, 0);
        const presentDays = stats.find(stat => stat._id === 'present')?.count || 0;
        const absentDays = stats.find(stat => stat._id === 'absent')?.count || 0;
        const lateDays = stats.find(stat => stat._id === 'late')?.count || 0;

        return {
        totalDays,
            presentDays,
            absentDays,
            lateDays,
            attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
            totalHours: stats.reduce((sum, stat) => sum + (stat.totalHours || 0), 0)
        };
    }

    async markAbsent(employeeId: string, date: string): Promise<IAttendance> {
        const employee = await EmployeeModel.findById(employeeId)
        if(!employee) throw new Error("Employee not found")
        
        const existingAttendanc = await AttendanceModel.findOne({
            employeeId,
            date
        })

        if(!existingAttendanc) throw new Error("Attendance already recorded for this date")

        const attendance = new AttendanceModel({
            employeeId,
            employeeName: employee.name,
            date,
            status: "absent",
        })
    
        return attendance.save()
    }
}


export const attendanceService = new AttendanceService()