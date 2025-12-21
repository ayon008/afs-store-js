"use client";
import { getAuthenticatedUser } from '@/app/actions/WC/Auth/getAuth';
import React from 'react';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const userData = await getAuthenticatedUser();
            setUser(userData);
        } catch (e) {
            console.error('fetchUser error', e);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const refreshUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;