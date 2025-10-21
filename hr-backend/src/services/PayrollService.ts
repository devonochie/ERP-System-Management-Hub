import { AttendanceModel } from "../models/Attendance";
import { EmployeeModel } from "../models/Employee";
import { LeaveRequestModel } from "../models/LeaveRequest";
import { PayRollRecordModel } from "../models/PayrollRecord";
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { IPayrollRecord } from "../types";

class PayrollService {
    async calculatePayroll(employeeId: string, month: number) {
        const employee = await EmployeeModel.findById(employeeId)
        if(!employee) {
            throw new Error("Employee not found")
        }
        const existingPayroll = await PayRollRecordModel.findOne({ employeeId, month })
        if(existingPayroll) {
            throw new Error("Payroll already processed for this month")
        }

        const startDate = new Date(new Date().getFullYear(), month - 1, 1)
        const endDate = new Date(new Date().getFullYear(), month, 0)

        const attendanceStats = await AttendanceModel.aggregate([
            {
                $match: {
                    employeedId : employee.id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$employeeId',
                    count: { $sum: 1}
                }
            }
        ])

        const approvedLeaves = await LeaveRequestModel.countDocuments({
            employeeId,
            status: 'approved',
            $or: [
                {
                    startDate: {  $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        })

        const presentDays =  attendanceStats.find(a => a.id  === "present")?.count || 0
        const lateDays = attendanceStats.find(a => a.id === "late")?.count || 0
        const halfDays = attendanceStats.find(a => a.id === "halfday")?.count || 0
        const absentDays = attendanceStats.find(a => a.id === "absent")?.count || 0

        const workingDays = 22
        const effectiveDays = presentDays + (halfDays * 0.5) - (lateDays * 0.1) + approvedLeaves

        const basic = employee.salary * 0.5
        const hra = employee.salary * 0.2
        const conveyance = employee.salary * 0.1
        const medical = employee.salary * 0.1
        const pf = employee.salary * 0.12

        const grossSalary = basic + hra + conveyance + medical

        const tax = this.calculateTax(grossSalary)
        const lateDeduction = (employee.salary / workingDays) * lateDays * 0.1
        const absentDeduction = (employee.salary / workingDays) * absentDays
        const totalDeductions = tax + pf + lateDeduction + absentDeduction

        const netSalary = grossSalary - totalDeductions

        const payrollRecord = new PayRollRecordModel({
            employeeId: employee.id,
            employeeName: employee.name,
            month: `${new Date().getFullYear()}-${month.toString().padStart(2, '0')}`,
            baseSalary: employee.salary,
            bonus: 0,
            deductions: totalDeductions,
            netSalary,
            status: 'pending',
            breakdown: {
                basic,
                hra,
                conveyance,
                medical,
                tax,
                pf,
                otherDeductions: lateDeduction + absentDeduction
            },
            attendance: {
                workingDays,
                presentDays: effectiveDays,
                leaveDays: approvedLeaves
            }
        })

        return await payrollRecord.save()
    }

    private calculateTax(grossSalary: number): number {
        if (grossSalary <= 250000) return 0;
        if (grossSalary <= 500000) return (grossSalary - 250000) * 0.05;
        if (grossSalary <= 1000000) return 12500 + (grossSalary - 500000) * 0.2;
        return 112500 + (grossSalary - 1000000) * 0.3;
    }

    async generateBulkPayroll(month: number): Promise<{ processed: number, skipped: number }> {
        const activeEmployees = await EmployeeModel.find({ status: 'active' })
        let processed = 0
        let skipped = 0

        for(const emp of activeEmployees) {
            try {
                await this.calculatePayroll(emp.id, month)
            } catch (err) {
                console.warn(`Skipping payroll for ${emp.name}: ${err}`)
                skipped++
            }
        }

        return { processed, skipped }
    }

    async processPayment(payrollId: string, paymentDate: string): Promise<IPayrollRecord | null> {
        const payrollRecord = await PayRollRecordModel.findByIdAndUpdate(
            payrollId,
            {
                status: 'paid',
                paymentDate: new Date().toISOString().split('T')[0],
                updatedAt: new Date()
            },
            { new: true }
        )

        if(payrollRecord) {
            await this.generatedPayslip(payrollRecord.id)
        }

        return payrollRecord

    }

    async generatedPayslip(payrollId: string): Promise<string> {
        const payrollRecord = await PayRollRecordModel.findById(payrollId).populate('employeeId', 'name email department')
        if(!payrollRecord) {
            throw new Error("Payroll record not found")
        }

        const employee = payrollRecord.employeeId as any;
        const doc = new PDFDocument({ margin: 50 });
    

        const fileName = `payslip-${employee.id}-${payrollRecord.month}.pdf`;
        const filePath = path.join(__dirname, '../payslips', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filePath));

        // Header
        doc.fontSize(20).text('COMPANY NAME', 50, 50);
        doc.fontSize(14).text('Pay Slip', 50, 80);
        doc.fontSize(10).text(`Period: ${payrollRecord.month}`, 400, 50);
        doc.text(`Payment Date: ${payrollRecord.paymentDate || 'Pending'}`, 400, 65);

        // Employee Details
        doc.fontSize(12).text('Employee Details:', 50, 120);
        doc.text(`Name: ${employee.name}`, 50, 140);
        doc.text(`Employee ID: ${employee.id}`, 50, 155);
        doc.text(`Department: ${employee.department}`, 50, 170);
        doc.text(`Designation: ${employee.role}`, 50, 185);

        // Salary Breakdown
        const breakdownStart = 220;
        doc.fontSize(12).text('Earnings', 50, breakdownStart);
        doc.text('Basic Salary', 50, breakdownStart + 20);
        doc.text(`₹${payrollRecord.breakdown.basic.toFixed(2)}`, 200, breakdownStart + 20);
        
        doc.text('HRA', 50, breakdownStart + 35);
        doc.text(`₹${payrollRecord.breakdown.hra.toFixed(2)}`, 200, breakdownStart + 35);
        
        doc.text('Conveyance', 50, breakdownStart + 50);
        doc.text(`₹${payrollRecord.breakdown.conveyance.toFixed(2)}`, 200, breakdownStart + 50);
        
        doc.text('Medical', 50, breakdownStart + 65);
        doc.text(`₹${payrollRecord.breakdown.medical.toFixed(2)}`, 200, breakdownStart + 65);

        // Deductions
        doc.text('Deductions', 300, breakdownStart);
        doc.text('Provident Fund', 300, breakdownStart + 20);
        doc.text(`₹${payrollRecord.breakdown.pf.toFixed(2)}`, 450, breakdownStart + 20);
        
        doc.text('Income Tax', 300, breakdownStart + 35);
        doc.text(`₹${payrollRecord.breakdown.tax.toFixed(2)}`, 450, breakdownStart + 35);
        
        doc.text('Other Deductions', 300, breakdownStart + 50);
        doc.text(`₹${payrollRecord.breakdown.otherDeductions.toFixed(2)}`, 450, breakdownStart + 50);

        // Total
        const totalStart = breakdownStart + 90;
        doc.fontSize(14).text('Gross Salary', 50, totalStart);
        doc.text(`₹${payrollRecord.baseSalary.toFixed(2)}`, 200, totalStart);
        
        doc.text('Total Deductions', 300, totalStart);
        doc.text(`₹${payrollRecord.deductions.toFixed(2)}`, 450, totalStart);
        
        doc.fontSize(16).text('Net Salary', 50, totalStart + 25);
        doc.text(`₹${payrollRecord.netSalary.toFixed(2)}`, 200, totalStart + 25);

        // Attendance Summary
        doc.fontSize(12).text('Attendance Summary:', 50, totalStart + 60);
        doc.text(`Working Days: ${payrollRecord.attendance.workingDays}`, 50, totalStart + 80);
        doc.text(`Present Days: ${payrollRecord.attendance.presentDays}`, 50, totalStart + 95);
        doc.text(`Leave Days: ${payrollRecord.attendance.leaveDays}`, 50, totalStart + 110);

        doc.end();

        // Update payroll record with payslip URL
        const payslipUrl = `/payslips/${fileName}`;
        await PayRollRecordModel.findByIdAndUpdate(payrollId, { payslipUrl });

        return filePath;
    }

    async getPayrollSummary(month: string): Promise<any> {
        const summary = await PayRollRecordModel.aggregate([
        {
            $match: { month }
        },
        {
            $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSalary: { $sum: '$netSalary' },
            avgSalary: { $avg: '$netSalary' }
            }
        }
        ]);

        const departmentSummary = await PayRollRecordModel.aggregate([
        {
            $match: { month }
        },
        {
            $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
            }
        },
        {
            $unwind: '$employee'
        },
        {
            $group: {
            _id: '$employee.department',
            totalEmployees: { $sum: 1 },
            totalSalary: { $sum: '$netSalary' },
            avgSalary: { $avg: '$netSalary' }
            }
        }
        ]);

        return {
        byStatus: summary,
        byDepartment: departmentSummary
        };
    }

    async getPayrollRecords(
        filter: any = {},
        page: number = 1,
        limit: number = 10,
    ): Promise<{ payrollRecords: IPayrollRecord[], total: number }> {
        const skip = (page - 1) * limit;

        const query: any = {};

        if (filter.month) query.month = filter.month;
        if (filter.employeeId) query.employeeId = filter.employeeId;
        if (filter.status) query.status = filter.status;

        const [payrollRecords, total] = await Promise.all([
            PayRollRecordModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            PayRollRecordModel.countDocuments(query)
        ]);


        return { payrollRecords, total };
    }
}

export const payrollService = new PayrollService()