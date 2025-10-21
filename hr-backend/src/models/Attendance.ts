import mongoose, { Schema, Document } from 'mongoose';
import { IAttendance } from '../types';


const AttendanceSchema: Schema = new Schema<IAttendance>({
    employeeId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
    },
    employeeName: { type: String, required: true },
    date: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['present', 'absent', 'late', 'halfday'], 
        required: true 
    },
    checkIn: {type: String},
    checkOut: {type: String},
    totalHours: {type: Number}
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id= (ret._id as mongoose.Types.ObjectId).toString()
            delete ret._id
            delete (ret as any).__v
            return ret
        }
    }
})

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });


AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ employeeId: 1, date: 1 });

export const AttendanceModel=  mongoose.model<IAttendance>('Attendance', AttendanceSchema);