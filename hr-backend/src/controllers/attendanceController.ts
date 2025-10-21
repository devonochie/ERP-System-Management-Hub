import { NextFunction, Request, Response } from "express";
import { attendanceService } from "../services/AttendanceService";


class AttendanceController {
    async clockIn(req: Request, res: Response, next: NextFunction) {
        try {
            const attendance = await attendanceService.clockIn(req.body)
            res.status(201).json(attendance)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async clockout(req: Request, res: Response, next: NextFunction) {
        try {
            const attendance = await attendanceService.clockOut(req.body)
            res.status(201).json(attendance)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async getTodayAttendance(_req: Request, res: Response, next: NextFunction){
        try {
            const attendance = attendanceService.getTodayAttendance()
            res.status(201).json(attendance)
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async getattendanceHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params
            const startDate = req.query.startDate as string
            const endDate = req.query.endDate as string
            const page = parseInt(req.query.page as string ) || 1
            const limit = parseInt(req.query.limit as string ) || 10

            if(!startDate || !endDate) res.status(400).json({ error: "startDate and endDate are required"})

            const {attendance, total} = await attendanceService.getAttendanceHistory(employeeId, startDate, endDate, page, limit )
            res.json({
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                attendance
            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async getAttendanceStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params
            const month = req.query.month as string

            if(!month) res.status(400).json({ error: "Month is required "})

            const stats = await attendanceService.getAttendanceStats(employeeId, month)

            res.json({
                month,
                employeeId,
                stats
            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }

    async markAbsent(req: Request, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params
            const { date } = req.body

            const attendance = await attendanceService.markAbsent(employeeId, date)
            res.status(200).json({
                attendance,
                message: "Absent marked successfully"
            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : 'Unknown Error')
            next(err)
        }
    }
}

export const attendanceController = new AttendanceController()