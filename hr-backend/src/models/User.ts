import mongoose, {Schema, Document } from 'mongoose';
import { IUser } from '../types';


const UserSchema: Schema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
    },
    password: { type: String, required: true},
    role: { 
        type: String, 
        enum: ['admin', 'hr', 'employee'], 
        required: true 
    },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    isActive: { type: Boolean, default: true },
    lastLogin: Date
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

UserSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', UserSchema);