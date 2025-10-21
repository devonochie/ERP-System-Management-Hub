import { Router } from "express";

import { leaveController } from "../controllers/leaveController";
import { authorize } from "../middleware/authorize";
import { authmiddleware } from "../middleware/auth";


const routes = Router()

// routes.use(authorize('admin', 'hr'))
// routes.use(authmiddleware)

// Leave Routes
routes.post('/', leaveController.applyLeave);
routes.get('/', leaveController.getLeaveRequests);
routes.put('/:id/approve', leaveController.approveLeave);
routes.put('/:id/reject', leaveController.rejectLeave);
routes.get('/:employeeId/balance', leaveController.getLeaveBalance);


export default routes