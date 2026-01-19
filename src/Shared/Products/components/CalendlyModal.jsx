import React from 'react';
import { X } from "lucide-react";
import PopUp from '../../PopUp/PopUp'; // Assuming same directory level for PopUp

const CalendlyModal = ({ isOpen, setOpen, containerRef }) => {
    return (
        <PopUp isOpen={isOpen} fn={setOpen}>
            <div onClick={(e) => e.stopPropagation()} className='bg-white max-w-[649px] w-[95%] h-fit overflow-x-hidden  p-5 relative mx-auto rounded-[4px] overflow-hidden'>
                <button onClick={() => setOpen(false)} className='border border-black rounded-full w-fit h-fit p-[5px] absolute top-[10px] right-4 cursor-pointer z-10'>
                    <X className="w-4 h-4" />
                </button>
                <div className='pt-6 h-[80vh]'>
                    <div ref={containerRef} style={{ minWidth: "320px", height: "100%" }}></div>
                </div>
            </div>
        </PopUp>
    );
};

export default CalendlyModal;
