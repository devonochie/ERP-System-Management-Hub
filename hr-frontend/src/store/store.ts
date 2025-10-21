import { configureStore } from '@reduxjs/toolkit';
import employeesReducer from './slices/employeesSlice';
import attendanceReducer from './slices/attendanceSlice';
import leavesReducer from './slices/leavesSlice';
import payrollReducer from './slices/payrollSlice';
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    employees: employeesReducer,
    attendance: attendanceReducer,
    auth: authReducer,
    leaves: leavesReducer,
    payroll: payrollReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
