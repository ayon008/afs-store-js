import React from 'react';

const FormButton = ({ label, type = "button", disabled = false, onClick }) => {
    return (
        <button 
            type={type} 
            disabled={disabled}
            onClick={onClick}
            className={`w-full bg-black transition-all duration-200 ease-linear text-white font-semibold text-[clamp(0.75rem,0.715rem+0.1333vw,0.875rem)] leading-[100%] py-3 px-[18px] rounded-[4px] uppercase ${
                disabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'cursor-pointer hover:bg-gray-800'
            }`}
        >
            {label}
        </button>
    );
};

export default FormButton;