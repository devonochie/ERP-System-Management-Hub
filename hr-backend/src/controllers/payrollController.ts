import { NextFunction, Request, Response } from 'express';
import { payrollService } from '../services/PayrollService';
import { PayRollRecordModel } from '../models/PayrollRecord';

export class PayRollController {
    async generatePayroll(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, month } = req.body;

            const payrollRecord = await payrollService.calculatePayroll(employeeId, month);

            res.json({
                payrollRecord,
                message: 'Payroll generated successfully'
            });
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async generateBulkPayroll(req: Request, res: Response, next: NextFunction) {
        try {
            const { month } = req.body;

            const result = await payrollService.generateBulkPayroll(month);

            res.json({ message: 'Bulk payroll generation completed',  result});
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async getPayrollRecords(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters = {
                month: req.query.month as string,
                employeeId: req.query.employeeId as string,
                status: req.query.status as string,
            }
            const { payrollRecords, total } = await payrollService.getPayrollRecords(filters, page, limit);
            res.json({
                page,
                limit,
                payrollRecords,
                total,
                pages: Math.ceil(total / limit)
            });
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async getEmployeePayroll(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId, month } = req.params;
            const payrollRecord = await PayRollRecordModel.findOne({ employeeId, month })
                .populate('employeeId', 'name email department');

            if (!payrollRecord) {
                return res.status(404).json('Payroll record not found');
            }

            res.json(payrollRecord);
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async processPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { paymentDate } = req.body;
            const payrollRecord = await payrollService.processPayment(req.params.id, paymentDate);

            if (!payrollRecord) return res.status(404).json('Payroll record not found');  
            

            res.json({ message: 'Payment processed successfully', payrollRecord});
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async generatePayslip(req: Request, res: Response, next: NextFunction) {
        try {
            const filePath = await payrollService.generatedPayslip(req.params.id);
            
            res.download(filePath, (err) => {
                if (err) {
                    return res.status(404).json('Error downloading payslip');
                }
            });

        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async getPayrollSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const { month } = req.params;

            const summary = await payrollService.getPayrollSummary(month);

            res.json(summary);
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }
}

export const payrollController = new PayRollController()