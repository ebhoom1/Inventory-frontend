import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../../utils/apiConfig';

// --- Check localStorage for existing user session ---
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// ==================== ASYNC THUNKS ==================== //

// 1. Register User - Enhanced with better error handling
export const registerUser = createAsyncThunk(
  'users/register',
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        `${API_URL}/api/auth/register`,
        userData,
        config
      );

      // data -> { message, _id, userId, email, token }
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed';

      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
  }
);

// 2. Login User
export const loginUser = createAsyncThunk(
  'users/login',
  async (userData, { rejectWithValue }) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        userData,
        config
      );

      const cleanedUserInfo = {
        _id: data._id,
        userId: data.userId,
        firstName: data.firstName || '',
        email: data.email,
        userType: data.userType,
        token: data.token,
      };

      localStorage.setItem('userInfo', JSON.stringify(cleanedUserInfo));
      return cleanedUserInfo;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// 3. Get User by ID
export const getUserById = createAsyncThunk(
  'users/getById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { userInfo } = getState().users;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/api/auth/getbyid/${id}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

// 4. Update User
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, updatedData }, { rejectWithValue, getState }) => {
    try {
      const { userInfo } = getState().users;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.put(
        `${API_URL}/api/auth/${id}`,
        updatedData,
        config
      );

      // If the updated user is the currently logged-in user, update localStorage.
      if (id === userInfo?._id && data.user) {
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo'));
        const updatedUserInfo = { ...currentUserInfo, ...data.user };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
      return data; // { message, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

// 5. Get All Users
export const getAllUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { userInfo } = getState().users;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/api/auth/getalluser`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

// 6. Check if Email Exists (optional helper)
export const checkEmailExists = createAsyncThunk(
  'users/checkEmail',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/auth/check-email/${email}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email check failed');
    }
  }
);

// ==================== SLICE DEFINITION ==================== //

const initialState = {
  loading: false,
  userInfo: userInfoFromStorage,
  selectedUser: null,
  allUsers: [],
  error: null,

  // Flags & payloads for flows
  loginSuccess: false,
  registerSuccess: false,
  updateSuccess: false,

  // New: Keep registration response and message so UI can show it
  registerData: null,       // { _id, userId, email, token, message }
  registerMessage: '',

  emailExists: false,
  emailCheckLoading: false,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    reset: (state) => {
      state.loading = false;
      state.error = null;
      state.loginSuccess = false;
      state.registerSuccess = false;
      state.updateSuccess = false;
      state.registerData = null;
      state.registerMessage = '';
      state.emailExists = false;
      state.emailCheckLoading = false;
    },
    logout: (state) => {
      localStorage.removeItem('userInfo');
      state.loading = false;
      state.userInfo = null;
      state.selectedUser = null;
      state.allUsers = [];
      state.error = null;
      state.loginSuccess = false;
      state.registerSuccess = false;
      state.updateSuccess = false;
      state.registerData = null;
      state.registerMessage = '';
      state.emailExists = false;
      state.emailCheckLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
        state.registerData = null;
        state.registerMessage = '';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess = true;
        state.error = null;
        state.registerData = action.payload || null;
        state.registerMessage = action.payload?.message || 'User registered successfully!';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        // Normalize error to a simple, UI-friendly string or object with message
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.payload?.message || 'Registration failed';
        state.registerSuccess = false;
        state.registerData = null;
        state.registerMessage = '';
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.loginSuccess = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginSuccess = false;
      })

      // Get User by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        state.error = null;

        const updatedUser = action.payload.user;
        if (updatedUser) {
          if (state.userInfo?._id === updatedUser._id) {
            state.userInfo = { ...state.userInfo, ...updatedUser };
          }
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Check Email Exists
      .addCase(checkEmailExists.pending, (state) => {
        state.emailCheckLoading = true;
      })
      .addCase(checkEmailExists.fulfilled, (state, action) => {
        state.emailCheckLoading = false;
        state.emailExists = action.payload.exists;
      })
      .addCase(checkEmailExists.rejected, (state, action) => {
        state.emailCheckLoading = false;
        state.error = action.payload;
      });
  },
});

export const { reset, logout, clearError } = userSlice.actions;
export default userSlice.reducer;
