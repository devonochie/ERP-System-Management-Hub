import mongoose, { Schema, Document} from 'mongoose';
import { IPayrollRecord } from '../types';

const PayrollRecordSchema: Schema = new Schema<IPayrollRecord>({
    employeeId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
    },
    employeeName: { type: String, required: true },
    month: { type: String, required: true }, // "2024-01"
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['paid', 'pending', 'processing'], 
        default: 'pending' 
    },
    paymentDate: String,
    payslipUrl: String,
    breakdown: {
        basic: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        conveyance: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        pf: { type: Number, default: 0 },
        otherDeductions: { type: Number, default: 0 }
    },
    attendance: {
        workingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        leaveDays: { type: Number, default: 0 }
    }
    }, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete (ret as any).__v;
        return ret;
        }
    }
});


PayrollRecordSchema.index({ employeeId: 1, month: 1 }, { unique: true });

PayrollRecordSchema.index({ month: 1 });
PayrollRecordSchema.index({ status: 1 });

export const PayRollRecordModel =  mongoose.model<IPayrollRecord>('PayrollRecord', PayrollRecordSchema);