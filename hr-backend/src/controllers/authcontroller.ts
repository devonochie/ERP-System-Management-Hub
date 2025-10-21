import { CookieOptions, NextFunction, Request, Response } from "express"
import { authService } from "../services/AuthService"


class AuthController {
    async register (req: Request, res: Response, next: NextFunction){
        try {
            const user = await authService.register(req.body)
            res.json(user)
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown Error")
            next(err)
        }
    }

    async login (req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body
            
            const { user, accessToken } = await authService.login(email, password)

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000,
                sameSite: process.env.NODE_ENV === 'production' ? "strict" : "lax"
            }); 
        
            res.status(200).json({
                accessToken,
                user
            })
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown Error")
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const cookieOptions: CookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                path: '/'
            };

            res.clearCookie('accessToken', cookieOptions)

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (err) {
            console.error(err instanceof Error ? err.message : "Unknown Error")
            next(err)
        }
    }

}

export const authController = new AuthController()