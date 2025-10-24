import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the backend URL
const BACKEND_URL = 'http://localhost:3000/user';

// --- Async Thunks ---

// Handles registration call
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/register`, userData, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            // Ensure we return a serializable string error message
            const errorMessage = error.response?.data || error.message || 'Registration failed due to network error.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Handles the login call (New Thunk Added)
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/login`, userData, {
                withCredentials: true,
            });
            // Assuming the server returns user data upon successful login
            return response.data; 
        } catch (error) {
            // 🚨 FIX: Extracting serializable error message for login failures
            const errorMessage = error.response?.data || error.message || 'Login failed due to network error.';
            return rejectWithValue(errorMessage);
        }
    }
);

// Handles the logout call (New Thunk Added)
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            // Make the API call to clear the server-side cookie
            await axios.post(`${BACKEND_URL}/logout`, {}, {
                withCredentials: true,
            });
            // Dispatch the local Redux action to clear state immediately after server success
            dispatch(logout()); 
            return;
        } catch (error) {
            // Log the error but still proceed with local logout to ensure UI updates
            console.error('Server-side logout failed:', error);
            dispatch(logout()); // Ensure local state clears even if server fails
            return rejectWithValue('Logout failed on the server, but logged out locally.');
        }
    }
);


// Handles the checkAuth call on app load
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/check`, {
                withCredentials: true,
            });
            // Assuming the check endpoint returns user data if successful
            return response.data.user; 
        } catch (error) {
            // If check fails (401), we treat it as not authenticated and return null
            return rejectWithValue(null);
        }
    }
);

// --- Auth Slice ---
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, 
        isAuthenticated: false,
        // loading: true, 
        loading:false,
        error: null,
    },
    reducers: {
        // This is the synchronous Redux action to clear local state
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null; // Clear any existing errors on logout
            state.loading = false; // Ensure loading is false after logout
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // 💡 FIX: Ensure we use action.payload.user, matching the login success payload structure.
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user; 
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
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
                state.error = action.payload || 'Login failed.';
            })

            // Handle Logout (The thunk we just created)
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                state.loading = false;
                // Note: state is cleared by the dispatch(logout()) inside the thunk
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred during logout.';
                // Note: state is cleared by the dispatch(logout()) inside the thunk
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
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
