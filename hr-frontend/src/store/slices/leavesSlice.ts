import { LeaveRequest } from '@/types';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { applyLeave, getLeaveBalance, getLeaveRequests, rejectLeave, approveLeave } from '@/api/services/leave';


export const fetchLeaveRequestsAsync = createAsyncThunk(
  'leaves/fetchLeaveRequests',
  async (_, { rejectWithValue }) => {
    try {
      const requests = await getLeaveRequests();
      return requests;
    } catch (error) {
      return rejectWithValue('Failed to fetch leave requests');
    }
  }
);

export const applyLeaveAsync = createAsyncThunk(
  'leaves/applyLeave',
  async (leaveData: Partial<LeaveRequest>, { rejectWithValue }) => {
    try {
      const newRequest = await applyLeave(leaveData);
      return newRequest;
    } catch (error) {
      return rejectWithValue('Failed to apply for leave');
    }
  }
);


export const fetchLeaveBalanceAsync = createAsyncThunk(
  'leaves/fetchLeaveBalance',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const balance = await getLeaveBalance(employeeId);
      return balance;
    } catch (error) {
      return rejectWithValue('Failed to fetch leave balance');
    }
  }
);

export const approveLeaveAsync = createAsyncThunk(
  'leaves/approveLeave',
  async ({ id, status}: {id: string, status: string}, { rejectWithValue }) => {
    try {
      const updatedRequest = await approveLeave(id, status);
      console.log(updatedRequest)
      return updatedRequest;
    } catch (error) {
      return rejectWithValue('Failed to approve leave');
    }
  }
);

export const rejectLeaveAsync = createAsyncThunk(
  'leaves/rejectLeave',
  async ({ id, status}: {id: string, status: string}, { rejectWithValue }) => {
    try {
      const updatedRequest = await rejectLeave(id, status);
      return updatedRequest;
    } catch (error) {
      return rejectWithValue('Failed to reject leave');
    }
  }
);


interface LeavesState {
  requests: LeaveRequest[];
}

const initialState: LeavesState = {
  requests: [] as LeaveRequest[],
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.requests.push(action.payload);
    },
    updateLeaveStatus: (state, action: PayloadAction<{ id: string; status: 'approved' | 'rejected' }>) => {
      const request = state.requests.find(req => req.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaveRequestsAsync.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(applyLeaveAsync.fulfilled, (state, action) => {
        state.requests.push(action.payload);
      })
      .addCase(approveLeaveAsync.fulfilled, (state, action) => {
        const request = state.requests.find(req => req.id === action.payload.id);
        if (request) {
          request.status = 'approved';
        }
      })
      .addCase(rejectLeaveAsync.fulfilled, (state, action) => {
        const request = state.requests.find(req => req.id === action.payload.id);
        if (request) {
          request.status = 'rejected';
        }
      });
  }
});

export const { addLeaveRequest, updateLeaveStatus } = leavesSlice.actions;
export default leavesSlice.reducer;
