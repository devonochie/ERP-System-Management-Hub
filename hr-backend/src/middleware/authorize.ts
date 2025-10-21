import { NextFunction, Request, Response } from "express";

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
        res.status(401).json({ 
            success: false, 
            message: 'Access denied. Not authenticated.' 
        });
        return;
        }

        if (!roles.includes(req.user.role)) {
        res.status(403).json({ 
            success: false, 
            message: 'Access denied. Insufficient permissions.' 
        });
        return;
        }

        next();
    };
}
