import { NextFunction, Request, Response } from "express";
import { leaveService } from "../services/LeaveService";


class LeaveController {
    async applyLeave(req: Request , res: Response, next: NextFunction) {
        try {
            const {employeeId, type, startDate, endDate, reason} = req.body
            if(!employeeId || !type || !startDate || !endDate || !reason) {
                return res.status(400).json({ error: "Missing required fields"})
            }

            const leave = await leaveService.applyForLeave({
                employeeId, type, startDate, endDate, reason
            })

            res.status(201).json(leave)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async getLeaveRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const filters = {
                employeeId:  req.query.employeeId as string,
                status: req.query.status as string,
                type:  req.query.type as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
            }

            const { leaveRequests, total } = await leaveService.getLeaveRequest(filters, page, limit)
            res.json({
                page,
                limit,
                total,
                leaveRequests,
                pages: Math.ceil(total / limit)
            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async approveLeave(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.body 
            const leaveRequest = await leaveService.approveLeave(req.params.id , status)
            if(!leaveRequest) return res.status(404).json({ error: "Leave request not found"})
            res.json(leaveRequest)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async rejectLeave(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.body
            const leaveRequest = await leaveService.rejectLeave(req.params.id, status)
            if(!leaveRequest) return res.status(404).json({ error: "Leave request not found"})
            res.json(leaveRequest)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async getLeaveBalance(req: Request, res: Response, next: NextFunction) {
        try {
            const employeeId = req.params.employeeId
            const balance = await leaveService.getEmployeeLeaveBalance(employeeId)
            res.json(balance)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

}

export const leaveController = new LeaveController()