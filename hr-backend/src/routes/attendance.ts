import { Router } from "express";

import { attendanceController } from "../controllers/attendanceController";
import { authmiddleware,  } from "../middleware/auth";
import { authorize } from "../middleware/authorize";

const routes = Router()
// routes.use(authorize('hr','admin'))

// routes.use(authmiddleware)

// Attendance Routes
routes.post('/clock-in', attendanceController.clockIn);
routes.post('/clock-out', attendanceController.clockout);
routes.get('/today', attendanceController.getTodayAttendance);
routes.post('/absent', attendanceController.markAbsent);
routes.get('/:employeeId/history', attendanceController.getattendanceHistory);
routes.get('/:employeeId/stats', attendanceController.getAttendanceStats);

export default routes