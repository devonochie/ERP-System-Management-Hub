import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { login, register } from '@/api/services/auth';
import { User } from "@/types";

const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password, role }: { email: string; password: string, role: string }, { rejectWithValue }) => {
        try {
            const user = await login(email, password, role);
            return user;
        } catch (error) {
            return rejectWithValue('Login failed');
        } 
    }
)

const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: Partial<User>, { rejectWithValue }) => {
        try {   
            const user = await register(userData);
            return user;
        } catch (error) {
            return rejectWithValue('Registration failed');
        }   
    }
)

interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    isAuthenticated: false,
    error: null,
}       

const authSlice = createSlice({
    name: 'auth',
    initialState,   
    reducers: {
        logout(state) {
            state.user = null;
        }   
    },
    extraReducers: (builder) => {
        builder 
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;      
                state.user = action.payload;
                state.isAuthenticated = true
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logout } = authSlice.actions;
export { loginUser, registerUser };
export default authSlice.reducer;