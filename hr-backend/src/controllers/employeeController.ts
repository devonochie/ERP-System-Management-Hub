import { NextFunction, Request, Response } from "express";
import { IEmployee } from "../types";
import { employeeService } from "../services/EmployeeService";


class EmployeeController {
    async createEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const epmloyeeData: IEmployee = req.body
            const employee = await employeeService.createEmployee(epmloyeeData)
            res.status(201).json(employee)
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async getEmployees(req: Request, res: Response, next: NextFunction ) {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 10
            const filter = {
                department: req.query.department as string,
                status: req.query.status as string,
                search: req.query.search as string
            }
            const {employees, total} = await employeeService.getEmployees(page, limit, filter)
            res.json({
                page,
                limit,
                total,
                employees,
                pages: Math.ceil(total / limit),

            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async getEmployeesById(req: Request, res: Response, next: NextFunction) {
        try{
            const employee = await employeeService.getEmployeesById(req.params.id)
            if(!employee) return res.status(404).json({ error: "Employee not found"})

            res.json(employee)
        }catch(err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async updateEmployee(req: Request, res: Response, next: NextFunction){
        try {
            const employee = await employeeService.updateEmployee(req.params.id, req.body )
            if(!employee) return res.status(404).json({ error: 'Employee not found'})

            res.json(employee)
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async deleteEmployee(req: Request, res: Response, next: NextFunction) {
        try {
            const employee = await employeeService.deleteEmployee(req.params.id)
            res.json(employee)
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }

    async employeeStats(req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await employeeService.employeeStats()
            res.json(stats)
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown error")
            next(err)
        }
    }
}

export const employeeController = new EmployeeController()