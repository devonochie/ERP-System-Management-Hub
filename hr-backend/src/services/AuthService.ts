import { IUser } from "../types"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserModel } from "../models/User"

class AuthService {
    async register (userData: Partial<IUser>): Promise<IUser>{
        const { email, password, name, role} = userData
        if(!name || !email || !password ) throw new Error( "Missing field: email, password name")

        const isExist = await UserModel.findOne({ email })
        if(isExist) throw new Error( 'User exist')
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new UserModel({
            email,
            password: hashedPassword,
            name,
            role
        })

        await user.save()

        return user
    }

    async login (email: string, password: string): Promise<{user: IUser, accessToken: string}> {
        const user = await UserModel.findOne({ email });

        if (!user || !user.password) {
            throw new Error( "Invalid credentials" );
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            throw new Error( "Invalid credentials" );
        }

        const userToken = { email: user.email, user_id: user.id };
        
        const accessToken = jwt.sign(userToken, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });

        await user.save();

        return {accessToken, user}
    }
}


export const authService = new AuthService()