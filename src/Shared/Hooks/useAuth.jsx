"use client";

import { useContext } from "react";
import { AuthContext } from "../Provider/AuthProvider";

const useAuth = () => {
    const context = useContext(AuthContext);

    // Check if we're inside the provider by checking the _isInsideProvider flag
    if (!context || context._isInsideProvider === false) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, refreshUser } = context;

    return { user, setUser, loading, refreshUser };
};

export default useAuth;
