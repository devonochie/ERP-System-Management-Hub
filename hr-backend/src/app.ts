import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import employeeRoutes from './routes/employee'
import authRoutes from './routes/auth'
import reportRoutes from './routes/reports'
import payrollRoutes from './routes/payroll'
import attendanceRoutes from './routes/attendance'
import leaveRoutes from './routes/leave'


class Application {
    private app: express.Application

    constructor() {
        this.app = express()
        this.setupMiddleware()
        this.setupRoutes()
        // this.setupQueue()
    }

    private setupMiddleware() {
        this.app.use(cors({
            origin: "http://localhost:8080",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"]
        }))
        this.app.use(helmet());
        this.app.use(cookieParser())
        this.app.use(express.static('dist'))
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes() {
        this.app.use('/api/employees', employeeRoutes)
        this.app.use('/api/auth', authRoutes)
        this.app.use('/api/report', reportRoutes)
        this.app.use('/api/payroll', payrollRoutes)
        this.app.use('/api/attendance', attendanceRoutes)
        this.app.use('/api/leave', leaveRoutes)

        this.app.get('/health', (_req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
    }

    async connectDatabase() {
        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.MONGO_URI as string)
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => console.log('Database connection error', error))
    }

    async start(){
        const PORT = process.env.PORT || 3000
        await this.connectDatabase()

        this.app.listen(PORT, () => {
            console.log((`Server running on port ${PORT}`))
        })
    }

    async gracefulShutDown(){
        console.log('Shutting dowm gracefully...')
        await mongoose.connection.close()
        process.exit(0)
    }
}

export const app = new Application
