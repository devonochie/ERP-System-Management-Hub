import { Router } from "express";
import { reportsController } from "../controllers/reportsController";
import { authorize } from "../middleware/authorize";
import { authmiddleware } from "../middleware/auth";


const routes = Router()
routes.use(authorize('hr', 'admin'))
routes.use(authmiddleware)

routes.get('/payroll', reportsController.getPayrollReport);
routes.get('/attendance', reportsController.getAttendanceReport);
routes.get('/leaves', reportsController.getLeaveReport);
routes.get('/dashboard-stats', reportsController.getDashboardStats)

export default routes