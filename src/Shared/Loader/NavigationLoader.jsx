"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const NavigationLoaderContext = createContext({
    startLoading: () => {},
    stopLoading: () => {},
    isLoading: false
});

export const useNavigationLoader = () => useContext(NavigationLoaderContext);

export const NavigationLoaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return (
        <NavigationLoaderContext.Provider value={{ startLoading, stopLoading, isLoading }}>
            {children}
        </NavigationLoaderContext.Provider>
    );
};


