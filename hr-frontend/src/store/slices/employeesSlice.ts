import { Employee } from '@/types';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { updatedEmployee, fetchEmployees, fetchEmployeeById, createEmployee, deletedEmployee  } from '@/api/services/employee';


export const createEmployeeAsync = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: Partial<Employee>, { rejectWithValue }) => {
    try {
      const newEmployee = await createEmployee(employeeData);
      return newEmployee;
    } catch (error) {
      return rejectWithValue('Failed to create employee');
    }
  }
);

export const fetchEmployeesAsync = createAsyncThunk(
  'employees/fetchEmployees',
  async ( params: {
      page?: number;
      limit?: number;
      filters?: {
        category?: string;
        search?: string;
        title?: string
      }
    }, { rejectWithValue }) => {
    try {
      const employees = await fetchEmployees();
      return employees;
    } catch (error) {
      return rejectWithValue('Failed to fetch employees');
    }
  }
);

export const fetchEmployeeByIdAsync = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const employee = await fetchEmployeeById(id);
      return employee;
    } catch (error) {
      return rejectWithValue('Failed to fetch employee');
    }
  }
);

export const updateEmployeeAsync = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }: { id: string; employeeData: Partial<Employee> }, { rejectWithValue }) => {
    try {
      const updatedEmp = await updatedEmployee(id, employeeData);
      return updatedEmp;
    } catch (error) {
      return rejectWithValue('Failed to update employee');
    }
  }
);

export const deleteEmployeeAsync = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await deletedEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete employee');
    }
  }
);


interface EmployeesState {
  employees: Employee[];
  selectedEmployee: Employee | null;
}

const initialState: EmployeesState = {
  employees: [] as Employee[],
  selectedEmployee: null,
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEmployeeAsync.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.employees = action.payload.employees;
      })
      .addCase(fetchEmployeeByIdAsync.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        console.log(action.payload)
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload
        }
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
      });
  },
});

export const { addEmployee, updateEmployee, deleteEmployee, setSelectedEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
