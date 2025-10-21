import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UserModel } from "../models/User";


interface JwtPayload {
    userId?: string
}

export const authmiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies.accessToken
        if(!token) {
            return res.status(401).json({ error : "No token provided"})
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload
        const user = await UserModel.findById(decoded.userId)

        if(!user) {
            return res.status(404).json({ error : "User not found"})
        }

        req.user = user
        next()
    }catch(err) {
        console.error(err instanceof Error ? err.message : "Unknown Error")
        return res.status(401).json({ error: "Invalid or Expired token"})
    }
}

export const unknownEndPoint = (_req: Request, res: Response) => {
    res.status(404).json({
        error: 'Unknown endPoint'
    })
}

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    console.info('---')
    console.info('Method:', req.method)
    console.info('Path:', req.path)
    console.info('Body:', req.body)
    console.info('---')
        next()
}



