import { PayrollRecord } from '@/types';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { generatePayroll, generateBulkPayroll, generatePayslip, fetchEmployeePayroll, fetchPayrollRecords, fetchPayrollSummary, processPayment  } from '@/api/services/payroll';


export const generatePayrollAsync = createAsyncThunk(
  'payroll/generatePayroll',
  async ({employeeId,  month}:{employeeId: string, month: string}, { rejectWithValue }) => {
    try {
      const records = await generatePayroll(employeeId, month);
      return records;
    } catch (error) {
      return rejectWithValue('Failed to generate payroll');
    }
  }
);

export const generateBulkPayrollAsync = createAsyncThunk(
  'payroll/generateBulkPayroll',
  async (month: string, { rejectWithValue }) => {
    try {
      const records = await generateBulkPayroll(month);
      return records;
    } catch (error) {
      return rejectWithValue('Failed to generate bulk payroll');
    }
  }
);

export const fetchPayrollRecordsAsync = createAsyncThunk(
  'payroll/fetchPayrollRecords',
  async (params: {
      page?: number;
      limit?: number;
      filters?: {
        month?: string;
        status?: string;
        employeeId?: string
      }
    }, { rejectWithValue }) => {
    try {
      const records = await fetchPayrollRecords(params);
      console.log(records)
      return records;
    } catch (error) {
      return rejectWithValue  ('Failed to fetch payroll records');
    }
  }
);

export const fetchEmployeePayrollAsync = createAsyncThunk(
  'payroll/fetchEmployeePayroll',
  async ({ employeeId, month }: { employeeId: string; month: string }, { rejectWithValue }) => {
    try {
      const record = await fetchEmployeePayroll(employeeId, month);
      return record;
    } catch (error) {
      return rejectWithValue('Failed to fetch employee payroll');
    }
  }
);


export const processPaymentAsync = createAsyncThunk(
  'payroll/processPayment',
  async ({id, paymentDate}: {id: string, paymentDate: string}, { rejectWithValue }) => {
    try {
      const record = await processPayment(id, paymentDate);
      return record;
    } catch (error) {
      return rejectWithValue('Failed to process payment');
    }
  }
);

export const generatePayslipAsync = createAsyncThunk(
  'payroll/generatePayslip',
  async (id: string, { rejectWithValue }) => {
    try {
      const payslipBlob = await generatePayslip(id);
      console.log(payslipBlob)
      return payslipBlob;
    } catch (error) {
      return rejectWithValue('Failed to generate payslip');
    }
  }
);

export const fetchPayrollSummaryAsync = createAsyncThunk(
  'payroll/fetchPayrollSummary',
  async (month: string, { rejectWithValue }) => {
    try {
      const summary = await fetchPayrollSummary(month);
      return summary;
    } catch (error) {
      return rejectWithValue('Failed to fetch payroll summary');
    }
  }
);  
interface PayrollState {
  records: PayrollRecord[];
}

const initialState: PayrollState = {
  records: [] as PayrollRecord[],
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    addPayrollRecord: (state, action: PayloadAction<PayrollRecord>) => {
      state.records.push(action.payload);
    },
    updatePayrollStatus: (state, action: PayloadAction<{ id: string; status: 'paid' | 'pending' | 'processing' }>) => {
      const record = state.records.find(rec => rec.id === action.payload.id);
      if (record) {
        record.status = action.payload.status;
        if (action.payload.status === 'paid') {
          record.paymentDate = new Date().toISOString().split('T')[0];
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePayrollAsync.fulfilled, (state, action) => {   
        state.records.push(action.payload.payrollRecord);
      } ) 
      .addCase(generateBulkPayrollAsync.fulfilled, (state, action) => {   
        state.records.push(...action.payload);
      } ) 
      .addCase(fetchPayrollRecordsAsync.fulfilled, (state, action) => {
        state.records = action.payload.payrollRecords;
      })
      .addCase(fetchEmployeePayrollAsync.fulfilled, (state, action) => {
        const index = state.records.findIndex(rec => rec.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        } else {
          state.records.push(action.payload);
        }
      })
      .addCase(processPaymentAsync.fulfilled, (state, action) => {
        const record = state.records.find(rec => rec.id === action.payload.payrollRecord.id);
        if (record) {
          record.status = 'paid';
          record.paymentDate = action.payload.payrollRecord.paymentDate
        }
      });
    }
});

export const { addPayrollRecord, updatePayrollStatus } = payrollSlice.actions;
export default payrollSlice.reducer;
