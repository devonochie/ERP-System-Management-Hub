import Joi from 'joi';

export const employeeValidation = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        role: Joi.string().required(),
        department: Joi.string().required(),
        salary: Joi.number().min(0).required(),
        joinDate: Joi.string().required(),
        bankDetails: Joi.object({
        accountNumber: Joi.string().required(),
        bankName: Joi.string().required(),
        ifscCode: Joi.string().required()
        }).optional(),
        contact: Joi.object({
        phone: Joi.string().optional(),
        address: Joi.string().optional()
        }).optional()
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(100),
        email: Joi.string().email(),
        role: Joi.string(),
        department: Joi.string(),
        salary: Joi.number().min(0),
        status: Joi.string().valid('active', 'inactive'),
        bankDetails: Joi.object({
        accountNumber: Joi.string(),
        bankName: Joi.string(),
        ifscCode: Joi.string()
        }),
        contact: Joi.object({
        phone: Joi.string(),
        address: Joi.string()
        })
    })
};

export const attendanceValidation = {
    clockIn: Joi.object({
        employeeId: Joi.string().required(),
        date: Joi.string().required(),
        checkIn: Joi.string().required()
    }),

    clockOut: Joi.object({
        employeeId: Joi.string().required(),
        date: Joi.string().required(),
        checkOut: Joi.string().required()
    })
    };

export const leaveValidation = {
    create: Joi.object({
        employeeId: Joi.string().required(),
        type: Joi.string().valid('sick', 'vacation', 'personal', 'unpaid').required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        reason: Joi.string().min(10).max(500).required()
    })
};

export const payrollValidation = {
    generate: Joi.object({
        month: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
    })
    };

export const authValidation = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('admin', 'hr', 'employee').required(),
        employeeId: Joi.string().optional()
    })
};