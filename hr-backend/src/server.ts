import { app } from "./app"
import dotenv from "dotenv"
import './types'

dotenv.config()

process.on('SIGINT', () => app.gracefulShutDown())
process.on('SIGTERM', () => app.gracefulShutDown())


app.start().catch(console.error)