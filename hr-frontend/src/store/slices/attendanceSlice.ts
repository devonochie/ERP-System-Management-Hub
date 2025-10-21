import { AttendanceRecord } from '@/types';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { markAbsent, getAttendanceHistory, getAttendanceStats, clockedIn, clockedOut, getTodayAttendance } from '@/api/services/attendance';


export const markAbsentAsync = createAsyncThunk(
  'attendance/markAbsent',
  async ({ employeeId, date }: { employeeId: string; date: string }, { rejectWithValue }) => {
    try {
      const record = await markAbsent(employeeId, date);
      return record;
    } catch (error) {
      return rejectWithValue('Failed to mark absent');
    }
  }
);

export const fetchTodayAttendanceAsync = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const history = await getTodayAttendance();
      return history;
    } catch (error) {
      return rejectWithValue('Failed to fetch attendance history');
    }
  }
);

export const fetchAttendanceHistoryAsync = createAsyncThunk(
  'attendance/fetchAttendanceHistory',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const history = await getAttendanceHistory(employeeId);
      return history;
    } catch (error) {
      return rejectWithValue('Failed to fetch attendance history');
    }
  }
);

export const fetchAttendanceStatsAsync = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async ({employeeId, month}: {employeeId: string; month: string}, { rejectWithValue }) => {
    try {
      const stats = await getAttendanceStats(employeeId, month);
      return stats;
    } catch (error) {
      return rejectWithValue('Failed to fetch attendance stats');
    }
  }
);

export const clockInAsync = createAsyncThunk(
  'attendance/clockIn',
  async (attendanceData: { employeeId: string; date: string; checkIn: string }, { rejectWithValue }) => {
    try {
      const record = await clockedIn(attendanceData);
      return record;
    } catch (error) {
      return rejectWithValue('Failed to clock in');
    }
  }
);

export const clockOutAsync = createAsyncThunk(
  'attendance/clockOut',
  async (attendanceData: { employeeId: string; date: string; checkOut: string }, { rejectWithValue }) => {
    try {
      const record = await clockedOut(attendanceData);
      return record;
    } catch (error) {
      return rejectWithValue('Failed to clock out');
    }
  }
);


interface AttendanceState {
  records: AttendanceRecord[];
}

const initialState: AttendanceState = {
  records: [],
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.records.push(action.payload);
    },
    updateAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      const index = state.records.findIndex(rec => rec.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    clockIn: (state, action: PayloadAction<{ employeeId: string; employeeName: string }>) => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const existingRecord = state.records.find(
        rec => rec.employeeId === action.payload.employeeId && rec.date === today
      );

      if (!existingRecord) {
        state.records.push({
          id: `${action.payload.employeeId}-${Date.now()}`,
          employeeId: action.payload.employeeId,
          employeeName: action.payload.employeeName,
          date: today,
          status: 'present',
          checkIn: time,
        });
      }
    },
    clockOut: (state, action: PayloadAction<{ employeeId: string }>) => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      const record = state.records.find(
        rec => rec.employeeId === action.payload.employeeId && rec.date === today
      );

      if (record) {
        record.checkOut = time;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAbsentAsync.fulfilled, (state, action) => {
        state.records.push(action.payload);
      })
      .addCase(fetchTodayAttendanceAsync.fulfilled, (state, action) => {
        console.log(action.payload)
        state.records = action.payload;
      })
      .addCase(fetchAttendanceHistoryAsync.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      .addCase(clockInAsync.fulfilled, (state, action) => {
        const existingIndex = state.records.findIndex(rec => rec.id === action.payload.id);
        if (existingIndex !== -1) {
          state.records[existingIndex] = action.payload;
        } else {
          state.records.push(action.payload);
        }
      })
      .addCase(clockOutAsync.fulfilled, (state, action) => {
        const existingIndex = state.records.findIndex(rec => rec.id === action.payload.id);
        if (existingIndex !== -1) {
          state.records[existingIndex] = action.payload;
        } else {
          state.records.push(action.payload);
        }
      });
  },
});

export const { addAttendanceRecord, updateAttendanceRecord, clockIn, clockOut } = attendanceSlice.actions;
export default attendanceSlice.reducer;
