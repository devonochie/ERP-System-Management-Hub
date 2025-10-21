import { Router } from "express";
import { payrollController } from "../controllers/payrollController";
// import { authorize } from "../middleware/authorize";
// import { authmiddleware } from '../middleware/auth';

const routes = Router()

// routes.use(authorize('admin', 'hr'))
// routes.use(authmiddleware)


// Payroll Routes
routes.post('/generate', payrollController.generatePayroll);
routes.post('/generate/:month', payrollController.generateBulkPayroll);
routes.get('/', payrollController.getPayrollRecords);
routes.get('/:employeeId/:month', payrollController.getEmployeePayroll);
routes.post('/:id/process', payrollController.processPayment);
routes.get('/payslip/:id', payrollController.generatePayslip);
routes.get('/summary/:month', payrollController.getPayrollSummary);


export default routes