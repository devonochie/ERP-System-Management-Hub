import { NextFunction, Request, Response } from "express";
import { PayRollRecordModel } from "../models/PayrollRecord";
import { EmployeeModel } from "../models/Employee";
import { AttendanceModel } from "../models/Attendance";
import { LeaveRequestModel } from "../models/LeaveRequest";


export class ReportsController {
  async getPayrollReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { month } = req.query;

      if (!month) {
        return res.status(400).json({error: 'Month parameter is required (format: YYYY-MM)' });
      }

      const payrollData = await PayRollRecordModel.find({ month })
        .populate('employeeId', 'name department')
        .sort({ 'employeeId.department': 1 });

      const summary = await PayRollRecordModel.aggregate([
        { $match: { month } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$netSalary' }
          }
        }
      ]);

      res.json({month, payrollData, summary });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown Error")
      next(err)
    }
  }

  async getAttendanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, department } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({error: 'Start date and end date are required'});
      }

      const matchStage: any = {
        date: { $gte: startDate, $lte: endDate }
      };

      if (department) {
        const employees = await EmployeeModel.find({ department });
        const employeeIds = employees.map(emp => emp.id);
        matchStage.employeeId = { $in: employeeIds };
      }

      const attendanceStats = await AttendanceModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $group: {
            _id: {
              employeeId: '$employeeId',
              department: '$employee.department'
            },
            employeeName: { $first: '$employee.name' },
            present: {
              $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
            },
            absent: {
              $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
            },
            late: {
              $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
            },
            halfday: {
              $sum: { $cond: [{ $eq: ['$status', 'halfday'] }, 1, 0] }
            },
            totalHours: { $sum: '$totalHours' }
          }
        },
        {
          $project: {
            employeeName: 1,
            department: '$_id.department',
            present: 1,
            absent: 1,
            late: 1,
            halfday: 1,
            totalHours: 1,
            attendanceRate: {
              $multiply: [
                {
                  $divide: [
                    '$present',
                    { $add: ['$present', '$absent', '$late', '$halfday'] }
                  ]
                },
                100
              ]
            }
          }
        }
      ]);

      res.json({
        period: { startDate, endDate },
        message: "Attendance report generated successfully",
        attendanceStats
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown Error")
      next(err)
    }
  }

  async getLeaveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, status, type } = req.query;

      const matchStage: any = {};
      
      if (startDate && endDate) {
        matchStage.$or = [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
          }
        ];
      }
      
      if (status) matchStage.status = status;
      if (type) matchStage.type = type;

      const leaveStats = await LeaveRequestModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        {
          $group: {
            _id: {
              department: '$employee.department',
              type: '$type',
              status: '$status'
            },
            count: { $sum: 1 },
            totalDays: { $sum: '$days' },
            employees: { $addToSet: '$employeeId' }
          }
        },
        {
          $project: {
            department: '$_id.department',
            type: '$_id.type',
            status: '$_id.status',
            count: 1,
            totalDays: 1,
            employeeCount: { $size: '$employees' }
          }
        }
      ]);

      res.json({
        leaveStats,
        filters: { startDate, endDate, status, type },
        message: 'Leave report generated successfully',
      });
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Unknown Error")
      next(err)
    }
  }

  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); 
      
      const [
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        payrollSummary,
        attendanceRate
      ] = await Promise.all([
        EmployeeModel.countDocuments(),
        EmployeeModel.countDocuments({ status: 'active' }),
        LeaveRequestModel.countDocuments({ status: 'pending' }),
        PayRollRecordModel.aggregate([
          { $match: { month: currentMonth } },
          {
            $group: {
              _id: null,
              totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$netSalary', 0] } },
              pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
            }
          }
        ]),
        AttendanceModel.aggregate([
          { 
            $match: { 
              date: { 
                $gte: `${currentMonth}-01`,
                $lte: `${currentMonth}-31`
              } 
            } 
          },
          {
            $group: {
              _id: null,
              totalRecords: { $sum: 1 },
              presentRecords: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
            }
          }
        ])
      ]);

      const stats = {
        totalEmployees,
        activeEmployees,
        pendingLeaves,
        monthlyPayroll: payrollSummary[0]?.totalPaid || 0,
        pendingPayroll: payrollSummary[0]?.pendingCount || 0,
        attendanceRate: attendanceRate[0] ? 
          (attendanceRate[0].presentRecords / attendanceRate[0].totalRecords) * 100 : 0
      };

      res.json({ message: 'Dashboard stats fetched successfully', stats});
    } catch (err) {
        console.error(err instanceof Error ? err.message : "Unknown Error")
        next(err)
    }
  }
}

export const reportsController = new ReportsController();