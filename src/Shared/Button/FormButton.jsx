import React from 'react';

const FormButton = ({ label, type = "button" }) => {
    return (
        <button type={type} className='bg-black transition-colors duration-200 ease-linear text-white font-semibold text-[clamp(0.75rem,0.715rem+0.1333vw,0.875rem)] leading-[100%] py-3 cursor-pointer px-[18px] rounded-[4px] uppercase'>
            {label}
        </button>
    );
};

export default FormButton;