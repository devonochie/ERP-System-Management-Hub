import mongoose, { Schema, Document } from 'mongoose';
import { ILeaveRequest } from '../types';

const LeaveRequestSchema = new Schema<ILeaveRequest>({
    employeeId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
    },
    employeeName: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['sick', 'vacation', 'personal', 'unpaid'], 
        required: true 
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    appliedDate: { type: String, required: true },
    }, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete (ret as any).__v;
        return ret;
        }
    }
});


LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

export const LeaveRequestModel =  mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);