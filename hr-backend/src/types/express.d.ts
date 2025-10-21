import { IUser } from '../types/index';


declare global {
    namespace Express {
        interface Request {
            token?: string | null,
            user? : IUser | null,
            file?: Express.Multer.File,
            files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] },
            callback?: FileCallback,
            role?: string | null
        }
        
        interface Response {
            success(data?: unknown, message?: string): void;
            error(error: string | Error, statusCode?: number): void;
        }
    }
}