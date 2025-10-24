import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🚀 FIX 1: Use environment variable, falling back to localhost:3000
// 🚀 FIX 2: Removed '/user' from the base URL so thunks can append '/user/register'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// --- Initial State ---
const initialState = {
    user: null, 
    isAuthenticated: false,
    loading: false,
    error: null,
};

// --- Async Thunks ---

// Handles registration call
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            // FIX: Endpoint is now correct: BASE_URL/user/register
            const response = await axios.post(`${BACKEND_URL}/user/register`, userData, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed due to network error.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Handles the login call
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            // FIX: Endpoint is now correct: BASE_URL/user/login
            const response = await axios.post(`${BACKEND_URL}/user/login`, userData, {
                withCredentials: true,
            });
            return response.data; 
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed due to network error.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Handles the logout call
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            // FIX: Endpoint is now correct: BASE_URL/user/logout
            await axios.post(`${BACKEND_URL}/user/logout`, {}, {
                withCredentials: true,
            });
            // The local Redux state will be cleared in the .fulfilled case
            return;
        } catch (error) {
            // Even if the server-side call fails, we proceed to clear local state for UX
            console.error('Server-side logout failed:', error);
            // Returning success will trigger .fulfilled, clearing the local state
            return;
        }
    }
);


// Handles the checkAuth call on app load
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            // FIX: Endpoint is now correct: BASE_URL/user/check
            const response = await axios.get(`${BACKEND_URL}/user/check`, {
                withCredentials: true,
            });
            return response.data.user; 
        } catch (error) {
            return rejectWithValue(null);
        }
    }
);

// --- Auth Slice ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // This is the synchronous Redux action to clear local state
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user; 
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload || 'Registration failed.';
            })

            // Handle Login 
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload || 'Login failed.';
            })

            // Handle Logout 
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                // Clear state after successful thunk (server cookie clear is attempted)
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                // We still clear the local state for better UX, regardless of server error
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload;
            })
            
            // Handle Check Auth on initial load
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload; 
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

// Export the synchronous action
export const { logout } = authSlice.actions; 
export default authSlice.reducer;