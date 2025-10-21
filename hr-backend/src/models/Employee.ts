import mongoose, { Schema, Document } from 'mongoose'
import { IEmployee } from '../types'


const EmployeeSchema = new Schema<IEmployee>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: { type: String, default: '' },
    salary: { type: Number, required: true, min: 0 },
    joinDate: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = (ret._id as mongoose.Types.ObjectId).toString()
            delete ret._id
            delete (ret as any).__v
            return ret 
        }
    }
})

EmployeeSchema.index({ createdAt: 1 })
EmployeeSchema.index({ email: 1 })
EmployeeSchema.index({ department: 1 })
EmployeeSchema.index({ status: 1 })

export const EmployeeModel = mongoose.model<IEmployee>("Employee", EmployeeSchema)