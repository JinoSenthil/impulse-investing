'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Check if window is defined (browser side) to hydrate from localStorage
const getInitialState = (): AuthState => {
    if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('impulse_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                return {
                    ...initialState,
                    user,
                    isAuthenticated: true,
                };
            } catch {
                localStorage.removeItem('impulse_user');
            }
        }
    }
    return initialState;
};

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.error = null;
            state.loading = false;

            if (typeof window !== 'undefined') {
                if (action.payload) {
                    localStorage.setItem('impulse_user', JSON.stringify(action.payload));
                } else {
                    localStorage.removeItem('impulse_user');
                }
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.loading = false;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('impulse_user');
            }
        },
    },
});

export const { setLoading, setError, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
