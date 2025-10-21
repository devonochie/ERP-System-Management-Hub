import { Router } from "express";

import { employeeController } from "../controllers/employeeController";
import { authmiddleware } from "../middleware/auth";
import { authorize } from "../middleware/authorize";


const routes = Router()

// routes.use(authorize('admin', 'hr'))
// routes.use(authmiddleware)


routes.post('/', employeeController.createEmployee)
routes.get('/', employeeController.getEmployees)
routes.get('/:id', employeeController.getEmployeesById)
routes.get('/stats', employeeController.employeeStats)
routes.put('/:id', employeeController.updateEmployee)
routes.delete('/:id', employeeController.deleteEmployee)


export default routes
