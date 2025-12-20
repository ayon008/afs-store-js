"use client";

import { useContext } from "react";
import { AuthContext } from "../Provider/AuthProvider";

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { user, setUser, loading, refreshUser } = context;

    return { user, setUser, loading, refreshUser };
};

export default useAuth;
