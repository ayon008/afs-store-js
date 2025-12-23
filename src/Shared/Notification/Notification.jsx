"use client";
import React, { useEffect } from 'react';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0 && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
            default:
                return <Info className="w-5 h-5 flex-shrink-0" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-[#2A7029]';
            case 'error':
                return 'bg-[#8b0000]';
            default:
                return 'bg-[#1D98FF]';
        }
    };

    if (!message) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 z-[9999] ${getBgColor()} text-white p-4 shadow-lg transition-all duration-300 ease-out transform translate-y-0`}>
            <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {getIcon()}
                    <p className="text-base font-semibold">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
                        aria-label="Close notification"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Notification;

